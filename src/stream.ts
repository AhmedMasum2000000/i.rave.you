import { asset } from './paths';

/** Native continuous playback: browsers buffer ahead and seek with byte ranges. */
export function attachStream(el: HTMLAudioElement, startAt: number): void {
  el.src = asset(__MIX_FILE__);
  if (startAt > 0) {
    el.addEventListener('loadedmetadata', () => {
      // Preserve any newer track selection made while metadata was loading.
      if (el.currentTime === 0) el.currentTime = Math.min(startAt, el.duration - 0.5);
    }, { once: true });
  }
  el.load();
}
