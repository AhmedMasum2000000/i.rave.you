import { MIX, TRACKLIST, type MixTrack } from './data';
import { attachStream } from './stream';

/**
 * The Qbic Pulse set for Hong Kong Community Radio plays in the background of
 * every page. Browsers refuse audible autoplay until the visitor interacts with
 * the page once. The prompt attempts playback and retries on its first click; after
 * that it runs, loops and resumes where it left off on the next visit. The
 * visitor can pause, seek and skip between tracks (see `toggle`, `seek`, `skip`).
 */

const POS_KEY = 'iry:mix-pos';

let el: HTMLAudioElement | null = null;
let ctx: AudioContext | null = null;
let master: GainNode | null = null;
/** Separate from `master` so ducking and tab-focus fades never fight. */
let focusGain: GainNode | null = null;
let pauseTimer = 0;
/** True when the visitor paused; tab-focus changes must not override that. */
let userPaused = false;
const stateListeners = new Set<(playing: boolean) => void>();
let analyser: AnalyserNode | null = null;
let freq: Uint8Array<ArrayBuffer> = new Uint8Array(0);
let started = false;
let lastIndex = -1;
const trackListeners = new Set<(t: MixTrack, i: number) => void>();

export const audioCtx = (): AudioContext | null => ctx;
/** Where other sound (the sequencer) should connect, so it fades with the tab too. */
export const output = (): AudioNode | null => focusGain;
export const isStarted = (): boolean => started;

let prepared = false;

/**
 * Attach and start buffering the set without playing it. Needs no user
 * gesture, so pages call it on load: by the time the visitor clicks, the
 * opening fragments are already fetched, decrypted and buffered.
 */
export function prepare(): void {
  if (prepared) return;
  prepared = true;
  // Preload the continuous mix before the visitor dismisses the prompt.
  el = document.createElement('audio');
  el.loop = true;
  el.preload = 'auto';
  el.hidden = true;
  el.setAttribute('controlslist', 'nodownload noplaybackrate');
  el.addEventListener('contextmenu', (e) => e.preventDefault());
  document.body.append(el);

  let saved = 0;
  try {
    saved = Number(localStorage.getItem(POS_KEY)) || 0;
  } catch {
    /* storage unavailable — start from the top */
  }
  attachStream(el, saved > 0 && saved < 2700 ? saved : 0);

  el.addEventListener('timeupdate', onTime);
  el.addEventListener('play', emitState);
  el.addEventListener('pause', emitState);
}

/** Seconds of audio ready in front of the playhead (0 until prepared). */
export function bufferedAhead(): number {
  if (!el) return 0;
  const t = el.currentTime;
  for (let i = 0; i < el.buffered.length; i++) {
    if (el.buffered.start(i) <= t + 0.25 && el.buffered.end(i) > t) return el.buffered.end(i) - t;
  }
  return 0;
}

/** Attempt playback now; a later real gesture retries if autoplay is blocked. */
export function start(): void {
  if (started) {
    play();
    return;
  }
  started = true;
  prepare();
  const media = el!;

  ctx = new AudioContext();
  const src = ctx.createMediaElementSource(media);
  master = ctx.createGain();
  master.gain.value = 1;
  analyser = ctx.createAnalyser();
  analyser.fftSize = 1024;
  analyser.smoothingTimeConstant = 0.82;
  freq = new Uint8Array(analyser.frequencyBinCount);
  focusGain = ctx.createGain();
  src.connect(analyser);
  analyser.connect(master);
  master.connect(focusGain);
  focusGain.connect(ctx.destination);

  // A browser may reject the initial autoplay. Recover both the media element
  // and suspended AudioContext on a real gesture; never claim it is playing early.
  const retry = (): void => { if (!userPaused && !isPlaying()) play(); };
  const removeRetry = (): void => {
    if (!isPlaying()) return;
    window.removeEventListener('pointerdown', retry);
    window.removeEventListener('keydown', retry);
  };
  window.addEventListener('pointerdown', retry);
  window.addEventListener('keydown', retry);
  media.addEventListener('playing', () => { emitState(); removeRetry(); });
  ctx.addEventListener('statechange', () => { emitState(); removeRetry(); });
  media.addEventListener('waiting', emitState);
  media.addEventListener('error', emitState);
  play();

  window.addEventListener('pagehide', savePos);
  document.addEventListener('visibilitychange', onFocusChange);
  window.addEventListener('blur', onFocusChange);
  window.addEventListener('focus', onFocusChange);
  setInterval(savePos, 4000);
}

/**
 * Leaving the tab (or the window) fades the mix out and pauses it in place;
 * coming back resumes from the same spot and fades it in again.
 */
function onFocusChange(): void {
  if (!ctx || !focusGain || !el) return;
  const away = document.hidden || !document.hasFocus();
  const g = focusGain.gain;
  g.cancelScheduledValues(ctx.currentTime);
  g.setValueAtTime(g.value, ctx.currentTime);
  clearTimeout(pauseTimer);
  if (userPaused) return;
  if (away) {
    g.linearRampToValueAtTime(0, ctx.currentTime + 0.8);
    pauseTimer = window.setTimeout(() => {
      el?.pause();
      savePos();
    }, 850);
  } else {
    void ctx.resume();
    if (el.paused) void el.play().catch(() => undefined);
    g.linearRampToValueAtTime(1, ctx.currentTime + 1.2);
  }
}

function savePos(): void {
  if (!el) return;
  try {
    localStorage.setItem(POS_KEY, String(el.currentTime));
  } catch {
    /* ignore */
  }
}

function emitState(): void {
  stateListeners.forEach((fn) => fn(isPlaying()));
}

/** Report actual audible playback, including autoplay rejection or suspension. */
export const isPlaying = (): boolean => !!el && !el.paused && !el.ended && !el.error && ctx?.state === 'running' && !userPaused;

export function onState(fn: (playing: boolean) => void): () => void {
  stateListeners.add(fn);
  fn(isPlaying());
  return () => stateListeners.delete(fn);
}

export function play(): void {
  if (!started) {
    start();
    emitState();
    return;
  }
  if (!el || !ctx || !focusGain) return;
  userPaused = false;
  void ctx.resume();
  focusGain.gain.cancelScheduledValues(ctx.currentTime);
  focusGain.gain.setTargetAtTime(1, ctx.currentTime, 0.08);
  void el.play().then(emitState).catch(emitState);
  emitState();
}

export function pause(): void {
  if (!el) return;
  userPaused = true;
  clearTimeout(pauseTimer);
  el.pause();
  savePos();
  emitState();
}

export const toggle = (): void => (isPlaying() ? pause() : play());

export function seek(sec: number): void {
  prepare();
  el!.currentTime = Math.max(0, Math.min(sec, duration() - 0.5));
  onTime();
  savePos();
}

/** Jump to the previous (-1) or next (+1) track ID. */
export function skip(dir: -1 | 1): void {
  const i = trackIndexAt(time());
  // "Previous" restarts the current track unless we're near its start.
  const target = dir < 0 && time() - TRACKLIST[i].at > 4 ? i : i + dir;
  seek(TRACKLIST[(target + TRACKLIST.length) % TRACKLIST.length].at);
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
