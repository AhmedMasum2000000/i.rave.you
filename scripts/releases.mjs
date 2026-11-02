// Keeps public/releases.json in step with the artists' catalogues, so the
// release button in the player bar always points at the newest release, or at
// the next one while it can be pre-saved (node scripts/releases.mjs).
//
// Source: Apple Music's public catalogue (the iTunes lookup API, no key). A
// release Apple lists ahead of its day (a pre-add) arrives with a future date;
// the bar shows it as "Pre-save" and, on the day, as "Out today", in every
// open page without a reload (src/release.ts).
//
// Hand-written entries ("source": "manual") always win: their title, link,
// cover and date are never overwritten. That is how a smart link (lnk.to,
// feature.fm) or a pre-save on another service gets in: add or edit the entry
// by hand. Covers are saved into public/img/releases/, so the site serves its
// own copies and visitors make no requests to Apple.
//
// .github/workflows/releases.yml runs this every 30 minutes and commits any
// change to the deploy branch, which publishes it.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const FEED = resolve(root, "public/releases.json");
const COVERS = resolve(root, "public/img/releases");

/** The artists' Apple Music ids (music.apple.com/…/artist/<name>/<id>). */
const ARTISTS = [
  { id: "acnd", apple: 6794471908 },
  { id: "apurba", apple: 1821995434 },
];

const norm = (s) => s.toLowerCase().normalize("NFKD").replace(/[^\p{L}\p{N}]+/gu, "");
const slug = (s) => s.toLowerCase().normalize("NFKD").replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-|-$/g, "") || "release";
/** "Down In Bossa - Single" → "Down In Bossa". */
const clean = (s) => s.replace(/\s+-\s+(Single|EP)$/i, "").trim();

async function json(url) {
  for (let attempt = 1; ; attempt++) {
    try {
      const res = await fetch(url, { headers: { accept: "application/json" } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      if (attempt === 3) throw new Error(`${url}: ${err.message}`);
      await new Promise((r) => setTimeout(r, 2000 * attempt));
    }
  }
}

/** Every release Apple lists for one artist, upcoming ones included. */
async function appleReleases(artist) {
  const data = await json(`https://itunes.apple.com/lookup?id=${artist.apple}&entity=album&limit=200`);
  return (data.results ?? [])
    .filter((r) => r.wrapperType === "collection" && r.collectionId && r.collectionName && r.releaseDate)
    .map((r) => ({
      apple: r.collectionId,
      title: clean(r.collectionName),
      artists: r.artistName,
      date: r.releaseDate,
      url: r.collectionViewUrl.replace(/\?.*$/, ""),
      art: r.artworkUrl100,
      by: artist.id,
    }));
}

/** A 120 px WebP of the cover, from Apple's image service, saved once. */
async function saveCover(release) {
  const file = `img/releases/${release.apple}.webp`;
  if (existsSync(resolve(root, "public", file))) return file;
  if (!release.art) return undefined;
  const res = await fetch(release.art.replace(/\/[^/]+$/, "/120x120bb.webp"));
  if (!res.ok || !/webp/.test(res.headers.get("content-type") ?? "")) return undefined;
  mkdirSync(COVERS, { recursive: true });
  writeFileSync(resolve(root, "public", file), Buffer.from(await res.arrayBuffer()));
  return file;
}

const before = readFileSync(FEED, "utf8");
const feed = JSON.parse(before);
const list = feed.releases;

// One release can sit under both artists (a collaboration): fetch, then merge by Apple id.
const found = new Map();
for (const artist of ARTISTS) {
  for (const r of await appleReleases(artist)) {
    const seen = found.get(r.apple);
    if (seen) seen.for = [...new Set([...seen.for, artist.id])];
    else found.set(r.apple, { ...r, for: [artist.id] });
  }
}

let added = 0;
let changed = 0;
for (const r of found.values()) {
  const match = list.find((e) => e.apple === r.apple) ?? list.find((e) => !e.apple && norm(e.title) === norm(r.title));
  if (match?.source === "manual") {
    // Hand-written: only learn its Apple id.
    if (!match.apple) {
      match.apple = r.apple;
      changed++;
    }
    continue;
  }
  const cover = (await saveCover(r)) ?? match?.cover;
  const entry = {
    id: match?.id ?? (list.some((e) => e.id === slug(r.title)) ? `${slug(r.title)}-${r.apple}` : slug(r.title)),
    title: r.title,
    artists: r.artists,
    for: r.for,
    date: r.date,
    url: r.url,
    ...(cover ? { cover } : {}),
    apple: r.apple,
    source: "apple",
  };
  if (!match) {
    list.push(entry);
    added++;
    console.log(`+ ${entry.title} — ${entry.artists} (${entry.date.slice(0, 10)})`);
  } else if (JSON.stringify(match) !== JSON.stringify(entry)) {
    Object.keys(match).forEach((k) => delete match[k]);
    Object.assign(match, entry);
    changed++;
    console.log(`~ ${entry.title} — ${entry.artists} (${entry.date.slice(0, 10)})`);
  }
}

// Newest first, so the file reads like the catalogue.
list.sort((a, b) => Date.parse(b.date) - Date.parse(a.date));
const after = `${JSON.stringify(feed, null, 2)}\n`;
if (after !== before) writeFileSync(FEED, after);
console.log(`${found.size} releases on Apple Music; ${added} new, ${changed} updated${after === before ? "; feed unchanged" : "; feed written"}.`);
