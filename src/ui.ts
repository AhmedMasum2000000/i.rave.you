import { start } from './audio';

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
