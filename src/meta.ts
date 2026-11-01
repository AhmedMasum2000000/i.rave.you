/**
 * Title and description of every app page, keyed by its path below the site
 * root. One table for both sides: scripts/seo.mjs writes it into the static
 * files search engines read, and src/seo.ts sets it while the visitor moves
 * between pages, so the tab title and canonical never disagree with the file.
 */
export interface PageMeta {
  title: string;
  description: string;
}

export const PAGE_META: Record<string, PageMeta> = {
  '': {
    title: 'I Rave You — ACND & অপূর্ব | Electronic Music Bangladesh',
    description:
      'Explore ACND (Ahmed Masum) and অপূর্ব (Opurbo / Apurba): electronic music from Bangladesh, artist biographies, releases and the Qbic Pulse DJ mix tracklist.',
  },
  'acnd/': {
    title: 'Ahmed Masum (ACND) — Electronic Music Producer & DJ',
    description:
      'Meet ACND, the electronic music alias of Ahmed Masum in Dhaka, Bangladesh. Explore his biography, Down In Bossa with Ash Army, and Qbic Pulse.',
  },
  'acnd/listen/': {
    title: 'ACND Releases — Down In Bossa & Remixes by Ahmed Masum',
    description:
      'Releases by ACND (Ahmed Masum), the Dhaka producer and DJ: Down In Bossa with Ash Army, out on Profi Music, and his Nitol Paye Electric remix, with official listening links.',
  },
  'acnd/about/': {
    title: 'About ACND — Ahmed Masum, Producer & DJ from Dhaka',
    description:
      'ACND, pronounced Ascend, is Ahmed Masum: an independent electronic music producer, DJ and composer based in Dhaka, Bangladesh. Biography, sound and credits.',
  },
  'apurba/': {
    title: 'অপূর্ব (Opurbo / Apurba) — Electronic Artist, Bangladesh',
    description:
      'অপূর্ব (Opurbo / Apurba) is Khalid Bin Alam, an independent electronic producer and DJ from Cumilla, Bangladesh. Explore his biography and releases.',
  },
  'apurba/listen/': {
    title: 'অপূর্ব Releases — Opurbo / Apurba Discography',
    description:
      'Every release by অপূর্ব (Opurbo / Apurba), the electronic producer Khalid Bin Alam from Cumilla, Bangladesh: 1by1, Monolithic Flow, VOID, PsyEcho, sets and remixes.',
  },
  'apurba/about/': {
    title: 'About অপূর্ব — Khalid Bin Alam, Electronic Producer from Cumilla',
    description:
      'অপূর্ব (Opurbo / Apurba) is the independent electronic music project of Khalid Bin Alam, a self-taught producer and DJ from Cumilla, Bangladesh, making music since 2016.',
  },
};
