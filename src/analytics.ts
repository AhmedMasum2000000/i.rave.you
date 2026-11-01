import { GA4_MEASUREMENT_ID } from './site.config';

/**
 * Google Analytics 4, loaded only when a Measurement ID is configured
 * (src/site.config.ts). Measures what the site is for: page views, visits to
 * the artist and release pages, plays of the radio set, and clicks out to
 * music platforms. No advertising features: ad storage and personalisation
 * are always denied, and visitors in the EEA, the UK and Switzerland are
 * measured without analytics cookies (Consent Mode). The privacy notice
 * describes exactly this.
 *
 * Inside the site's own content frame a page stays silent: the shell around
 * it reports the page view, so nothing is counted twice.
 */

type Params = Record<string, string | number | undefined>;
type Gtag = (...args: unknown[]) => void;
declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: Gtag;
  }
}

const NO_COOKIES = ['AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE', 'IS', 'LI', 'NO', 'GB', 'CH'];

export const analyticsOn = (): boolean => GA4_MEASUREMENT_ID !== '' && window.top === window;

let loaded = false;
function load(): void {
  if (loaded) return;
  loaded = true;
  window.dataLayer = window.dataLayer ?? [];
  // gtag queues its arguments object, exactly as Google's snippet does.
  window.gtag = function gtag() {
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer!.push(arguments);
  };
  const g = window.gtag;
  g('consent', 'default', { ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied', analytics_storage: 'granted' });
  g('consent', 'default', { analytics_storage: 'denied', region: NO_COOKIES });
  g('js', new Date());
  g('config', GA4_MEASUREMENT_ID, { send_page_view: false, allow_google_signals: false, allow_ad_personalization_signals: false });
  const s = document.createElement('script');
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA4_MEASUREMENT_ID)}`;
  document.head.append(s);
}

/** Send one event; does nothing while analytics is off. */
export function track(event: string, params: Params = {}): void {
  if (!analyticsOn()) return;
  load();
  window.gtag!('event', event, params);
}

/** Which service a link out goes to, for the external_link event. */
export function platformOf(host: string): string {
  const h = host.replace(/^www\./, '');
  const known: [RegExp, string][] = [
    [/spotify\.com$/, 'Spotify'],
    [/music\.apple\.com$/, 'Apple Music'],
    [/soundcloud\.com$/, 'SoundCloud'],
    [/(youtube\.com|youtu\.be)$/, 'YouTube'],
    [/beatport\.com$/, 'Beatport'],
    [/(profimusic\.com|lnk\.to)$/, 'Profi Music'],
    [/instagram\.com$/, 'Instagram'],
    [/facebook\.com$/, 'Facebook'],
    [/hkcr\.live$/, 'Hong Kong Community Radio'],
  ];
  return known.find(([re]) => re.test(h))?.[1] ?? h;
}

/** Report every click on a link that leaves the site, in this document or a frame's. */
export function trackOutbound(doc: Document = document): void {
  if (!analyticsOn()) return;
  doc.addEventListener(
    'click',
    (e) => {
      const t = e.target as Element | null;
      const a = t && typeof t.closest === 'function' ? t.closest<HTMLAnchorElement>('a[href]') : null;
      if (!a) return;
      let url: URL;
      try {
        url = new URL(a.href, doc.location.href);
      } catch {
        return;
      }
      if (!/^https?:$/.test(url.protocol) || url.hostname === location.hostname) return;
      track('external_link', {
        link_url: url.href,
        link_domain: url.hostname,
        platform: platformOf(url.hostname),
        link_text: (a.getAttribute('aria-label') || a.innerText || a.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 100),
        page_path: doc.location.pathname,
      });
    },
    true,
  );
}

/**
 * A page view for the page now showing, plus the named event for the pages
 * the site exists for: the two artists and the releases.
 */
export function trackPage(path = location.pathname, title = document.title): void {
  if (!analyticsOn()) return;
  track('page_view', { page_location: location.origin + path, page_path: path, page_title: title });
  const artist = /\/(acnd|apurba)\/(?:(listen|about)\/)?$/.exec(path);
  if (artist) track('artist_page_view', { artist: artist[1], artist_page: artist[2] ?? 'home' });
  const release = /\/music\/(?:([^/]+)\/)?$/.exec(path);
  if (release) track('release_page_view', { release: release[1] ?? 'all', page_title: title });
}
