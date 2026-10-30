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
  /** A static content page (journal, mix, legal…) shown inside the shell. */
  doc?: string;
}

/** Static pages that open inside the shell so the mix never stops. */
const DOC = /^(?:journal|mixes|radio|music|legal|frequency-unity|acnd\/press)\/(?:[^?#]*\/)?$/;

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
  if (DOC.test(pathname.slice(ROOT.length))) return { page: 'home', doc: pathname };
  const [artist, sub] = pathname.slice(ROOT.length).replace(/index\.html$/, '').split('/');
  if (artist !== 'acnd' && artist !== 'apurba') return { page: 'home' };
  const page = sub === 'listen' || sub === 'sequencer' || sub === 'about' ? sub : 'home';
  return { artist, page };
}

/** Links from before clean URLs (`#/acnd/listen`) still land on the right page. */
export function upgradeLegacyHash(): void {
  const m = /^#\/?(acnd|apurba)?(?:\/(listen|sequencer|about))?\/?$/.exec(location.hash);
  if (!m) return;
  history.replaceState(history.state, '', routeHref(m[1] as ArtistRoute | undefined, (m[2] as SubRoute) ?? 'home'));
}

/** Is this a same-site URL the interactive router can render without a reload? */
function routable(url: URL): boolean {
  if (url.origin !== location.origin || !url.pathname.startsWith(ROOT)) return false;
  const rest = url.pathname.slice(ROOT.length);
  return rest === '' || rest === 'index.html' || /^(acnd|apurba)\/((listen|sequencer|about)\/)?$/.test(rest) || DOC.test(rest);
}

/**
 * Take over clicks on site pages so the mix keeps playing between them;
 * external links, downloads and new tabs behave normally.
 */
export function interceptLinks(go: (path: string) => void, doc: Document = document): void {
  doc.addEventListener('click', (e) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    // Duck-typed: clicks inside the content frame come from another realm.
    const t = e.target as Element | null;
    const a = t && typeof t.closest === 'function' ? t.closest<HTMLAnchorElement>('a[href]') : null;
    if (!a || (a.target && a.target !== '_self') || a.hasAttribute('download')) return;
    const url = new URL(a.href, doc.location.href);
    if (!routable(url) || (url.hash && url.pathname === doc.location.pathname)) return;
    e.preventDefault();
    go(url.pathname + url.hash);
  });
}
