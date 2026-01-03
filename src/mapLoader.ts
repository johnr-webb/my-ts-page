// This is the official "Dynamic Import" logic converted to TypeScript
const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
const CALLBACK_NAME = "gmap_callback";

let isLoaded = false;

export function loadGoogleMaps(): Promise<void> {
  if (isLoaded) return Promise.resolve();

  return new Promise((resolve, reject) => {
    // Check if script is already in the document
    if (document.querySelector('script[src*="maps.googleapis.com"]')) {
      isLoaded = true;
      resolve();
      return;
    }

    // Create the script tag
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&loading=async&callback=${CALLBACK_NAME}`;
    script.async = true;
    script.defer = true;
    script.onerror = () => reject(new Error("Failed to load Google Maps API"));

    // Define the callback that the script will call when finished
    (window as any)[CALLBACK_NAME] = () => {
      isLoaded = true;
      resolve();
      delete (window as any)[CALLBACK_NAME]; // Cleanup
    };

    document.head.appendChild(script);
  });
}
