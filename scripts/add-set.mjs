// Add a set to Qbic Pulse Radio.
//
//   node scripts/add-set.mjs <audio file> --slug qbic-pulse-vol-2 --volume "Vol. 2" --date 2026-11-20 \
//     [--show "Qbic Pulse"] [--title "..."] [--station "Hong Kong Community Radio"] [--station-url https://hkcr.live/] \
//     [--hosts "ACND & অপূর্ব"] [--bpm 125] [--description "..."] [--tracklist tracklist.txt]
//
// Writes sets/<slug>/set.json and sets/<slug>/audio/ (encrypted ~10 s fragments). The next
// build turns it into a streamable, long-cached file and lists it first on /radio/.
//
// Audio quality: an AAC source (m4a/mp4/aac) is copied as-is, never re-encoded. Anything
// else (WAV, AIFF, FLAC, MP3) is encoded once to AAC-LC 320 kb/s at the source's sample rate.
// Needs ffmpeg/ffprobe on PATH.
//
// tracklist.txt: one track per line, "mm:ss Artist - Title" or "h:mm:ss Artist - Title",
// optionally followed by " | https://link". Lines starting with # are ignored.
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const args = process.argv.slice(2);
const src = args.find((a, i) => !a.startsWith("--") && !args[i - 1]?.startsWith("--"));
const opt = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : fallback;
};
const slug = opt("slug");
if (!src || !existsSync(src) || !slug || !/^[a-z0-9-]+$/.test(slug)) {
  console.error('usage: node scripts/add-set.mjs <audio> --slug <a-z0-9-> --volume "Vol. 2" --date YYYY-MM-DD [options]');
  process.exit(1);
}
const date = opt("date", new Date().toISOString().slice(0, 10));
if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error("--date must be YYYY-MM-DD");

const probe = JSON.parse(execFileSync("ffprobe", ["-v", "error", "-print_format", "json", "-show_streams", "-show_format", src], { encoding: "utf8" }));
const audio = probe.streams.find((s) => s.codec_type === "audio");
if (!audio) throw new Error("No audio stream in the file");
const rate = [44100, 48000].includes(Number(audio.sample_rate)) ? Number(audio.sample_rate) : 48000;
const copy = audio.codec_name === "aac";

const work = mkdtempSync(join(tmpdir(), "add-set-"));
const frag = join(work, "frag.mp4");
// One pass: copy or encode once, then cut into ~10 s fragments for streaming.
execFileSync("ffmpeg", [
  "-v", "error", "-y", "-i", src, "-vn", "-map", "0:a:0",
  ...(copy ? ["-c:a", "copy"] : ["-c:a", "aac", "-b:a", "320k", "-ar", String(rate), "-ac", "2"]),
  "-movflags", "+frag_keyframe+empty_moov+default_base_moof", "-frag_duration", "10000000", "-f", "mp4", frag,
], { stdio: "inherit" });
const duration = Number(JSON.parse(execFileSync("ffprobe", ["-v", "error", "-print_format", "json", "-show_format", frag], { encoding: "utf8" })).format.duration);

// The same key the build uses to open the fragments (src/stream-key.ts).
const keySource = readFileSync(resolve(root, "src/stream-key.ts"), "utf8");
const [k1, k2] = ["K1", "K2"].map((n) => Buffer.from(keySource.match(new RegExp(`export const ${n}\\s*=\\s*['"]([a-fA-F0-9]+)['"]`))[1], "hex"));
const key = Buffer.from(k1.map((b, i) => b ^ k2[i])).toString("hex");
const dir = resolve(root, "sets", slug);
mkdirSync(dir, { recursive: true });
execFileSync(process.execPath, [resolve(root, "scripts/encrypt-audio.mjs"), frag, join(dir, "audio")], {
  env: { ...process.env, STREAM_KEY: key, STREAM_DURATION: String(duration) },
  stdio: "inherit",
});
rmSync(work, { recursive: true, force: true });

const tracklist = [];
const listFile = opt("tracklist");
if (listFile) {
  for (const line of readFileSync(listFile, "utf8").split(/\r?\n/)) {
    const m = line.trim().match(/^((?:\d+:)?\d{1,2}:\d{2})\s+(.+?)\s+[-–—]\s+(.+?)(?:\s+\|\s+(https?:\/\/\S+))?$/);
    if (!m || line.trim().startsWith("#")) continue;
    tracklist.push({ at: m[1], artist: m[2], title: m[3], ...(m[4] ? { url: m[4] } : {}) });
  }
}
const show = opt("show", "Qbic Pulse");
const volume = opt("volume", "");
const station = opt("station", "Hong Kong Community Radio");
const set = {
  title: opt("title", `${show} ${volume}`.trim()),
  show,
  volume,
  hosts: opt("hosts", "ACND & অপূর্ব"),
  station,
  stationUrl: opt("station-url", "https://hkcr.live/"),
  date,
  bpm: Number(opt("bpm", 125)),
  description: opt("description", `${show} ${volume} by ACND and অপূর্ব for ${station}.`.replace(/\s+/g, " ")),
  tracklist,
};
const file = join(dir, "set.json");
if (existsSync(file)) {
  // Keep hand-edited details; refresh only what the audio decides.
  const old = JSON.parse(readFileSync(file, "utf8"));
  Object.assign(set, old, tracklist.length ? { tracklist } : {});
}
writeFileSync(file, JSON.stringify(set, null, 2) + "\n");
console.log(`${copy ? "copied AAC" : `encoded AAC 320k @ ${rate} Hz`} · ${Math.round(duration)} s · ${tracklist.length} tracks → sets/${slug}/ (newest-first by date ${date})`);
