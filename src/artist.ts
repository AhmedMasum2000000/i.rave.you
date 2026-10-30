import { playSet, sample } from './audio';
import './artist-home.css';
import { ARTISTS, MIX, NEXT_RELEASE, OTHER, SETS, type Artist } from './data';
import { BLUE, ORANGE } from './duality';
import { mountSequencer } from './sequencer';
import { asset, esc, exists, img, reducedMotion, revealOnScroll, typewrite } from './ui';
import { link, routeHref } from './router';

/**
 * Artist pages, laid out after ascension.pegassi.be: a grained black canvas,
 * a top bar with three page links and a stacked info block, and four pages —
 * home (hero, annotated essay, tracklist, media, bio), listen, sequencer and
 * about. Content, copy and visuals are the artists' own.
 */

export type Page = 'home' | 'listen' | 'sequencer' | 'about';

/** Logo image with a typeset fallback while the artwork file is absent. */
export const logo = (a: Artist, cls: string): string =>
  `<span class="logo ${cls}${exists(a.logo) ? '' : ' nologo'}"><picture class="pic"><source srcset="${asset(a.logo.replace(/\.png$/, '.webp'))}" type="image/webp" /><img src="${asset(a.logo)}" alt="${esc(a.name)} logo" fetchpriority="high" decoding="async" onerror="this.closest('.logo').classList.add('nologo')" /></picture><span class="logo-text">${esc(a.name)}</span></span>`;

const href = (a: Artist, page: Page): string => routeHref(a.id, page);

function nav(a: Artist, page: Page): string {
  const link = (p: Page, label: string): string =>
    `<a href="${href(a, p)}" class="${page === p ? 'on' : ''}">${label}</a>`;
  return `
    <nav class="a-nav" data-pulse>
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
      <nav class="legal-links" aria-label="Legal information"><a href="${asset('legal/terms/')}">Terms of use</a><a href="${asset('legal/privacy/')}">Privacy</a><a href="${asset('legal/copyright/')}">Copyright contact</a></nav>
      <div><a href="${link()}">I Rave You</a><a href="${link('frequency-unity/')}">Feature: Beyond the Capital</a><a href="${routeHref(other.id)}" class="${other.id === 'apurba' ? 'bn' : ''}">${esc(other.name)} →</a></div>
      ${col(a.links.slice(0, half))}
      ${col(a.links.slice(half))}
      <span>${esc(a.origin)}<br /><span class="credit">Site by <a href="${routeHref('acnd')}">ACND</a></span></span>
    </footer>`;
}

const media = (a: Artist, i: number, cls: string): string => {
  const m = a.media[i % a.media.length];
  return `
    <figure class="a-media ${cls}" data-reveal>
      ${img(m.src, m.caption, 'a-media-img', m.fallback)}
      <figcaption class="mono"><span>● ${esc(m.caption)}</span><span>${esc(m.sub)}</span></figcaption>
    </figure>`;
};

/** Everyone credited alongside this artist on their releases. */
const collaborators = (a: Artist): string[] => {
  const names = new Set<string>();
  for (const r of a.releases)
    for (const n of r.artists.split('·')[0].split(/,|&/)) {
      const name = n.replace(/\(.*?\)/g, '').trim();
      if (name && name !== a.name && name !== a.latin && name !== 'Various Artists') names.add(name);
    }
  names.add(ARTISTS[OTHER[a.id]].name);
  return [...names];
};

/** Selected credits: the record, stated plainly. */
function credits(a: Artist): string {
  const other = ARTISTS[OTHER[a.id]];
  const rows: [string, string, string][] = [
    ['Radio', MIX.station, `${MIX.show} — a set with ${other.name}`],
    ...(a.id === 'acnd'
      ? ([
          ['Label', 'Profi Music', 'Down In Bossa with Ash Army · 30.10.2026 · dist. ADA Central Europe (Warner Music Group)'],
          ['Remix', 'Nitol Paye Electric', 'ACND remix'],
        ] as [string, string, string][])
      : ([['Catalogue', `${a.releases.length} releases`, 'Spotify · Apple Music · SoundCloud']] as [string, string, string][])),
    ['With', collaborators(a).join(' · '), 'Collaborators'],
  ];
  return `
    <section class="a-credits">
      <span class="a-label mono" data-type>● Selected credits</span>
      <ol class="cred-list">
        ${rows.map(([k, b, sub], i) => `<li data-reveal style="--d:${i}"><span class="cred-k mono">${esc(k)}</span><b class="${/[\u0980-\u09FF]/.test(b) ? 'bn' : ''}">${esc(b)}</b><span class="cred-s">${esc(sub)}</span></li>`).join('')}
      </ol>
    </section>`;
}

/* ─────────────────────────────── PAGES ──────────────────────────────── */

/** A cover thumbnail made for grids (public/img/s), else the original. */
const thumb = (src: string): string => {
  const small = `img/s/${src.replace(/^img\//, '').replace(/\.(jpe?g|png|webp)$/, '')}.webp`;
  return exists(small) ? small : src;
};

const ICON_PLAY = '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M8 5v14l11-7z" fill="currentColor"/></svg>';

/** At a glance, beside the lead record. */
const FACTS: Record<Artist['id'], [string, string][]> = {
  acnd: [['Artist', 'ACND — read “Ascend”'], ['Name', 'Ahmed Masum'], ['Based in', 'Dhaka, Bangladesh'], ['Latest', 'Down In Bossa · Profi Music'], ['Distribution', 'ADA · Warner Music Group']],
  apurba: [['Artist', 'অপূর্ব (Opurbo)'], ['Name', 'Khalid Bin Alam'], ['Based in', 'Cumilla, Bangladesh'], ['Since', '2016']],
};

/** Genres and selves, scrolling under the hero. */
const GENRES: Record<Artist['id'], string[]> = {
  acnd: ['Techno', 'Melodic techno', 'Acid', 'Progressive', 'Afro House', 'Dhaka', 'Producer · DJ · Composer'],
  apurba: ['Psychedelic', 'Melodic', 'Bass', 'Ambient', 'Euphonic', 'Zalvix', 'Luminous Lullabies', 'Necture Drop', 'Cumilla'],
};

function homePage(a: Artist): string {
  const other = ARTISTS[OTHER[a.id]];
  const lead = a.id === 'acnd'
    ? { k: `Out now · ${NEXT_RELEASE.genre} · ${NEXT_RELEASE.label} · dist. ADA / Warner Music Group`, t: NEXT_RELEASE.title, s: NEXT_RELEASE.artist, img: NEXT_RELEASE.cover, href: NEXT_RELEASE.presave, cta: 'Stream it ↗', more: link('music/down-in-bossa/') }
    : { k: `Latest release · ${a.releases[0].year}`, t: a.releases[0].title, s: a.releases[0].artists, img: a.releases[0].cover!, href: a.releases[0].url, cta: 'Listen on Spotify ↗', more: '' };
  const quote = a.id === 'apurba' ? 'Language doesn’t matter. Frequency does.' : 'Not a category but a feeling: a room, a late hour, and a sound that will not leave.';
  const set = SETS[0];
  const mq = [0, 1].map(() => `<span>${GENRES[a.id].map((g) => `<b>${esc(g)}</b><i>✦</i>`).join('')}</span>`).join('');
  return `
    <section class="ah-hero" data-pulse>
      <div class="ah-bg" aria-hidden="true">
        <img src="${asset(a.hero)}" alt="" fetchpriority="high" decoding="async" />
        <img class="ah-mirror" src="${asset(a.hero)}" alt="" decoding="async" />
      </div>
      <div class="ah-in">
        <p class="ah-k mono">${esc(a.role)} · ${esc(a.origin)}</p>
        <h1 class="a-mark ah-mark" aria-label="${esc(a.name)}">
          ${logo(a, 'a-mark-logo')}
          <span class="a-sheen" style="--logo:url('${asset(a.logo)}')" aria-hidden="true"></span>
        </h1>
        <p class="ah-sum">${esc(a.about?.summary ?? a.bio[0])}</p>
        <div class="ah-ctas">
          ${set ? `<button class="ah-btn ah-hot" type="button" data-play-set="${esc(set.slug)}" data-cta="artist-play">${ICON_PLAY} Play Qbic Pulse</button>` : ''}
          <a class="ah-btn" href="${esc(lead.href)}" target="_blank" rel="noopener" data-cta="artist-lead">${esc(a.id === 'acnd' ? `Stream ${NEXT_RELEASE.title} ↗` : `Listen to ${lead.t} ↗`)}</a>
          <a class="ah-btn ah-ghost" href="${esc(a.listen.url)}" target="_blank" rel="noopener" data-cta="artist-follow">Follow on ${esc(a.listen.label)} ↗</a>
        </div>
      </div>
      <div class="ah-mq" aria-hidden="true"><div class="ah-mq-t">${mq}</div></div>
    </section>

    <section class="ah-now">
      <a class="ah-lead" href="${esc(lead.href)}" target="_blank" rel="noopener" data-reveal>
        <span class="ah-lead-art">${img(lead.img, `${lead.t} cover art`, 'ah-cover')}</span>
        <span class="ah-lead-t">
          <span class="mono ah-k">${esc(lead.k)}</span>
          <b>${esc(lead.t)}</b>
          <span class="${/[\u0980-\u09FF]/.test(lead.s) ? 'bn' : ''}">${esc(lead.s)}</span>
          <span class="ah-btn ah-hot">${esc(lead.cta)}</span>
        </span>
      </a>
      <dl class="ah-facts" data-reveal>
        ${FACTS[a.id].map(([k, v]) => `<div><dt class="mono">${esc(k)}</dt><dd class="${/[\u0980-\u09FF]/.test(v) ? 'bn' : ''}">${esc(v)}</dd></div>`).join('')}
      </dl>
    </section>

    <section class="ah-disc" aria-labelledby="ah-disc-h">
      <header class="ah-head"><h2 id="ah-disc-h" class="ah-h2">${a.releases.length === 1 ? 'The record' : `${a.releases.length} releases`}</h2><a class="ah-btn ah-ghost" href="${href(a, 'listen')}">All releases →</a></header>
      <div class="ah-grid">
        ${a.releases.map((r, i) => `
          <a class="ah-card" href="${esc(r.url)}" target="_blank" rel="noopener" style="--i:${i % 6}" data-reveal aria-label="${esc(r.title)} by ${esc(r.artists)}, opens in a new tab">
            <span class="ah-card-art">${r.cover ? img(thumb(r.cover), `${r.title} cover art`, 'ah-cover') : logo(a, 'ah-cover')}<i aria-hidden="true">↗</i></span>
            <span class="mono ah-k">${esc(r.tag)}</span>
            <b>${esc(r.title)}</b>
            <span class="${/[\u0980-\u09FF]/.test(r.artists) ? 'bn' : ''}">${esc(r.artists)}</span>
          </a>`).join('')}
      </div>
      ${a.extras?.items.length ? `<div class="ah-extras" data-reveal><h3 class="mono">● ${esc(a.extras.heading)}</h3>${a.extras.items.map((x) => `<a href="${esc(x.url)}" target="_blank" rel="noopener"><span>${esc(x.title)}</span><i aria-hidden="true">↗</i></a>`).join('')}</div>` : ''}
    </section>

    <section class="ah-story" aria-labelledby="ah-story-h">
      <h2 id="ah-story-h" class="ah-h2">The story</h2>
      <blockquote class="ah-quote" data-reveal><p>“${esc(quote)}”</p></blockquote>
      <div class="ah-cols">${(a.about?.paragraphs ?? a.bio).map((p, i) => `<p data-reveal style="--i:${i}">${esc(p)}</p>`).join('')}</div>
      <a class="ah-btn ah-ghost" href="${href(a, 'about')}">More about ${esc(a.latin)} →</a>
    </section>

    ${credits(a)}

    <section class="ah-links" aria-labelledby="ah-links-h">
      <h2 id="ah-links-h" class="ah-h2">Listen &amp; follow</h2>
      <div class="ah-pills">${a.links.map((l, i) => `<a class="ah-btn${i === 0 ? ' ah-hot' : ''}" href="${esc(l.url)}" target="_blank" rel="noopener" data-cta="artist-link-${i}">${esc(l.label)} ↗</a>`).join('')}</div>
    </section>

    <section class="ah-other">
      <a href="${routeHref(other.id)}" class="ah-other-c" data-reveal>
        <span class="mono ah-k">The other half · Qbic Pulse</span>
        <b class="${other.id === 'apurba' ? 'bn' : ''}">${esc(other.name)} →</b>
        <span>${esc(other.about?.summary ?? other.bio[0])}</span>
      </a>
    </section>
    ${footer(a)}`;
}

function listenPage(a: Artist): string {
  return `
    <section class="release-portfolio" aria-labelledby="release-heading">
      <header class="release-heading">
        <span class="a-label mono" data-type>● ${esc(a.latin)} · ${a.releases.length} ${a.releases.length === 1 ? 'release' : 'releases'}</span>
        <h1 id="release-heading" data-type>${a.id === 'acnd' ? 'Coming next.' : 'Selected releases.'}</h1>
        <p>${a.id === 'acnd' ? 'Down In Bossa — Ash Army & ACND. Out now on Profi Music since 30 October 2026, distributed by ADA Central Europe (Warner Music Group).' : esc(a.bio[1])}</p>
      </header>
      <div class="release-grid">
        ${a.releases.map((r, i) => `
          <article class="release-card">
            <a class="release-art" href="${esc(r.url)}" target="_blank" rel="noopener noreferrer" aria-label="Listen to ${esc(r.title)} by ${esc(r.artists)}">
              ${r.cover ? img(r.cover, `${r.title} cover art`, 'release-cover', '', i < 3) : logo(a, 'release-cover')}
              <span>Listen ↗</span>
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
      <span class="a-label mono" data-type>● ${esc(a.latin)}</span>
      <div class="b-grid">
        <div class="b-text">
          <h1 class="a-big a-intro" data-type>${esc(a.about?.summary ?? a.statement)}</h1>
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
    ${credits(a)}
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
  cleanup.push(typewrite(app));

  if (page === 'sequencer') cleanup.push(mountSequencer(app.querySelector('.seq-body')!, a.id, MIX.bpm, a.patterns));

  const hero = app.querySelector<HTMLElement>('.ah-hero, .a-hero');

  const onPlay = (e: Event): void => {
    const b = (e.target as Element).closest<HTMLElement>('[data-play-set]');
    if (!b) return;
    e.preventDefault();
    playSet(b.dataset.playSet!);
  };
  app.addEventListener('click', onPlay);
  cleanup.push(() => app.removeEventListener('click', onPlay));
  let raf = 0;
  let lastFrame = 0;
  const frameGap = matchMedia('(pointer: coarse)').matches ? 1000 / 30 : 1000 / 60;
  const loop = (stamp: number): void => {
    // Past the hero, settle it fully faded once (a fast scroll can skip the last frames).
    if (hero && window.scrollY > innerHeight && hero.style.getPropertyValue('--sy') !== '1') hero.style.setProperty('--sy', '1');
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
