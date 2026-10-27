import { isPlaying, sample } from './audio';
import { reducedMotion } from './ui';

/**
 * Site-wide life: the mix drives a few CSS variables on the chrome that is on
 * every page (player chip, pre-save dock, menu button and anything marked
 * `data-pulse`), a soft cursor aura follows the pointer on desktop, and the
 * main calls to action lean towards the cursor.
 *
 * Everything runs off one requestAnimationFrame loop that sleeps while the tab
 * is hidden, writes only transforms and custom properties (no layout), and
 * switches itself off for reduced motion.
 */

const fine = (): boolean => matchMedia('(hover: hover) and (pointer: fine)').matches;

const MAGNETS = '.presave-cta, .np-play, .menu-btn, .side-cta, .vibe-yes, .a-hero-listen, .m-presave';

export function mountFx(): void {
  if (reducedMotion()) return;
  const desktop = fine();
  const root = document.documentElement;
  root.classList.add('fx');

  let targets: HTMLElement[] = [];
  const collect = (): void => {
    targets = [...document.querySelectorAll<HTMLElement>('.np, .presave, .menu-btn, [data-pulse]')];
  };
  collect();
  window.addEventListener('hashchange', () => requestAnimationFrame(collect));
  window.setInterval(collect, 1500);

  // ── cursor aura (desktop only) ──
  let aura: HTMLElement | null = null;
  let mx = -100;
  let my = -100;
  let ax = -100;
  let ay = -100;
  let hot = 0;
  let hotTarget = 0;
  if (desktop) {
    aura = document.createElement('div');
    aura.className = 'aura';
    aura.setAttribute('aria-hidden', 'true');
    document.body.append(aura);
    window.addEventListener(
      'pointermove',
      (e) => {
        mx = e.clientX;
        my = e.clientY;
        const el = e.target instanceof Element ? e.target.closest('a, button, summary, [role="slider"], .cell') : null;
        hotTarget = el ? 1 : 0;
      },
      { passive: true },
    );
    document.addEventListener('pointerleave', () => {
      mx = my = -100;
    });
    window.addEventListener('pointerdown', () => aura?.classList.add('aura-down'));
    window.addEventListener('pointerup', () => aura?.classList.remove('aura-down'));

    // ── magnetic calls to action ──
    document.addEventListener(
      'pointermove',
      (e) => {
        const el = e.target instanceof Element ? e.target.closest<HTMLElement>(MAGNETS) : null;
        document.querySelectorAll<HTMLElement>('[data-magnet-on]').forEach((m) => {
          if (m !== el) {
            m.style.translate = '';
            delete m.dataset.magnetOn;
          }
        });
        if (!el) return;
        const r = el.getBoundingClientRect();
        const dx = (e.clientX - (r.left + r.width / 2)) / r.width;
        const dy = (e.clientY - (r.top + r.height / 2)) / r.height;
        el.dataset.magnetOn = '';
        el.style.translate = `${(dx * 6).toFixed(1)}px ${(dy * 5).toFixed(1)}px`;
      },
      { passive: true },
    );
  }

  let last = 0;
  const gap = desktop ? 1000 / 60 : 1000 / 30;
  const loop = (now: number): void => {
    requestAnimationFrame(loop);
    if (document.hidden || now - last < gap) return;
    last = now;
    const lv = sample();
    const on = isPlaying();
    const beat = on ? lv.beat : lv.beat * 0.4;
    const low = Math.min(1, lv.low * 1.6);
    for (const el of targets) {
      el.style.setProperty('--lv-beat', beat.toFixed(3));
      el.style.setProperty('--lv-low', low.toFixed(3));
    }
    if (aura) {
      ax += (mx - ax) * 0.2;
      ay += (my - ay) * 0.2;
      hot += (hotTarget - hot) * 0.18;
      aura.style.transform = `translate3d(${ax.toFixed(1)}px, ${ay.toFixed(1)}px, 0) scale(${(1 + hot * 1.4 + beat * 0.25).toFixed(3)})`;
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
