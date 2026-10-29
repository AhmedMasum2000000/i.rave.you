import { ARTISTS, NEXT_RELEASE, type Artist } from './data';
import { asset, esc } from './ui';

/** Route links resolve from the site root, so the menu works on nested pages too. */
const route = (path: string): string => `${document.documentElement.dataset.root ?? ''}${path}`;

/**
 * Site-wide chrome: a "MENU" button that opens a full-screen index, and the
 * live countdown to "Down In Bossa" wherever `[data-cd]` digits appear (the
 * menu and the player bar's listen pill).
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

/** "in 3 days", "tomorrow", "today" or "out now", for news lines. */
export function releaseIn(): string {
  const ms = RELEASE_AT - Date.now();
  if (ms <= 0) return 'out now';
  const days = Math.ceil(ms / 864e5);
  return days > 1 ? `in ${days} days` : ms < 864e5 && new Date(RELEASE_AT).getDate() === new Date().getDate() ? 'today' : 'tomorrow';
}

function tick(): void {
  const r = remaining();
  const when = releaseIn();
  document.querySelectorAll<HTMLElement>('[data-days]').forEach((el) => {
    if (el.textContent !== when) el.textContent = when;
  });
  document.querySelectorAll<HTMLElement>('[data-cd]').forEach((el) => {
    el.textContent = two(r[el.dataset.cd as 'd' | 'h' | 'm' | 's']);
  });
  if (r.out) {
    document.body.classList.add('released');
    document.querySelectorAll<HTMLElement>('[data-presave-label]').forEach((el) => (el.textContent = 'Listen now'));
  }
}

/** One menu row: a big title, and a "+" that opens its small list of links. */
const row = (n: number, title: string, href: string, subs: [string, string][], cls = ''): string => `
  <li class="m-row ${cls}" style="--i:${n}">
    <div class="m-head">
      <span class="m-num mono">${String(n + 1).padStart(2, '0')}</span>
      <a class="m-big" href="${href}" data-close>${title}</a>
      ${subs.length ? `<button type="button" class="m-plus" aria-expanded="false" aria-controls="m-sub-${n}" aria-label="More under ${title.replace(/<[^>]+>/g, '')}">+</button>` : ''}
    </div>
    ${subs.length ? `<div class="m-sub" id="m-sub-${n}"><ul>${subs.map(([label, to]) => `<li><a href="${to}"${to.startsWith('http') ? ' target="_blank" rel="noopener"' : ' data-close'}>${label}</a></li>`).join('')}</ul></div>` : ''}
  </li>`;

const artistSubs = (a: Artist): [string, string][] => [
  ['Releases', route(`${a.id}/listen/`)],
  ['Sequencer', route(`${a.id}/sequencer/`)],
  ['About', route(`${a.id}/about/`)],
  ...(a.id === 'acnd' ? ([['Press kit', route('acnd/press/')]] as [string, string][]) : []),
];

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
  const band = `I RAVE YOU ◐ ACND ◐ <span class="bn">অপূর্ব</span> ◐ QBIC PULSE ◐ `;
  menu.innerHTML = `
    <div class="m-band" aria-hidden="true"><span class="m-band-run">${band.repeat(8)}</span></div>
    <div class="m-inner">
      <nav class="m-nav" aria-label="Site">
        <ol class="m-list">
          ${row(0, 'Home', route(''), [
            ['Feature: Beyond the Capital', route('frequency-unity/')],
            ['Qbic Pulse tracklist', route('mixes/qbic-pulse/')],
            ['Down In Bossa', route('music/down-in-bossa/')],
          ])}
          ${row(1, `<span class="bn">${esc(ARTISTS.apurba.name)}</span>`, route('apurba/'), artistSubs(ARTISTS.apurba), 'm-apurba')}
          ${row(2, esc(ARTISTS.acnd.name), route('acnd/'), artistSubs(ARTISTS.acnd), 'm-acnd')}
          ${row(3, 'Journal', route('journal/'), [])}
          ${row(4, 'Legal', route('legal/terms/'), [
            ['Terms of use', route('legal/terms/')],
            ['Privacy notice', route('legal/privacy/')],
            ['Copyright contact', route('legal/copyright/')],
          ])}
        </ol>
      </nav>
      <aside class="m-release">
        <span class="m-k mono">Out now · ${esc(NEXT_RELEASE.genre)}</span>
        <img src="${asset(NEXT_RELEASE.cover.replace(/\.jpg$/, '.webp'))}" alt="${esc(NEXT_RELEASE.title)} cover art" loading="lazy" width="120" height="120" />
        <b>${esc(NEXT_RELEASE.title)}</b>
        <span class="m-r-sub">${esc(NEXT_RELEASE.artist)} · ${esc(NEXT_RELEASE.label)}</span>
        <a class="m-r-link mono" href="${NEXT_RELEASE.presave}" target="_blank" rel="noopener"><span data-presave-label>Listen now</span> ↗</a>
        <p class="m-credit mono">Site by <a href="${route('acnd/')}" data-close>ACND</a></p>
      </aside>
    </div>`;

  // "+" opens one row's small list at a time, like an accordion.
  menu.addEventListener('click', (e) => {
    const plus = (e.target as HTMLElement).closest<HTMLButtonElement>('.m-plus');
    if (!plus) return;
    const open = plus.getAttribute('aria-expanded') !== 'true';
    menu.querySelectorAll<HTMLButtonElement>('.m-plus').forEach((b) => {
      const on = b === plus && open;
      b.setAttribute('aria-expanded', String(on));
      b.closest('.m-row')!.classList.toggle('m-open', on);
    });
  });

  const set = (open: boolean): void => {
    if (open) document.querySelector<HTMLButtonElement>('.tid-close')?.click();
    document.body.classList.toggle('menu-open', open);
    menu.inert = !open;
    menu.setAttribute('aria-hidden', String(!open));
    const app = document.getElementById('app');
    if (app) app.inert = open;
    btn.setAttribute('aria-expanded', String(open));
    btn.querySelector('.menu-word')!.textContent = open ? 'Close' : 'Menu';
    if (!open)
      menu.querySelectorAll('.m-open').forEach((r) => {
        r.classList.remove('m-open');
        r.querySelector('.m-plus')?.setAttribute('aria-expanded', 'false');
      });
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
  window.addEventListener('routechange', () => set(false));

  document.body.append(menu, btn);
  tick();
  setInterval(tick, 1000);
}
