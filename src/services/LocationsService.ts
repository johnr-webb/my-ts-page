// services/LocationService.ts
export interface LocationItem {
  id: string;
  name: string;
  type: string;
  position: {
    lat: number;
    lng: number;
  };
}

let locations: LocationItem[] = [];

export const MARKERCONS = {
  walkup: "🏠",
  highrise: "🏢",
  work: "💼",
};

export const LocationService = {
  async fetchAll() {
    const baseUrl = new URL(import.meta.env.BASE_URL, window.location.origin);
    const dataUrl = new URL("data/locations.json", baseUrl);

    const response = await fetch(dataUrl.href);
    locations = await response.json();
    this.notify();
    return locations;
  },

  async addByAddress(name: string, address: string, type: string = "walkup") {
    const geocoder = new google.maps.Geocoder();

    try {
      const result = await geocoder.geocode({ address });

      if (result.results && result.results[0]) {
        const location = result.results[0].geometry.location;

        const newLocation: LocationItem = {
          id: crypto.randomUUID(),
          name: name,
          position: {
            lat: location.lat(),
            lng: location.lng(),
          },
          type: type,
        };
        this.add(newLocation);
      } else {
        alert("Location not found. Try a more specific address.");
      }
    } catch (e) {
      console.error("Geocoding failed:", e);
      alert("Error connecting to Google Geocoding service.");
    }
  },

  add(loc: LocationItem) {
    locations.push(loc);
    // Save to localStorage or DB here
    this.notify();
  },

  patch(id: string, updatedFields: Partial<LocationItem>) {
    locations = locations.map((loc) =>
      loc.id === id ? { ...loc, ...updatedFields } : loc
    );
    this.notify();
  },

  remove(id: string) {
    locations = locations.filter((loc) => loc.id !== id);
    this.notify();
  },

  notify() {
    window.dispatchEvent(
      new CustomEvent("locationsUpdated", { detail: locations })
    );
  },

  getCurrent() {
    return locations;
  },
};

/*
async function fetchLocations(): Promise<LocationItem[]> {
  // 1. Check if we have modified data in LocalStorage first
  const saved = localStorage.getItem("my_locations");
  if (saved) return JSON.parse(saved);

  // 2. If not, fetch the "Seed" data from your file
  const response = await fetch("./data/locations.json");
  const initialData = await response.json();

  // Save it to LocalStorage so we have a working copy
  localStorage.setItem("my_locations", JSON.stringify(initialData));
  return initialData;
}

async function saveNewLocation(newLoc: LocationItem) {
  // Mimic a database POST
  const current = await fetchLocations();
  current.push(newLoc);

  // "Commit" to our local database
  localStorage.setItem("my_locations", JSON.stringify(current));

  // Tell the Event Bus to update the UI
  window.dispatchEvent(
    new CustomEvent("locationsUpdated", { detail: current })
  );
}
*/
