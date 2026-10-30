import './artist-home.css';
import { ARTISTS, MIX, NEXT_RELEASE, OTHER, type Artist } from './data';
import { BLUE, ORANGE } from './duality';
import { mountSequencer } from './sequencer';
import { asset, esc, exists, img, revealOnScroll } from './ui';
import { link, routeHref } from './router';

/**
 * Artist pages: one dark page per artist, told apart by accent (orange for
 * ACND, blue for অপূর্ব) and display face (Doto for ACND, Bengali Hind 700
 * for অপূর্ব). A slim top bar with three page links, and four pages — home
 * (hero, the record and facts, releases, story, credits), listen, sequencer
 * and about. Each fact lives in one place. Content and visuals are the
 * artists' own.
 */

export type Page = 'home' | 'listen' | 'sequencer' | 'about';

/** Logo image with a typeset fallback while the artwork file is absent. */
export const logo = (a: Artist, cls: string): string =>
  `<span class="logo ${cls}${exists(a.logo) ? '' : ' nologo'}"><picture class="pic"><source srcset="${asset(a.logo.replace(/\.png$/, '.webp'))}" type="image/webp" /><img src="${asset(a.logo)}" alt="${esc(a.name)} logo" fetchpriority="high" decoding="async" onerror="this.closest('.logo').classList.add('nologo')" /></picture><span class="logo-text">${esc(a.name)}</span></span>`;

const href = (a: Artist, page: Page): string => routeHref(a.id, page);

/** Escape, and wrap only the Bengali runs, so just those words change face. */
const bn = (s: string): string => esc(s).replace(/[ঀ-৿‌‍]+/g, (m) => `<span class="bn" lang="bn">${m}</span>`);

/** Give an image its intrinsic size, so it holds its box before it loads. */
const sized = (html: string, w: number, h: number): string => html.replace('<img ', `<img width="${w}" height="${h}" `);

/** Brand and the three page links on the left; Back and MENU are fixed beside it. */
function nav(a: Artist, page: Page): string {
  const link = (p: Page, label: string): string =>
    `<a href="${href(a, p)}"${page === p ? ' class="on" aria-current="page"' : ''}>${label}</a>`;
  return `
    <nav class="a-nav" aria-label="${esc(a.latin)}">
      <a class="a-brand" href="${href(a, 'home')}">${logo(a, 'a-brand-mark')}<span>${bn(a.name)}</span></a>
      <div class="a-links">${link('listen', 'Releases')}${link('sequencer', 'Sequencer')}${link('about', 'About')}</div>
    </nav>`;
}

/** Profiles you follow; every other link is somewhere to listen. */
const FOLLOW = new Set(['Instagram', 'Facebook', 'Substack', 'Discord', 'LinkedIn']);

/** The link directory: who and where, the site, listen, follow; legal underneath. */
function footer(a: Artist): string {
  const other = ARTISTS[OTHER[a.id]];
  const out = (l: Artist['links'][number]): string => `<a href="${esc(l.url)}" target="_blank" rel="noopener">${esc(l.label)}</a>`;
  return `
    <footer class="a-foot">
      <div class="a-foot-id"><b>${bn(a.name)}</b><span>${esc(a.origin)}</span><span>© 2026 ${bn(a.name)}</span></div>
      <nav aria-label="I Rave You"><span class="k-label">Site</span><a href="${link()}">I Rave You</a><a href="${link('frequency-unity/')}">Feature: Beyond the Capital</a><a href="${routeHref(other.id)}">${bn(other.name)} →</a></nav>
      <div><span class="k-label">Listen</span>${a.links.filter((l) => !FOLLOW.has(l.label)).map(out).join('')}</div>
      <div><span class="k-label">Follow</span>${a.links.filter((l) => FOLLOW.has(l.label)).map(out).join('')}</div>
      <div class="a-foot-end">
        <nav class="legal-links" aria-label="Legal information"><a href="${asset('legal/terms/')}">Terms of use</a><a href="${asset('legal/privacy/')}">Privacy</a><a href="${asset('legal/copyright/')}">Copyright contact</a></nav>
        <span>Site by <a href="${routeHref('acnd')}">ACND</a></span>
      </div>
    </footer>`;
}

const media = (a: Artist, i: number, cls: string): string => {
  const m = a.media[i % a.media.length];
  return `
    <figure class="a-media ${cls}" data-reveal>
      ${img(m.src, m.caption, 'a-media-img', m.fallback)}
      <figcaption class="k-label"><span>${esc(m.caption)}</span><span>${esc(m.sub)}</span></figcaption>
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

/** A section title as a small plain label; it stays an <h2> for the outline. */
const label = (id: string, text: string): string => `<h2 id="${id}" class="k-label ah-h2">${text}</h2>`;

/** Selected credits, stated plainly: one ruled row each, label in grey. */
function credits(a: Artist): string {
  const other = ARTISTS[OTHER[a.id]];
  const remix = a.id === 'acnd' ? a.extras?.items[0] : undefined;
  const rows: { k: string; b: string; sub: string; url?: string }[] = [
    { k: 'Radio', b: MIX.station, sub: `${MIX.show} — a set with ${other.name}` },
    ...(a.id === 'acnd'
      ? [
          { k: 'Release', b: 'Down In Bossa', sub: 'with Ash Army · out on Profi Music, 30.10.2026 · dist. ADA Central Europe (Warner Music Group)' },
          { k: 'Remix', b: 'Nitol Paye Electric', sub: 'ACND (Ahmed Masum) Remix', url: remix?.url },
        ]
      : []),
    { k: 'With', b: collaborators(a).join(' · '), sub: 'Collaborators' },
  ];
  return `
    <section class="a-credits k-fade" data-reveal aria-labelledby="a-credits-h">
      ${label('a-credits-h', 'Selected credits')}
      <ol class="cred-list">
        ${rows.map((r) => `<li><span class="cred-k k-label">${esc(r.k)}</span><b>${r.url ? `<a href="${esc(r.url)}" target="_blank" rel="noopener">${bn(r.b)}</a>` : bn(r.b)}</b><span class="cred-s">${bn(r.sub)}</span></li>`).join('')}
      </ol>
    </section>`;
}

/* ─────────────────────────────── PAGES ──────────────────────────────── */

/** A cover thumbnail made for grids (public/img/s), else the original. */
const thumb = (src: string): string => {
  const small = `img/s/${src.replace(/^img\//, '').replace(/\.(jpe?g|png|webp)$/, '')}.webp`;
  return exists(small) ? small : src;
};

/** At a glance, beside the lead record: who, where, what they do, how it sounds. */
const FACTS: Record<Artist['id'], [string, string][]> = {
  acnd: [
    ['Artist', 'ACND — read “Ascend”'],
    ['Name', 'Ahmed Masum'],
    ['Based in', 'Dhaka, Bangladesh'],
    ['Role', 'Producer · DJ · Composer'],
    ['Label', 'Independent, not signed to a label'],
    ['Sound', 'Techno, melodic techno, acid, progressive, Afro House'],
  ],
  apurba: [
    ['Artist', 'অপূর্ব (Opurbo)'],
    ['Name', 'Khalid Bin Alam'],
    ['Based in', 'Cumilla, Bangladesh'],
    ['Role', 'Producer · DJ · Sound engineer'],
    ['Since', '2016'],
    ['Sound', 'Psychedelic, melodic, bass, ambient'],
    ['Other selves', 'Euphonic, Zalvix, Luminous Lullabies, Necture Drop'],
  ],
};

/** Hero photos and the small portraits used on the other-artist card, with their pixel sizes. */
const HERO_SIZE: Record<Artist['id'], [number, number]> = { acnd: [1200, 1600], apurba: [375, 375] };
const PORTRAIT: Record<Artist['id'], [string, number, number]> = {
  acnd: ['img/s/portrait-acnd.webp', 720, 960],
  apurba: ['img/s/portrait-apurba.webp', 375, 375],
};

/** What a sets/remixes/other-selves entry is, read from its own title. */
const kind = (title: string): string => (/remix/i.test(title) ? 'Remix' : /\bmix\b|mixtape|\bset\b/i.test(title) ? 'Set' : 'Track');

/**
 * A row of the discography table: year | title | artists | type | ↗. The
 * title link is stretched over the whole row (artist-home.css), so the row is
 * one target and one tab stop. A cell with nothing to say gets a muted dash
 * rather than a hole; a dateless row is marked .none so phones can drop it.
 */
const row = (year: string, title: string, by: string, type: string, url: string): string => `
  <tr>
    <td class="ah-y${year ? '' : ' none'}">${year ? esc(year) : '—'}</td>
    <td class="ah-t"><a href="${esc(url)}" target="_blank" rel="noopener">${esc(title)}</a></td>
    <td class="ah-by">${by ? bn(by) : '—'}</td>
    <td class="ah-type">${esc(type)}</td>
    <td class="ah-go" aria-hidden="true">↗</td>
  </tr>`;

/** অপূর্ব's catalogue: four covers after the lead, then everything else as one ruled table. */
function discography(a: Artist): string {
  const covers = a.releases.slice(1, 5);
  const rest = a.releases.slice(5);
  return `
    <section class="ah-disc k-fade" data-reveal aria-labelledby="ah-disc-h">
      ${label('ah-disc-h', `${a.releases.length} releases`)}
      <div class="ah-grid">
        ${covers.map((r) => `
          <a class="ah-card" href="${esc(r.url)}" target="_blank" rel="noopener" aria-label="${esc(r.title)} by ${esc(r.artists)}, opens in a new tab">
            <span class="ah-card-art">${r.cover ? sized(img(thumb(r.cover), `${r.title} cover art`, 'ah-cover'), 480, 480) : logo(a, 'ah-cover')}</span>
            <b>${esc(r.title)}</b>
            <span class="ah-card-by">${bn(r.artists)}</span>
            <span class="ah-card-y">${esc(r.tag)}</span>
          </a>`).join('')}
      </div>
      <table class="ah-table">
        <thead><tr><th scope="col">Year</th><th scope="col">Title</th><th scope="col">Artists</th><th scope="col">Type</th><th scope="col"><span class="ah-sr">Link</span></th></tr></thead>
        <tbody>${rest.map((r) => row(String(r.year), r.title, r.artists, r.tag === 'Comp' ? 'Compilation' : 'Release', r.url)).join('')}</tbody>
        ${a.extras?.items.length ? `<tbody>
          <tr class="ah-sub"><th colspan="5" scope="colgroup">${esc(a.extras.heading)}</th></tr>
          ${a.extras.items.map((x) => {
            const [title, by = ''] = x.title.split(' — ');
            return row('', title, by, kind(x.title), x.url);
          }).join('')}
        </tbody>` : ''}
      </table>
      <a class="k-link ah-all" href="${href(a, 'listen')}">All releases →</a>
    </section>`;
}

function homePage(a: Artist): string {
  const other = ARTISTS[OTHER[a.id]];
  const acnd = a.id === 'acnd';
  const first = a.releases[0];
  const lead = acnd
    ? { k: 'Out now · 30.10.2026 00:00', t: NEXT_RELEASE.title, s: NEXT_RELEASE.artist, meta: `${NEXT_RELEASE.genre} · Prod. by ACND`, img: NEXT_RELEASE.cover, href: NEXT_RELEASE.presave }
    : { k: `Latest release · ${first.year}`, t: first.title, s: first.artists, meta: '', img: first.cover!, href: first.url };
  const cta = acnd ? `Stream ${NEXT_RELEASE.title} ↗` : `Listen to ${lead.t} ↗`;
  const quote = acnd ? 'Not a category but a feeling: a room, a late hour, and a sound that will not leave.' : 'Language doesn’t matter. Frequency does.';
  const [hw, hh] = HERO_SIZE[a.id];
  const [psrc, pw, ph] = PORTRAIT[other.id];
  return `
    <section class="ah-hero" data-pulse>
      ${sized(img(a.hero, '', 'ah-bg', '', true), hw, hh).replace('<img ', '<img fetchpriority="high" ')}
      <div class="ah-in">
        <h1 class="a-mark ah-mark" aria-label="${esc(a.name)}">${logo(a, 'a-mark-logo')}</h1>
        <p class="ah-sum">${bn(a.about?.summary ?? a.bio[0])}</p>
        <div class="ah-ctas">
          <a class="k-btn k-primary" href="${esc(lead.href)}" target="_blank" rel="noopener" data-cta="artist-lead">${esc(cta)}</a>
          <a class="k-link" href="${esc(a.listen.url)}" target="_blank" rel="noopener" data-cta="artist-follow">Follow on ${esc(a.listen.label)} ↗</a>
        </div>
      </div>
    </section>

    <section class="ah-now k-fade" data-reveal aria-labelledby="ah-now-h">
      ${label('ah-now-h', acnd ? 'The record' : 'Latest release')}
      <div class="ah-now-in">
        <article class="ah-lead">
          <a class="ah-lead-art" href="${esc(lead.href)}" target="_blank" rel="noopener" tabindex="-1" aria-hidden="true">${sized(img(lead.img, `${lead.t} cover art`, 'ah-cover'), 640, 640)}</a>
          <div class="ah-lead-t">
            <span class="k-label">${esc(lead.k)}</span>
            <h3 class="k-display"><a href="${esc(lead.href)}" target="_blank" rel="noopener">${esc(lead.t)}</a></h3>
            <p class="ah-lead-by">${bn(lead.s)}</p>
            ${lead.meta ? `<span class="ah-meta">${esc(lead.meta)}</span>` : ''}
            ${acnd ? `<span class="ah-more"><a class="k-link" href="${href(a, 'listen')}">All releases →</a><a class="k-link" href="${link('music/down-in-bossa/')}">Credits &amp; details →</a></span>` : ''}
          </div>
        </article>
        <dl class="ah-facts k-rows">
          ${FACTS[a.id].map(([k, v]) => `<div><dt class="k-label">${esc(k)}</dt><dd>${bn(v)}</dd></div>`).join('')}
        </dl>
      </div>
    </section>

    ${a.releases.length > 1 ? discography(a) : ''}

    <section class="ah-story k-fade" data-reveal aria-labelledby="ah-story-h">
      ${label('ah-story-h', 'The story')}
      <blockquote class="ah-quote"><p class="ah-q">“${esc(quote)}”</p></blockquote>
      <div class="ah-cols">${(a.about?.paragraphs ?? a.bio).map((p) => `<p>${bn(p)}</p>`).join('')}</div>
      <a class="k-link" href="${href(a, 'about')}">More about ${bn(a.name)} →</a>
    </section>

    ${credits(a)}

    <section class="ah-other">
      <a href="${routeHref(other.id)}" class="ah-other-c k-fade" data-reveal style="--other:${other.id === 'acnd' ? ORANGE : BLUE}">
        <span class="ah-other-art"><img src="${asset(exists(psrc) ? psrc : other.hero)}" alt="" width="${pw}" height="${ph}" loading="lazy" decoding="async" /></span>
        <span class="ah-other-t">
          <span class="k-label">The other half · Qbic Pulse</span>
          <b class="ah-other-n">${bn(other.name)}</b>
          <span class="ah-other-s">${bn(other.about?.summary ?? other.bio[0])}</span>
        </span>
      </a>
    </section>
    ${footer(a)}`;
}

/** Every release as a square cover with its title underneath; the whole card is one link. */
function listenPage(a: Artist): string {
  return `
    <section class="release-portfolio" aria-labelledby="release-heading">
      <header class="release-heading">
        <span class="k-label">${bn(a.name)} · ${a.releases.length} ${a.releases.length === 1 ? 'release' : 'releases'}</span>
        <h1 id="release-heading" class="k-h2">Releases</h1>
        <p>${a.id === 'acnd' ? 'Down In Bossa — Ash Army & ACND. Out now on Profi Music since 30 October 2026, distributed by ADA Central Europe (Warner Music Group).' : bn(a.bio[1])}</p>
      </header>
      <div class="release-grid">
        ${a.releases.map((r, i) => `
          <article class="release-card">
            <a class="release-link" href="${esc(r.url)}" target="_blank" rel="noopener noreferrer" aria-label="Listen to ${esc(r.title)} by ${esc(r.artists)}">
              <div class="release-art">${r.cover ? sized(img(r.cover, `${r.title} cover art`, 'release-cover', '', i < 3), 640, 640) : logo(a, 'release-cover')}</div>
              <div class="release-meta"><span class="k-label">${esc(r.tag)}</span><h2>${esc(r.title)}</h2><p>${bn(r.artists)}</p><span class="release-go">Listen ↗</span></div>
            </a>
          </article>`).join('')}
      </div>
      <p class="release-note">Open releases on their streaming platforms. The Qbic Pulse mix and its tracklist are available in the player below.</p>
    </section>
    ${footer(a)}`;
}

function sequencerPage(): string {
  return `<section class="s-app"><p class="seq-hint">Tap a step to edit. Swipe the grid sideways for all 16 steps.</p><div class="seq-body"></div></section>`;
}

/** The whole story in plain text, then the releases and the other selves as ruled rows. */
function aboutPage(a: Artist): string {
  return `
    <section class="b-bio" aria-labelledby="b-bio-h">
      <div class="b-grid">
        <div class="b-text">
          <h1 id="b-bio-h" class="k-h2">About ${bn(a.name)}</h1>
          <p class="b-sum">${bn(a.about?.summary ?? a.statement)}</p>
          ${(a.about?.paragraphs ?? a.bio).map((p) => `<p class="b-para">${bn(p)}</p>`).join('')}
        </div>
        <aside class="about-summary"><span class="k-label">At a glance</span><p>${esc(a.origin)}</p><p>${esc(a.role)}</p></aside>
      </div>
    </section>

    <section class="a-media-row">${media(a, 2, 'a-media-right')}</section>

    <section class="b-dates k-fade" data-reveal aria-labelledby="b-dates-h">
      <h2 id="b-dates-h" class="k-label">Releases</h2>
      ${a.releases
        .map(
          (r) => `
        <a href="${esc(r.url)}" target="_blank" rel="noopener">
          <span class="b-date-l">${esc(r.title)}</span>
          <span class="b-date-r">${bn(r.artists)}</span>
          <span class="b-date-k">${esc(r.tag)}</span>
        </a>`,
        )
        .join('')}
    </section>

    ${
      a.extras?.items.length
        ? `<section class="b-ids k-fade" data-reveal aria-labelledby="b-ids-h">
      <h2 id="b-ids-h" class="k-label">${esc(a.extras.heading)}</h2>
      ${a.extras.items
        .map((x) => `<a href="${esc(x.url)}" target="_blank" rel="noopener"><span>${bn(x.title)}</span><span aria-hidden="true">↗</span></a>`)
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

  if (page === 'sequencer') cleanup.push(mountSequencer(app.querySelector('.seq-body')!, a.id, MIX.bpm, a.patterns));

  // The bar is clear over the photo hero and turns solid once the hero has
  // scrolled under it; pages without a hero get the solid bar from the start.
  // The hero logo's only motion is the beat: fx.ts writes --lv-beat onto the
  // [data-pulse] hero while the mix plays (never under reduced motion).
  const bar = app.querySelector<HTMLElement>('.a-nav');
  const hero = app.querySelector<HTMLElement>('.ah-hero');
  if (bar && hero) {
    const seen = new IntersectionObserver(([e]) => bar.classList.toggle('solid', !e.isIntersecting), { rootMargin: '-72px 0px 0px 0px' });
    seen.observe(hero);
    cleanup.push(() => seen.disconnect());
  } else bar?.classList.add('solid');

  return () => {
    cleanup.forEach((fn) => fn());
    delete document.body.dataset.page;
  };
}
