import { asset } from './paths';

/**
 * The release the player bar points to, kept current while the page is open.
 *
 * public/releases.json lists the releases (scripts/releases.mjs adds new ones
 * from Apple Music on its own; hand-written entries add pre-saves and smart
 * links). The build bakes in the list it was built with, so the bar is right
 * at first paint; the page then re-reads the file every 10 minutes and when
 * it comes back into view, so a release published while a visitor listens
 * shows up without a reload. The state follows the clock: an upcoming
 * release reads "Pre-save" until its moment, then "Out today" for a day,
 * then "Latest release".
 */

export interface Release {
  id: string;
  title: string;
  artists: string;
  /** ISO 8601 with offset: the moment the release is out. */
  date: string;
  /** Where Listen goes. */
  url: string;
  /** Where the button goes before the date, if not `url`. */
  presave?: string;
  /** A path under public/ or an https URL. */
  cover?: string;
  label?: string;
  genre?: string;
}

export interface Featured {
  release: Release;
  state: 'presave' | 'today' | 'latest';
  /** "Pre-save", "Out today", "Latest release". */
  kicker: string;
  /** "out 13 Nov" for a pre-save; empty otherwise. */
  when: string;
  href: string;
  cover: string;
}

const DAY = 864e5;
const built: Release[] = typeof __RELEASES__ !== 'undefined' ? __RELEASES__ : [];
/** The day a release is announced for: its own calendar date, wherever the visitor is. */
const day = (iso: string): string => {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  const d = m ? new Date(Date.UTC(+m[1], +m[2] - 1, +m[3])) : new Date(iso);
  return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' }).format(d);
};
const coverOf = (r: Release): string => (r.cover ? (/^https?:/.test(r.cover) ? r.cover : asset(r.cover)) : asset('img/mix-art.jpg'));

/** The next release that can be pre-saved, else the newest one out. */
export function pick(list: Release[], now = Date.now()): Featured | null {
  const dated = list.filter((r) => r && r.title && r.url && Number.isFinite(Date.parse(r.date)));
  const next = dated.filter((r) => Date.parse(r.date) > now).sort((a, b) => Date.parse(a.date) - Date.parse(b.date))[0];
  if (next) return { release: next, state: 'presave', kicker: 'Pre-save', when: `out ${day(next.date)}`, href: next.presave ?? next.url, cover: coverOf(next) };
  const latest = dated.sort((a, b) => Date.parse(b.date) - Date.parse(a.date))[0];
  if (!latest) return null;
  const today = now - Date.parse(latest.date) < DAY;
  return { release: latest, state: today ? 'today' : 'latest', kicker: today ? 'Out today' : 'Latest release', when: '', href: latest.url, cover: coverOf(latest) };
}

let list = built;
let key = '';
let lastFetch = 0;
const listeners = new Set<(f: Featured | null) => void>();
const keyOf = (f: Featured | null): string => (f ? JSON.stringify([f.release, f.state, f.when]) : '');

function emit(): void {
  const f = pick(list);
  const k = keyOf(f);
  if (k === key) return;
  key = k;
  listeners.forEach((fn) => fn(f));
}

async function refresh(): Promise<void> {
  lastFetch = Date.now();
  try {
    const res = await fetch(asset('releases.json'), { cache: 'no-cache' });
    if (!res.ok) return;
    const data = (await res.json()) as { releases?: Release[] };
    if (Array.isArray(data.releases) && data.releases.length) {
      list = data.releases;
      emit();
    }
  } catch {
    /* offline: keep what we have */
  }
}

let started = false;
/** Call `fn` now and whenever the featured release or its state changes. */
export function onRelease(fn: (f: Featured | null) => void): void {
  listeners.add(fn);
  fn(pick(list));
  key = keyOf(pick(list));
  if (started) return;
  started = true;
  void refresh();
  // The clock: a pre-save turns into "Out today" the minute it is out.
  window.setInterval(() => emit(), 30_000);
  window.setInterval(() => !document.hidden && void refresh(), 10 * 60_000);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) return;
    emit();
    if (Date.now() - lastFetch > 60_000) void refresh();
  });
}
