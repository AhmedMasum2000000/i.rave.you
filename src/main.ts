import './style.css';
import { installGuard } from './guard';
import './artist.css';
import { renderArtist, logo, type Page } from './artist';
import { mountChrome } from './chrome';
import { ARTISTS, type ArtistId } from './data';
import { mountDuality, type DualityHandle } from './duality';
import { mountPlayer } from './player';
import { esc, mountGate, reducedMotion } from './ui';

installGuard();

const app = document.getElementById('app')!;
let cleanup: (() => void)[] = [];

const teardown = (): void => {
  cleanup.forEach((fn) => fn());
  cleanup = [];
};

/* ─────────────────────────────── ROUTER ─────────────────────────────── */

const PAGES: Page[] = ['home', 'listen', 'sequencer', 'about'];

/** `#/acnd`, `#/acnd/listen`, `#/apurba/about`… anything else is the duality home. */
const route = (): void => {
  const [id, sub] = location.hash.replace(/^#\/?/, '').split('/') as [ArtistId | '', string | undefined];
  teardown();
  window.scrollTo(0, 0);
  if (id === 'acnd' || id === 'apurba') {
    const page = (PAGES.includes(sub as Page) ? sub : 'home') as Page;
    cleanup.push(renderArtist(app, ARTISTS[id], page));
  } else renderHome();
};

window.addEventListener('hashchange', route);

/* ──────────────────────────────── HOME ──────────────────────────────── */

function renderHome(): void {
  document.body.dataset.view = 'home';
  delete document.body.dataset.artist;
  document.title = 'I RAVE YOU — অপূর্ব ◐ ACND';
  const A = ARTISTS.apurba;
  const C = ARTISTS.acnd;
  app.innerHTML = `
    <main class="home">
      <canvas class="home-canvas" aria-hidden="true"></canvas>
      <header class="home-top">
        <span class="brand">I Rave You</span>
      </header>

      <a class="side side-dark" href="#/apurba" data-side="apurba" aria-label="Enter অপূর্ব">
        ${logo(A, 'side-logo')}
        <span class="side-name bn">${esc(A.name)}</span>
        <span class="side-cta mono">Enter →</span>
      </a>

      <a class="side side-light" href="#/acnd" data-side="acnd" aria-label="Enter ACND">
        ${logo(C, 'side-logo')}
        <span class="side-name">${esc(C.name)}</span>
        <span class="side-cta mono">← Enter</span>
      </a>

    </main>`;

  const canvas = app.querySelector<HTMLCanvasElement>('.home-canvas')!;
  const fx: DualityHandle = mountDuality(canvas, reducedMotion());
  cleanup.push(() => fx.destroy());

  app.querySelectorAll<HTMLAnchorElement>('.side').forEach((el) => {
    const side = el.dataset.side === 'apurba' ? -1 : 1;
    el.addEventListener('pointerenter', () => {
      fx.lean(-side);
      document.body.dataset.lean = el.dataset.side;
    });
    el.addEventListener('pointerleave', () => {
      fx.lean(0);
      delete document.body.dataset.lean;
    });
    el.addEventListener('click', (e) => {
      e.preventDefault();
      document.body.classList.add('flooding');
      void fx.flood(el.dataset.side as ArtistId, e.clientX || innerWidth / 2, e.clientY || innerHeight / 2).then(() => {
        document.body.classList.remove('flooding');
        location.hash = `#/${el.dataset.side}`;
      });
    });
  });

}

/* ─────────────────────────────── BOOT ───────────────────────────────── */

route();
mountChrome();
mountPlayer();
void mountGate({
  kicker: 'অপূর্ব ◐ ACND',
  line: 'Qbic Pulse on Hong Kong Community Radio, hosted by ACND & অপূর্ব.',
  cta: 'Click to enter',
});
