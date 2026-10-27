import { sample, spectrum } from './audio';

/**
 * The home page: one canvas, two worlds.
 *
 * Black on the left (অপূর্ব, blue glow), white on the right (ACND, orange
 * glow), split by a living S-curve that is literally the spine of a yin-yang.
 * Everything drawn with `difference` compositing inverts itself as it crosses
 * the line, so each half always draws in the other's colour.
 */

export const BLUE = '#2f7bff';
export const ORANGE = '#ff6a1a';

interface P {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  glow: boolean;
  size: number;
}

export interface DualityHandle {
  /** -1 = hovering the black side, 1 = the white side, 0 = neither. */
  lean(side: number): void;
  /** Flood the screen from a point with one side's colour, then resolve. */
  flood(side: 'apurba' | 'acnd', x: number, y: number): Promise<void>;
  /** Which half of the emblem, if any, is at this screen point. */
  hit(x: number, y: number): 'apurba' | 'acnd' | null;
  /** Called when the pointer moves onto a half of the emblem or off it. */
  onPeek(fn: (side: 'apurba' | 'acnd' | null, at: { x: number; y: number; r: number; wide: boolean }) => void): void;
  /** Hold the emblem open on one side (touch: first tap peeks, second enters). */
  peek(side: 'apurba' | 'acnd' | null): void;
  destroy(): void;
}

const sprite = (color: string, r: number): HTMLCanvasElement => {
  const c = document.createElement('canvas');
  c.width = c.height = r * 2;
  const g = c.getContext('2d')!;
  const grd = g.createRadialGradient(r, r, 0, r, r, r);
  grd.addColorStop(0, color);
  grd.addColorStop(0.25, color + 'aa');
  grd.addColorStop(1, color + '00');
  g.fillStyle = grd;
  g.fillRect(0, 0, r * 2, r * 2);
  return c;
};

export function mountDuality(canvas: HTMLCanvasElement, reduced: boolean): DualityHandle {
  const g = canvas.getContext('2d')!;
  const blueGlow = sprite(BLUE, 64);
  const orangeGlow = sprite(ORANGE, 64);
  // Big soft halos for the emblem, drawn once instead of a per-frame shadowBlur.
  const blueHalo = sprite(BLUE, 160);
  const orangeHalo = sprite(ORANGE, 160);

  const compact = matchMedia('(pointer: coarse), (max-width: 760px)').matches;
  let lastFrame = 0;
  let W = 0;
  let H = 0;
  let dpr = 1;
  let split = 0.5;
  let splitTarget = 0.5;
  let mouseX = -1;
  let mouseY = -1;
  let raf = 0;
  let alive = true;
  let rot = 0;
  let floodState: { color: string; x: number; y: number; r: number; done: () => void } | null = null;
  const ps: P[] = [];
  /** Shockwaves that leave the emblem on each kick. */
  const waves: { r: number; a: number }[] = [];
  let lastWave = 0;
  /** Cursor parallax for the emblem, eased. */
  let tiltX = 0;
  let tiltY = 0;
  /** The emblem as last drawn, for hit-testing between frames. */
  const em = { x: 0, y: 0, r: 0 };
  let hover: 'apurba' | 'acnd' | null = null;
  let pinned: 'apurba' | 'acnd' | null = null;
  let hot = 0;
  let peekFn: Parameters<DualityHandle['onPeek']>[0] | null = null;
  const sideAt = (x: number, y: number): 'apurba' | 'acnd' | null => {
    if (!em.r || Math.hypot(x - em.x, y - em.y) > em.r * 1.3) return null;
    return (wide() ? x < em.x : y < em.y) ? 'apurba' : 'acnd';
  };
  /** Adaptive quality: shed particles and resolution if frames run long. */
  let quality = 1;
  let slowFrames = 0;
  let prevStamp = 0;

  const resize = (): void => {
    dpr = Math.min(window.devicePixelRatio || 1, compact ? 1 : 1.25) * (quality < 1 ? 0.8 : 1);
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width = `${W}px`;
    canvas.style.height = `${H}px`;
    const n = Math.round(Math.min(compact ? 80 : 300, (W * H) / (compact ? 5000 : 4000)) * quality);
    ps.length = 0;
    for (let i = 0; i < n; i++) ps.push(spawn(true));
    if (reduced && raf) requestAnimationFrame(frame);
  };

  const spawn = (anywhere: boolean): P => ({
    x: Math.random() * W,
    y: anywhere ? Math.random() * H : H + 10,
    vx: 0,
    vy: 0,
    life: Math.random() * 400 + 100,
    glow: Math.random() < 0.035,
    size: Math.random() < 0.1 ? 2 : 1,
  });

  /**
   * The S-curve: where black ends and white begins. Wide screens split
   * left/right (the curve runs top to bottom); phones stack the two sides,
   * so the curve turns and runs across the screen instead.
   */
  const wide = (): boolean => W >= 760 || W > H * 1.35;
  const curve = (u: number, span: number, base: number, t: number, amp: number): number => {
    const n = (u - span / 2) / (span / 2); // -1..1
    const s = Math.sin(n * Math.PI) * Math.min(W, H) * 0.09 * (1 + amp * 0.6);
    const ripple = Math.sin(n * 9 + t * 1.6) * 6 * amp + Math.sin(n * 23 - t * 3.1) * 2.5 * amp;
    return base + s + ripple;
  };
  const edge = (y: number, t: number, amp: number): number => curve(y, H, W * split, t, amp);
  const edgeH = (x: number, t: number, amp: number): number => curve(x, W, H * split, t, amp);
  const isDark = (x: number, y: number, t: number, amp: number): boolean =>
    wide() ? x < edge(y, t, amp) : y < edgeH(x, t, amp);
  /** Trace the seam, offset towards the dark (-) or light (+) side. */
  const seam = (t: number, amp: number, off: number): void => {
    // Always finish exactly on the far edge so no sliver is left unfilled.
    if (wide()) {
      for (let y = 0; y < H; y += 8) g.lineTo(edge(y, t, amp) + off, y);
      g.lineTo(edge(H, t, amp) + off, H);
    } else {
      for (let x = 0; x < W; x += 8) g.lineTo(x, edgeH(x, t, amp) + off);
      g.lineTo(W, edgeH(W, t, amp) + off);
    }
  };

  const onMove = (e: PointerEvent): void => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  };
  window.addEventListener('pointermove', onMove);
  window.addEventListener('resize', resize);
  resize();

  const frame = (now: number): void => {
    if (!alive) return;
    if (document.hidden || (!reduced && now - lastFrame < (compact ? 1000 / 30 : 1000 / 60))) {
      raf = requestAnimationFrame(frame);
      return;
    }
    lastFrame = now;
    // Long frames starve the audio thread on phones: degrade before that happens.
    if (!reduced && prevStamp && quality > 0.5) {
      const budget = compact ? 1000 / 24 : 1000 / 45;
      slowFrames = now - prevStamp > budget ? slowFrames + 1 : Math.max(0, slowFrames - 1);
      if (slowFrames > 15) {
        quality = Math.max(0.5, quality - 0.25);
        slowFrames = 0;
        resize();
      }
    }
    prevStamp = now;
    const t = reduced ? 0 : now / 1000;
    const lv = sample();
    // While the emblem is hovered it holds still, so it never slides out from under the pointer.
    split += ((hover ? 0.5 : splitTarget) - split) * 0.06;
    if (!reduced) rot += 0.0025 + lv.low * 0.01;

    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.globalCompositeOperation = 'source-over';

    // ── the two worlds ──
    g.fillStyle = '#f4f3ef';
    g.fillRect(0, 0, W, H);
    g.fillStyle = '#000';
    g.beginPath();
    g.moveTo(0, 0);
    seam(t, lv.low, 0);
    g.lineTo(wide() ? 0 : W, wide() ? H : 0);
    g.closePath();
    g.fill();

    // ── seam glow: blue bleeding into black, orange into white ──
    // Layered strokes fake a bloom for a fraction of shadowBlur's cost.
    const glowA = 0.55 + lv.beat * 0.45;
    for (const [w, a] of [[18, 0.06], [8, 0.16], [2, 1]] as const) {
      g.lineWidth = w * (1 + lv.beat * 0.5);
      g.globalAlpha = a * glowA;
      g.strokeStyle = BLUE;
      g.beginPath();
      seam(t, lv.low, -3 - (w > 2 ? w / 3 : 0));
      g.stroke();
      g.strokeStyle = ORANGE;
      g.beginPath();
      seam(t, lv.low, 3 + (w > 2 ? w / 3 : 0));
      g.stroke();
    }
    g.globalAlpha = 1;

    // ── particles: flow field, inverted per side by `difference` ──
    g.globalCompositeOperation = 'difference';
    g.fillStyle = '#f4f3ef';
    const speed = reduced ? 0 : 0.6 + lv.all * 3;
    for (const p of ps) {
      const a = Math.sin(p.x * 0.0031 + t * 0.3) * 2 + Math.cos(p.y * 0.0042 - t * 0.2) * 2;
      // Each side drifts its own way: the dark rises, the light falls.
      const dir = isDark(p.x, p.y, t, lv.low) ? -1 : 1;
      p.vx += Math.cos(a) * 0.05;
      p.vy += (Math.sin(a) * 0.05 + dir * 0.02) * 1;
      // The cursor is a gravity well.
      if (mouseX >= 0) {
        const dx = mouseX - p.x;
        const dy = mouseY - p.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < 40000) {
          const f = (1 - d2 / 40000) * 0.12;
          p.vx += dy * f * 0.01 + dx * f * 0.004;
          p.vy -= dx * f * 0.01 - dy * f * 0.004;
        }
      }
      p.vx *= 0.94;
      p.vy *= 0.94;
      p.x += p.vx * speed;
      p.y += p.vy * speed;
      if (!reduced) p.life--;
      if (p.life < 0 || p.x < -20 || p.x > W + 20 || p.y < -20 || p.y > H + 20) Object.assign(p, spawn(true));
      if (!p.glow) g.fillRect(p.x, p.y, p.size, p.size);
    }

    // Glow motes keep their colour: blue in the dark, orange in the light.
    g.globalCompositeOperation = 'source-over';
    for (const p of ps) {
      if (!p.glow) continue;
      const dark = isDark(p.x, p.y, t, lv.low);
      const s = 10 + lv.high * 40;
      g.globalAlpha = 0.35 + lv.beat * 0.4;
      g.drawImage(dark ? blueGlow : orangeGlow, p.x - s / 2, p.y - s / 2, s, s);
    }
    g.globalAlpha = 1;

    // ── the emblem: a rotating yin-yang sitting on the seam ──
    if (mouseX >= 0 && !reduced) {
      tiltX += ((mouseX / W - 0.5) * 18 - tiltX) * 0.05;
      tiltY += ((mouseY / H - 0.5) * 18 - tiltY) * 0.05;
    }
    const cx = (wide() ? edge(H / 2, t, lv.low) : W / 2) + tiltX;
    const cy = (wide() ? H / 2 : edgeH(W / 2, t, lv.low)) + tiltY;
    // Hovering the emblem wakes it: it swells and turns towards that world.
    const side = pinned ?? (mouseX >= 0 ? sideAt(mouseX, mouseY) : null);
    if (side !== hover) {
      hover = side;
      peekFn?.(side, { x: cx, y: cy, r: em.r || Math.min(W, H) * 0.13, wide: wide() });
    }
    hot += ((side ? 1 : 0) - hot) * 0.12;
    if (side && !reduced) rot += (side === 'apurba' ? -1 : 1) * 0.012 * hot;
    const R = (wide() ? Math.min(W, H) * 0.13 : W * 0.1) * (1 + lv.beat * 0.06 + hot * 0.1);
    em.x = cx;
    em.y = cy;
    em.r = R;

    // ── kick shockwaves, inverted per side ──
    if (!reduced && lv.beat > 0.75 && now - lastWave > 460 && waves.length < 3) {
      lastWave = now;
      waves.push({ r: R * 1.05, a: 0.55 * lv.beat });
    }
    g.globalCompositeOperation = 'difference';
    g.strokeStyle = '#f4f3ef';
    for (let i = waves.length - 1; i >= 0; i--) {
      const w = waves[i];
      w.r += 2.5 + w.r * 0.022;
      w.a *= 0.93;
      if (w.a < 0.02 || w.r > Math.max(W, H)) {
        waves.splice(i, 1);
        continue;
      }
      g.globalAlpha = w.a;
      g.lineWidth = 1 + w.a * 2;
      g.beginPath();
      g.arc(cx, cy, w.r, 0, Math.PI * 2);
      g.stroke();
    }
    g.globalAlpha = 1;
    g.globalCompositeOperation = 'source-over';

    // Halos: blue bleeds into the dark half, orange into the light.
    const hs = R * (3.2 + lv.beat * 0.9 + hot * 0.8);
    g.globalAlpha = Math.min(1, 0.5 + lv.beat * 0.35 + hot * 0.3);
    // Clip each halo to its own half along the live seam, so no colour crosses it.
    const darkPath = (): void => {
      g.beginPath();
      g.moveTo(0, 0);
      seam(t, lv.low, 0);
      g.lineTo(wide() ? 0 : W, wide() ? H : 0);
      g.closePath();
    };
    g.save();
    darkPath();
    g.clip();
    g.drawImage(blueHalo, cx - hs / 2, cy - hs / 2, hs, hs);
    g.restore();
    g.save();
    darkPath();
    g.rect(0, 0, W, H);
    g.clip('evenodd');
    g.globalCompositeOperation = 'multiply';
    g.drawImage(orangeHalo, cx - hs / 2, cy - hs / 2, hs, hs);
    g.restore();
    g.globalAlpha = 1;
    g.globalCompositeOperation = 'source-over';

    drawYinYang(g, cx, cy, R, rot, lv.beat, false);

    // ── HUD rings, spectrum halo, ticks — all inverted per side ──
    g.globalCompositeOperation = 'difference';
    g.strokeStyle = '#f4f3ef';
    g.fillStyle = '#f4f3ef';
    ring(g, cx, cy, R * 1.5, -rot * 0.6, 120, 3, 1);

    const spec = spectrum();
    const bars = compact ? 64 : 128;
    for (let i = 0; i < bars; i++) {
      const v = spec.length ? spec[Math.floor((i / bars) * spec.length * 0.6)] / 255 : 0.1 + 0.05 * Math.sin(t * 3 + i);
      const ang = (i / bars) * Math.PI * 2 + rot * 0.5;
      const r0 = R * 1.12;
      const r1 = r0 + 2 + v * R * 0.28;
      g.lineWidth = 1;
      g.beginPath();
      g.moveTo(cx + Math.cos(ang) * r0, cy + Math.sin(ang) * r0);
      g.lineTo(cx + Math.cos(ang) * r1, cy + Math.sin(ang) * r1);
      g.stroke();
    }

    g.globalCompositeOperation = 'source-over';

    // ── click flood ──
    if (floodState) {
      floodState.r += Math.max(W, H) * 0.06 + floodState.r * 0.08;
      g.fillStyle = floodState.color;
      g.beginPath();
      g.arc(floodState.x, floodState.y, floodState.r, 0, Math.PI * 2);
      g.fill();
      if (floodState.r > Math.hypot(W, H) * 1.1) {
        const done = floodState.done;
        floodState = null;
        done();
      }
    }

    if (!reduced) raf = requestAnimationFrame(frame);
  };
  raf = requestAnimationFrame(frame);

  return {
    lean(side) {
      splitTarget = 0.5 + side * 0.08;
    },
    flood(side, x, y) {
      if (reduced) return Promise.resolve();
      return new Promise((done) => {
        floodState = { color: side === 'apurba' ? '#000' : '#f4f3ef', x, y, r: 10, done };
      });
    },
    hit: sideAt,
    onPeek(fn) {
      peekFn = fn;
    },
    peek(side) {
      pinned = side;
      if (reduced) requestAnimationFrame(frame);
    },
    destroy() {
      alive = false;
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('resize', resize);
    },
  };
}

function ring(g: CanvasRenderingContext2D, cx: number, cy: number, r: number, rot: number, n: number, len: number, w: number): void {
  g.lineWidth = w;
  g.beginPath();
  for (let i = 0; i < n; i++) {
    const a = rot + (i / n) * Math.PI * 2;
    const l = i % 10 === 0 ? len * 2.5 : len;
    g.moveTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
    g.lineTo(cx + Math.cos(a) * (r + l), cy + Math.sin(a) * (r + l));
  }
  g.stroke();
}

/** Classic taijitu. Left/dark half carries a blue eye, light half an orange one. */
export function drawYinYang(g: CanvasRenderingContext2D, cx: number, cy: number, R: number, rot: number, beat: number, blur = true): void {
  g.save();
  g.translate(cx, cy);
  g.rotate(rot);
  const light = '#f4f3ef';
  const dark = '#000';

  g.shadowBlur = blur ? 40 + beat * 60 : 0;
  g.shadowColor = BLUE;
  g.fillStyle = dark;
  g.beginPath();
  g.arc(0, 0, R, Math.PI / 2, (Math.PI * 3) / 2);
  g.fill();
  g.shadowColor = ORANGE;
  g.fillStyle = light;
  g.beginPath();
  g.arc(0, 0, R, -Math.PI / 2, Math.PI / 2);
  g.fill();
  g.shadowBlur = 0;

  g.fillStyle = dark;
  g.beginPath();
  g.arc(0, -R / 2, R / 2, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = light;
  g.beginPath();
  g.arc(0, R / 2, R / 2, 0, Math.PI * 2);
  g.fill();

  // The eyes — each half holds a seed of the other, lit in its glow colour.
  const eye = R * (0.12 + beat * 0.03);
  g.shadowBlur = blur ? 20 + beat * 40 : 0;
  g.shadowColor = ORANGE;
  g.fillStyle = light;
  g.beginPath();
  g.arc(0, -R / 2, eye, 0, Math.PI * 2);
  g.fill();
  g.shadowColor = BLUE;
  g.fillStyle = dark;
  g.beginPath();
  g.arc(0, R / 2, eye, 0, Math.PI * 2);
  g.fill();
  g.shadowBlur = 0;

  g.lineWidth = 1.5;
  g.strokeStyle = BLUE;
  g.beginPath();
  g.arc(0, 0, R + 1, Math.PI / 2, (Math.PI * 3) / 2);
  g.stroke();
  g.strokeStyle = ORANGE;
  g.beginPath();
  g.arc(0, 0, R + 1, -Math.PI / 2, Math.PI / 2);
  g.stroke();
  g.restore();
}
