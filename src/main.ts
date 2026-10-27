import './style.css';
import { syncSearchMetadata } from './seo';
import { installGuard } from './guard';
import './artist.css';
import './mobile.css';
import './fx.css';
import './bar.css';
import { renderArtist, logo, type Page } from './artist';
import { mountChrome } from './chrome';
import { ARTISTS, type ArtistId } from './data';
import { mountDuality, type DualityHandle } from './duality';
import { mountPlayer } from './player';
import { mountFx, transition } from './fx';
import { esc, mountGate, reducedMotion, resumeRemembered } from './ui';
import { ROOT, interceptLinks, parse, routeHref, upgradeLegacyHash } from './router';

// Assets resolve from the site root whatever route the visitor landed on.
document.documentElement.dataset.root = ROOT;
upgradeLegacyHash();

installGuard();

const app = document.getElementById('app')!;
let cleanup: (() => void)[] = [];

const teardown = (): void => {
  cleanup.forEach((fn) => fn());
  cleanup = [];
};

/* ─────────────────────────────── ROUTER ─────────────────────────────── */

/** `/acnd/`, `/acnd/listen/`, `/apurba/about/`… anything else is the duality home. */
const route = (): void => {
  const { artist, page, doc } = parse();
  // Moving between content pages reuses the open frame.
  if (doc && showDoc(doc)) return void window.dispatchEvent(new Event('routechange'));
  teardown();
  window.scrollTo({ top: 0, behavior: 'instant' });
  if (doc) cleanup.push(renderDoc(doc));
  else if (artist) cleanup.push(renderArtist(app, ARTISTS[artist], page as Page));
  else renderHome();
  if (!doc) syncSearchMetadata(artist as ArtistId | undefined);
  window.dispatchEvent(new Event('routechange'));
};

/** Move to another view without reloading, so the mix plays on uninterrupted. */
export function navigate(path: string): void {
  if (path === location.pathname + location.hash) return;
  history.pushState(null, '', path);
  transition(route);
}

// Later navigations dissolve between pages; the first render is immediate.
window.addEventListener('popstate', () => transition(route));
interceptLinks(navigate);

/* ─────────────────────────── CONTENT PAGES ──────────────────────────── */

/**
 * Journal, mix, release, legal and feature pages are complete static
 * documents (crawlable, script-free where it matters). Opened from the site,
 * they load in a full-screen frame inside this shell: the mix and the player
 * bar never reload, the address bar shows the page's own URL, and links inside
 * the page are routed back here.
 */
let frame: HTMLIFrameElement | null = null;

const framePath = (f: HTMLIFrameElement): string => {
  try {
    const l = f.contentWindow!.location;
    return l.pathname + l.hash;
  } catch {
    return '';
  }
};

function renderDoc(path: string): () => void {
  document.body.dataset.view = 'doc';
  delete document.body.dataset.artist;
  delete document.body.dataset.lean;
  app.innerHTML = `<iframe class="doc-frame" title="Page" src="${esc(path)}"></iframe>`;
  const f = app.querySelector<HTMLIFrameElement>('.doc-frame')!;
  frame = f;
  f.addEventListener('load', () => {
    const d = f.contentDocument;
    if (!d) return;
    d.documentElement.classList.add('in-shell');
    document.title = d.title || document.title;
    f.title = d.title || 'Page';
    interceptLinks(navigate, d);
    // A navigation the shell didn't route (a form, a typed URL): follow it.
    const at = framePath(f);
    if (at && at !== location.pathname + location.hash) history.replaceState(null, '', at);
    window.dispatchEvent(new Event('routechange'));
  });
  return () => {
    frame = null;
  };
}

/** Point the open frame at another page without adding a history entry. */
function showDoc(path: string): boolean {
  if (!frame?.contentWindow) return false;
  if (framePath(frame) !== path) frame.contentWindow.location.replace(path);
  return true;
}

/* ──────────────────────────────── HOME ──────────────────────────────── */

function renderHome(): void {
  document.body.dataset.view = 'home';
  delete document.body.dataset.artist;
  delete document.body.dataset.lean;
  document.title = 'I RAVE YOU — অপূর্ব ◐ ACND';
  const A = ARTISTS.apurba;
  const C = ARTISTS.acnd;
  app.innerHTML = `
    <main class="home" data-pulse>
      <canvas class="home-canvas" aria-hidden="true"></canvas>
      <header class="home-top">
        <span class="home-id">
          <span class="brand">I Rave You</span>
          <a class="credit home-credit" href="${routeHref('acnd')}">Site by ACND</a>
        </span>
      </header>

      <a class="side side-dark" href="${routeHref('apurba')}" data-side="apurba" aria-label="Enter অপূর্ব">
        ${logo(A, 'side-logo')}
        <span class="side-name bn">${esc(A.name)}</span>
        <span class="side-cta mono">Enter →</span>
      </a>

      <a class="side side-light" href="${routeHref('acnd')}" data-side="acnd" aria-label="Enter ACND">
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
    el.addEventListener('pointerenter', (e) => {
      if (e.pointerType === 'touch') return;
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
        navigate(routeHref(el.dataset.side as ArtistId));
      });
    });
  });

}

/* ─────────────────────────────── BOOT ───────────────────────────────── */

route();
mountChrome();
mountPlayer();
mountFx();
// Only a first visit to the home page asks about sound; every other page
// leaves the choice to the player bar's play button.
if (parse().artist || parse().doc) resumeRemembered();
else void mountGate({
  kicker: 'অপূর্ব ◐ ACND',
  line: 'Qbic Pulse on Hong Kong Community Radio, hosted by ACND & অপূর্ব.',
  cta: 'Click to enter',
});
