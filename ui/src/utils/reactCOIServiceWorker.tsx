// reactCOIServiceWorker.tsx
export const loadCOIServiceWorker = async (): Promise<void> => {
  if (
    typeof window !== 'undefined' &&
    window.location.hostname !== 'localhost' &&
    !navigator.serviceWorker.controller
  ) {
    try {
      // Check if the script already exists
      if (!document.querySelector('script[src*="coi-serviceworker"]')) {
        const coi = window.document.createElement('script');
        
        // Make sure the path is correct for your deployment
        // If you're using basePath in next.config.js, include it here
        coi.setAttribute('src', '/silent-auction/coi-serviceworker.min.js');
        coi.setAttribute('type', 'text/javascript');
        
        // Add loading error handler
        coi.onerror = (error) => {
          console.error('COI ServiceWorker failed to load:', error);
        };

        // Add load success handler
        coi.onload = () => {
          console.log('COI ServiceWorker loaded successfully');
        };

        // Append the script to head
        window.document.head.appendChild(coi);

        // Wait for the service worker to be registered
        await new Promise((resolve) => {
          if (navigator.serviceWorker.controller) {
            resolve(true);
          } else {
            navigator.serviceWorker.addEventListener('controllerchange', () => {
              resolve(true);
            });
          }
        });
      }
    } catch (err) {
      console.warn('COI ServiceWorker failed to load:', err);
    }
  } else if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    console.log('Skipping COI ServiceWorker on localhost');
  }
};

// Add a function to check if COI is supported and enabled
export const isCOIEnabled = (): boolean => {
  return !!(
    typeof window !== 'undefined' &&
    window.crossOriginIsolated
  );
};
