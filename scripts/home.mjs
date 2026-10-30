import { existsSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
/**
 * The home feed: everything below the duality hero, as static HTML.
 *
 * It ships inside index.html, so search engines and the first paint get the
 * whole page without running any script; src/home.ts only adds motion,
 * filters and the play buttons on top. Every fact here comes from the same
 * artist, release, set and journal data the rest of the site uses.
 */
const esc = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const bn = (s) => (/[ঀ-৿]/.test(s) ? ' class="bn"' : "");
const ext = 'target="_blank" rel="noopener"';
const ICON_PLAY = '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M8 5v14l11-7z" fill="currentColor"/></svg>';
const ICON_OUT = '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M7 17 17 7M9 7h8v8" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="square"/></svg>';

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const day = (iso) => {
  const d = new Date(iso.length > 10 ? iso : `${iso}T12:00:00Z`);
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
};
/** The 480 px WebP made for grids when there is one, else the original file. */
const SMALL = new Set(existsSync(resolve(import.meta.dirname, "../public/img/s")) ? readdirSync(resolve(import.meta.dirname, "../public/img/s")) : []);
const thumb = (cover) => {
  if (!cover) return "";
  const name = `${cover.replace(/^img\//, "").replace(/\.(jpe?g|png|webp)$/, "")}.webp`;
  return SMALL.has(name) ? `img/s/${name}` : cover;
};
/** Answered on the page and marked up as FAQPage; facts only, from the artists' own bios. */
const FAQ = [
  ["How do you pronounce ACND?", "“Ascend”. ACND is the recording name of Ahmed Masum, a producer, DJ and composer based in Dhaka, Bangladesh."],
  ["Who is অপূর্ব (Opurbo / Apurba)?", "অপূর্ব is the independent electronic music project of Khalid Bin Alam, a self-taught producer and DJ from Cumilla, Bangladesh, making music since 2016."],
  ["What is Qbic Pulse?", "Qbic Pulse is the show ACND and অপূর্ব host on Hong Kong Community Radio. Their shared set opens with “Initiate”, an unreleased collaboration between the two artists, and plays in full on this site."],
  ["Where can I listen to Down In Bossa?", "“Down In Bossa” by Ash Army & ACND is out now on Profi Music, released on 30 October 2026 and distributed by ADA Central Europe, Warner Music Group’s distribution arm. The official smart link opens it on your streaming service."],
];

/** The calendar: confirmed dates from data.ts, plus each set's broadcast. */
export const calendar = (events, sets) =>
  [
    ...events,
    ...sets.map((s) => ({
      title: `${s.show} ${s.volume} on ${s.station}`.replace(/\s+/g, " "),
      start: `${s.date}T12:00:00Z`,
      when: day(s.date),
      status: "done",
      detail: `${s.hosts}. ${s.description}`,
      href: setPath(s),
      cta: "Tracklist & player",
    })),
  ].sort((a, b) => (a.status === b.status ? (a.status === "scheduled" ? a.start.localeCompare(b.start) : b.start.localeCompare(a.start)) : a.status === "scheduled" ? -1 : 1));

const setPath = (set) => (set.slug === "qbic-pulse-vol-1" ? "mixes/qbic-pulse/" : `mixes/${set.slug}/`);

/** Every release, remix and set, newest first, as one catalogue the grid can filter. */
export function catalogue({ artists, next, sets }) {
  const A = artists.apurba;
  const items = [
    {
      title: next.title, by: next.artist, year: 2026, when: "30 Oct 2026", artist: ["acnd"], type: "release",
      cover: next.cover, href: next.presave, page: "music/down-in-bossa/", tag: `${next.genre} · ${next.label}`, hot: true,
    },
    ...sets.map((s) => ({
      title: s.title, by: s.hosts, year: Number(s.date.slice(0, 4)), when: day(s.date), artist: ["acnd", "apurba"], type: "set",
      cover: "img/mix-art.jpg", play: s.slug, page: setPath(s), tag: s.station,
    })),
    {
      title: "Nitol Paye Electric", by: "ACND (Ahmed Masum) Remix", year: 2026, artist: ["acnd"], type: "remix",
      logo: "img/logo-acnd.webp", href: "https://youtu.be/om5QGreRaYg", tag: "Remix · YouTube",
    },
    ...A.releases.map((r) => ({
      title: r.title, by: r.artists, year: r.year, artist: /ACND/.test(r.artists) ? ["apurba", "acnd"] : ["apurba"],
      type: "release", cover: r.cover, href: r.url, tag: r.tag === "Comp" ? "Compilation · Spotify" : "Spotify",
    })),
    { title: "SunSet Chill House Mix 2026", by: "Luminous Lullabies · Set 01", year: 2026, artist: ["apurba"], type: "set", cover: "img/sunset-mix.jpg", href: "https://youtu.be/cCP5bHLnfHw", tag: "Set · YouTube" },
    { title: "Festival Vibe Melodic Bass House Mix", by: "Mixtape01 by ZALVIX", year: 2025, artist: ["apurba"], type: "set", cover: "img/festival-mix.jpg", href: "https://youtu.be/207WAnS77z0", tag: "Set · YouTube" },
    { title: "Hypnotic (ZALVIX & FAMIN Unofficial Remix)", by: "Varski x Abi Flynn", year: 2025, artist: ["apurba"], type: "remix", cover: "img/hypnotic-remix.jpg", href: "https://youtu.be/p_JortMUAI0", tag: "Remix · YouTube" },
  ];
  return items;
}

const card = (it, i) => {
  const art = it.cover
    ? `<img src="${thumb(it.cover)}" alt="${esc(it.title)} cover art" width="480" height="480" loading="lazy" decoding="async">`
    : `<span class="fc-logo"><img src="${it.logo}" alt="" width="160" height="160" loading="lazy" decoding="async"></span>`;
  const main = it.play
    ? `<button class="fc-play" type="button" data-play-set="${esc(it.play)}" data-cta="play-${esc(it.play)}" aria-label="Play ${esc(it.title)} on this site">${ICON_PLAY}</button>`
    : `<a class="fc-play" href="${esc(it.href)}" ${ext} data-cta="listen-card" aria-label="Listen to ${esc(it.title)} (opens in a new tab)">${ICON_OUT}</a>`;
  const titleLink = it.page ? `<a href="${it.page}">${esc(it.title)}</a>` : `<a href="${esc(it.href)}" ${ext}>${esc(it.title)}</a>`;
  return `<article class="fc tilt" data-artist="${it.artist.join(" ")}" data-type="${it.type}" data-reveal style="--i:${i % 8}">
    <div class="fc-art">${art}${it.hot ? '<b class="fc-hot">Out now</b>' : ""}${main}</div>
    <p class="fc-tag mono">${esc(it.type)} · ${esc(it.when ?? it.year)}</p>
    <h3>${titleLink}</h3>
    <p class="fc-by"${bn(it.by)}>${esc(it.by)}</p>
    <p class="fc-meta mono">${esc(it.tag)}</p>
  </article>`;
};

const marquee = (items, cls = "") =>
  `<div class="mq ${cls}" aria-hidden="true"><div class="mq-track">${[0, 1]
    .map(() => `<span>${items.map((t) => `<b>${esc(t)}</b><i>✦</i>`).join("")}</span>`)
    .join("")}</div></div>`;

export function homeFeed({ artists, next, sets, posts, events: confirmed }) {
  const events = calendar(confirmed, sets);
  const A = artists.apurba;
  const C = artists.acnd;
  const set = sets[0];
  const items = catalogue({ artists, next, sets });
  const upcoming = events.filter((e) => e.status === "scheduled");
  const nextEvent = upcoming[0];
  const lead = posts[0];

  const picks = [
    { k: "Out now · via ADA / Warner Music Group", t: next.title, s: `${next.artist} · ${next.label}`, img: next.cover, href: "music/down-in-bossa/" },
    { k: "On air", t: set ? set.title : "Qbic Pulse", s: `${set?.hosts ?? "ACND & অপূর্ব"} · HKCR`, img: "img/mix-art.jpg", href: set ? setPath(set) : "radio/", play: set?.slug },
    { k: "ACND remix", t: "Nitol Paye Electric", s: "ACND (Ahmed Masum) Remix", logo: "img/logo-acnd.webp", href: "https://youtu.be/om5QGreRaYg", out: true },
    { k: "Together", t: "Opening", s: "অপূর্ব, Hridnic, ACND, Prothey", img: "img/opening.jpg", href: A.releases.find((r) => r.title === "Opening")?.url, out: true },
    { k: "অপূর্ব · 2026", t: "1by1", s: "অপূর্ব", img: "img/1by1.jpg", href: A.releases[0].url, out: true },
    { k: "Journal", t: lead.title, s: lead.category, img: lead.image, href: `journal/${lead.slug}/` },
  ];

  const timeline = [
    { y: "2016", t: "অপূর্ব begins", s: "Khalid Bin Alam starts producing in Cumilla, self-taught across production, DJing, mixing and sound design." },
    { y: "2018–23", t: "Euphonic", s: "An open production lab on YouTube: future house, synthwave and remixes." },
    { y: "2025", t: "Opening", s: "অপূর্ব, Hridnic, ACND (Ahmed Masum) and Prothey on one record, then Trance by 3, Progress!ve, VOID, PsyEcho and the London Love compilation." },
    { y: "2026", t: "1by1 · Monolithic Flow", s: "New অপূর্ব releases, with H4PPY and You Make It. from the Luminous Lullabies and Zalvix aliases." },
    ...(set ? [{ y: day(set.date), t: "Qbic Pulse on HKCR", s: `${set.hosts} on Hong Kong Community Radio, opening with their unreleased collaboration “Initiate”.` }] : []),
    { y: "30 Oct 2026", t: "Down In Bossa", s: "Ash Army & ACND, Afro House, out on Profi Music." },
  ];


  return `<div id="home-feed" class="feed" data-pulse>
  ${marquee([`${next.title} · ${next.artist} · out now on ${next.label}`, "Distributed by ADA · Warner Music Group", "Qbic Pulse · Hong Kong Community Radio", "ACND ◐ অপূর্ব", "Electronic music from Bangladesh"], "mq-red")}

  <section class="f-onair" aria-label="On air">
    <span class="f-live mono"><i class="dot"></i>On air</span>
    <span class="f-eq" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></span>
    <span class="f-now"><b data-now-title>${esc(set?.title ?? "Qbic Pulse")}</b><span class="mono" data-now-sub>${esc(set ? `${set.hosts} · ${set.station}` : "")}</span></span>
    ${set ? `<button class="btn btn-play" type="button" data-play-set="${esc(set.slug)}" data-cta="onair-play"><span aria-hidden="true">▶</span> Play the set</button>` : ""}
    <a class="btn btn-ghost" href="radio/" data-cta="onair-radio">All sets</a>
  </section>

  <section class="f-intro" aria-labelledby="discovery-title" data-reveal>
    <p class="eyebrow mono">ACND ◐ অপূর্ব · Dhaka &amp; Cumilla · Bangladesh</p>
    <h1 id="discovery-title" class="f-h1">I Rave You — <span class="sweep">ACND &amp; <span class="bn">অপূর্ব</span></span>, electronic music from Bangladesh</h1>
    <p class="f-lede">Two producers, one frequency. <a href="acnd/">ACND</a> (Ahmed Masum) moves through techno, melodic techno, acid and progressive; <a href="apurba/"><span class="bn">অপূর্ব</span></a> (Khalid Bin Alam) through psychedelic, melodic and bass-driven sound. Together they host <a href="mixes/qbic-pulse/">Qbic Pulse</a> on Hong Kong Community Radio. Press play: the set runs here, end to end.</p>
    <div class="f-ctas">
      <a class="btn btn-hot" href="${esc(next.presave)}" ${ext} data-cta="hero-stream-dib">Stream ${esc(next.title)} ↗</a>
      ${set ? `<button class="btn" type="button" data-play-set="${esc(set.slug)}" data-cta="intro-play"><span aria-hidden="true">▶</span> Play Qbic Pulse</button>` : ""}
      <a class="btn btn-ghost" href="acnd/" data-cta="intro-acnd">Enter ACND</a>
      <a class="btn btn-ghost" href="apurba/" data-cta="intro-apurba">Enter <span class="bn">অপূর্ব</span></a>
    </div>
  </section>

  <section class="f-feature" aria-labelledby="feature-title">
    <article class="f-lead tilt" data-reveal>
      <a class="f-lead-art" href="music/down-in-bossa/" aria-label="${esc(next.title)} release page">
        <img src="img/down-in-bossa.webp" alt="${esc(next.title)} cover art by ${esc(next.artist)}" width="650" height="650" loading="lazy" decoding="async">
        <b class="fc-hot">Out now</b>
      </a>
      <div class="f-lead-text">
        <p class="eyebrow mono">New release · ${esc(next.genre)} · ${esc(next.label)}</p>
        <h2 id="feature-title" class="f-h2">${esc(next.title)}</h2>
        <p class="f-by">${esc(next.artist)}</p>
        <p>Afro House from Ash Army &amp; ACND, out on Profi Music since 30 October 2026 and distributed worldwide by ADA Central Europe, Warner Music Group’s distribution arm: rolling percussion, deep bass and space in the groove. Two versions, the 2:26 original and a 3:24 Extended Edit.</p><p class="f-dist mono">℗ 2026 profimusic · distributed by ADA Central Europe · Warner Music Group</p>
        <div class="f-ctas">
          <a class="btn btn-hot" href="${esc(next.presave)}" ${ext} data-cta="feature-stream">Listen now ↗</a>
          <a class="btn btn-ghost" href="music/down-in-bossa/" data-cta="feature-details">Credits &amp; details</a>
        </div>
      </div>
    </article>
    <aside class="f-picks" aria-labelledby="picks-title">
      <h2 id="picks-title" class="f-h3 mono">● Picks</h2>
      <ol>${picks
        .map(
          (p, i) => `<li data-reveal style="--i:${i}"><a href="${esc(p.href)}" ${p.out ? ext : ""} data-cta="pick-${i}">${
            p.img ? `<img src="${thumb(p.img) || p.img}" alt="" width="64" height="64" loading="lazy" decoding="async">` : `<span class="pk-logo"><img src="${p.logo}" alt="" width="48" height="48" loading="lazy"></span>`
          }<span><span class="pk-k mono">${esc(p.k)}</span><b${bn(p.t)}>${esc(p.t)}</b><span class="pk-s"${bn(p.s)}>${esc(p.s)}</span></span><i aria-hidden="true">${p.out ? "↗" : "→"}</i></a></li>`,
        )
        .join("")}</ol>
    </aside>
  </section>

  <section class="f-new" aria-labelledby="new-title">
    <header class="f-head">
      <h2 id="new-title" class="f-h2"><span class="sweep">New &amp; notable</span></h2>
      <div class="chips" role="group" aria-label="Filter releases and sets">
        <button type="button" class="chip on" data-filter="all" aria-pressed="true">All <sup>${items.length}</sup></button>
        <button type="button" class="chip" data-filter="acnd" aria-pressed="false">ACND</button>
        <button type="button" class="chip" data-filter="apurba" aria-pressed="false"><span class="bn">অপূর্ব</span></button>
        <button type="button" class="chip" data-filter="release" aria-pressed="false">Releases</button>
        <button type="button" class="chip" data-filter="set" aria-pressed="false">Sets</button>
        <button type="button" class="chip" data-filter="remix" aria-pressed="false">Remixes</button>
      </div>
    </header>
    <div class="f-grid">${items.map(card).join("")}</div>
  </section>

  ${marquee(["Producer · DJ · Composer", "Techno · Melodic techno · Acid · Progressive", "Psychedelic · Melodic · Bass · Ambient", "Afro House"], "mq-blue")}

  <section class="f-cal" aria-labelledby="cal-title">
    <header class="f-head">
      <h2 id="cal-title" class="f-h2"><span class="sweep">On the calendar</span></h2>
      ${nextEvent ? `<p class="f-count mono" data-countdown="${esc(nextEvent.start)}">Next: ${esc(nextEvent.title)} · <span data-cd-text>${esc(nextEvent.when)}</span></p>` : ""}
    </header>
    <ol class="cal">${events
      .map(
        (e, i) => `<li data-reveal style="--i:${i}"><details${i === 0 ? " open" : ""}><summary><time datetime="${esc(e.start)}" class="mono">${esc(e.when)}</time><b>${esc(e.title)}</b><span class="cal-st mono st-${e.status}">${e.status === "scheduled" ? "Scheduled" : "Done"}</span></summary><p>${esc(e.detail)}</p>${e.href ? `<a href="${esc(e.href)}" ${/^https?:/.test(e.href) ? ext : ""}>${esc(e.cta)} ${/^https?:/.test(e.href) ? "↗" : "→"}</a>` : ""}</details></li>`,
      )
      .join("")}</ol>
  </section>

  <section class="f-journal" aria-labelledby="journal-title">
    <header class="f-head">
      <h2 id="journal-title" class="f-h2"><span class="sweep">Journal</span></h2>
      <a class="btn btn-ghost" href="journal/" data-cta="journal-all">All ${posts.length} articles →</a>
    </header>
    <div class="jr">${posts
      .slice(0, 7)
      .map(
        (p, i) => `<article class="jr-c${i === 0 ? " jr-lead" : ""} tilt" data-reveal style="--i:${i}"><a href="journal/${esc(p.slug)}/">${
          i < 3 ? `<span class="jr-art"><img src="${esc(thumb(p.image) || p.image)}" alt="${esc(p.imageAlt)}" width="480" height="480" loading="lazy" decoding="async"></span>` : ""
        }<span class="jr-k mono">${esc(p.category)} · ${esc(day(p.date))}</span><h3>${esc(p.title)}</h3>${i === 0 ? `<p>${esc(p.description)}</p>` : ""}<span class="jr-go mono">Read →</span></a></article>`,
      )
      .join("")}<article class="jr-c jr-feature tilt" data-reveal><a href="frequency-unity/"><span class="jr-k mono">Feature</span><h3>Frequency &amp; Unity — <span class="bn">অপূর্ব</span> × ACND</h3><span class="jr-go mono">Read the feature →</span></a></article></div>
  </section>

  <section class="f-seq" aria-labelledby="seq-title">
    <div class="seq-copy" data-reveal>
      <h2 id="seq-title" class="f-h2"><span class="sweep">Play the patterns</span></h2>
      <p>Each artist page has a step sequencer built from their own tracks. Tap steps, swap patterns and play along with the set, in time with the mix.</p>
      <div class="f-ctas"><a class="btn" href="acnd/sequencer/" data-cta="seq-acnd">ACND sequencer</a><a class="btn btn-ghost" href="apurba/sequencer/" data-cta="seq-apurba"><span class="bn">অপূর্ব</span> sequencer</a></div>
    </div>
    <div class="seq-grid" aria-hidden="true">${Array.from({ length: 4 }, (_, r) =>
      `<div class="seq-row"><span class="mono${r < 2 ? "" : ""}">${esc(r < 2 ? C.patterns[r] : A.patterns[r - 2])}</span>${Array.from({ length: 16 }, (_, c) => `<i style="--c:${c};--r:${r}" class="${(c * (r + 3)) % 5 === 0 || c % 4 === r ? "on" : ""}"></i>`).join("")}</div>`,
    ).join("")}</div>
  </section>

  <section class="f-artists" aria-labelledby="artists-title">
    <h2 id="artists-title" class="f-h2"><span class="sweep">The artists</span></h2>
    <div class="ar">
      ${[C, A]
        .map(
          (a) => `<article class="ar-c ar-${a.id} tilt" data-reveal>
        <a href="${a.id}/" data-cta="artist-${a.id}">
          <span class="ar-art"><img src="img/s/portrait-${a.id}.webp" alt="${esc(a.heroAlt)}" width="${a.id === "acnd" ? 720 : 375}" height="${a.id === "acnd" ? 960 : 375}" loading="lazy" decoding="async"><img class="ar-mirror" src="img/s/portrait-${a.id}.webp" alt="" loading="lazy" decoding="async"></span>
          <span class="ar-logo"><img src="${a.logo.replace(/\.png$/, ".webp")}" alt="${esc(a.name)} logo" width="800" height="800" loading="lazy" decoding="async"></span>
          <span class="ar-body">
            <span class="ar-k mono">${esc(a.role)} · ${esc(a.origin)}</span>
            <b class="ar-name${a.id === "apurba" ? " bn" : ""}">${esc(a.name)}</b>
            <span class="ar-sum">${esc(a.about.summary)}</span>
            <span class="ar-tags">${(a.id === "acnd" ? ["Techno", "Melodic techno", "Acid", "Progressive", "Afro House"] : ["Psychedelic", "Melodic", "Bass", "Ambient", "Euphonic · Zalvix · Luminous Lullabies · Necture Drop"])
              .map((t) => `<i>${esc(t)}</i>`)
              .join("")}</span>
            <span class="btn">Enter ${a.id === "apurba" ? '<span class="bn">অপূর্ব</span>' : "ACND"} →</span>
          </span>
        </a>
      </article>`,
        )
        .join("")}
    </div>
  </section>

  <section class="f-arch" aria-labelledby="arch-title">
    <h2 id="arch-title" class="f-h2"><span class="sweep">2016 → 2026</span></h2>
    <ol class="tl">${timeline
      .map((t, i) => `<li data-reveal style="--i:${i}"><span class="tl-y mono">${esc(t.y)}</span><b${bn(t.t)}>${esc(t.t)}</b><p>${esc(t.s)}</p></li>`)
      .join("")}</ol>
  </section>

  <section class="f-close" aria-labelledby="close-title" data-close>
    ${marquee(["Listen", "Play", "Follow", "Repeat"], "mq-big")}
    <div class="close-in" data-reveal>
      <h2 id="close-title" class="f-h2">Hear it where you listen</h2>
      <p>Stream the records on your platform, follow both artists so the next one finds you, or keep Qbic Pulse running here while you read.</p>
      <div class="f-ctas">
        <a class="btn btn-hot" href="${esc(next.presave)}" ${ext} data-cta="close-stream-dib">Stream ${esc(next.title)} ↗</a>
        <a class="btn" href="${esc(C.listen.url)}" ${ext} data-cta="close-spotify-acnd">ACND on Spotify ↗</a>
        <a class="btn" href="${esc(A.listen.url)}" ${ext} data-cta="close-spotify-apurba"><span class="bn">অপূর্ব</span> on Spotify ↗</a>
        ${set ? `<button class="btn btn-ghost" type="button" data-play-set="${esc(set.slug)}" data-cta="close-play">▶ Play Qbic Pulse</button>` : ""}
      </div>
    </div>
  </section>

  <section class="f-faq" aria-labelledby="faq-title">
    <h2 id="faq-title" class="f-h2">Questions</h2>
    ${FAQ.map(([q, a]) => `<details data-reveal><summary${bn(q)}>${esc(q)}</summary><p>${esc(a)}</p></details>`).join("")}
  </section>

  <footer class="f-foot">
    <div><b>I Rave You</b><span>ACND &amp; <span class="bn">অপূর্ব</span> · electronic music from Bangladesh</span></div>
    <nav aria-label="Site"><a href="acnd/">ACND</a><a href="apurba/"><span class="bn">অপূর্ব</span></a><a href="radio/">Qbic Pulse Radio</a><a href="music/down-in-bossa/">Down In Bossa</a><a href="journal/">Journal</a><a href="acnd/press/">Press kit</a><a href="frequency-unity/">Feature</a></nav>
    <nav aria-label="Listen"><a href="${esc(C.listen.url)}" ${ext}>ACND · Spotify</a><a href="https://soundcloud.com/acndlovestoes" ${ext}>ACND · SoundCloud</a><a href="https://www.instagram.com/acnd_music/" ${ext}>ACND · Instagram</a><a href="${esc(A.listen.url)}" ${ext}><span class="bn">অপূর্ব</span> · Spotify</a><a href="https://soundcloud.com/youmeiyou" ${ext}><span class="bn">অপূর্ব</span> · SoundCloud</a><a href="https://instagram.com/i.rave.you" ${ext}>I Rave You · Instagram</a></nav>
    <nav class="legal-links" aria-label="Legal information"><a href="legal/terms/">Terms of use</a><a href="legal/privacy/">Privacy notice</a><a href="legal/copyright/">Copyright contact</a></nav>
  </footer>

  <a class="sticky-cta" href="${esc(next.presave)}" ${ext} data-cta="sticky-stream" hidden><span class="dot"></span>Stream ${esc(next.title)} ↗</a>
</div>`;
}

/** Structured data for the feed: the catalogue, the calendar and the questions above. */
export function homeExtraGraph({ artists, next, sets, events: confirmed, origin }) {
  const events = calendar(confirmed, sets);
  const id = (a) => `${origin}/${a}/#artist`;
  const items = catalogue({ artists, next, sets }).filter((i) => i.type !== "set" || i.play);
  return [
    {
      "@type": "ItemList",
      "@id": `${origin}/#catalogue`,
      name: "Releases, remixes and sets by ACND and অপূর্ব",
      itemListElement: items.map((it, i) => ({
        "@type": "ListItem",
        position: i + 1,
        item: {
          "@type": it.type === "set" ? "MusicPlaylist" : "MusicRecording",
          name: it.title,
          url: it.page ? `${origin}/${it.page}` : it.href,
          byArtist: it.artist.map((a) => ({ "@id": id(a) })),
          ...(it.cover ? { image: `${origin}/${it.cover}` } : {}),
          ...(it.type === "release" && it.title === next.title ? { datePublished: "2026-10-30", recordLabel: { "@type": "Organization", name: next.label, url: "https://www.profimusic.com/" }, copyrightNotice: "℗ 2026 profimusic, distributed by ADA Central Europe" } : {}),
        },
      })),
    },
    ...events
      .filter((e) => e.status === "scheduled")
      .map((e) => ({
        "@type": "MusicEvent",
        name: e.title,
        startDate: e.start,
        eventStatus: "https://schema.org/EventScheduled",
        eventAttendanceMode: "https://schema.org/OnlineEventAttendanceMode",
        location: { "@type": "VirtualLocation", url: e.href },
        performer: [{ "@id": id("acnd") }, { "@id": id("apurba") }],
        organizer: { "@type": "Organization", name: "Hong Kong Community Radio", url: "https://hkcr.live/" },
        description: e.detail,
        image: `${origin}/img/mix-art.jpg`,
      })),
    {
      "@type": "FAQPage",
      "@id": `${origin}/#faq`,
      mainEntity: FAQ.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })),
    },
  ];
}
