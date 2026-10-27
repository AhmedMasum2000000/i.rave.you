/** Regression checks on the actual production documents, not source templates. */
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
const origin = "https://iraveyou.online";
const root = resolve("dist");
const sitemap = readFileSync(resolve(root, "sitemap.xml"), "utf8");
const urls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1]);
assert.equal(urls.length, 9);
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
for (const path of [
  "acnd",
  "apurba",
  "music/down-in-bossa",
  "mixes/qbic-pulse",
])
  assert.doesNotMatch(
    readFileSync(resolve(root, path, "index.html"), "utf8"),
    /<script(?! type="application\/ld\+json")|<audio/,
  );
for (const path of ["acnd-7q4x2k", "apurba-9m1v8t", "ash-army-3k8w5n"]) {
  const html = readFileSync(resolve(root, "afw26", path, "index.html"), "utf8");
  assert.match(html, /noindex/);
  assert.ok(!sitemap.includes(path));
}
assert.match(
  readFileSync(resolve(root, "robots.txt"), "utf8"),
  /Sitemap: https:\/\/iraveyou.online\/sitemap.xml/,
);
console.log(
  "PASS identity credits, 15-track list, script-free discovery pages, private pitch exclusions and sitemap reference",
);
