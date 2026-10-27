import { createPosts, PUBLICATION_DATE } from "../content/posts.mjs";
/** Static discovery pages share the portfolio's facts and verified music URLs. */
export const ORIGIN = "https://iraveyou.com";
const esc = (s) =>
  String(s).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const json = (value) => JSON.stringify(value).replace(/</g, "\\u003c");
export const HOME_TITLE =
  "I Rave You — ACND & অপূর্ব | Electronic Music Bangladesh";
export const HOME_DESCRIPTION =
  "Explore ACND (Ahmed Masum) and অপূর্ব (Opurbo / Apurba): electronic music from Bangladesh, artist biographies, releases and the Qbic Pulse DJ mix tracklist.";
const webId = `${ORIGIN}/#website`;
const orgId = `${ORIGIN}/#publisher`;
const id = (artist) => `${ORIGIN}/${artist}/#artist`;
const organization = {
  "@type": "Organization",
  "@id": orgId,
  name: "I Rave You",
  url: `${ORIGIN}/`,
};
const website = {
  "@type": "WebSite",
  "@id": webId,
  name: "I Rave You",
  url: `${ORIGIN}/`,
  publisher: { "@id": orgId },
};
export function artistEntity(a) {
  return {
    "@type": "Person",
    "@id": id(a.id),
    name: a.name,
    alternateName:
      a.id === "acnd"
        ? ["Ahmed Masum", "Ahmed Al Masum", "Ascend"]
        : ["Opurbo", "Apurba", "Khalid Bin Alam"],
    url: `${ORIGIN}/${a.id}/`,
    description: a.about.summary,
    jobTitle: "Electronic music producer and DJ",
    homeLocation: { "@type": "Place", name: a.origin },
    sameAs: a.links
      .filter((l) =>
        [
          "Spotify",
          "Apple Music",
          "SoundCloud",
          "YouTube",
          "Instagram",
        ].includes(l.label),
      )
      .map((l) => l.url),
  };
}
export const homeGraph = (artists) => ({
  "@context": "https://schema.org",
  "@graph": [
    organization,
    website,
    {
      "@type": "WebPage",
      "@id": `${ORIGIN}/#page`,
      url: `${ORIGIN}/`,
      name: HOME_TITLE,
      description: HOME_DESCRIPTION,
      isPartOf: { "@id": webId },
      about: Object.values(artists).map((a) => ({ "@id": id(a.id) })),
    },
    ...Object.values(artists).map(artistEntity),
  ],
});
function head({
  title,
  description,
  path,
  image = "img/og-frequency-unity.jpg",
  graph,
  ogType = "website",
}) {
  const url = `${ORIGIN}/${path}`;
  return `<title>${esc(title)}</title><meta name="description" content="${esc(description)}"><meta name="robots" content="index, follow, max-image-preview:large"><link rel="canonical" href="${url}"><meta property="og:type" content="${ogType}"><meta property="og:site_name" content="I Rave You"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(description)}"><meta property="og:url" content="${url}"><meta property="og:image" content="${ORIGIN}/${image}"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${esc(title)}"><meta name="twitter:description" content="${esc(description)}"><meta name="twitter:image" content="${ORIGIN}/${image}"><script type="application/ld+json">${json(graph)}</script>`;
}
function shell(page, body) {
  const root = "../".repeat(page.path.split("/").filter(Boolean).length);
  return `<!doctype html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="theme-color" content="#0b0b0b">${head(page)}<link rel="icon" href="${root}favicon.svg"><link rel="stylesheet" href="${root}seo.css"></head><body class="discovery"><a class="skip" href="#content">Skip to content</a><header><a class="brand" href="${root}">I Rave You</a><nav aria-label="Main navigation"><a href="${root}acnd/">ACND</a><a href="${root}apurba/">অপূর্ব</a><a href="${root}mixes/qbic-pulse/">Mix &amp; tracklist</a><a href="${root}journal/">Journal</a></nav></header><main id="content"><nav class="breadcrumb" aria-label="Breadcrumb"><a href="${root}">Home</a><span aria-hidden="true"> / </span><span>${esc(page.label)}</span></nav>${body}</main><footer><nav aria-label="Legal information"><a href="${root}legal/terms/">Terms of use</a><a href="${root}legal/privacy/">Privacy notice</a><a href="${root}legal/copyright/">Copyright contact</a></nav><p>I Rave You · ACND &amp; অপূর্ব · Electronic music from Bangladesh</p></footer></body></html>`;
}
const pageGraph = (page, entities = [], type = "WebPage") => ({
  "@context": "https://schema.org",
  "@graph": [
    organization,
    website,
    {
      "@type": type,
      "@id": `${ORIGIN}/${page.path}#page`,
      url: `${ORIGIN}/${page.path}`,
      name: page.title,
      description: page.description,
      isPartOf: { "@id": webId },
      mainEntity: entities[0] ? { "@id": entities[0]["@id"] } : undefined,
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: `${ORIGIN}/` },
        {
          "@type": "ListItem",
          position: 2,
          name: page.label,
          item: `${ORIGIN}/${page.path}`,
        },
      ],
    },
    ...entities,
  ],
});
export function discoveryPages(artists, next, tracks) {
  const pages = [];
  for (const a of Object.values(artists)) {
    const page = {
      path: `${a.id}/`,
      label: a.id === "acnd" ? "ACND" : "অপূর্ব (Opurbo / Apurba)",
      title:
        a.id === "acnd"
          ? "ACND (Ahmed Masum) — DJ & Producer in Dhaka | I Rave You"
          : "অপূর্ব (Opurbo / Apurba) — Electronic Artist, Bangladesh",
      description:
        a.id === "acnd"
          ? "Meet ACND, the electronic music alias of Ahmed Masum in Dhaka, Bangladesh. Explore his biography, Down In Bossa with Ash Army, and Qbic Pulse."
          : "অপূর্ব (Opurbo / Apurba) is Khalid Bin Alam, an independent electronic producer and DJ from Cumilla, Bangladesh. Explore his biography and releases.",
    };
    page.graph = pageGraph(page, [artistEntity(a)], "ProfilePage");
    const releases = a.releases
      .map(
        (r) =>
          `<li><a href="${esc(r.url)}" target="_blank" rel="noopener"><strong>${esc(r.title)}</strong><span>${esc(r.artists)} · ${esc(r.tag)} ↗</span></a></li>`,
      )
      .join("");
    const links = a.links
      .filter((l) =>
        [
          "Spotify",
          "Apple Music",
          "SoundCloud",
          "YouTube",
          "Instagram",
        ].includes(l.label),
      )
      .map(
        (l) =>
          `<a href="${esc(l.url)}" target="_blank" rel="noopener">${esc(l.label)} ↗</a>`,
      )
      .join("");
    page.html = shell(
      page,
      `<p class="eyebrow">${esc(a.origin)} · Artist profile</p><h1>${esc(page.label)}</h1><p class="intro">${esc(a.about.summary)}</p><a class="button" href="../#/${a.id}">Enter the interactive portfolio →</a><section><h2>Biography</h2>${a.about.paragraphs.map((p) => `<p>${esc(p)}</p>`).join("")}</section><section><h2>${a.id === "acnd" ? "Upcoming release" : "Releases & listening links"}</h2><ul class="recordings">${releases}</ul>${a.id === "acnd" ? '<p><a href="../music/down-in-bossa/">Down In Bossa — release details →</a></p>' : ""}</section>${a.id === "acnd" ? `<section><h2>Artist guides &amp; listening notes</h2><p>Explore <a href="../journal/ahmed-masum-acnd-name-guide/">the Ahmed Masum / ACND name guide</a>, <a href="../journal/where-to-listen-acnd/">where to listen</a> and <a href="../journal/acnd-techno-melodic-acid-progressive/">his musical directions</a>.</p></section><section><h2>Nitol Paye Electric remix credit</h2><p>The “Nitol Paye Electric” remix is by ACND (Ahmed Masum).</p><a href="https://youtu.be/om5QGreRaYg" target="_blank" rel="noopener">Watch on YouTube ↗</a></section>` : ""}<section><h2>Listen & connect</h2><nav class="platforms" aria-label="${esc(a.name)} music profiles">${links}</nav></section><section><h2>Qbic Pulse with ${a.id === "acnd" ? "অপূর্ব" : "ACND"}</h2><p>Explore their shared DJ mix for Hong Kong Community Radio, with a timestamped tracklist and links to the original recordings.</p><a href="../mixes/qbic-pulse/">Read the Qbic Pulse tracklist →</a></section>`,
    );
    pages.push(page);
  }
  const release = {
    path: "music/down-in-bossa/",
    label: "Down In Bossa",
    title: "Down In Bossa — Ash Army & ACND | Profi Music",
    description:
      "Down In Bossa by Ash Army & ACND: Afro House on Profi Music, scheduled for 30 October 2026. Find the label release page and official pre-save link.",
  };
  release.graph = pageGraph(release, [
    {
      "@type": "MusicRecording",
      "@id": `${ORIGIN}/${release.path}#recording`,
      name: next.title,
      byArtist: [
        { "@id": id("acnd") },
        { "@type": "Person", name: "Ash Army" },
      ],
      genre: next.genre,
      url: next.page,
      image: `${ORIGIN}/${next.cover}`,
      description: release.description,
    },
    artistEntity(artists.acnd),
  ]);
  release.html = shell(
    release,
    `<p class="eyebrow">${esc(next.genre)} · ${esc(next.label)}</p><h1>Down In Bossa</h1><p class="intro">Ash Army &amp; ACND</p><img class="cover" src="../../${next.cover}" alt="Down In Bossa — Ash Army and ACND cover artwork" width="600" height="600" fetchpriority="high"><section><h2>Release details</h2><p>“Down In Bossa” is an Afro House collaboration between Ash Army and ACND, scheduled for <time datetime="2026-10-30">30 October 2026</time> via Profi Music.</p><p>The label controls release availability and streaming destinations. Use its page for the latest information.</p><nav class="platforms" aria-label="Official release links"><a class="button" href="${esc(next.presave)}" target="_blank" rel="noopener">Pre-save / listen via the label ↗</a><a href="${esc(next.page)}" target="_blank" rel="noopener">Profi Music release page ↗</a></nav></section><section><h2>About ACND</h2><p>${esc(artists.acnd.about.paragraphs[0])}</p><a href="../../acnd/">Read ACND’s biography →</a></section><section><h2>Related reading</h2><p><a href="../../journal/down-in-bossa-collaboration-credits/">Understanding the collaboration credits</a> · <a href="../../journal/afro-house-listening-guide/">An Afro House listening guide</a></p></section>`,
  );
  pages.push(release);
  const mix = {
    path: "mixes/qbic-pulse/",
    label: "Qbic Pulse tracklist",
    title: "Qbic Pulse Tracklist — ACND & অপূর্ব DJ Mix | HKCR",
    description:
      "The Qbic Pulse DJ mix by ACND & অপূর্ব for Hong Kong Community Radio: all 15 tracks, takeover timestamps and verified original recording links.",
  };
  mix.graph = pageGraph(mix, [
    {
      "@type": "ItemList",
      "@id": `${ORIGIN}/${mix.path}#tracklist`,
      name: "Qbic Pulse tracklist",
      numberOfItems: tracks.length,
      itemListElement: tracks.map((t, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: `${t.artist} — ${t.title}`,
        url: t.url,
      })),
    },
  ]);
  const stamp = (s) =>
    `${Math.floor(s / 60)
      .toString()
      .padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;
  mix.html = shell(
    mix,
    `<p class="eyebrow">ACND &amp; অপূর্ব · Hong Kong Community Radio</p><h1>Qbic Pulse: DJ mix &amp; tracklist</h1><p class="intro">A shared set by ACND and অপূর্ব, opening with their unreleased collaboration “Initiate”.</p><a class="button" href="../../#/">Open the mix player →</a><section><h2>Tracklist with original recording links</h2><p>Timestamps mark where each track takes over in the mix. Links open the identified recording on Apple Music or SoundCloud.</p><ol class="tracks">${tracks.map((t) => `<li><span class="timestamp">${stamp(t.at)}</span><a href="${esc(t.url)}" target="_blank" rel="noopener"><strong>${esc(t.title)}</strong><span>${esc(t.artist)} · ${esc(t.linkLabel)} ↗</span></a></li>`).join("")}</ol></section><section><h2>Explore the set</h2><p><a href="../../journal/qbic-pulse-listening-route/">A route through Qbic Pulse</a> · <a href="../../journal/how-to-read-dj-mix-tracklist/">How to read takeover timestamps</a> · <a href="../../journal/initiate-unreleased-id-guide/">About the opening track, Initiate</a></p></section><section><h2>About the hosts</h2><p><a href="../../acnd/">ACND (Ahmed Masum)</a> is a producer and DJ based in Dhaka. <a href="../../apurba/">অপূর্ব (Opurbo / Apurba)</a> is the electronic music project of Khalid Bin Alam from Cumilla.</p><a href="https://hkcr.live/" target="_blank" rel="noopener">Hong Kong Community Radio ↗</a></section><section><h2>Listening links & music rights</h2><p>Playing this site’s mix does not count as a stream on the linked music platforms. Recording links and credits do not grant rights to copy, redistribute or otherwise use the music. For rights concerns, see our <a href="../../legal/copyright/">copyright contact page</a>.</p></section>`,
  );
  pages.push(mix);
  return pages;
}
export function homeContent() {
  return `<section class="discovery-home" aria-labelledby="discovery-title"><h1 id="discovery-title">I Rave You — electronic music from Bangladesh</h1><p>Explore ACND and অপূর্ব: two independent electronic music artists, their releases, biographies and shared Qbic Pulse DJ mix.</p><div class="discovery-grid"><article><h2><a href="acnd/">ACND — Ahmed Masum</a></h2><p>Producer, DJ and composer based in Dhaka. Explore his biography and “Down In Bossa” with Ash Army via Profi Music.</p></article><article><h2><a href="apurba/">অপূর্ব — Opurbo / Apurba</a></h2><p>The electronic music project of Khalid Bin Alam from Cumilla. Self-taught production and DJing, with a journey beginning in 2016.</p></article><article><h2><a href="music/down-in-bossa/">Down In Bossa</a></h2><p>Afro House by Ash Army &amp; ACND. Release information, the label page and pre-save link.</p></article><article><h2><a href="mixes/qbic-pulse/">Qbic Pulse tracklist</a></h2><p>All 15 tracks, takeover timestamps and verified original recording links for the shared HKCR set.</p></article></div><p><a href="journal/">Explore the journal: artist guides, credits &amp; listening notes →</a></p><p><a href="frequency-unity/">Read Frequency &amp; Unity — অপূর্ব × ACND →</a></p><nav class="legal-links" aria-label="Legal information"><a href="legal/terms/">Terms of use</a><a href="legal/privacy/">Privacy notice</a><a href="legal/copyright/">Copyright contact</a></nav></section>`;
}
export function journalPages(artists, next, tracks) {
  const internal = (path, label) =>
    `<a href="../../${esc(path)}">${esc(label)}</a>`;
  const external = (url, label) =>
    `<a href="${esc(url)}" target="_blank" rel="noopener">${esc(label)} ↗</a>`;
  const posts = createPosts({ internal, external, next, tracks });
  const bySlug = new Map(posts.map((post) => [post.slug, post]));
  const publisher = organization;
  const pages = posts.map((post) => {
    const page = {
      ...post,
      path: `journal/${post.slug}/`,
      label: post.title,
      ogType: "article",
    };
    const url = `${ORIGIN}/${page.path}`;
    const article = {
      "@type": "Article",
      "@id": `${url}#article`,
      headline: post.title,
      description: post.description,
      url,
      mainEntityOfPage: { "@id": `${url}#page` },
      datePublished: PUBLICATION_DATE,
      dateModified: PUBLICATION_DATE,
      inLanguage: "en",
      articleSection: post.category,
      author: {
        "@type": "Organization",
        name: "I Rave You editorial",
        url: `${ORIGIN}/journal/#editorial`,
      },
      publisher: { "@id": orgId },
      image: `${ORIGIN}/${post.image}`,
      about: { "@id": id("acnd") },
      isPartOf: { "@id": `${ORIGIN}/journal/#collection` },
    };
    page.graph = {
      "@context": "https://schema.org",
      "@graph": [
        publisher,
        website,
        {
          "@type": "WebPage",
          "@id": `${url}#page`,
          url,
          name: post.title,
          mainEntity: { "@id": article["@id"] },
          isPartOf: { "@id": webId },
        },
        article,
        artistEntity(artists.acnd),
        {
          "@type": "BreadcrumbList",
          itemListElement: [
            {
              "@type": "ListItem",
              position: 1,
              name: "Home",
              item: `${ORIGIN}/`,
            },
            {
              "@type": "ListItem",
              position: 2,
              name: "Journal",
              item: `${ORIGIN}/journal/`,
            },
            { "@type": "ListItem", position: 3, name: post.title, item: url },
          ],
        },
      ],
    };
    const related = post.related
      .map((slug) => {
        const target = bySlug.get(slug);
        if (!target) throw new Error(`Missing related article ${slug}`);
        return `<li>${internal(`journal/${slug}/`, target.title)}</li>`;
      })
      .join("");
    const toc = [...post.body.matchAll(/<h2>(.*?)<\/h2>/g)]
      .map((match, i) => `<li><a href="#section-${i + 1}">${match[1]}</a></li>`)
      .join("");
    let section = 0;
    const body = post.body.replace(
      /<h2>/g,
      () => `<h2 id="section-${++section}">`,
    );
    page.html = shell(
      page,
      `<article class="journal-article"><p class="eyebrow">${esc(post.category)} · Artist journal</p><h1>${esc(post.title)}</h1><p class="byline">By <a href="../#editorial">I Rave You editorial</a> · <time datetime="${PUBLICATION_DATE}">28 October 2026</time></p><p class="intro article-answer">${esc(post.answer)}</p><figure class="article-figure"><img src="../../${esc(post.image)}" alt="${esc(post.imageAlt)}" width="1200" height="630" fetchpriority="high"><figcaption>Image from the existing I Rave You artist portfolio.</figcaption></figure><nav class="contents" aria-label="In this article"><strong>In this article</strong><ol>${toc}</ol></nav>${body}<aside class="source-note"><h2>About this article</h2><p>Published by I Rave You, this artist portfolio. Artist identity, biography and project credits are based on information supplied for this website. External music and label links identify listening destinations; they are not independent verification of every biographical statement. Genre and listening explanations are editorial guidance.</p></aside><section class="related"><h2>Related reading</h2><ul>${related}</ul><p>${internal("acnd/", "ACND artist profile")} · ${internal("journal/", "All journal posts")}</p></section></article>`,
    );
    return page;
  });
  const hub = {
    path: "journal/",
    label: "Journal",
    title: "ACND Journal — Ahmed Masum, Music & Listening Guides",
    description:
      "Explore ten artist and listening guides about ACND (Ahmed Masum), collaborations, remix credits, musical directions and the Qbic Pulse set.",
  };
  hub.graph = {
    "@context": "https://schema.org",
    "@graph": [
      organization,
      website,
      {
        "@type": "CollectionPage",
        "@id": `${ORIGIN}/journal/#collection`,
        url: `${ORIGIN}/journal/`,
        name: hub.title,
        description: hub.description,
        isPartOf: { "@id": webId },
        mainEntity: {
          "@type": "ItemList",
          numberOfItems: posts.length,
          itemListElement: posts.map((post, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: post.title,
            url: `${ORIGIN}/journal/${post.slug}/`,
          })),
        },
      },
    ],
  };
  hub.html = shell(
    hub,
    `<p class="eyebrow">Artist stories · Credits · Listening guides</p><h1>Inside the music</h1><p class="intro">Explore Ahmed Masum’s work as ACND, the people and projects connected to it, and practical ways to listen.</p><div class="journal-grid">${posts.map((post) => `<article class="journal-card"><a href="${esc(post.slug)}/"><img src="../${esc(post.image)}" alt="${esc(post.imageAlt)}" width="600" height="340" loading="lazy"><p class="eyebrow">${esc(post.category)}</p><h2>${esc(post.title)}</h2><p>${esc(post.description)}</p><span>Read article →</span></a></article>`).join("")}</div><section id="editorial"><h2>About the journal</h2><p>This is the I Rave You artist portfolio’s own journal. It connects first-party artist information with listening notes, credit explanations and links to the recordings discussed. It is not independent press coverage.</p><p>We distinguish known artist facts from general listening guidance, preserve collaborator credits and update release information when confirmed. Questions or corrections can be sent through the <a href="../legal/copyright/">site contact page</a>.</p></section>`,
  );
  return [hub, ...pages];
}
export function seoPlugin({ artists, next, tracks }) {
  const pages = [
    ...discoveryPages(artists, next, tracks),
    ...journalPages(artists, next, tracks),
  ];
  return {
    name: "static-discovery-seo",
    configureServer(server) {
      server.middlewares.use((req, res, nextMiddleware) => {
        const pathname = new URL(req.url, "http://localhost").pathname;
        const page = pages.find(
          (p) =>
            pathname === `/${p.path}` || pathname === `/${p.path}index.html`,
        );
        if (!page) return nextMiddleware();
        res.setHeader("Content-Type", "text/html; charset=utf-8");
        res.end(page.html);
      });
    },
    transformIndexHtml: {
      order: "pre",
      handler(html, ctx) {
        if (ctx.path === "/index.html" || ctx.path === "/")
          return html
            .replace("<!-- discovery-content -->", homeContent())
            .replace(
              "<!-- structured-data -->",
              `<script type="application/ld+json">${json(homeGraph(artists))}</script>`,
            );
        if (ctx.path.startsWith("/afw26/")) return html;
        const path = ctx.path.replace(/^\//, "").replace(/index\.html$/, "");
        const url = `${ORIGIN}/${path}`;
        html = html
          .replace(/<link\b[^>]*rel="canonical"[^>]*>/g, "")
          .replace(/<meta\b[^>]*property="og:url"[^>]*>/g, "");
        return html
          .replace(
            "</head>",
            `<link rel="canonical" href="${url}"><meta property="og:url" content="${url}"></head>`,
          )
          .replaceAll(
            "https://ahmedmasum2000000.github.io/i.rave.you/",
            `${ORIGIN}/`,
          );
      },
    },
    generateBundle() {
      for (const page of pages)
        this.emitFile({
          type: "asset",
          fileName: `${page.path}index.html`,
          source: page.html,
        });
    },
  };
}
