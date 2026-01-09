// src/components/MapView.ts
import { loadGoogleMaps } from "./../services/GoogleMapsService";
import {
  type LocationItem,
  LocationService,
  MARKERCONS,
} from "../services/LocationsService";

let mapInstance: any = null;
let markerLibrary: any = null;
let currentMarkers: any[] = [];

export async function renderMap(mapElement: HTMLElement) {
  try {
    await loadGoogleMaps();

    // Import map and marker libraries
    const { Map } = (await google.maps.importLibrary(
      "maps"
    )) as google.maps.MapsLibrary;
    markerLibrary = await google.maps.importLibrary("marker");
    // Initialize map element
    mapInstance = new Map(mapElement, {
      center: { lat: 41.894513, lng: -87.622876 },
      zoom: 14,
      mapId: "HOUSE_HUNTER_MAP",
    });

    const handleUpdate = (e: Event) => {
      const locations = (e as CustomEvent<LocationItem[]>).detail;
      updateMarkers(locations);
    };

    window.addEventListener("locationsUpdated", handleUpdate);

    const currentData = LocationService.getCurrent();
    if (currentData.length > 0) {
      updateMarkers(currentData);
    }
  } catch (error) {
    console.error("Map failed to load:", error);
  }
}

/**
 * Clears old markers and draws new ones
 */
function updateMarkers(locations: LocationItem[]) {
  if (!mapInstance || !markerLibrary) return;

  // Clear existing markers from the map
  currentMarkers.forEach((m) => (m.map = null));
  currentMarkers = [];

  const { AdvancedMarkerElement } = markerLibrary;
  const bounds = new google.maps.LatLngBounds();

  locations.forEach((loc) => {
    const position = { lat: loc.position.lat, lng: loc.position.lng };

    const marker = new AdvancedMarkerElement({
      map: mapInstance,
      position: position,
      title: loc.name,
      content: createMarkerContent(loc),
    });

    currentMarkers.push(marker);
    bounds.extend(position);
  });

  // Fit map to markers if we have any
  if (locations.length > 0) {
    mapInstance.fitBounds(bounds, 50);
  }
}

function createMarkerContent(loc: LocationItem): HTMLElement {
  const div = document.createElement("div");
  div.className = `marker ${loc.type}`;
  const key = loc.type as keyof typeof MARKERCONS;
  div.innerText = MARKERCONS[key];

  div.addEventListener("click", () => {
    console.log(`Clicked ${loc.name}`);
    // You could trigger a custom event here to highlight the Table row!
  });

  return div;
}
// async function addMarkerFromAddress(
//   name: string,
//   address: string,
//   type: "walkup" | "highrise" | "work" = "walkup"
// ) {
//   const geocoder = new google.maps.Geocoder();

//   try {
//     const result = await geocoder.geocode({ address });
//     if (result.results[0]) {
//       const { lat, lng } = result.results[0].geometry.location;
//       const newLocation: LocationData = {
//         type: type,
//         position: { lat: lat(), lng: lng() },
//         address: address,
//         name: name,
//       };

//       LOCATIONS.push(newLocation);
//       addMarkerToMap(newLocation);
//     }
//   } catch (e) {
//     console.error("Geocoding failed:", e);
//   }
// }

// function createMarkerContent(loc: LocationData): HTMLElement {
//   const div = document.createElement("div");
//   div.className = `marker ${loc.type}`;
//   div.innerText = MARKERCONS[loc.type];
//   div.addEventListener("click", () => console.log(`Clicked ${loc.name}`));
//   return div;
// }

// async function addMarkerToMap(newLocation: LocationData) {
//   if (!mapInstance || !markerLibrary) return;

//   const { AdvancedMarkerElement } = markerLibrary;

//   new AdvancedMarkerElement({
//     map: mapInstance,
//     position: newLocation.position,
//     content: createMarkerContent(newLocation),
//     title: newLocation.name,
//   });
//   fitMapToLocation(mapInstance);
// }

// const fitMapToLocation = (map: google.maps.Map) => {
//   const bounds = new google.maps.LatLngBounds();

//   // Extend the bounds to include each marker's position
//   LOCATIONS.forEach((location) => {
//     const position = location.position;
//     if (position) {
//       bounds.extend(position);
//     }
//   });

//   // Adjust the map to fit the calculated bounds
//   map.fitBounds(bounds, 50);
// };
