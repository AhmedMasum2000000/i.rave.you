import { isPlaying, sample } from './audio';
import { reducedMotion } from './ui';

/**
 * The mix drives the page. One requestAnimationFrame loop reads the analyser
 * and writes a handful of CSS variables, 0..1, onto the chrome present on every
 * page (the player bar and its windows) and anything marked
 * `data-pulse`:
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
    targets = [...document.querySelectorAll<HTMLElement>('.fbar, .tid, .np-now, [data-pulse]')];
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
    // Two decimals is below what the eye can see; skip frames that change nothing.
    const key = `${low.toFixed(2)}|${beat.toFixed(2)}|${high.toFixed(2)}|${level.toFixed(2)}`;
    if (key === written) return;
    written = key;
    for (const el of targets) {
      el.style.setProperty('--lv-low', low.toFixed(2));
      el.style.setProperty('--lv-beat', beat.toFixed(2));
      el.style.setProperty('--lv-high', high.toFixed(2));
    }
    vu.style.transform = `scaleX(${level.toFixed(2)})`;
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
