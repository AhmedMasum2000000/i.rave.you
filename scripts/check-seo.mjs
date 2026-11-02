/** Regression checks on the actual production documents, not source templates. */
import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
const origin = "https://iraveyou.online";
const walk = (dir) => readdirSync(dir, { withFileTypes: true }).flatMap((d) => (d.isDirectory() ? walk(resolve(dir, d.name)) : [resolve(dir, d.name)]));
const root = resolve("dist");
const sitemap = readFileSync(resolve(root, "sitemap.xml"), "utf8");
const urls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1]);
assert.equal(urls.length, 28);
assert.equal(new Set(urls).size, urls.length);
const titles = new Set();
for (const url of urls) {
  assert.ok(url.startsWith(origin + "/") && !url.includes("#"));
  const pathname = new URL(url).pathname;
  const html = readFileSync(
    resolve(root, "." + pathname, "index.html"),
    "utf8",
  );
  const canonicals = [
    ...html.matchAll(/<link\b[^>]*rel="canonical"[^>]*href="([^"]+)"/g),
  ].map((m) => m[1]);
  assert.deepEqual(canonicals, [url], `canonical for ${url}`);
  assert.ok(!/name="robots"[^>]*noindex/.test(html));
  const title = html.match(/<title>(.*?)<\/title>/s)?.[1];
  assert.ok(title && !titles.has(title));
  titles.add(title);
  assert.ok(/<meta name="description" content="[^"\n]+"/.test(html));
  assert.ok(!html.includes("https://ahmedmasum2000000.github.io/i.rave.you/"));
  for (const match of html.matchAll(
    /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g,
  )) {
    const graph = JSON.parse(match[1]);
    assert.equal(graph["@context"], "https://schema.org");
  }
  for (const match of html.matchAll(/(?:href|src)="([^"#]+)"/g)) {
    if (/^(https?:|mailto:|data:)/.test(match[1])) continue;
    const link = new URL(match[1], url);
    let path = resolve(root, "." + decodeURIComponent(link.pathname));
    if (link.pathname.endsWith("/")) path = resolve(path, "index.html");
    assert.ok(existsSync(path), `missing ${match[1]} from ${url}`);
  }
  console.log(
    `PASS ${pathname}: canonical, unique title, description, JSON-LD and local links`,
  );
}
const home = readFileSync(resolve(root, "index.html"), "utf8");
assert.match(home, /<h1[^>]*>I Rave You/);
assert.match(home, /href="acnd\/"/);
// The release is distributed by ADA Central Europe (Warner Music Group), per its ℗ line.
assert.match(home, /distributed by ADA Central Europe/);
assert.match(readFileSync(resolve(root, "music/down-in-bossa/index.html"), "utf8"), /ADA Central Europe \(Warner Music Group\)/);
assert.doesNotMatch(home, /Warner Records/);
// ACND is independent: one release on Profi Music, no label deal.
assert.match(home, /not signed to a label/);
for (const page of [home, readFileSync(resolve(root, "acnd/index.html"), "utf8")]) assert.doesNotMatch(page, /signed (?:to|with) (?:Profi|ADA|Warner)/i);
const acnd = readFileSync(resolve(root, "acnd/index.html"), "utf8");
assert.match(acnd, /Ahmed Masum/);
assert.match(acnd, /Dhaka/);
assert.match(acnd, /Nitol Paye Electric/);
assert.doesNotMatch(acnd, /A H Al Masum/);
const apurba = readFileSync(resolve(root, "apurba/index.html"), "utf8");
assert.match(apurba, /Khalid Bin Alam/);
assert.match(apurba, /Opurbo/);
assert.match(apurba, /Cumilla/);
const mix = readFileSync(resolve(root, "mixes/qbic-pulse/index.html"), "utf8");
const list = mix.match(/<ol class="tracks">([\s\S]*?)<\/ol>/)[1];
assert.equal([...list.matchAll(/<li>/g)].length, 15);
assert.match(list, /43:19/);
assert.match(list, /Vakabular Remix/);
// Artist profiles are the interactive app at clean URLs, with the full
// crawlable profile in the document; every sub-page exists as a real file.
for (const id of ["acnd", "apurba"]) {
  const html = readFileSync(resolve(root, id, "index.html"), "utf8");
  assert.match(html, /<div id="app"><\/div><section class="discovery-home discovery-profile">/);
  assert.match(html, /<script type="module"[^>]*src="\.\.\/assets\//);
  // Releases and About are pages of their own: self canonical, own title and description, crawlable content.
  const titles = new Set([html.match(/<title>([^<]*)/)[1]]);
  for (const sub of ["listen", "about"]) {
    const page = readFileSync(resolve(root, id, sub, "index.html"), "utf8");
    assert.match(page, new RegExp(`rel="canonical" href="${origin}/${id}/${sub}/"`));
    assert.match(page, /src="\.\.\/\.\.\/assets\//);
    assert.match(page, /<meta name="description" content="[^"]{70,}"/);
    assert.match(page, /<section class="discovery-home discovery-profile">/);
    const title = page.match(/<title>([^<]*)/)[1];
    assert.ok(!titles.has(title), `duplicate title ${title}`);
    titles.add(title);
  }
  // The sequencer is gone: no file, no link, a 301 on the host.
  assert.ok(!existsSync(resolve(root, id, "sequencer")), `${id}/sequencer/ still built`);
}
const htaccess = readFileSync(resolve(root, ".htaccess"), "utf8");
assert.match(htaccess, /RewriteRule \^\(acnd\|apurba\)\/sequencer\(\?:\/\.\*\)\?\$ https:\/\/iraveyou\.online\/\$1\/ \[R=301,L\]/);
for (const file of walk(root).filter((f) => f.endsWith(".html")))
  assert.doesNotMatch(readFileSync(file, "utf8"), /\/sequencer\//, `${file} links to a sequencer page`);
assert.doesNotMatch(sitemap, /sequencer/);
// Music: the releases index answers instead of a bare folder.
const music = readFileSync(resolve(root, "music", "index.html"), "utf8");
assert.match(music, new RegExp(`rel="canonical" href="${origin}/music/"`));
assert.match(music, /"@type":"CollectionPage"/);
for (const path of ["music/", "acnd/listen/", "acnd/about/", "apurba/listen/", "apurba/about/"])
  assert.match(sitemap, new RegExp(`<loc>${origin}/${path}</loc>`));
for (const html of [home, acnd, apurba]) assert.doesNotMatch(html, /href="[^"]*#\//);
for (const path of [
  "music/down-in-bossa",
  "mixes/qbic-pulse",
])
  assert.doesNotMatch(
    readFileSync(resolve(root, path, "index.html"), "utf8"),
    /<script(?! type="application\/ld\+json"| src="[^"]*ga4\.js")|<audio/,
  );
for (const path of ["acnd-7q4x2k", "apurba-9m1v8t", "ash-army-3k8w5n"]) {
  const html = readFileSync(resolve(root, "afw26", path, "index.html"), "utf8");
  assert.match(html, /noindex/);
  assert.ok(!sitemap.includes(path));
}
assert.match(
  readFileSync(resolve(root, "robots.txt"), "utf8"),
  /Sitemap: https:\/\/iraveyou\.online\/sitemap\.xml/,
);
console.log(
  "PASS identity credits, 15-track list, clean interactive artist routes, script-free discovery pages, private pitch exclusions and sitemap reference",
);

// Check the published cluster, including related links and in-page references.
const journalUrls = urls.filter((url) =>
  new URL(url).pathname.startsWith("/journal/"),
);
assert.equal(journalUrls.length, 12);
const articleUrls = journalUrls.filter(
  (url) => new URL(url).pathname !== "/journal/",
);
const graph = new Map();
for (const url of articleUrls) {
  const html = readFileSync(
    resolve(root, "." + new URL(url).pathname, "index.html"),
    "utf8",
  );
  assert.equal([...html.matchAll(/<h1\b/g)].length, 1);
  assert.match(html, /property="og:type" content="article"/);
  assert.match(html, /class="[^"]*article-answer[^"]*"/);
  const json = JSON.parse(
    html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1],
  );
  const article = json["@graph"].find(
    (entity) => entity["@type"] === "Article",
  );
  assert.equal(article.url, url);
  assert.equal(article.about["@id"], origin + "/acnd/#artist");
  assert.ok(["2026-10-28", "2026-10-30"].includes(article.datePublished));
  for (const match of html.matchAll(/href="#([^"]+)"/g)) {
    assert.ok(
      html.includes(`id="${match[1]}"`),
      `broken section anchor ${match[1]} in ${url}`,
    );
  }
  const related = html.match(
    /<section class="related">([\s\S]*?)<\/section>/,
  )[1];
  const targets = [...related.matchAll(/href="([^"]+)"/g)]
    .map((m) => new URL(m[1], url).href)
    .filter((link) => articleUrls.includes(link));
  assert.equal(targets.length, 3);
  assert.ok(!targets.includes(url));
  graph.set(url, targets);
  assert.doesNotMatch(html, /<audio|<script(?! type="application\/ld\+json"| src="[^"]*ga4\.js")/);
  assert.doesNotMatch(html, /iraveyou\.com/);
}
for (const start of articleUrls) {
  const visited = new Set();
  const queue = [start];
  while (queue.length) {
    const current = queue.shift();
    if (visited.has(current)) continue;
    visited.add(current);
    queue.push(...graph.get(current));
  }
  assert.equal(
    visited.size,
    11,
    `disconnected related-reading cluster from ${start}`,
  );
}
const identity = readFileSync(
  resolve(root, "journal/ahmed-masum-acnd-name-guide/index.html"),
  "utf8",
);
assert.match(identity, /Ahmed Al Masum/);
assert.match(identity, /alternate search spelling/);
assert.match(acnd, /Ahmed Al Masum/);
console.log(
  "PASS eleven articles: schema, answer summaries, anchors, 33 related links, connected reading cluster and name variant",
);

// All public and private HTML shares the same locally served brand typography.
const press = readFileSync(resolve(root, "acnd/press/index.html"), "utf8");
assert.match(press, /Ahmed Masum \(ACND\): press kit/);
assert.match(press, /press\/acnd-artist-facts.txt/);
assert.match(
  readFileSync(resolve(root, "press/acnd-artist-facts.txt"), "utf8"),
  /ARTIST REFERENCE/,
);
assert.match(acnd, /<h1>Ahmed Masum \(ACND\)<\/h1>/);
const acndGraph = JSON.parse(
  acnd.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1],
);
const person = acndGraph["@graph"].find(
  (entity) => entity["@id"] === origin + "/acnd/#artist",
);
assert.equal(person.name, "Ahmed Masum");
assert.ok(person.alternateName.includes("ACND"));
assert.ok(person.sameAs.includes("https://www.facebook.com/ahmed.masum.peace"));
for (const url of [
  ...urls,
  ...["acnd-7q4x2k", "apurba-9m1v8t", "ash-army-3k8w5n"].map(
    (slug) => `${origin}/afw26/${slug}/`,
  ),
]) {
  const html = readFileSync(
    resolve(root, "." + new URL(url).pathname, "index.html"),
    "utf8",
  );
  assert.match(
    html,
    /rel="stylesheet" href="(?:\.\/|\.\.\/)*fonts\/brand.css"/,
    `brand font sheet missing from ${url}`,
  );
}
const brandSheet = readFileSync(resolve(root, "fonts/brand.css"), "utf8");
for (const match of brandSheet.matchAll(/url\(['"]?(.*?)['"]?\)/g))
  assert.ok(
    existsSync(resolve(root, "fonts", match[1])),
    `missing font ${match[1]}`,
  );
console.log(
  "PASS canonical full-name identity, linked Facebook profile, press kit, downloadable facts and brand typography on every page",
);
const releasePage = readFileSync(
  resolve(root, "music/down-in-bossa/index.html"),
  "utf8",
);
assert.match(releasePage, /<h1>Down In Bossa<\/h1>/);
assert.match(releasePage, /Ibiza-inspired house playlist/);
assert.match(
  releasePage,
  /genre supplied for “Down In Bossa” is <strong>Afro House/,
);
assert.match(releasePage, /not a report of Ibiza airplay/);
const recordingGraph = JSON.parse(
  releasePage.match(
    /<script type="application\/ld\+json">([\s\S]*?)<\/script>/,
  )[1],
);
assert.equal(
  recordingGraph["@graph"].find(
    (entity) => entity["@type"] === "MusicRecording",
  ).genre,
  "Afro House",
);
console.log(
  "PASS expanded Down In Bossa page: single canonical release, Ibiza playlist context, preserved factual genre and credits",
);
const firstTrack = list.match(/<li>([\s\S]*?)<\/li>/)[1];
assert.doesNotMatch(firstTrack, /<a\b/);
assert.match(firstTrack, /Unreleased/);
assert.equal([...list.matchAll(/<a\b/g)].length, 14);
console.log(
  "PASS unreleased opening track retains credit and timestamp without an external link; other 14 recording links remain",
);

// Legal: the domain, the contact, the licensing statement, and a privacy
// notice that matches what actually runs (src/site.config.ts).
{
  const terms = readFileSync(resolve(root, "legal/terms/index.html"), "utf8");
  const privacy = readFileSync(resolve(root, "legal/privacy/index.html"), "utf8");
  const rights = readFileSync(resolve(root, "legal/copyright/index.html"), "utf8");
  const statement = "All music, recordings, compositions, and creative materials featured on iRaveYou remain the property of their respective copyright owners unless otherwise stated.";
  for (const page of [terms, rights]) assert.ok(page.includes(statement), "licensing statement");
  for (const page of [terms, privacy, rights]) {
    assert.match(page, /khalidbinalam250@gmail\.com/);
    assert.doesNotMatch(page, /iraveyou\.com|i-rave-you\.com/);
  }
  const ga4 = readFileSync(resolve("src/site.config.ts"), "utf8").match(/GA4_MEASUREMENT_ID = '([^']*)'/)[1];
  const tagged = walk(root).filter((f) => f.endsWith(".html") && readFileSync(f, "utf8").includes("googletagmanager"));
  if (ga4) {
    assert.match(privacy, /We use Google Analytics 4/);
    assert.ok(tagged.length > 0, "GA4 tag on static pages");
  } else {
    assert.match(privacy, /The site currently runs no analytics/);
    assert.deepEqual(tagged, [], "no analytics while no Measurement ID is set");
  }
  console.log(`PASS legal pages: iraveyou.online, contact, licensing statement, analytics notice (${ga4 ? "GA4 on" : "no analytics"})`);
}

// The release button's feed: served as-is, every entry usable, every cover on disk.
{
  const feed = JSON.parse(readFileSync(resolve(root, "releases.json"), "utf8"));
  assert.ok(Array.isArray(feed.releases) && feed.releases.length > 0, "releases.json lists releases");
  for (const r of feed.releases) {
    assert.ok(r.id && r.title && r.artists, `release fields: ${JSON.stringify(r)}`);
    assert.ok(Number.isFinite(Date.parse(r.date)), `release date: ${r.title}`);
    for (const link of [r.url, r.presave].filter(Boolean)) assert.match(link, /^https:\/\//, `release link: ${r.title}`);
    if (r.cover && !/^https:/.test(r.cover)) assert.ok(existsSync(resolve(root, r.cover)), `release cover: ${r.cover}`);
  }
  assert.equal(new Set(feed.releases.map((r) => r.id)).size, feed.releases.length, "release ids are unique");
  assert.match(htaccess, /FilesMatch "\\\.\(html\|json\)\$"/, "releases.json always revalidates");
  console.log(`PASS release feed: ${feed.releases.length} releases, links, dates and covers`);
}

// Security layers: headers, audio only from the site, encrypted stream, no inline scripts.
{
  for (const h of ["Content-Security-Policy", "Permissions-Policy", "Strict-Transport-Security", "X-Content-Type-Options", "X-Frame-Options", "Referrer-Policy", "Cross-Origin-Resource-Policy"])
    assert.match(htaccess, new RegExp(`Header always set ${h} `), h);
  assert.match(htaccess, /microphone=\(\).*display-capture=\(\)/);
  assert.match(htaccess, /RewriteCond %\{HTTP_REFERER\} !\^https:\/\/\(www\\\.\)\?iraveyou/);
  const bins = readdirSync(resolve(root, "audio")).filter((f) => f.endsWith(".bin"));
  assert.ok(bins.length > 0, "encrypted stream copy");
  for (const f of walk(root).filter((f) => f.endsWith(".html")))
    assert.doesNotMatch(readFileSync(f, "utf8"), /<script(?![^>]*\bsrc=)(?! type="application\/ld\+json")[^>]*>/, `inline script in ${f}`);
  assert.match(readFileSync(resolve(root, "seo.css"), "utf8"), /user-select: none/);
  console.log(`PASS security: headers, audio referer lock, ${bins.length} encrypted stream(s), no inline scripts, static copy guard`);
}
