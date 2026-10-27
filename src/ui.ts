import { bufferedAhead, isPlaying, prepare, start } from './audio';

export const esc = (s: string): string =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

export { asset } from './paths';
import { asset } from './paths';

export const reducedMotion = (): boolean => matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * The entry gate. The record is half black, half white; clicking it is the
 * one interaction the browser needs before the mix may play out loud.
 */
/** The cookie-banner joke: two buttons, both yes. */
const prompt = (): string => `
  <div class="vibe" role="group" aria-labelledby="vibe-title">
    <p class="vibe-kicker mono">Cookie policy</p>
    <p class="vibe-title" id="vibe-title">We don’t give cookies.</p>
    <p class="vibe-body">But we do give some <b>sexy frequencies</b>. Forty-five minutes of them, fresh from Hong Kong Community Radio.</p>
    <div class="vibe-actions">
      <button type="button" class="vibe-yes" data-enter>Yes, I love ’em</button>
      <button type="button" class="vibe-yes vibe-alt" data-enter>Yes, I want ’em</button>
    </div>
    <p class="vibe-meter mono" aria-live="polite"><span class="vibe-bar"><i></i></span><span class="vibe-status">Warming up the decks…</span></p>
    <p class="vibe-fine mono">There is no “no”. That’s the point.</p>
  </div>`;

/** Fill the meter from what the player has already buffered while the visitor reads. */
function meter(root: HTMLElement): () => void {
  prepare();
  start();
  const bar = root.querySelector<HTMLElement>('.vibe-bar i')!;
  const status = root.querySelector<HTMLElement>('.vibe-status')!;
  const id = window.setInterval(() => {
    const p = Math.min(1, bufferedAhead() / 30);
    bar.style.transform = `scaleX(${Math.max(0.04, p)})`;
    status.textContent = isPlaying() ? 'The mix is playing. Welcome in.' : p >= 1 ? 'Ready. Tap either Yes to start the mix.' : 'Buffering the mix… Tap Yes to start.';
    root.classList.toggle('vibe-ready', p >= 1);
  }, 200);
  return () => clearInterval(id);
}

/**
 * The entry gate. The record and both "yes" buttons are the one click the
 * browser needs before the set may play out loud; the set has been buffering
 * since the page loaded, so playback starts at once.
 */
export function mountGate(opts: { kicker: string; line: string; cta: string }): Promise<void> {
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
    const stop = meter(gate);
    let done = false;
    const enter = (): void => {
      if (done) return;
      done = true;
      stop();
      start();
      gate.classList.add('gate-out');
      setTimeout(() => gate.remove(), 1100);
      resolve();
    };
    gate.querySelectorAll('[data-enter]').forEach((b) => b.addEventListener('click', enter));
    gate.addEventListener('keydown', (e) => e.key === 'Enter' && enter());
  });
}

/** Non-blocking version for content pages: a banner that starts the set. */
export function mountVibeBanner(): void {
  const banner = document.createElement('div');
  banner.className = 'vibe-banner';
  banner.innerHTML = prompt();
  document.body.append(banner);
  const stop = meter(banner);
  banner.querySelectorAll('[data-enter]').forEach((b) =>
    b.addEventListener('click', () => {
      stop();
      start();
      banner.classList.add('vibe-out');
      setTimeout(() => banner.remove(), 600);
    }),
  );
}

/** Reveal media and cards on scroll; keep reading text static and immediately visible. */
export function revealOnScroll(root: ParentNode): IntersectionObserver {
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) if (e.isIntersecting) e.target.classList.add('in');
    },
    { threshold: 0.18 },
  );
  root.querySelectorAll('[data-reveal]').forEach((el) => io.observe(el));
  return io;
}

/** Image that quietly falls back to a second source if the first is missing. */
export const img = (src: string, alt: string, cls = '', fallback = ''): string =>
  `<img class="${cls}" src="${asset(src)}" alt="${esc(alt)}" loading="lazy" decoding="async"${
    fallback ? ` onerror="this.onerror=null;this.src='${asset(fallback)}'"` : ''
  } />`;
