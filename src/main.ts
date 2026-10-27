import './style.css';
import { onTrack, sample, trackIndexAt, time } from './audio';
import { ARTISTS, MIX, NEXT_RELEASE, OTHER, TRACKLIST, fmt, type Artist, type ArtistId } from './data';
import { BLUE, ORANGE, mountDuality, type DualityHandle } from './duality';
import { mountSequencer } from './sequencer';
import { asset, esc, img, mountGate, mountNowPlaying, reducedMotion, revealOnScroll } from './ui';

const app = document.getElementById('app')!;
let cleanup: (() => void)[] = [];

const teardown = (): void => {
  cleanup.forEach((fn) => fn());
  cleanup = [];
};

/** Logo image with a typeset fallback while the artwork file is absent. */
const logo = (a: Artist, cls: string): string =>
  `<span class="logo ${cls}"><img src="${asset(a.logo)}" alt="${esc(a.name)} logo" onerror="this.parentNode.classList.add('nologo')" /><span class="logo-text">${esc(a.name)}</span></span>`;

/* ─────────────────────────────── ROUTER ─────────────────────────────── */

const route = (): void => {
  const id = location.hash.replace(/^#\/?/, '') as ArtistId | '';
  teardown();
  window.scrollTo(0, 0);
  if (id === 'acnd' || id === 'apurba') renderArtist(ARTISTS[id]);
  else renderHome();
};

window.addEventListener('hashchange', route);

/* ──────────────────────────────── HOME ──────────────────────────────── */

function renderHome(): void {
  document.body.dataset.view = 'home';
  delete document.body.dataset.artist;
  document.title = 'I RAVE YOU — অপূর্ব ◐ ACND';
  const A = ARTISTS.apurba;
  const C = ARTISTS.acnd;
  const marquee = (words: string[]): string => Array.from({ length: 6 }, () => words.map((w) => `<span>${w}</span>`).join('')).join('');

  app.innerHTML = `
    <main class="home">
      <canvas class="home-canvas" aria-hidden="true"></canvas>
      <header class="home-top">
        <span class="brand">I RAVE YOU<sup>®</sup></span>
        <span class="home-meta mono"><span data-clock>00:00:00</span> · ${MIX.bpm} BPM · <span data-coord>x0 y0</span></span>
      </header>

      <a class="side side-dark" href="#/apurba" data-side="apurba" aria-label="Enter অপূর্ব">
        <span class="side-index mono">01 / DARK · YIN</span>
        ${logo(A, 'side-logo')}
        <span class="side-name bn" data-glitch="${esc(A.name)}">${esc(A.name)}</span>
        <span class="side-sub mono">${esc(A.latin)} — ${esc(A.role)}</span>
        <span class="side-cta">Enter the dark <i>→</i></span>
      </a>

      <a class="side side-light" href="#/acnd" data-side="acnd" aria-label="Enter ACND">
        <span class="side-index mono">02 / LIGHT · YANG</span>
        ${logo(C, 'side-logo')}
        <span class="side-name" data-glitch="${esc(C.name)}">${esc(C.name)}</span>
        <span class="side-sub mono">ASCEND — ${esc(C.role)}</span>
        <span class="side-cta"><i>←</i> Step into the light</span>
      </a>

      <div class="home-center mono" aria-hidden="true">
        <span>◐ ONE PULSE ◑</span>
      </div>

      <div class="ticker ticker-a mono" aria-hidden="true"><div>${marquee(['অপূর্ব', '◐', 'DARK', '✦', 'ACND', '◑', 'LIGHT', '✦'])}</div></div>
      <div class="ticker ticker-b mono" aria-hidden="true"><div>${marquee(['YIN', '—', 'YANG', '—', 'I RAVE YOU', '—', 'LANGUAGE DOESN’T MATTER', '—', 'FREQUENCY DOES', '—'])}</div></div>

      <a class="home-release mono" href="${NEXT_RELEASE.presave}" target="_blank" rel="noopener">
        <b>“${esc(NEXT_RELEASE.title)}”</b> · ${esc(NEXT_RELEASE.label)} · <span data-countdown>…</span> · PRE-SAVE ↗
      </a>
    </main>`;

  const canvas = app.querySelector<HTMLCanvasElement>('.home-canvas')!;
  const fx: DualityHandle = mountDuality(canvas, reducedMotion());
  cleanup.push(() => fx.destroy());

  app.querySelectorAll<HTMLAnchorElement>('.side').forEach((el) => {
    const side = el.dataset.side === 'apurba' ? -1 : 1;
    el.addEventListener('pointerenter', () => {
      fx.lean(-side);
      document.body.dataset.lean = el.dataset.side;
    });
    el.addEventListener('pointerleave', () => {
      fx.lean(0);
      delete document.body.dataset.lean;
    });
    el.addEventListener('click', (e) => {
      e.preventDefault();
      document.body.classList.add('flooding');
      void fx.flood(el.dataset.side as ArtistId, e.clientX || innerWidth / 2, e.clientY || innerHeight / 2).then(() => {
        document.body.classList.remove('flooding');
        location.hash = `#/${el.dataset.side}`;
      });
    });
  });

  const clock = app.querySelector<HTMLElement>('[data-clock]')!;
  const coord = app.querySelector<HTMLElement>('[data-coord]')!;
  const onMove = (e: PointerEvent): void => {
    coord.textContent = `x${Math.round(e.clientX)} y${Math.round(e.clientY)}`;
  };
  window.addEventListener('pointermove', onMove);
  cleanup.push(() => window.removeEventListener('pointermove', onMove));

  // Names breathe with the low end.
  const names = [...app.querySelectorAll<HTMLElement>('.side-name')];
  let raf = 0;
  const loop = (): void => {
    const lv = sample();
    clock.textContent = fmt(time()) + `:${String(Math.floor((time() % 1) * 100)).padStart(2, '0')}`;
    names.forEach((n) => n.style.setProperty('--beat', lv.beat.toFixed(3)));
    raf = requestAnimationFrame(loop);
  };
  raf = requestAnimationFrame(loop);
  cleanup.push(() => cancelAnimationFrame(raf));
  cleanup.push(mountCountdown(app));
}

/* ───────────────────────────── ARTIST PAGE ──────────────────────────── */

function renderArtist(a: Artist): void {
  document.body.dataset.view = 'artist';
  document.body.dataset.artist = a.id;
  document.title = `${a.name} — I RAVE YOU`;
  const other = ARTISTS[OTHER[a.id]];
  const glow = a.id === 'acnd' ? ORANGE : BLUE;
  const heroImg =
    a.id === 'acnd'
      ? img('img/acnd.jpg', a.heroAlt, 'door-img', a.hero)
      : img(a.hero, a.heroAlt, 'door-img');
  const letters = [...a.latin].map((ch, i, all) => {
    const mid = (all.length - 1) / 2;
    return `<span style="--i:${i - mid}">${esc(ch)}</span>`;
  });

  app.innerHTML = `
    <div class="page" style="--glow:${glow}">
      <nav class="nav">
        <a class="nav-logo" href="#/">${logo(a, 'nav-mark')}<span>${esc(a.latin)}<sup>®</sup></span></a>
        <div class="nav-links">
          <a href="#listen" data-jump>Listen</a>
          <a href="#releases" data-jump>Releases</a>
          <a href="#sequencer" data-jump>Sequencer</a>
          <a href="#about" data-jump>About</a>
        </div>
        <div class="nav-info">${a.info.map((l) => `<span>${esc(l)}</span>`).join('')}</div>
      </nav>

      <section class="hero" id="top">
        <span class="hero-side mono">${a.id === 'acnd' ? 'YANG' : 'YIN'}</span>
        <h1 class="chrome ${a.id === 'apurba' ? 'chrome-dark' : ''}" aria-label="${esc(a.name)}">${letters.join('')}</h1>
        ${a.id === 'apurba' ? `<p class="hero-bn bn">${esc(a.name)}</p>` : ''}
        <div class="door">${heroImg}<span class="door-light"></span></div>
        <span class="hero-side hero-side-r mono">${a.id === 'acnd' ? '0' : '1'}</span>
        <a class="hero-scroll mono" href="#statement" data-jump>Scroll ↓</a>
      </section>

      <section class="statement" id="statement">
        <span class="label mono">● ${a.id === 'acnd' ? 'THE LIGHT' : 'THE DARK'}</span>
        <p class="statement-text" data-words>${esc(a.statement)}</p>
      </section>

      <section class="listen" id="listen">
        <div class="panel tracks">
          <div class="panel-head mono"><span>● NOW SPINNING</span><span>${TRACKLIST.length}</span></div>
          <ol class="mixlist">
            ${TRACKLIST.map(
              (t, i) => `
              <li data-i="${i}">
                <a href="${esc(t.url)}" target="_blank" rel="noopener">
                  <span class="ml-at mono">${fmt(t.at)}</span>
                  <span class="ml-title">${esc(t.title)}</span>
                  <span class="ml-artist">${esc(t.artist)}</span>
                  <span class="ml-go">↗</span>
                </a>
              </li>`,
            ).join('')}
          </ol>
        </div>
        <div class="panel vinyl-panel">
          <div class="vinyl" aria-hidden="true">
            <div class="vinyl-disc"><div class="vinyl-label">${logo(a, 'vinyl-logo')}</div></div>
          </div>
          <div class="vinyl-meta mono">
            <span data-now-title>${esc(MIX.title)}</span>
            <span><b data-now-time>00:00</b> · ${MIX.bpm} BPM</span>
          </div>
          <div class="vinyl-bar"><span data-now-bar></span></div>
          <p class="vinyl-note mono">No pause. No skip. It plays because it has to.</p>
        </div>
        <div class="panel note-panel">
          <span class="panel-head mono"><span>● ${esc(a.latin)}</span></span>
          <p>${esc(a.bio[0])}</p>
          <p>${esc(a.bio[1])}</p>
        </div>
      </section>

      ${
        a.id === 'acnd'
          ? `<section class="drop" id="drop">
          <span class="label mono">● NEXT · PROFI MUSIC — ${esc(NEXT_RELEASE.labelNote.toUpperCase())}</span>
          <h2 class="drop-title">${esc(NEXT_RELEASE.title)}</h2>
          <div class="drop-row">
            <span class="drop-count mono" data-countdown>…</span>
            <a class="btn" href="${NEXT_RELEASE.presave}" target="_blank" rel="noopener">Pre-save ↗</a>
          </div>
        </section>`
          : ''
      }

      <section class="releases" id="releases">
        <span class="label mono">● RELEASES</span>
        <ul class="rel-list">
          ${a.releases
            .map(
              (r) => `
            <li data-reveal>
              <a href="${esc(r.url)}" target="_blank" rel="noopener">
                <span class="rel-title">${esc(r.title)}<sup>${esc(r.tag)}</sup></span>
                <span class="rel-artist">${esc(r.artists)}</span>
                ${r.cover ? img(r.cover, `${r.title} cover art`, 'rel-cover') : ''}
              </a>
            </li>`,
            )
            .join('')}
        </ul>
      </section>

      <section class="extras" id="extras">
        <span class="label mono">● ${esc(a.extras.heading.toUpperCase())}</span>
        <ol class="extra-list">
          ${a.extras.items
            .map(
              (x, i) =>
                `<li data-reveal><a href="${esc(x.url)}" target="_blank" rel="noopener"><span class="mono">${String(i + 1).padStart(2, '0')}</span><span>${esc(x.title)}</span><span class="mono">↗</span></a></li>`,
            )
            .join('')}
        </ol>
      </section>

      <section class="seq" id="sequencer">
        <div class="seq-intro">
          <span class="label mono">● SEQUENCER</span>
          <p>Build a loop in ${esc(a.name)}’s key. The mix politely steps aside while you play.</p>
        </div>
        <div class="seq-body"></div>
      </section>

      <section class="about" id="about">
        <span class="label mono">● ${esc(a.latin)}</span>
        <div class="about-grid">
          <p class="about-big" data-words>${esc(a.bio[2])}</p>
          <ol class="about-notes">
            ${a.notes
              .map(
                (n) =>
                  `<li data-reveal><span class="mono">${esc(n.label)}:</span>${n.url ? `<a href="${esc(n.url)}" target="_blank" rel="noopener">${esc(n.text)} ↗</a>` : `<span>${esc(n.text)}</span>`}</li>`,
              )
              .join('')}
          </ol>
        </div>
      </section>

      <section class="other">
        <a href="#/${other.id}" class="other-link" data-other>
          <span class="mono">THE OTHER HALF →</span>
          <span class="other-name ${other.id === 'apurba' ? 'bn' : ''}">${esc(other.name)}</span>
        </a>
      </section>

      <footer class="foot">
        <div class="foot-links">${a.links.map((l) => `<a href="${esc(l.url)}" target="_blank" rel="noopener">${esc(l.label)}</a>`).join('')}</div>
        <div class="foot-meta mono">
          <a href="#/">◐ I RAVE YOU</a>
          <span>${esc(a.origin)}</span>
          <span>©2026 ${esc(a.latin)}</span>
        </div>
        <div class="foot-word" aria-hidden="true">${esc(a.latin)}</div>
      </footer>
    </div>`;

  app.querySelectorAll<HTMLAnchorElement>('[data-jump]').forEach((l) =>
    l.addEventListener('click', (e) => {
      e.preventDefault();
      app.querySelector(l.getAttribute('href')!)?.scrollIntoView({ behavior: reducedMotion() ? 'auto' : 'smooth' });
    }),
  );

  const io = revealOnScroll(app);
  cleanup.push(() => io.disconnect());
  cleanup.push(mountSequencer(app.querySelector('.seq-body')!, a.id, MIX.bpm));
  cleanup.push(mountCountdown(app));

  // Highlight the playing ID in the list, spin the record with the music.
  const items = [...app.querySelectorAll<HTMLElement>('.mixlist li')];
  const nowTitle = app.querySelector<HTMLElement>('[data-now-title]')!;
  const off = onTrack((t, i) => {
    items.forEach((li, k) => li.classList.toggle('playing', k === i));
    nowTitle.textContent = `${t.artist} — ${t.title}`;
  });
  cleanup.push(off);
  const nowTime = app.querySelector<HTMLElement>('[data-now-time]')!;
  const nowBar = app.querySelector<HTMLElement>('[data-now-bar]')!;
  const disc = app.querySelector<HTMLElement>('.vinyl-disc')!;
  const chrome = app.querySelector<HTMLElement>('.chrome')!;
  let angle = 0;
  let raf = 0;
  const loop = (): void => {
    const lv = sample();
    const now = time();
    const i = trackIndexAt(now);
    const start = TRACKLIST[i].at;
    const end = TRACKLIST[i + 1]?.at ?? 2743;
    nowTime.textContent = fmt(now);
    nowBar.style.transform = `scaleX(${(now - start) / (end - start)})`;
    angle += 0.6 + lv.low * 2;
    disc.style.transform = `rotate(${angle}deg)`;
    chrome.style.setProperty('--beat', lv.beat.toFixed(3));
    chrome.style.setProperty('--sy', String(Math.min(1, window.scrollY / innerHeight)));
    raf = requestAnimationFrame(loop);
  };
  raf = requestAnimationFrame(loop);
  cleanup.push(() => cancelAnimationFrame(raf));

  // Hero letters follow the pointer a little.
  const onMove = (e: PointerEvent): void => {
    const x = e.clientX / innerWidth - 0.5;
    const y = e.clientY / innerHeight - 0.5;
    chrome.style.setProperty('--rx', `${-y * 14}deg`);
    chrome.style.setProperty('--ry', `${x * 18}deg`);
  };
  window.addEventListener('pointermove', onMove);
  cleanup.push(() => window.removeEventListener('pointermove', onMove));
}

/* ───────────────────────────── COUNTDOWN ────────────────────────────── */

function mountCountdown(root: ParentNode): () => void {
  const els = [...root.querySelectorAll<HTMLElement>('[data-countdown]')];
  const target = new Date(NEXT_RELEASE.date).getTime();
  const tick = (): void => {
    const d = target - Date.now();
    const txt =
      d <= 0
        ? 'OUT NOW'
        : `${Math.floor(d / 864e5)}D ${String(Math.floor(d / 36e5) % 24).padStart(2, '0')}H ${String(Math.floor(d / 6e4) % 60).padStart(2, '0')}M ${String(Math.floor(d / 1e3) % 60).padStart(2, '0')}S`;
    els.forEach((e) => (e.textContent = txt));
  };
  tick();
  const id = setInterval(tick, 1000);
  return () => clearInterval(id);
}

/* ─────────────────────────────── BOOT ───────────────────────────────── */

route();
mountNowPlaying();
void mountGate({
  kicker: 'অপূর্ব ◐ ACND',
  line: 'Two artists. One pulse. 45 minutes that do not stop.',
  cta: 'Click to enter',
});
