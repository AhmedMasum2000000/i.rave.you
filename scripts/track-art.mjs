// Cover art for every track in a set, for the player bar: run once per set
// after its tracklist is final (node scripts/track-art.mjs [slug]).
//
// For each track with a link it asks the platform for that release's artwork
// (Apple Music: the iTunes lookup API; SoundCloud: oEmbed), checks the title
// it gets back against the tracklist, scales it to 96×96 WebP with ffmpeg and
// writes public/img/tracks/<slug>/<NN>.webp plus an "art" field in set.json.
// A track with no link (an unreleased ID) gets no art; the player shows the
// set's own artwork for it. The site serves these copies itself, so playing
// the mix makes no requests to Apple or SoundCloud.
import { execFileSync } from "node:child_process";
import { mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const only = process.argv[2];
const norm = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "");

async function artworkFor(url) {
  const u = new URL(url);
  if (u.hostname === "music.apple.com") {
    const id = u.searchParams.get("i") ?? u.pathname.split("/").pop();
    const r = await (await fetch(`https://itunes.apple.com/lookup?id=${id}`)).json();
    const hit = r.results?.[0];
    return hit && { src: hit.artworkUrl100.replace(/100x100bb/, "192x192bb"), title: hit.trackName ?? hit.collectionName };
  }
  if (u.hostname.endsWith("soundcloud.com")) {
    const r = await (await fetch(`https://soundcloud.com/oembed?format=json&url=${encodeURIComponent(url)}`)).json();
    return r.thumbnail_url && { src: r.thumbnail_url, title: r.title };
  }
  return null;
}

for (const slug of readdirSync(resolve(root, "sets")).filter((s) => !only || s === only)) {
  const file = resolve(root, "sets", slug, "set.json");
  const set = JSON.parse(readFileSync(file, "utf8"));
  const outDir = resolve(root, "public/img/tracks", slug);
  mkdirSync(outDir, { recursive: true });
  for (const [i, t] of set.tracklist.entries()) {
    if (!t.url) {
      delete t.art;
      console.log(`${slug} ${i + 1}: ${t.title} — no link, uses the set artwork`);
      continue;
    }
    const art = await artworkFor(t.url);
    if (!art) {
      console.warn(`${slug} ${i + 1}: ${t.title} — no artwork found`);
      continue;
    }
    // The platform's title must contain the tracklist's (SoundCloud prefixes the uploader).
    if (!norm(art.title).includes(norm(t.title).slice(0, 12))) console.warn(`  check: "${t.title}" vs "${art.title}"`);
    const tmp = resolve(tmpdir(), `track-art-${slug}-${i}`);
    writeFileSync(tmp, Buffer.from(await (await fetch(art.src)).arrayBuffer()));
    const name = `${String(i + 1).padStart(2, "0")}.webp`;
    execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-i", tmp, "-vf", "scale=96:96:flags=lanczos", "-quality", "82", resolve(outDir, name)]);
    rmSync(tmp);
    t.art = `img/tracks/${slug}/${name}`;
    console.log(`${slug} ${i + 1}: ${t.title} ← ${art.title}`);
  }
  writeFileSync(file, `${JSON.stringify(set, null, 2)}\n`);
}
