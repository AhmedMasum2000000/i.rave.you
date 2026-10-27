import { duration, isPlaying, onState, onTrack, seek, skip, time, toggle } from './audio';
import { ARTISTS, MIX, NEXT_RELEASE, TRACKLIST, fmt, type MixTrack } from './data';
import { asset, esc } from './ui';

/**
 * The player bar: one full-width bar fixed to the bottom of every page, in
 * two rows. Above, a hairline seek track across the whole set with the time
 * on either side and an eye for a knob. Below, the mix artwork, play and the
 * playing track, the I RAVE YOU wordmark (home), the artist's Spotify, and
 * two pills: share, and pre-save the next release with its countdown.
 *
 * The artwork or the track title opens the tracklist window above the bar.
 */

const icon = {
  play: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="11" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M9.5 7.5v9l7-4.5z"/></svg>',
  pause: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="11" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M8.6 7.5h2.4v9H8.6zM13 7.5h2.4v9H13z"/></svg>',
  prev: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 2.5h2v11H3zM13 2.5v11L5.5 8z"/></svg>',
  next: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M11 2.5h2v11h-2zM3 2.5v11L10.5 8z"/></svg>',
  /** An eye with a half-dark, half-light pupil: the site's duality as a knob. */
  eye: '<svg viewBox="0 0 44 24" aria-hidden="true"><defs><clipPath id="fbar-lid"><path d="M1.5 12C8 3.5 36 3.5 42.5 12 36 20.5 8 20.5 1.5 12z"/></clipPath></defs><g class="fbar-eye"><path d="M1.5 12C8 3.5 36 3.5 42.5 12 36 20.5 8 20.5 1.5 12z" fill="#fff"/><g clip-path="url(#fbar-lid)"><g class="fbar-pupil"><circle cx="22" cy="12" r="6.2" fill="#000"/><path d="M22 6.6a5.4 5.4 0 0 1 0 10.8z" fill="#fff"/><circle cx="24.2" cy="9.6" r="1.1" fill="#fff"/></g></g><path d="M1.5 12C8 3.5 36 3.5 42.5 12 36 20.5 8 20.5 1.5 12z" fill="none" stroke="#000" stroke-width="1.4"/></g></svg>',
  list: '<span class="fbar-tl-eq" aria-hidden="true"><i></i><i></i><i></i><i></i></span>',
  spotify:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="12" fill="currentColor"/><path d="M6.2 9.3c3.9-1.2 8.3-.9 11.6 1M6.8 12.5c3.2-.9 6.7-.6 9.4.9M7.4 15.5c2.5-.6 5.1-.4 7.2.7" fill="none" stroke="#fff" stroke-width="1.6" stroke-linecap="round"/></svg>',
};

const two = (n: number): string => String(n).padStart(2, '0');

export function mountPlayer(): void {
  const root = document.documentElement.dataset.root ?? '';
  const bar = document.createElement('div');
  bar.className = 'fbar';
  bar.setAttribute('role', 'region');
  bar.setAttribute('aria-label', 'Mix player');
  // The credit, said like a broadcast: who made this set, and for whom.
  const air = `<span class="fbar-air-item"><b class="fbar-onair"><i></i>On air</b> ${esc(MIX.show)} <em>—</em> a ${Math.round(2743.6 / 60)}-minute set by <strong>ACND</strong> × <strong class="bn">অপূর্ব</strong> for <strong>${esc(MIX.station)}</strong> (HKCR) <em>—</em> ${TRACKLIST.length} tracks, opening with their unreleased “Initiate” <em>✶</em></span>`;
  bar.innerHTML = `
    <button type="button" class="fbar-air" aria-controls="track-id" aria-expanded="false" aria-label="${esc(MIX.show)}: a set by ACND and অপূর্ব for ${esc(MIX.station)}. Open the tracklist.">
      <span class="fbar-air-run" aria-hidden="true">${air.repeat(4)}</span>
    </button>
    <div class="fbar-seek">
      <span class="fbar-time" data-t>00:00</span>
      <div class="fbar-track" role="slider" tabindex="0" aria-label="Seek in the mix" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">
        <span class="fbar-line"></span>
        <span class="fbar-knob">${icon.eye}</span>
      </div>
      <span class="fbar-time" data-d>45:43</span>
    </div>
    <div class="fbar-row">
      <button type="button" class="fbar-art" aria-controls="track-id" aria-expanded="false" aria-label="Open mix tracklist">
        <img src="${asset('img/mix-art.jpg')}" alt="" width="48" height="48" />
      </button>
      <div class="fbar-now">
        <button type="button" class="fbar-play" aria-label="Play">${icon.play}</button>
        <button type="button" class="fbar-text" aria-controls="track-id" aria-expanded="false">
          <span class="fbar-title"></span>
          <span class="fbar-artist"></span>
        </button>
      </div>
      <button type="button" class="fbar-tl" aria-controls="track-id" aria-expanded="false">
        ${icon.list}<span class="fbar-tl-k">Tracklist</span><span class="fbar-tl-n">01/${TRACKLIST.length}</span>
      </button>
      <a class="fbar-mark" href="${root}" aria-label="I Rave You home">I RAVE YOU</a>
      <a class="fbar-spotify" href="${esc(ARTISTS.acnd.listen.url)}" target="_blank" rel="noopener">${icon.spotify}<span>Spotify</span></a>
      <div class="fbar-actions">
        <button type="button" class="fbar-pill fbar-share">Share</button>
        <a class="fbar-pill fbar-cta" href="${esc(NEXT_RELEASE.presave)}" target="_blank" rel="noopener" title="${esc(NEXT_RELEASE.title)} — ${esc(NEXT_RELEASE.artist)}">
          <span data-presave-label>Pre-save</span>
          <span class="fbar-cd" aria-hidden="true"><b data-cd="d">00</b>d <b data-cd="h">00</b>h <b data-cd="m">00</b>m</span>
        </a>
      </div>
    </div>`;

  const panel = document.createElement('section');
  panel.id = 'track-id';
  panel.className = 'tid';
  panel.setAttribute('aria-label', 'Mix tracklist');
  panel.inert = true;
  panel.innerHTML = `
    <header class="tid-bar">
      <span>${icon.list} Tracklist · ${TRACKLIST.length} tracks</span>
      <button type="button" data-act="close" aria-label="Close tracklist">–</button>
    </header>
    <div class="tid-hero">
      <span class="tid-hero-k"><b class="fbar-onair"><i></i>On air</b> Hong Kong Community Radio · HKCR</span>
      <strong class="tid-hero-t">${esc(MIX.show)}</strong>
      <span class="tid-hero-a">ACND <i>×</i> <span class="bn">অপূর্ব</span></span>
      <span class="tid-hero-s">A ${Math.round(2743.6 / 60)}-minute set made for ${esc(MIX.station)}, hosted by both artists. ${TRACKLIST.length} tracks, opening with their unreleased collaboration “Initiate”.</span>
      <a class="tid-hero-link" href="${MIX.stationUrl}" target="_blank" rel="noopener">Visit HKCR ↗</a>
    </div>
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
    <ol class="tid-list">
      ${TRACKLIST.map(
        (t, i) => `
        <li data-i="${i}">
          <button type="button" data-seek="${t.at}" aria-label="Play ${esc(t.title)} from ${fmt(t.at)}">
            <span class="tid-at">${fmt(t.at)}</span>
            <span class="tid-track"><b>${esc(t.title)}</b><span class="tid-artist">${esc(t.artist)}</span><em class="tid-now">Now playing</em></span>
          </button>
          ${t.url ? `<a href="${esc(t.url)}" target="_blank" rel="noopener noreferrer" aria-label="Open ${esc(t.title)} by ${esc(t.artist)} on ${esc(t.linkLabel)}">${esc(t.linkLabel)} ↗</a>` : `<span class="tid-unavailable">Unreleased</span>`}
        </li>`,
      ).join('')}
    </ol>`;

  // A small window names each new track as the mix moves on.
  const now = document.createElement('div');
  now.className = 'np-now';
  now.setAttribute('role', 'status');
  now.setAttribute('aria-live', 'polite');
  now.innerHTML = `<span class="np-now-k"></span><b class="np-now-t"></b><span class="np-now-a"></span>`;

  document.body.append(panel, now, bar);

  const playBtn = bar.querySelector<HTMLButtonElement>('.fbar-play')!;
  const openers = [...bar.querySelectorAll<HTMLButtonElement>('.fbar-art, .fbar-text, .fbar-tl, .fbar-air')];
  const textBtn = bar.querySelector<HTMLButtonElement>('.fbar-text')!;
  const tlCount = bar.querySelector<HTMLElement>('.fbar-tl-n')!;
  const pupil = bar.querySelector<SVGGElement>('.fbar-pupil')!;
  const eye = bar.querySelector<SVGGElement>('.fbar-eye')!;
  const title = bar.querySelector<HTMLElement>('.fbar-title')!;
  const artist = bar.querySelector<HTMLElement>('.fbar-artist')!;
  const tT = bar.querySelector<HTMLElement>('[data-t]')!;
  const tD = bar.querySelector<HTMLElement>('[data-d]')!;
  const track = bar.querySelector<HTMLElement>('.fbar-track')!;
  const knob = bar.querySelector<HTMLElement>('.fbar-knob')!;
  const spotify = bar.querySelector<HTMLAnchorElement>('.fbar-spotify')!;
  const share = bar.querySelector<HTMLButtonElement>('.fbar-share')!;
  const rows = [...panel.querySelectorAll<HTMLElement>('.tid-list li')];

  let current: { t: MixTrack; i: number } = { t: TRACKLIST[0], i: 0 };
  rows[0]?.classList.add('playing');

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
  const open = (on: boolean): void => {
    if (on) {
      bar.classList.remove('fbar-attn');
      try {
        localStorage.setItem(SEEN, '1');
      } catch {
        /* ignore */
      }
    }
    document.body.classList.toggle('tid-open', on);
    openers.forEach((b) => b.setAttribute('aria-expanded', String(on)));
    panel.inert = !on;
    if (!on && panel.contains(document.activeElement)) textBtn.focus();
    if (on) {
      panel.querySelector<HTMLButtonElement>('[data-act="close"]')?.focus({ preventScroll: true });
      window.setTimeout(reveal, 300);
    }
  };

  let nowTimer = 0;
  let firstTrack = true;
  const announce = (t: MixTrack, i: number): void => {
    now.querySelector('.np-now-k')!.textContent = `Now playing · ${two(i + 1)}/${TRACKLIST.length}`;
    now.querySelector('.np-now-t')!.textContent = t.title;
    now.querySelector('.np-now-a')!.textContent = t.artist;
    now.classList.remove('show');
    void now.offsetWidth;
    now.classList.add('show');
    clearTimeout(nowTimer);
    nowTimer = window.setTimeout(() => now.classList.remove('show'), 5200);
  };

  onTrack((t, i) => {
    if (!firstTrack && isPlaying() && !document.body.classList.contains('tid-open')) announce(t, i);
    firstTrack = false;
    current = { t, i };
    rows.forEach((r, n) => r.classList.toggle('playing', n === i));
    title.textContent = t.title;
    artist.textContent = t.artist;
    tlCount.textContent = `${two(i + 1)}/${TRACKLIST.length}`;
    textBtn.setAttribute('aria-label', `Open mix tracklist: ${t.title} by ${t.artist}`);
    reveal();
  });
  title.textContent = current.t.title;
  artist.textContent = current.t.artist;

  onState((playing) => {
    playBtn.innerHTML = playing ? icon.pause : icon.play;
    playBtn.setAttribute('aria-label', playing ? 'Pause' : 'Play');
    bar.classList.toggle('paused', !playing);
  });

  // The Spotify cell follows the artist whose pages are open.
  const syncArtist = (): void => {
    const id = document.body.dataset.artist;
    const a = id === 'acnd' || id === 'apurba' ? ARTISTS[id] : undefined;
    bar.classList.toggle('fbar-noartist', !a);
    if (a) {
      spotify.href = a.listen.url;
      spotify.setAttribute('aria-label', `${a.latin} on Spotify`);
    }
  };
  syncArtist();
  window.addEventListener('routechange', syncArtist);

  share.addEventListener('click', async () => {
    const data = { title: document.title, url: location.href };
    try {
      if (navigator.share) await navigator.share(data);
      else {
        await navigator.clipboard.writeText(data.url);
        share.textContent = 'Link copied';
        window.setTimeout(() => (share.textContent = 'Share'), 1800);
      }
    } catch {
      /* the visitor dismissed the share sheet */
    }
  });

  playBtn.addEventListener('click', toggle);
  openers.forEach((b) => b.addEventListener('click', () => open(!document.body.classList.contains('tid-open'))));
  panel.addEventListener('click', (e) => {
    const el = (e.target as HTMLElement).closest<HTMLElement>('[data-act], [data-seek]');
    if (!el) return;
    if (el.dataset.seek) {
      if (!isPlaying()) toggle();
      seek(Number(el.dataset.seek));
    } else if (el.dataset.act === 'prev') skip(-1);
    else if (el.dataset.act === 'next') skip(1);
    else if (el.dataset.act === 'close') open(false);
  });
  window.addEventListener('keydown', (e) => e.key === 'Escape' && open(false));
  window.addEventListener('routechange', () => open(false));

  // Drag anywhere on the line to scrub; arrows nudge by 10 s.
  let dragging = false;
  const scrub = (e: PointerEvent): void => {
    const r = track.getBoundingClientRect();
    seek(Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)) * duration());
  };
  track.addEventListener('pointerdown', (e) => {
    dragging = true;
    track.setPointerCapture(e.pointerId);
    scrub(e);
  });
  track.addEventListener('pointermove', (e) => dragging && scrub(e));
  track.addEventListener('pointerup', () => (dragging = false));
  track.addEventListener('pointercancel', () => (dragging = false));
  track.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') seek(time() + 10);
    if (e.key === 'ArrowLeft') seek(time() - 10);
  });

  // The knob is an eye that follows the pointer, and blinks now and then.
  let lookX = 0;
  let lookY = 0;
  let eyeX = 0;
  let eyeY = 0;
  window.addEventListener(
    'pointermove',
    (e) => {
      const r = knob.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      const d = Math.hypot(dx, dy) || 1;
      const reach = Math.min(1, d / 160);
      lookX = (dx / d) * reach * 9;
      lookY = (dy / d) * reach * 3.2;
    },
    { passive: true },
  );
  const blink = (): void => {
    eye.classList.add('blink');
    window.setTimeout(() => eye.classList.remove('blink'), 150);
    window.setTimeout(blink, 3500 + Math.random() * 5000);
  };
  window.setTimeout(blink, 4000);

  let lastFrame = 0;
  let lastSecond = -1;
  const loop = (stamp: number): void => {
    requestAnimationFrame(loop);
    if (document.hidden || stamp - lastFrame < 1000 / 30) return;
    lastFrame = stamp;
    const t = time();
    const frac = Math.min(1, t / duration());
    knob.style.setProperty('--p', frac.toFixed(4));
    eyeX += (lookX - eyeX) * 0.25;
    eyeY += (lookY - eyeY) * 0.25;
    pupil.style.setProperty('--ex', eyeX.toFixed(2));
    pupil.style.setProperty('--ey', eyeY.toFixed(2));
    if (Math.floor(t) !== lastSecond) {
      lastSecond = Math.floor(t);
      tT.textContent = fmt(t);
      tD.textContent = fmt(duration());
      track.setAttribute('aria-valuenow', String(Math.round(frac * 100)));
      track.setAttribute('aria-valuetext', `${fmt(t)} of ${fmt(duration())}`);
    }
  };
  requestAnimationFrame(loop);
}
