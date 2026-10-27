# I RAVE YOU

Two artists, one pulse: **অপূর্ব** (black · white · blue glow) and **ACND** (white · black · orange glow).

- **Home** — a live yin-yang: the screen splits along an S-curve that breathes with the mix, particles
  and HUD rings invert as they cross it, and clicking a side floods the screen into that artist's world.
- **Artist pages** — four routes per artist, after the ascension.pegassi.be structure on a grained black
  canvas: home (`#/acnd`: chrome mark over a lit doorway, annotated essay, tracklist, media, bio, footnotes),
  listen (`#/acnd/listen`), sequencer (`#/acnd/sequencer`) and about (`#/acnd/about`). Same for `#/apurba/…`.
- **Menu & pre-save** — a site-wide MENU overlay and a live “Down In Bossa” countdown with a PRE-SAVE button.
- **The mix** plays from the moment the visitor clicks the entry record, with no transport controls,
  and fades out (pausing in place) whenever the tab loses focus.
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
