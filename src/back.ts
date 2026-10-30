import { depth, parentOf } from './history';
import { parse } from './router';

/**
 * A plain Back button on every page but the home page. It goes back through
 * this visit's own history, so the previous page reopens where it was left;
 * arriving from outside (a shared link, a search result), it climbs to the
 * page above instead: an article to the journal, a sub-page to its artist.
 */
export function mountBack(go: (path: string) => void): void {
  const b = document.createElement('button');
  b.type = 'button';
  b.className = 'back-btn';
  b.innerHTML = `<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square"/></svg><span>Back</span>`;
  b.addEventListener('click', () => (depth() > 0 ? history.back() : go(parentOf(location.pathname))));
  document.body.append(b);

  const sync = (): void => {
    const r = parse();
    b.hidden = !r.artist && !r.doc;
    b.setAttribute('aria-label', depth() > 0 ? 'Back to the previous page' : 'Up to the page above');
  };
  addEventListener('routechange', sync);
  sync();
}
