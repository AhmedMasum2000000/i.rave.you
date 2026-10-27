import './style.css';
import { installGuard } from './guard';
import './arka.css';
import './mobile.css';
import { sample } from './audio';
import { ARTISTS, MIX, NEXT_RELEASE, fmt, type ArtistId } from './data';
import { mountPlayer } from './player';
import { asset, esc, mountGate, reducedMotion, revealOnScroll } from './ui';

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
      { q: 'Remix credit', a: '“Nitol Paye Electric” remix — ACND (Ahmed Masum)', aside: 'Ahmed Masum and ACND are the same artist.' },
      { q: 'Type of performer', a: '● DJ', aside: 'Not a cover artist. Not beatboxing. Respects the hustle, though.' },
      { q: 'Stage name', a: 'ACND (Ascend)', aside: 'Four letters, one direction: up.' },
      { q: 'Genre', a: 'Techno / Melodic Techno / Acid Techno / Progressive', aside: 'Four genres walk into a club. Only one kick drum walks out.' },
      { q: 'The vibe', a: '“Something no one has ever seen, heard or felt before — the pinnacle of peakness. The Mind of ACND.”', aside: 'We checked. “Peakness” is not in the dictionary. Yet.' },
      { q: 'Preferred set duration', a: '45 minutes', aside: 'The set playing on this page runs 45:44, made for Hong Kong Community Radio. Consider it the rehearsal.' },
      { q: 'Preferred time of day', a: 'Anytime', aside: 'Daylight is just a very slow strobe.' },
      { q: 'Dates available', a: '☑ 4 December  ☑ 5 December  ☑ 6 December', aside: 'All three. He’d have ticked a fourth if you had one.' },
      { q: 'Equipment needed', a: '☑ DJ deck  ☑ Other: Love', aside: 'Brings his own Love. No extension cord required.' },
      { q: 'Anything else?', a: '“Love what Arka is doing, and what it stands for.”', aside: 'That’s it. That’s the whole rider. No green M&Ms.' },
    ],
    numbers: [
      { n: '45:44', label: 'of the Qbic Pulse set he co-hosted on Hong Kong Community Radio, playing behind this sentence' },
      { n: 'HKCR', label: 'Hong Kong Community Radio: the station this set was made for' },
      { n: '30.10', label: '“Down In Bossa” with Ash Army lands on Profi Music' },
      { n: '3/3', label: 'festival dates available. Pick one. Or don’t, and keep all three.' },
    ],
    risks: [
      ['Models walking in time with the kick', 'High', 'Encouraged'],
      ['Front row forgets to check their phones', 'Medium', 'Unavoidable'],
      ['Audience demands track IDs', 'Certain', 'They’re on the I Rave You homepage'],
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
      { q: 'Releases', a: '“1by1”, “Monolithic Flow” and the London Love compilation', aside: 'Original releases from অপূর্ব’s catalogue.' },
      { q: 'Set duration & slot', a: 'Your call', aside: 'Tell him the slot; the sub-bass will fill the rest.' },
      { q: 'Equipment needed', a: 'DJ deck', aside: 'And a room that can take 40 Hz without filing a complaint.' },
    ],
    numbers: [
      { n: '2016', label: 'the year the self-taught practice started' },
      { n: '10+', label: 'releases on Spotify across অপূর্ব and his aliases' },
      { n: '4', label: 'aliases, one frequency' },
      { n: '45:44', label: 'of the Qbic Pulse set he co-hosted with ACND on Hong Kong Community Radio, playing right now' },
    ],
    risks: [
      ['Sub-bass rearranges the front row’s internal organs', 'Medium', 'Wear something structured'],
      ['Crowd forgets which language they speak', 'High', 'Intended. Frequency does.'],
      ['Psychedelic textures clash with the collection', 'Low', 'They’ll complement it. Like black and white.'],
      ['Someone asks “who is this?”', 'Certain', 'অপূর্ব. Every link is one click away.'],
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
      { q: 'Next release', a: '“Down In Bossa” with ACND · Afro House · out 30.10.2026 on Profi Music', aside: 'Two applicants, one record. Ask about the back-to-back.' },
      { q: 'Set duration & slot', a: 'Your call', aside: 'Name the slot. He brings the hands-in-the-air moment.' },
    ],
    numbers: [
      { n: '16', label: 'the age he started producing' },
      { n: '10', label: 'genres he works across, from future bass to hard techno' },
      { n: '30.10', label: '“Down In Bossa” with ACND drops on Profi Music' },
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
  /** Plays the HKCR set in the background, with a gate to start it. */
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
    exhibit: { kicker: 'EXHIBIT A · ASH ARMY & ACND · OUT 30.10 · PROFI MUSIC', label: `“${NEXT_RELEASE.title}” — pre-save ↗`, url: NEXT_RELEASE.presave },
  },
  apurba: {
    name: 'অপূর্ব',
    logo: ARTISTS.apurba.logo,
    glow: 'var(--blue)',
    number: '0002',
    mix: true,
    profile: asset('index.html#/apurba'),
    exhibit: { kicker: 'EXHIBIT A · EVERY RELEASE, SET & ALIAS', label: 'All links in one place ↗', url: 'https://linktr.ee/youmeiyou' },
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

installGuard();

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
        ${id === 'ash' ? '' : `<a class="btn btn-ghost" href="${asset('frequency-unity/')}">Read the feature: Beyond the Capital</a>`}
      </div>
      <p class="p-fine mono">${m.mix ? `No models were harmed in the making of this ${fmt(2744)} mix. ${MIX.bpm} BPM. Love included.` : 'No models were harmed in the making of this application. Hearts may be.'}</p>
      <nav class="legal-links" aria-label="Legal information"><a href="${asset('legal/terms/')}">Terms</a><a href="${asset('legal/privacy/')}">Privacy</a><a href="${asset('legal/copyright/')}">Copyright contact</a></nav>
      <p class="credit">Site by ACND</p>
    </section>
  </div>`;

const io = revealOnScroll(document);
void io;

const title = document.querySelector<HTMLElement>('.p-title')!;
const loop = (): void => {
  title.style.setProperty('--beat', sample().beat.toFixed(3));
  requestAnimationFrame(loop);
};
if (!reducedMotion() && !matchMedia('(pointer: coarse)').matches) requestAnimationFrame(loop);

mountPlayer();

if (m.mix) {
  void mountGate({
    kicker: `For Arka Fashion Week ’26 — from ${m.name}`,
    line: 'Sound on. This application comes with its own soundtrack.',
    cta: 'Open the application',
  });
}
