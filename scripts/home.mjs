import { existsSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
/**
 * The home feed: everything below the duality hero, as static HTML.
 *
 * It ships inside index.html, so search engines and the first paint get the
 * whole page without running any script; src/home.ts only adds the filters,
 * the play buttons, the countdown and one fade per block on top. Every fact
 * here comes from the same artist, release, set and journal data the rest of
 * the site uses.
 */
const esc = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const ext = 'target="_blank" rel="noopener"';
const ICON_PLAY = '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M8 5v14l11-7z" fill="currentColor"/></svg>';

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
      title: `${s.show} ${s.volume} published on I Rave You`.replace(/\s+/g, " "),
      start: `${s.date}T12:00:00Z`,
      when: day(s.date),
      detail: `${s.hosts}. ${s.description}`,
      href: setPath(s),
      cta: "Tracklist & player",
    })),
  ]
    // Upcoming or past is worked out from the date at build time, never hand-set.
    .map((e) => ({ ...e, status: Date.parse(e.start) > Date.now() ? "scheduled" : "done" }))
    .sort((a, b) => (a.status === b.status ? (a.status === "scheduled" ? a.start.localeCompare(b.start) : b.start.localeCompare(a.start)) : a.status === "scheduled" ? -1 : 1));

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
      title: "Nitol Paye Electric", by: "ACND (Ahmed Masum) Remix", when: "YouTube", artist: ["acnd"], type: "remix",
      logo: "img/logo-acnd.webp", href: "https://youtu.be/om5QGreRaYg", tag: "Remix · YouTube",
    },
    ...A.releases.map((r) => ({
      title: r.title, by: r.artists, year: r.year, artist: /ACND/.test(r.artists) ? ["apurba", "acnd"] : ["apurba"],
      type: "release", cover: r.cover, href: r.url, tag: r.tag === "Comp" ? "Compilation · Spotify" : "Spotify",
    })),
    { title: "SunSet Chill House Mix 2026", by: "Luminous Lullabies · Set 01", year: 2026, artist: ["apurba"], type: "set", cover: "img/sunset-mix.jpg", href: "https://youtu.be/cCP5bHLnfHw", tag: "Set · YouTube" },
    { title: "Festival Vibe Melodic Bass House Mix", by: "Mixtape01 by ZALVIX", when: "YouTube", artist: ["apurba"], type: "set", cover: "img/festival-mix.jpg", href: "https://youtu.be/207WAnS77z0", tag: "Set · YouTube" },
    { title: "Hypnotic (ZALVIX & FAMIN Unofficial Remix)", by: "ZALVIX & FAMIN · original by Varski x Abi Flynn", when: "YouTube", artist: ["apurba"], type: "remix", cover: "img/hypnotic-remix.jpg", href: "https://youtu.be/p_JortMUAI0", tag: "Remix · YouTube" },
  ];
  return items;
}

/** Escape, then wrap each run of Bengali in .bn, so only those words change face. */
const bnw = (s) => esc(s).replace(/[ঀ-৿‌‍]+/g, (m) => `<span class="bn">${m}</span>`);
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const isExt = (href) => /^https?:/.test(href);

/**
 * The one line under a card: type and date, then whatever the tag adds that is
 * not already said. The space before each dot is non-breaking, so a wrapped
 * line never starts with "·"; short parts ("Profi Music") never split, long
 * ones ("Hong Kong Community Radio") may, or they would overflow a phone column.
 */
const metaLine = (it) => {
  const seen = new Set();
  return [cap(it.type), String(it.when ?? it.year), ...(it.tag ? it.tag.split(" · ") : [])]
    .filter((p) => !seen.has(p.toLowerCase()) && seen.add(p.toLowerCase()))
    .map((p) => (p.length <= 14 ? `<span class="fc-m">${esc(p)}</span>` : esc(p)))
    .join("&nbsp;· ");
};

/**
 * A catalogue card: square cover, title, credits, one meta line. The title link
 * is stretched over the whole card; a playable set also gets the one in-page
 * play button, which sits above that link.
 */
const card = (it) => {
  const href = it.page ?? it.href;
  const out = isExt(href);
  const art = it.cover
    ? `<img src="${thumb(it.cover)}" alt="${esc(it.title)} cover art" width="480" height="480" loading="lazy" decoding="async">`
    : `<span class="fc-logo"><img src="${it.logo}" alt="" width="160" height="160" loading="lazy" decoding="async"></span>`;
  const play = it.play
    ? `<button class="fc-play" type="button" data-play-set="${esc(it.play)}" data-cta="play-${esc(it.play)}" aria-label="Play ${esc(it.title)} on this site" aria-pressed="false">${ICON_PLAY}</button>`
    : "";
  return `<article class="fc" data-artist="${it.artist.join(" ")}" data-type="${it.type}">
      <div class="fc-art">${art}${play}</div>
      <h3><a href="${esc(href)}"${out ? ` ${ext} data-cta="listen-card"` : ""}>${bnw(it.title)}${out ? '<span class="fc-out" aria-hidden="true"> ↗</span><span class="vh"> (opens in a new tab)</span>' : ""}</a></h3>
      <p class="fc-by">${bnw(it.by)}</p>
      <p class="fc-meta">${metaLine(it)}</p>
    </article>`;
};

/**
 * Below the hero, in three chapters, each thing said once:
 *   Music    intro (who, the next broadcast, the set) · the record · the catalogue
 *   Artists  the two of them · 2016 → 2026
 *   Reading  journal · questions · footer
 */
export function homeFeed({ artists, next, sets, posts, events: confirmed }) {
  const events = calendar(confirmed, sets);
  const A = artists.apurba;
  const C = artists.acnd;
  const set = sets[0];
  const items = catalogue({ artists, next, sets });
  const [nx, ...later] = events.filter((e) => e.status === "scheduled");

  // The story, then every dated thing that has happened (and anything booked after the next date).
  const dated = [
    ...confirmed.filter((e) => Date.parse(e.start) <= Date.now()),
    ...sets.map((s) => ({
      title: `${s.show} ${s.volume.replace(/ /g, " ")} published on I Rave You`,
      start: `${s.date}T12:00:00Z`,
      when: day(s.date),
      detail: s.description,
      href: setPath(s),
      cta: "Tracklist & player",
    })),
  ].sort((a, b) => Date.parse(a.start) - Date.parse(b.start));
  const story = [
    { y: "2016", t: "অপূর্ব begins", s: "Khalid Bin Alam starts producing in Cumilla, self-taught across production, DJing, mixing and sound design." },
    { y: "2018–23", t: "Euphonic", s: "An open production lab on YouTube: future house, synthwave and remixes." },
    { y: "2025", t: "Opening", s: "অপূর্ব, Hridnic, ACND (Ahmed Masum) and Prothey on one record, then Trance by 3, Progress!ve, VOID, PsyEcho and the London Love compilation." },
    { y: "2026", t: "1by1 · Monolithic Flow", s: "New অপূর্ব releases, with H4PPY and You Make It. from the Luminous Lullabies and Zalvix aliases." },
    ...[...dated, ...later].map((e) => ({ y: e.when, at: e.start, t: e.title, s: e.detail, href: e.href, cta: e.cta })),
  ];

  const genres = { acnd: "Techno, melodic techno, acid, progressive, Afro House", apurba: "Psychedelic, melodic, bass, ambient" };
  const lead = posts.find((p) => p.slug === "ahmed-masum-acnd-name-guide") ?? posts[0];
  // The ACND portrait already heads his artist card two screens up; a lead
  // whose own image is that portrait shows the Qbic Pulse art instead.
  const leadImg =
    lead.image === "img/acnd-portrait.webp"
      ? { src: "img/mix-art.webp", alt: "Qbic Pulse cover art: a yin-yang ringed in blue and orange", w: 512, h: 512 }
      : { src: thumb(lead.image) || lead.image, alt: lead.imageAlt, w: 1200, h: 900 };
  // Every tab says how many cards it leaves, counted the way home.ts filters.
  const count = (key) => items.filter((it) => it.artist.includes(key) || it.type === key).length;
  const link = (href, label) => `<a class="k-link" href="${esc(href)}"${isExt(href) ? ` ${ext}` : ""}>${esc(label)} ${isExt(href) ? "↗" : "→"}</a>`;

  // Without JS nothing marks a block .in, and the older [data-reveal] rules
  // (style.css, fx.css) would hide the feed for good; this shows it as is.
  return `<div id="home-feed" class="feed">
  <noscript><style>.feed [data-reveal]{opacity:1;transform:none}</style></noscript>
  <section class="f-intro" aria-labelledby="discovery-title">
    <div class="k-fade" data-reveal>
      <p class="k-label">Dhaka &amp; Cumilla · Bangladesh</p>
      <h1 id="discovery-title" class="f-h1">I Rave You — ACND&nbsp;&amp;&nbsp;<span class="bn">অপূর্ব</span>, electronic music from Bangladesh</h1>
    </div>
    <div class="f-intro-cols k-fade" data-reveal>
      <div>
        <p class="f-lede">Two producers, one frequency. <a class="n-acnd" href="acnd/">ACND</a> (Ahmed Masum) moves through techno, melodic techno, acid and progressive; <a class="n-apurba" href="apurba/"><span class="bn">অপূর্ব</span></a> (Khalid Bin Alam) through psychedelic, melodic and bass-driven sound. Together they host <a href="mixes/qbic-pulse/">Qbic Pulse</a> on Hong Kong Community Radio. Press play: the set runs here, end to end.</p>
        ${set ? `<div class="f-acts"><button class="k-btn f-play" type="button" data-play-set="${esc(set.slug)}" data-cta="intro-play" aria-pressed="false"><span aria-hidden="true">▶</span> Play ${esc(set.show)}</button><span class="f-eq" data-pulse aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></span></div>` : ""}
      </div>
      ${nx ? `<div class="f-next">
        <p class="k-label">Next broadcast</p>
        <p class="f-next-t">${bnw(nx.title)}</p>
        <p class="f-next-when" data-countdown="${esc(nx.start)}"><time datetime="${esc(nx.start)}">${esc(nx.when)}</time><span data-cd-text></span></p>
        <p class="f-next-d">${bnw(nx.detail)}</p>
        ${nx.href ? link(nx.href, nx.cta) : ""}
      </div>` : ""}
    </div>
  </section>

  <section class="f-record" aria-labelledby="feature-title">
    <article class="f-rec k-fade" data-reveal>
      <a class="f-rec-art" href="music/down-in-bossa/" aria-label="${esc(next.title)} release page">
        <img src="img/down-in-bossa.webp" alt="${esc(next.title)} cover art by ${esc(next.artist)}" width="650" height="650" loading="lazy" decoding="async">
      </a>
      <div class="f-rec-text">
        <p class="k-label">Out now · ${esc(next.genre)} · ${esc(next.label)}</p>
        <h2 id="feature-title" class="k-display f-rec-t">${esc(next.title)}</h2>
        <p class="f-rec-by">${esc(next.artist)}</p>
        <p class="f-rec-p">Afro House from Ash Army &amp; ACND, out on Profi Music since 30 October 2026 and distributed by ADA Central Europe, Warner Music Group’s distribution arm: rolling percussion, deep bass and space in the groove. Two versions, the 2:26 original and a 3:24 Extended Edit.</p>
        <p class="f-dist">℗ 2026 profimusic, distributed by ADA Central Europe</p>
        <div class="f-acts">
          <a class="k-btn k-primary" href="${esc(next.presave)}" ${ext} data-cta="feature-stream">Listen ↗</a>
          <a class="k-link" href="music/down-in-bossa/" data-cta="feature-details">Credits &amp; details →</a>
        </div>
      </div>
    </article>
  </section>

  <section class="f-cat" aria-labelledby="new-title">
    <h2 id="new-title" class="k-h2">Releases, sets &amp; remixes</h2>
    <div class="k-tabs f-tabs" role="group" aria-label="Filter releases and sets">
      <button type="button" class="k-tab on" data-filter="all" aria-pressed="true">All<sup>${items.length}</sup></button>
      <button type="button" class="k-tab" data-filter="acnd" aria-pressed="false">ACND<sup>${count("acnd")}</sup></button>
      <button type="button" class="k-tab" data-filter="apurba" aria-pressed="false"><span class="bn">অপূর্ব</span><sup>${count("apurba")}</sup></button>
      <button type="button" class="k-tab" data-filter="release" aria-pressed="false">Releases<sup>${count("release")}</sup></button>
      <button type="button" class="k-tab" data-filter="set" aria-pressed="false">Sets<sup>${count("set")}</sup></button>
      <button type="button" class="k-tab" data-filter="remix" aria-pressed="false">Remixes<sup>${count("remix")}</sup></button>
    </div>
    <div class="f-grid k-fade" data-reveal>
    ${items.map(card).join("\n    ")}
    </div>
  </section>

  <section class="f-artists f-ch" aria-labelledby="artists-title">
    <h2 id="artists-title" class="k-h2">The artists</h2>
    <div class="ar k-fade" data-reveal>
      ${[C, A]
        .map(
          (a) => `<article class="ar-c ar-${a.id}">
        <div class="ar-art">
          <img src="img/s/portrait-${a.id}.webp" alt="${esc(a.heroAlt)}" width="${a.id === "acnd" ? 720 : 375}" height="${a.id === "acnd" ? 960 : 375}" loading="lazy" decoding="async">
          <h3 class="ar-name k-display"><a href="${a.id}/" data-cta="artist-${a.id}">${bnw(a.name)}</a></h3>
        </div>
        <div class="ar-body">
          <p class="k-label">${bnw(a.role)} · ${esc(a.origin)}</p>
          <p class="ar-sum">${bnw(a.about.summary)}</p>
          <p class="ar-genres">${genres[a.id]}</p>
          ${a.id === "apurba" ? '<p class="ar-also">Other selves: Euphonic, Zalvix, Luminous Lullabies, Necture Drop</p>' : ""}
          <p class="ar-seq"><a class="k-link" href="${a.id}/sequencer/" data-cta="seq-${a.id}">Sequencer →</a> <span>${a.patterns.map(bnw).join(", ")}</span></p>
        </div>
      </article>`,
        )
        .join("\n      ")}
    </div>
    <p class="f-note">Each artist page has a step sequencer built from their own tracks. Tap steps, swap patterns and play along with the set, in time with the mix.</p>
  </section>

  <section class="f-arch" aria-labelledby="arch-title">
    <h2 id="arch-title" class="k-h2">2016 → 2026</h2>
    <ol class="k-rows tl k-fade" data-reveal>
      ${story
        .map(
          (r) => `<li>${r.at ? `<time class="tl-y" datetime="${esc(r.at)}">${esc(r.y)}</time>` : `<span class="tl-y">${esc(r.y)}</span>`}<h3 class="tl-t">${bnw(r.t)}</h3><div class="tl-s"><p>${bnw(r.s)}</p>${r.href ? link(r.href, r.cta) : ""}</div></li>`,
        )
        .join("\n      ")}
    </ol>
  </section>

  <section class="f-journal f-ch" aria-labelledby="journal-title">
    <h2 id="journal-title" class="k-h2">Journal</h2>
    <div class="jr k-fade" data-reveal>
      <article class="jr-lead">
        <span class="jr-art"><img src="${esc(leadImg.src)}" alt="${esc(leadImg.alt)}" width="${leadImg.w}" height="${leadImg.h}" loading="lazy" decoding="async"></span>
        <p class="k-label">${esc(lead.category)} · ${esc(day(lead.date))}</p>
        <h3><a href="journal/${esc(lead.slug)}/">${bnw(lead.title)}</a></h3>
        <p>${bnw(lead.description)}</p>
      </article>
      <div class="jr-side">
        <ul class="k-rows jr-list">
          ${posts
            .filter((p) => p !== lead)
            .map((p) => `<li><a href="journal/${esc(p.slug)}/"><span class="k-label">${esc(p.category)} · ${esc(day(p.date))}</span><h3>${bnw(p.title)}</h3></a></li>`)
            .join("\n          ")}
          <li><a href="frequency-unity/"><span class="k-label">Feature</span><h3>Frequency &amp; Unity — <span class="bn">অপূর্ব</span> × ACND</h3></a></li>
        </ul>
        <a class="k-link" href="journal/" data-cta="journal-all">All ${posts.length} articles →</a>
      </div>
    </div>
  </section>

  <section class="f-faq" aria-labelledby="faq-title">
    <h2 id="faq-title" class="k-h2">Questions</h2>
    <div class="k-rows f-qa k-fade" data-reveal>
      ${FAQ.map(([q, a]) => `<details><summary><span>${bnw(q)}</span></summary><p>${bnw(a)}</p></details>`).join("\n      ")}
    </div>
  </section>

  <footer class="f-foot">
    <div class="f-foot-id"><b>I Rave You</b><span>ACND &amp; <span class="bn">অপূর্ব</span> · electronic music from Bangladesh</span><p>Stream the records on your platform, follow both artists so the next one finds you, or keep Qbic Pulse running here while you read.</p></div>
    <nav aria-label="Site"><span class="k-label">Site</span><a href="acnd/">ACND</a><a href="apurba/"><span class="bn">অপূর্ব</span></a><a href="radio/">Qbic Pulse Radio</a><a href="music/down-in-bossa/">Down In Bossa</a><a href="journal/">Journal</a><a href="acnd/press/">Press kit</a><a href="frequency-unity/">Feature</a></nav>
    <nav aria-label="Listen"><span class="k-label">Listen</span><a href="${esc(C.listen.url)}" ${ext}>ACND · Spotify</a><a href="https://soundcloud.com/acndlovestoes" ${ext}>ACND · SoundCloud</a><a href="${esc(A.listen.url)}" ${ext}><span class="bn">অপূর্ব</span> · Spotify</a><a href="https://soundcloud.com/youmeiyou" ${ext}><span class="bn">অপূর্ব</span> · SoundCloud</a></nav>
    <nav aria-label="Follow"><span class="k-label">Follow</span><a href="https://www.instagram.com/acnd_music/" ${ext}>ACND · Instagram</a><a href="https://instagram.com/i.rave.you" ${ext}>I Rave You · Instagram</a></nav>
    <div class="f-foot-end"><nav class="legal-links" aria-label="Legal information"><a href="legal/terms/">Terms of use</a><a href="legal/privacy/">Privacy notice</a><a href="legal/copyright/">Copyright contact</a></nav></div>
  </footer>
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
      itemListElement: items.map((it, i) => {
        // Everyone credited on the item: the two artists by @id, anyone else by name.
        const credited = it.by
          .replace(/\(.*?\)|\bRemix\b|·.*$|Set 01|Mixtape01 by/gi, "")
          .split(/,|&|\bx\b/)
          .map((n) => n.trim())
          .filter((n) => n && n !== "Various Artists")
          .map((n) => (/^ACND$/i.test(n) ? { "@id": id("acnd") } : n === "অপূর্ব" ? { "@id": id("apurba") } : { "@type": "Person", name: n }));
        const url = it.page ? `${origin}/${it.page}` : it.href;
        const image = it.cover ? { image: `${origin}/${it.cover}` } : {};
        if (it.type === "set")
          return { "@type": "ListItem", position: i + 1, item: { "@type": "MusicPlaylist", name: it.title, url, creator: credited.length ? credited : [{ "@id": id("acnd") }, { "@id": id("apurba") }], ...image } };
        if (it.title === next.title)
          return {
            "@type": "ListItem",
            position: i + 1,
            item: {
              "@type": "MusicAlbum", name: it.title, url, byArtist: credited, ...image,
              albumReleaseType: "https://schema.org/SingleRelease", datePublished: "2026-10-30",
              albumRelease: { "@type": "MusicRelease", name: it.title, recordLabel: { "@type": "Organization", name: next.label, url: "https://www.profimusic.com/" }, copyrightNotice: "℗ 2026 profimusic, distributed by ADA Central Europe" },
            },
          };
        return { "@type": "ListItem", position: i + 1, item: { "@type": "MusicRecording", name: it.title, url, ...(credited.length ? { byArtist: credited } : {}), ...image } };
      }),
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
