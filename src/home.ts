import { isPlaying, onState, playSet } from './audio';
import { CURRENT, onSetChange } from './data';
import { ROOT } from './router';

/**
 * The home feed is static HTML built into index.html (scripts/home.mjs). This
 * module only adds what needs script: one fade per block, the catalogue tabs,
 * the play buttons, the bar behind MENU and the broadcast countdown. Nothing here loops on its own;
 * the only motion while idle is the countdown text.
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
      // DOMParser runs without scripting, so the no-JS <style> would come alive.
      el.querySelector('noscript')?.remove();
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
  // The markup is wanted at once (Back may be restoring a spot inside it), and
  // so are the reveals, or a restored spot would sit faded; the rest waits for
  // an idle moment so the hero paints first.
  const idle = (fn: () => void): void => void ('requestIdleCallback' in window ? requestIdleCallback(fn, { timeout: 1500 }) : setTimeout(fn, 300));
  void ensureFeed().then((feed) => {
    if (!feed || !alive) return;
    cleanup.push(reveal(feed));
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

/** One fade per block (.k-fade in system.css): mark it in once it comes near. */
function reveal(feed: HTMLElement): () => void {
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries)
        if (e.isIntersecting) {
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
    },
    { rootMargin: '0px 0px 10% 0px' },
  );
  feed.querySelectorAll('[data-reveal]:not(.in)').forEach((el) => io.observe(el));
  return () => io.disconnect();
}

function enhance(feed: HTMLElement): () => void {
  const off: (() => void)[] = [];

  /* ── catalogue tabs: one axis at a time, the grid itself never changes order ── */
  const tabs = [...feed.querySelectorAll<HTMLButtonElement>('[data-filter]')];
  const cards = [...feed.querySelectorAll<HTMLElement>('.f-grid .fc')];
  const filter = (key: string): void => {
    tabs.forEach((t) => {
      const on = t.dataset.filter === key;
      t.classList.toggle('on', on);
      t.setAttribute('aria-pressed', String(on));
    });
    for (const card of cards) card.hidden = !(key === 'all' || card.dataset.artist!.split(' ').includes(key) || card.dataset.type === key);
  };
  const onTab = (e: Event): void => filter((e.currentTarget as HTMLElement).dataset.filter!);
  tabs.forEach((t) => t.addEventListener('click', onTab));
  off.push(() => tabs.forEach((t) => t.removeEventListener('click', onTab)));

  /* ── play buttons: put a set on air, here; the EQ beside the intro button shows while it plays ── */
  const mark = (): void => {
    const playing = isPlaying();
    feed.querySelectorAll<HTMLElement>('[data-play-set]').forEach((b) => {
      const on = playing && b.dataset.playSet === CURRENT.slug;
      b.classList.toggle('on-air', on);
      b.setAttribute('aria-pressed', String(on));
    });
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

  /* ── MENU backing: once the hero has scrolled past, the fixed MENU gets the
     solid bar the artist pages have (body.feed-on, home.css), so feed content
     passes under a visible edge rather than under a floating, tap-catching word ── */
  const hero = document.querySelector('#app .home');
  if (hero) {
    const bar = new IntersectionObserver(([e]) => document.body.classList.toggle('feed-on', !e.isIntersecting), { rootMargin: '-64px 0px 0px 0px' });
    bar.observe(hero);
    off.push(() => {
      bar.disconnect();
      document.body.classList.remove('feed-on');
    });
  }

  /* ── broadcast countdown: days, hours and minutes are enough for a weekly slot ── */
  const cd = feed.querySelector<HTMLElement>('[data-countdown]');
  const cdText = cd?.querySelector<HTMLElement>('[data-cd-text]');
  if (cd && cdText) {
    const at = Date.parse(cd.dataset.countdown!);
    const tick = (): void => {
      const s = Math.floor((at - Date.now()) / 1000);
      if (s <= 0) return void (cdText.textContent = ' · on air now or just aired');
      const d = Math.floor(s / 86400), h = Math.floor((s % 86400) / 3600), m = Math.floor((s % 3600) / 60);
      cdText.textContent = ` · in ${d}d ${String(h).padStart(2, '0')}h ${String(m).padStart(2, '0')}m`;
    };
    tick();
    const id = window.setInterval(() => !document.hidden && tick(), 15000);
    off.push(() => clearInterval(id));
  }

  return () => off.forEach((fn) => fn());
}
