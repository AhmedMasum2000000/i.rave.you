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
/** Each deck (media element) has its own fader into the shared analyser. */
const deckGain = new Map<HTMLAudioElement, GainNode>();
/** The idle deck: a jump to an unbuffered spot loads here while the set plays on. */
let spare: HTMLAudioElement | null = null;
/** A jump being loaded on the spare deck. */
let cue: { target: number; timer: number } | null = null;
let stallTimer = 0;

export const audioCtx = (): AudioContext | null => ctx;
/** Where other sound (the sequencer) should connect, so it shares the transport fades. */
export const output = (): AudioNode | null => focusGain;
export const isStarted = (): boolean => started;

let prepared = false;
/** Attaches the on-air event handlers to a deck (set once the audio graph exists). */
let wire: (deck: HTMLAudioElement) => void = () => {};

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
  el = makeDeck();
  el.preload = 'metadata';

  let saved = 0;
  try {
    saved = Number(localStorage.getItem(POS_KEY)) || 0;
  } catch {
    /* storage unavailable — start from the top */
  }
  attachStream(el, saved > 0 && saved < 2700 ? saved : 0);

  listen(el);
}

function makeDeck(): HTMLAudioElement {
  const media = document.createElement('audio');
  media.loop = true;
  media.hidden = true;
  media.setAttribute('controlslist', 'nodownload noplaybackrate');
  media.addEventListener('contextmenu', (e) => e.preventDefault());
  document.body.append(media);
  return media;
}

/** Events count only from the deck that is on air. */
function onAir(media: HTMLAudioElement, type: string, fn: () => void): void {
  media.addEventListener(type, () => {
    if (media === el) fn();
  });
}

function listen(media: HTMLAudioElement): void {
  onAir(media, 'timeupdate', onTime);
  onAir(media, 'play', emitState);
  onAir(media, 'pause', emitState);
}

/** Route a deck through its own fader into the analyser. */
function connectDeck(media: HTMLAudioElement, level: number): void {
  if (!ctx || !analyser) return;
  const gain = ctx.createGain();
  gain.gain.value = level;
  ctx.createMediaElementSource(media).connect(gain);
  gain.connect(analyser);
  deckGain.set(media, gain);
}

/**
 * A stalled connection (a phone switching networks, a dropped socket) can
 * leave the player waiting forever. After a few seconds, ask again from the
 * same spot; the buffered audio in front is kept.
 */
function watchStall(): void {
  clearTimeout(stallTimer);
  stallTimer = window.setTimeout(() => {
    if (!el || userPaused || el.paused || el.readyState >= 3 || !navigator.onLine) return;
    el.currentTime = el.currentTime;
    watchStall();
  }, 4000);
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

  // 'interactive' asks for the smallest output buffers the device allows, so
  // sound follows a click at once and stays in step with the visuals.
  ctx = new AudioContext({ latencyHint: 'interactive' });
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
  connectDeck(media, 1);
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
  wire = (deck) => {
    onAir(deck, 'playing', () => { clearTimeout(stallTimer); emitState(); removeRetry(); });
    onAir(deck, 'waiting', () => { watchStall(); emitState(); });
    onAir(deck, 'stalled', watchStall);
    onAir(deck, 'error', emitState);
  };
  wire(media);
  ctx.addEventListener('statechange', () => { emitState(); removeRetry(); });
  // Back online: pick the set up again without waiting for the stall timer.
  window.addEventListener('online', () => {
    if (!el || userPaused) return;
    if (el.readyState < 3) el.currentTime = el.currentTime;
    play();
  });
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
  g.setTargetAtTime(1, ctx.currentTime, 0.015);
  void el.play().then(emitState).catch(emitState);
  emitState();
}

/** Fade out over ~120 ms, then pause: stopping mid-waveform pops in headphones. */
export function pause(): void {
  if (!el) return;
  cancelCue();
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
  // Not loaded yet: fetch it on the other deck while this one plays on.
  if (cue || !isBuffered(target)) {
    cueDeck(target);
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

/** True when the audio at `sec` (and a moment after it) is already downloaded. */
function isBuffered(sec: number): boolean {
  if (!el) return false;
  for (let i = 0; i < el.buffered.length; i++) {
    if (el.buffered.start(i) <= sec && el.buffered.end(i) >= Math.min(sec + 3, duration() - 0.5)) return true;
  }
  return false;
}

function cancelCue(): void {
  if (!cue) return;
  clearTimeout(cue.timer);
  cue = null;
  spare?.pause();
}

/**
 * Like a DJ cueing the next record: load the jump on the idle deck while the
 * set keeps playing, then crossfade once it can play. Nothing goes silent while
 * the network catches up.
 */
function cueDeck(target: number): void {
  if (!ctx || !el) return;
  if (!spare) {
    spare = makeDeck();
    spare.preload = 'auto';
    spare.src = el.currentSrc || el.src;
    listen(spare);
    wire(spare);
    connectDeck(spare, 0);
  }
  const next = spare;
  if (cue) {
    cue.target = target;
    if (next.readyState >= 1) next.currentTime = target;
    onTime();
    return;
  }
  // Give up after a long wait and seek the playing deck instead.
  cue = { target, timer: window.setTimeout(() => {
    const t = cue?.target ?? target;
    cancelCue();
    plainSeek(t);
  }, 15000) };
  onTime();
  const go = (): void => {
    if (!cue || spare !== next) return;
    next.currentTime = cue.target;
    const ready = (): void => {
      if (!cue || spare !== next) return;
      if (next.readyState < 3 || Math.abs(next.currentTime - cue.target) > 1) {
        next.addEventListener('canplay', ready, { once: true });
        return;
      }
      void next.play().then(() => crossfade(next)).catch(() => {
        // No permission to start a second player here (no tap): seek in place.
        const t = cue?.target ?? target;
        cancelCue();
        plainSeek(t);
      });
    };
    next.addEventListener('seeked', ready, { once: true });
  };
  if (next.readyState >= 1) go();
  else next.addEventListener('loadedmetadata', go, { once: true });
}

function crossfade(next: HTMLAudioElement): void {
  if (!ctx || !el || !cue) return;
  clearTimeout(cue.timer);
  cue = null;
  const prev = el;
  const now = ctx.currentTime;
  const fade = (media: HTMLAudioElement, to: number): void => {
    const g = deckGain.get(media)!.gain;
    g.cancelScheduledValues(now);
    g.setValueAtTime(g.value, now);
    g.linearRampToValueAtTime(to, now + 0.25);
  };
  fade(prev, 0);
  fade(next, 1);
  el = next;
  spare = prev;
  window.setTimeout(() => {
    if (spare === prev) prev.pause();
  }, 300);
  onTime();
  savePos();
  emitState();
  if ('mediaSession' in navigator) syncPosition();
}

/** Jump on the playing deck (used when the second deck can't help). */
function plainSeek(target: number): void {
  if (!el) return;
  el.currentTime = target;
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

export const time = (): number => cue?.target ?? el?.currentTime ?? 0;
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
  // Captured at the document so both decks report, whichever is on air.
  document.addEventListener('seeked', syncPosition, true);
  document.addEventListener('loadedmetadata', syncPosition, true);
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
