# I RAVE YOU

Two artists, one pulse: **অপূর্ব** (black · white · blue glow) and **ACND** (white · black · orange glow).

- **Home** — a live yin-yang: the screen splits along an S-curve that breathes with the mix, particles
  and HUD rings invert as they cross it, and clicking a side floods the screen into that artist's world.
- **Artist pages** — four routes per artist, after the ascension.pegassi.be structure on a grained black
  canvas: home (`#/acnd`: chrome mark over a lit doorway, annotated essay, tracklist, media, bio, footnotes),
  listen (`#/acnd/listen`), sequencer (`#/acnd/sequencer`) and about (`#/acnd/about`). Same for `#/apurba/…`.
- **Menu & pre-save** — a site-wide MENU overlay and a live “Down In Bossa” countdown with a PRE-SAVE button.
- **The set** — Qbic Pulse, hosted by ACND & অপূর্ব for Hong Kong Community Radio (HKCR) — starts from
  the entry record and keeps playing across pages, fading out (paused in place) whenever the tab loses focus.
  A player chip on every page has play/pause; on the home page it opens the **Track ID** panel: every track
  with its timestamp, click to jump, previous/next and a seekable bar. Track IDs appear on the home page only.

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
| Set | `public/audio/x/` | AES-GCM-encrypted 10 s fragments of the AAC 256 kbps set, made by `scripts/encrypt-audio.mjs`. There is no plain audio file on the site. |
| Font | `public/fonts/OffBit-Dot.woff2`, `OffBit-DotBold.woff2` | Optional, licensed copy of OffBit. Without it the site uses Doto (SIL OFL). |

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
and on the macOS screenshot keys; it refuses to be framed. The set streams from encrypted fragments
(`src/stream.ts`) through Media Source Extensions, so there is no file to download.

None of this can stop an OS screenshot, a camera, or recording the speaker output — it closes the easy routes.

To re-encrypt a new set:

```
ffmpeg -i set.m4a -c copy -f mp4 -movflags +frag_keyframe+empty_moov+default_base_moof -frag_duration 10000000 frag.mp4
STREAM_KEY=<64 hex> STREAM_DURATION=<seconds> node scripts/encrypt-audio.mjs frag.mp4 public/audio/x
```

then put the same key, split and XOR-mixed, in `src/stream-key.ts`.
