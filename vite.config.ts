import { readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import { SECRET_PATHS } from './src/secret';
import { mixAudioPlugin } from './scripts/mix-audio.mjs';
import { seoPlugin } from './scripts/seo.mjs';
import { ARTISTS, NEXT_RELEASE, TRACKLIST } from './src/data';

// Relative base so the build works on a GitHub Pages project path and on a
// custom domain alike.
export default defineConfig({
  base: './',
  // The pages learn which images exist, so a missing optional photo goes
  // straight to its fallback and WebP is offered wherever a version exists.
  define: { __IMAGES__: JSON.stringify(readdirSync(resolve(__dirname, 'public/img'))) },
  plugins: [mixAudioPlugin(), seoPlugin({ artists: ARTISTS, next: NEXT_RELEASE, tracks: TRACKLIST })],
  build: {
    target: 'es2020',
    // Every es2020 browser supports modulepreload natively.
    modulePreload: { polyfill: false },
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        terms: resolve(__dirname, 'legal/terms/index.html'),
        privacy: resolve(__dirname, 'legal/privacy/index.html'),
        copyright: resolve(__dirname, 'legal/copyright/index.html'),
        acndPitch: resolve(__dirname, `${SECRET_PATHS.acnd}/index.html`),
        apurbaPitch: resolve(__dirname, `${SECRET_PATHS.apurba}/index.html`),
        ashPitch: resolve(__dirname, `${SECRET_PATHS.ash}/index.html`),
        feature: resolve(__dirname, 'frequency-unity/index.html'),
      },
    },
  },
});
