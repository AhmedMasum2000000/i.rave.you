import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import { SECRET_PATHS } from './src/secret';
import { mixAudioPlugin } from './scripts/mix-audio.mjs';

// Relative base so the build works on a GitHub Pages project path and on a
// custom domain alike.
export default defineConfig({
  base: './',
  plugins: [mixAudioPlugin()],
  build: {
    target: 'es2020',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        acndPitch: resolve(__dirname, `${SECRET_PATHS.acnd}/index.html`),
        apurbaPitch: resolve(__dirname, `${SECRET_PATHS.apurba}/index.html`),
        ashPitch: resolve(__dirname, `${SECRET_PATHS.ash}/index.html`),
        feature: resolve(__dirname, 'frequency-unity/index.html'),
      },
    },
  },
});
