import { ARTISTS, type ArtistId } from "./data";

const ORIGIN = "https://iraveyou.online";
/** Hash views remain interactive; their clean, static profiles are canonical. */
export function syncSearchMetadata(artist?: ArtistId): void {
  const a = artist ? ARTISTS[artist] : undefined;
  const title = a
    ? `${a.id === "acnd" ? "Ahmed Masum (ACND)" : "অপূর্ব (Opurbo / Apurba)"} — I Rave You`
    : "I Rave You — ACND & অপূর্ব | Electronic Music Bangladesh";
  const description =
    a?.about?.summary ??
    "Explore ACND (Ahmed Masum) and অপূর্ব (Opurbo / Apurba): electronic music from Bangladesh, artist biographies, releases and the Qbic Pulse DJ mix tracklist.";
  const url = `${ORIGIN}/${artist ? `${artist}/` : ""}`;
  document.title = title;
  document
    .querySelector<HTMLLinkElement>('link[rel="canonical"]')
    ?.setAttribute("href", url);
  for (const [selector, content] of [
    ['meta[name="description"]', description],
    ['meta[property="og:title"]', title],
    ['meta[property="og:description"]', description],
    ['meta[property="og:url"]', url],
    ['meta[name="twitter:title"]', title],
    ['meta[name="twitter:description"]', description],
  ])
    document.querySelector(selector)?.setAttribute("content", content);
}
