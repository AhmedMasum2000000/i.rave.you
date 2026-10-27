import { createDecipheriv } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

/** Authenticate and join the existing fragments at build time, not in the browser. */
function continuousMix(root) {
  const source = readFileSync(resolve(root, 'src/stream-key.ts'), 'utf8');
  const parts = ['K1', 'K2'].map((name) => {
    const match = source.match(new RegExp(`export const ${name}\\s*=\\s*['"]([a-fA-F0-9]+)['"]`));
    if (!match) throw new Error(`Missing mix key component ${name}`);
    return Buffer.from(match[1], 'hex');
  });
  if (parts.some((part) => part.length !== 32)) throw new Error('Invalid mix key length');
  const key = Buffer.from(parts[0].map((byte, i) => byte ^ parts[1][i]));
  const dir = resolve(root, 'public/audio/x');
  const manifest = JSON.parse(readFileSync(resolve(dir, 'm.json'), 'utf8'));
  const names = ['i.bin', ...manifest.s.map((_, i) => `${i}.bin`)];
  return Buffer.concat(names.map((name) => {
    const encrypted = readFileSync(resolve(dir, name));
    const decipher = createDecipheriv('aes-256-gcm', key, encrypted.subarray(0, 12));
    decipher.setAuthTag(encrypted.subarray(-16));
    return Buffer.concat([decipher.update(encrypted.subarray(12, -16)), decipher.final()]);
  }));
}

export function mixAudioPlugin() {
  let root;
  let audio;
  const getAudio = () => (audio ??= continuousMix(root));
  return {
    name: 'continuous-mix-audio',
    configResolved(config) { root = config.root; },
    generateBundle() {
      this.emitFile({ type: 'asset', fileName: 'audio/qbic-pulse.m4a', source: getAudio() });
    },
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url?.split('?')[0] !== '/audio/qbic-pulse.m4a') return next();
        if (req.method !== 'GET' && req.method !== 'HEAD') return next();
        const data = getAudio();
        let start = 0;
        let end = data.length - 1;
        res.setHeader('Content-Type', 'audio/mp4');
        res.setHeader('Accept-Ranges', 'bytes');
        if (req.headers.range) {
          const range = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range);
          if (range) {
            if (!range[1]) start = Math.max(0, data.length - Number(range[2]));
            else { start = Number(range[1]); if (range[2]) end = Math.min(end, Number(range[2])); }
          }
          if (!range || start > end || start >= data.length) {
            res.writeHead(416, { 'Content-Range': `bytes */${data.length}` });
            res.end(); return;
          }
          res.statusCode = 206;
          res.setHeader('Content-Range', `bytes ${start}-${end}/${data.length}`);
        }
        res.setHeader('Content-Length', end - start + 1);
        res.end(req.method === 'HEAD' ? undefined : data.subarray(start, end + 1));
      });
    },
  };
}
