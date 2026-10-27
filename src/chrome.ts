import { ARTISTS, NEXT_RELEASE, type Artist } from './data';
import { asset, esc } from './ui';

/**
 * Site-wide chrome: a "MENU" button that opens a full-screen index, and a
 * pre-save dock with a live countdown to "Down In Bossa" — boxed digits beside
 * a solid call to action, bottom right on every page.
 */

const RELEASE_AT = new Date(NEXT_RELEASE.date).getTime();

interface Left {
  d: number;
  h: number;
  m: number;
  s: number;
  out: boolean;
}

const remaining = (): Left => {
  const ms = Math.max(0, RELEASE_AT - Date.now());
  return {
    d: Math.floor(ms / 864e5),
    h: Math.floor(ms / 36e5) % 24,
    m: Math.floor(ms / 6e4) % 60,
    s: Math.floor(ms / 1e3) % 60,
    out: ms === 0,
  };
};

const two = (n: number): string => String(n).padStart(2, '0');

const clock = (): string => `
  <span class="cd" aria-live="off">
    <span><b data-cd="d">00</b><i>D</i></span>
    <span><b data-cd="h">00</b><i>H</i></span>
    <span><b data-cd="m">00</b><i>M</i></span>
    <span><b data-cd="s">00</b><i>S</i></span>
  </span>`;

function tick(): void {
  const r = remaining();
  document.querySelectorAll<HTMLElement>('[data-cd]').forEach((el) => {
    el.textContent = two(r[el.dataset.cd as 'd' | 'h' | 'm' | 's']);
  });
  if (r.out) {
    document.body.classList.add('released');
    document.querySelectorAll<HTMLElement>('[data-presave-label]').forEach((el) => (el.textContent = 'Listen now'));
  }
}

const artistLinks = (a: Artist): string => `
  <li class="m-artist m-${a.id}">
    <a class="m-big ${a.id === 'apurba' ? 'bn' : ''}" href="#/${a.id}" data-close>${esc(a.name)}</a>
    <span class="m-sub mono">
      <a href="#/${a.id}/listen" data-close>Listen</a>
      <a href="#/${a.id}/sequencer" data-close>Sequencer</a>
      <a href="#/${a.id}/about" data-close>About</a>
    </span>
  </li>`;

export function mountChrome(): void {
  // ── menu ──
  const btn = document.createElement('button');
  btn.className = 'menu-btn';
  btn.setAttribute('aria-expanded', 'false');
  btn.setAttribute('aria-controls', 'menu');
  btn.innerHTML = `<span class="menu-icon" aria-hidden="true"><i></i><i></i></span><span class="menu-word">Menu</span>`;

  const menu = document.createElement('div');
  menu.id = 'menu';
  menu.className = 'menu';
  menu.setAttribute('role', 'dialog');
  menu.setAttribute('aria-modal', 'true');
  menu.setAttribute('aria-label', 'Site menu');
  menu.innerHTML = `
    <div class="m-inner">
      <ol class="m-list">
        <li><a class="m-big" href="#/" data-close>I Rave You</a><span class="m-sub mono">Home · ◐</span></li>
        ${artistLinks(ARTISTS.apurba)}
        ${artistLinks(ARTISTS.acnd)}
      </ol>
      <aside class="m-release">
        <span class="mono">● Next release · ${esc(NEXT_RELEASE.genre)}</span>
        <img src="${asset(NEXT_RELEASE.cover)}" alt="${esc(NEXT_RELEASE.title)} cover art" loading="lazy" />
        <b>${esc(NEXT_RELEASE.title)}</b>
        <span>${esc(NEXT_RELEASE.artist)} · ${esc(NEXT_RELEASE.label)}</span>
        ${clock()}
        <a class="m-presave" href="${NEXT_RELEASE.presave}" target="_blank" rel="noopener"><span data-presave-label>Pre-save now</span><span>→</span></a>
        <a class="m-page mono" href="${NEXT_RELEASE.page}" target="_blank" rel="noopener">Release page ↗</a>
      </aside>
    </div>`;

  const set = (open: boolean): void => {
    document.body.classList.toggle('menu-open', open);
    btn.setAttribute('aria-expanded', String(open));
    btn.querySelector('.menu-word')!.textContent = open ? 'Close' : 'Menu';
    if (open) menu.querySelector<HTMLElement>('a')?.focus({ preventScroll: true });
  };
  btn.addEventListener('click', () => set(!document.body.classList.contains('menu-open')));
  menu.addEventListener('click', (e) => {
    if ((e.target as HTMLElement).closest('[data-close]')) set(false);
  });
  window.addEventListener('keydown', (e) => e.key === 'Escape' && set(false));
  window.addEventListener('hashchange', () => set(false));

  // ── pre-save dock ──
  const dock = document.createElement('div');
  dock.className = 'presave';
  dock.innerHTML = `
    <a class="presave-clock" href="${NEXT_RELEASE.page}" target="_blank" rel="noopener" title="${esc(NEXT_RELEASE.title)} — ${esc(NEXT_RELEASE.artist)}">${clock()}</a>
    <a class="presave-cta" href="${NEXT_RELEASE.presave}" target="_blank" rel="noopener"><span data-presave-label>Pre-save now</span><span class="presave-arrow">→</span></a>`;

  document.body.append(menu, btn, dock);
  tick();
  setInterval(tick, 1000);
}
