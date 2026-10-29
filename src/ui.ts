import { bufferedAhead, isPlaying, pause, prepare, start } from './audio';

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
    <p class="vibe-body">But we do give some <b>sexy frequencies</b>. Forty-five minutes of them, fresh from Hong Kong Community Radio.</p>
    <div class="vibe-actions">
      <button type="button" class="vibe-yes" data-enter>Enter with sound</button>
      <button type="button" class="vibe-yes vibe-alt" data-quiet>Browse quietly</button>
    </div>
    <p class="vibe-meter mono" aria-live="polite"><span class="vibe-bar"><i></i></span><span class="vibe-status">Warming up the decks…</span></p>
    <p class="vibe-fine">Audio controls only. <a data-legal-link href="${asset('legal/privacy/')}">Privacy</a> · <a data-legal-link href="${asset('legal/terms/')}">Terms of use</a> · <a data-legal-link href="${asset('legal/copyright/')}">Rights contact</a></p>
  </div>`;

/** Fill the meter from what the player has already buffered while the visitor reads. */
function meter(root: HTMLElement): () => void {
  // Let the page's own images and fonts load first, then warm up the mix.
  const warm = (): void => {
    prepare();
    start();
  };
  if (document.readyState === 'complete') warm();
  else window.addEventListener('load', warm, { once: true });
  const bar = root.querySelector<HTMLElement>('.vibe-bar i')!;
  const status = root.querySelector<HTMLElement>('.vibe-status')!;
  const id = window.setInterval(() => {
    const p = Math.min(1, bufferedAhead() / 30);
    bar.style.transform = `scaleX(${Math.max(0.04, p)})`;
    status.textContent = isPlaying() ? 'The mix is playing. Welcome in.' : p >= 1 ? 'Ready. Choose sound or browse quietly.' : 'Buffering the mix… Sound is optional.';
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
 * The mix starts by itself on every page once the page has loaded. If the
 * browser blocks audible autoplay, the visitor's first tap or key starts it.
 * Only someone who chose to browse quietly is left in silence.
 */
export function autoplay(): boolean {
  if (rememberedEntry() === 'quiet') return false;
  if (document.readyState === 'complete') start();
  else window.addEventListener('load', () => start(), { once: true });
  return true;
}

export function mountGate(opts: { kicker: string; line: string; cta: string }): Promise<void> {
  // Returning visitors are not asked again: sound resumes and quiet stays quiet.
  if (rememberedEntry()) {
    autoplay();
    return Promise.resolve();
  }
  return new Promise((resolve) => {
    const gate = document.createElement('div');
    gate.className = 'gate';
    gate.innerHTML = `
      <button class="gate-record" data-enter aria-label="${esc(opts.cta)}">
        <span class="gate-sleeve">
          <span class="gate-sleeve-word">I RAVE YOU</span>
          <span class="gate-sleeve-sub">অপূর্ব ◐ ACND</span>
        </span>
        <span class="gate-disc"><span class="gate-disc-label">◐</span></span>
      </button>
      <p class="gate-kicker">${esc(opts.kicker)}</p>
      <p class="gate-line">${esc(opts.line)}</p>
      ${prompt()}
      <p class="gate-credit">Site by ACND</p>`;
    document.body.append(gate);
    document.body.classList.add('gated');
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
      if (quiet) pause();
      else start();
      gate.classList.add('gate-out');
      document.body.classList.remove('gated');
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
