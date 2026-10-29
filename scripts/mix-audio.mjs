import { createDecipheriv, createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { loadSets } from './sets.mjs';

const FRAGMENT_SECONDS = 2;

const box = (type, ...parts) => {
  const body = Buffer.concat(parts);
  const head = Buffer.alloc(8);
  head.writeUInt32BE(body.length + 8, 0);
  head.write(type, 4, 'latin1');
  return Buffer.concat([head, body]);
};

/** Child boxes of a container: [{ type, at, size }] with `at` the box start. */
function children(buf, start, end) {
  const list = [];
  for (let at = start; at + 8 <= end;) {
    const size = buf.readUInt32BE(at);
    if (size < 8 || at + size > end) break;
    list.push({ type: buf.toString('latin1', at + 4, at + 8), at, size });
    at += size;
  }
  return list;
}

/**
 * Cut one movie fragment (moof + mdat, one audio track) into pieces of about
 * `target` timescale units. Every AAC frame is a sync sample, so any frame can
 * start a piece. Returns the fragment untouched if its layout is unexpected.
 */
function splitFragment(fragment, target, nextSequence) {
  const top = children(fragment, 0, fragment.length);
  const moof = top.find((b) => b.type === 'moof');
  const mdat = top.find((b) => b.type === 'mdat');
  const traf = moof && children(fragment, moof.at + 8, moof.at + moof.size).find((b) => b.type === 'traf');
  if (!moof || !mdat || !traf || top.length !== 2) return [fragment];
  const inner = children(fragment, traf.at + 8, traf.at + traf.size);
  const tfhd = inner.find((b) => b.type === 'tfhd');
  const tfdt = inner.find((b) => b.type === 'tfdt');
  const truns = inner.filter((b) => b.type === 'trun');
  if (!tfhd || !tfdt || truns.length !== 1 || inner.length !== 3) return [fragment];
  const tfFlags = fragment.readUInt32BE(tfhd.at + 8) & 0xffffff;
  // Only moof-relative data offsets (no explicit base offset) are rewritten.
  if (tfFlags & 0x1 || !(tfFlags & 0x20000)) return [fragment];
  let at = tfhd.at + 16;
  if (tfFlags & 0x2) at += 4;
  const defDuration = tfFlags & 0x8 ? fragment.readUInt32BE(at) : 0;
  if (tfFlags & 0x8) at += 4;
  const defSize = tfFlags & 0x10 ? fragment.readUInt32BE(at) : 0;
  const trun = truns[0];
  const flags = fragment.readUInt32BE(trun.at + 8) & 0xffffff;
  const count = fragment.readUInt32BE(trun.at + 12);
  // Per-sample composition offsets or a first-sample flag override: leave alone.
  if (!(flags & 0x1) || flags & 0x804) return [fragment];
  const dataOffset = fragment.readInt32BE(trun.at + 16);
  at = trun.at + 20;
  const samples = [];
  for (let k = 0; k < count; k++) {
    const s = { duration: defDuration, size: defSize, flags: 0 };
    if (flags & 0x100) { s.duration = fragment.readUInt32BE(at); at += 4; }
    if (flags & 0x200) { s.size = fragment.readUInt32BE(at); at += 4; }
    if (flags & 0x400) { s.flags = fragment.readUInt32BE(at); at += 4; }
    samples.push(s);
  }
  const total = samples.reduce((sum, s) => sum + s.duration, 0);
  const bytes = samples.reduce((sum, s) => sum + s.size, 0);
  if (!total || moof.at + dataOffset + bytes > fragment.length) return [fragment];
  const pieces = Math.max(1, Math.round(total / target));
  if (pieces === 1) return [fragment];
  const v1 = fragment[tfdt.at + 8] === 1;
  let base = v1 ? fragment.readBigUInt64BE(tfdt.at + 12) : BigInt(fragment.readUInt32BE(tfdt.at + 12));
  const tfhdBox = fragment.subarray(tfhd.at, tfhd.at + tfhd.size);
  const out = [];
  let first = 0;
  let data = moof.at + dataOffset;
  for (let p = 0; p < pieces; p++) {
    const last = Math.round(((p + 1) * count) / pieces);
    const part = samples.slice(first, last);
    first = last;
    const runHead = Buffer.alloc(12);
    runHead.writeUInt32BE(flags, 0);
    runHead.writeUInt32BE(part.length, 4);
    const fields = Buffer.alloc(part.length * 4 * [0x100, 0x200, 0x400].filter((f) => flags & f).length);
    let w = 0;
    for (const s of part) {
      if (flags & 0x100) { fields.writeUInt32BE(s.duration, w); w += 4; }
      if (flags & 0x200) { fields.writeUInt32BE(s.size, w); w += 4; }
      if (flags & 0x400) { fields.writeUInt32BE(s.flags, w); w += 4; }
    }
    const time = Buffer.alloc(12);
    time.writeUInt32BE(0x01000000, 0);
    time.writeBigUInt64BE(base, 4);
    const seq = Buffer.alloc(8);
    seq.writeUInt32BE(nextSequence(), 4);
    const build = () => box('moof', box('mfhd', seq), box('traf', tfhdBox, box('tfdt', time), box('trun', runHead, fields)));
    // The data offset counts from the moof's first byte to the first sample.
    runHead.writeInt32BE(build().length + 8, 8);
    const size = part.reduce((sum, s) => sum + s.size, 0);
    out.push(Buffer.concat([build(), box('mdat', fragment.subarray(data, data + size))]));
    data += size;
    base += BigInt(part.reduce((sum, s) => sum + s.duration, 0));
  }
  return out;
}

/** Authenticate and join a set's fragments at build time, not in the browser. */
function continuousMix(root, dir) {
  const source = readFileSync(resolve(root, 'src/stream-key.ts'), 'utf8');
  const parts = ['K1', 'K2'].map((name) => {
    const match = source.match(new RegExp(`export const ${name}\\s*=\\s*['"]([a-fA-F0-9]+)['"]`));
    if (!match) throw new Error(`Missing mix key component ${name}`);
    return Buffer.from(match[1], 'hex');
  });
  if (parts.some((part) => part.length !== 32)) throw new Error('Invalid mix key length');
  const key = Buffer.from(parts[0].map((byte, i) => byte ^ parts[1][i]));
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
  // ~2 s pieces: a jump only waits for the audio between a piece's start and
  // the spot it lands on, so smaller pieces make jumps land sooner.
  let sequence = 0;
  const fragments = decoded.slice(1).flatMap((fragment) => splitFragment(fragment, scale * FRAGMENT_SECONDS, () => ++sequence));
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

/**
 * Every set in sets/ is published under a name that carries its content hash, so
 * browsers may keep it for a year: a returning visitor plays from disk, not the
 * network. The pages learn the library (newest first) through __SETS__.
 */
export function mixAudioPlugin() {
  let root = process.cwd();
  let sets = [];
  const audio = new Map();
  const bytes = (set) => {
    if (!audio.has(set.slug)) audio.set(set.slug, continuousMix(root, set.audioDir));
    return audio.get(set.slug);
  };
  return {
    name: 'continuous-mix-audio',
    config(config) {
      root = resolve(config.root ?? process.cwd());
      sets = loadSets(root).map((set) => ({
        ...set,
        file: `audio/${set.audioName ?? set.slug}.${createHash('sha256').update(bytes(set)).digest('hex').slice(0, 10)}.m4a`,
      }));
      if (!sets.length) throw new Error('No sets found in sets/');
      const publicSets = sets.map(({ audioDir: _dir, audioName: _name, ...rest }) => rest);
      return { define: { __SETS__: JSON.stringify(publicSets) } };
    },
    generateBundle() {
      for (const set of sets) this.emitFile({ type: 'asset', fileName: set.file, source: bytes(set) });
    },
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const set = sets.find((s) => req.url?.split('?')[0] === `/${s.file}`);
        if (!set || (req.method !== 'GET' && req.method !== 'HEAD')) return next();
        const data = bytes(set);
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
