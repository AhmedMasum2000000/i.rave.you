import type { ArtistId } from "./data";
import { PAGE_META } from "./meta";

const ORIGIN = "https://iraveyou.online";
/**
 * Moving between app pages without a reload: give the document the same
 * title, description and self-referencing canonical its static file has.
 */
export function syncSearchMetadata(artist?: ArtistId, page = "home"): void {
  const path = artist ? `${artist}/${page === "home" ? "" : `${page}/`}` : "";
  const meta = PAGE_META[path] ?? PAGE_META[""];
  const url = `${ORIGIN}/${path}`;
  document.title = meta.title;
  document
    .querySelector<HTMLLinkElement>('link[rel="canonical"]')
    ?.setAttribute("href", url);
  for (const [selector, content] of [
    ['meta[name="description"]', meta.description],
    ['meta[property="og:title"]', meta.title],
    ['meta[property="og:description"]', meta.description],
    ['meta[property="og:url"]', url],
    ['meta[name="twitter:title"]', meta.title],
    ['meta[name="twitter:description"]', meta.description],
  ])
    document.querySelector(selector)?.setAttribute("content", content);
}
