import { CURRENT, MIX, TRACKLIST, onSetChange, selectSet, type MixTrack } from './data';

/**
 * The Qbic Pulse sets play through Mixcloud's own player, the widget in the
 * player bar. Mixcloud streams the audio, so the site ships none, and the
 * widget stays visible as Mixcloud requires. Everything else on the site (the
 * play button, tracklist jumps, prev / next, the visuals) drives that one
 * widget through its JavaScript API (widget.mixcloud.com/media/js/widgetApi.js).
 *
 * Browsers refuse audible autoplay until the visitor interacts with the page.
 * "Enter with sound" is that interaction: it asks the widget to play, and the
 * iframe is allowed to autoplay on the page's behalf. Where a browser still
 * refuses (Safari can), the widget's own play button is right there.
 */

interface MixcloudWidget {
  ready: Promise<void>;
  load(key: string, startPlaying?: boolean): Promise<void>;
  play(): Promise<void>;
  pause(): Promise<void>;
  togglePlay(): Promise<void>;
  seek(sec: number): Promise<boolean>;
  getPosition(): Promise<number>;
  getDuration(): Promise<number>;
  getIsPaused(): Promise<boolean>;
  events: Record<'progress' | 'buffering' | 'play' | 'pause' | 'ended' | 'error', { on(fn: (...args: number[]) => void): void }>;
}
declare global {
  interface Window {
    Mixcloud?: { PlayerWidget(frame: HTMLIFrameElement): MixcloudWidget };
  }
}

const API = 'https://widget.mixcloud.com/media/js/widgetApi.js';
/** The widget for a set, as Mixcloud's own embed code builds it: the set's full URL, encoded once more. */
const feed = (key: string): string =>
  `https://player-widget.mixcloud.com/widget/iframe/?feed=${encodeURIComponent(`https://www.mixcloud.com${key}`)}&mini=1&light=1&hide_cover=1&hide_artwork=1`;
/** The set's key as Mixcloud's API gives it (/user/slug/, URL-encoded). */
const keyOf = (): string => CURRENT.mixcloud ?? '';

/** Where each set was left; the first set keeps the original key. */
const posKey = (slug = CURRENT.slug): string => (slug === 'qbic-pulse-vol-1' ? 'iry:mix-pos' : `iry:mix-pos:${slug}`);
const savedPos = (): number => {
  try {
    const saved = Number(localStorage.getItem(posKey())) || 0;
    return saved > 0 && saved < CURRENT.duration - 30 ? saved : 0;
  } catch {
    return 0; // storage unavailable: start from the top
  }
};

let frame: HTMLIFrameElement | null = null;
let widget: MixcloudWidget | null = null;
let ready: Promise<MixcloudWidget> | null = null;
let started = false;
let playing = false;
let buffering = false;
/** True when the visitor paused; nothing but the visitor resumes it. */
let userPaused = false;
/** Last position Mixcloud reported, and when: time() runs on between reports. */
let pos = 0;
let posAt = 0;
let dur = 0;
/** A jump asked for before Mixcloud would take it (it only seeks while playing). */
let pendingSeek: number | null = null;
let lastIndex = -1;
/** The set the widget has loaded. */
let loadedKey = '';
const stateListeners = new Set<(playing: boolean) => void>();
const trackListeners = new Set<(t: MixTrack, i: number) => void>();

export const isStarted = (): boolean => started;

function loadApi(): Promise<void> {
  if (window.Mixcloud) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = API;
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error('Mixcloud widget API failed to load'));
    document.head.append(s);
  });
}

/** The slot in the player bar the widget lives in. */
let slot: HTMLElement | null = null;
export function mountWidget(el: HTMLElement): void {
  slot = el;
  if (frame && frame.parentElement !== el) el.append(frame);
}

/**
 * Create the widget and connect to it, without playing. Needs no gesture:
 * pages call it once they have loaded, so the player is ready by the click.
 */
export function prepare(): Promise<MixcloudWidget> {
  if (ready) return ready;
  frame = document.createElement('iframe');
  frame.className = 'mc-frame';
  frame.title = `Mixcloud player: ${MIX.show} ${MIX.volume}`;
  frame.allow = 'autoplay; encrypted-media';
  loadedKey = keyOf();
  frame.src = feed(loadedKey);
  (slot ?? document.body).append(frame);
  ready = loadApi()
    .then(() => {
      const w = window.Mixcloud!.PlayerWidget(frame!);
      return w.ready.then(() => w);
    })
    .then((w) => {
      widget = w;
      wire(w);
      // Another set was chosen while the widget was connecting.
      if (loadedKey !== keyOf()) {
        loadedKey = keyOf();
        void w.load(loadedKey, started && !userPaused);
      }
      return w;
    });
  ready.catch(() => emitState());
  return ready;
}

function wire(w: MixcloudWidget): void {
  w.events.progress.on((position, duration) => {
    pos = position;
    posAt = performance.now();
    if (duration > 0) dur = duration;
    if (playing) buffering = false;
    onTime();
  });
  w.events.buffering.on(() => {
    buffering = true;
    emitState();
  });
  w.events.play.on(() => {
    playing = true;
    buffering = false;
    started = true;
    userPaused = false;
    posAt = performance.now();
    if (pendingSeek !== null) {
      const t = pendingSeek;
      pendingSeek = null;
      void w.seek(t);
    }
    emitState();
  });
  w.events.pause.on(() => {
    pos = time();
    playing = false;
    savePos();
    emitState();
  });
  w.events.ended.on(() => {
    playing = false;
    pos = 0;
    savePos();
    emitState();
  });
  w.events.error.on(() => {
    playing = false;
    emitState();
  });
  window.addEventListener('pagehide', savePos);
  setInterval(() => playing && savePos(), 4000);
}

/** Play now (the visitor's click lets the widget autoplay); resumes where this visitor left the set. */
export function start(): void {
  const first = !started;
  started = true;
  userPaused = false;
  const resumeAt = first && pos === 0 ? savedPos() : 0;
  void prepare().then((w) => {
    if (userPaused) return;
    if (resumeAt) pendingSeek = resumeAt;
    void w.play();
    // A browser that refused to start without a gesture: the visitor's first tap or key starts it.
    if (first) window.setTimeout(armRetry, 1500);
  }).catch(() => {});
  emitState();
}

/**
 * Only called after the visitor chose sound (the gate's "Enter with sound",
 * the play button, or a stored "sound" choice). If the browser still refused,
 * the next deliberate tap or Enter / Space starts it; Tab, arrows, modifiers
 * and Escape never do, and nothing fires while the entry gate is up.
 */
function armRetry(): void {
  if (playing || userPaused) return;
  const off = (): void => {
    window.removeEventListener('pointerdown', retry, true);
    window.removeEventListener('keydown', retry, true);
  };
  function retry(event: Event): void {
    if (playing || userPaused) return off();
    if (document.body.classList.contains('gated')) return;
    if (event instanceof KeyboardEvent && (event.key !== 'Enter' && event.key !== ' ')) return;
    // The play buttons and the quiet / legal links handle their own taps.
    if (event.target instanceof Element && event.target.closest('[data-quiet], [data-legal-link], .fbar-play, .home-play, .gate')) return;
    off();
    void widget?.play();
  }
  window.addEventListener('pointerdown', retry, true);
  window.addEventListener('keydown', retry, true);
}

/** The entrance effect needed direct access to the audio; Mixcloud plays the set as it is. */
export function outsideTheClub(): void {}
export function walkIn(_seconds = 2.4): void {}

/** Seconds ready ahead. Mixcloud buffers for itself: report ready once connected. */
export const bufferedAhead = (): number => (widget ? 30 : 0);

/** Whether the connection is slow; the extras wait for a fast link. */
export function slowLink(): boolean {
  const c = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string; downlink?: number } }).connection;
  return !!c && (!!c.saveData || /(^|-)(2g|3g)$/.test(c.effectiveType ?? '') || (typeof c.downlink === 'number' && c.downlink > 0 && c.downlink < 1.5));
}
/** Extras load while Mixcloud is not catching up. */
export const roomForExtras = (): boolean => !buffering;

export const isPlaying = (): boolean => playing && !userPaused;

export function onState(fn: (playing: boolean) => void): () => void {
  stateListeners.add(fn);
  fn(isPlaying());
  return () => stateListeners.delete(fn);
}
function emitState(): void {
  stateListeners.forEach((fn) => fn(isPlaying()));
}

export function play(): void {
  if (!started || !widget) return start();
  userPaused = false;
  void widget.play();
}

export function pause(): void {
  userPaused = true;
  pos = time();
  if (widget) void widget.pause();
  savePos();
  emitState();
}

export const toggle = (): void => (isPlaying() ? pause() : play());

/** Jump in the set. Mixcloud seeks only while playing, so an earlier jump waits for play. */
export function seek(sec: number): void {
  const target = Math.max(0, Math.min(sec, duration() - 1));
  pos = target;
  posAt = performance.now();
  onTime();
  savePos();
  if (!widget || !playing) {
    pendingSeek = target;
    return;
  }
  void widget.seek(target).then((ok) => {
    if (!ok) pendingSeek = target;
  });
}

/** Jump to the previous (-1) or next (+1) track ID. */
export function skip(dir: -1 | 1): void {
  if (TRACKLIST.length < 2) return;
  const i = trackIndexAt(time());
  // "Previous" restarts the current track unless we're near its start.
  const target = dir < 0 && time() - TRACKLIST[i].at > 4 ? i : i + dir;
  seek(TRACKLIST[(target + TRACKLIST.length) % TRACKLIST.length].at);
}

/** The position, running on smoothly between Mixcloud's progress reports. */
export const time = (): number => {
  const t = isPlaying() && !buffering ? pos + Math.min(1.5, (performance.now() - posAt) / 1000) : pos;
  return Math.min(t, duration());
};
export const duration = (): number => dur || CURRENT.duration;

/**
 * The track that is playing, or the one Play will start: before the first
 * play that is the spot this visitor left the set at, not the first track.
 */
export const upNext = (): number => trackIndexAt(started ? time() : savedPos());

export function trackIndexAt(sec: number): number {
  let i = 0;
  for (let k = 0; k < TRACKLIST.length; k++) if (TRACKLIST[k].at <= sec) i = k;
  return i;
}

function onTime(): void {
  const i = trackIndexAt(time());
  if (i !== lastIndex && TRACKLIST[i]) {
    lastIndex = i;
    trackListeners.forEach((fn) => fn(TRACKLIST[i], i));
  }
}

function savePos(): void {
  if (!started) return;
  try {
    localStorage.setItem(posKey(), String(time()));
  } catch {
    /* ignore */
  }
}

export function onTrack(fn: (t: MixTrack, i: number) => void): () => void {
  trackListeners.add(fn);
  if (lastIndex >= 0) fn(TRACKLIST[lastIndex], lastIndex);
  return () => trackListeners.delete(fn);
}

/* ─────────── Visuals: a beat clock locked to the set's tempo and position ─────────── */

/**
 * The audio plays inside Mixcloud's frame, out of the page's reach, so the
 * visuals cannot measure it. Instead they follow a clock at the set's BPM,
 * phase-locked to the playing position: the kick lands on the beat, hats on
 * the off-beat, and a slow swell over every 16 bars. Paused, it breathes gently.
 */
export const levels = { low: 0, mid: 0, high: 0, all: 0, beat: 0, kick: 0 };
const BINS = 1024;
const freq = new Uint8Array(BINS);
const empty = new Uint8Array(0);
let lastSample = -1;
let lastBeat = -1;
/** Settles to 1 while playing and 0 when not, so the change is never a jump. */
let live = 0;

export function sample(): typeof levels {
  const now = performance.now();
  if (now - lastSample < 8) return levels;
  const dt = lastSample < 0 ? 1 : Math.min(3, (now - lastSample) / 16.7);
  lastSample = now;
  const k = (rate: number): number => 1 - (1 - rate) ** dt;
  live += ((isPlaying() ? 1 : 0) - live) * k(0.06);
  const bpm = MIX.bpm || 124;
  if (live < 0.02) {
    // Before the mix plays, breathe gently at its tempo so visuals are never dead.
    const s = now / 1000;
    const b = Math.max(0, Math.sin(s * Math.PI * (bpm / 60))) ** 8;
    levels.low += (0.15 + b * 0.2 - levels.low) * 0.2;
    levels.mid += (0.12 - levels.mid) * 0.2;
    levels.high += (0.08 - levels.high) * 0.2;
    levels.all = (levels.low + levels.mid + levels.high) / 3;
    levels.beat = Math.max(levels.beat * 0.9 ** dt, b * 0.4);
    levels.kick = levels.low;
    return levels;
  }
  const beats = (time() * bpm) / 60;
  const phase = beats % 1;
  const bar16 = (beats / 64) % 1;
  // A build over each 16 bars, dropping back at the top.
  const swell = 0.75 + 0.25 * Math.sin(bar16 * Math.PI);
  const kick = Math.exp(-phase * 7) * swell;
  const hat = Math.exp(-Math.abs(phase - 0.5) * 14);
  const shimmer = 0.5 + 0.5 * Math.sin(beats * Math.PI * 0.5);
  levels.low += ((0.25 + kick * 0.6) * live - levels.low) * k(0.45);
  levels.mid += ((0.25 + hat * 0.25 + shimmer * 0.15) * live - levels.mid) * k(0.3);
  levels.high += ((0.15 + hat * 0.35) * live - levels.high) * k(0.3);
  levels.all = (levels.low + levels.mid + levels.high) / 3;
  levels.kick += (kick * live - levels.kick) * k(kick > levels.kick ? 0.6 : 0.18);
  levels.beat *= 0.88 ** dt;
  const n = Math.floor(beats);
  if (n !== lastBeat) {
    lastBeat = n;
    levels.beat = Math.min(1, (0.6 + 0.3 * swell) * live);
  }
  // A spectrum with the same shape: kick in the lowest bins, hats up top, a moving body.
  const t = now / 1000;
  for (let i = 0; i < BINS; i++) {
    const f = i / BINS;
    const bass = i < 16 ? kick * (1 - i / 20) : 0;
    const body = Math.exp(-f * 6) * (0.45 + 0.25 * Math.sin(t * 1.3 + i * 0.07));
    const top = f > 0.15 ? hat * 0.35 * (1 - f) : 0;
    const grain = 0.08 * Math.sin(i * 12.9898 + t * 7.3) ** 2;
    freq[i] = Math.max(0, Math.min(255, (bass * 0.9 + body * swell + top + grain) * 255 * live));
  }
  return levels;
}

/** The beat clock's spectrum while a set plays; empty otherwise, so visuals breathe on their own. */
export const spectrum = (): Uint8Array => (live >= 0.02 ? freq : empty);

/* ─────────── Qbic Pulse: put another set on air ─────────── */

/** Play a set from the library; the widget loads it and starts it. */
export function playSet(slug: string): void {
  if (!selectSet(slug)) {
    play();
    return;
  }
  if (!widget) start();
}

let lastSlug = CURRENT.slug;
onSetChange(() => {
  // Remember the outgoing set's spot under its own key.
  try {
    if (started) localStorage.setItem(posKey(lastSlug), String(time()));
  } catch {
    /* ignore */
  }
  lastSlug = CURRENT.slug;
  pos = 0;
  dur = 0;
  playing = false;
  pendingSeek = savedPos() || null;
  lastIndex = -1;
  userPaused = false;
  if (frame) frame.title = `Mixcloud player: ${MIX.show} ${MIX.volume}`;
  if (widget) {
    loadedKey = keyOf();
    void widget.load(loadedKey, true);
  }
  onTime();
  emitState();
});
