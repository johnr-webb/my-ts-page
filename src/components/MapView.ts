import { BaseComponent } from '../base/BaseComponent';
import { loadGoogleMaps } from "./../services/GoogleMapsService";
import {
  type LocationItem,
  LocationServiceInstance,
  MARKERCONS,
} from "../services/LocationsService";

export class MapView extends BaseComponent {
  private mapInstance: google.maps.Map | null = null;
  private markerLibrary: any = null; // Will be typed when Google Maps types are properly imported
  private currentMarkers: google.maps.marker.AdvancedMarkerElement[] = [];

  protected render(): void {
    this.renderMapContent();
  }

  protected setupEventListeners(): void {
    super.setupEventListeners();
    this.addEventListener(window, 'locationsUpdated', this.handleLocationUpdate);
  }

  private async renderMapContent(): Promise<void> {
    const mapElement = this.element;
    
    try {
      await loadGoogleMaps();

      const { Map } = (await google.maps.importLibrary("maps")) as google.maps.MapsLibrary;
      this.markerLibrary = await google.maps.importLibrary("marker");
      
      this.mapInstance = new Map(mapElement, {
        center: { lat: 41.894513, lng: -87.622876 },
        zoom: 14,
        mapId: "HOUSE_HUNTER_MAP",
      });

      const currentData = LocationServiceInstance.getCurrent();
      if (currentData.length > 0) {
        this.updateMarkers(currentData);
      }
    } catch (error) {
      console.error("Map failed to load:", error);
      this.element.innerHTML = '<div class="error">Failed to load map. Please try refreshing the page.</div>';
    }
  }

  private handleLocationUpdate = (e: Event): void => {
    const locations = (e as CustomEvent<LocationItem[]>).detail;
    this.updateMarkers(locations);
  };

  private updateMarkers(locations: LocationItem[]): void {
    if (!this.mapInstance || !this.markerLibrary) return;

    this.currentMarkers.forEach((m) => (m.map = null));
    this.currentMarkers = [];

    const { AdvancedMarkerElement } = this.markerLibrary;
    const bounds = new google.maps.LatLngBounds();

    locations.forEach((loc) => {
      const position = { lat: loc.position.lat, lng: loc.position.lng };

      const marker = new AdvancedMarkerElement({
        map: this.mapInstance,
        position: position,
        title: loc.name,
        content: this.createMarkerContent(loc),
      });

      this.currentMarkers.push(marker);
      bounds.extend(position);
    });

    if (locations.length > 0) {
      this.mapInstance.fitBounds(bounds, 50);
    }
  }

  private createMarkerContent(loc: LocationItem): HTMLElement {
    const div = document.createElement("div");
    div.className = `marker ${loc.type}`;
    const key = loc.type as keyof typeof MARKERCONS;
    div.innerText = MARKERCONS[key];

    div.addEventListener("click", () => {
      console.log(`Clicked ${loc.name}`);
      this.dispatchEvent('locationMarkerClicked', { location: loc });
    });

    return div;
  }

  public destroy(): void {
    this.currentMarkers.forEach((m) => (m.map = null));
    this.currentMarkers = [];
    super.destroy();
  }
}

// Export factory function for backward compatibility
export function renderMap(mapElement: HTMLElement): void {
  const mapView = new MapView(mapElement);
  mapView.init();
  (mapElement as any).cleanup = () => mapView.destroy();
}