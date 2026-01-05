// src/mapLogic.ts
import { loadGoogleMaps } from "./mapLoader";

let mapInstance: any = null;
let markerLibrary: any = null;

interface LocationData {
  position: { lat: number; lng: number };
  type: "walkup" | "highrise" | "work";
  address?: string;
  name: string;
}

const LOCATIONS: LocationData[] = [
  {
    position: { lat: 41.895293, lng: -87.628716 },
    type: "highrise",
    name: "1 Superior Place",
  },
  {
    position: { lat: 41.895985, lng: -87.628809 },
    type: "highrise",
    name: "1 Chicago",
  },
  {
    position: { lat: 41.894513, lng: -87.622876 },
    type: "work",
    name: "My workplace",
  },
];

const MARKERCONS = {
  walkup: "🏠",
  highrise: "🏢",
  work: "💼",
};

export async function addMarkerFromAddress(
  name: string,
  address: string,
  type: "walkup" | "highrise" | "work" = "walkup"
) {
  const geocoder = new google.maps.Geocoder();

  try {
    const result = await geocoder.geocode({ address });
    if (result.results[0]) {
      const { lat, lng } = result.results[0].geometry.location;
      const newLocation: LocationData = {
        type: type,
        position: { lat: lat(), lng: lng() },
        address: address,
        name: name,
      };

      LOCATIONS.push(newLocation);
      addMarkerToMap(newLocation);
    }
  } catch (e) {
    console.error("Geocoding failed:", e);
  }
}

function createMarkerContent(loc: LocationData): HTMLElement {
  const div = document.createElement("div");
  div.className = `marker ${loc.type}`;
  div.innerText = MARKERCONS[loc.type];
  div.addEventListener("click", () => console.log(`Clicked ${loc.name}`));
  return div;
}

async function addMarkerToMap(newLocation: LocationData) {
  if (!mapInstance || !markerLibrary) return;

  const { AdvancedMarkerElement } = markerLibrary;

  new AdvancedMarkerElement({
    map: mapInstance,
    position: newLocation.position,
    content: createMarkerContent(newLocation),
    title: newLocation.name,
  });
  fitMapToLocation(mapInstance);
}

const fitMapToLocation = (map: google.maps.Map) => {
  const bounds = new google.maps.LatLngBounds();

  // Extend the bounds to include each marker's position
  LOCATIONS.forEach((location) => {
    const position = location.position;
    if (position) {
      bounds.extend(position);
    }
  });

  // Adjust the map to fit the calculated bounds
  map.fitBounds(bounds, 50);
};

export async function initMap(elementId: string) {
  await loadGoogleMaps();

  // 2. Import the libraries you need dynamically
  const { Map } = (await google.maps.importLibrary(
    "maps"
  )) as google.maps.MapsLibrary;
  markerLibrary = await google.maps.importLibrary("marker");

  const mapElement = document.getElementById(elementId);
  if (!mapElement) return;

  mapInstance = new Map(mapElement, {
    center: { lat: 41.894513, lng: -87.622876 },
    zoom: 14,
    mapId: "HOUSE_HUNTER_MAP",
  });

  LOCATIONS.forEach((loc) => {
    addMarkerToMap(loc);
  });
}
