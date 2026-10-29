import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { createPosts, PUBLICATION_DATE } from "../content/posts.mjs";
/** Static discovery pages share the portfolio's facts and verified music URLs. */
export const ORIGIN = "https://iraveyou.online";
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
    name: a.id === "acnd" ? "Ahmed Masum" : a.name,
    alternateName:
      a.id === "acnd"
        ? ["ACND", "Ahmed Al Masum", "Ascend"]
        : ["Opurbo", "Apurba", "Khalid Bin Alam"],
    url: `${ORIGIN}/${a.id}/`,
    description: a.about.summary,
    disambiguatingDescription:
      a.id === "acnd"
        ? "Ahmed Masum is ACND, pronounced Ascend, the electronic music producer and DJ based in Dhaka, Bangladesh."
        : a.about.summary,
    image: `${ORIGIN}/${a.hero}`,
    mainEntityOfPage: `${ORIGIN}/${a.id}/`,
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
          "Facebook",
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
  return `<!doctype html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="theme-color" content="#0b0b0b">${head(page)}<link rel="icon" href="${root}favicon.svg"><link rel="stylesheet" href="${root}fonts/brand.css"><link rel="stylesheet" href="${root}seo.css"></head><body class="discovery"><a class="skip" href="#content">Skip to content</a><header><a class="brand" href="${root}">I Rave You</a><nav aria-label="Main navigation"><a href="${root}acnd/">ACND</a><a href="${root}apurba/">অপূর্ব</a><a href="${root}mixes/qbic-pulse/">Mix &amp; tracklist</a><a href="${root}journal/">Journal</a></nav></header><main id="content"><nav class="breadcrumb" aria-label="Breadcrumb"><a href="${root}">Home</a><span aria-hidden="true"> / </span><span>${esc(page.label)}</span></nav>${body}</main><footer><nav aria-label="Legal information"><a href="${root}legal/terms/">Terms of use</a><a href="${root}legal/privacy/">Privacy notice</a><a href="${root}legal/copyright/">Copyright contact</a></nav><p>I Rave You · ACND &amp; অপূর্ব · Electronic music from Bangladesh</p></footer></body></html>`;
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
      inLanguage: "en",
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
      image: a.hero,
      label:
        a.id === "acnd" ? "Ahmed Masum (ACND)" : "অপূর্ব (Opurbo / Apurba)",
      title:
        a.id === "acnd"
          ? "Ahmed Masum (ACND) — Electronic Music Producer & DJ"
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
          "Facebook",
        ].includes(l.label),
      )
      .map(
        (l) =>
          `<a href="${esc(l.url)}" target="_blank" rel="noopener">${esc(l.label)} ↗</a>`,
      )
      .join("");
    page.artist = a;
    page.body = (
      `<p class="eyebrow">${esc(a.origin)} · Artist profile</p><h1>${esc(page.label)}</h1><p class="intro">${esc(a.about.summary)}</p><section><h2>Biography</h2>${a.about.paragraphs.map((p) => `<p>${esc(p)}</p>`).join("")}</section><section><h2>${a.id === "acnd" ? "Latest release" : "Releases & listening links"}</h2><ul class="recordings">${releases}</ul>${a.id === "acnd" ? '<p><a href="../music/down-in-bossa/">Down In Bossa — release details →</a></p>' : ""}</section>${a.id === "acnd" ? `<section><h2>Ahmed Masum / ACND: artist facts</h2><dl class="fact-list"><div><dt>Artist name</dt><dd>ACND, pronounced “Ascend”</dd></div><div><dt>Personal name</dt><dd>Ahmed Masum</dd></div><div><dt>Based in</dt><dd>Dhaka, Bangladesh</dd></div><div><dt>Work</dt><dd>Electronic music production, DJing and composition</dd></div></dl><p><a href="press/">Press kit, biographies &amp; credits →</a></p></section><section><h2>Artist guides &amp; listening notes</h2><p>Explore <a href="../journal/ahmed-masum-acnd-name-guide/">the Ahmed Masum / ACND name guide</a>, <a href="../journal/where-to-listen-acnd/">where to listen</a> and <a href="../journal/acnd-techno-melodic-acid-progressive/">his musical directions</a>.</p></section><section><h2>Nitol Paye Electric remix credit</h2><p>The “Nitol Paye Electric” remix is by ACND (Ahmed Masum).</p><a href="https://youtu.be/om5QGreRaYg" target="_blank" rel="noopener">Watch on YouTube ↗</a></section>` : ""}<section><h2>Listen & connect</h2><nav class="platforms" aria-label="${esc(a.name)} music profiles">${links}</nav></section><section><h2>Qbic Pulse with ${a.id === "acnd" ? "অপূর্ব" : "ACND"}</h2><p>Explore their shared DJ mix for Hong Kong Community Radio, with a timestamped tracklist and links to the original recordings.</p><a href="../mixes/qbic-pulse/">Read the Qbic Pulse tracklist →</a></section>`,
    );
    page.html = shell(page, page.body);
    pages.push(page);
  }
  const release = {
    path: "music/down-in-bossa/",
    label: "Down In Bossa",
    title: "Down In Bossa — Ash Army & ACND | Afro House",
    description:
      "Down In Bossa by Ash Army & ACND: Afro House via Profi Music. Find release details, official listening links and context for an Ibiza-inspired house playlist.",
    image: next.cover,
  };
  release.graph = pageGraph(release, [
    {
      "@type": "MusicRecording",
      "@id": `${ORIGIN}/${release.path}#recording`,
      name: next.title,
      byArtist: [
        { "@type": "Person", name: "Ash Army" },
        { "@id": id("acnd") },
      ],
      genre: next.genre,
      datePublished: "2026-10-30",
      duration: "PT2M26S",
      inAlbum: { "@type": "MusicAlbum", name: "Down In Bossa", albumReleaseType: "https://schema.org/SingleRelease", numTracks: 2 },
      url: next.page,
      image: `${ORIGIN}/${next.cover}`,
      description: release.description,
    },
    artistEntity(artists.acnd),
  ]);
  release.html = shell(
    release,
    `<p class="eyebrow">${esc(next.genre)} · ${esc(next.label)}</p><h1>Down In Bossa</h1><p class="intro">Ash Army &amp; ACND · Afro House via Profi Music</p><p>“Down In Bossa” is the Ash Army &amp; ACND collaboration, out now on Profi Music since <time datetime="2026-10-30">30 October 2026</time>. Stream it through the official label links, then find a route into its Afro House context.</p><picture><source srcset="../../${next.cover.replace(/\.jpg$/, ".webp")}" type="image/webp"><img class="cover" src="../../${next.cover}" alt="Down In Bossa — Ash Army and ACND cover artwork" width="650" height="650" fetchpriority="high"></picture><nav class="platforms" aria-label="Official release links"><a class="button" href="${esc(next.presave)}" target="_blank" rel="noopener">Listen now via the label ↗</a><a href="${esc(next.page)}" target="_blank" rel="noopener">Profi Music release page ↗</a></nav><section><h2>Down In Bossa: release facts</h2><dl class="fact-list"><div><dt>Artists</dt><dd>Ash Army &amp; ACND</dd></div><div><dt>Title</dt><dd>Down In Bossa</dd></div><div><dt>Genre</dt><dd>Afro House</dd></div><div><dt>Label</dt><dd>Profi Music</dd></div><div><dt>Released</dt><dd>30 October 2026</dd></div></dl><p>ACND is Ahmed Masum, the producer, DJ and composer based in Dhaka, Bangladesh. Ash Army is the separately credited collaborator. The artist line should remain Ash Army &amp; ACND when sharing the recording.</p><p>The label controls availability and streaming destinations by platform and territory; follow the official links above for the current list.</p></section><section><h2>Bossa in the title, Afro House in the release information</h2><p>“Bossa” is part of this recording’s title. The genre supplied for “Down In Bossa” is <strong>Afro House</strong>. A word in a title does not, by itself, establish an instrument, sample source or musical influence.</p><p>Bossa nova is a Brazilian musical tradition with a different history from house music. If you arrived looking for bossa nova, use the recording’s actual genre and listen to the full track before deciding whether it matches what you want to hear. This page does not have an artist statement explaining the title’s origin.</p><p>For a practical introduction to the stated genre, explore the <a href="../../journal/afro-house-listening-guide/">Afro House listening guide</a>, which focuses on rhythm, percussion, bass and space.</p></section><section><h2>Down In Bossa for an Ibiza-inspired house playlist</h2><p>Ibiza is associated internationally with dance music, DJ culture and house listening. An Ibiza-inspired playlist can be a personal way to explore that musical setting, rather than a list of recordings tied to a particular venue or event.</p><p>If you are exploring Afro House for such a playlist, “Down In Bossa” is a release to check through its official label destination. Hear the complete recording and decide how it fits the energy and pacing of your own selection. This is a listening suggestion, not a report of Ibiza airplay, a performance booking or a venue endorsement.</p><ol><li><strong>Start with the full recording.</strong> Use the label’s listening destination so you can assess the arrangement beyond a short preview.</li><li><strong>Follow the groove.</strong> Pay attention to how percussion and bass relate, using the <a href="../../journal/afro-house-listening-guide/">listening exercise</a> if the genre is new to you.</li><li><strong>Choose the transition.</strong> Compare the recording with the track before and after it. A playlist’s flow depends on the actual music, not the destination named in its title.</li><li><strong>Preserve the credit.</strong> Add the Ash Army &amp; ACND recording linked by the label, and keep its artist and version information intact.</li></ol></section><section><h2>Meet ACND: Ahmed Masum</h2><p>${esc(artists.acnd.about.paragraphs[0])}</p><p>His broader portfolio moves through techno, melodic techno, acid and progressive sounds. This Afro House collaboration is one specific project within that work. Read <a href="../../acnd/">Ahmed Masum’s ACND artist profile</a> or explore the <a href="../../journal/acnd-techno-melodic-acid-progressive/">guide to his musical directions</a>.</p></section><section><h2>Quick answers</h2><h3>Who made Down In Bossa?</h3><p>The recording is credited to Ash Army &amp; ACND. ACND is Ahmed Masum; those names identify the same artist.</p><h3>Is Down In Bossa bossa nova?</h3><p>The release information supplied here identifies it as Afro House. “Bossa” is part of the title and does not establish a bossa nova classification or sample.</p><h3>Where can I listen?</h3><p>Use the official Profi Music page and smart link above. It was released on 30 October 2026; availability by platform and territory is controlled by the label.</p><h3>How can it fit an Ibiza-inspired playlist?</h3><p>Explore it as an Afro House selection, then use the full recording to judge pacing and transitions. The playlist context does not imply a confirmed Ibiza performance or endorsement.</p></section><section><h2>More from this project</h2><p><a href="../../journal/down-in-bossa-out-now-profi-music/">Down In Bossa is out now on Profi Music</a> · <a href="../../journal/down-in-bossa-collaboration-credits/">Understanding the collaboration credits</a> · <a href="../../journal/afro-house-listening-guide/">An Afro House listening guide</a> · <a href="../../mixes/qbic-pulse/">ACND &amp; অপূর্ব’s Qbic Pulse tracklist</a></p></section>`,
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
    `<p class="eyebrow">ACND &amp; অপূর্ব · Hong Kong Community Radio</p><h1>Qbic Pulse: DJ mix &amp; tracklist</h1><p class="intro">A shared set by ACND and অপূর্ব, opening with their unreleased collaboration “Initiate”.</p><a class="button" href="../../">Open the mix player →</a><section><h2>Tracklist with original recording links</h2><p>Timestamps mark where each track takes over in the mix. Available links open the identified recording on Apple Music or SoundCloud. The opening unreleased track has no external link.</p><ol class="tracks">${tracks.map((t) => `<li><span class="timestamp">${stamp(t.at)}</span>${t.url ? `<a href="${esc(t.url)}" target="_blank" rel="noopener"><strong>${esc(t.title)}</strong><span>${esc(t.artist)} · ${esc(t.linkLabel)} ↗</span></a>` : `<div class="track-recording"><strong>${esc(t.title)}</strong><span>${esc(t.artist)} · Unreleased · No external link</span></div>`}</li>`).join("")}</ol></section><section><h2>Explore the set</h2><p><a href="../../journal/qbic-pulse-listening-route/">A route through Qbic Pulse</a> · <a href="../../journal/how-to-read-dj-mix-tracklist/">How to read takeover timestamps</a> · <a href="../../journal/initiate-unreleased-id-guide/">About the opening track, Initiate</a></p></section><section><h2>About the hosts</h2><p><a href="../../acnd/">ACND (Ahmed Masum)</a> is a producer and DJ based in Dhaka. <a href="../../apurba/">অপূর্ব (Opurbo / Apurba)</a> is the electronic music project of Khalid Bin Alam from Cumilla.</p><a href="https://hkcr.live/" target="_blank" rel="noopener">Hong Kong Community Radio ↗</a></section><section><h2>Listening links & music rights</h2><p>Playing this site’s mix does not count as a stream on the linked music platforms. Recording links and credits do not grant rights to copy, redistribute or otherwise use the music. For rights concerns, see our <a href="../../legal/copyright/">copyright contact page</a>.</p></section>`,
  );
  pages.push(mix);
  return pages;
}
export function homeContent() {
  return `<section class="discovery-home" aria-labelledby="discovery-title"><h1 id="discovery-title">I Rave You — electronic music from Bangladesh</h1><p>Explore ACND and অপূর্ব: two independent electronic music artists, their releases, biographies and shared Qbic Pulse DJ mix.</p><div class="discovery-grid"><article><h2><a href="acnd/">ACND — Ahmed Masum</a></h2><p>Producer, DJ and composer based in Dhaka. Explore his biography and “Down In Bossa” with Ash Army via Profi Music.</p></article><article><h2><a href="apurba/">অপূর্ব — Opurbo / Apurba</a></h2><p>The electronic music project of Khalid Bin Alam from Cumilla. Self-taught production and DJing, with a journey beginning in 2016.</p></article><article><h2><a href="music/down-in-bossa/">Down In Bossa</a></h2><p>Afro House by Ash Army &amp; ACND. Out now: release information and official listening links.</p></article><article><h2><a href="mixes/qbic-pulse/">Qbic Pulse tracklist</a></h2><p>All 15 tracks, takeover timestamps and verified original recording links for the shared HKCR set.</p></article></div><p><a href="journal/">Explore the journal: artist guides, credits &amp; listening notes →</a></p><p><a href="frequency-unity/">Read Frequency &amp; Unity — অপূর্ব × ACND →</a></p><nav class="legal-links" aria-label="Legal information"><a href="legal/terms/">Terms of use</a><a href="legal/privacy/">Privacy notice</a><a href="legal/copyright/">Copyright contact</a></nav></section>`;
}
/** One reference destination for publishers, built from the same artist data. */
export function pressPage(a) {
  const page = {
    path: "acnd/press/",
    label: "Ahmed Masum / ACND press kit",
    title: "Ahmed Masum (ACND) Press Kit — Biography, Credits & Links",
    description:
      "First-party press kit for Ahmed Masum, known as ACND: short and long biographies, accurate music credits, artist profiles and reference artwork.",
    image: a.hero,
  };
  page.graph = pageGraph(page, [artistEntity(a)]);
  const links = a.links.filter((link) =>
    ["Spotify", "SoundCloud", "Instagram", "Facebook"].includes(link.label),
  );
  page.html = shell(
    page,
    `<p class="eyebrow">Artist reference · First-party press kit</p><h1>Ahmed Masum (ACND): press kit</h1><p class="intro">Biography, credits and reference links for publications, radio programmes and artist listings.</p><p><a class="button" href="../../press/acnd-artist-facts.txt" download>Download the artist facts &amp; short bio (.txt)</a></p><section><h2>Artist identification</h2><dl class="fact-list"><div><dt>Personal name</dt><dd>Ahmed Masum</dd></div><div><dt>Artist name</dt><dd>ACND</dd></div><div><dt>Pronunciation</dt><dd>Ascend</dd></div><div><dt>Location</dt><dd>Dhaka, Bangladesh</dd></div><div><dt>Roles</dt><dd>Producer, DJ and composer</dd></div></dl><p>Ahmed Masum and ACND identify the same artist. For a combined credit, use “ACND (Ahmed Masum)”. Use <a href="../">the artist profile</a> as the main website reference.</p></section><section><h2>Short biography</h2><p class="press-bio">Ahmed Masum, known as ACND (pronounced “Ascend”), is a producer, DJ and composer based in Dhaka, Bangladesh. His work moves through techno, melodic techno, acid and progressive sounds. His projects include Qbic Pulse with অপূর্ব and the Ash Army &amp; ACND collaboration “Down In Bossa”, released 30 October 2026 via Profi Music.</p></section><section><h2>Long biography</h2>${a.about.paragraphs.map((p) => `<p>${esc(p)}</p>`).join("")}</section><section><h2>Credits to preserve</h2><ul><li><strong>Down In Bossa:</strong> Ash Army &amp; ACND · Afro House · Profi Music · released 30 October 2026. <a href="../../music/down-in-bossa/">Release information and label links</a>.</li><li><strong>Initiate:</strong> ACND × অপূর্ব · unreleased collaboration, opening the published Qbic Pulse set. <a href="../../journal/initiate-unreleased-id-guide/">Track context and listening link</a>.</li><li><strong>Nitol Paye Electric:</strong> remix by ACND (Ahmed Masum). <a href="../../journal/nitol-paye-electric-acnd-remix-credit/">Remix credit and video</a>.</li></ul><p>The credited remix artist is distinct from any underlying song or recording rights. This kit does not state unverified songwriting shares, sample clearances or ownership.</p></section><section><h2>Artist profiles</h2><nav class="platforms" aria-label="ACND artist profiles">${links.map((link) => `<a href="${esc(link.url)}" target="_blank" rel="noopener">${esc(link.label)} ↗</a>`).join("")}</nav></section><section><h2>Reference images</h2><div class="press-assets"><figure><img src="../../img/acnd-portrait.webp" alt="ACND portfolio artist image" width="1200" height="1600" loading="lazy"><figcaption><a href="../../img/acnd-portrait.webp">View the portfolio image</a></figcaption></figure><figure><img class="press-logo" src="../../img/logo-acnd.png" alt="ACND artist logo" width="800" height="800" loading="lazy"><figcaption><a href="../../img/logo-acnd.png">View the artist logo</a></figcaption></figure></div><p>These are existing portfolio assets shown for reference. Their inclusion does not grant a blanket reuse licence; confirm permission with the relevant rights holder for your intended use.</p></section><section><h2>Source and updates</h2><p>This kit is published by I Rave You from artist information supplied for this portfolio. It is not independent press coverage. For current release availability, follow the label links on the release page. For a website correction, use the <a href="../../legal/copyright/">site contact page</a>.</p><p><a href="../">Ahmed Masum / ACND artist profile →</a> · <a href="../../journal/ahmed-masum-acnd-name-guide/">Artist-name guide →</a></p></section>`,
  );
  return page;
}
const longDate = (iso) =>
  new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

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
      datePublished: post.date ?? PUBLICATION_DATE,
      dateModified: post.date ?? PUBLICATION_DATE,
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
      `<article class="journal-article"><p class="eyebrow">${esc(post.category)} · Artist journal</p><h1>${esc(post.title)}</h1><p class="byline">By <a href="../#editorial">I Rave You editorial</a> · <time datetime="${post.date ?? PUBLICATION_DATE}">${longDate(post.date ?? PUBLICATION_DATE)}</time></p><p class="intro article-answer">${esc(post.answer)}</p><figure class="article-figure"><img src="../../${esc(post.image)}" alt="${esc(post.imageAlt)}" width="1200" height="630" fetchpriority="high"><figcaption>Image from the existing I Rave You artist portfolio.</figcaption></figure><nav class="contents" aria-label="In this article"><strong>In this article</strong><ol>${toc}</ol></nav>${body}<aside class="source-note"><h2>About this article</h2><p>Published by I Rave You, this artist portfolio. Artist identity, biography and project credits are based on information supplied for this website. External music and label links identify listening destinations; they are not independent verification of every biographical statement. Genre and listening explanations are editorial guidance.</p></aside><section class="related"><h2>Related reading</h2><ul>${related}</ul><p>${internal("acnd/", "ACND artist profile")} · ${internal("journal/", "All journal posts")}</p></section></article>`,
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
/**
 * An interactive route page: the built app shell (its scripts and styles,
 * re-pointed for the page's depth) with page-specific metadata and optional
 * crawlable content after the app root.
 */
function writeRoute(dir, index, path, headHtml, content) {
  const up = "../".repeat(path.split("/").filter(Boolean).length);
  const rebase = (tag) => tag.replace(/(href|src)="(?!https?:|\/|data:|#)(?:\.\/)?/g, `$1="${up}`);
  const tags = [
    ...index.matchAll(/<script type="module"[^>]*><\/script>|<link rel="(?:modulepreload|stylesheet|icon)"[^>]*>/g),
  ].map((m) => rebase(m[0]));
  const html = `<!doctype html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"><meta name="theme-color" content="#000000">${headHtml}${tags.join("")}</head><body data-view="home"><div id="app"></div>${content ? `<section class="discovery-home discovery-profile">${content}</section>` : ""}</body></html>`;
  mkdirSync(resolve(dir, path), { recursive: true });
  writeFileSync(resolve(dir, path, "index.html"), html);
}

export function seoPlugin({ artists, next, tracks }) {
  const pages = [
    ...discoveryPages(artists, next, tracks),
    pressPage(artists.acnd),
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
        // Artist routes are the interactive app; Vite serves its index.html.
        if (!page || page.artist) return nextMiddleware();
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
    // Every interactive route ships as a real file, so refreshes and shared
    // links work on a plain static host: the artist home carries its full
    // crawlable profile, and the sub-pages point search engines back to it.
    writeBundle(options) {
      const dir = options.dir;
      const index = readFileSync(resolve(dir, "index.html"), "utf8");
      for (const page of pages.filter((p) => p.artist)) {
        const up = "../".repeat(page.path.split("/").filter(Boolean).length);
        // The hero photo is the largest paint on artist pages; fetch it first, then the logo.
        const hero = page.artist.hero.replace(/\.(jpe?g|png)$/, ".webp");
        const early = `<link rel="preload" as="image" href="${up}${hero}" type="image/webp" fetchpriority="high"><link rel="preload" as="image" href="${up}img/logo-${page.artist.id}.webp" type="image/webp">`;
        writeRoute(dir, index, page.path, head(page) + early, page.body);
        for (const [sub, label] of [["listen", "Releases"], ["sequencer", "Sequencer"], ["about", "About"]]) {
          const url = `${ORIGIN}/${page.path}`;
          const title = `${label} · ${page.label} — I Rave You`;
          writeRoute(
            dir,
            index,
            `${page.path}${sub}/`,
            `<title>${esc(title)}</title><meta name="description" content="${esc(page.description)}"><link rel="canonical" href="${url}"><meta property="og:type" content="website"><meta property="og:site_name" content="I Rave You"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(page.description)}"><meta property="og:url" content="${url}"><meta property="og:image" content="${ORIGIN}/${page.image ?? "img/og-frequency-unity.jpg"}"><meta name="twitter:card" content="summary_large_image">`,
            "",
          );
        }
      }
    },
    generateBundle() {
      for (const page of pages.filter((p) => !p.artist))
        this.emitFile({
          type: "asset",
          fileName: `${page.path}index.html`,
          source: page.html,
        });
    },
  };
}
