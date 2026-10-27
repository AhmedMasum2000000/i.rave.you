# I RAVE YOU

Two artists, one pulse: **অপূর্ব** (black · white · blue glow) and **ACND** (white · black · orange glow).

- **Home** — a live yin-yang: the screen splits along an S-curve that breathes with the mix, particles
  and HUD rings invert as they cross it, and clicking a side floods the screen into that artist's world.
- **Artist pages** (`#/apurba`, `#/acnd`) — modelled on the ascension.pegassi.be layout: arched chrome
  wordmark over a lit doorway, word-by-word statement, tracklist + spinning record, releases,
  IDs, a playable 16-step sequencer, about, and a jump to the other half.
- **The mix** plays from the moment the visitor clicks the entry record, with no transport controls.
  The current track ID shows (and links) in the corner. Browsers refuse audible autoplay without one
  click, which is why the entry gate exists.

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
| Mix | `public/audio/i-rave-you-mix.m4a` | AAC 256 kbps, encoded from the 24-bit FLAC master. |
| Font | `public/fonts/OffBit-Dot.woff2`, `OffBit-DotBold.woff2` | Optional, licensed copy of OffBit. Without it the site uses Doto (SIL OFL). |

## Unlisted pages

Arka Fashion Week '26 pitch pages: `afw26/acnd-7q4x2k/`, `afw26/apurba-9m1v8t/` and
`afw26/ash-army-3k8w5n/`. Nothing links to them and they are `noindex`. Share the URLs directly.
Their paths are set in `src/secret.ts`. Ash Army's page has no mix and shows `public/img/ash-army.jpg`
once that file exists.
