import { MIX, TRACKLIST, type MixTrack } from './data';
import { asset } from './paths';

/**
 * The mix plays on its own — there is deliberately no play, pause or seek
 * control. Browsers refuse audible autoplay until the visitor interacts with
 * the page once, so `start()` is called from the "enter" gate's click; after
 * that the mix runs, loops and resumes where it left off on the next visit.
 */

const POS_KEY = 'iry:mix-pos';

let el: HTMLAudioElement | null = null;
let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let analyser: AnalyserNode | null = null;
let freq: Uint8Array<ArrayBuffer> = new Uint8Array(0);
let started = false;
let lastIndex = -1;
const trackListeners = new Set<(t: MixTrack, i: number) => void>();

export const audioCtx = (): AudioContext | null => ctx;
export const isStarted = (): boolean => started;

export function start(): void {
  if (started) return;
  started = true;
  el = new Audio(asset(MIX.file));
  el.preload = 'auto';
  el.loop = true;

  try {
    const saved = Number(localStorage.getItem(POS_KEY));
    if (saved > 0 && saved < 2700) el.currentTime = saved;
  } catch {
    /* storage unavailable — start from the top */
  }

  ctx = new AudioContext();
  const src = ctx.createMediaElementSource(el);
  master = ctx.createGain();
  master.gain.value = 0;
  analyser = ctx.createAnalyser();
  analyser.fftSize = 1024;
  analyser.smoothingTimeConstant = 0.82;
  freq = new Uint8Array(analyser.frequencyBinCount);
  src.connect(analyser);
  analyser.connect(master);
  master.connect(ctx.destination);
  master.gain.linearRampToValueAtTime(1, ctx.currentTime + 2.5);

  void el.play().catch(() => {
    // Should not happen after a click, but try again on the next interaction.
    const retry = (): void => void el?.play();
    window.addEventListener('pointerdown', retry, { once: true });
  });

  el.addEventListener('timeupdate', onTime);
  // Tabs that get backgrounded keep playing; nothing to pause.
  window.addEventListener('pagehide', savePos);
  setInterval(savePos, 4000);
}

function savePos(): void {
  if (!el) return;
  try {
    localStorage.setItem(POS_KEY, String(el.currentTime));
  } catch {
    /* ignore */
  }
}

export const time = (): number => el?.currentTime ?? 0;
export const duration = (): number => (el && Number.isFinite(el.duration) ? el.duration : 2743.6);

export function trackIndexAt(sec: number): number {
  let i = 0;
  for (let k = 0; k < TRACKLIST.length; k++) if (TRACKLIST[k].at <= sec) i = k;
  return i;
}

function onTime(): void {
  const i = trackIndexAt(time());
  if (i !== lastIndex) {
    lastIndex = i;
    trackListeners.forEach((fn) => fn(TRACKLIST[i], i));
  }
}

export function onTrack(fn: (t: MixTrack, i: number) => void): () => void {
  trackListeners.add(fn);
  if (lastIndex >= 0) fn(TRACKLIST[lastIndex], lastIndex);
  return () => trackListeners.delete(fn);
}

/** Pull the mix down while the sequencer plays so the two don't fight. */
export function duck(on: boolean): void {
  if (!ctx || !master) return;
  master.gain.cancelScheduledValues(ctx.currentTime);
  master.gain.setTargetAtTime(on ? 0.18 : 1, ctx.currentTime, 0.25);
}

/** Smoothed 0..1 levels for visuals: low end, mids, highs, overall. */
export const levels = { low: 0, mid: 0, high: 0, all: 0, beat: 0 };
let prevLow = 0;

export function sample(): typeof levels {
  if (!analyser) {
    // Before the gate, breathe gently so the visuals are never dead.
    const s = performance.now() / 1000;
    const b = Math.max(0, Math.sin(s * Math.PI * (MIX.bpm / 60))) ** 8;
    levels.low = 0.15 + b * 0.2;
    levels.mid = 0.12;
    levels.high = 0.08;
    levels.all = 0.12;
    levels.beat = b * 0.4;
    return levels;
  }
  analyser.getByteFrequencyData(freq);
  const band = (a: number, b: number): number => {
    let sum = 0;
    for (let i = a; i < b; i++) sum += freq[i];
    return sum / ((b - a) * 255);
  };
  const low = band(1, 8);
  const mid = band(8, 80);
  const high = band(80, 300);
  levels.low += (low - levels.low) * 0.35;
  levels.mid += (mid - levels.mid) * 0.25;
  levels.high += (high - levels.high) * 0.25;
  levels.all = (levels.low + levels.mid + levels.high) / 3;
  const hit = low - prevLow;
  prevLow = low;
  levels.beat = Math.max(levels.beat * 0.9, hit > 0.06 ? Math.min(1, hit * 6) : 0);
  return levels;
}

export const spectrum = (): Uint8Array => freq;
