import { asset } from './paths';
import { K1, K2 } from './stream-key';

/**
 * Plays the set from AES-GCM-encrypted 10-second fragments instead of a plain
 * audio file, so there is no downloadable .m4a on the site.
 *
 * With Media Source Extensions (every desktop browser; iOS 17.1+ through
 * ManagedMediaSource) only the fragments around the playhead are fetched,
 * decrypted in memory and appended; seeking jumps straight to the right one.
 * Without MSE, the whole set is decrypted into an in-memory blob first.
 */

interface Manifest {
  /** MIME type with codec, e.g. audio/mp4; codecs="mp4a.40.2". */
  c: string;
  /** Total duration in seconds. */
  t: number;
  /** Start time of each fragment, in seconds. */
  s: number[];
}

const DIR = 'audio/x/';
const AHEAD = 45; // seconds buffered in front of the playhead
const BEHIND = 30; // seconds kept behind it

let keyPromise: Promise<CryptoKey> | null = null;
const key = (): Promise<CryptoKey> => {
  keyPromise ??= (() => {
    const a = K1.match(/../g)!.map((h) => parseInt(h, 16));
    const b = K2.match(/../g)!.map((h) => parseInt(h, 16));
    const raw = new Uint8Array(a.map((x, i) => x ^ b[i]));
    return crypto.subtle.importKey('raw', raw, 'AES-GCM', false, ['decrypt']);
  })();
  return keyPromise;
};

async function load(name: string, signal?: AbortSignal): Promise<ArrayBuffer> {
  const res = await fetch(asset(DIR + name), { signal });
  if (!res.ok) throw new Error(`segment ${name}: ${res.status}`);
  const buf = new Uint8Array(await res.arrayBuffer());
  return crypto.subtle.decrypt({ name: 'AES-GCM', iv: buf.subarray(0, 12) }, await key(), buf.subarray(12));
}

type MSCtor = typeof MediaSource;

function mediaSourceCtor(type: string): MSCtor | null {
  const w = window as unknown as { ManagedMediaSource?: MSCtor; MediaSource?: MSCtor };
  for (const C of [w.MediaSource, w.ManagedMediaSource]) {
    if (C && C.isTypeSupported(type)) return C;
  }
  return null;
}

const TYPE = 'audio/mp4; codecs="mp4a.40.2"';

/**
 * Wires the encrypted stream into `el`. The source is attached synchronously,
 * so a `play()` in the same click handler still counts as user-initiated
 * (Safari insists); fetching and decrypting carry on in the background.
 */
export function attachStream(el: HTMLAudioElement, startAt: number): void {
  const MS = mediaSourceCtor(TYPE);
  if (!MS) {
    void attachBlob(el, startAt);
    return;
  }
  const ms = new MS();
  // Required for ManagedMediaSource on iOS; harmless elsewhere.
  el.disableRemotePlayback = true;
  el.src = URL.createObjectURL(ms);
  ms.addEventListener('sourceopen', () => void run(el, ms, startAt), { once: true });
}

async function run(el: HTMLAudioElement, ms: MediaSource, startAt: number): Promise<void> {
  const manifest: Manifest = await (await fetch(asset(DIR + 'm.json'))).json();

  const sb = ms.addSourceBuffer(manifest.c);
  sb.mode = 'segments';
  const done = (): Promise<void> =>
    sb.updating ? new Promise((r) => sb.addEventListener('updateend', () => r(), { once: true })) : Promise.resolve();

  await done();
  sb.appendBuffer(await load('i.bin'));
  await done();
  ms.duration = manifest.t;

  const starts = manifest.s;
  const indexAt = (t: number): number => {
    let i = 0;
    for (let k = 0; k < starts.length; k++) if (starts[k] <= t) i = k;
    return i;
  };
  const end = (i: number): number => starts[i + 1] ?? manifest.t;
  const isBuffered = (i: number): boolean => {
    const a = starts[i] + 0.05;
    const b = end(i) - 0.05;
    for (let r = 0; r < sb.buffered.length; r++) if (sb.buffered.start(r) <= a && sb.buffered.end(r) >= b) return true;
    return false;
  };

  let generation = 0;
  let running = false;
  let abort: AbortController | null = null;

  const evict = async (now: number): Promise<void> => {
    if (sb.buffered.length === 0) return;
    const lo = sb.buffered.start(0);
    const hi = sb.buffered.end(sb.buffered.length - 1);
    if (lo < now - BEHIND) {
      await done();
      sb.remove(lo, now - BEHIND);
      await done();
    }
    if (hi > now + AHEAD + 60) {
      await done();
      sb.remove(now + AHEAD + 60, hi);
      await done();
    }
  };

  /** Fill the buffer from the playhead forward; restarts on every seek. */
  const pump = async (): Promise<void> => {
    if (running) return;
    running = true;
    const gen = generation;
    try {
      while (gen === generation) {
        const now = el.currentTime;
        let i = indexAt(now);
        while (i < starts.length && starts[i] < now + AHEAD && isBuffered(i)) i++;
        if (i >= starts.length || starts[i] >= now + AHEAD) break;
        abort = new AbortController();
        const data = await load(`${i}.bin`, abort.signal);
        if (gen !== generation) break;
        await done();
        try {
          sb.appendBuffer(data);
        } catch (e) {
          if ((e as DOMException).name !== 'QuotaExceededError') throw e;
          await evict(now);
          sb.appendBuffer(data);
        }
        await done();
      }
      await evict(el.currentTime);
    } catch (e) {
      if ((e as DOMException).name !== 'AbortError') console.warn('stream', e);
    } finally {
      running = false;
      if (gen !== generation) void pump();
    }
  };

  el.addEventListener('seeking', () => {
    generation++;
    abort?.abort();
    void pump();
  });
  el.addEventListener('timeupdate', () => void pump());
  // ManagedMediaSource may evict on its own and asks to be refilled.
  ms.addEventListener('startstreaming', () => void pump());
  sb.addEventListener('bufferedchange', () => void pump());

  if (startAt > 0 && startAt < manifest.t) el.currentTime = startAt;
  await pump();
}

/** Fallback for browsers without MSE: decrypt everything into one blob. */
async function attachBlob(el: HTMLAudioElement, startAt: number): Promise<void> {
  const manifest: Manifest = await (await fetch(asset(DIR + 'm.json'))).json();
  const parts: ArrayBuffer[] = [await load('i.bin')];
  for (let i = 0; i < manifest.s.length; i++) parts.push(await load(`${i}.bin`));
  el.src = URL.createObjectURL(new Blob(parts, { type: 'audio/mp4' }));
  if (startAt > 0) el.addEventListener('loadedmetadata', () => (el.currentTime = startAt), { once: true });
  // The click that started things is long gone; play on the next tap if refused.
  void el.play().catch(() => window.addEventListener('pointerdown', () => void el.play(), { once: true }));
}
