/**
 * Content protection: a deterrent, not a lock.
 *
 * A web page cannot stop an OS screenshot, a phone pointed at the screen or
 * a recording of the speaker output. What it can do is close every easy
 * route, and black the page out at the moments capture tools usually strike:
 *
 *  - no dragging or saving images; no selecting, copying or long-press menu
 *    on the interface (buttons, the hero, the player)
 *  - reading text (paragraphs, headings, lists, the articles) stays
 *    selectable, with its context menu, so select-to-speak, Look Up and
 *    translate-selection work; copying it out is still swallowed
 *  - save / view-source / print / devtools shortcuts swallowed
 *  - printing produces a blank page
 *  - the page blacks out while it is hidden (tab switched, window minimised,
 *    screen off), on Print Screen and on the macOS screenshot chord
 *    (⌘⇧3/4/5), and the clipboard is wiped. Losing focus alone (find in page,
 *    the address bar, an extension popup) never covers it.
 *  - other sites cannot frame the page
 *  - the same blockers on the journal, music and mix pages the shell shows in
 *    its frame (guardDocument); opened directly, those pages run no script and
 *    get the CSS half of this (public/seo.css)
 */

const CURTAIN_MS = 1500;

// Duck-typed: an element from the content frame is not an `Element` of this window.
const editable = (t: EventTarget | null): boolean =>
  !!(t as Element | null)?.closest?.('input, textarea, select, [contenteditable="true"]');

/**
 * Text people read, which assistive tools must be able to select: prose in the
 * artist pages, articles and discovery pages. Kept in step with the
 * `user-select: text` rules in src/style.css and public/seo.css.
 */
export const READING =
  'p, h1, h2, h3, h4, li, dt, dd, blockquote, figcaption, td, th, article';
/** Interface, never selectable even where it holds a paragraph or a list. */
const CHROME = 'button, [role="button"], nav, .fbar, .home, .gate';
const readable = (t: EventTarget | null): boolean => {
  const el = (t as Node | null)?.nodeType === 3 ? (t as Node).parentElement : (t as Element | null);
  return !!el?.closest?.(READING) && !el.closest?.(CHROME);
};

/** What the shell does when a capture shortcut is pressed (black out, wipe the clipboard). */
let onCapture = (): void => {};

/** The copy, save and capture-shortcut blockers, on one document: the shell's, or a page in its frame. */
export function guardDocument(doc: Document): void {
  const win = doc.defaultView;
  if (!win) return;
  const block = (e: Event): void => {
    if (editable(e.target)) return;
    // Selecting reading text, and its context menu, stay with the visitor.
    if ((e.type === 'selectstart' || e.type === 'contextmenu') && readable(e.target)) return;
    e.preventDefault();
    e.stopPropagation();
  };
  for (const type of ['contextmenu', 'selectstart', 'dragstart', 'cut']) {
    doc.addEventListener(type, block, { capture: true });
  }
  doc.addEventListener(
    'copy',
    (e) => {
      if (editable(e.target)) return;
      e.preventDefault();
      e.clipboardData?.setData('text/plain', '');
    },
    { capture: true },
  );
  win.addEventListener(
    'keydown',
    (e) => {
      const k = e.key.toLowerCase();
      const mod = e.ctrlKey || e.metaKey;
      const screenshotChord = e.metaKey && e.shiftKey && ['3', '4', '5', 's'].includes(k);
      if (k === 'printscreen' || screenshotChord) onCapture();
      const devtools =
        k === 'f12' ||
        (mod && e.shiftKey && ['i', 'j', 'c', 'k'].includes(k)) ||
        (e.metaKey && e.altKey && ['i', 'j', 'c', 'u'].includes(k));
      const saving = mod && ['s', 'u', 'p'].includes(k);
      // Select-all is left alone: it is how keyboard users hand text to a reader.
      const copying = mod && ['c', 'x'].includes(k) && !editable(e.target);
      if (devtools || saving || copying || screenshotChord) {
        e.preventDefault();
        e.stopPropagation();
      }
    },
    { capture: true },
  );
  win.addEventListener(
    'keyup',
    (e) => {
      if (e.key === 'PrintScreen') onCapture();
    },
    { capture: true },
  );
}

/** True inside this site's own shell (a content page opened from the site). */
export function inShell(): boolean {
  if (window.top === window.self) return false;
  try {
    return window.top!.location.origin === window.location.origin;
  } catch {
    return false;
  }
}

export function installGuard(): void {
  // The shell guards itself; a page shown inside it needs nothing extra.
  if (inShell()) return;
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
    flashTimer = window.setTimeout(() => cover(document.hidden), CURTAIN_MS);
  };
  const wipeClipboard = (): void => {
    void navigator.clipboard?.writeText('').catch(() => undefined);
  };

  onCapture = (): void => {
    flash();
    wipeClipboard();
  };
  guardDocument(document);

  // Black out only while the page is hidden. A visible page that merely lost
  // focus (find in page, an assistive extension's popup) stays readable.
  const sync = (): void => cover(document.hidden);
  document.addEventListener('visibilitychange', sync);
  window.addEventListener('beforeprint', () => cover(true));
  window.addEventListener('afterprint', sync);
}
