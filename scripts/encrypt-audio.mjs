// Turns a fragmented MP4 (AAC) into AES-GCM-encrypted segments for streaming.
//
//   ffmpeg -i set.m4a -c copy -f mp4 \
//     -movflags +frag_keyframe+empty_moov+default_base_moof -frag_duration 10000000 frag.mp4
//   STREAM_KEY=<64 hex chars> node scripts/encrypt-audio.mjs frag.mp4 public/audio/x
//
// Writes i.bin (init segment), 0.bin … N.bin (one per fragment) and m.json
// (start times). Every file is [12-byte IV][ciphertext][16-byte GCM tag], the
// layout WebCrypto's AES-GCM decrypt expects after the IV is split off.
// The key ships in the site bundle, so this stops casual downloading, not a
// determined reverse-engineer.

import { createCipheriv, randomBytes } from 'node:crypto';
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const [src, outDir] = process.argv.slice(2);
const key = Buffer.from(process.env.STREAM_KEY ?? '', 'hex');
if (!src || !outDir || key.length !== 32) {
  console.error('usage: STREAM_KEY=<64 hex> node scripts/encrypt-audio.mjs <frag.mp4> <outDir>');
  process.exit(1);
}

const buf = readFileSync(src);

/** Top-level MP4 boxes: [type, start, end]. */
const boxes = [];
for (let p = 0; p < buf.length; ) {
  let size = buf.readUInt32BE(p);
  const type = buf.toString('latin1', p + 4, p + 8);
  if (size === 1) size = Number(buf.readBigUInt64BE(p + 8));
  if (size === 0) size = buf.length - p;
  boxes.push([type, p, p + size]);
  p += size;
}

const find = (b, fourcc, from = 0) => b.indexOf(Buffer.from(fourcc, 'latin1'), from);

const moov = boxes.find(([t]) => t === 'moov');
const ftyp = boxes.find(([t]) => t === 'ftyp');
const init = buf.subarray(ftyp[1], moov[2]);

// Timescale from mdhd (version 0: 32-bit times, version 1: 64-bit).
const mdhd = find(init, 'mdhd');
const v = init[mdhd + 4];
const timescale = init.readUInt32BE(mdhd + 8 + (v === 1 ? 16 : 8));

// Each moof + following mdat is one fragment; its start comes from tfdt.
const frags = [];
for (let i = 0; i < boxes.length; i++) {
  if (boxes[i][0] !== 'moof') continue;
  const mdat = boxes[i + 1];
  const frag = buf.subarray(boxes[i][1], mdat[2]);
  const tfdt = find(frag, 'tfdt');
  const tv = frag[tfdt + 4];
  const base = tv === 1 ? Number(frag.readBigUInt64BE(tfdt + 8)) : frag.readUInt32BE(tfdt + 8);
  frags.push({ frag, start: base / timescale });
}

const seal = (plain) => {
  const iv = randomBytes(12);
  const c = createCipheriv('aes-256-gcm', key, iv);
  return Buffer.concat([iv, c.update(plain), c.final(), c.getAuthTag()]);
};

rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, 'i.bin'), seal(init));
frags.forEach(({ frag }, i) => writeFileSync(join(outDir, `${i}.bin`), seal(frag)));

const total = Number(process.env.STREAM_DURATION ?? 0) || frags.at(-1).start + 10;
writeFileSync(
  join(outDir, 'm.json'),
  JSON.stringify({ c: 'audio/mp4; codecs="mp4a.40.2"', t: Math.round(total * 1000) / 1000, s: frags.map((f) => Math.round(f.start * 1000) / 1000) }),
);
console.log(`timescale ${timescale}, ${frags.length} fragments, init ${init.length} B, total ${total}s`);
