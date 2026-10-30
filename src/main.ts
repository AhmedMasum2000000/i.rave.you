import './style.css';
import './system.css';
import { syncSearchMetadata } from './seo';
import { installGuard } from './guard';
import './artist.css';
import './mobile.css';
import './fx.css';
import './bar.css';
import './polish.css';
import './menu.css';
import './home.css';
import './nav.css';
import { renderArtist, logo, type Page } from './artist';
import { mountChrome } from './chrome';
import { ARTISTS, CURRENT, NEXT_RELEASE, type ArtistId } from './data';
import { playSet } from './audio';
import { mountDuality, type DualityHandle } from './duality';
import { mountPlayer } from './player';
import { mountFx, transition } from './fx';
import { asset, autoplay, esc, mountGate, reducedMotion } from './ui';
import { ROOT, interceptLinks, link, parse, routeHref, upgradeLegacyHash } from './router';
import { entry, initHistory, push, rememberScroll, restoreScroll, stamp } from './history';
import { mountBack } from './back';

// Assets resolve from the site root whatever route the visitor landed on.
document.documentElement.dataset.root = ROOT;
document.documentElement.classList.add('k-js');
upgradeLegacyHash();
initHistory();

installGuard();

const app = document.getElementById('app')!;
let cleanup: (() => void)[] = [];

const teardown = (): void => {
  cleanup.forEach((fn) => fn());
  cleanup = [];
};

/* ─────────────────────────────── ROUTER ─────────────────────────────── */

/**
 * `/acnd/`, `/acnd/listen/`, `/apurba/about/`… anything else is the duality
 * home. A new page opens at the top; Back and Forward (`restore`) reopen a
 * page where the visitor left it.
 */
const route = (restore = false): void => {
  const { artist, page, doc } = parse();
  const { y, fy } = restore ? entry() : { y: 0, fy: 0 };
  // Moving between content pages reuses the open frame.
  if (doc && showDoc(doc, fy)) return void window.dispatchEvent(new Event('routechange'));
  teardown();
  window.scrollTo({ top: 0, behavior: 'instant' });
  if (doc) cleanup.push(renderDoc(doc, fy));
  else if (artist) cleanup.push(renderArtist(app, ARTISTS[artist], page as Page));
  else renderHome();
  if (!doc) syncSearchMetadata(artist as ArtistId | undefined);
  if (y) restoreScroll(y);
  window.dispatchEvent(new Event('routechange'));
};

/** The content frame's own scroll position, when one is open. */
const frameY = (): number => {
  try {
    return Math.round(frame?.contentWindow?.scrollY ?? 0);
  } catch {
    return 0;
  }
};
const saveSoon = rememberScroll(() => ({ y: Math.round(scrollY), fy: frameY() }));

/** Move to another view without reloading, so the mix plays on uninterrupted. */
export function navigate(path: string): void {
  if (path === location.pathname + location.hash) return;
  stamp({ y: Math.round(scrollY), fy: frameY() });
  push(path);
  transition(() => route());
}

// Later navigations dissolve between pages; the first render is immediate.
window.addEventListener('popstate', () => transition(() => route(true)));
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
/** Where to put the frame's next page, when it reopens one the visitor came back to. */
let pendingFrameY = 0;

const framePath = (f: HTMLIFrameElement): string => {
  try {
    const l = f.contentWindow!.location;
    return l.pathname + l.hash;
  } catch {
    return '';
  }
};

function renderDoc(path: string, y = 0): () => void {
  pendingFrameY = y;
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
    // "Play this set" buttons on the radio pages put that set on air, here.
    const mark = (): void =>
      d.querySelectorAll<HTMLElement>('[data-play-set]').forEach((b) => {
        const on = b.dataset.playSet === CURRENT.slug;
        b.dataset.label ??= b.textContent ?? 'Play this set';
        b.classList.toggle('on-air', on);
        b.textContent = on ? 'On air · playing' : b.dataset.label;
      });
    d.addEventListener('click', (e) => {
      const b = (e.target as Element | null)?.closest?.<HTMLElement>('[data-play-set]');
      if (!b?.dataset.playSet) return;
      e.preventDefault();
      e.stopImmediatePropagation();
      playSet(b.dataset.playSet);
      mark();
    }, true);
    mark();
    interceptLinks(navigate, d);
    // Back into a page read earlier: pick up where it was left.
    const win = f.contentWindow!;
    if (pendingFrameY) restoreScroll(pendingFrameY, win);
    pendingFrameY = 0;
    win.addEventListener('scroll', saveSoon, { passive: true });
    // A navigation the shell didn't route (a form, a typed URL): follow it.
    const at = framePath(f);
    if (at && at !== location.pathname + location.hash) stamp({}, at);
    window.dispatchEvent(new Event('routechange'));
  });
  return () => {
    frame = null;
  };
}

/** Point the open frame at another page without adding a history entry. */
function showDoc(path: string, y = 0): boolean {
  if (!frame?.contentWindow) return false;
  if (framePath(frame) !== path) {
    pendingFrameY = y;
    frame.contentWindow.location.replace(path);
  } else restoreScroll(y, frame.contentWindow);
  return true;
}

/* ──────────────────────────────── HOME ──────────────────────────────── */

function renderHome(): void {
  document.body.dataset.view = 'home';
  delete document.body.dataset.artist;
  delete document.body.dataset.lean;
  document.title = 'I Rave You — ACND & অপূর্ব | Electronic Music Bangladesh';
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

      <a class="side side-dark" href="${routeHref('apurba')}" data-side="apurba">
        ${logo(A, 'side-logo')}
        <span class="side-name bn">${esc(A.name)}</span>
        <span class="side-cta mono">Enter →</span>
      </a>

      <a class="side side-light" href="${routeHref('acnd')}" data-side="acnd">
        ${logo(C, 'side-logo')}
        <span class="side-name">${esc(C.name)}</span>
        <span class="side-cta mono">← Enter</span>
      </a>

    </main>`;

  const canvas = app.querySelector<HTMLCanvasElement>('.home-canvas')!;
  const fx: DualityHandle = mountDuality(canvas, reducedMotion());
  cleanup.push(() => fx.destroy());
  // The feed's behaviour loads after the hero has painted.
  let stopFeed = (): void => {};
  let left = false;
  void import('./home').then((m) => {
    if (!left) stopFeed = m.mountFeed();
  });
  cleanup.push(() => {
    left = true;
    stopFeed();
  });

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

// A reload reopens the page where it was.
route(true);
mountChrome();
mountBack(navigate);
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
