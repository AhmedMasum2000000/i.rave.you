/**
 * I RAVE YOU — all site content lives here.
 * Two artists, one mix. Edit this file, not the markup.
 */

export type ArtistId = 'apurba' | 'acnd';

export interface Link {
  label: string;
  url: string;
  note?: string;
}

export interface Release {
  title: string;
  artists: string;
  year: number;
  /** Shown big on the right of the release row, like a tour date. */
  tag: string;
  cover?: string;
  url: string;
}

export interface Unreleased {
  title: string;
  url: string;
}

export interface Footnote {
  text: string;
  link?: Link;
}

export interface Media {
  src: string;
  /** Shown instead while `src` has not been added to public/img yet. */
  fallback?: string;
  caption: string;
  sub: string;
}

export interface Artist {
  id: ArtistId;
  name: string;
  /** Latin name for places where Bengali script would be unreadable at size. */
  latin: string;
  logo: string;
  hero: string;
  heroAlt: string;
  role: string;
  origin: string;
  /** Top-right info block, one line per entry. */
  info: string[];
  statement: string;
  bio: string[];
  notes: { label: string; text: string; url?: string }[];
  releases: Release[];
  /** Optional list under the releases on the about page. */
  extras?: { heading: string; items: Unreleased[] };
  links: Link[];
  /** Hero corner link, like the reference's "Spotify". */
  listen: Link;
  /**
   * The artist home page essay, after the reference's annotated tracklist.
   * `^n` in any text renders as a superscript pointing at footnote n.
   */
  essay: { intro: string; blocks: { label: string; text: string }[] };
  footnotes: Footnote[];
  media: Media[];
  /** Four tracks that name the sequencer's four patterns. */
  patterns: [string, string, string, string];
}

/* ─────────────────────────────── THE MIX ──────────────────────────────── */

/** The set playing in the background: made for Hong Kong Community Radio. */
export const MIX = {
  title: 'Qbic Pulse on HKCR',
  show: 'Qbic Pulse',
  hosts: 'ACND & অপূর্ব',
  station: 'Hong Kong Community Radio',
  stationUrl: 'https://hkcr.live/',
  file: 'audio/i-rave-you-mix.m4a',
  bpm: 125,
};

export interface MixTrack {
  at: number;
  artist: string;
  title: string;
  url: string;
}

const t = (mmss: string): number => {
  const [m, s] = mmss.split(':').map(Number);
  return m * 60 + s;
};

/** No public pages are known for most IDs, so these open a SoundCloud search. */
const sc = (q: string): string => `https://soundcloud.com/search?q=${encodeURIComponent(q)}`;

const raw: [string, string, string, string?][] = [
  ['00:00', 'ACND x অপূর্ব', 'Initiate (unreleased ID)', 'https://on.soundcloud.com/WyJeosbzhDrQ5eqSHt'],
  ['03:37', 'Remusic', 'Ancestral Calling'],
  ['06:35', 'Acrobat, Thomas Gandey, Vakabular', 'Acid (Vakabular Remix)'],
  ['09:41', 'Kevin de Vries, SLVR, Stella von Lingen', 'Life'],
  ['12:28', 'MAMI, Bound', 'Lose My Body'],
  ['15:43', 'HERMEN', 'Subra'],
  ['18:59', 'Solvane, Prismode', 'Mars'],
  ['21:37', 'Mark Hoffen, Bittermind', 'WTF'],
  ['25:30', 'Andy Syn, Heinrich & Heine', 'I Need Every Little Piece of You (Original Mix)'],
  ['30:48', 'Rem Siman', 'Pria'],
  ['33:47', '7 SKIES', 'QUENTE'],
  ['35:41', 'Jules Brand', 'LOSE CONTROL'],
  ['38:11', 'Add-us', 'Duck Duck'],
  ['40:57', 'Adapter', 'Nakupenda'],
  ['43:19', 'Axl Stace', 'Mystic'],
];

export const TRACKLIST: MixTrack[] = raw.map(([at, artist, title, url]) => ({
  at: t(at),
  artist,
  title,
  url: url ?? sc(`${artist.split(',')[0]} ${title.replace(/\(.*\)/, '')}`),
}));

export const fmt = (sec: number): string => {
  const s = Math.max(0, Math.floor(sec));
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
};

/* ──────────────────────────── NEXT RELEASE ────────────────────────────── */

export const NEXT_RELEASE = {
  title: 'Down In Bossa',
  artist: 'Ash Army & ACND',
  genre: 'Afro House',
  label: 'Profi Music',
  labelNote: 'a Warner Music sublabel',
  /** Release day per profimusic.com, counted to midnight in Dhaka. */
  date: '2026-10-30T00:00:00+06:00',
  presave: 'https://profimusic.lnk.to/DownInBossa',
  page: 'https://www.profimusic.com/release/down-in-bossa/',
  cover: 'img/down-in-bossa.jpg',
};

/* ─────────────────────────────── ARTISTS ──────────────────────────────── */

export const ARTISTS: Record<ArtistId, Artist> = {
  apurba: {
    id: 'apurba',
    name: 'অপূর্ব',
    latin: 'APURBA',
    logo: 'img/logo-apurba.png',
    hero: 'img/apurba-sun.jpg',
    heroAlt: 'অপূর্ব (Khalid Bin Alam).',
    role: 'Producer · DJ · Sound engineer',
    origin: 'Cumilla, Bangladesh',
    info: ['অপূর্ব (Apurba)', 'Khalid Bin Alam', 'Cumilla, Bangladesh', 'Producing since 2016', '“Language doesn’t matter.', 'Frequency does.”'],
    statement:
      'অপূর্ব is the dark half. Psychedelic textures, hypnotic grooves and sub-bass that talks before anyone says a word. Language doesn’t matter. Frequency does.',
    bio: [
      'অপূর্ব (Apurba) is the independent electronic music project of Khalid Bin Alam, a producer, DJ and sound engineer from Cumilla, Bangladesh. Since 2016 his self-taught practice has spanned production, mixing, mastering, sound design and live performance.',
      'His work moves between psychedelic and melodic electronic music, bass-driven club sounds, ambient composition and cinematic experiments — genre as a tool, not a limitation.',
      'Before অপূর্ব there was Euphonic: an open production lab on YouTube from 2018 to 2023. Today the wider practice includes Luminous Lullabies, Zalvix, A&R with Badenstock Records and playlist curation through PlayLSD.',
    ],
    notes: [
      { label: 'A', text: '“Nitol Paye Electric” — অপূর্ব x Ahmed Masum, featured by Billboard Bangladesh.', url: 'https://youtu.be/om5QGreRaYg' },
      { label: 'B', text: 'Released on the London Love compilation alongside international artists.', url: 'https://open.spotify.com/album/6wNfZrP6Xgx19753ppoOy3' },
      { label: 'C', text: 'Aliases: Euphonic, Zalvix, Luminous Lullabies, Necture Drop.' },
    ],
    releases: [
      { title: '1by1', artists: 'অপূর্ব', year: 2026, tag: '2026', cover: 'img/1by1.jpg', url: 'https://open.spotify.com/track/1Y6fCdolybkvwI0dzHCc04' },
      { title: 'Monolithic Flow', artists: 'অপূর্ব', year: 2026, tag: '2026', cover: 'img/monolithic-flow.jpg', url: 'https://open.spotify.com/track/07dAYiGWIDl61ZKheZK79a' },
      { title: 'H4PPY', artists: 'Luminous Lullabies, অপূর্ব', year: 2026, tag: '2026', cover: 'img/h4ppy.jpg', url: 'https://open.spotify.com/track/2NgY57feqYSDVqUQTbMZsR' },
      { title: 'You Make It.', artists: 'Zalvix', year: 2026, tag: '2026', cover: 'img/you-make-it.jpg', url: 'https://open.spotify.com/track/47zBG5M5woJ5C8MXIO26vc' },
      { title: 'Trance by 3', artists: 'অপূর্ব, Zalvix', year: 2025, tag: '2025', cover: 'img/trance-by-3.jpg', url: 'https://open.spotify.com/track/4OLEXwh1PwcMz3FgNjRZv7' },
      { title: 'Opening', artists: 'অপূর্ব, Hridnic, Ahmed Masum, Prothey', year: 2025, tag: '2025', cover: 'img/opening.jpg', url: 'https://open.spotify.com/track/1qDaML7JOjR84zWEuOHjDS' },
      { title: 'Progress!ve', artists: 'অপূর্ব, Zalvix', year: 2025, tag: '2025', cover: 'img/progressive.jpg', url: 'https://open.spotify.com/track/1nsJ7poGS2qorT2zkz9Vep' },
      { title: 'VOID', artists: 'অপূর্ব, Luminous Lullabies', year: 2025, tag: '2025', cover: 'img/void.jpg', url: 'https://open.spotify.com/track/79OCi8HEMhdD105OJ2LKYi' },
      { title: 'PsyEcho', artists: 'অপূর্ব, Luminous Lullabies', year: 2025, tag: '2025', cover: 'img/psyecho.jpg', url: 'https://open.spotify.com/track/5sRq9z2kDTxlSKjOm5zNdE' },
      { title: 'London Love', artists: 'Various Artists', year: 2025, tag: 'Comp', cover: 'img/london-love.jpg', url: 'https://open.spotify.com/album/6wNfZrP6Xgx19753ppoOy3' },
    ],
    extras: {
      heading: 'Sets, remixes & other selves',
      items: [
        { title: 'Nitol Paye Electric — অপূর্ব x Ahmed Masum | Billboard Bangladesh', url: 'https://youtu.be/om5QGreRaYg' },
        { title: 'Hypnotic (ZALVIX & FAMIN Unofficial Remix) — Varski x Abi Flynn', url: 'https://youtu.be/p_JortMUAI0' },
        { title: 'SunSet Chill House Mix 2026 — Luminous Lullabies Set 01', url: 'https://youtu.be/cCP5bHLnfHw' },
        { title: 'Festival Vibe Melodic Bass House Mix — Mixtape01 by ZALVIX', url: 'https://youtu.be/207WAnS77z0' },
        { title: 'VIVID — Necture Drop, Luminous Lullabies', url: 'https://open.spotify.com/track/0fsEdGyTJdT4vaZOxTXJZt' },
        { title: 'Flow — Necture Drop, Halfcian, Luminous Lullabies', url: 'https://open.spotify.com/track/2xj37z12eieGVAECp3nzbi' },
        { title: 'Golden Hour — Shahriar Tanzid, Luminous Lullabies', url: 'https://open.spotify.com/track/3RWEah4dI7Y9CyiZwBhUz6' },
        { title: 'Watching dreams together. — Necture Drop, Luminous Lullabies', url: 'https://open.spotify.com/track/3SlEIHHvEVLdiWuzQfEaNG' },
        { title: 'August. — Necture Drop, Halfcian, Luminous Lullabies', url: 'https://open.spotify.com/track/0J439mT1BYdUtLZPm6LeWp' },
        { title: 'Colors — Euphonic', url: 'https://open.spotify.com/track/7j1NjjEqnduyCIynHCnadf' },
        { title: '2 Days — Euphonic', url: 'https://open.spotify.com/track/0CB22NoA65NnfSVilPosG4' },
        { title: 'Wrong Turn', url: 'https://push.fm/fl/WsGknoy1' },
      ],
    },
    listen: { label: 'Spotify', url: 'https://open.spotify.com/artist/6ciIrhy1tI3vHlU1yGDiNk' },
    essay: {
      intro:
        'অপূর্ব is the dark half of Qbic Pulse, the show he hosts with ACND on Hong Kong Community Radio. Psychedelic texture, hypnotic grooves and sub-bass that speaks before anyone says a word.',
      blocks: [
        { label: '01', text: 'Initiate^1 is where the two halves met: ACND and অপূর্ব, still unreleased, opening their HKCR set.' },
        { label: '02', text: 'Before অপূর্ব there was Euphonic^2, an open production lab on YouTube from 2018 to 2023.' },
        { label: '03', text: 'Since then, a Billboard Bangladesh feature^3, a London Love compilation^4, and four aliases sharing one frequency.' },
      ],
    },
    footnotes: [
      { text: 'Initiate, ACND x অপূর্ব. Unreleased. It opens their Qbic Pulse set for HKCR.', link: { label: 'Listen', url: 'https://on.soundcloud.com/WyJeosbzhDrQ5eqSHt' } },
      { text: 'Euphonic, the first channel: future house, synthwave and remixes.', link: { label: 'YouTube', url: 'https://www.youtube.com/@euphonic404' } },
      { text: '“Nitol Paye Electric”, অপূর্ব x Ahmed Masum, featured by Billboard Bangladesh.', link: { label: 'Watch', url: 'https://youtu.be/om5QGreRaYg' } },
      { text: 'London Love, a compilation with international artists.', link: { label: 'Spotify', url: 'https://open.spotify.com/album/6wNfZrP6Xgx19753ppoOy3' } },
    ],
    media: [
      { src: 'img/apurba.jpg', fallback: 'img/apurba-sun.jpg', caption: 'অপূর্ব', sub: 'CUMILLA (BD)' },
      { src: 'img/sunset-mix.jpg', caption: 'LUMINOUS LULLABIES', sub: 'SET 01' },
      { src: 'img/monolithic-flow.jpg', caption: 'MONOLITHIC FLOW', sub: '2026' },
    ],
    patterns: ['1by1', 'Monolithic Flow', 'VOID', 'PsyEcho'],
    links: [
      { label: 'Link hub', url: 'https://linktr.ee/youmeiyou' },
      { label: 'Spotify', url: 'https://open.spotify.com/artist/6ciIrhy1tI3vHlU1yGDiNk' },
      { label: 'Apple Music', url: 'https://music.apple.com/us/artist/%E0%A6%85%E0%A6%AA-%E0%A6%B0-%E0%A6%AC/1821995434' },
      { label: 'SoundCloud', url: 'https://soundcloud.com/youmeiyou' },
      { label: 'YouTube', url: 'https://www.youtube.com/channel/UCdBbH56nWgMHab8p5_gK-Mw' },
      { label: 'Instagram', url: 'https://instagram.com/i.rave.you' },
      { label: 'Substack', url: 'https://youmeiyou.substack.com' },
      { label: 'Discord', url: 'https://discord.gg/qtseyTsF47' },
      { label: 'LinkedIn', url: 'https://www.linkedin.com/in/khalid-bin-alam/' },
    ],
  },

  acnd: {
    id: 'acnd',
    name: 'ACND',
    latin: 'ACND',
    logo: 'img/logo-acnd.png',
    hero: 'img/acnd-portrait.webp',
    heroAlt: 'ACND standing on a rain-slicked Dhaka street at night, lit by neon.',
    role: 'Producer · DJ · Composer',
    origin: 'Dhaka, Bangladesh',
    info: ['“Down In Bossa”', 'Ash Army & ACND · Afro House', 'Profi Music · Warner sublabel', '30.10.2026 00:00', 'Prod. by ACND®', 'Dhaka, Bangladesh'],
    statement:
      'ACND is the light half — the one that ascends. Techno, melodic techno, acid and progressive, built to be felt in the chest before it is understood in the head.',
    bio: [
      'ACND — read it “Ascend” — is the recording name of A H Al Masum, a producer, DJ and composer working out of Dhaka, Bangladesh.',
      'Nothing here will tell you what the next record sounds like. That is the point. What holds the work together is not a category but a feeling: a room, a late hour, and a sound that will not leave.',
      'Next up: “Down In Bossa” with Ash Army, landing 30 October 2026 on Profi Music, a sublabel of Warner Music.',
    ],
    notes: [
      { label: 'A', text: '“Down In Bossa” with Ash Army: out 30.10.2026 on Profi Music (Warner Music sublabel). Pre-save now.', url: NEXT_RELEASE.presave },
      { label: 'B', text: '“Observateur d’étoiles” and “Her...” are out now on every platform.' },
      { label: 'C', text: '“Initiate” — ACND x অপূর্ব. Unreleased. Opens the mix you are hearing.', url: 'https://on.soundcloud.com/WyJeosbzhDrQ5eqSHt' },
    ],
    releases: [
      { title: 'Down In Bossa', artists: 'Ash Army & ACND · Profi Music', year: 2026, tag: '30.10', cover: NEXT_RELEASE.cover, url: NEXT_RELEASE.presave },
      { title: 'Observateur d’étoiles', artists: 'ACND', year: 2026, tag: '14.08', cover: 'img/observateur.webp', url: 'https://open.spotify.com/track/2KKx8ekirGh7xB4cm4EQ0S' },
      { title: 'Her...', artists: 'ACND', year: 2026, tag: '24.07', cover: 'img/her.webp', url: 'https://open.spotify.com/track/1728ckXv0wfIEBhUsGP7TN' },
      { title: 'Nitol Paye Electric', artists: 'অপূর্ব x Ahmed Masum', year: 2025, tag: 'Collab', cover: 'img/nitol-paye-electric.jpg', url: 'https://youtu.be/om5QGreRaYg' },
      { title: 'Opening', artists: 'অপূর্ব, Hridnic, Ahmed Masum, Prothey', year: 2025, tag: 'Collab', cover: 'img/opening.jpg', url: 'https://open.spotify.com/track/1qDaML7JOjR84zWEuOHjDS' },
    ],
    listen: { label: 'Spotify', url: 'https://open.spotify.com/track/2KKx8ekirGh7xB4cm4EQ0S' },
    essay: {
      intro:
        'Qbic Pulse is a radio show: ACND and অপূর্ব on Hong Kong Community Radio. For forty-five minutes the light half and the dark half pass the decks back and forth, until you stop being able to tell who is playing.',
      blocks: [
        { label: '01', text: 'Their HKCR set opens on Initiate^1, the first thing ACND and অপূর্ব finished together. Still unreleased, and the reason this site exists.' },
        { label: '02', text: 'From there it climbs through melodic techno, acid and progressive, the corners ACND keeps coming back to.' },
        { label: '03', text: 'Next comes Down In Bossa^2: Afro House with Ash Army, out 30 October on Profi Music. Until then, there is Observateur d’étoiles^3.' },
      ],
    },
    footnotes: [
      { text: 'Initiate, ACND x অপূর্ব. Unreleased. It opens their Qbic Pulse set for HKCR.', link: { label: 'Listen', url: 'https://on.soundcloud.com/WyJeosbzhDrQ5eqSHt' } },
      { text: 'Down In Bossa, Ash Army & ACND. Afro House, out 30.10.2026 on Profi Music.', link: { label: 'Pre-save', url: NEXT_RELEASE.presave } },
      { text: 'Observateur d’étoiles and Her... are out now everywhere.', link: { label: 'Spotify', url: 'https://open.spotify.com/track/2KKx8ekirGh7xB4cm4EQ0S' } },
    ],
    media: [
      { src: 'img/acnd-portrait.webp', caption: 'ACND', sub: 'DHAKA (BD)' },
      { src: 'img/down-in-bossa.jpg', caption: 'DOWN IN BOSSA', sub: '30.10 · PROFI MUSIC' },
      { src: 'img/observateur.webp', caption: 'OBSERVATEUR D’ÉTOILES', sub: 'OUT NOW' },
    ],
    patterns: ['Initiate', 'Down In Bossa', 'Observateur', 'Her...'],
    links: [
      { label: 'Pre-save “Down In Bossa”', url: NEXT_RELEASE.presave },
      { label: 'SoundCloud', url: 'https://soundcloud.com/acndlovestoes' },
      { label: 'Spotify', url: 'https://open.spotify.com/track/2KKx8ekirGh7xB4cm4EQ0S' },
      { label: 'Apple Music', url: 'https://music.apple.com/us/song/her/6794554132' },
      { label: 'YouTube Music', url: 'https://music.youtube.com/watch?v=s_b17eFeZgM' },
    ],
  },
};

export const OTHER: Record<ArtistId, ArtistId> = { apurba: 'acnd', acnd: 'apurba' };
