import './style.css';
import './arka.css';
import { onTrack, sample } from './audio';
import { ARTISTS, MIX, NEXT_RELEASE, TRACKLIST, fmt, type ArtistId } from './data';
import { asset, esc, mountGate, mountNowPlaying, revealOnScroll } from './ui';

/**
 * Unlisted pitch pages for Arka Fashion Week '26: COLLECTIVE LIVE.
 * Nothing on the public site links here. Each page is a persuasive, slightly
 * cheeky companion to the Google Form, and sends the reader on to the full
 * artist profile.
 */

interface Answer {
  q: string;
  a: string;
  aside: string;
}

interface Pitch {
  kicker: string;
  title: string;
  sub: string;
  answers: Answer[];
  numbers: { n: string; label: string }[];
  risks: [string, string, string][];
  close: string;
  sign: string;
}

type PitchId = ArtistId | 'ash';

const PITCH: Record<PitchId, Pitch> = {
  acnd: {
    kicker: 'To: the Arka Fashion Week creative team · Re: AFW ’26 Collective Live',
    title: 'ACND',
    sub: 'Read it “Ascend”. This isn’t a press kit — it’s a 45-minute argument, and it’s already playing.',
    answers: [
      { q: 'Type of performer', a: '● DJ', aside: 'Not a cover artist. Not beatboxing. Respects the hustle, though.' },
      { q: 'Stage name', a: 'ACND (Ascend)', aside: 'Four letters, one direction: up.' },
      { q: 'Genre', a: 'Techno / Melodic Techno / Acid Techno / Progressive', aside: 'Four genres walk into a club. Only one kick drum walks out.' },
      { q: 'The vibe', a: '“Something no one has ever seen, heard or felt before — the pinnacle of peakness. The Mind of ACND.”', aside: 'We checked. “Peakness” is not in the dictionary. Yet.' },
      { q: 'Preferred set duration', a: '45 minutes', aside: 'The mix on this page runs 45:44. You are listening to the rehearsal.' },
      { q: 'Preferred time of day', a: 'Anytime', aside: 'Daylight is just a very slow strobe.' },
      { q: 'Dates available', a: '☑ 4 December  ☑ 5 December  ☑ 6 December', aside: 'All three. He’d have ticked a fourth if you had one.' },
      { q: 'Equipment needed', a: '☑ DJ deck  ☑ Other: Love', aside: 'Brings his own Love. No extension cord required.' },
      { q: 'Anything else?', a: '“Love what Arka is doing, and what it stands for.”', aside: 'That’s it. That’s the whole rider. No green M&Ms.' },
    ],
    numbers: [
      { n: '45:44', label: 'of set, already mixed and playing behind this sentence' },
      { n: String(TRACKLIST.length), label: 'tracks, every ID linked below — no Shazam needed' },
      { n: '29.10', label: '“Down In Bossa” lands on Profi Music, a Warner Music sublabel' },
      { n: '3/3', label: 'festival dates available. Pick one. Or don’t, and keep all three.' },
    ],
    risks: [
      ['Models walking in time with the kick', 'High', 'Encouraged'],
      ['Front row forgets to check their phones', 'Medium', 'Unavoidable'],
      ['Audience demands track IDs', 'Certain', 'They’re all on this page'],
      ['Set runs past 45 minutes', 'Low', 'He counts in bars, not vibes'],
      ['Spontaneous outbreak of Love', 'Confirmed', 'Listed under equipment'],
    ],
    close: 'Fashion week lives in the cut between two things — fabric and body, light and dark. So does this. Selected applicants will be contacted. We would very much like to be contacted.',
    sign: '— ACND',
  },
  apurba: {
    kicker: 'To: the Arka Fashion Week creative team · Re: AFW ’26 Collective Live',
    title: 'APURBA',
    sub: 'অপূর্ব — the dark half. Language doesn’t matter. Frequency does. And your runway runs on frequency.',
    answers: [
      { q: 'Type of performer', a: '● DJ · Producer · Sound engineer', aside: 'Makes the records, mixes the records, plays the records. Vertical integration, but make it rave.' },
      { q: 'Stage name', a: 'অপূর্ব (Apurba)', aside: 'Bengali for “extraordinary”. No pressure.' },
      { q: 'Genre', a: 'Psychedelic & melodic electronic · bass-driven club · cinematic', aside: 'Genre is a tool, not a cage. He brought the whole toolbox.' },
      { q: 'Experience', a: 'Producing since 2016 — Euphonic, Zalvix, Luminous Lullabies, অপূর্ব', aside: 'Four aliases. All of them showed up for this application.' },
      { q: 'Press', a: '“Nitol Paye Electric” — অপূর্ব x Ahmed Masum, featured by Billboard Bangladesh', aside: 'Yes, that Billboard. The Bangladesh one. It counts.' },
      { q: 'Set duration & slot', a: 'Your call', aside: 'Tell him the slot; the sub-bass will fill the rest.' },
      { q: 'Equipment needed', a: 'DJ deck', aside: 'And a room that can take 40 Hz without filing a complaint.' },
    ],
    numbers: [
      { n: '2016', label: 'the year the self-taught practice started' },
      { n: '10+', label: 'releases on Spotify across অপূর্ব and his aliases' },
      { n: '4', label: 'aliases, one frequency' },
      { n: '45:44', label: 'of the I RAVE YOU mix playing right now — it opens with his collab “Initiate”' },
    ],
    risks: [
      ['Sub-bass rearranges the front row’s internal organs', 'Medium', 'Wear something structured'],
      ['Crowd forgets which language they speak', 'High', 'Intended. Frequency does.'],
      ['Psychedelic textures clash with the collection', 'Low', 'They’ll complement it. Like black and white.'],
      ['Someone asks “who is this?”', 'Certain', 'অপূর্ব. Every link is below.'],
    ],
    close: 'Every collection needs its shadow to show its shape. Book the dark half — and ask about the other one. Selected applicants will be contacted; we’ll keep the volume up until then.',
    sign: '— অপূর্ব',
  },
  ash: {
    kicker: 'To: the Arka Fashion Week creative team · Re: AFW ’26 Collective Live',
    title: 'ASH ARMY',
    sub: 'Pop hearts, dance-floor lungs, K-pop swagger. One Bangladeshi producer with a very loud plan to unite people through music.',
    answers: [
      { q: 'Type of performer', a: '● DJ · Producer', aside: 'Writes the hooks, then drops them on you personally.' },
      { q: 'Stage name', a: 'Ash Army (Md. Shahabuddin)', aside: 'One person. Army-sized output.' },
      { q: 'From', a: 'Hajiganj, Chandpur, Bangladesh', aside: 'Chandpur is famous for hilsa. Now also for drops.' },
      { q: 'Producing since', a: 'Age 16', aside: 'Most of us were still choosing a ringtone.' },
      { q: 'Sound', a: 'Emotional pop melodies × high-energy dance rhythms × K-pop influence', aside: 'The only set where a K-pop stan and a techno head end up hugging.' },
      { q: 'Range', a: 'Bigroom · Dance · EDM · Future Bass · House · Progressive House · Tech-House · Techno · Hard Techno · K-Pop', aside: 'Ten genres. The runway gets a whole season in one set.' },
      { q: 'Grew up on', a: 'Martin Garrix · DJ Snake · W&W · The Chainsmokers', aside: 'Main-stage DNA, festival-sized hooks.' },
      { q: 'Label home', a: 'Profi Music roster', aside: 'Signed, sealed, and already delivering.' },
      { q: 'Set duration & slot', a: 'Your call', aside: 'Name the slot. He brings the hands-in-the-air moment.' },
    ],
    numbers: [
      { n: '16', label: 'the age he started producing' },
      { n: '10', label: 'genres he works across, from future bass to hard techno' },
      { n: 'EN|DE', label: 'his bio already ships in two languages. The global vision is not a figure of speech.' },
      { n: '3', label: 'festival dates on Arka’s calendar, 4–6 December. Point at one.' },
    ],
    risks: [
      ['K-pop fan chants during the drop', 'High', 'Embraced'],
      ['Runway quietly turns into a main stage', 'Medium', 'Barricades optional'],
      ['Big-room drop rattles the lighting rig', 'Low', 'Lighting crew, hold on'],
      ['Audience unites across borders', 'Certain', 'It is literally the mission statement'],
    ],
    close: 'Rooted in Bangladesh, built for the world, and one runway away from proving it. Selected applicants will be contacted. His phone is on loud.',
    sign: '— Ash Army',
  },
};

/** Per-page look and evidence. Ash Army sits outside the duality: own colour, no mix. */
interface Meta {
  name: string;
  logo?: string;
  photo?: string;
  glow: string;
  number: string;
  /** Plays the I RAVE YOU mix and lists its tracks. */
  mix: boolean;
  profile?: string;
  exhibit: { kicker: string; label: string; url: string };
}

const META: Record<PitchId, Meta> = {
  acnd: {
    name: 'ACND',
    logo: ARTISTS.acnd.logo,
    glow: 'var(--orange)',
    number: '0001',
    mix: true,
    profile: asset('index.html#/acnd'),
    exhibit: { kicker: 'EXHIBIT B · OUT 29.10 · PROFI MUSIC (WARNER MUSIC SUBLABEL)', label: `“${NEXT_RELEASE.title}” — pre-save ↗`, url: NEXT_RELEASE.presave },
  },
  apurba: {
    name: 'অপূর্ব',
    logo: ARTISTS.apurba.logo,
    glow: 'var(--blue)',
    number: '0002',
    mix: true,
    profile: asset('index.html#/apurba'),
    exhibit: { kicker: 'EXHIBIT B · EVERY RELEASE, SET & ALIAS', label: 'All links in one place ↗', url: 'https://linktr.ee/youmeiyou' },
  },
  ash: {
    name: 'Ash Army',
    photo: 'img/ash-army.jpg',
    glow: 'var(--amber)',
    number: '0003',
    mix: false,
    profile: 'https://www.profimusic.com/artist/ash-army/',
    exhibit: { kicker: 'EXHIBIT A · ARTIST PROFILE · PROFI MUSIC', label: 'Ash Army on Profi Music ↗', url: 'https://www.profimusic.com/artist/ash-army/' },
  },
};

const id = ((document.body.dataset.pitch as PitchId) in PITCH ? document.body.dataset.pitch : 'acnd') as PitchId;
const p = PITCH[id];
const m = META[id];
document.body.dataset.artist = id;
document.body.dataset.view = 'pitch';

const mark = m.logo
  ? `<span class="logo p-logo"><img src="${asset(m.logo)}" alt="${esc(m.name)} logo" onerror="this.parentNode.classList.add('nologo')" /><span class="logo-text">${esc(m.name)}</span></span>`
  : m.photo
    ? `<img class="p-photo" src="${asset(m.photo)}" alt="${esc(m.name)}" onerror="this.remove()" />`
    : '';

const tracks = m.mix
  ? `<span class="label mono">Exhibit A — the set you are hearing</span>
      <ol class="p-tracks">
        ${TRACKLIST.map(
          (t, i) =>
            `<li data-i="${i}"><a href="${esc(t.url)}" target="_blank" rel="noopener"><span class="mono">${fmt(t.at)}</span><span><b>${esc(t.title)}</b> — ${esc(t.artist)}</span><span class="mono">↗</span></a></li>`,
        ).join('')}
      </ol>`
  : '';

document.getElementById('app')!.innerHTML = `
  <div class="pitch" style="--glow:${m.glow}">
    <header class="p-top mono">
      <span>AFW ’26 · COLLECTIVE LIVE</span>
      <span>CONFIDENTIAL-ISH · DEC 4–6</span>
    </header>

    <section class="p-hero">
      <p class="p-kicker mono">${esc(p.kicker)}</p>
      ${mark}
      <h1 class="p-title">${esc(p.title)}</h1>
      <p class="p-sub" data-words>${esc(p.sub)}</p>
      <div class="p-stamp" aria-hidden="true">APPLICANT<br/>№ ${m.number}</div>
    </section>

    <section class="p-form">
      <span class="label mono">The application, annotated</span>
      <ol class="p-answers">
        ${p.answers
          .map(
            (x, i) => `
          <li data-reveal style="--d:${i}">
            <span class="p-q mono">${String(i + 1).padStart(2, '0')} · ${esc(x.q)}</span>
            <span class="p-a">${esc(x.a)}</span>
            <span class="p-aside">${esc(x.aside)}</span>
          </li>`,
          )
          .join('')}
      </ol>
    </section>

    <section class="p-numbers">
      ${p.numbers.map((x) => `<div data-reveal><b>${esc(x.n)}</b><span>${esc(x.label)}</span></div>`).join('')}
    </section>

    <section class="p-risk">
      <span class="label mono">Risk assessment</span>
      <table>
        <thead><tr><th>Risk</th><th>Likelihood</th><th>Mitigation</th></tr></thead>
        <tbody>${p.risks.map((r) => `<tr data-reveal><td>${esc(r[0])}</td><td class="mono">${esc(r[1])}</td><td>${esc(r[2])}</td></tr>`).join('')}</tbody>
      </table>
    </section>

    <section class="p-proof">
      ${tracks}
      <a class="p-presave" href="${m.exhibit.url}" target="_blank" rel="noopener">
        <span class="mono">${esc(m.exhibit.kicker)}</span>
        <b>${esc(m.exhibit.label)}</b>
      </a>
    </section>

    <section class="p-close">
      <p data-words>${esc(p.close)}</p>
      <p class="p-sign">${esc(p.sign)}</p>
      <div class="p-ctas">
        ${m.profile ? `<a class="btn" href="${m.profile}"${m.profile.startsWith('http') ? ' target="_blank" rel="noopener"' : ''}>Open the artist profile →</a>` : `<a class="btn" href="${m.exhibit.url}" target="_blank" rel="noopener">Listen to Ash Army ↗</a>`}
        <a class="btn btn-ghost" href="${asset('index.html')}">Enter I RAVE YOU</a>
      </div>
      <p class="p-fine mono">${m.mix ? `No models were harmed in the making of this ${fmt(2744)} mix. ${MIX.bpm} BPM. Love included.` : 'No models were harmed in the making of this application. Hearts may be.'}</p>
    </section>
  </div>`;

const io = revealOnScroll(document);
void io;

const title = document.querySelector<HTMLElement>('.p-title')!;
const loop = (): void => {
  title.style.setProperty('--beat', sample().beat.toFixed(3));
  requestAnimationFrame(loop);
};
requestAnimationFrame(loop);

if (m.mix) {
  const items = [...document.querySelectorAll<HTMLElement>('.p-tracks li')];
  onTrack((_, i) => items.forEach((li, k) => li.classList.toggle('playing', k === i)));
  mountNowPlaying();
  void mountGate({
    kicker: `For Arka Fashion Week ’26 — from ${m.name}`,
    line: 'Sound on. This application comes with its own soundtrack.',
    cta: 'Open the application',
  });
}
