import { ARTISTS, NEXT_RELEASE, type Artist } from './data';
import { asset, esc } from './ui';

/** Route links resolve from the site root, so the menu works on nested pages too. */
const route = (hash: string): string => `${document.documentElement.dataset.root ?? ''}${hash}`;

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
    <a class="m-big ${a.id === 'apurba' ? 'bn' : ''}" href="${route(`#/${a.id}`)}" data-close>${esc(a.name)}</a>
    <span class="m-sub mono">
      <a href="${route(`${a.id}/`)}">Artist profile ↗</a>
      <a href="${route(`#/${a.id}/listen`)}" data-close>Releases</a>
      <a href="${route(`#/${a.id}/sequencer`)}" data-close>Sequencer</a>
      <a href="${route(`#/${a.id}/about`)}" data-close>About</a>
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
  menu.setAttribute('aria-hidden', 'true');
  menu.inert = true;
  menu.innerHTML = `
    <div class="m-inner">
      <ol class="m-list">
        <li><a class="m-big" href="${route('#/')}" data-close>I Rave You</a><span class="m-sub mono">Home · ◐ <a href="${route('frequency-unity/')}" data-close>Feature: Beyond the Capital</a> · <a href="${route('mixes/qbic-pulse/')}">Mix tracklist</a> · <a href="${route('music/down-in-bossa/')}">Down In Bossa</a></span></li>
        <li class="m-legal-item">
          <details class="m-legal" open>
            <summary>Legal &amp; site information <span aria-hidden="true">⌄</span></summary>
            <nav class="m-legal-links" aria-label="Legal submenu">
              <a class="m-legal-primary" href="${route('legal/terms/')}"><strong>Terms of use ↗</strong><span>Website rules and content rights</span></a>
              <a href="${route('legal/privacy/')}"><strong>Privacy notice ↗</strong><span>Storage, audio choices and your data</span></a>
              <a href="${route('legal/copyright/')}"><strong>Copyright &amp; takedown contact ↗</strong><span>Report a rights or credit concern</span></a>
            </nav>
          </details>
        </li>
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
        <p class="credit">Site by <a href="${route('#/acnd')}" data-close>ACND</a></p>
      </aside>
    </div>`;

  const set = (open: boolean): void => {
    if (open) document.querySelector<HTMLButtonElement>('.tid-close')?.click();
    document.body.classList.toggle('menu-open', open);
    menu.inert = !open;
    menu.setAttribute('aria-hidden', String(!open));
    const app = document.getElementById('app');
    if (app) app.inert = open;
    btn.setAttribute('aria-expanded', String(open));
    btn.querySelector('.menu-word')!.textContent = open ? 'Close' : 'Menu';
    if (open) menu.querySelector<HTMLElement>('a')?.focus({ preventScroll: true });
    else if (menu.contains(document.activeElement)) btn.focus({ preventScroll: true });
  };
  btn.addEventListener('click', () => set(!document.body.classList.contains('menu-open')));
  menu.addEventListener('click', (e) => {
    if ((e.target as HTMLElement).closest('[data-close]')) set(false);
  });
  window.addEventListener('keydown', (e) => {
    if (!document.body.classList.contains('menu-open')) return;
    if (e.key === 'Escape') set(false);
    if (e.key !== 'Tab') return;
    const controls = [btn, ...Array.from(menu.querySelectorAll<HTMLElement>('summary, a[href], button:not(:disabled)')).filter((control) => control.getClientRects().length > 0)];
    const index = controls.indexOf(document.activeElement as HTMLElement);
    const next = (index + (e.shiftKey ? -1 : 1) + controls.length) % controls.length;
    e.preventDefault();
    controls[next].focus();
  });
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
