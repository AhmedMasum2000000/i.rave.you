// The radio library: one folder per set in sets/<slug>/ with set.json (details and
// tracklist) and audio/ (encrypted fragments made by scripts/add-set.mjs).
// Newest first, by `date`.
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const seconds = (mmss) => {
  const parts = String(mmss).split(":").map(Number);
  return parts.reduce((total, n) => total * 60 + n, 0);
};
const label = (url, title = "") => (!url ? (/unreleased/i.test(title) ? "Unreleased" : "") : url.includes("music.apple.com") ? "Apple Music" : url.includes("soundcloud.com") ? "SoundCloud" : url.includes("spotify.com") ? "Spotify" : url.includes("beatport.com") ? "Beatport" : url.includes("youtu") ? "YouTube" : url.includes("mixcloud.com") ? "Mixcloud" : "Listen");

/** The public page of a Mixcloud upload, from its key. */
export const mixcloudUrl = (key) => (key ? `https://www.mixcloud.com${key}` : undefined);

export function loadSets(root) {
  const dir = resolve(root, "sets");
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true })
    .filter((d) => d.isDirectory() && existsSync(resolve(dir, d.name, "set.json")))
    .map((d) => {
      const json = JSON.parse(readFileSync(resolve(dir, d.name, "set.json"), "utf8"));
      const manifest = resolve(dir, d.name, "audio", "m.json");
      return {
        slug: d.name,
        ...json,
        audioDir: resolve(dir, d.name, "audio"),
        // A Mixcloud set states its own length; a self-hosted one takes it from the audio.
        duration: json.duration ?? (existsSync(manifest) ? JSON.parse(readFileSync(manifest, "utf8")).t : 0),
        tracklist: (json.tracklist?.length ? json.tracklist : [{ at: "00:00", artist: json.hosts, title: `${json.show} ${json.volume}`, url: mixcloudUrl(json.mixcloud), linkLabel: "Mixcloud" }])
          .map((t) => ({ at: seconds(t.at), artist: t.artist, title: t.title, url: t.url, linkLabel: t.linkLabel ?? label(t.url, t.title), art: t.art })),
      };
    })
    .sort((a, b) => String(b.date).localeCompare(String(a.date)) || a.slug.localeCompare(b.slug));
}
