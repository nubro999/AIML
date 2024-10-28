export const loadCOIServiceWorker = (): void => {
  if (
    typeof window !== 'undefined' &&
    window.location.hostname !== 'localhost'
  ) {
    try {
      const coi = window.document.createElement('script');
      coi.setAttribute('src', '/silent-auction/coi-serviceworker.min.js');
      window.document.head.appendChild(coi);
    } catch (err) {
      console.warn('COI ServiceWorker failed to load', err);
    }
  }
};
