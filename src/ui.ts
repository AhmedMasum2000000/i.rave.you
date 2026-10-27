import { duration, onTrack, sample, start, time } from './audio';
import { TRACKLIST, fmt } from './data';

export const esc = (s: string): string =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

export { asset } from './paths';
import { asset } from './paths';

export const reducedMotion = (): boolean => matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * The entry gate. The record is half black, half white; clicking it is the
 * one interaction the browser needs before the mix may play out loud.
 */
export function mountGate(opts: { kicker: string; line: string; cta: string }): Promise<void> {
  return new Promise((resolve) => {
    const gate = document.createElement('div');
    gate.className = 'gate';
    gate.innerHTML = `
      <button class="gate-record" aria-label="${esc(opts.cta)}">
        <span class="gate-sleeve">
          <span class="gate-sleeve-word">I RAVE YOU</span>
          <span class="gate-sleeve-sub">অপূর্ব ◐ ACND</span>
        </span>
        <span class="gate-disc"><span class="gate-disc-label">◐</span></span>
      </button>
      <p class="gate-kicker">${esc(opts.kicker)}</p>
      <p class="gate-line">${esc(opts.line)}</p>
      <p class="gate-cta">${esc(opts.cta)}</p>`;
    document.body.append(gate);
    const enter = (): void => {
      start();
      gate.classList.add('gate-out');
      setTimeout(() => gate.remove(), 1100);
      resolve();
    };
    gate.querySelector('button')!.addEventListener('click', enter, { once: true });
    gate.addEventListener('keydown', (e) => e.key === 'Enter' && enter());
  });
}

/**
 * The always-on "now playing" chip — shows the track ID and links to it,
 * but deliberately offers no transport controls.
 */
export function mountNowPlaying(): void {
  const np = document.createElement('a');
  np.className = 'np';
  np.target = '_blank';
  np.rel = 'noopener';
  np.innerHTML = `
    <span class="np-eq" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></span>
    <span class="np-text"><span class="np-k">NOW · <b class="np-n">01</b>/${TRACKLIST.length}</span><span class="np-t">I RAVE YOU — Duality Mix</span></span>
    <span class="np-time">00:00</span>
    <span class="np-bar"><span></span></span>`;
  document.body.append(np);
  const title = np.querySelector<HTMLElement>('.np-t')!;
  const num = np.querySelector<HTMLElement>('.np-n')!;
  const tm = np.querySelector<HTMLElement>('.np-time')!;
  const bar = np.querySelector<HTMLElement>('.np-bar span')!;
  const eq = [...np.querySelectorAll<HTMLElement>('.np-eq i')];

  onTrack((t, i) => {
    np.href = t.url;
    num.textContent = String(i + 1).padStart(2, '0');
    title.textContent = `${t.artist} — ${t.title}`;
    title.classList.remove('np-swap');
    void title.offsetWidth;
    title.classList.add('np-swap');
    np.title = `Open “${t.title}” in a new tab`;
  });

  const loop = (): void => {
    const lv = sample();
    tm.textContent = fmt(time());
    bar.style.transform = `scaleX(${time() / duration()})`;
    const v = [lv.low, lv.mid, lv.high, lv.mid * 0.8, lv.low * 0.7];
    eq.forEach((e, k) => (e.style.transform = `scaleY(${0.15 + Math.min(1, v[k] * 2.2)})`));
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
}

/** Reveal anything with [data-reveal] as it scrolls in; words light up one by one. */
export function revealOnScroll(root: ParentNode): IntersectionObserver {
  // Wrap each word in place so footnote <sup>s and normal spacing survive.
  root.querySelectorAll<HTMLElement>('[data-words]').forEach((el) => {
    let i = 0;
    for (const node of [...el.childNodes]) {
      if (node.nodeType !== Node.TEXT_NODE) {
        (node as HTMLElement).style?.setProperty('--i', String(i++));
        (node as HTMLElement).classList?.add('w');
        continue;
      }
      const frag = document.createDocumentFragment();
      for (const part of (node.textContent ?? '').split(/(\s+)/)) {
        if (!part) continue;
        if (/^\s+$/.test(part)) {
          frag.append(part);
        } else {
          const span = document.createElement('span');
          span.className = 'w';
          span.style.setProperty('--i', String(i++));
          span.textContent = part;
          frag.append(span);
        }
      }
      node.replaceWith(frag);
    }
  });
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) if (e.isIntersecting) e.target.classList.add('in');
    },
    { threshold: 0.18 },
  );
  root.querySelectorAll('[data-reveal], [data-words]').forEach((el) => io.observe(el));
  return io;
}

/** Image that quietly falls back to a second source if the first is missing. */
export const img = (src: string, alt: string, cls = '', fallback = ''): string =>
  `<img class="${cls}" src="${asset(src)}" alt="${esc(alt)}" loading="lazy" decoding="async"${
    fallback ? ` onerror="this.onerror=null;this.src='${asset(fallback)}'"` : ''
  } />`;
