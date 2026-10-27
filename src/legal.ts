export {};

const clear = document.querySelector<HTMLButtonElement>('#clear-player');
const status = document.querySelector<HTMLElement>('#storage-status');
clear?.addEventListener('click', () => {
  try {
    localStorage.removeItem('iry:mix-pos');
    localStorage.removeItem('iry:tid-seen');
    if (status) status.textContent = 'Saved player preferences cleared for this website address. Open players may save preferences again.';
  } catch {
    if (status) status.textContent = 'Browser storage is unavailable. You can manage saved site data through your browser settings.';
  }
});
