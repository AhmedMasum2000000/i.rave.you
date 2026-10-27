/**
 * Content protection: a deterrent, not a lock.
 *
 * A web page cannot stop an OS screenshot, a phone pointed at the screen or
 * a recording of the speaker output. What it can do is close every easy
 * route, and black the page out at the moments capture tools usually strike:
 *
 *  - no selecting, copying, cutting, right-click, long-press or dragging
 *  - save / view-source / print / select-all / devtools shortcuts swallowed
 *  - printing produces a blank page
 *  - the page blacks out while the tab or window is not focused (snipping
 *    tools and screen recorders take focus), on Print Screen and on the
 *    macOS screenshot chord (⌘⇧3/4/5), and the clipboard is wiped
 *  - other sites cannot frame the page
 */

const CURTAIN_MS = 1500;

const editable = (t: EventTarget | null): boolean =>
  t instanceof Element && !!t.closest('input, textarea, select, [contenteditable="true"]');

export function installGuard(): void {
  // Refuse to be framed by another origin.
  if (window.top !== window.self) {
    try {
      window.top!.location.href = window.location.href;
    } catch {
      document.documentElement.innerHTML = '';
      return;
    }
  }

  const root = document.documentElement;
  root.classList.add('guard');

  const curtain = document.createElement('div');
  curtain.className = 'guard-curtain';
  curtain.setAttribute('aria-hidden', 'true');
  curtain.innerHTML = '<span>I RAVE YOU</span><small>অপূর্ব ◐ ACND</small>';
  const mount = (): void => void document.body.append(curtain);
  if (document.body) mount();
  else document.addEventListener('DOMContentLoaded', mount, { once: true });

  let flashTimer = 0;
  const cover = (on: boolean): void => {
    root.classList.toggle('curtain', on);
  };
  const flash = (): void => {
    cover(true);
    clearTimeout(flashTimer);
    flashTimer = window.setTimeout(() => cover(!document.hasFocus() || document.hidden), CURTAIN_MS);
  };
  const wipeClipboard = (): void => {
    void navigator.clipboard?.writeText('').catch(() => undefined);
  };

  const block = (e: Event): void => {
    if (editable(e.target)) return;
    e.preventDefault();
    e.stopPropagation();
  };
  for (const type of ['contextmenu', 'selectstart', 'dragstart', 'cut']) {
    document.addEventListener(type, block, { capture: true });
  }
  document.addEventListener(
    'copy',
    (e) => {
      if (editable(e.target)) return;
      e.preventDefault();
      e.clipboardData?.setData('text/plain', '');
    },
    { capture: true },
  );

  window.addEventListener(
    'keydown',
    (e) => {
      const k = e.key.toLowerCase();
      const mod = e.ctrlKey || e.metaKey;
      const screenshotChord = e.metaKey && e.shiftKey && ['3', '4', '5', 's'].includes(k);
      if (k === 'printscreen' || screenshotChord) {
        flash();
        wipeClipboard();
      }
      const devtools =
        k === 'f12' ||
        (mod && e.shiftKey && ['i', 'j', 'c', 'k'].includes(k)) ||
        (e.metaKey && e.altKey && ['i', 'j', 'c', 'u'].includes(k));
      const saving = mod && ['s', 'u', 'p'].includes(k);
      const copying = mod && ['c', 'x', 'a'].includes(k) && !editable(e.target);
      if (devtools || saving || copying || screenshotChord) {
        e.preventDefault();
        e.stopPropagation();
      }
    },
    { capture: true },
  );
  window.addEventListener(
    'keyup',
    (e) => {
      if (e.key === 'PrintScreen') {
        flash();
        wipeClipboard();
      }
    },
    { capture: true },
  );

  // Black out whenever the page is not the thing in focus.
  const sync = (): void => cover(document.hidden || !document.hasFocus());
  window.addEventListener('blur', () => cover(true));
  window.addEventListener('focus', () => window.setTimeout(sync, 120));
  document.addEventListener('visibilitychange', sync);
  window.addEventListener('beforeprint', () => cover(true));
  window.addEventListener('afterprint', sync);
}
