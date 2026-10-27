import { asset } from './paths';

/** Native continuous playback: browsers buffer ahead and seek with byte ranges. */
export function attachStream(el: HTMLAudioElement, startAt: number): void {
  el.src = asset('audio/qbic-pulse.mp4');
  if (startAt > 0) {
    el.addEventListener('loadedmetadata', () => {
      // Preserve any newer track selection made while metadata was loading.
      if (el.currentTime === 0) el.currentTime = Math.min(startAt, el.duration - 0.5);
    }, { once: true });
  }
  el.load();
}
