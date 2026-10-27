import { duration, isPlaying, onState, onTrack, sample, seek, skip, time, toggle } from './audio';
import { MIX, TRACKLIST, fmt, type MixTrack } from './data';
import { esc } from './ui';

/**
 * The background player.
 *
 * Everywhere: a small chip, bottom left, with play/pause and elapsed time.
 * On the home page only: the chip names the current track ID and opens the
 * full Track ID panel — every track of the HKCR set, click to jump, prev/next
 * and a seekable progress bar.
 */

const icon = {
  play: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 2.5v11l9-5.5z"/></svg>',
  pause: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3.5 2.5h3v11h-3zM9.5 2.5h3v11h-3z"/></svg>',
  prev: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 2.5h2v11H3zM13 2.5v11L5.5 8z"/></svg>',
  next: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M11 2.5h2v11h-2zM3 2.5v11L10.5 8z"/></svg>',
};

const isHome = (): boolean => document.body.dataset.view === 'home';

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
  panel.setAttribute('aria-label', 'Track ID');
  panel.innerHTML = `
    <header class="tid-head">
      <div class="tid-title">
        <span class="mono">● Track ID</span>
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
          <a href="${esc(t.url)}" target="_blank" rel="noopener" aria-label="Open ${esc(t.title)}">↗</a>
        </li>`,
      ).join('')}
    </ol>`;

  document.body.append(panel, np);

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

  let current: { t: MixTrack; i: number } | null = null;
  let lastHome: boolean | null = null;

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
    if (on) {
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

  /** The chip names the track ID on home only; elsewhere it names the show. */
  const label = (): void => {
    const home = isHome();
    if (home && current) {
      k.textContent = `TRACK ID · ${String(current.i + 1).padStart(2, '0')}/${TRACKLIST.length}`;
      title.textContent = `${current.t.title} - ${current.t.artist}`;
    } else {
      k.textContent = `${MIX.show} · HKCR`;
      title.textContent = `Hosted by ${MIX.hosts}`;
    }
    main.disabled = !home;
    if (!home) open(false);
  };

  onTrack((t, i) => {
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

  playBtns.forEach((b) => b.addEventListener('click', toggle));
  main.addEventListener('click', () => open(!document.body.classList.contains('tid-open')));
  panel.addEventListener('click', (e) => {
    const el = (e.target as HTMLElement).closest<HTMLElement>('[data-act], [data-seek]');
    if (!el) return;
    if (el.dataset.seek) {
      seek(Number(el.dataset.seek));
      if (!isPlaying()) toggle();
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

  const loop = (): void => {
    const home = isHome();
    if (home !== lastHome) {
      lastHome = home;
      label();
    }
    const lv = sample();
    const now = time();
    const frac = now / duration();
    tm.textContent = fmt(now);
    bar.style.transform = `scaleX(${frac})`;
    if (document.body.classList.contains('tid-open')) {
      tT.textContent = fmt(now);
      tD.textContent = fmt(duration());
      fill.style.transform = `scaleX(${frac})`;
      seekBar.setAttribute('aria-valuenow', String(Math.round(frac * 100)));
    }
    const v = [lv.low, lv.mid, lv.high, lv.mid * 0.8, lv.low * 0.7];
    eq.forEach((el, n) => (el.style.transform = `scaleY(${isPlaying() ? 0.15 + Math.min(1, v[n] * 2.2) : 0.15})`));
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
}
