import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateFrequency,
  getHarmonics,
  calculateBinauralPair,
  bpmToMilliseconds,
  formatDuration,
  filterTracks,
  CONSCIOUSNESS_A4
} from './audioMath.ts';

test('calculateFrequency handles A4 reference and semitone steps', () => {
  // A4 at 432 Hz
  const a4 = calculateFrequency(0, CONSCIOUSNESS_A4);
  assert.equal(a4, 432);

  // 12 semitones up should be an octave (864 Hz)
  const a5 = calculateFrequency(12, CONSCIOUSNESS_A4);
  assert.equal(a5, 864);

  // 12 semitones down should be 216 Hz
  const a3 = calculateFrequency(-12, CONSCIOUSNESS_A4);
  assert.equal(a3, 216);
});

test('getHarmonics generates accurate harmonic series', () => {
  const harmonics = getHarmonics(108, 4);
  assert.deepEqual(harmonics, [108, 216, 324, 432]);

  // Edge cases
  assert.deepEqual(getHarmonics(0, 4), []);
  assert.deepEqual(getHarmonics(100, 0), []);
});

test('calculateBinauralPair correctly splits carrier frequency for theta wave', () => {
  // Carrier 216 Hz, Theta wave 6 Hz
  const pair = calculateBinauralPair(216, 6);
  assert.equal(pair.leftHz, 213);
  assert.equal(pair.rightHz, 219);
  assert.equal(pair.rightHz - pair.leftHz, 6);
});

test('bpmToMilliseconds converts tempos to rhythmic interval timings', () => {
  // 120 BPM quarter note = 500ms
  assert.equal(bpmToMilliseconds(120, 1), 500);

  // 120 BPM eighth note = 250ms
  assert.equal(bpmToMilliseconds(120, 0.5), 250);

  // 138 BPM (psytrance tempo)
  const ms138 = bpmToMilliseconds(138, 1);
  assert.equal(ms138, 434.78);
});

test('formatDuration formats seconds accurately to MM:SS', () => {
  assert.equal(formatDuration(0), '0:00');
  assert.equal(formatDuration(65), '1:05');
  assert.equal(formatDuration(242), '4:02');
  assert.equal(formatDuration(3600), '60:00');
});

test('filterTracks properly filters by category and search queries', () => {
  const sampleTracks = [
    {
      id: '1',
      title: 'Root',
      titleBengali: 'রুট',
      genre: 'Psychedelic Bass House',
      bpm: 126,
      category: 'psychedelic'
    },
    {
      id: '2',
      title: 'Cumilla Midnight',
      titleBengali: 'কুমিল্লা মিডনাইট',
      genre: 'Melodic Techno',
      bpm: 124,
      category: 'techno'
    },
    {
      id: '3',
      title: 'Frequency Matters',
      titleBengali: 'ফ্রিকোয়েন্সি ম্যাটার্স',
      genre: 'Ambient Soundscape',
      bpm: 90,
      category: 'ambient'
    },
    {
      id: '4',
      title: 'Depart | Lofi',
      artist: 'Euphonic',
      genre: 'Lofi Chill',
      bpm: 85,
      category: 'euphonic'
    }
  ];

  // Category filtering
  const technoOnly = filterTracks(sampleTracks, 'techno', '');
  assert.equal(technoOnly.length, 1);
  assert.equal(technoOnly[0].title, 'Cumilla Midnight');

  // Euphonic category filtering
  const euphonicOnly = filterTracks(sampleTracks, 'euphonic', '');
  assert.equal(euphonicOnly.length, 1);
  assert.equal(euphonicOnly[0].title, 'Depart | Lofi');

  // Search by English title
  const searchRoot = filterTracks(sampleTracks, 'all', 'root');
  assert.equal(searchRoot.length, 1);
  assert.equal(searchRoot[0].title, 'Root');

  // Search by artist name Euphonic
  const searchArtist = filterTracks(sampleTracks, 'all', 'euphonic');
  assert.equal(searchArtist.length, 1);
  assert.equal(searchArtist[0].title, 'Depart | Lofi');

  // Search by Bengali title
  const searchBengali = filterTracks(sampleTracks, 'all', 'কুমিল্লা');
  assert.equal(searchBengali.length, 1);
  assert.equal(searchBengali[0].title, 'Cumilla Midnight');

  // All tracks
  const all = filterTracks(sampleTracks, 'all', '');
  assert.equal(all.length, 4);
});

test('discography dataset passes full integrity, BPM, Key, and Genre verification', async () => {
  const { TRACKS } = await import('../data/discography.ts');
  assert.ok(TRACKS.length >= 35, 'Expected comprehensive catalog');

  const camelotPattern = /^(1[0-2]|[1-9])[AB]$|^(Multi-Key|In-Key Mix|Peak Mix)$/;

  for (const track of TRACKS) {
    // BPM verification
    assert.ok(typeof track.bpm === 'number' && track.bpm >= 70 && track.bpm <= 160, `Invalid BPM for ${track.id}: ${track.bpm}`);

    // Key verification
    assert.ok(typeof track.key === 'string' && track.key.trim().length > 0, `Missing key for ${track.id}`);

    // Camelot Key verification
    assert.ok(track.camelotKey, `Missing camelotKey for ${track.id}`);
    assert.match(track.camelotKey!, camelotPattern, `Invalid Camelot key code '${track.camelotKey}' for ${track.id}`);

    // Genre verification
    assert.ok(typeof track.genre === 'string' && track.genre.trim().length > 0, `Missing genre for ${track.id}`);

    // Production details verification
    assert.ok(typeof track.productionDetails === 'string' && track.productionDetails.trim().length > 10, `Missing production details for ${track.id}`);
  }

  // Spot-check specific corrected tracks
  const youMakeIt = TRACKS.find(t => t.id === 'you-make-it');
  assert.equal(youMakeIt?.bpm, 126);
  assert.equal(youMakeIt?.key, 'G Minor');
  assert.equal(youMakeIt?.camelotKey, '6A');

  const oneDay = TRACKS.find(t => t.id === 'euphonic-one-day');
  assert.equal(oneDay?.bpm, 128);
  assert.equal(oneDay?.key, 'Bb Minor');
  assert.equal(oneDay?.camelotKey, '3A');

  const nobody = TRACKS.find(t => t.id === 'euphonic-nobody');
  assert.equal(nobody?.bpm, 122);
  assert.equal(nobody?.key, 'G# Minor');
  assert.equal(nobody?.camelotKey, '1A');

  const meWithoutYou = TRACKS.find(t => t.id === 'euphonic-me-without-you');
  assert.equal(meWithoutYou?.bpm, 128);
  assert.equal(meWithoutYou?.key, 'B Major');
  assert.equal(meWithoutYou?.camelotKey, '1B');

  const theFall = TRACKS.find(t => t.id === 'euphonic-the-fall-remix');
  assert.equal(theFall?.bpm, 126);
  assert.equal(theFall?.key, 'C Minor');
  assert.equal(theFall?.camelotKey, '5A');
});
