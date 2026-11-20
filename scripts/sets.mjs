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

const decode = (segment) => {
  try {
    return decodeURIComponent(segment);
  } catch {
    return segment;
  }
};

/**
 * set.json's "mixcloud" may be the link exactly as Mixcloud's Share button copies it
 * (https://www.mixcloud.com/USER/SET/?utm_...), a link without the tracking, or the
 * bare key (/USER/SET/). Every form comes out as the key Mixcloud's player wants:
 * /USER/SET/, each part percent-encoded once. A link that is not a Mixcloud set
 * stops the build, so a typo never reaches the live player.
 */
export function mixcloudKey(value, where = "set.json") {
  if (value == null || value === "") return undefined;
  const raw = String(value).trim();
  let path = raw;
  if (/^(?:https?:)?\/\//i.test(raw) || /^(?:www\.)?mixcloud\.com\//i.test(raw)) {
    const url = new URL(/^https?:/i.test(raw) ? raw : `https://${raw.replace(/^\/\//, "")}`);
    if (!/(^|\.)mixcloud\.com$/i.test(url.hostname)) throw new Error(`${where}: "mixcloud" must be a mixcloud.com link, got ${raw}`);
    path = url.pathname;
  }
  const parts = path.split(/[?#]/)[0].split("/").filter(Boolean).map((p) => encodeURIComponent(decode(p)));
  if (parts.length !== 2) throw new Error(`${where}: "mixcloud" must point to one set, like https://www.mixcloud.com/USER/SET-NAME/ (got ${raw})`);
  return `/${parts.join("/")}/`;
}

export function loadSets(root) {
  const dir = resolve(root, "sets");
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true })
    .filter((d) => d.isDirectory() && existsSync(resolve(dir, d.name, "set.json")))
    .map((d) => {
      const json = JSON.parse(readFileSync(resolve(dir, d.name, "set.json"), "utf8"));
      json.mixcloud = mixcloudKey(json.mixcloud, `sets/${d.name}/set.json`);
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
