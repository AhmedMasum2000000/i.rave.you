/**
 * Studio layer, scripted parts (styles in studio.css):
 *  - registration marks in the corners and a coordinate rail with a live Dhaka clock
 *  - a crosshair cursor on mouse devices
 *  - images resolve out of coarse pixels the first time they come into view
 *  - short mono labels decode (characters cycle, then settle) as they arrive
 *  - a scan-line wipe when the page changes
 * Everything is decoration: nothing here changes content, and all of it is skipped
 * with prefers-reduced-motion. It watches the DOM, so pages rendered later by the
 * router get the same treatment without being told.
 */
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
const root = document.documentElement;

/* ── corner marks + rail ── */
const hud = document.createElement('div');
hud.className = 'hud';
hud.setAttribute('aria-hidden', 'true');
hud.innerHTML = '<i class="hud-x tl"></i><i class="hud-x tr"></i><i class="hud-x bl"></i><i class="hud-x br"></i><span class="hud-rail"></span>';
document.body.append(hud);
const rail = hud.querySelector<HTMLElement>('.hud-rail')!;
const clock = (): void => {
  const t = new Date().toLocaleTimeString('en-GB', { timeZone: 'Asia/Dhaka', hour12: false });
  rail.innerHTML = `I Rave You <i>●</i> Dhaka 23.81°N 90.41°E <i>/</i> ${t} GMT+6`;
};
clock();
setInterval(clock, 1000);

/* ── crosshair cursor ── */
if (fine && !reduce) {
  root.classList.add('hud-cursor');
  const cur = document.createElement('div');
  cur.className = 'hud-cur';
  cur.setAttribute('aria-hidden', 'true');
  document.body.append(cur);
  let x = -100, y = -100, cx = x, cy = y;
  addEventListener('pointermove', (e) => { x = e.clientX; y = e.clientY; cur.classList.add('on'); }, { passive: true });
  document.addEventListener('pointerleave', () => cur.classList.remove('on'));
  document.addEventListener('pointerover', (e) => cur.classList.toggle('link', !!(e.target as Element).closest('a, button, [role="button"], summary, label')));
  const loop = (): void => {
    cx += (x - cx) * 0.35; cy += (y - cy) * 0.35;
    cur.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;
    requestAnimationFrame(loop);
  };
  loop();
}

/* ── images resolve out of pixels ── */
const pixelate = (img: HTMLImageElement): void => {
  const r = img.getBoundingClientRect();
  if (r.width < 120 || r.height < 80 || !img.naturalWidth) return;
  const parent = img.offsetParent as HTMLElement | null;
  if (!parent) return;
  const pr = parent.getBoundingClientRect();
  const c = document.createElement('canvas');
  c.className = 'px';
  c.width = Math.round(r.width);
  c.height = Math.round(r.height);
  Object.assign(c.style, { left: `${r.left - pr.left + parent.scrollLeft}px`, top: `${r.top - pr.top + parent.scrollTop}px`, width: `${r.width}px`, height: `${r.height}px` });
  const ctx = c.getContext('2d');
  if (!ctx) return;
  const fit = getComputedStyle(img).objectFit;
  // draw the image the way object-fit: cover would show it
  const iw = img.naturalWidth, ih = img.naturalHeight;
  let sx = 0, sy = 0, sw = iw, sh = ih;
  if (fit === 'cover') {
    const s = Math.max(c.width / iw, c.height / ih);
    sw = c.width / s; sh = c.height / s; sx = (iw - sw) / 2; sy = (ih - sh) / 2;
  }
  const steps = [40, 22, 12, 6, 3];
  const small = document.createElement('canvas');
  const sctx = small.getContext('2d')!;
  if (getComputedStyle(parent).position === 'static') parent.classList.add('px-wrap');
  parent.append(c);
  img.style.opacity = '0';
  let i = 0;
  const frame = (): void => {
    if (i >= steps.length) {
      img.style.opacity = '';
      c.remove();
      return;
    }
    const b = steps[i++];
    small.width = Math.max(1, Math.ceil(c.width / b));
    small.height = Math.max(1, Math.ceil(c.height / b));
    try {
      sctx.drawImage(img, sx, sy, sw, sh, 0, 0, small.width, small.height);
      ctx.imageSmoothingEnabled = false;
      ctx.clearRect(0, 0, c.width, c.height);
      ctx.drawImage(small, 0, 0, small.width, small.height, 0, 0, c.width, c.height);
    } catch {
      i = steps.length;
    }
    setTimeout(frame, 70);
  };
  frame();
};
const pxSeen = new WeakSet<Element>();
const pxIo = new IntersectionObserver((es) => es.forEach((e) => {
  if (!e.isIntersecting) return;
  pxIo.unobserve(e.target);
  const img = e.target as HTMLImageElement;
  const go = (): void => pixelate(img);
  if (img.complete) go(); else img.addEventListener('load', go, { once: true });
}), { threshold: 0.25 });
const wantPixels = (img: HTMLImageElement): boolean =>
  !pxSeen.has(img) && !img.closest('.fbar, .tid, .hud, .menu, .m-inner, nav, header, .logo, .side-logo, .a-mark, [data-no-px]') && !/logo|icon|favicon/i.test(img.currentSrc || img.src);

/* ── mono labels decode ── */
const GLYPHS = '+-_/\\|[]<>=*#%0123456789';
const decode = (el: HTMLElement): void => {
  const text = el.textContent ?? '';
  if (text.length < 3 || text.length > 48 || /[ঀ-৿]/.test(text)) return;
  el.classList.add('dec');
  const t0 = performance.now(), dur = 520 + text.length * 14;
  const step = (now: number): void => {
    const k = Math.min(1, (now - t0) / dur);
    const settled = Math.floor(text.length * k);
    let out = '';
    for (let i = 0; i < text.length; i++) out += i < settled || text[i] === ' ' ? text[i] : GLYPHS[(Math.random() * GLYPHS.length) | 0];
    el.textContent = out;
    if (k < 1) requestAnimationFrame(step); else el.textContent = text;
  };
  requestAnimationFrame(step);
};
const decSeen = new WeakSet<Element>();
const decIo = new IntersectionObserver((es) => es.forEach((e) => {
  if (!e.isIntersecting) return;
  decIo.unobserve(e.target);
  decode(e.target as HTMLElement);
}), { threshold: 0.6 });
// Only leaf labels (no child elements), so links and icons inside are never rewritten.
const wantDecode = (el: Element): boolean => !decSeen.has(el) && el.childElementCount === 0 && !el.closest('.fbar, .tid, .hud, [aria-live], button, a, input, label');

const scan = (): void => {
  if (reduce) return;
  let s = document.querySelector<HTMLElement>('.scan');
  if (!s) { s = document.createElement('div'); s.className = 'scan'; s.setAttribute('aria-hidden', 'true'); document.body.append(s); }
  s.classList.remove('go');
  void s.offsetWidth;
  s.classList.add('go');
};

let path = location.pathname;
let queued = false;
const sweep = (): void => {
  queued = false;
  if (location.pathname !== path) { path = location.pathname; scan(); }
  if (reduce) return;
  document.querySelectorAll<HTMLImageElement>('main img, #app img, .feed img, article img').forEach((img) => {
    if (!wantPixels(img)) return;
    pxSeen.add(img);
    pxIo.observe(img);
  });
  document.querySelectorAll<HTMLElement>('.k-label, .mono').forEach((el) => {
    if (!wantDecode(el)) return;
    decSeen.add(el);
    decIo.observe(el);
  });
};
new MutationObserver(() => { if (!queued) { queued = true; requestAnimationFrame(sweep); } }).observe(document.body, { childList: true, subtree: true });
addEventListener('popstate', () => requestAnimationFrame(sweep));
sweep();

export {};
