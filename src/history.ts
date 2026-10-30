import { ROOT } from './router';

/**
 * What each history entry remembers: how far into this visit it is (so Back
 * knows whether there is a page of ours behind it) and where the visitor had
 * scrolled, on the page and inside the content frame. Going back returns to
 * that spot instead of the top of the page.
 */
export interface Entry {
  idx: number;
  y: number;
  fy: number;
}

export const entry = (): Entry => {
  const s = history.state as Partial<Entry> | null;
  return { idx: typeof s?.idx === 'number' ? s.idx : 0, y: s?.y ?? 0, fy: s?.fy ?? 0 };
};

/** Pages of ours behind the current one in this tab. */
export const depth = (): number => entry().idx;

/** Merge into the current entry, keeping whatever else it holds. */
export const stamp = (patch: Partial<Entry>, url?: string): void =>
  history.replaceState({ ...entry(), ...patch }, '', url);

export const push = (url: string): void => history.pushState({ idx: depth() + 1, y: 0, fy: 0 }, '', url);

/** Start of a visit: the browser restores nothing on its own, we do. */
export function initHistory(): void {
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  stamp({});
}

/**
 * Scroll positions are saved once scrolling settles; browsers rate-limit
 * replaceState, so not on every frame.
 */
export function rememberScroll(read: () => { y: number; fy: number }): () => void {
  let t = 0;
  const save = (): void => {
    clearTimeout(t);
    stamp(read());
  };
  const later = (): void => {
    clearTimeout(t);
    t = window.setTimeout(save, 180);
  };
  addEventListener('scroll', later, { passive: true });
  addEventListener('pagehide', save);
  return later;
}

/**
 * Scroll back to `y` once the page is tall enough to hold it: the home feed
 * can still be arriving, and below-the-fold sections skip layout until shown
 * (html.restoring lifts that while we measure). Gives up if the visitor
 * scrolls first.
 */
export function restoreScroll(y: number, win: Window = window): void {
  const root = win.document.documentElement;
  if (y <= 0) return void win.scrollTo({ top: 0, behavior: 'instant' });
  root.classList.add('restoring');
  let tries = 0;
  let done = false;
  const stop = (): void => {
    if (done) return;
    done = true;
    win.removeEventListener('wheel', stop);
    win.removeEventListener('touchstart', stop);
    win.removeEventListener('keydown', stop);
    win.removeEventListener('feedready', go);
    win.requestAnimationFrame(() => root.classList.remove('restoring'));
  };
  function go(): void {
    if (done) return;
    win.scrollTo({ top: y, behavior: 'instant' });
    if (Math.abs(win.scrollY - y) > 2 && tries++ < 40) return void win.setTimeout(go, 50);
    stop();
  }
  win.addEventListener('wheel', stop, { passive: true });
  win.addEventListener('touchstart', stop, { passive: true });
  win.addEventListener('keydown', stop);
  win.addEventListener('feedready', go);
  win.requestAnimationFrame(go);
}

/** Where Back leads when there is no page of ours behind this one. */
export function parentOf(pathname: string): string {
  const rest = pathname.slice(ROOT.length).replace(/index\.html$/, '');
  const up = rest.replace(/[^/]+\/$/, '');
  if (/^mixes\/./.test(rest)) return `${ROOT}radio/`;
  if (/^(?:acnd|apurba)\/$|^journal\/$|^radio\/$/.test(up) || up === '') return ROOT + up;
  return ROOT;
}
