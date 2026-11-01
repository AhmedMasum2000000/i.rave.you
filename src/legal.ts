import { trackOutbound, trackPage } from './analytics';

// Opened directly (not inside the site's frame), a legal page reports its own view.
trackPage();
trackOutbound();

const clear = document.querySelector<HTMLButtonElement>('#clear-player');
const status = document.querySelector<HTMLElement>('#storage-status');
clear?.addEventListener('click', () => {
  try {
    // Every key the player keeps starts with "iry:".
    for (const key of Object.keys(localStorage)) if (key.startsWith('iry:')) localStorage.removeItem(key);
    if (status) status.textContent = 'Saved player preferences cleared for this website address. Open players may save preferences again.';
  } catch {
    if (status) status.textContent = 'Browser storage is unavailable. You can manage saved site data through your browser settings.';
  }
});
