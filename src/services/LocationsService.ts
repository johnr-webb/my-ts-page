// services/LocationService.ts
import { BaseService } from '../base/BaseService';
import { UserServiceInstance } from "./UserService";
import type { EnhancedLocationItem } from '../types/ComparisonTypes';


export interface LocationItem {
  id: string;
  userId: string;
  name: string;
  type: string;
  position: {
    lat: number;
    lng: number;
  };
}

export const MARKERCONS = {
  walkup: "🏠",
  highrise: "🏢",
  work: "💼",
};

export class LocationService extends BaseService {
  private static instance: LocationService;
  private allLocations: LocationItem[] = [];

  private constructor() {
    super();
  }

  static getInstance(): LocationService {
    if (!LocationService.instance) {
      LocationService.instance = new LocationService();
    }
    return LocationService.instance;
  }

  async fetchAll(): Promise<LocationItem[]> {
    try {
      const baseUrl = new URL(import.meta.env.BASE_URL, window.location.origin);
      const dataUrl = new URL("data/locations.json", baseUrl);

      const response = await fetch(dataUrl.href);
      this.allLocations = await response.json();
      this.notify();
      return this.allLocations;
    } catch (error) {
      this.handleError(error, 'fetchAll');
      return [];
    }
  }

  async addByAddress(name: string, address: string, type: string = "walkup"): Promise<void> {
    const geocoder = new google.maps.Geocoder();

    try {
      const result = await geocoder.geocode({ address });

      if (result.results && result.results[0]) {
        const location = result.results[0].geometry.location;
        const user = UserServiceInstance.getProfile();
        const newLocation: LocationItem = {
          id: crypto.randomUUID(),
          userId: user.id,
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
    } catch (error) {
      this.handleError(error, 'addByAddress');
      alert("Error connecting to Google Geocoding service.");
    }
  }

  add(loc: LocationItem): void {
    this.allLocations.push(loc);
    this.notify();
  }

  patch(id: string, updatedFields: Partial<LocationItem> | Partial<EnhancedLocationItem>): void {
    this.allLocations = this.allLocations.map((loc) =>
      loc.id === id ? { ...loc, ...updatedFields } : loc
    );
    this.notify();
  }

  remove(id: string): void {
    this.allLocations = this.allLocations.filter((loc) => loc.id !== id);
    this.notify();
  }

  getCurrent(): LocationItem[] {
    const user = UserServiceInstance.getProfile();
    return this.allLocations.filter((loc) => loc.userId === user.id);
  }

  getAll(): LocationItem[] {
    return [...this.allLocations];
  }

  private notify(): void {
    this.dispatchEvent('locationsUpdated', this.allLocations);
  }
}

// Export singleton instance for backward compatibility
export const LocationServiceInstance = LocationService.getInstance();

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
