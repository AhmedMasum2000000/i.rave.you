import { CURRENT, TRACKLIST } from './data';
import { asset } from './paths';

/**
 * How the set reaches the player. Where Media Source Extensions exist (every
 * desktop browser, Android, iOS 17.1+), it streams like a music platform: the
 * file's fragment index (sidx) says where every ~2 s piece lives, and the
 * loader fetches exactly the pieces needed, nearest first, several pieces per
 * request. A jump fetches from the piece it lands in, and the opening of every
 * track is fetched ahead of time, so tracklist jumps start at once. Elsewhere
 * the browser streams the file itself.
 */
export interface Stream {
  /** True when this loader controls the download (MSE). */
  mse: boolean;
  /** Start downloading beyond the opening (after the first play attempt). */
  activate(): void;
  /** Whether the audio at `sec` is already in the player. */
  ready(sec: number): boolean;
  /**
   * Fetch the audio at `sec` before anything else. Resolves true once it is in
   * the player, or false when a newer request replaced this one.
   */
  ensure(sec: number): Promise<boolean>;
  /** Stop downloading and detach every listener (another set is taking over). */
  destroy(): void;
}

interface Frag { o: number; n: number; t: number; d: number }
/** One range request: pieces `from`..`to`, written to the player as it lands. */
interface Job { ctl: AbortController; from: number; to: number; at: number; stalled: boolean }

const NEED = 1; // seconds that must be in the player before a jump lands there
const RUN = 10; // seconds fetched per request
const PRE = 10; // seconds fetched before the visitor asks for sound
const SAFE = 20; // seconds secured ahead before anything else is fetched
const OPENING = 4; // seconds of each track's opening fetched ahead of time
const AHEAD = 60; // seconds kept downloaded in front of the playhead
const BEHIND = 30; // seconds kept behind it when space runs short
const MAX_BYTES = 10.5e6; // stay under the browser's audio buffer quota (~12 MB)
const HEAD = 262143; // first request: header, index and the opening seconds
const STALL = 6000; // ms without a byte before a request is retried
const MIME = 'audio/mp4; codecs="mp4a.40.2"';

type MSCtor = typeof MediaSource;
const MS: MSCtor | undefined = (window as unknown as { ManagedMediaSource?: MSCtor }).ManagedMediaSource ?? window.MediaSource;

export function attachStream(el: HTMLAudioElement, startAt: number): Stream {
  const url = asset(CURRENT.file);
  if (!MS || !MS.isTypeSupported(MIME)) return nativeStream(el, url, startAt);

  let frags: Frag[] = [];
  let sb: SourceBuffer | null = null;
  let active = false;
  let busy = false;
  /** A spot wanted now (a jump or a seek), fetched before anything else. */
  let target: number | null = null;
  let waiter: { sec: number; done: (ok: boolean) => void } | null = null;
  let fellBack = false;
  /** Set when another set takes over: nothing may fetch, append or listen after that. */
  let dead = false;
  const life = new AbortController();
  let job: Job | null = null;
  /**
   * File offset just past the last byte handed to the player. Inside a piece,
   * the player's parser waits for exactly the bytes from here on; any other
   * data needs a parser reset first.
   */
  let tail = 0;
  let lastByte = 0;
  let wake: (() => void) | null = null;
  const ms = new MS();
  // iOS's ManagedMediaSource only streams to elements that can't be cast.
  (el as HTMLAudioElement & { disableRemotePlayback: boolean }).disableRemotePlayback = true;
  el.src = URL.createObjectURL(ms);

  const append = (data: Uint8Array): Promise<void> =>
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
      try {
        buf.appendBuffer(data as Uint8Array<ArrayBuffer>);
      } catch (e) {
        buf.removeEventListener('updateend', done);
        buf.removeEventListener('error', fail);
        reject(e);
      }
    });

  const remove = (from: number, to: number): Promise<void> =>
    new Promise((resolve) => {
      if (!sb || to <= from) return resolve();
      sb.addEventListener('updateend', () => resolve(), { once: true });
      try {
        sb.remove(from, to);
      } catch {
        resolve();
      }
    });

  /** The piece playing at `sec`. */
  const indexAt = (sec: number): number => {
    let lo = 0;
    let hi = frags.length - 1;
    while (lo < hi) {
      const mid = (lo + hi + 1) >> 1;
      if (frags[mid].t <= sec + 0.01) lo = mid;
      else hi = mid - 1;
    }
    return lo;
  };

  /** The piece holding file byte `at`. */
  const pieceAt = (at: number): number => {
    let lo = 0;
    let hi = frags.length - 1;
    while (lo < hi) {
      const mid = (lo + hi + 1) >> 1;
      if (frags[mid].o <= at) lo = mid;
      else hi = mid - 1;
    }
    return lo;
  };

  /** Whether the parser is halfway through a piece. */
  const midPiece = (): boolean => {
    if (!frags.length || tail <= frags[0].o) return false;
    const f = frags[pieceAt(tail)];
    return tail > f.o && tail < f.o + f.n;
  };

  const end = (): number => ms.duration || frags.reduce((s, f) => s + f.d, 0) || 1e9;

  /** Whether everything from `from` to `to` (seconds) is in the player. */
  const spans = (from: number, to: number): boolean => {
    if (!sb) return false;
    const b = sb.buffered;
    const until = Math.min(to, end() - 0.05);
    for (let k = 0; k < b.length; k++) if (b.start(k) <= from + 0.05 && b.end(k) >= until) return true;
    return false;
  };

  /** Whether all of piece `i` is in the player (a cancelled download can leave part of one). */
  const has = (i: number): boolean => spans(frags[i].t + 0.05, frags[i].t + frags[i].d - 0.05);

  /** Whether playback can start at `sec`. */
  const covered = (sec: number): boolean => spans(sec, sec + NEED);

  /** The first piece missing between two times, or -1. */
  const missing = (from: number, to: number): number => {
    for (let i = indexAt(from); i < frags.length && frags[i].t < to; i++) if (!has(i)) return i;
    return -1;
  };

  /** Missing pieces from `i` on, until `until` seconds: one request. */
  const run = (i: number, until: number): [number, number] => {
    let j = i;
    while (j + 1 < frags.length && !has(j + 1) && frags[j + 1].t < until) j++;
    return [i, j];
  };

  /** Pieces holding track openings, which are kept when space runs short. */
  let openings: Set<number> | null = null;
  const keep = (): Set<number> => {
    if (!openings) {
      openings = new Set();
      for (const t of TRACKLIST) for (let i = indexAt(t.at); i < frags.length && frags[i].t < t.at + OPENING; i++) openings.add(i);
    }
    return openings;
  };

  /** Whether everything from the playhead to the end of the set is in the player. */
  const finalStretch = (): boolean => el.currentTime > end() - AHEAD && spans(el.currentTime, end());

  const next = (): [number, number] | null => {
    if (!frags.length) return null;
    if (target !== null) {
      const i = missing(target, target + NEED);
      if (i >= 0) return run(i, target + RUN);
    }
    const now = el.currentTime;
    const soon = missing(now, now + (active ? SAFE : PRE));
    if (soon >= 0) return run(soon, frags[soon].t + RUN);
    if (!active) return null;
    // The final stretch is all here: have the start ready for the loop, then
    // nothing more, so the stream can be ended (any later append reopens it
    // and the player would wait at the end instead of looping).
    if (finalStretch()) {
      const wrap = missing(0, PRE);
      return wrap >= 0 ? run(wrap, PRE) : null;
    }
    // Every track's opening, the coming tracks first, so tracklist jumps land at once.
    const from = TRACKLIST.findIndex((t) => t.at > now);
    for (let k = 0; k < TRACKLIST.length; k++) {
      const at = TRACKLIST[((from < 0 ? 0 : from) + k) % TRACKLIST.length].at;
      const i = missing(at, at + OPENING);
      if (i >= 0) return run(i, at + OPENING);
    }
    const later = missing(now, now + AHEAD);
    if (later >= 0) return run(later, frags[later].t + RUN);
    return null;
  };

  const settle = (): void => {
    if (target !== null && covered(target)) target = null;
    if (waiter && covered(waiter.sec)) {
      const w = waiter;
      waiter = null;
      w.done(true);
    }
  };

  const heldBytes = (): number => frags.reduce((sum, f, i) => (has(i) ? sum + f.n : sum), 0);

  /**
   * Free space: first what is well behind the playhead, then what is far
   * ahead. Track openings are kept, or they'd be fetched again.
   */
  const makeRoom = async (need: number): Promise<void> => {
    let excess = heldBytes() + need - MAX_BYTES;
    if (excess <= 0) return;
    const kept = keep();
    const now = el.currentTime;
    const wanted = target ?? now;
    const near = (i: number): boolean => frags[i].t + frags[i].d >= wanted - 2 && frags[i].t <= wanted + SAFE;
    const behind = frags.map((_, i) => i).filter((i) => frags[i].t + frags[i].d < now - BEHIND);
    const ahead = frags.map((_, i) => i).filter((i) => frags[i].t > now + AHEAD).reverse();
    const drop: number[] = [];
    for (const i of [...behind, ...ahead]) {
      if (excess <= 0) break;
      if (kept.has(i) || near(i) || !has(i)) continue;
      drop.push(i);
      excess -= frags[i].n;
    }
    drop.sort((a, b) => a - b);
    for (let k = 0; k < drop.length;) {
      let j = k;
      while (j + 1 < drop.length && drop[j + 1] === drop[j] + 1) j++;
      await remove(frags[drop[k]].t, frags[drop[j]].t + frags[drop[j]].d);
      k = j + 1;
    }
  };

  /** Forget a half-read piece so the next data parses from a clean start. */
  const reset = (): void => {
    try {
      if (sb && !sb.updating && ms.readyState === 'open') sb.abort();
    } catch {
      /* nothing pending */
    }
    tail = 0;
  };

  /** At the very end, say so, or the player waits there instead of looping. */
  const finish = (): void => {
    if (!sb || sb.updating || ms.readyState !== 'open' || midPiece() || !finalStretch()) return;
    try {
      ms.endOfStream();
    } catch {
      /* busy; the next pump retries */
    }
  };

  /** Hand the bytes of a range response to the player as they land. */
  const feed = async (res: Response, from: number, j: Job, skip = 0): Promise<void> => {
    const reader = res.body!.getReader();
    const abort = (): void => void reader.cancel().catch(() => {});
    j.ctl.signal.addEventListener('abort', abort);
    let parts: Uint8Array[] = [];
    let size = 0;
    let at = from;
    const flush = async (): Promise<void> => {
      if (!size) return;
      const chunk = new Uint8Array(size);
      let w = 0;
      for (const p of parts) {
        chunk.set(p, w);
        w += p.length;
      }
      parts = [];
      size = 0;
      try {
        await append(chunk);
      } catch {
        // Over quota: drop what is far behind and try once more.
        await remove(0, Math.max(0, el.currentTime - 10));
        await append(chunk);
      }
      at += chunk.length;
      tail = at;
      j.at = at;
      settle();
    };
    try {
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        lastByte = performance.now();
        let v = value;
        if (skip > 0) {
          const cut = Math.min(skip, v.length);
          skip -= cut;
          v = v.subarray(cut);
          if (!v.length) continue;
        }
        parts.push(v);
        size += v.length;
        if (size >= 4096) await flush();
        if (j.ctl.signal.aborted) break;
      }
    } finally {
      j.ctl.signal.removeEventListener('abort', abort);
      // Whatever arrived is valid continuous data: keep it.
      await flush();
    }
    if (j.ctl.signal.aborted) throw new Error('aborted');
  };

  const pump = async (): Promise<void> => {
    if (dead || busy || !sb) return;
    const r = next();
    if (!r) {
      finish();
      return;
    }
    busy = true;
    const [from, to] = r;
    const j: Job = { ctl: new AbortController(), from, to, at: frags[from].o, stalled: false };
    job = j;
    try {
      const last = frags[to].o + frags[to].n - 1;
      if (heldBytes() + (last - frags[from].o) > MAX_BYTES) await makeRoom(last - frags[from].o);
      let start = frags[from].o;
      // An interrupted request stopped inside this very piece: carry on from there.
      if (midPiece() && pieceAt(tail) === from) start = tail;
      else if (midPiece()) reset();
      j.at = start;
      lastByte = performance.now();
      const res = await fetch(url, { headers: { Range: `bytes=${start}-${last}` }, signal: j.ctl.signal });
      if (res.status !== 206 || !res.body) throw new Error(`mix ${res.status}`);
      await feed(res, start, j);
    } catch {
      // A failed request (not one cancelled for a jump): wait a moment first.
      if (!j.ctl.signal.aborted || j.stalled) {
        await new Promise<void>((resolve) => {
          wake = resolve;
          setTimeout(resolve, j.stalled ? 300 : 1500);
        });
        wake = null;
      }
    } finally {
      job = null;
      busy = false;
      settle();
    }
    void pump();
  };

  /** Fetch the audio at `sec` first, cancelling a download that won't reach it soon. */
  const hurry = (sec: number): void => {
    if (dead) return;
    target = sec;
    settle();
    if (target === null) return;
    if (job && frags.length) {
      const want = indexAt(sec);
      const at = pieceAt(job.at);
      // Keep a request that is about to deliver this spot anyway.
      if (want < job.from || want > job.to || want > at + 1) job.ctl.abort();
    }
    void pump();
  };

  // A request that stops delivering (a dropped connection) is retried from where it stopped.
  const stallTimer = setInterval(() => {
    if (job && performance.now() - lastByte > STALL) {
      job.stalled = true;
      job.ctl.abort();
    }
  }, 1000);
  window.addEventListener('online', () => {
    if (job) {
      job.stalled = true;
      job.ctl.abort();
    }
    wake?.();
    void pump();
  }, { signal: life.signal });

  /** Read the header and index, then keep feeding the same response as the opening audio. */
  const open = async (): Promise<void> => {
    const ctl = new AbortController();
    const res = await fetch(url, { headers: { Range: `bytes=0-${HEAD}` }, signal: ctl.signal });
    if (res.status !== 206 || !res.body) throw new Error(`mix ${res.status}`);
    const reader = res.body.getReader();
    let head = new Uint8Array(0);
    let sidx = -1;
    let sidxEnd = 0;
    // Read until the index has fully arrived.
    for (;;) {
      if (sidx < 0) {
        const view = new DataView(head.buffer);
        for (let at = 0; at + 8 <= head.length;) {
          const size = view.getUint32(at);
          if (String.fromCharCode(...head.subarray(at + 4, at + 8)) === 'sidx') {
            sidx = at;
            sidxEnd = at + size;
            break;
          }
          if (size < 8) throw new Error('mix header');
          at += size;
        }
      }
      if (sidx >= 0 && head.length >= sidxEnd) break;
      const { done, value } = await reader.read();
      if (done) throw new Error('mix header');
      const grown = new Uint8Array(head.length + value.length);
      grown.set(head);
      grown.set(value, head.length);
      head = grown;
    }
    const view = new DataView(head.buffer);
    const scale = view.getUint32(sidx + 16);
    let t = view.getUint32(sidx + 20);
    let o = sidxEnd + view.getUint32(sidx + 24);
    const count = view.getUint16(sidx + 30);
    const list: Frag[] = [];
    for (let k = 0; k < count; k++) {
      const e = sidx + 32 + k * 12;
      const n = view.getUint32(e) & 0x7fffffff;
      const d = view.getUint32(e + 4);
      list.push({ o, n, t: t / scale, d: d / scale });
      o += n;
      t += d;
    }
    frags = list;
    sb = ms.addSourceBuffer(MIME);
    sb.mode = 'segments';
    await append(head.subarray(0, sidx));
    ms.duration = t / scale;
    if (startAt > 0) el.currentTime = Math.min(startAt, ms.duration - 0.5);
    if (dead) return;
    el.addEventListener('seeking', () => {
      if (!covered(el.currentTime)) hurry(el.currentTime);
    }, { signal: life.signal });
    el.addEventListener('timeupdate', () => void pump(), { signal: life.signal });

    // Starting at the top: the rest of this response is the opening audio.
    const first = frags[0].o;
    const wanted = target ?? el.currentTime;
    if (indexAt(wanted) === 0 || frags[indexAt(wanted)].o <= HEAD) {
      busy = true;
      const j: Job = { ctl, from: 0, to: pieceAt(HEAD), at: head.length, stalled: false };
      job = j;
      tail = sidxEnd;
      const rest = head.subarray(Math.min(first, head.length));
      try {
        if (head.length > first) {
          await append(rest);
          tail = head.length;
        }
        const tailRes = new Response(new ReadableStream({
          async pull(c) {
            const { done, value } = await reader.read();
            if (done) c.close();
            else c.enqueue(value);
          },
          cancel() {
            void reader.cancel();
          },
        }));
        await feed(tailRes, Math.max(first, head.length), j, Math.max(0, first - head.length));
      } catch {
        /* the loader picks up from wherever this stopped */
      } finally {
        job = null;
        busy = false;
        settle();
      }
    } else {
      void reader.cancel().catch(() => {});
    }
    void pump();
  };

  ms.addEventListener('sourceopen', () => {
    open().catch(() => {
      if (dead) return;
      // Index unreadable: let the browser stream the file instead, and from now
      // on report plain playback so seeks take the native path.
      if (!sb) {
        fellBack = true;
        nativeStream(el, url, startAt);
        waiter?.done(true);
        waiter = null;
      } else void pump();
    });
  }, { once: true });

  return {
    get mse() {
      return !fellBack;
    },
    activate() {
      if (fellBack) return;
      active = true;
      void pump();
    },
    ready: (sec) => fellBack || covered(sec),
    ensure(sec) {
      if (fellBack || dead) return Promise.resolve(!dead);
      if (waiter) {
        waiter.done(false);
        waiter = null;
      }
      if (covered(sec)) return Promise.resolve(true);
      return new Promise<boolean>((done) => {
        waiter = { sec, done };
        hurry(sec);
      });
    },
    destroy() {
      dead = true;
      life.abort();
      clearInterval(stallTimer);
      job?.ctl.abort();
      waiter?.done(false);
      waiter = null;
      wake?.();
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
  return { mse: false, activate() {}, ready: () => true, ensure: () => Promise.resolve(true), destroy() {} };
}
