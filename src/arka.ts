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

const PITCH: Record<ArtistId, Pitch> = {
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
};

const id = (document.body.dataset.pitch as ArtistId) || 'acnd';
const a = ARTISTS[id];
const p = PITCH[id];
document.body.dataset.artist = id;
document.body.dataset.view = 'pitch';
const profile = asset(`index.html#/${id}`);

document.getElementById('app')!.innerHTML = `
  <div class="pitch" style="--glow:${id === 'acnd' ? 'var(--orange)' : 'var(--blue)'}">
    <header class="p-top mono">
      <span>AFW ’26 · COLLECTIVE LIVE</span>
      <span>CONFIDENTIAL-ISH · DEC 4–6</span>
    </header>

    <section class="p-hero">
      <p class="p-kicker mono">${esc(p.kicker)}</p>
      <span class="logo p-logo"><img src="${asset(a.logo)}" alt="${esc(a.name)} logo" onerror="this.parentNode.classList.add('nologo')" /><span class="logo-text">${esc(a.name)}</span></span>
      <h1 class="p-title">${esc(p.title)}</h1>
      <p class="p-sub" data-words>${esc(p.sub)}</p>
      <div class="p-stamp" aria-hidden="true">APPLICANT<br/>№ ${id === 'acnd' ? '0001' : '0002'}</div>
    </section>

    <section class="p-form">
      <span class="label mono">● THE APPLICATION, ANNOTATED</span>
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
      <span class="label mono">● RISK ASSESSMENT</span>
      <table>
        <thead><tr><th>Risk</th><th>Likelihood</th><th>Mitigation</th></tr></thead>
        <tbody>${p.risks.map((r) => `<tr data-reveal><td>${esc(r[0])}</td><td class="mono">${esc(r[1])}</td><td>${esc(r[2])}</td></tr>`).join('')}</tbody>
      </table>
    </section>

    <section class="p-proof">
      <span class="label mono">● EXHIBIT A — THE SET YOU ARE HEARING</span>
      <ol class="p-tracks">
        ${TRACKLIST.map(
          (t, i) =>
            `<li data-i="${i}"><a href="${esc(t.url)}" target="_blank" rel="noopener"><span class="mono">${fmt(t.at)}</span><span><b>${esc(t.title)}</b> — ${esc(t.artist)}</span><span class="mono">↗</span></a></li>`,
        ).join('')}
      </ol>
      ${
        id === 'acnd'
          ? `<a class="p-presave" href="${NEXT_RELEASE.presave}" target="_blank" rel="noopener">
              <span class="mono">EXHIBIT B · OUT 29.10 · PROFI MUSIC (WARNER MUSIC SUBLABEL)</span>
              <b>“${esc(NEXT_RELEASE.title)}” — pre-save ↗</b>
            </a>`
          : `<a class="p-presave" href="https://linktr.ee/youmeiyou" target="_blank" rel="noopener">
              <span class="mono">EXHIBIT B · EVERY RELEASE, SET & ALIAS</span>
              <b>All links in one place ↗</b>
            </a>`
      }
    </section>

    <section class="p-close">
      <p data-words>${esc(p.close)}</p>
      <p class="p-sign">${esc(p.sign)}</p>
      <div class="p-ctas">
        <a class="btn" href="${profile}">Open the artist profile →</a>
        <a class="btn btn-ghost" href="${asset('index.html')}">Enter I RAVE YOU ◐</a>
      </div>
      <p class="p-fine mono">No models were harmed in the making of this ${fmt(2744)} mix. ${MIX.bpm} BPM. Love included.</p>
    </section>
  </div>`;

const io = revealOnScroll(document);
void io;

const items = [...document.querySelectorAll<HTMLElement>('.p-tracks li')];
onTrack((_, i) => items.forEach((li, k) => li.classList.toggle('playing', k === i)));

const title = document.querySelector<HTMLElement>('.p-title')!;
const loop = (): void => {
  title.style.setProperty('--beat', sample().beat.toFixed(3));
  requestAnimationFrame(loop);
};
requestAnimationFrame(loop);

mountNowPlaying();
void mountGate({
  kicker: id === 'acnd' ? 'For Arka Fashion Week ’26 — from ACND' : 'For Arka Fashion Week ’26 — from অপূর্ব',
  line: 'Sound on. This application comes with its own soundtrack.',
  cta: 'Open the application',
});
