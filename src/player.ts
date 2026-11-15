import { isPlaying, mountWidget, onState, onTrack, playSet, seek, skip, toggle, upNext } from './audio';
import { EVENTS, MIX, NEXT_RELEASE, SETS, TRACKLIST, fmt, onSetChange, type MixTrack, type RadioSet } from './data';
import { onRelease, type Featured } from './release';
import { asset, esc } from './ui';

/**
 * The player bar: one full-width bar fixed to the bottom of every page, in
 * two rows. Above, Mixcloud's own player for the set on air (its waveform,
 * time and play button: Mixcloud streams the audio). Below, the set's name, then the track
 * itself: its cover, title and artist, and play / pause. Before the first play
 * that is the track Play will start; after, the one playing. Then the
 * tracklist, the I RAVE YOU wordmark (home) and two pills: share this page,
 * and the release button, which says where it leads before it is pressed
 * ("Latest release · Down In Bossa ↗", "Pre-save · out 13 Nov"). It follows
 * public/releases.json live (src/release.ts), so a new release or pre-save
 * takes the button over without a deploy of this code or a reload.
 *
 * The cover or the track title opens the tracklist window above the bar.
 */

const icon = {
  play: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="11" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M9.5 7.5v9l7-4.5z"/></svg>',
  pause: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="11" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M8.6 7.5h2.4v9H8.6zM13 7.5h2.4v9H13z"/></svg>',
  prev: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 2.5h2v11H3zM13 2.5v11L5.5 8z"/></svg>',
  next: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M11 2.5h2v11h-2zM3 2.5v11L10.5 8z"/></svg>',
  list: '<span class="fbar-tl-eq" aria-hidden="true"><i></i><i></i><i></i><i></i></span>',
  share: '<svg class="fbar-share-i" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v12M7.5 7.5 12 3l4.5 4.5M5 12v8h14v-8" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>',
};

/**
 * The set's badge: "Recorded set", since what plays here is the recording.
 * "On air" (red dot) shows only while the set's own broadcast slot is running
 * (EVENTS, start to end). Which one shows is CSS, keyed on the `on-air` class.
 */
const badge = '<b class="fbar-onair"><i></i><span class="fbar-onair-on">On air</span><span class="fbar-onair-off">Recorded set</span></b>';

/** True only inside a confirmed broadcast slot of the set on air. */
const onAirNow = (): boolean => {
  const now = Date.now();
  return EVENTS.some((e) => e.set === MIX.slug && e.end && Date.parse(e.start) <= now && now < Date.parse(e.end));
};

const two = (n: number): string => String(n).padStart(2, '0');
/** A track's cover; an unreleased ID shows the set's own artwork. */
const cover = (t: MixTrack | undefined): string => asset(t?.art ?? MIX.cover ?? 'img/mix-art.jpg');

/** Who plays the set on air, with Bengali names set in the Bengali face. */
const hosts = (): string => esc(MIX.hosts).replace(/([\u0980-\u09FF]+)/g, '<span class="bn" lang="bn">$1</span>').replace(/ &amp; | x /g, ' <i>×</i> ');
/** Plain text with any Bengali run set in the Bengali face, marked as Bengali. */
const bnText = (s: string): string => esc(s).replace(/([\u0980-\u09FF\u200C\u200D]+)/g, '<span class="bn" lang="bn">$1</span>');

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
/** "2026-11-13" as "13 Nov 2026", read from the string itself (no time zone shifts the day). */
const day = (iso: string): string => {
  const [y, m, d] = iso.split('-').map(Number);
  return y && m && d ? `${d} ${MONTHS[m - 1]} ${y}` : iso;
};
/** "Vol. 02" → "02": the number alone, for the bar's small chip. */
const volNo = (v: string): string => v.replace(/^vol(?:ume)?\.?\s*/i, '');

/** The volume picker: every set in the library, newest first; the one on air is pressed. */
const volumeHtml = (s: RadioSet): string => {
  const on = s.slug === MIX.slug;
  return `
        <li>
          <button type="button" class="tid-vol" data-set="${esc(s.slug)}" aria-pressed="${on}"${on ? ' aria-current="true"' : ''}>
            <span class="tid-vol-k"><b>${esc(s.volume)}</b> · ${esc(day(s.date))}<em class="tid-vol-on">On air</em></span>
            <span class="tid-vol-h">${bnText(s.hosts)}</span>
          </button>
        </li>`;
};
const volumesHtml = (): string => SETS.map(volumeHtml).join('');

/** Tracklist rows for the set on air. */
const listHtml = (): string =>
  TRACKLIST.map(
    (t, i) => `
        <li data-i="${i}">
          <button type="button" data-seek="${t.at}" aria-label="Play ${esc(t.title)} from ${fmt(t.at)}">
            <span class="tid-at">${fmt(t.at)}</span>
            <span class="tid-track"><b>${esc(t.title)}</b><span class="tid-artist">${esc(t.artist)}</span><em class="tid-now">Now playing</em></span>
          </button>
          ${t.url ? `<a href="${esc(t.url)}" target="_blank" rel="noopener noreferrer" aria-label="Open ${esc(t.title)} by ${esc(t.artist)} on ${esc(t.linkLabel)}">${esc(t.linkLabel)} ↗</a>` : /unreleased/i.test(t.title) ? `<span class="tid-unavailable">Unreleased</span>` : ''}
        </li>`,
  ).join('');

/** The tracklist window's headline for the set on air. */
const heroHtml = (): string => `
      <span class="tid-hero-k">${badge} ${esc(MIX.station)}</span>
      <strong class="tid-hero-t">${esc(MIX.show)} <span class="tid-hero-v">${esc(MIX.volume)}</span></strong>
      <span class="tid-hero-a">${hosts()}</span>
      <span class="tid-hero-s">${esc(MIX.description)} ${Math.round(MIX.duration / 60)} minutes, ${TRACKLIST.length} tracks.</span>
      <a class="tid-hero-link" href="${esc(MIX.showUrl ?? MIX.stationUrl)}" target="_blank" rel="noopener">The show on ${esc(MIX.station)} ↗</a>`;

export function mountPlayer(): void {
  const root = document.documentElement.dataset.root ?? '';
  const bar = document.createElement('div');
  bar.className = 'fbar paused';
  bar.setAttribute('role', 'region');
  bar.setAttribute('aria-label', 'Mix player');
  /** What the set-name button and the Vol. chip say to a screen reader. */
  function volLabel(): string {
    return `${MIX.show} ${MIX.volume}, ${MIX.hosts}: choose a volume`;
  }
  // The credit, said like a broadcast: who made this set, and for whom.
  const opener = (): string => (TRACKLIST[0] ? `, opening with “${esc(TRACKLIST[0].title.replace(/\s*\(unreleased ID\)/i, ''))}”` : '');
  const air = (): string => `<span class="fbar-air-item">${badge} <strong>${hosts()}</strong> <em>:</em> ${esc(MIX.show)} ${esc(MIX.volume)} <em>—</em> a ${Math.round(MIX.duration / 60)}-minute set made for <strong>${esc(MIX.station)}</strong> <em>—</em> ${TRACKLIST.length} tracks${opener()} <em>✶</em></span>`;
  // The release the button points to, said the same way in the ticker.
  let featured: Featured | null = null;
  const news = (): string => {
    if (!featured) return '';
    const r = featured.release;
    const more = featured.when ? ` <em>—</em> ${esc(featured.when)}` : `${r.genre ? ` · ${esc(r.genre)}` : ''}${r.label ? ` on <strong>${esc(r.label)}</strong>` : ''}`;
    return `<span class="fbar-air-item"><b class="fbar-new">${esc(featured.kicker)}</b> <strong>${esc(r.title)}</strong> <em>—</em> ${esc(r.artists)}${more} <em>✶</em></span>`;
  };
  bar.innerHTML = `
    <button type="button" class="fbar-air" tabindex="-1" aria-hidden="true">
      <span class="fbar-air-run">${air().repeat(3)}</span>
    </button>
    <div class="fbar-seek">
      <span class="fbar-mix-m">${hosts()} · ${esc(MIX.show)} ${esc(MIX.volume)}</span>
      <div class="fbar-mc" data-mc></div>
    </div>
    <div class="fbar-row">
      <button type="button" class="fbar-mix" aria-controls="track-id" aria-expanded="false" aria-label="${esc(volLabel())}">
        <span class="fbar-mix-a">${hosts()}</span>
        <span class="fbar-mix-t">${esc(MIX.show)} · ${esc(MIX.volume)} <span class="fbar-mix-c" aria-hidden="true">▾</span></span>
      </button>
      <button type="button" class="fbar-vol" aria-controls="track-id" aria-expanded="false" aria-label="${esc(volLabel())}">
        <span class="fbar-vol-k">Vol.</span><b class="fbar-vol-n">${esc(volNo(MIX.volume))}</b>
      </button>
      <div class="fbar-now">
        <button type="button" class="fbar-art" tabindex="-1" aria-hidden="true">
          <img class="fbar-cover" src="${cover(TRACKLIST[0])}" alt="" width="44" height="44" decoding="async" />
        </button>
        <button type="button" class="fbar-text" tabindex="-1" aria-hidden="true">
          <span class="fbar-k">Up next</span>
          <span class="fbar-title"></span>
          <span class="fbar-artist"></span>
        </button>
        <button type="button" class="fbar-play" aria-label="Play">${icon.play}</button>
      </div>
      <button type="button" class="fbar-tl" aria-label="Tracklist" aria-controls="track-id" aria-expanded="false">
        ${icon.list}<span class="fbar-tl-k">Tracklist</span><span class="fbar-tl-n">01/${TRACKLIST.length}</span>
      </button>
      <a class="fbar-mark" href="${root}" aria-label="I Rave You home">I RAVE YOU</a>
      <div class="fbar-actions">
        <button type="button" class="fbar-pill fbar-share">${icon.share}<span class="fbar-share-t">Share this page</span></button>
        <a class="fbar-pill fbar-cta" href="${root}music/" target="_blank" rel="noopener" hidden>
          <img class="fbar-cta-art" src="" alt="" width="36" height="36" decoding="async" />
          <span class="fbar-cta-text"><span class="fbar-cta-k"><b></b><span class="fbar-cta-when"></span></span><span class="fbar-cta-t"></span></span>
        </a>
      </div>
    </div>`;

  const panel = document.createElement('section');
  panel.id = 'track-id';
  panel.className = 'tid paused';
  panel.setAttribute('aria-label', 'Mix tracklist');
  panel.inert = true;
  panel.innerHTML = `
    <header class="tid-bar">
      <span class="tid-bar-t">${icon.list} Tracklist · ${TRACKLIST.length} tracks</span>
      <button type="button" data-act="close" aria-label="Close tracklist">–</button>
    </header>
    <div class="tid-hero">${heroHtml()}</div>
    <nav class="tid-sets" aria-labelledby="tid-sets-k">
      <span class="tid-sets-k" id="tid-sets-k">${esc(MIX.show)} · Volumes</span>
      <ul class="tid-vols">${volumesHtml()}</ul>
    </nav>
    <div class="tid-head">
      <div class="tid-title">
        <b>Tracklist</b>
        <span>Tap a track to jump · open the original recordings</span>
      </div>
      <div class="tid-transport">
        <button type="button" data-act="prev" aria-label="Previous track">${icon.prev}</button>
        <button type="button" data-act="next" aria-label="Next track">${icon.next}</button>
      </div>
    </div>
    <ol class="tid-list">${listHtml()}</ol>`;

  // A small window names each new track as the mix moves on.
  const now = document.createElement('div');
  now.className = 'np-now';
  now.setAttribute('role', 'status');
  now.setAttribute('aria-live', 'polite');
  now.innerHTML = `<span class="np-now-k"></span><b class="np-now-t"></b><span class="np-now-a"></span>`;

  // The window follows the bar in the page, so Tab from the bar reaches the tracks.
  document.body.append(now, bar, panel);
  // Mixcloud's player sits in the bar, where its own controls stay in reach.
  mountWidget(bar.querySelector<HTMLElement>('[data-mc]')!);

  const playBtn = bar.querySelector<HTMLButtonElement>('.fbar-play')!;
  // Four ways in for the pointer; for the keyboard and screen readers, one: Tracklist.
  const openers = [...bar.querySelectorAll<HTMLButtonElement>('.fbar-art, .fbar-text, .fbar-tl, .fbar-air')];
  const tlBtn = bar.querySelector<HTMLButtonElement>('.fbar-tl')!;
  const tlCount = bar.querySelector<HTMLElement>('.fbar-tl-n')!;
  const title = bar.querySelector<HTMLElement>('.fbar-title')!;
  const artist = bar.querySelector<HTMLElement>('.fbar-artist')!;
  const coverImg = bar.querySelector<HTMLImageElement>('.fbar-cover')!;
  const kicker = bar.querySelector<HTMLElement>('.fbar-k')!;
  const share = bar.querySelector<HTMLButtonElement>('.fbar-share')!;
  let rows = [...panel.querySelectorAll<HTMLElement>('.tid-list li')];

  let current: { t: MixTrack; i: number } = { t: TRACKLIST[upNext()], i: upNext() };

  /** Cover, title, artist and count for one track; the bar always names the track Play is about. */
  const show = (t: MixTrack, i: number): void => {
    current = { t, i };
    rows.forEach((r, n) => r.classList.toggle('playing', n === i));
    title.textContent = t.title;
    artist.textContent = t.artist;
    const src = cover(t);
    if (coverImg.getAttribute('src') !== src) coverImg.src = src;
    tlCount.textContent = `${two(i + 1)}/${TRACKLIST.length}`;
  };

  const reveal = (): void => {
    if (!document.body.classList.contains('tid-open')) return;
    rows[current.i]?.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' });
  };

  // Until the tracklist has been opened once, its button asks for attention.
  const SEEN = 'iry:tid-seen';
  try {
    if (localStorage.getItem(SEEN) !== '1') bar.classList.add('fbar-attn');
  } catch {
    /* storage unavailable */
  }
  let openedTo: 'close' | 'volumes' | null = null;
  const volBtns = [...bar.querySelectorAll<HTMLButtonElement>('.fbar-mix, .fbar-vol')];
  /** Open (or close) the window; `to` is where focus lands: the close button, or the volumes. */
  const open = (on: boolean, to: 'close' | 'volumes' = 'close'): void => {
    if (on) {
      bar.classList.remove('fbar-attn');
      try {
        localStorage.setItem(SEEN, '1');
      } catch {
        /* ignore */
      }
    }
    const was = document.body.classList.contains('tid-open');
    openedTo = on ? to : null;
    if (on !== was) {
      document.body.classList.toggle('tid-open', on);
      tlBtn.setAttribute('aria-expanded', String(on));
      volBtns.forEach((b) => b.setAttribute('aria-expanded', String(on)));
      panel.inert = !on;
      if (!on && panel.contains(document.activeElement)) tlBtn.focus({ preventScroll: true });
    }
    if (on) {
      // The window turns visible at once (bar.css), so focus can move into it now;
      // one frame later as a fallback for a browser that has not restyled yet.
      const target =
        to === 'volumes'
          ? panel.querySelector<HTMLButtonElement>('.tid-vol[aria-pressed="true"]') ?? panel.querySelector<HTMLButtonElement>('.tid-vol')!
          : panel.querySelector<HTMLButtonElement>('[data-act="close"]')!;
      if (to === 'volumes') panel.querySelector('.tid-sets')?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
      target.focus({ preventScroll: true });
      if (document.activeElement !== target) requestAnimationFrame(() => document.body.classList.contains('tid-open') && target.focus({ preventScroll: true }));
      if (!was) window.setTimeout(reveal, 300);
    }
  };

  let nowTimer = 0;
  let firstTrack = true;
  /** Show the small window: a kicker, a line, a second line. `link` makes the line a selectable URL. */
  const notice = (k: string, t: string, a: string, ms = 5200, link = false): void => {
    now.querySelector('.np-now-k')!.textContent = k;
    const line = now.querySelector<HTMLElement>('.np-now-t')!;
    line.textContent = t;
    now.querySelector('.np-now-a')!.textContent = a;
    now.classList.toggle('np-link', link);
    now.classList.remove('show');
    void now.offsetWidth;
    now.classList.add('show');
    if (link) window.getSelection()?.selectAllChildren(line);
    clearTimeout(nowTimer);
    nowTimer = window.setTimeout(() => now.classList.remove('show', 'np-link'), ms);
  };
  const announce = (t: MixTrack, i: number): void => notice(`Now playing · ${two(i + 1)}/${TRACKLIST.length}`, t.title, t.artist);

  onTrack((t, i) => {
    if (!firstTrack && isPlaying() && !document.body.classList.contains('tid-open')) announce(t, i);
    firstTrack = false;
    show(t, i);
    reveal();
  });
  show(current.t, current.i);

  // Another set went on air: rebuild every set-specific line in place.
  onSetChange(() => {
    panel.querySelector('.tid-list')!.innerHTML = listHtml();
    panel.querySelector('.tid-hero')!.innerHTML = heroHtml();
    panel.querySelector('.tid-bar-t')!.innerHTML = `${icon.list} Tracklist · ${TRACKLIST.length} tracks`;
    rows = [...panel.querySelectorAll<HTMLElement>('.tid-list li')];
    firstTrack = true;
    const label = `${MIX.show} ${MIX.volume}`;
    bar.querySelector('.fbar-mix-m')!.innerHTML = `${hosts()} · ${esc(label)}`;
    bar.querySelector('.fbar-mix-a')!.innerHTML = hosts();
    bar.querySelector('.fbar-air-run')!.innerHTML = (air() + news()).repeat(3);
    volBtns.forEach((b) => b.setAttribute('aria-label', volLabel()));
    bar.querySelector('.fbar-mix-t')!.innerHTML = `${esc(MIX.show)} · ${esc(MIX.volume)} <span class="fbar-mix-c" aria-hidden="true">▾</span>`;
    bar.querySelector('.fbar-vol-n')!.textContent = volNo(MIX.volume);
    // The picker keeps its buttons (and focus); only which one is pressed changes.
    panel.querySelectorAll<HTMLButtonElement>('.tid-vol').forEach((b) => {
      const on = b.dataset.set === MIX.slug;
      b.setAttribute('aria-pressed', String(on));
      if (on) b.setAttribute('aria-current', 'true');
      else b.removeAttribute('aria-current');
    });
    panel.querySelector('.tid-sets-k')!.textContent = `${MIX.show} · Volumes`;
    show(TRACKLIST[upNext()], upNext());
  });

  // Play and Pause swap; the kicker says whether this track is up next, playing or paused.
  let started = false;
  const label = (playing: boolean): void => {
    playBtn.innerHTML = playing ? icon.pause : icon.play;
    playBtn.setAttribute('aria-label', `${playing ? 'Pause' : 'Play'} ${current.t.title} by ${current.t.artist}`);
    kicker.textContent = playing ? 'Now playing' : started ? 'Paused' : 'Up next';
  };
  const markAir = (): void => {
    const live = onAirNow();
    bar.classList.toggle('on-air', live);
    panel.classList.toggle('on-air', live);
  };
  markAir();
  onSetChange(markAir);
  setInterval(markAir, 60_000);
  onState((playing) => {
    started ||= playing;
    label(playing);
    bar.classList.toggle('paused', !playing);
    panel.classList.toggle('paused', !playing);
  });
  onTrack(() => label(isPlaying()));
  label(false);

  // The release button names where it goes: the state, the release, the arrow out.
  const cta = bar.querySelector<HTMLAnchorElement>('.fbar-cta')!;
  const ctaArt = cta.querySelector<HTMLImageElement>('.fbar-cta-art')!;
  onRelease((f) => {
    featured = f;
    cta.hidden = !f;
    if (f) {
      const r = f.release;
      cta.href = f.href;
      cta.dataset.state = f.state;
      if (ctaArt.getAttribute('src') !== f.cover) ctaArt.src = f.cover;
      cta.querySelector('.fbar-cta-k b')!.textContent = f.kicker;
      cta.querySelector('.fbar-cta-when')!.textContent = f.when ? ` · ${f.when}` : '';
      // The arrow stays with the last word when the name wraps.
      cta.querySelector('.fbar-cta-t')!.textContent = `${r.title}\u00a0↗`;
      cta.setAttribute('aria-label', `${f.kicker}${f.when ? `, ${f.when}` : ''}: ${f.state === 'presave' ? 'pre-save' : 'listen to'} ${r.title} by ${r.artists} (opens in a new tab)`);
      cta.title = `${r.title} — ${r.artists}${r.label ? ` · ${r.label}` : ''}`;
    }
    bar.querySelector('.fbar-air-run')!.innerHTML = (air() + news()).repeat(3);
  });

  // Share names what it shares: the page that is open, by its name.
  const shareText = share.querySelector<HTMLElement>('.fbar-share-t')!;
  let shareName = 'this page';
  const syncShare = (): void => {
    const p = location.pathname.slice((document.documentElement.dataset.root ?? '/').length);
    shareName = /^acnd\//.test(p)
      ? 'ACND'
      : /^apurba\//.test(p)
        ? 'অপূর্ব'
        : /^music\/down-in-bossa\//.test(p)
          ? NEXT_RELEASE.title
          : /^music\/$/.test(p)
            ? 'the music'
            : /^(?:mixes|radio)\//.test(p)
              ? MIX.show
              : /^journal\/[^/]+\//.test(p)
                ? 'this article'
                : /^journal\/$/.test(p)
                  ? 'the journal'
                  : p === '' || p === 'index.html'
                    ? 'I Rave You'
                    : 'this page';
    shareText.textContent = `Share ${shareName}`;
    shareText.classList.toggle('bn', shareName === 'অপূর্ব');
    share.setAttribute('aria-label', `Share ${shareName}: send a link to this page`);
  };
  syncShare();
  window.addEventListener('routechange', syncShare);
  share.addEventListener('click', async () => {
    const data = { title: document.title, text: `${shareName === 'this page' || shareName === 'this article' ? document.title : shareName} on I Rave You`, url: location.href };
    if (navigator.share) {
      try {
        await navigator.share(data);
        return;
      } catch (e) {
        // Dismissed: nothing to say. Refused for another reason: copy instead.
        if ((e as DOMException)?.name === 'AbortError') return;
      }
    }
    try {
      if (!navigator.clipboard?.writeText) throw new Error('no clipboard');
      await navigator.clipboard.writeText(data.url);
      shareText.textContent = 'Link copied';
      window.setTimeout(syncShare, 1800);
      notice('Link copied', data.url, '', 2600);
    } catch {
      // The browser would not copy: show the link, selected, to copy by hand.
      notice('Copy this link', data.url, '', 12000, true);
    }
  });

  playBtn.addEventListener('click', toggle);
  openers.forEach((b) => b.addEventListener('click', () => open(!document.body.classList.contains('tid-open'))));
  volBtns.forEach((b) =>
    b.addEventListener('click', () => {
      // A second press closes what the first opened; from the Tracklist view it moves to the volumes.
      if (document.body.classList.contains('tid-open') && openedTo === 'volumes') open(false);
      else open(true, 'volumes');
    }),
  );
  panel.addEventListener('click', (e) => {
    const el = (e.target as HTMLElement).closest<HTMLElement>('[data-act], [data-seek], [data-set]');
    if (!el) return;
    if (el.dataset.set) {
      // Put that volume on air: Mixcloud's widget loads it and plays.
      playSet(el.dataset.set);
    } else if (el.dataset.seek) {
      // Jump first, then start: a paused set resumes at the new spot, not the old one.
      const wasPlaying = isPlaying();
      seek(Number(el.dataset.seek));
      if (!wasPlaying) toggle();
    } else if (el.dataset.act === 'prev') skip(-1);
    else if (el.dataset.act === 'next') skip(1);
    else if (el.dataset.act === 'close') open(false);
  });
  window.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    open(false);
    now.classList.remove('show', 'np-link');
  });
  window.addEventListener('routechange', () => open(false));
}
