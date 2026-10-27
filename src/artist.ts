import { sample } from './audio';
import { ARTISTS, MIX, OTHER, type Artist } from './data';
import { BLUE, ORANGE } from './duality';
import { mountSequencer } from './sequencer';
import { asset, esc, img, reducedMotion, revealOnScroll } from './ui';

/**
 * Artist pages, laid out after ascension.pegassi.be: a grained black canvas,
 * a top bar with three page links and a stacked info block, and four pages —
 * home (hero, annotated essay, tracklist, media, bio), listen, sequencer and
 * about. Content, copy and visuals are the artists' own.
 */

export type Page = 'home' | 'listen' | 'sequencer' | 'about';

/** Logo image with a typeset fallback while the artwork file is absent. */
export const logo = (a: Artist, cls: string): string =>
  `<span class="logo ${cls}"><img src="${asset(a.logo)}" alt="${esc(a.name)} logo" onerror="this.parentNode.classList.add('nologo')" /><span class="logo-text">${esc(a.name)}</span></span>`;

/** `^n` in copy becomes a superscript footnote marker. */
const sup = (text: string): string => esc(text).replace(/\^(\d+)/g, '<sup>$1</sup>');

const href = (a: Artist, page: Page): string => (page === 'home' ? `#/${a.id}` : `#/${a.id}/${page}`);

function nav(a: Artist, page: Page): string {
  const link = (p: Page, label: string): string =>
    `<a href="${href(a, p)}" class="${page === p ? 'on' : ''}">${label}</a>`;
  return `
    <nav class="a-nav">
      <a class="a-brand" href="${href(a, 'home')}">${logo(a, 'a-brand-mark')}<span>${esc(a.latin)}</span></a>
      <div class="a-links">${link('listen', 'Releases')}${link('sequencer', 'Sequencer')}${link('about', 'About')}</div>
      <div class="a-info">${a.info.map((l) => `<span>${esc(l)}</span>`).join('')}</div>
    </nav>`;
}

function footer(a: Artist): string {
  const other = ARTISTS[OTHER[a.id]];
  const half = Math.ceil(a.links.length / 2);
  const col = (ls: typeof a.links): string =>
    `<div>${ls.map((l) => `<a href="${esc(l.url)}" target="_blank" rel="noopener">${esc(l.label)}</a>`).join('')}</div>`;
  return `
    <footer class="a-foot">
      <span>${esc(a.latin)} 2026</span>
      <nav class="legal-links" aria-label="Legal information"><a href="${asset('legal/terms/')}">Terms</a><a href="${asset('legal/privacy/')}">Privacy</a><a href="${asset('legal/copyright/')}">Copyright contact</a></nav>
      <div><a href="#/">I Rave You</a><a href="frequency-unity/">Feature: Beyond the Capital</a><a href="#/${other.id}" class="${other.id === 'apurba' ? 'bn' : ''}">${esc(other.name)} →</a></div>
      ${col(a.links.slice(0, half))}
      ${col(a.links.slice(half))}
      <span>${esc(a.origin)}<br /><span class="credit">Site by <a href="#/acnd">ACND</a></span></span>
    </footer>
    <a class="a-sleeve" href="#/" aria-label="Back to I Rave You">
      <span class="a-sleeve-art"><span>I RAVE YOU</span><span class="bn">অপূর্ব ◐ ACND</span></span>
    </a>`;
}

const media = (a: Artist, i: number, cls: string): string => {
  const m = a.media[i % a.media.length];
  return `
    <figure class="a-media ${cls}" data-reveal>
      ${img(m.src, m.caption, 'a-media-img', m.fallback)}
      <figcaption class="mono"><span>● ${esc(m.caption)}</span><span>${esc(m.sub)}</span></figcaption>
    </figure>`;
};

const footnotes = (a: Artist): string => `
  <ol class="a-notes">
    ${a.footnotes
      .map(
        (f, i) => `
      <li data-reveal>
        <span class="a-note-n">${i + 1}</span>
        <span>${esc(f.text)}${f.link ? `<a href="${esc(f.link.url)}" target="_blank" rel="noopener">${esc(f.link.label)} ↗</a>` : ''}</span>
      </li>`,
      )
      .join('')}
  </ol>`;

/* ─────────────────────────────── PAGES ──────────────────────────────── */

function homePage(a: Artist): string {
  const sparks = [
    [8, 30],
    [93, 22],
    [16, 78],
    [86, 70],
    [50, 4],
  ]
    .map(([x, y], i) => `<i class="spark" style="left:${x}%;top:${y}%;--d:${i * 0.7}s"></i>`)
    .join('');
  return `
    <section class="a-hero">
      <span class="a-hero-l mono">Mix</span>
      <span class="a-hero-r mono">01</span>
      <a class="a-hero-listen" href="${esc(a.listen.url)}" target="_blank" rel="noopener">${esc(a.listen.label)}</a>
      <div class="a-scene">
        <div class="a-door">${img(a.id === 'acnd' ? 'img/acnd.jpg' : 'img/apurba.jpg', a.heroAlt, 'a-door-img', a.hero)}</div>
        <div class="a-stairs" aria-hidden="true">${'<i></i>'.repeat(7)}</div>
      </div>
      <h1 class="a-mark" aria-label="${esc(a.name)}">
        ${logo(a, 'a-mark-logo')}
        <span class="a-sheen" style="--logo:url('${asset(a.logo)}')" aria-hidden="true"></span>
        ${sparks}
      </h1>
    </section>

    <section class="a-essay">
      <span class="a-label mono">● The mix</span>
      <p class="a-big a-intro">${sup(a.essay.intro)}</p>
      ${a.essay.blocks
        .map(
          (b, i) => `
        <div class="a-block a-block-${i % 3}">
          <span class="a-side mono">${esc(b.label)}</span>
          <p class="a-big">${sup(b.text)}</p>
        </div>`,
        )
        .join('')}
    </section>

    <section class="a-media-row">
      ${media(a, 1, 'a-media-right')}
    </section>

    <section class="a-bio">
      <span class="a-label mono">● ${esc(a.latin)}</span>
      <p class="a-big a-intro">${esc(a.bio[0])} ${esc(a.bio[1])}</p>
    </section>

    <section class="a-columns">
      ${media(a, 0, 'a-media-left')}
      ${footnotes(a)}
      <div class="a-ab">
        <div data-reveal><span class="mono">A:</span><b>Where it starts.</b><p>${esc(a.bio[0])}</p></div>
        <div data-reveal><span class="mono">B:</span><b>What comes next.</b><p>${esc(a.bio[2])}</p></div>
        <a class="a-more" href="${href(a, 'about')}">More about ${esc(a.latin)} <span>→</span></a>
      </div>
    </section>
    ${footer(a)}`;
}

function listenPage(a: Artist): string {
  return `
    <section class="release-portfolio" aria-labelledby="release-heading">
      <header class="release-heading">
        <span class="a-label mono">● ${esc(a.latin)} · ${a.releases.length} ${a.releases.length === 1 ? 'release' : 'releases'}</span>
        <h1 id="release-heading">${a.id === 'acnd' ? 'Coming next.' : 'Selected releases.'}</h1>
        <p>${a.id === 'acnd' ? 'Down In Bossa — Ash Army & ACND. Upcoming on Profi Music, 30 October 2026.' : esc(a.bio[1])}</p>
      </header>
      <div class="release-grid">
        ${a.releases.map((r) => `
          <article class="release-card">
            <a class="release-art" href="${esc(r.url)}" target="_blank" rel="noopener noreferrer" aria-label="${a.id === 'acnd' ? 'Pre-save' : 'Listen to'} ${esc(r.title)} by ${esc(r.artists)}">
              ${r.cover ? img(r.cover, `${r.title} cover art`, 'release-cover') : logo(a, 'release-cover')}
              <span>${a.id === 'acnd' ? 'Pre-save' : 'Listen'} ↗</span>
            </a>
            <div class="release-meta"><span class="mono">${esc(r.tag)}</span><h2>${esc(r.title)}</h2><p>${esc(r.artists)}</p></div>
          </article>`).join('')}
      </div>
      <p class="release-note">Open releases on their streaming platforms. The Qbic Pulse mix and its tracklist are available in the player below.</p>
    </section>
    ${footer(a)}`;
}

function sequencerPage(): string {
  return `<section class="s-app"><p class="seq-hint">Tap a step to edit. Swipe the grid sideways for all 16 steps.</p><div class="seq-body"></div></section>`;
}

function aboutPage(a: Artist): string {
  return `
    <section class="b-bio">
      <span class="a-label mono">● ${esc(a.latin)}</span>
      <div class="b-grid">
        <div class="b-text">
          <h1 class="a-big a-intro">${esc(a.about?.summary ?? a.statement)}</h1>
          ${(a.about?.paragraphs ?? a.bio).map((p) => `<p class="b-para">${esc(p)}</p>`).join('')}
        </div>
        <aside class="about-summary"><span class="a-label mono">● At a glance</span><p>${esc(a.origin)}</p><p>${esc(a.role)}</p></aside>
      </div>
    </section>

    <section class="a-media-row">${media(a, 2, 'a-media-right')}</section>

    <section class="b-dates">
      <span class="a-label mono">● Releases</span>
      ${a.releases
        .map(
          (r) => `
        <a href="${esc(r.url)}" target="_blank" rel="noopener" data-reveal>
          <span class="b-date-l">${esc(r.title)}<sup>${esc(r.tag)}</sup></span>
          <span class="b-date-r">${esc(r.artists)}</span>
        </a>`,
        )
        .join('')}
    </section>

    ${
      a.extras?.items.length
        ? `<section class="b-ids">
      <span class="a-label mono">● ${esc(a.extras.heading)}</span>
      ${a.extras.items
        .map(
          (x, i) =>
            `<a href="${esc(x.url)}" target="_blank" rel="noopener" data-reveal><span class="mono">${String(i + 1).padStart(2, '0')}</span><span>${esc(x.title)}</span><span class="mono">↗</span></a>`,
        )
        .join('')}
    </section>`
        : ''
    }
    ${footer(a)}`;
}

/* ─────────────────────────────── MOUNT ──────────────────────────────── */

export function renderArtist(app: HTMLElement, a: Artist, page: Page): () => void {
  const cleanup: (() => void)[] = [];
  document.body.dataset.view = 'artist';
  document.body.dataset.artist = a.id;
  document.body.dataset.page = page;
  document.title = `${page === 'home' ? '' : `${page[0].toUpperCase()}${page.slice(1)} · `}${a.name} — I RAVE YOU`;
  const glow = a.id === 'acnd' ? ORANGE : BLUE;
  const body =
    page === 'listen' ? listenPage(a) : page === 'sequencer' ? sequencerPage() : page === 'about' ? aboutPage(a) : homePage(a);

  app.innerHTML = `<div class="a-page" style="--glow:${glow}">${nav(a, page)}<main class="a-main">${body}</main></div>`;

  const io = revealOnScroll(app);
  cleanup.push(() => io.disconnect());

  if (page === 'sequencer') cleanup.push(mountSequencer(app.querySelector('.seq-body')!, a.id, MIX.bpm, a.patterns));

  const hero = app.querySelector<HTMLElement>('.a-hero');
  let raf = 0;
  let lastFrame = 0;
  const frameGap = matchMedia('(pointer: coarse)').matches ? 1000 / 30 : 1000 / 60;
  const loop = (stamp: number): void => {
    if (document.hidden || window.scrollY > innerHeight || stamp - lastFrame < frameGap) {
      raf = requestAnimationFrame(loop);
      return;
    }
    lastFrame = stamp;
    const lv = sample();
    if (hero) {
      hero.style.setProperty('--beat', lv.beat.toFixed(3));
      hero.style.setProperty('--sy', String(Math.min(1, window.scrollY / innerHeight)));
    }
    raf = requestAnimationFrame(loop);
  };
  if (hero && !reducedMotion()) raf = requestAnimationFrame(loop);
  cleanup.push(() => cancelAnimationFrame(raf));

  if (hero && !reducedMotion()) {
    const onMove = (e: PointerEvent): void => {
      hero.style.setProperty('--px', String(e.clientX / innerWidth - 0.5));
      hero.style.setProperty('--py', String(e.clientY / innerHeight - 0.5));
    };
    window.addEventListener('pointermove', onMove);
    cleanup.push(() => window.removeEventListener('pointermove', onMove));
  }

  return () => {
    cleanup.forEach((fn) => fn());
    delete document.body.dataset.page;
  };
}
