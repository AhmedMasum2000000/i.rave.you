import { isPlaying, roomForExtras, sample, slowLink, spectrum } from './audio';
import { asset } from './paths';

/**
 * The hero's visualizer: a short loop cut from the ARKA visualizer
 * (public/video/hero-viz.*), faint, under the two logos and the yin-yang.
 * It sits on the duality canvas with `difference` blending, so like
 * everything else on the home page it inverts across the dividing curve, and
 * a radial mask keeps the emblem itself clean.
 *
 * Load order protects the first paint and the sound:
 *  - nothing is requested until the page has loaded and the browser is idle;
 *  - then it waits, with no deadline, until the mix has 20 s buffered ahead
 *    (or no mix is running), so it never takes the audio's share of the link;
 *  - while the entry gate is up the gate is the loading screen: the loop
 *    buffers but does not play, and fades in as the visitor walks in,
 *    together with the sound.
 * Skipped for reduced motion, Save-Data and slow (2G/3G, < 1.5 Mbps) links.
 * The clear zone over the yin-yang follows the emblem as it moves.
 *
 * In sync with the mix (a surface-level link, never a strobe): the kick
 * lifts its opacity and scale a little, and the overall energy nudges its
 * playback speed. Paused whenever the hero is off screen or the tab hidden.
 */
export function mountViz(home: HTMLElement, emblem?: () => { x: number; y: number; r: number }): () => void {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches || slowLink()) return () => {};

  const v = document.createElement('video');
  v.className = 'home-viz';
  v.muted = true;
  v.loop = true;
  v.playsInline = true;
  v.preload = 'none';
  v.disablePictureInPicture = true;
  v.setAttribute('aria-hidden', 'true');
  v.setAttribute('tabindex', '-1');
  v.setAttribute('controlslist', 'nodownload noplaybackrate');
  v.setAttribute('disableremoteplayback', '');
  home.querySelector('.home-canvas')?.after(v);

  let alive = true;
  let onScreen = true;
  let raf = 0;
  let timer = 0;

  const gated = (): boolean => document.body.classList.contains('gated');
  const want = (): boolean => alive && onScreen && !document.hidden && !gated() && v.dataset.ready === '1';
  const sync = (): void => {
    if (want()) {
      void v.play().catch(() => {});
      if (!raf) raf = requestAnimationFrame(frame);
    } else v.pause();
    // The loop shows once it can play and the visitor is in (not behind the gate).
    v.classList.toggle('on', v.dataset.ready === '1' && !gated());
  };

  let last = 0;
  let rate = 1;
  let avg = 0;
  let pulse = 0;
  const frame = (now: number): void => {
    raf = 0;
    if (!want()) return;
    raf = requestAnimationFrame(frame);
    if (now - last < 33) return;
    last = now;
    const lv = sample();
    const playing = isPlaying();
    const em = emblem?.();
    if (em && em.r) {
      v.style.setProperty('--viz-x', `${em.x.toFixed(0)}px`);
      v.style.setProperty('--viz-y', `${em.y.toFixed(0)}px`);
      v.style.setProperty('--viz-r', `${em.r.toFixed(0)}px`);
    }
    // Breathes with the kick; a quiet floor when the mix is paused.
    // A mastered club mix keeps its kick level nearly flat, so follow each hit
    // against the kick's own running average rather than its absolute level.
    const f = spectrum();
    let k = 0;
    if (playing && f.length > 6) {
      for (let i = 2; i < 6; i++) k += f[i];
      k /= 4 * 255;
    }
    // Start from the current level: a fresh average of 0 would read as one long hit.
    avg = avg === 0 ? k : avg + (k - avg) * 0.02;
    const hit = Math.max(0, Math.min(1, ((k - avg) / Math.max(0.05, avg)) * 5));
    pulse = Math.max(hit, pulse * 0.78);
    const glow = Math.min(0.3, (playing ? 0.1 : 0.07) + pulse * (playing ? 0.13 : 0.04));
    v.style.setProperty('--viz-a', glow.toFixed(3));
    v.style.setProperty('--viz-s', (1.04 + pulse * 0.02).toFixed(4));
    const target = playing ? Math.min(1.2, 0.8 + lv.all * 0.9) : 0.7;
    if (Math.abs(target - rate) > 0.06) {
      rate = target;
      v.playbackRate = rate;
    }
  };

  const io = new IntersectionObserver((entries) => {
    onScreen = entries[entries.length - 1].isIntersecting;
    sync();
  });
  io.observe(home);
  document.addEventListener('visibilitychange', sync);
  const gateWatch = new MutationObserver(sync);
  gateWatch.observe(document.body, { attributes: true, attributeFilter: ['class'] });

  const sources = [v.canPlayType('video/webm; codecs="vp9"') ? 'video/hero-viz.webm' : '', 'video/hero-viz.mp4'].filter(Boolean);
  const ready = (): void => {
    if (v.dataset.ready === '1') return;
    v.dataset.ready = '1';
    sync();
  };
  // 'canplay' (not 'canplaythrough', which iOS Safari may never fire for a muted inline video).
  v.addEventListener('canplay', ready);
  v.addEventListener('loadeddata', ready);
  // A source that fails falls back to the next; with none left, the hero simply goes without.
  v.addEventListener('error', () => {
    if (!alive) return;
    if (sources.length) {
      v.src = asset(sources.shift()!);
      v.load();
    } else v.remove();
  });
  const load = (): void => {
    if (!alive) return;
    v.preload = 'auto';
    v.src = asset(sources.shift()!);
    v.load();
  };
  // After first paint and the page's own load, when idle; after the mix's opening is buffered.
  const whenIdle = (): void => {
    const idle = (window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number }).requestIdleCallback;
    const go = (): void => {
      const wait = (): void => {
        if (!alive) return;
        if (roomForExtras()) load();
        else timer = window.setTimeout(wait, 500);
      };
      wait();
    };
    if (idle) idle(go, { timeout: 2000 });
    else timer = window.setTimeout(go, 600);
  };
  if (document.readyState === 'complete') whenIdle();
  else window.addEventListener('load', whenIdle, { once: true });

  return () => {
    alive = false;
    clearTimeout(timer);
    cancelAnimationFrame(raf);
    io.disconnect();
    gateWatch.disconnect();
    document.removeEventListener('visibilitychange', sync);
    v.pause();
    v.removeAttribute('src');
    v.load();
    v.remove();
  };
}
