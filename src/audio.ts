import { MIX, TRACKLIST, type MixTrack } from './data';
import { asset } from './paths';
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
/** Separate from `master` so ducking and transport fades never fight. */
let focusGain: GainNode | null = null;
let pauseTimer = 0;
/** True when the visitor paused; nothing but the visitor resumes it. */
let userPaused = false;
const stateListeners = new Set<(playing: boolean) => void>();
let analyser: AnalyserNode | null = null;
let freq: Uint8Array<ArrayBuffer> = new Uint8Array(0);
let started = false;
let lastIndex = -1;
const trackListeners = new Set<(t: MixTrack, i: number) => void>();

export const audioCtx = (): AudioContext | null => ctx;
/** Where other sound (the sequencer) should connect, so it shares the transport fades. */
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
  // Fetch only the header until the visitor wants sound: a 45-minute mix must
  // not compete with the page's own images and scripts on a phone connection.
  el = document.createElement('audio');
  el.loop = true;
  el.preload = 'metadata';
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
  media.preload = 'auto';

  // 'playback' asks for larger render buffers: steadier output on phones while
  // the visuals are busy, at a latency nobody notices on a DJ mix.
  ctx = new AudioContext({ latencyHint: 'playback' });
  const src = ctx.createMediaElementSource(media);
  master = ctx.createGain();
  master.gain.value = 1;
  analyser = ctx.createAnalyser();
  analyser.fftSize = 2048;
  analyser.smoothingTimeConstant = 0.6;
  // A mastered club mix lives near full scale: widen the window so the bytes
  // keep their shape instead of pinning at 255 (the defaults are -100..-30 dB).
  analyser.minDecibels = -80;
  analyser.maxDecibels = -6;
  freq = new Uint8Array(analyser.frequencyBinCount);
  focusGain = ctx.createGain();
  src.connect(analyser);
  analyser.connect(master);
  master.connect(focusGain);
  focusGain.connect(ctx.destination);

  // A browser may reject the initial autoplay. Recover both the media element
  // and suspended AudioContext on a real gesture; never claim it is playing early.
  const retry = (event: Event): void => {
    // The play button handles its own tap; retrying here as well would undo it.
    if (event.target instanceof Element && event.target.closest('[data-quiet], [data-legal-link], .fbar-play')) return;
    if (!userPaused && !isPlaying()) play();
  };
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
  setInterval(savePos, 4000);
  mountMediaSession();
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
  clearTimeout(pauseTimer);
  void ctx.resume();
  const g = focusGain.gain;
  // Resume from silence and ramp in, so playback never starts on a click.
  g.cancelScheduledValues(ctx.currentTime);
  if (el.paused) g.setValueAtTime(0, ctx.currentTime);
  g.setTargetAtTime(1, ctx.currentTime, 0.06);
  void el.play().then(emitState).catch(emitState);
  emitState();
}

/** Fade out over ~120 ms, then pause: stopping mid-waveform pops in headphones. */
export function pause(): void {
  if (!el) return;
  userPaused = true;
  clearTimeout(pauseTimer);
  if (ctx && focusGain && !el.paused && ctx.state === 'running') {
    const g = focusGain.gain;
    g.cancelScheduledValues(ctx.currentTime);
    g.setValueAtTime(g.value, ctx.currentTime);
    g.linearRampToValueAtTime(0, ctx.currentTime + 0.12);
    pauseTimer = window.setTimeout(() => {
      el?.pause();
      savePos();
    }, 140);
  } else {
    el.pause();
    savePos();
  }
  emitState();
}

export const toggle = (): void => (isPlaying() ? pause() : play());

let seekTarget: number | null = null;

/**
 * Jump in the mix. While audible, dip the output for a few milliseconds around
 * the jump so it lands without a click; rapid scrubbing collapses into one dip.
 */
export function seek(sec: number): void {
  prepare();
  const media = el!;
  const target = Math.max(0, Math.min(sec, duration() - 0.5));
  if (!ctx || !focusGain || !isPlaying()) {
    media.currentTime = target;
    onTime();
    savePos();
    return;
  }
  const pending = seekTarget !== null;
  seekTarget = target;
  if (pending) return;
  const g = focusGain.gain;
  g.cancelScheduledValues(ctx.currentTime);
  g.setValueAtTime(g.value, ctx.currentTime);
  g.linearRampToValueAtTime(0, ctx.currentTime + 0.03);
  window.setTimeout(() => {
    media.currentTime = seekTarget ?? target;
    seekTarget = null;
    onTime();
    savePos();
    let restored = false;
    const restore = (): void => {
      if (restored || !ctx || !focusGain) return;
      restored = true;
      if (userPaused) return;
      focusGain.gain.cancelScheduledValues(ctx.currentTime);
      focusGain.gain.setTargetAtTime(1, ctx.currentTime, 0.04);
    };
    media.addEventListener('seeked', restore, { once: true });
    window.setTimeout(restore, 700);
  }, 35);
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
    updateMediaSession();
  }
}

/* ─────────── lock screen, headphones and hardware media keys ─────────── */

function updateMediaSession(): void {
  if (!('mediaSession' in navigator) || lastIndex < 0) return;
  const t = TRACKLIST[lastIndex];
  const art = new URL(asset('img/mix-art.jpg'), location.href).href;
  navigator.mediaSession.metadata = new MediaMetadata({
    title: t.title,
    artist: t.artist,
    album: `ACND × অপূর্ব — ${MIX.show} ${MIX.volume} · ${MIX.station}`,
    artwork: [{ src: art, sizes: '512x512', type: 'image/jpeg' }],
  });
}

function syncPosition(): void {
  if (!('mediaSession' in navigator) || !el || !Number.isFinite(el.duration)) return;
  navigator.mediaSession.playbackState = isPlaying() ? 'playing' : 'paused';
  try {
    navigator.mediaSession.setPositionState({ duration: el.duration, position: Math.min(el.currentTime, el.duration), playbackRate: 1 });
  } catch {
    /* older implementations */
  }
}

function mountMediaSession(): void {
  if (!('mediaSession' in navigator)) return;
  const on = (action: MediaSessionAction, fn: MediaSessionActionHandler): void => {
    try {
      navigator.mediaSession.setActionHandler(action, fn);
    } catch {
      /* action unsupported here */
    }
  };
  on('play', () => play());
  on('pause', () => pause());
  on('previoustrack', () => skip(-1));
  on('nexttrack', () => skip(1));
  on('seekbackward', (d) => seek(time() - (d.seekOffset ?? 10)));
  on('seekforward', (d) => seek(time() + (d.seekOffset ?? 10)));
  on('seekto', (d) => d.seekTime !== undefined && seek(d.seekTime));
  stateListeners.add(syncPosition);
  el?.addEventListener('seeked', syncPosition);
  el?.addEventListener('loadedmetadata', syncPosition);
  updateMediaSession();
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

/** Smoothed 0..1 levels for visuals: low end, mids, highs, overall, kick pulse. */
export const levels = { low: 0, mid: 0, high: 0, all: 0, beat: 0, kick: 0 };
let kickAvg = 0;
let lastKick = 0;
let lastSample = -1;

/**
 * Several loops read the levels each frame; analyse once per frame so the
 * smoothing behaves the same however many visuals are on screen.
 */
export function sample(): typeof levels {
  const now = performance.now();
  if (now - lastSample < 8) return levels;
  const dt = lastSample < 0 ? 1 : Math.min(3, (now - lastSample) / 16.7);
  lastSample = now;
  if (!analyser || !isPlaying()) {
    // Before the mix plays, breathe gently at its tempo so visuals are never dead.
    const s = now / 1000;
    const b = Math.max(0, Math.sin(s * Math.PI * (MIX.bpm / 60))) ** 8;
    levels.low += (0.15 + b * 0.2 - levels.low) * 0.2;
    levels.mid += (0.12 - levels.mid) * 0.2;
    levels.high += (0.08 - levels.high) * 0.2;
    levels.all = (levels.low + levels.mid + levels.high) / 3;
    levels.beat = Math.max(levels.beat * 0.9 ** dt, b * 0.4);
    return levels;
  }
  analyser.getByteFrequencyData(freq);
  const band = (a: number, b: number): number => {
    let sum = 0;
    for (let i = a; i < b; i++) sum += freq[i];
    return sum / ((b - a) * 255);
  };
  // 2048-point FFT at 44.1–48 kHz: ~23 Hz per bin.
  const kick = band(2, 6); // ~45–140 Hz, where the kick lives
  const low = band(1, 16);
  const mid = band(16, 160);
  const high = band(160, 600);
  const k = (rate: number): number => 1 - (1 - rate) ** dt;
  levels.low += (low - levels.low) * k(0.35);
  levels.mid += (mid - levels.mid) * k(0.25);
  levels.high += (high - levels.high) * k(0.25);
  levels.all = (levels.low + levels.mid + levels.high) / 3;
  // Fast attack, slower release: an envelope that follows each kick.
  levels.kick += (kick - levels.kick) * k(kick > levels.kick ? 0.6 : 0.18);
  // A kick is energy well above its own recent average, at most ~4 per second.
  kickAvg += (kick - kickAvg) * k(0.04);
  levels.beat *= 0.88 ** dt;
  if (kick > 0.3 && kick > kickAvg * 1.18 && now - lastKick > 240) {
    lastKick = now;
    levels.beat = Math.min(1, 0.55 + (kick - kickAvg) * 4);
  }
  return levels;
}

export const spectrum = (): Uint8Array => freq;
