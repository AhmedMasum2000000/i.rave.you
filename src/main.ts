import './style.css';
import { syncSearchMetadata } from './seo';
import { installGuard } from './guard';
import './artist.css';
import './mobile.css';
import './fx.css';
import './bar.css';
import './polish.css';
import './menu.css';
import { renderArtist, logo, type Page } from './artist';
import { mountChrome } from './chrome';
import { ARTISTS, NEXT_RELEASE, type ArtistId } from './data';
import { mountDuality, type DualityHandle } from './duality';
import { mountPlayer } from './player';
import { mountFx, transition } from './fx';
import { asset, autoplay, esc, mountGate, reducedMotion } from './ui';
import { ROOT, interceptLinks, link, parse, routeHref, upgradeLegacyHash } from './router';

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
      <a class="news" href="${link('music/down-in-bossa/')}">
        <b class="news-k">New</b>
        <span class="news-t"><strong>${esc(NEXT_RELEASE.title)}</strong> · ${esc(NEXT_RELEASE.artist)}</span>
        <span class="news-d">Out now</span>
        <span class="news-go">Details →</span>
      </a>
      <p class="home-cred mono"><span>Heard on</span> Hong Kong Community Radio <i>·</i> <span>Out on</span> Profi Music</p>

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

  // ── Sneak peek: hovering a half of the emblem opens a window into that world ──
  const peeks = {
    apurba: peekCard('apurba'),
    acnd: peekCard('acnd'),
  };
  app.querySelector('.home')!.append(peeks.apurba, peeks.acnd);
  const touch = matchMedia('(hover: none)').matches;
  if (touch) for (const id of ['apurba', 'acnd'] as const) peeks[id].querySelector('.peek-go')!.textContent = 'Tap again to enter →';
  fx.onPeek((side, at) => {
    for (const id of ['apurba', 'acnd'] as const) {
      const card = peeks[id];
      const on = id === side;
      card.classList.toggle('show', on);
      card.setAttribute('aria-hidden', String(!on));
      if (!on) continue;
      const gap = at.r * 1.45;
      card.dataset.at = at.wide ? (id === 'apurba' ? 'left' : 'right') : id === 'apurba' ? 'above' : 'below';
      card.style.left = `${at.wide ? at.x + (id === 'apurba' ? -gap : gap) : at.x}px`;
      card.style.top = `${at.wide ? at.y : at.y + (id === 'apurba' ? -gap : gap)}px`;
    }
    document.body.classList.toggle('peeking', !!side);
  });
  let pinned: ArtistId | null = null;

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
      // On touch, the first tap on the emblem opens the peek; a second enters.
      // A click on the emblem enters the world it is previewing, whichever
      // side panel lies underneath. On touch the first tap only opens the peek.
      const hit = fx.hit(e.clientX, e.clientY);
      if (touch && hit && !pinned) {
        pinned = hit;
        fx.peek(hit);
        return;
      }
      const dest = (hit ? pinned ?? hit : el.dataset.side) as ArtistId;
      pinned = null;
      fx.peek(null);
      document.body.classList.add('flooding');
      void fx.flood(dest, e.clientX || innerWidth / 2, e.clientY || innerHeight / 2).then(() => {
        document.body.classList.remove('flooding');
        navigate(routeHref(dest));
      });
    });
  });

}

/** The window into one artist's world shown beside the emblem. */
function peekCard(id: ArtistId): HTMLElement {
  const a = ARTISTS[id];
  const r = a.releases[0];
  const next = id === 'acnd';
  const el = document.createElement('aside');
  el.className = `peek peek-${id}`;
  el.setAttribute('aria-hidden', 'true');
  el.innerHTML = `
    <header class="peek-bar"><span class="${id === 'apurba' ? 'bn' : ''}">${esc(a.name)}</span><span>Sneak peek</span></header>
    <div class="peek-body">
      <img src="${asset(next ? NEXT_RELEASE.cover.replace(/\.jpg$/, '.webp') : r.cover ?? a.hero)}" alt="" width="84" height="84" />
      <div>
        <span class="peek-k">${next ? `Out now · ${esc(NEXT_RELEASE.genre)}` : `Latest release · ${r.year}`}</span>
        <b>${esc(next ? NEXT_RELEASE.title : r.title)}</b>
        <span class="peek-sub">${esc(next ? `${NEXT_RELEASE.artist} · ${NEXT_RELEASE.label}` : r.artists)}</span>
      </div>
    </div>
    <p class="peek-summary">${esc(a.about?.summary ?? a.bio[0])}</p>
    <footer class="peek-foot"><span>${esc(a.origin)}</span><span class="peek-go">Click to enter →</span></footer>`;
  return el;
}

/* ─────────────────────────────── BOOT ───────────────────────────────── */

route();
mountChrome();
mountPlayer();
mountFx();
// Only a first visit to the home page asks about sound; every other page
// simply starts the mix (or waits for the first tap if autoplay is blocked).
if (parse().artist || parse().doc) autoplay();
else void mountGate({
  kicker: 'অপূর্ব ◐ ACND',
  line: 'Qbic Pulse on Hong Kong Community Radio, hosted by ACND & অপূর্ব.',
  cta: 'Click to enter',
});
