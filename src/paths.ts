/**
 * Pages declare how far they sit below the site root with
 * `<html data-root="../../">`, so one relative path works everywhere —
 * on a GitHub Pages project path, a custom domain, or nested secret pages.
 */
export const asset = (p: string): string => (document.documentElement.dataset.root ?? '') + p;
