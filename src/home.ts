import { isPlaying, onState, playSet } from './audio';
import { CURRENT, onSetChange } from './data';
import { ROOT } from './router';
import { reducedMotion } from './ui';

/**
 * The home feed is static HTML built into index.html (scripts/home.mjs). This
 * module only brings it to life: filters, play buttons, the live "On air"
 * strip, reveals, tilt, the calendar countdown and the phone call to action.
 * Arriving on the home page from another route, the feed is fetched once from
 * index.html, so there is one source for it.
 */

let fetched: Promise<HTMLElement | null> | null = null;

async function ensureFeed(): Promise<HTMLElement | null> {
  const here = document.getElementById('home-feed');
  if (here) return here;
  fetched ??= fetch(`${ROOT}index.html`, { credentials: 'same-origin' })
    .then((r) => (r.ok ? r.text() : ''))
    .then((html) => {
      const el = new DOMParser().parseFromString(html, 'text/html').getElementById('home-feed');
      if (!el) return null;
      const node = document.importNode(el, true);
      document.getElementById('app')!.after(node);
      return node;
    })
    .catch(() => null);
  return fetched;
}

export function mountFeed(): () => void {
  const cleanup: (() => void)[] = [];
  let alive = true;
  // The markup is wanted at once (Back may be restoring a spot inside it);
  // its behaviour waits for an idle moment so the hero paints first.
  const idle = (fn: () => void): void => void ('requestIdleCallback' in window ? requestIdleCallback(fn, { timeout: 1500 }) : setTimeout(fn, 300));
  void ensureFeed().then((feed) => {
    if (!feed || !alive) return;
    window.dispatchEvent(new Event('feedready'));
    idle(() => {
      if (alive) cleanup.push(enhance(feed));
    });
  });
  return () => {
    alive = false;
    cleanup.forEach((fn) => fn());
  };
}

function enhance(feed: HTMLElement): () => void {
  const off: (() => void)[] = [];
  const still = reducedMotion();
  const root = document.documentElement;
  if (CSS.supports?.('animation-timeline: view()')) root.classList.add('sdt');

  /* ── reveals (fallback for browsers without view timelines) + live sections ── */
  const reveal = new IntersectionObserver(
    (entries) => {
      for (const e of entries)
        if (e.isIntersecting) {
          e.target.classList.add('in');
          reveal.unobserve(e.target);
        }
    },
    { rootMargin: '0px 0px 10% 0px' },
  );
  feed.querySelectorAll('[data-reveal]').forEach((el) => reveal.observe(el));
  const live = new IntersectionObserver(
    (entries) => {
      for (const e of entries) e.target.classList.toggle('live', e.isIntersecting);
    },
    { rootMargin: '15% 0px' },
  );
  feed.querySelectorAll(':scope > section, :scope > .mq').forEach((el) => live.observe(el));
  off.push(() => {
    reveal.disconnect();
    live.disconnect();
  });

  const onVis = (): void => void root.classList.toggle('tab-hidden', document.hidden);
  document.addEventListener('visibilitychange', onVis);
  off.push(() => document.removeEventListener('visibilitychange', onVis));

  /* ── catalogue filters ── */
  const chips = [...feed.querySelectorAll<HTMLButtonElement>('.chip')];
  const cards = [...feed.querySelectorAll<HTMLElement>('.f-grid .fc')];
  const filter = (key: string): void => {
    chips.forEach((c) => {
      const on = c.dataset.filter === key;
      c.classList.toggle('on', on);
      c.setAttribute('aria-pressed', String(on));
    });
    let n = 0;
    for (const card of cards) {
      const show = key === 'all' || card.dataset.artist!.split(' ').includes(key) || card.dataset.type === key;
      card.hidden = !show;
      card.classList.remove('pop');
      if (show && !still) {
        card.style.setProperty('--i', String(n++ % 8));
        void card.offsetWidth;
        card.classList.add('pop', 'in');
      }
    }
  };
  chips.forEach((c) => c.addEventListener('click', () => filter(c.dataset.filter!)));

  /* ── play buttons: put a set on air, here ── */
  const nowTitle = feed.querySelector<HTMLElement>('[data-now-title]');
  const nowSub = feed.querySelector<HTMLElement>('[data-now-sub]');
  const mark = (): void => {
    const playing = isPlaying();
    feed.querySelectorAll<HTMLElement>('[data-play-set]').forEach((b) => {
      const on = playing && b.dataset.playSet === CURRENT.slug;
      b.classList.toggle('on-air', on);
      b.setAttribute('aria-pressed', String(on));
    });
    if (nowTitle) nowTitle.textContent = CURRENT.title;
    if (nowSub) nowSub.textContent = `${CURRENT.hosts} · ${CURRENT.station}${playing ? ' · playing' : ''}`;
  };
  const onClick = (e: Event): void => {
    const b = (e.target as Element).closest<HTMLElement>('[data-play-set]');
    if (!b || !feed.contains(b)) return;
    e.preventDefault();
    playSet(b.dataset.playSet!);
    requestAnimationFrame(mark);
  };
  feed.addEventListener('click', onClick);
  off.push(() => feed.removeEventListener('click', onClick));
  const unState = onState(mark);
  const unSet = onSetChange(mark);
  off.push(() => {
    unState();
    unSet();
  });
  mark();

  /* ── calendar countdown ── */
  const cd = feed.querySelector<HTMLElement>('[data-countdown]');
  const cdText = cd?.querySelector<HTMLElement>('[data-cd-text]');
  if (cd && cdText) {
    const at = Date.parse(cd.dataset.countdown!);
    const tick = (): void => {
      const s = Math.floor((at - Date.now()) / 1000);
      if (s <= 0) return void (cdText.textContent = 'on air now or just aired');
      const d = Math.floor(s / 86400), h = Math.floor((s % 86400) / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
      cdText.textContent = `in ${d}d ${String(h).padStart(2, '0')}h ${String(m).padStart(2, '0')}m ${String(sec).padStart(2, '0')}s`;
    };
    tick();
    const id = window.setInterval(() => !document.hidden && tick(), 1000);
    off.push(() => clearInterval(id));
  }

  /* ── sticky call to action: after the hero, until the closing block ── */
  const sticky = feed.querySelector<HTMLElement>('.sticky-cta');
  const close = feed.querySelector<HTMLElement>('[data-close]');
  let closeIn = false;
  const closeIo = new IntersectionObserver(([e]) => {
    closeIn = e.isIntersecting;
    place();
  });
  if (close) closeIo.observe(close);
  off.push(() => closeIo.disconnect());

  /* ── one rAF loop: scroll velocity skews the marquees, pointer tilts cards ── */
  let lastY = window.scrollY;
  let skew = 0;
  let raf = 0;
  let tiltEl: HTMLElement | null = null;
  let tx = 0;
  let ty = 0;
  const marquees = [...feed.querySelectorAll<HTMLElement>('.mq')];
  function place(): void {
    if (sticky) sticky.hidden = closeIn || window.scrollY < innerHeight * 0.85;
  }
  const frame = (): void => {
    raf = 0;
    const y = window.scrollY;
    const v = y - lastY;
    lastY = y;
    skew += (Math.max(-6, Math.min(6, v * 0.08)) - skew) * 0.2;
    if (Math.abs(skew) < 0.02) skew = 0;
    for (const m of marquees) m.style.setProperty('--skew', skew.toFixed(2));
    if (tiltEl) {
      tiltEl.style.setProperty('--rx', tx.toFixed(2));
      tiltEl.style.setProperty('--ry', ty.toFixed(2));
    }
    if (skew !== 0) raf = requestAnimationFrame(frame);
  };
  const kick = (): void => {
    raf ||= requestAnimationFrame(frame);
  };
  const onScroll = (): void => {
    place();
    if (!still) kick();
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  off.push(() => window.removeEventListener('scroll', onScroll));
  place();

  if (!still && matchMedia('(hover: hover)').matches) {
    const onMove = (e: PointerEvent): void => {
      const el = (e.target as Element).closest<HTMLElement>('.tilt');
      if (tiltEl && tiltEl !== el) {
        tiltEl.style.setProperty('--rx', '0');
        tiltEl.style.setProperty('--ry', '0');
      }
      tiltEl = el;
      if (el) {
        const r = el.getBoundingClientRect();
        tx = ((e.clientX - r.left) / r.width - 0.5) * 10;
        ty = -((e.clientY - r.top) / r.height - 0.5) * 10;
      }
      // Magnetic buttons lean a few pixels towards the pointer.
      const btn = (e.target as Element).closest<HTMLElement>('.btn, .fc-play');
      if (btn) {
        const r = btn.getBoundingClientRect();
        btn.style.setProperty('--mx', (((e.clientX - r.left) / r.width - 0.5) * 6).toFixed(1));
        btn.style.setProperty('--my', (((e.clientY - r.top) / r.height - 0.5) * 6).toFixed(1));
      }
      kick();
    };
    const onLeave = (e: PointerEvent): void => {
      const btn = (e.target as Element).closest?.<HTMLElement>('.btn, .fc-play');
      if (btn) {
        btn.style.removeProperty('--mx');
        btn.style.removeProperty('--my');
      }
    };
    feed.addEventListener('pointermove', onMove, { passive: true });
    feed.addEventListener('pointerout', onLeave, { passive: true });
    off.push(() => {
      feed.removeEventListener('pointermove', onMove);
      feed.removeEventListener('pointerout', onLeave);
    });
  }
  off.push(() => cancelAnimationFrame(raf));

  return () => off.forEach((fn) => fn());
}
