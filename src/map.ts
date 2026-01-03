// src/mapLogic.ts
import { loadGoogleMaps } from "./mapLoader";

interface LocationData {
  position: { lat: number; lng: number };
  type: "walkup" | "highrise" | "work";
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

function createMarkerContent(loc: LocationData): HTMLElement {
  const div = document.createElement("div");
  div.className = `marker ${loc.type}`;
  div.innerText = MARKERCONS[loc.type];
  div.addEventListener("click", () => console.log(`Clicked ${loc.name}`));
  return div;
}

export async function initMap(elementId: string) {
  await loadGoogleMaps();

  // 2. Import the libraries you need dynamically
  const { Map } = (await google.maps.importLibrary(
    "maps"
  )) as google.maps.MapsLibrary;
  const { AdvancedMarkerElement } = (await google.maps.importLibrary(
    "marker"
  )) as google.maps.MarkerLibrary;

  const mapElement = document.getElementById(elementId);
  if (!mapElement) return;

  const map = new Map(mapElement, {
    center: { lat: 41.894513, lng: -87.622876 },
    zoom: 14,
    mapId: "DEMO_MAP_ID",
  });

  LOCATIONS.forEach((loc) => {
    new AdvancedMarkerElement({
      map,
      position: loc.position,
      content: createMarkerContent(loc),
      title: loc.name,
    });
  });
}
