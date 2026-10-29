import { TRACKLIST } from './data';
import { asset } from './paths';

/**
 * How the set reaches the player. Where Media Source Extensions exist (every
 * desktop browser, Android, iOS 17.1+), it streams like a music platform: the
 * file's fragment index (sidx) says where every ~10 s piece lives, and the
 * loader fetches exactly the pieces needed, nearest first. A jump fetches the
 * one piece it lands in, and the opening of every track is fetched ahead of
 * time, so tracklist jumps start at once. Elsewhere the browser streams the
 * file itself.
 */
export interface Stream {
  /** True when this loader controls the download (MSE). */
  mse: boolean;
  /** Start downloading beyond the opening (after the first play attempt). */
  activate(): void;
  /** Resolves once the audio at `sec` is in the player. */
  ensure(sec: number): Promise<void>;
}

interface Frag { o: number; n: number; t: number; d: number }

const AHEAD = 60; // seconds kept downloaded in front of the playhead
const SAFE = 20; // seconds secured ahead before anything else is fetched
const BEHIND = 30; // seconds kept behind it when space runs short
const MAX_BYTES = 10.5e6; // stay under the browser's audio buffer quota (~12 MB)
const MIME = 'audio/mp4; codecs="mp4a.40.2"';

type MSCtor = typeof MediaSource;
const MS: MSCtor | undefined = (window as unknown as { ManagedMediaSource?: MSCtor }).ManagedMediaSource ?? window.MediaSource;

export function attachStream(el: HTMLAudioElement, startAt: number): Stream {
  const url = asset(__MIX_FILE__);
  if (!MS || !MS.isTypeSupported(MIME)) return nativeStream(el, url, startAt);

  let frags: Frag[] = [];
  let sb: SourceBuffer | null = null;
  let active = false;
  let busy = false;
  let urgent = -1;
  /** The download in flight, and whether it serves a jump. */
  let inflight: { ctl: AbortController; i: number } | null = null;
  const waiters: { sec: number; done: () => void }[] = [];
  const ms = new MS();
  // iOS's ManagedMediaSource only streams to elements that can't be cast.
  (el as HTMLAudioElement & { disableRemotePlayback: boolean }).disableRemotePlayback = true;
  el.src = URL.createObjectURL(ms);

  const range = (from: number, to: number, signal?: AbortSignal): Promise<ArrayBuffer> =>
    fetch(url, { headers: { Range: `bytes=${from}-${to}` }, signal }).then((r) => {
      if (!r.ok) throw new Error(`mix ${r.status}`);
      return r.arrayBuffer();
    });

  const append = (data: ArrayBuffer): Promise<void> =>
    new Promise((resolve, reject) => {
      const buf = sb!;
      const done = (): void => {
        buf.removeEventListener('updateend', done);
        buf.removeEventListener('error', fail);
        resolve();
      };
      const fail = (): void => {
        buf.removeEventListener('updateend', done);
        buf.removeEventListener('error', fail);
        reject(new Error('append'));
      };
      buf.addEventListener('updateend', done);
      buf.addEventListener('error', fail);
      buf.appendBuffer(data);
    });

  const remove = (from: number, to: number): Promise<void> =>
    new Promise((resolve) => {
      if (!sb || to <= from) return resolve();
      sb.addEventListener('updateend', () => resolve(), { once: true });
      sb.remove(from, to);
    });

  const indexAt = (sec: number): number => {
    let i = 0;
    for (let k = 0; k < frags.length; k++) if (frags[k].t <= sec + 0.01) i = k;
    return i;
  };

  /** Whether all of fragment `i` is in the player (a cancelled download can leave part of one). */
  const has = (i: number): boolean => {
    if (!sb) return false;
    const from = frags[i].t + 0.1;
    const to = frags[i].t + frags[i].d - 0.1;
    const b = sb.buffered;
    for (let k = 0; k < b.length; k++) if (b.start(k) <= from && b.end(k) >= to) return true;
    return false;
  };

  /** Whether playback can start at `sec`: a couple of seconds there are in the player. */
  const covered = (sec: number): boolean => {
    if (!sb) return false;
    const b = sb.buffered;
    const end = Math.min(sec + 2, (ms.duration || 1e9) - 0.1);
    for (let k = 0; k < b.length; k++) if (b.start(k) <= sec + 0.05 && b.end(k) >= end) return true;
    return false;
  };

  const heldBytes = (): number => frags.reduce((sum, f, i) => (has(i) ? sum + f.n : sum), 0);

  /** Track openings, so a tracklist jump finds its audio already here. */
  const starts = (): number[] => [...new Set(TRACKLIST.flatMap((t) => {
    const i = indexAt(t.at);
    // A track that opens near the end of a piece needs the following piece too.
    return i + 1 < frags.length && frags[i].t + frags[i].d - t.at < 4 ? [i, i + 1] : [i];
  }))];

  const next = (): number => {
    if (urgent >= 0 && !has(urgent)) return urgent;
    urgent = -1;
    const now = indexAt(el.currentTime);
    if (!has(now)) return now;
    if (!active) return -1;
    // 20 s of safety ahead, then every track's opening, then the rest of the minute ahead.
    const gap = (until: number): number => {
      for (let i = now + 1; i < frags.length && frags[i].t < el.currentTime + until; i++) if (!has(i)) return i;
      return -1;
    };
    const soon = gap(SAFE);
    if (soon >= 0) return soon;
    for (const i of starts()) if (!has(i)) return i;
    return gap(AHEAD);
  };

  /** Fetch piece `i` next, cancelling a background download in the way. */
  const hurry = (i: number): void => {
    if (has(i)) return;
    urgent = i;
    if (inflight && inflight.i !== i) inflight.ctl.abort();
    void pump();
  };

  const settle = (): void => {
    for (let k = waiters.length - 1; k >= 0; k--) {
      if (covered(waiters[k].sec)) {
        waiters[k].done();
        waiters.splice(k, 1);
      }
    }
  };

  /**
   * Free space piece by piece: first what is well behind the playhead, then
   * what is far ahead. Track openings are kept, or they'd be fetched again.
   */
  const makeRoom = async (need: number): Promise<void> => {
    const keep = new Set(starts());
    const now = el.currentTime;
    const behind = frags.map((_, i) => i).filter((i) => frags[i].t + frags[i].d < now - BEHIND);
    const ahead = frags.map((_, i) => i).filter((i) => frags[i].t > now + AHEAD).reverse();
    for (const i of [...behind, ...ahead]) {
      if (heldBytes() + need <= MAX_BYTES) return;
      if (keep.has(i) || !has(i)) continue;
      await remove(frags[i].t, frags[i].t + frags[i].d);
    }
  };

  const pump = async (): Promise<void> => {
    if (busy || !sb) return;
    const i = next();
    if (i < 0) return;
    busy = true;
    const ctl = new AbortController();
    inflight = { ctl, i };
    try {
      const f = frags[i];
      if (heldBytes() + f.n > MAX_BYTES) await makeRoom(f.n);
      const res = await fetch(url, { headers: { Range: `bytes=${f.o}-${f.o + f.n - 1}` }, signal: ctl.signal });
      if (!res.ok || !res.body) throw new Error(`mix ${res.status}`);
      // Hand the player each chunk as it lands, so sound starts before the piece finishes.
      const reader = res.body.getReader();
      let parts: Uint8Array[] = [];
      let size = 0;
      const flush = async (): Promise<void> => {
        if (!size) return;
        const chunk = new Uint8Array(size);
        let at = 0;
        for (const p of parts) {
          chunk.set(p, at);
          at += p.length;
        }
        parts = [];
        size = 0;
        try {
          await append(chunk.buffer);
        } catch {
          await remove(0, Math.max(0, el.currentTime - 5));
          await append(chunk.buffer);
        }
        settle();
      };
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        parts.push(value);
        size += value.length;
        if (size >= 24576) await flush();
      }
      await flush();
      if (i === frags.length - 1 && ms.readyState === 'open' && !sb.updating) {
        try {
          ms.endOfStream();
        } catch {
          /* still updating; the next pump retries */
        }
      }
    } catch {
      // Drop the half-read piece so the next one parses cleanly.
      try {
        sb.abort();
      } catch {
        /* nothing pending */
      }
      // Cancelled for a jump: go straight on. A failed request: wait a moment first.
      if (!ctl.signal.aborted) await new Promise((r) => setTimeout(r, 1500));
    } finally {
      inflight = null;
      busy = false;
      settle();
    }
    void pump();
  };

  ms.addEventListener('sourceopen', async () => {
    try {
      const head = await range(0, 65535);
      const view = new DataView(head);
      // Walk the top-level boxes to the fragment index.
      let at = 0;
      while (at + 8 <= view.byteLength && String.fromCharCode(...new Uint8Array(head, at + 4, 4)) !== 'sidx') at += view.getUint32(at);
      const scale = view.getUint32(at + 16);
      let t = view.getUint32(at + 20);
      let o = at + view.getUint32(at) + view.getUint32(at + 24);
      const count = view.getUint16(at + 30);
      frags = [];
      for (let k = 0; k < count; k++) {
        const e = at + 32 + k * 12;
        const n = view.getUint32(e) & 0x7fffffff;
        const d = view.getUint32(e + 4);
        frags.push({ o, n, t: t / scale, d: d / scale });
        o += n;
        t += d;
      }
      sb = ms.addSourceBuffer(MIME);
      sb.mode = 'segments';
      await append(head.slice(0, at));
      ms.duration = t / scale;
      if (startAt > 0) el.currentTime = Math.min(startAt, ms.duration - 0.5);
      el.addEventListener('seeking', () => hurry(indexAt(el.currentTime)));
      el.addEventListener('timeupdate', () => void pump());
      void pump();
    } catch {
      // Index unreadable: let the browser stream the file instead.
      nativeStream(el, url, startAt);
    }
  }, { once: true });

  return {
    mse: true,
    activate() {
      active = true;
      void pump();
    },
    ensure(sec) {
      if (!frags.length) return new Promise((r) => setTimeout(r, 300)).then(() => this.ensure(sec));
      if (covered(sec)) return Promise.resolve();
      hurry(indexAt(sec));
      return new Promise((done) => waiters.push({ sec, done }));
    },
  };
}

/** Plain progressive playback: the browser buffers ahead and seeks with byte ranges. */
function nativeStream(el: HTMLAudioElement, url: string, startAt: number): Stream {
  el.src = url;
  if (startAt > 0) {
    el.addEventListener('loadedmetadata', () => {
      // Preserve any newer track selection made while metadata was loading.
      if (el.currentTime === 0) el.currentTime = Math.min(startAt, el.duration - 0.5);
    }, { once: true });
  }
  el.load();
  return { mse: false, activate() {}, ensure: () => Promise.resolve() };
}
