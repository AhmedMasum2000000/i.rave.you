import { onTrack, sample, time, trackIndexAt } from './audio';
import { ARTISTS, MIX, OTHER, TRACKLIST, fmt, type Artist, type MixTrack } from './data';
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

const dur = (i: number): number => (TRACKLIST[i + 1]?.at ?? 2743) - TRACKLIST[i].at;

function nav(a: Artist, page: Page): string {
  const link = (p: Page, label: string): string =>
    `<a href="${href(a, p)}" class="${page === p ? 'on' : ''}">${label}</a>`;
  return `
    <nav class="a-nav">
      <a class="a-brand" href="${href(a, 'home')}">${logo(a, 'a-brand-mark')}<span>${esc(a.latin)}<sup>®</sup></span></a>
      <div class="a-links">${link('listen', 'Listen')}${link('sequencer', 'Sequencer')}${link('about', 'About')}</div>
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
      <div><a href="#/">I Rave You</a><a href="#/${other.id}" class="${other.id === 'apurba' ? 'bn' : ''}">${esc(other.name)} →</a></div>
      ${col(a.links.slice(0, half))}
      ${col(a.links.slice(half))}
      <span>${esc(a.origin)}</span>
    </footer>
    <a class="a-sleeve" href="#/" aria-label="Back to I Rave You">
      <span class="a-sleeve-art"><span>I RAVE YOU</span><span class="bn">অপূর্ব ◐ ACND</span></span>
    </a>`;
}

const media = (a: Artist, i: number, cls: string): string => {
  const m = a.media[i % a.media.length];
  return `
    <figure class="a-media ${cls}" data-reveal>
      ${img(m.src, m.caption, 'a-media-img')}
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
        <div class="a-door">${img(a.id === 'acnd' ? 'img/acnd.jpg' : a.hero, a.heroAlt, 'a-door-img', a.hero)}</div>
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
      <p class="a-big a-intro" data-words>${sup(a.essay.intro)}</p>
      ${a.essay.blocks
        .map(
          (b, i) => `
        <div class="a-block a-block-${i % 3}">
          <span class="a-side mono">${esc(b.label)}</span>
          <p class="a-big" data-words>${sup(b.text)}</p>
        </div>`,
        )
        .join('')}
    </section>

    <section class="a-tracklist">
      ${TRACKLIST.map(
        (t, i) => `
        <a href="${esc(t.url)}" target="_blank" rel="noopener" data-i="${i}">
          <span class="mono">${String(i + 1).padStart(2, '0')}</span>${esc(t.title.replace(/ \(.*\)$/, ''))} <em>(${fmt(t.at)})</em>
        </a>`,
      ).join('')}
    </section>

    <section class="a-media-row">
      ${media(a, 1, 'a-media-right')}
    </section>

    <section class="a-bio">
      <span class="a-label mono">● ${esc(a.latin)}</span>
      <p class="a-big a-intro" data-words>${esc(a.bio[0])} ${esc(a.bio[1])}</p>
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
  const sides = [TRACKLIST.slice(0, 8), TRACKLIST.slice(8)];
  const row = (t: MixTrack, i: number): string => `
    <a href="${esc(t.url)}" target="_blank" rel="noopener" data-i="${i}">
      <span>${esc(t.title.replace(/ \(.*\)$/, ''))}<sup>${i < 8 ? 'A' : 'B'}${(i % 8) + 1}</sup></span>
      <span class="mono">(${fmt(dur(i))})</span>
    </a>`;
  return `
    <section class="l-app">
      <div class="l-left">
        <div class="l-tracks">
          <div class="panel-head mono"><span>● Tracks</span><span>${TRACKLIST.length}</span></div>
          ${sides.map((s, k) => `<div class="l-side${k === 0 ? ' on' : ''}" data-side="${k}">${s.map((t) => row(t, TRACKLIST.indexOf(t))).join('')}</div>`).join('')}
          <div class="l-tabs mono"><button data-tab="0" class="on">aSide</button><button data-tab="1">bSide</button></div>
        </div>
        <div class="l-vinyl"><div class="l-disc"><div class="l-label">${logo(a, 'l-label-logo')}</div></div></div>
        <div class="l-player mono">
          <span class="l-eq" aria-hidden="true"><i></i><i></i><i></i></span>
          <span class="l-title" data-now-title>${esc(MIX.title)}</span>
          <span><b data-now-time>00:00</b>/<span data-now-dur>00:00</span></span>
          <span>BPM ${MIX.bpm}</span>
          <span class="l-bar"><span data-now-bar></span></span>
        </div>
      </div>
      ${media(a, 0, 'l-media')}
      <div class="l-desc">
        <div class="panel-head mono"><span data-now-k>● Now playing</span></div>
        <p class="l-desc-title" data-now-big>—</p>
        <p data-now-artist></p>
        <p>${esc(a.essay.intro)}</p>
        <a data-now-link target="_blank" rel="noopener" href="#">Open this ID ↗</a>
      </div>
    </section>`;
}

function sequencerPage(): string {
  return `<section class="s-app"><div class="seq-body"></div></section>`;
}

function aboutPage(a: Artist): string {
  return `
    <section class="b-bio">
      <span class="a-label mono">● ${esc(a.latin)}</span>
      <div class="b-grid">
        <div class="b-text">
          <p class="a-big a-intro" data-words>${sup(a.essay.intro)}</p>
          ${a.essay.blocks.map((b) => `<p class="b-para" data-words>${sup(b.text)}</p>`).join('')}
          ${a.bio.map((p) => `<p class="b-para" data-words>${esc(p)}</p>`).join('')}
        </div>
        ${footnotes(a)}
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

    <section class="b-ids">
      <span class="a-label mono">● ${esc(a.extras.heading)}</span>
      ${a.extras.items
        .map(
          (x, i) =>
            `<a href="${esc(x.url)}" target="_blank" rel="noopener" data-reveal><span class="mono">${String(i + 1).padStart(2, '0')}</span><span>${esc(x.title)}</span><span class="mono">↗</span></a>`,
        )
        .join('')}
    </section>
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

  // Everything that follows the playing ID: list highlights, titles, links.
  const items = [...app.querySelectorAll<HTMLElement>('[data-i]')];
  const set = (sel: string, fn: (el: HTMLElement) => void): void => app.querySelectorAll<HTMLElement>(sel).forEach(fn);
  cleanup.push(
    onTrack((t, i) => {
      items.forEach((el) => el.classList.toggle('playing', Number(el.dataset.i) === i));
      set('[data-now-title]', (el) => (el.textContent = `${t.artist} - ${t.title}`));
      set('[data-now-big]', (el) => (el.textContent = t.title));
      set('[data-now-artist]', (el) => (el.textContent = `${t.artist} · ID ${String(i + 1).padStart(2, '0')} of ${TRACKLIST.length} · in at ${fmt(t.at)}`));
      set('[data-now-dur]', (el) => (el.textContent = fmt(dur(i))));
      set('[data-now-link]', (el) => el.setAttribute('href', t.url));
      // Follow the playing side on the listen page.
      const side = i < 8 ? 0 : 1;
      app.querySelectorAll<HTMLElement>('.l-side').forEach((s) => s.classList.toggle('on', Number(s.dataset.side) === side));
      app.querySelectorAll<HTMLElement>('[data-tab]').forEach((b) => b.classList.toggle('on', Number(b.dataset.tab) === side));
    }),
  );

  app.querySelectorAll<HTMLButtonElement>('[data-tab]').forEach((b) =>
    b.addEventListener('click', () => {
      app.querySelectorAll<HTMLElement>('.l-side').forEach((s) => s.classList.toggle('on', s.dataset.side === b.dataset.tab));
      app.querySelectorAll<HTMLElement>('[data-tab]').forEach((x) => x.classList.toggle('on', x === b));
    }),
  );

  const nowTime = app.querySelector<HTMLElement>('[data-now-time]');
  const nowBar = app.querySelector<HTMLElement>('[data-now-bar]');
  const disc = app.querySelector<HTMLElement>('.l-disc');
  const hero = app.querySelector<HTMLElement>('.a-hero');
  const eq = [...app.querySelectorAll<HTMLElement>('.l-eq i')];
  let angle = 0;
  let raf = 0;
  const loop = (): void => {
    const lv = sample();
    const now = time();
    const i = trackIndexAt(now);
    if (nowTime) nowTime.textContent = fmt(now - TRACKLIST[i].at);
    if (nowBar) nowBar.style.transform = `scaleX(${(now - TRACKLIST[i].at) / dur(i)})`;
    if (disc) {
      angle += 0.5 + lv.low * 2;
      disc.style.transform = `rotate(${angle}deg)`;
    }
    eq.forEach((e, k) => (e.style.transform = `scaleY(${0.2 + Math.min(1, [lv.low, lv.mid, lv.high][k] * 2.4)})`));
    if (hero) {
      hero.style.setProperty('--beat', lv.beat.toFixed(3));
      hero.style.setProperty('--sy', String(Math.min(1, window.scrollY / innerHeight)));
    }
    raf = requestAnimationFrame(loop);
  };
  raf = requestAnimationFrame(loop);
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
