export function setupLoad(mapsScript: HTMLScriptElement) {
  // Wait for Google Maps API to load
  mapsScript.addEventListener("load", () => {
    const map = new (window as any).google.maps.Map(
      document.getElementById("map"),
      {
        zoom: 12,
        center: { lat: 41.9118, lng: -87.623177 },
      }
    );
  });
}
