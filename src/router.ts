/**
 * Clean URLs for the interactive site: `/`, `/acnd/`, `/acnd/listen/`,
 * `/apurba/about/`… Every route also exists as a real HTML file in the build,
 * so a refresh or a shared link works on any static host without rewrites.
 *
 * The site may live below a sub-path (a GitHub Pages project), so the root is
 * derived from the current URL by stripping the route part.
 */

export type ArtistRoute = 'acnd' | 'apurba';
export type SubRoute = 'home' | 'listen' | 'sequencer' | 'about';
export interface Route {
  artist?: ArtistRoute;
  page: SubRoute;
}

const ROUTE = /(?:^|\/)(acnd|apurba)\/(?:(listen|sequencer|about)\/?)?(?:index\.html)?$|(?:^|\/)(acnd|apurba)$/;

function rootOf(pathname: string): string {
  const m = ROUTE.exec(pathname);
  if (!m) return pathname.replace(/[^/]*$/, '');
  return pathname.slice(0, m.index + (pathname[m.index] === '/' ? 1 : 0));
}

/** Absolute path of the site root, e.g. `/` or `/i.rave.you/`. */
export const ROOT = rootOf(location.pathname);

/** Root-relative link for a route or a static page path (`journal/`, `legal/terms/`). */
export const link = (path = ''): string => ROOT + path.replace(/^\//, '');

export const routeHref = (artist?: ArtistRoute, page: SubRoute = 'home'): string =>
  link(artist ? (page === 'home' ? `${artist}/` : `${artist}/${page}/`) : '');

export function parse(pathname = location.pathname): Route {
  if (!pathname.startsWith(ROOT)) return { page: 'home' };
  const [artist, sub] = pathname.slice(ROOT.length).replace(/index\.html$/, '').split('/');
  if (artist !== 'acnd' && artist !== 'apurba') return { page: 'home' };
  const page = sub === 'listen' || sub === 'sequencer' || sub === 'about' ? sub : 'home';
  return { artist, page };
}

/** Links from before clean URLs (`#/acnd/listen`) still land on the right page. */
export function upgradeLegacyHash(): void {
  const m = /^#\/?(acnd|apurba)?(?:\/(listen|sequencer|about))?\/?$/.exec(location.hash);
  if (!m) return;
  history.replaceState(null, '', routeHref(m[1] as ArtistRoute | undefined, (m[2] as SubRoute) ?? 'home'));
}

/** Is this a same-site URL the interactive router can render without a reload? */
function routable(url: URL): boolean {
  if (url.origin !== location.origin || !url.pathname.startsWith(ROOT)) return false;
  const rest = url.pathname.slice(ROOT.length);
  return rest === '' || rest === 'index.html' || /^(acnd|apurba)\/((listen|sequencer|about)\/)?$/.test(rest);
}

/**
 * Take over clicks on interactive routes so the mix keeps playing between
 * pages; everything else (journal, legal, press, new tabs) navigates normally.
 */
export function interceptLinks(go: (path: string) => void): void {
  document.addEventListener('click', (e) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const a = e.target instanceof Element ? e.target.closest<HTMLAnchorElement>('a[href]') : null;
    if (!a || (a.target && a.target !== '_self') || a.hasAttribute('download')) return;
    const url = new URL(a.href, location.href);
    if (!routable(url) || url.hash) return;
    e.preventDefault();
    go(url.pathname);
  });
}
