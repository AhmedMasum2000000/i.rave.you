/**
 * Audio math and frequency calculation utilities for অপূর্ব (Apurba) sound engine.
 * Pure decoupled functions for harmonic series, binaural tuning, and time conversion.
 */

// A4 reference standard
export const STANDARD_A4 = 440;
export const CONSCIOUSNESS_A4 = 432;
export const SOLFEGGIO_LOVE = 528;

/**
 * Calculates note frequency based on semitone offset from A4.
 */
export function calculateFrequency(semitonesFromA4: number, baseA4 = CONSCIOUSNESS_A4): number {
  return Number((baseA4 * Math.pow(2, semitonesFromA4 / 12)).toFixed(2));
}

/**
 * Returns harmonic overtones for a given fundamental frequency.
 */
export function getHarmonics(fundamental: number, count = 4): number[] {
  if (fundamental <= 0 || count <= 0) return [];
  const harmonics: number[] = [];
  for (let i = 1; i <= count; i++) {
    harmonics.push(Number((fundamental * i).toFixed(2)));
  }
  return harmonics;
}

/**
 * Calculates binaural carrier and offset frequencies for target brainwave state.
 * e.g., Theta wave (4-8 Hz) for meditative/hypnotic states.
 */
export function calculateBinauralPair(carrierFreq: number, targetWaveHz: number): { leftHz: number; rightHz: number } {
  const leftHz = Number((carrierFreq - targetWaveHz / 2).toFixed(2));
  const rightHz = Number((carrierFreq + targetWaveHz / 2).toFixed(2));
  return { leftHz, rightHz };
}

/**
 * Converts BPM to interval in milliseconds for a specified note division.
 * 1 = quarter note, 0.5 = eighth note, 0.25 = sixteenth note.
 */
export function bpmToMilliseconds(bpm: number, beatDivision = 1): number {
  if (bpm <= 0) return 500;
  return Number(((60000 / bpm) * beatDivision).toFixed(2));
}

/**
 * Formats seconds into MM:SS display format.
 */
export function formatDuration(seconds: number): string {
  if (!seconds || isNaN(seconds) || seconds < 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

/**
 * Filters tracks based on category/genre filter and search term.
 */
export interface FilterableTrack {
  id: string;
  title: string;
  titleBengali?: string;
  artist?: string;
  genre: string;
  bpm: number;
  category: string;
}

export function filterTracks<T extends FilterableTrack>(
  tracks: T[],
  selectedCategory: string,
  searchQuery: string
): T[] {
  const query = searchQuery.trim().toLowerCase();
  return tracks.filter((track) => {
    const matchesCategory =
      selectedCategory === 'all' ||
      track.category.toLowerCase() === selectedCategory.toLowerCase();

    const matchesSearch =
      query === '' ||
      track.title.toLowerCase().includes(query) ||
      (track.titleBengali && track.titleBengali.includes(query)) ||
      (track.artist && track.artist.toLowerCase().includes(query)) ||
      track.genre.toLowerCase().includes(query);

    return matchesCategory && matchesSearch;
  });
}
