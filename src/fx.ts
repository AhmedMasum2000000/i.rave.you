import { isPlaying, sample } from './audio';
import { reducedMotion } from './ui';

/**
 * The mix drives the page. One requestAnimationFrame loop reads the beat clock
 * and writes a handful of CSS variables, 0..1, onto the few small elements that
 * read them: the now-playing name, the feed's EQ, and the wordmark, names and
 * hero logo inside a `data-pulse` region. The variables inherit, so writing
 * them on a large container would restyle its whole subtree every frame:
 * they go on the leaves only, in steps of 1/25, at most 30 times a second.
 *
 *   --lv-low   low-end energy, smoothed: drives the weight of the Doto type and
 *              how brightly the doorway is lit
 *   --lv-beat  a decaying kick pulse: short accents only
 *   --lv-high  air and hats: fine detail
 *
 * A hairline at the top of every page shows the overall level. Paused, all of
 * it settles to rest. The loop sleeps while the tab is hidden and is off
 * entirely for reduced motion.
 */

export function mountFx(): void {
  if (reducedMotion()) return;
  document.documentElement.classList.add('fx');

  let targets: HTMLElement[] = [];
  const collect = (): void => {
    targets = [...document.querySelectorAll<HTMLElement>('.np-now, .f-eq[data-pulse], [data-pulse] :is(.brand, .side-name, .ah-mark)')];
  };
  collect();
  window.addEventListener('routechange', () => requestAnimationFrame(collect));
  window.setInterval(collect, 1500);

  const vu = document.createElement('div');
  vu.className = 'vu';
  vu.setAttribute('aria-hidden', 'true');
  document.body.append(vu);

  let low = 0;
  let level = 0;
  // Automatic gain: map the kick envelope onto the track's own recent range,
  // so a quiet breakdown and a full drop both move the page.
  let floor = 0.35;
  let ceil = 0.65;
  let last = 0;
  // 30 fps is plenty for light and type, and leaves the main thread to the page.
  const gap = 1000 / 30;
  let written = '';
  let vuAt = '';
  const loop = (now: number): void => {
    requestAnimationFrame(loop);
    if (document.hidden || now - last < gap) return;
    last = now;
    const lv = sample();
    const on = isPlaying();
    // Ease towards silence when paused instead of freezing mid-gesture.
    const raw = lv.kick;
    floor += (raw - floor) * (raw < floor ? 0.3 : 0.012);
    ceil += (raw - ceil) * (raw > ceil ? 0.3 : 0.012);
    const norm = Math.max(0, Math.min(1, (raw - floor) / Math.max(0.1, ceil - floor)));
    low += ((on ? norm : 0) - low) * 0.35;
    level += ((on ? Math.min(1, lv.all * 2.2) : 0) - level) * 0.3;
    const beat = on ? lv.beat : 0;
    const high = on ? Math.min(1, lv.high * 3) : 0;
    // Steps of 1/25 are below what the eye follows in light and weight; a frame
    // that lands on the same steps writes nothing and costs no style work.
    const q = (v: number): string => (Math.round(v * 25) / 25).toFixed(2);
    const L = q(low);
    const Bt = q(beat);
    const H = q(high);
    const V = q(level);
    const key = `${L}|${Bt}|${H}`;
    if (V !== vuAt) {
      vuAt = V;
      vu.style.transform = `scaleX(${V})`;
    }
    if (key === written) return;
    written = key;
    for (const el of targets) {
      el.style.setProperty('--lv-low', L);
      el.style.setProperty('--lv-beat', Bt);
      el.style.setProperty('--lv-high', H);
    }
  };
  requestAnimationFrame(loop);
}

/**
 * Swap route content inside a View Transition where the browser has one, so
 * pages dissolve into each other instead of cutting. Falls back to a plain swap.
 */
export function transition(swap: () => void): void {
  const doc = document as Document & { startViewTransition?: (cb: () => void) => unknown };
  if (!doc.startViewTransition || reducedMotion() || document.hidden) {
    swap();
    return;
  }
  doc.startViewTransition(swap);
}
