# I RAVE YOU

Two artists, one pulse: **অপূর্ব** (black · white · blue glow) and **ACND** (white · black · orange glow).

- **Home** — a live yin-yang: the screen splits along an S-curve that breathes with the mix, particles
  and HUD rings invert as they cross it, and clicking a side floods the screen into that artist's world.
- **Artist pages** — four routes per artist, after the ascension.pegassi.be structure on a grained black
  canvas: home (`/acnd/`: chrome mark over a lit doorway, annotated essay, tracklist, media, bio, footnotes),
  listen (`/acnd/listen/`), sequencer (`/acnd/sequencer/`) and about (`/acnd/about/`). Same for `/apurba/…`.
  URLs are clean (History API, `src/router.ts`); the build writes a real `index.html` for every route, so refreshes
  and shared links work on any static host. Old `#/…` links redirect to the clean URL.
- **Menu** — a site-wide MENU overlay with the next release and its live countdown.
- **The set** — Qbic Pulse, hosted by ACND & অপূর্ব for Hong Kong Community Radio (HKCR) — starts from
  the entry record and keeps playing across every page, including journal, mix, legal and feature pages opened from
  the site (they load inside the shell, so the audio never reloads), and when the tab is in the background.
  A white player bar on every page (`src/player.ts`, `src/bar.css`): a seek line across the whole set with an eye
  for a knob, then the mix artwork, play, the playing track, the I RAVE YOU wordmark (home), the artist's Spotify,
  SHARE and a PRE-SAVE pill with the “Down In Bossa” countdown. The artwork or title opens the tracklist window:
  every track with its timestamp, click to jump, previous/next and original-recording links.
  Only a first visit to the home page asks about sound; the choice is remembered, and no other page prompts.

- **Sound & motion** — the mix plays through a click-free chain: pause, resume and every seek fade over a few
  milliseconds, the AudioContext asks for playback-sized buffers, and lock screens, headphones and media keys get
  track metadata and controls (Media Session). `src/fx.ts` feeds the kick and low end into CSS variables on the
  player, dock and home marks, adds page transitions, a desktop cursor aura and magnetic calls to action; the home
  canvas sheds particles and resolution on its own if frames run long. All motion respects reduced-motion.

```
npm install
npm run dev
npm run build   # -> dist/
```

## Editing

All content lives in [`src/data.ts`](src/data.ts): tracklist and timestamps, releases, IDs, links, bios.

| Asset | Path | Notes |
| --- | --- | --- |
| Logos | `public/img/logo-apurba.png`, `public/img/logo-acnd.png` | Black ink on white or transparent. Inverted automatically on dark backgrounds. The layout hides the logo slots until the files exist. |
| ACND photo | `public/img/acnd.jpg` | Falls back to `acnd-portrait.webp` until present. |
| অপূর্ব photo | `public/img/apurba.jpg` | Doorway and first photo tile on his pages. Falls back to `apurba-sun.jpg` until present. |
| Set | `public/sets/<slug>/audio/` | Source fragments are authenticated and joined by `scripts/mix-audio.mjs` during Vite development/build. The browser plays the generated continuous `audio/qbic-pulse.<hash>.m4a` (cached for a year, see `public/.htaccess`) with native buffering and byte-range seeking; track jumps load on a second deck and crossfade (`src/audio.ts`). |
| Fonts | `public/fonts/` | Self-hosted Doto and Hind Siliguri; SIL OFL licenses are included. No Google Fonts requests. |

## Unlisted pages

Arka Fashion Week '26 pitch pages: `afw26/acnd-7q4x2k/`, `afw26/apurba-9m1v8t/` and
`afw26/ash-army-3k8w5n/`. Nothing links to them and they are `noindex`. Share the URLs directly.
Their paths are set in `src/secret.ts`. Ash Army's page has no mix and shows `public/img/ash-army.jpg`
once that file exists.

## Feature page

`frequency-unity/` is a static, indexable article ("Beyond the Capital: অপূর্ব x ACND") with Article,
MusicRecording, Person and FAQPage structured data, Open Graph/Twitter cards and a share image
(`public/img/og-frequency-unity.jpg`). It is listed in `public/sitemap.xml`.

## Content protection

`src/guard.ts` deters copying and capture: no selection, copy, right-click, dragging or print; common
save/view-source/devtools shortcuts are swallowed; the page blacks out when it loses focus, on Print Screen
and on the macOS screenshot keys; it refuses to be framed. The mix plays as a continuous, directly accessible audio file (`src/stream.ts`). Source encryption is retained in the repository; it is not download protection for deployed audio.

These page controls cannot prevent recording or downloading audio. Music rights must be cleared separately.

To re-encrypt a new set:

```
ffmpeg -i set.m4a -c copy -f mp4 -movflags +frag_keyframe+empty_moov+default_base_moof -frag_duration 10000000 frag.mp4
STREAM_KEY=<64 hex> STREAM_DURATION=<seconds> node scripts/encrypt-audio.mjs frag.mp4 public/audio/x
```

then put the same key, split and XOR-mixed, in `src/stream-key.ts`.

## Audio startup

The audio-choice prompt preloads the continuous mix and attempts playback immediately. Browsers that block audible autoplay need one real click/tap or key interaction; the sound button retries the media element and its AudioContext. The player reports actual playback rather than assuming a rejected play request succeeded. Manual pause is respected.

The build authenticates every original AES-GCM fragment using Node.js and emits one continuous AAC/MP4 asset without re-encoding. No browser Web Crypto or MSE is required, so playback also works on HTTP while SSL is being resolved. `npm run dev` serves the same generated asset with byte ranges. Track markers share a single media timeline and do not load separate tracks; normal buffering can still occur on slow connections. No additional build dependencies or external tools are needed.

## Legal notices and contact

Terms, Privacy and Copyright contact pages are at `legal/terms/`, `legal/privacy/` and `legal/copyright/`. The public contact is khalidbinalam250@gmail.com. These notices do not replace copyright clearance or provide statutory safe-harbour protection. The site owner is confirming permissions for the existing mix. Fonts are self-hosted from Fontsource packages pinned at 5.3.0, with original SIL OFL licenses retained in `public/fonts/`.

## Qbic Pulse Radio: adding a set

Every set lives in `sets/<slug>/`: `set.json` (title, volume, date, station, description, tracklist) and `audio/` (encrypted ~10 s fragments). The build turns each set into a hashed, year-cached, range-streamable `.m4a`, lists all sets newest first on `/radio/` and in the menu's **Qbic Pulse Radio** row, gives each new set a tracklist page at `/mixes/<slug>/`, and adds them to the generated sitemap. The newest set plays by default; visitors can switch sets from the radio page and each set resumes where they left it.

```bash
node scripts/add-set.mjs path/to/set.wav --slug qbic-pulse-vol-2 --volume "Vol. 2" --date 2026-11-20 \
  --tracklist tracklist.txt   # lines like "03:37 Artist - Title | https://link"
npm run build                 # then commit sets/qbic-pulse-vol-2 and push
```

An AAC source (`.m4a`) is copied without re-encoding; WAV/AIFF/FLAC/MP3 are encoded once to AAC-LC 320 kb/s. The player streams every set the same way (2 s pieces, instant jumps), so a new set never lowers quality or speed. Edit `set.json` by hand at any time to fix details or the tracklist. Mixing from Claude Code with Mixxx: see `tools/mixx-dj-mcp/VENDORED.md`.
