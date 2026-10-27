import { audioCtx, duck } from './audio';

/**
 * A 16-step drum machine, after the sequencer on the reference site. Every
 * voice is synthesised on the spot — no samples ship. While it runs, the mix
 * ducks underneath it.
 */

const ROWS = ['Kick', 'Clap', 'Hat', 'Bass', 'Pluck 01', 'Pluck 02', 'Pad'] as const;
const STEPS = 16;

type Grid = boolean[][];

const parse = (rows: string[]): Grid => rows.map((r) => [...r].map((c) => c === 'x'));

const PATTERNS: Record<string, string[][]> = {
  acnd: [
    ['x...x...x...x...', '....x.......x...', '..x...x...x...x.', 'x..x..x...x..x..', 'x.......x.....x.', '....x.....x.....', 'x...............'],
    ['x...x...x...x...', '....x..x....x...', 'xxxxxxxxxxxxxxxx', '..x...x...x...xx', '..x.x...x...x.x.', 'x.........x.....', 'x.......x.......'],
    ['x..x..x...x.x...', '....x.......x..x', '..x...x...x...x.', 'xx..xx..xx..xx..', 'x...x...x..x....', '...x...x...x...x', 'x...............'],
    ['x...x...x...x...', '................', '..x.x.x...x.x.x.', '...x...x...x...x', 'x.x.x.x.x.x.x.x.', '................', 'x...........x...'],
  ],
  apurba: [
    ['x...x...x...x...', '....x.......x...', '..x...x...x...x.', '.xxx.xxx.xxx.xxx', '..x.....x.....x.', '......x.......x.', 'x...............'],
    ['x...x...x...x...', '....x.......x...', 'x.xxx.xxx.xxx.xx', '.x.x.x.x.x.x.x.x', 'x..x..x..x..x...', '..x.....x.....x.', 'x.......x.......'],
    ['x..x....x..x....', '....x.......x...', '..x...x...x...x.', '.xx..xx..xx..xx.', '....x.......x...', 'x.....x.....x...', 'x...............'],
    ['x...x...x...x..x', '....x...x...x...', 'xx.xxx.xxx.xxx.x', '.xxx.xxx.xxx.xxx', 'x.x...x.x...x.x.', '...x.......x....', 'x.......x.......'],
  ],
};

const SCALES: Record<string, number[]> = {
  // A minor for ACND, D phrygian for অপূর্ব — light and dark.
  acnd: [57, 60, 64, 67, 69, 72, 76],
  apurba: [50, 51, 55, 57, 58, 62, 63],
};

const hz = (m: number): number => 440 * 2 ** ((m - 69) / 12);

export function mountSequencer(root: HTMLElement, artist: 'acnd' | 'apurba', bpm: number): () => void {
  let ctx: AudioContext | null = null;
  let out: GainNode | null = null;
  let noise: AudioBuffer | null = null;
  let grid: Grid = parse(PATTERNS[artist][0]);
  let pattern = 0;
  let playing = false;
  let step = 0;
  let nextTime = 0;
  let timer = 0;
  let follow = true;
  let tempo = bpm;
  let clipboard: Grid | null = null;

  const fromUrl = new URLSearchParams(location.search).get('seq');
  if (fromUrl && fromUrl.length === ROWS.length * 4) {
    grid = ROWS.map((_, r) => {
      const bits = parseInt(fromUrl.slice(r * 4, r * 4 + 4), 16);
      return Array.from({ length: STEPS }, (_, s) => Boolean(bits & (1 << s)));
    });
  }

  root.innerHTML = `
    <div class="seq-controls">
      <button data-a="play">▶ Play</button>
      <button data-a="clear">Clear all</button>
      <button data-a="copy">Copy</button>
      <button data-a="paste" disabled>Paste</button>
      <button data-a="rand">Chaos</button>
      <label class="seq-bpm">BPM <input type="number" min="80" max="180" value="${tempo}" /></label>
      <button data-a="follow" class="on">✓ Follow</button>
      ${[0, 1, 2, 3].map((i) => `<button data-p="${i}" class="${i === 0 ? 'on' : ''}">Pattern 0${i + 1}</button>`).join('')}
    </div>
    <div class="seq-grid" role="grid" aria-label="16 step sequencer">
      <div class="seq-head"><span></span>${Array.from({ length: STEPS }, (_, i) => `<span>${String(i + 1).padStart(2, '0')}</span>`).join('')}</div>
      ${ROWS.map(
        (r, ri) =>
          `<div class="seq-row"><span class="seq-label">${r}</span>${Array.from(
            { length: STEPS },
            (_, s) => `<button class="cell" data-r="${ri}" data-s="${s}" aria-label="${r} step ${s + 1}"></button>`,
          ).join('')}</div>`,
      ).join('')}
    </div>
    <button class="seq-share" data-a="share">Share sequence ↗</button>`;

  const cells = [...root.querySelectorAll<HTMLButtonElement>('.cell')];
  const paint = (): void => {
    for (const c of cells) {
      const on = grid[+c.dataset.r!][+c.dataset.s!];
      c.classList.toggle('on', on);
      c.setAttribute('aria-pressed', String(on));
    }
  };
  paint();

  const ensure = (): AudioContext => {
    if (ctx) return ctx;
    ctx = audioCtx() ?? new AudioContext();
    out = ctx.createGain();
    out.gain.value = 0.55;
    const comp = ctx.createDynamicsCompressor();
    out.connect(comp).connect(ctx.destination);
    noise = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const d = noise.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    return ctx;
  };

  const env = (g: GainNode, t: number, a: number, peak: number, d: number): void => {
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(peak, t + a);
    g.gain.exponentialRampToValueAtTime(0.0001, t + a + d);
  };

  const voice = (row: number, t: number): void => {
    const c = ctx!;
    const scale = SCALES[artist];
    const g = c.createGain();
    g.connect(out!);
    if (row === 0) {
      const o = c.createOscillator();
      o.frequency.setValueAtTime(150, t);
      o.frequency.exponentialRampToValueAtTime(42, t + 0.12);
      env(g, t, 0.002, 1, 0.32);
      o.connect(g);
      o.start(t);
      o.stop(t + 0.4);
    } else if (row === 1 || row === 2) {
      const s = c.createBufferSource();
      s.buffer = noise;
      const f = c.createBiquadFilter();
      f.type = row === 1 ? 'bandpass' : 'highpass';
      f.frequency.value = row === 1 ? 1400 : 8000;
      s.connect(f).connect(g);
      env(g, t, 0.001, row === 1 ? 0.6 : 0.25, row === 1 ? 0.16 : 0.04);
      s.start(t);
      s.stop(t + 0.25);
    } else {
      const o = c.createOscillator();
      const f = c.createBiquadFilter();
      f.type = 'lowpass';
      if (row === 3) {
        o.type = 'sawtooth';
        o.frequency.value = hz(scale[step % 3 === 0 ? 0 : 2] - 24);
        f.frequency.setValueAtTime(1800, t);
        f.frequency.exponentialRampToValueAtTime(140, t + 0.18);
        env(g, t, 0.003, 0.45, 0.2);
      } else if (row === 6) {
        o.type = 'triangle';
        o.frequency.value = hz(scale[(step >> 2) % scale.length]);
        f.frequency.value = 1200;
        env(g, t, 0.15, 0.18, 1.1);
      } else {
        o.type = 'square';
        o.frequency.value = hz(scale[(step * (row === 4 ? 3 : 5)) % scale.length] + 12);
        f.frequency.setValueAtTime(4000, t);
        f.frequency.exponentialRampToValueAtTime(400, t + 0.12);
        env(g, t, 0.002, 0.16, 0.16);
      }
      o.connect(f).connect(g);
      o.start(t);
      o.stop(t + 1.4);
    }
  };

  const tick = (): void => {
    const c = ctx!;
    while (nextTime < c.currentTime + 0.12) {
      grid.forEach((row, r) => row[step] && voice(r, nextTime));
      const shown = step;
      const delay = Math.max(0, (nextTime - c.currentTime) * 1000);
      setTimeout(() => {
        cells.forEach((cl) => cl.classList.toggle('now', +cl.dataset.s! === shown));
        if (follow) root.querySelector('.seq-grid')?.setAttribute('data-step', String(shown));
      }, delay);
      nextTime += 60 / tempo / 4;
      step = (step + 1) % STEPS;
    }
  };

  const setPlaying = (on: boolean): void => {
    playing = on;
    const btn = root.querySelector<HTMLButtonElement>('[data-a="play"]')!;
    btn.textContent = on ? '■ Stop' : '▶ Play';
    duck(on);
    if (on) {
      const c = ensure();
      void c.resume();
      step = 0;
      nextTime = c.currentTime + 0.05;
      timer = window.setInterval(tick, 25);
    } else {
      clearInterval(timer);
      cells.forEach((cl) => cl.classList.remove('now'));
    }
  };

  const onClick = (e: Event): void => {
    const el = (e.target as HTMLElement).closest('button');
    if (!el) return;
    if (el.classList.contains('cell')) {
      const r = +el.dataset.r!;
      const s = +el.dataset.s!;
      grid[r][s] = !grid[r][s];
      paint();
      if (!playing) {
        ensure();
        void ctx!.resume();
        voice(r, ctx!.currentTime);
      }
      return;
    }
    if (el.dataset.p) {
      pattern = +el.dataset.p;
      grid = parse(PATTERNS[artist][pattern]);
      root.querySelectorAll('[data-p]').forEach((b) => b.classList.toggle('on', b === el));
      paint();
      return;
    }
    switch (el.dataset.a) {
      case 'play':
        setPlaying(!playing);
        break;
      case 'clear':
        grid = grid.map((r) => r.map(() => false));
        paint();
        break;
      case 'copy':
        clipboard = grid.map((r) => [...r]);
        root.querySelector<HTMLButtonElement>('[data-a="paste"]')!.disabled = false;
        break;
      case 'paste':
        if (clipboard) grid = clipboard.map((r) => [...r]);
        paint();
        break;
      case 'rand':
        grid = grid.map((r, ri) => r.map((_, s) => Math.random() < (ri === 0 ? (s % 4 === 0 ? 1 : 0.05) : 0.18)));
        paint();
        break;
      case 'follow':
        follow = !follow;
        el.classList.toggle('on', follow);
        el.textContent = `${follow ? '✓ ' : ''}Follow`;
        break;
      case 'share': {
        const code = grid.map((r) => r.reduce((n, on, s) => n | (on ? 1 << s : 0), 0).toString(16).padStart(4, '0')).join('');
        const url = `${location.origin}${location.pathname}?seq=${code}${location.hash}`;
        void navigator.clipboard?.writeText(url).then(
          () => (el.textContent = 'Link copied ✓'),
          () => (el.textContent = url),
        );
        setTimeout(() => (el.textContent = 'Share sequence ↗'), 2500);
        break;
      }
    }
  };
  root.addEventListener('click', onClick);
  const bpmInput = root.querySelector<HTMLInputElement>('.seq-bpm input')!;
  bpmInput.addEventListener('change', () => (tempo = Math.min(180, Math.max(80, +bpmInput.value || bpm))));

  return () => {
    if (playing) setPlaying(false);
    root.removeEventListener('click', onClick);
  };
}
