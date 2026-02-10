import { LocationServiceInstance } from "./LocationsService";
import type { EnhancedLocationItem } from "../types/ComparisonTypes";
import { TravelTimeService } from "./TravelTimeService";
import { TravelTimeCache } from "./TravelTimeCache";
import { UserServiceInstance } from "./UserService";

export class TravelTimeIntegration {
  private static instance: TravelTimeIntegration;
  private isInitialized: boolean = false;

  
  private constructor() {
    this.setupEventListeners();
  }
  
  static getInstance(): TravelTimeIntegration {
    if (!this.instance) {
      this.instance = new TravelTimeIntegration();
    }
    return this.instance;
  }
  
  /**
   * Initialize the integration service
   */
  initialize(): void {
    if (this.isInitialized) {
      return;
    }
    
    // Trigger initial calculation for existing locations
    this.calculateForExistingLocations();
    this.isInitialized = true;
  }
  
  /**
   * Setup event listeners for automatic travel time updates
   */
  private setupEventListeners(): void {
    // Listen for new locations being added
    window.addEventListener('locationsUpdated', (event) => {
      const locations = (event as CustomEvent).detail as EnhancedLocationItem[];
      
      // Filter for new locations that don't have travel times
      const newLocations = locations.filter(loc => 
        !loc.travelTimes || 
        !this.hasValidTravelTimes(loc.travelTimes)
      );
      
      if (newLocations.length > 0) {
        this.calculateTravelTimes(newLocations);
      }
    });
    
    // Listen for work address changes
    window.addEventListener('userUpdated', () => {
      this.onWorkAddressChanged();
    });
    
    // Listen for travel time calculation requests
    window.addEventListener('calculateTravelTimes', (event) => {
      const locationIds = (event as CustomEvent).detail as string[];
      this.calculateForSpecificLocations(locationIds);
    });
    
    // Listen for cache clear requests
    window.addEventListener('clearTravelTimeCache', () => {
      this.clearAllCache();
    });
  }
  
  /**
   * Calculate travel times for new locations
   */
  private async calculateTravelTimes(locations: EnhancedLocationItem[]): Promise<void> {
    const travelTimeService = TravelTimeService.getInstance();
    
    if (!travelTimeService.isServiceAvailable()) {
      console.warn('[TravelTimeIntegration] Travel time service not available');
      return;
    }
    
    try {
      // Show loading state
      this.dispatchCalculationStarted(locations);
      
      // Calculate in batches to respect API limits
      const results = await travelTimeService.calculateBatchTravelTimes(locations);
      
      // Update locations with travel times
      this.updateLocationsWithTravelTimes(results);
      
      // Cache the results
      const cache = TravelTimeCache.getInstance();
      locations.forEach(location => {
        const result = results.find(r => r.locationId === location.id);
        if (result) {
          const travelTimes = {
            walking: result.walking,
            driving: result.driving,
            transit: result.transit
          };
          cache.set(location, travelTimes);
        }
      });
      
      // Dispatch completion event
      this.dispatchCalculationCompleted(locations, results);
      
    } catch (error) {
      console.error('[TravelTimeIntegration] Failed to calculate travel times:', error);
      this.dispatchCalculationError(locations, error);
    }
  }
  
  /**
   * Calculate travel times when work address changes
   */
  private async onWorkAddressChanged(): Promise<void> {
    const userProfile = UserServiceInstance.getProfile();
    if (!userProfile.workCoords) {
      return;
    }
    
    console.log('[TravelTimeIntegration] Work address changed, recalculating travel times');
    
    // Clear existing cache for old work address
    const cache = TravelTimeCache.getInstance();
    cache.invalidateByWorkAddress(userProfile.workCoords);
    
    // Recalculate for all existing locations
    const currentLocations = LocationServiceInstance.getCurrent() as EnhancedLocationItem[];
    if (currentLocations.length > 0) {
      await this.calculateTravelTimes(currentLocations);
    }
  }
  
  /**
   * Calculate travel times for existing locations on initialization
   */
  private async calculateForExistingLocations(): Promise<void> {
    const currentLocations = LocationServiceInstance.getCurrent() as EnhancedLocationItem[];
    const locationsWithoutTimes = currentLocations.filter(loc => 
      !loc.travelTimes || !this.hasValidTravelTimes(loc.travelTimes)
    );
    
    if (locationsWithoutTimes.length > 0) {
      await this.calculateTravelTimes(locationsWithoutTimes);
    }
  }
  
  /**
   * Calculate travel times for specific location IDs
   */
  private async calculateForSpecificLocations(locationIds: string[]): Promise<void> {
    const allLocations = LocationServiceInstance.getCurrent() as EnhancedLocationItem[];
    const targetLocations = allLocations.filter(loc => locationIds.includes(loc.id));
    
    if (targetLocations.length > 0) {
      await this.calculateTravelTimes(targetLocations);
    }
  }
  
  /**
   * Update locations in LocationService with calculated travel times
   */
  private updateLocationsWithTravelTimes(results: { locationId: string; walking: any; driving: any; transit: any }[]): void {
    results.forEach(result => {
      const travelTimes = {
        walking: result.walking,
        driving: result.driving,
        transit: result.transit
      };
      
      // Update the location with travel times
      LocationServiceInstance.patch(result.locationId, {
        travelTimes
      });
    });
  }
  
  /**
   * Check if travel times are valid (non-zero)
   */
  private hasValidTravelTimes(travelTimes: { walking?: { duration: number }; driving?: { duration: number }; transit?: { duration: number } }): boolean {
    if (!travelTimes) {
      return false;
    }
    
    return (travelTimes.walking?.duration ?? 0) > 0 || 
           (travelTimes.driving?.duration ?? 0) > 0 || 
           (travelTimes.transit?.duration ?? 0) > 0;
  }
  
  /**
   * Clear all travel time cache
   */
  private clearAllCache(): void {
    const cache = TravelTimeCache.getInstance();
    cache.clear();
    
    // Clear travel times from all locations
    const currentLocations = LocationServiceInstance.getCurrent() as EnhancedLocationItem[];
    currentLocations.forEach(location => {
      if (location.travelTimes) {
        LocationServiceInstance.patch(location.id, { travelTimes: undefined });
      }
    });
    
    console.log('[TravelTimeIntegration] Cleared all travel time cache');
  }
  
  /**
   * Dispatch calculation started event
   */
  private dispatchCalculationStarted(locations: EnhancedLocationItem[]): void {
    window.dispatchEvent(new CustomEvent('travelTimeCalculationStarted', {
      detail: {
        locationIds: locations.map(loc => loc.id),
        count: locations.length,
        timestamp: Date.now()
      }
    }));
  }
  
  /**
   * Dispatch calculation completed event
   */
  private dispatchCalculationCompleted(locations: EnhancedLocationItem[], results: { locationId: string; walking: any; driving: any; transit: any }[]): void {
    window.dispatchEvent(new CustomEvent('travelTimeCalculationCompleted', {
      detail: {
        locationIds: locations.map(loc => loc.id),
        results,
        count: locations.length,
        timestamp: Date.now()
      }
    }));
  }
  
  /**
   * Dispatch calculation error event
   */
  private dispatchCalculationError(locations: EnhancedLocationItem[], error: any): void {
    window.dispatchEvent(new CustomEvent('travelTimeCalculationError', {
      detail: {
        locationIds: locations.map(loc => loc.id),
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: Date.now()
      }
    }));
  }
}