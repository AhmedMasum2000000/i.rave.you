import { duration, isPlaying, onState, onTrack, seek, skip, time, toggle } from './audio';
import { MIX, TRACKLIST, fmt, type MixTrack } from './data';
import { esc } from './ui';
import { bands } from './fx';

/** Persistent mix controls and tracklist, available on every page. */

const icon = {
  play: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 2.5v11l9-5.5z"/></svg>',
  pause: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3.5 2.5h3v11h-3zM9.5 2.5h3v11h-3z"/></svg>',
  prev: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 2.5h2v11H3zM13 2.5v11L5.5 8z"/></svg>',
  next: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M11 2.5h2v11h-2zM3 2.5v11L10.5 8z"/></svg>',
};

export function mountPlayer(): void {
  const np = document.createElement('div');
  np.className = 'np';
  np.innerHTML = `
    <button class="np-play" type="button" aria-label="Pause">${icon.pause}</button>
    <button class="np-main" type="button" aria-controls="track-id" aria-expanded="false">
      <span class="np-live mono" aria-hidden="true"><i></i>Live</span>
      <span class="np-eq" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></span>
      <span class="np-text"><span class="np-k"></span><span class="np-t"></span></span>
      <span class="np-time">00:00</span>
      <span class="np-caret" aria-hidden="true">▲</span>
    </button>
    <span class="np-bar" aria-hidden="true"><span></span></span>`;

  const panel = document.createElement('section');
  panel.id = 'track-id';
  panel.className = 'tid';
  panel.setAttribute('aria-label', 'Mix tracklist');
  panel.inert = true;
  panel.innerHTML = `
    <header class="tid-head">
      <div class="tid-title">
        <span class="mono">● Mix tracklist</span>
        <b>${esc(MIX.show)} on ${esc(MIX.station)}</b>
        <span class="mono">Hosted by ${esc(MIX.hosts)} · made for <a href="${MIX.stationUrl}" target="_blank" rel="noopener">HKCR ↗</a></span>
      </div>
      <div class="tid-transport">
        <button type="button" data-act="prev" aria-label="Previous track">${icon.prev}</button>
        <button type="button" data-act="play" aria-label="Pause">${icon.pause}</button>
        <button type="button" data-act="next" aria-label="Next track">${icon.next}</button>
        <span class="tid-clock mono"><b data-t>00:00</b> / <span data-d>45:43</span></span>
      </div>
      <button type="button" class="tid-close mono" data-act="close" aria-label="Close track list">Close ✕</button>
    </header>
    <div class="tid-seek" role="slider" tabindex="0" aria-label="Seek" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">
      <span class="tid-fill"></span>
      ${TRACKLIST.map((t) => `<i style="left:${(t.at / 2743.6) * 100}%"></i>`).join('')}
    </div>
    <ol class="tid-list">
      ${TRACKLIST.map(
        (t, i) => `
        <li data-i="${i}">
          <button type="button" data-seek="${t.at}" aria-label="Play ${esc(t.title)} from ${fmt(t.at)}">
            <span class="mono">${fmt(t.at)}</span>
            <span><b>${esc(t.title)}</b> - ${esc(t.artist)}<em class="tid-now mono">Now playing</em></span>
          </button>
          ${t.url ? `<a href="${esc(t.url)}" target="_blank" rel="noopener noreferrer" aria-label="Open ${esc(t.title)} by ${esc(t.artist)} on ${esc(t.linkLabel)}">${esc(t.linkLabel)} ↗</a>` : `<span class="tid-unavailable">Unreleased</span>`}
        </li>`,
      ).join('')}
    </ol>`;

  // A quiet card names each new track as the mix moves on.
  const now = document.createElement('div');
  now.className = 'np-now';
  now.setAttribute('role', 'status');
  now.setAttribute('aria-live', 'polite');
  now.innerHTML = `<span class="np-now-k mono"></span><b class="np-now-t"></b><span class="np-now-a"></span>`;

  document.body.append(panel, np, now);
  let nowTimer = 0;
  let firstTrack = true;
  const announce = (t: MixTrack, i: number): void => {
    now.querySelector('.np-now-k')!.textContent = `Now playing · ${String(i + 1).padStart(2, '0')}/${TRACKLIST.length}`;
    now.querySelector('.np-now-t')!.textContent = t.title;
    now.querySelector('.np-now-a')!.textContent = t.artist;
    now.classList.remove('show');
    void now.offsetWidth;
    now.classList.add('show');
    clearTimeout(nowTimer);
    nowTimer = window.setTimeout(() => now.classList.remove('show'), 5200);
  };

  const playBtns = [np.querySelector<HTMLButtonElement>('.np-play')!, panel.querySelector<HTMLButtonElement>('[data-act="play"]')!];
  const main = np.querySelector<HTMLButtonElement>('.np-main')!;
  const k = np.querySelector<HTMLElement>('.np-k')!;
  const title = np.querySelector<HTMLElement>('.np-t')!;
  const tm = np.querySelector<HTMLElement>('.np-time')!;
  const bar = np.querySelector<HTMLElement>('.np-bar span')!;
  const eq = [...np.querySelectorAll<HTMLElement>('.np-eq i')];
  const seekBar = panel.querySelector<HTMLElement>('.tid-seek')!;
  const fill = panel.querySelector<HTMLElement>('.tid-fill')!;
  const tT = panel.querySelector<HTMLElement>('[data-t]')!;
  const tD = panel.querySelector<HTMLElement>('[data-d]')!;
  const rows = [...panel.querySelectorAll<HTMLElement>('.tid-list li')];

  let current: { t: MixTrack; i: number } = { t: TRACKLIST[0], i: 0 };
  rows[0]?.classList.add('playing');

  // The chip pulses for attention until the visitor has opened Track ID once.
  const SEEN = 'iry:tid-seen';
  let seen = false;
  try {
    seen = localStorage.getItem(SEEN) === '1';
  } catch {
    /* storage unavailable */
  }
  np.classList.toggle('np-attn', !seen);

  /** Keep the playing row in view inside the panel's own scroll area. */
  const reveal = (): void => {
    if (!document.body.classList.contains('tid-open') || !current) return;
    rows[current.i]?.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' });
  };

  const open = (on: boolean): void => {
    document.body.classList.toggle('tid-open', on);
    main.setAttribute('aria-expanded', String(on));
    panel.inert = !on;
    if (!on && panel.contains(document.activeElement)) main.focus();
    if (on) {
      panel.querySelector<HTMLButtonElement>('.tid-close')?.focus({ preventScroll: true });
      seen = true;
      np.classList.remove('np-attn');
      try {
        localStorage.setItem(SEEN, '1');
      } catch {
        /* ignore */
      }
      window.setTimeout(reveal, 350);
    }
  };

  /** The same track ID and panel access follow the listener across routes. */
  const label = (): void => {
    if (current) {
      k.textContent = `TRACK ID · ${String(current.i + 1).padStart(2, '0')}/${TRACKLIST.length}`;
      title.textContent = `${current.t.title} - ${current.t.artist}`;
    } else {
      k.textContent = `${MIX.show} · HKCR`;
      title.textContent = `Hosted by ${MIX.hosts}`;
    }
    main.setAttribute('aria-label', `Open mix tracklist: ${title.textContent}`);
  };

  onTrack((t, i) => {
    if (!firstTrack && isPlaying() && !document.body.classList.contains('tid-open')) announce(t, i);
    firstTrack = false;
    current = { t, i };
    rows.forEach((r, n) => r.classList.toggle('playing', n === i));
    label();
    reveal();
    title.classList.remove('np-swap');
    void title.offsetWidth;
    title.classList.add('np-swap');
  });

  onState((playing) => {
    for (const b of playBtns) {
      b.innerHTML = playing ? icon.pause : icon.play;
      b.setAttribute('aria-label', playing ? 'Pause' : 'Play');
    }
    np.classList.toggle('paused', !playing);
  });

  label();

  playBtns.forEach((b) => b.addEventListener('click', toggle));
  main.addEventListener('click', () => open(!document.body.classList.contains('tid-open')));
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

  // Click or drag anywhere on the bar to scrub; arrows nudge by 10 s.
  const scrub = (e: PointerEvent): void => {
    const r = seekBar.getBoundingClientRect();
    seek(((e.clientX - r.left) / r.width) * duration());
  };
  seekBar.addEventListener('pointerdown', (e) => {
    seekBar.setPointerCapture(e.pointerId);
    scrub(e);
    const move = (ev: PointerEvent): void => scrub(ev);
    seekBar.addEventListener('pointermove', move);
    seekBar.addEventListener('pointerup', () => seekBar.removeEventListener('pointermove', move), { once: true });
  });
  seekBar.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') seek(time() + 10);
    if (e.key === 'ArrowLeft') seek(time() - 10);
  });

  let lastFrame = 0;
  let lastSecond = -1;
  const loop = (stamp: number): void => {
    if (document.hidden || stamp - lastFrame < 1000 / 30) {
      requestAnimationFrame(loop);
      return;
    }
    lastFrame = stamp;
    const now = time();
    const frac = now / duration();
    if (Math.floor(now) !== lastSecond) {
      lastSecond = Math.floor(now);
      tm.textContent = fmt(now);
    }
    bar.style.transform = `scaleX(${frac})`;
    if (document.body.classList.contains('tid-open')) {
      tT.textContent = fmt(now);
      tD.textContent = fmt(duration());
      fill.style.transform = `scaleX(${frac})`;
      seekBar.setAttribute('aria-valuenow', String(Math.round(frac * 100)));
    }
    // A real five-band meter: sub, low, mid, presence, air.
    const v = bands(eq.length);
    // Mastered music sits high in every band; show the movement above that floor.
    eq.forEach((el, n) => {
      const x = Math.max(0, Math.min(1, (v[n] * (1 + n * 0.15) - 0.4) / 0.5));
      el.style.transform = `scaleY(${(0.12 + x * 0.88).toFixed(3)})`;
    });
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
}
