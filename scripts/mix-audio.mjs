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
  const decoded = names.map((name) => {
    const encrypted = readFileSync(resolve(dir, name));
    const decipher = createDecipheriv('aes-256-gcm', key, encrypted.subarray(0, 12));
    decipher.setAuthTag(encrypted.subarray(-16));
    return Buffer.concat([decipher.update(encrypted.subarray(12, -16)), decipher.final()]);
  });
  const init = decoded[0];
  // Supply native players with duration and a fragment index up front. Without
  // these, remote playback scans the entire 45-minute file before starting.
  const mvhd = init.indexOf(Buffer.from('mvhd'));
  const version = init[mvhd + 4];
  const movieScale = init.readUInt32BE(mvhd + (version === 1 ? 24 : 16));
  const patchDuration = (type, scale, offset0, offset1) => {
    const at = init.indexOf(Buffer.from(type));
    if (at < 0) throw new Error(`Missing MP4 ${type} header`);
    const v = init[at + 4];
    const value = Math.round(manifest.t * scale);
    if (v === 1) init.writeBigUInt64BE(BigInt(value), at + offset1);
    else init.writeUInt32BE(value, at + offset0);
  };
  patchDuration('mvhd', movieScale, 20, 28);
  patchDuration('tkhd', movieScale, 24, 32);
  const mdhd = init.indexOf(Buffer.from('mdhd'));
  const scale = init.readUInt32BE(mdhd + (init[mdhd + 4] === 1 ? 24 : 16));
  patchDuration('mdhd', scale, 20, 28);
  const tkhd = init.indexOf(Buffer.from('tkhd'));
  const trackId = init.readUInt32BE(tkhd + (init[tkhd + 4] === 1 ? 24 : 16));
  const fragments = decoded.slice(1);
  const starts = fragments.map((fragment) => {
    const at = fragment.indexOf(Buffer.from('tfdt'));
    return fragment[at + 4] === 1 ? Number(fragment.readBigUInt64BE(at + 8)) : fragment.readUInt32BE(at + 8);
  });
  const index = Buffer.alloc(32 + fragments.length * 12);
  index.writeUInt32BE(index.length, 0);
  index.write('sidx', 4);
  index.writeUInt32BE(trackId, 12);
  index.writeUInt32BE(scale, 16);
  index.writeUInt32BE(starts[0], 20);
  index.writeUInt16BE(fragments.length, 30);
  fragments.forEach((fragment, i) => {
    const at = 32 + i * 12;
    index.writeUInt32BE(fragment.length, at);
    index.writeUInt32BE((starts[i + 1] ?? Math.round(manifest.t * scale)) - starts[i], at + 4);
    index.writeUInt32BE(0x90000000, at + 8);
  });
  return Buffer.concat([init, index, ...fragments]);
}

export function mixAudioPlugin() {
  let root;
  let audio;
  const getAudio = () => (audio ??= continuousMix(root));
  return {
    name: 'continuous-mix-audio',
    configResolved(config) { root = config.root; },
    generateBundle() {
      this.emitFile({ type: 'asset', fileName: 'audio/qbic-pulse.mp4', source: getAudio() });
    },
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url?.split('?')[0] !== '/audio/qbic-pulse.mp4') return next();
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
