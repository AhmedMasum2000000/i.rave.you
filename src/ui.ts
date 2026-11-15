import { bufferedAhead, outsideTheClub, pause, prepare, start, walkIn } from './audio';

export const esc = (s: string): string =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

export { asset } from './paths';
import { asset } from './paths';

export const reducedMotion = (): boolean => matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * The entry gate. The record is half black, half white; clicking it is the
 * one interaction the browser needs before the mix may play out loud.
 */
/** Audio controls, separate from legal notices and privacy choices. */
const prompt = (): string => `
  <div class="vibe" role="group" aria-labelledby="vibe-title">
    <p class="vibe-kicker mono">Sound on your terms</p>
    <p class="vibe-title" id="vibe-title">One mix. Your volume.</p>
    <p class="vibe-body">But we do give some <b>sexy frequencies</b>. An hour of them, fresh from Hong Kong Community Radio.</p>
    <div class="vibe-actions">
      <button type="button" class="vibe-yes" data-enter>Enter with sound</button>
      <button type="button" class="vibe-yes vibe-alt" data-quiet>Browse quietly</button>
    </div>
    <p class="vibe-meter mono" aria-live="polite"><span class="vibe-bar"><i></i></span><span class="vibe-status">Warming up the decks…</span></p>
    <p class="vibe-fine">Audio controls only. ${legal('legal/privacy/', 'Privacy')} · ${legal('legal/terms/', 'Terms of use')} · ${legal('legal/copyright/', 'Rights contact')}</p>
  </div>`;

/**
 * The notices open in a new tab, so they can be read before choosing: the
 * shell behind the gate never navigates while the gate is up.
 */
const legal = (path: string, label: string): string =>
  `<a data-legal-link href="${asset(path)}" target="_blank" rel="noopener">${label}<span class="sr-only"> (opens in a new tab)</span></a>`;

/** Fill the meter from what the player has already buffered while the visitor reads. */
function meter(root: HTMLElement): () => void {
  // Let the page's own images and fonts load first, then connect Mixcloud's player.
  const warm = (): void => {
    void prepare().catch(() => {});
  };
  if (document.readyState === 'complete') warm();
  else window.addEventListener('load', warm, { once: true });
  const bar = root.querySelector<HTMLElement>('.vibe-bar i')!;
  const status = root.querySelector<HTMLElement>('.vibe-status')!;
  const id = window.setInterval(() => {
    const p = Math.min(1, bufferedAhead() / 30);
    bar.style.transform = `scaleX(${Math.max(0.04, p)})`;
    // Nothing plays while the gate is up; the line only reports the connection.
    status.textContent = p >= 1 ? 'Ready when you are. Choose sound or browse quietly.' : 'Connecting to Mixcloud… Sound is optional.';
    root.classList.toggle('vibe-ready', p >= 1);
  }, 200);
  return () => clearInterval(id);
}

/**
 * The entry gate. The record and sound button are the one click the
 * browser needs before the set may play out loud; the set has been buffering
 * since the page loaded, so playback starts at once.
 */
const ENTRY_KEY = 'iry:entry';

function rememberedEntry(): 'sound' | 'quiet' | null {
  try {
    const v = localStorage.getItem(ENTRY_KEY);
    return v === 'sound' || v === 'quiet' ? v : null;
  } catch {
    return null;
  }
}

/**
 * Only a visitor who chose sound before has the mix resume by itself. A first
 * visit that lands on any page but home stays silent until the play button is
 * pressed; someone who chose to browse quietly is left in silence.
 */
export function autoplay(): boolean {
  if (rememberedEntry() !== 'sound') return false;
  if (document.readyState === 'complete') start();
  else window.addEventListener('load', () => start(), { once: true });
  return true;
}

/** Escape, and mark only the Bengali runs, so screen readers voice them in Bangla and just those words change face. */
export const bn = (s: string): string => esc(s).replace(/[\u0980-\u09FF\u200C\u200D]+/g, (m) => `<span class="bn" lang="bn">${m}</span>`);

/**
 * Where a new view starts for keyboard and screen-reader users: its first
 * heading, else its main region. Focus moves without scrolling.
 */
export function focusView(root: ParentNode = document): void {
  const target = root.querySelector<HTMLElement>('h1') ?? root.querySelector<HTMLElement>('main, .doc-frame');
  if (!target) return;
  if (target.tabIndex < 0 && !target.matches('iframe')) target.tabIndex = -1;
  target.dataset.routeFocus = '';
  target.focus({ preventScroll: true });
}

let status: HTMLElement | null = null;
/** Say the new page's title once, politely, after a route change. */
export function announce(text: string): void {
  if (!status) {
    status = document.createElement('p');
    status.className = 'sr-only';
    status.setAttribute('role', 'status');
    status.setAttribute('aria-live', 'polite');
    document.body.append(status);
  }
  const el = status;
  el.textContent = '';
  window.setTimeout(() => (el.textContent = text), 60);
}

export function mountGate(opts: { kicker: string; line: string; /** Unused: the record now shares "Enter with sound". */ cta?: string }): Promise<void> {
  // Returning visitors are not asked again: sound resumes and quiet stays quiet.
  if (rememberedEntry()) {
    autoplay();
    return Promise.resolve();
  }
  return new Promise((resolve) => {
    const gate = document.createElement('div');
    gate.className = 'gate';
    gate.setAttribute('role', 'dialog');
    gate.setAttribute('aria-modal', 'true');
    gate.setAttribute('aria-labelledby', 'vibe-title');
    // The record is a larger target for "Enter with sound", for the pointer only.
    gate.innerHTML = `
      <button type="button" class="gate-record" data-enter tabindex="-1" aria-hidden="true">
        <span class="gate-sleeve">
          <span class="gate-sleeve-word">I RAVE YOU</span>
          <span class="gate-sleeve-sub">${bn('অপূর্ব ◐ ACND')}</span>
        </span>
        <span class="gate-disc"><span class="gate-disc-label">◐</span></span>
      </button>
      <p class="gate-kicker">${bn(opts.kicker)}</p>
      <p class="gate-line">${bn(opts.line)}</p>
      ${prompt()}
      <p class="gate-credit">Site by ACND</p>`;
    // Everything behind the gate is out of reach until the visitor chooses.
    const behind = [...document.body.children].filter((el): el is HTMLElement => el instanceof HTMLElement && !el.inert && el.tagName !== 'SCRIPT');
    behind.forEach((el) => (el.inert = true));
    document.body.append(gate);
    document.body.classList.add('gated');
    gate.querySelector<HTMLElement>('.vibe-yes[data-enter]')?.focus({ preventScroll: true });
    // Behind the door, the mix (if the browser lets it start) sounds as if from inside.
    outsideTheClub();
    const stop = meter(gate);
    let done = false;
    const enter = (quiet = false): void => {
      if (done) return;
      done = true;
      stop();
      try {
        localStorage.setItem(ENTRY_KEY, quiet ? 'quiet' : 'sound');
      } catch {
        /* private mode: the gate simply shows again next time */
      }
      document.body.classList.remove('gated');
      if (quiet) {
        walkIn(0);
        pause();
      } else {
        // Walking in: the sound opens up as the hero and its visualizer fade in.
        start();
        walkIn(2.4);
      }
      behind.forEach((el) => (el.inert = false));
      gate.classList.add('gate-out');
      gate.inert = true;
      focusView(document.getElementById('app') ?? document);
      setTimeout(() => gate.remove(), 1100);
      resolve();
    };
    gate.querySelectorAll('[data-enter]').forEach((b) => b.addEventListener('click', () => enter()));
    gate.querySelectorAll('[data-quiet]').forEach((b) => b.addEventListener('click', () => enter(true)));
  });
}

/** Reveal media and cards on scroll; keep reading text static and immediately visible. */
export function revealOnScroll(root: ParentNode): IntersectionObserver {
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) if (e.isIntersecting) e.target.classList.add('in');
    },
    // Start the reveal just before an element scrolls in, so nothing waits blank.
    { threshold: 0, rootMargin: '0px 0px 12% 0px' },
  );
  root.querySelectorAll('[data-reveal]').forEach((el) => io.observe(el));
  return io;
}

/**
 * Type out `[data-type]` copy as it scrolls into view, through its text nodes
 * only, so footnote markers and Bangla spans keep their markup. The block
 * keeps its final height while typing, so nothing below it moves.
 */
export function typewrite(root: ParentNode): () => void {
  const els = [...root.querySelectorAll<HTMLElement>('[data-type]')];
  if (reducedMotion() || !els.length) return () => undefined;
  const timers: number[] = [];
  const run = (el: HTMLElement): void => {
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    const nodes: { node: Text; full: string }[] = [];
    for (let n = walker.nextNode(); n; n = walker.nextNode()) nodes.push({ node: n as Text, full: n.textContent ?? '' });
    const total = nodes.reduce((sum, x) => sum + x.full.length, 0);
    if (!total) return;
    el.style.minHeight = `${el.offsetHeight}px`;
    nodes.forEach((x) => (x.node.textContent = ''));
    const caret = document.createElement('span');
    caret.className = 'tw-caret';
    caret.setAttribute('aria-hidden', 'true');
    el.append(caret);
    // Short lines type briskly; long paragraphs finish within ~2.4 s.
    const step = Math.max(8, Math.min(38, 2400 / total));
    let i = 0;
    let n = 0;
    const tick = (): void => {
      const chunk = step < 12 ? 2 : 1;
      for (let c = 0; c < chunk && n < nodes.length; c++) {
        const x = nodes[n];
        x.node.textContent = x.full.slice(0, ++i);
        if (i >= x.full.length) {
          n++;
          i = 0;
        }
      }
      if (n < nodes.length) timers.push(window.setTimeout(tick, step));
      else timers.push(window.setTimeout(() => {
        caret.remove();
        el.style.minHeight = '';
      }, 900));
    };
    tick();
  };
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        io.unobserve(e.target);
        run(e.target as HTMLElement);
      }
    },
    { threshold: 0.2 },
  );
  els.forEach((el) => io.observe(el));
  return () => {
    io.disconnect();
    timers.forEach(clearTimeout);
  };
}

/** Image that quietly falls back to a second source if the first is missing. */
const IMAGES = new Set(__IMAGES__);
export const exists = (src: string): boolean => !src.startsWith('img/') || IMAGES.has(src.slice(4));

/** The best available file for an image path: the photo if present, else its fallback. */
export const imgSrc = (src: string, fallback = ''): string => (exists(src) || !fallback ? src : fallback);

/**
 * Image with a WebP source where one was generated, the original as fallback,
 * lazy by default. `eager` is for images visible on arrival.
 */
export const img = (src: string, alt: string, cls = '', fallback = '', eager = false): string => {
  const file = imgSrc(src, fallback);
  const webp = file.replace(/\.(jpe?g|png)$/i, '.webp');
  const load = eager ? 'loading="eager"' : 'loading="lazy"';
  const tag = `<img class="${cls}" src="${asset(file)}" alt="${esc(alt)}" ${load} decoding="async" />`;
  return webp !== file && exists(webp) ? `<picture class="pic"><source srcset="${asset(webp)}" type="image/webp" />${tag}</picture>` : tag;
};
