import { UserServiceInstance } from "./UserService";
import type { EnhancedLocationItem, TravelTimes } from "../types/ComparisonTypes";

export interface TravelTimeResult {
  locationId: string;
  walking: { distance: number; duration: number; };
  driving: { distance: number; duration: number; };
  transit: { distance: number; duration: number; };
}

export interface BatchTravelTimeRequest {
  origins: string[];
  destinations: string[];
  mode: 'walking' | 'driving' | 'transit';
}

export interface GoogleDistanceMatrixResponse {
  rows: Array<{
    elements: Array<{
      status: string;
      distance?: { text: string; value: number; };
      duration?: { text: string; value: number; };
    }>;
  }>;
  status: string;
}

export class TravelTimeService {
  private static instance: TravelTimeService;
  private apiKey: string;
  private cache: Map<string, { data: TravelTimes; cached: number; }> = new Map();
  
  // Cache configuration
  private readonly CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
  private readonly MAX_CACHE_SIZE = 100;
  
  // API configuration
  private readonly BATCH_SIZE = 10;
  private readonly API_BASE_URL = 'https://maps.googleapis.com/maps/api/distancematrix/json';
  
  private constructor() {
    this.apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
    if (!this.apiKey) {
      console.warn('[TravelTimeService] Google Maps API key not found in environment variables');
    }
  }
  
  static getInstance(): TravelTimeService {
    if (!this.instance) {
      this.instance = new TravelTimeService();
    }
    return this.instance;
  }
  
  /**
   * Calculate travel times from work to a single location
   */
  async calculateTravelTimes(location: EnhancedLocationItem): Promise<TravelTimes | null> {
    const userProfile = UserServiceInstance.getProfile();
    if (!userProfile.workCoords) {
      console.warn('[TravelTimeService] Work address not set');
      return null;
    }
    
    const cacheKey = this.generateCacheKey(userProfile.workCoords, location.position, 'all');
    
    // Check cache first
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      return cached;
    }
    
    try {
      const origin = `${userProfile.workCoords.lat},${userProfile.workCoords.lng}`;
      const destination = `${location.position.lat},${location.position.lng}`;
      
      const modes = ['walking', 'driving', 'transit'] as const;
      const results = await Promise.allSettled(
        modes.map(mode => this.calculateSingleMode(origin, destination, mode))
      );
      
      const travelTimes: TravelTimes = {
        walking: { distance: 0, duration: 0 },
        driving: { distance: 0, duration: 0 },
        transit: { distance: 0, duration: 0 }
      };
      
      results.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value) {
          const mode = modes[index];
          travelTimes[mode] = result.value;
        } else if (result.status === 'rejected') {
          console.warn(`[TravelTimeService] Failed to calculate ${modes[index]} time:`, result.reason);
        }
      });
      
      // Cache the result
      this.setCache(cacheKey, travelTimes);
      
      return travelTimes;
      
    } catch (error) {
      console.error('[TravelTimeService] Error calculating travel times:', error);
      return null;
    }
  }
  
  /**
   * Calculate travel times for multiple locations in batches
   */
  async calculateBatchTravelTimes(locations: EnhancedLocationItem[]): Promise<TravelTimeResult[]> {
    const userProfile = UserServiceInstance.getProfile();
    if (!userProfile.workCoords) {
      console.warn('[TravelTimeService] Work address not set');
      return [];
    }
    
    const origin = `${userProfile.workCoords.lat},${userProfile.workCoords.lng}`;
    const destinations = locations.map(loc => `${loc.position.lat},${loc.position.lng}`);
    
    const results: TravelTimeResult[] = [];
    
    // Process in batches of up to 10 destinations per API call
    for (let i = 0; i < destinations.length; i += this.BATCH_SIZE) {
      const batchDestinations = destinations.slice(i, i + this.BATCH_SIZE);
      const batchLocations = locations.slice(i, i + this.BATCH_SIZE);
      
      try {
        const batchResults = await this.calculateBatch(origin, batchDestinations, 'walking');
        
        // Process walking results first
        for (let j = 0; j < batchLocations.length; j++) {
          const result: TravelTimeResult = {
            locationId: batchLocations[j].id,
            walking: { distance: 0, duration: 0 },
            driving: { distance: 0, duration: 0 },
            transit: { distance: 0, duration: 0 }
          };
          
          if (batchResults.status === 'OK' && batchResults.rows[0]?.elements[j]) {
            const element = batchResults.rows[0].elements[j];
            if (element.status === 'OK') {
              result.walking = {
                distance: element.distance?.value || 0,
                duration: Math.round((element.duration?.value || 0) / 60) // Convert to minutes
              };
            }
          }
          
          results.push(result);
        }
        
        // Calculate driving and transit times separately (to stay within rate limits)
        await this.addAdditionalModes(origin, batchDestinations, batchLocations, results, 'driving', i);
        await this.addAdditionalModes(origin, batchDestinations, batchLocations, results, 'transit', i);
        
        // Add delay between batches to respect rate limits
        if (i + this.BATCH_SIZE < destinations.length) {
          await this.delay(100); // 100ms delay between batches
        }
        
      } catch (error) {
        console.error(`[TravelTimeService] Batch ${i} failed:`, error);
        // Add empty results for failed batch
        batchLocations.forEach(loc => {
          results.push({
            locationId: loc.id,
            walking: { distance: 0, duration: 0 },
            driving: { distance: 0, duration: 0 },
            transit: { distance: 0, duration: 0 }
          });
        });
      }
    }
    
    return results;
  }
  
  /**
   * Check if service is available and configured
   */
  isServiceAvailable(): boolean {
    return !!this.apiKey;
  }
  
  /**
   * Clear all cached data
   */
  clearCache(): void {
    this.cache.clear();
  }
  
  /**
   * Clear expired cache entries
   */
  cleanupCache(): void {
    const now = Date.now();
    for (const [key, data] of this.cache.entries()) {
      if (data.cached && (now - data.cached) > this.CACHE_TTL) {
        this.cache.delete(key);
      }
    }
  }
  
  // Private helper methods
  
  private async calculateSingleMode(
    origin: string, 
    destination: string, 
    mode: 'walking' | 'driving' | 'transit'
  ): Promise<{ distance: number; duration: number; } | null> {
    try {
      const url = `${this.API_BASE_URL}?origins=${origin}&destinations=${destination}&mode=${mode}&key=${this.apiKey}`;
      
      const response = await fetch(url);
      const data: GoogleDistanceMatrixResponse = await response.json();
      
      if (data.status === 'OK' && data.rows[0]?.elements[0]) {
        const element = data.rows[0].elements[0];
        if (element.status === 'OK' && element.distance && element.duration) {
          return {
            distance: element.distance.value,
            duration: Math.round(element.duration.value / 60) // Convert to minutes
          };
        }
      }
      
      // Fallback to straight-line distance if API fails
      console.warn(`[TravelTimeService] API failed for ${mode}, using straight-line distance fallback`);
      return this.calculateStraightLineDistance(origin, destination, mode);
      
    } catch (error) {
      console.error(`[TravelTimeService] Single mode ${mode} calculation failed:`, error);
      // Fallback to straight-line distance on error
      return this.calculateStraightLineDistance(origin, destination, mode);
    }
  }
  
  private async calculateBatch(
    origin: string, 
    destinations: string[], 
    mode: 'walking' | 'driving' | 'transit'
  ): Promise<GoogleDistanceMatrixResponse> {
    const destinationsStr = destinations.join('|');
    const url = `${this.API_BASE_URL}?origins=${origin}&destinations=${destinationsStr}&mode=${mode}&key=${this.apiKey}`;
    
    const response = await fetch(url);
    return await response.json();
  }
  
  /**
   * Fallback method to calculate straight-line distance using Haversine formula
   * Used when Google Distance Matrix API fails
   */
  private calculateStraightLineDistance(
    origin: string, 
    destination: string, 
    mode: 'walking' | 'driving' | 'transit'
  ): { distance: number; duration: number; } | null {
    try {
      const [originLat, originLng] = origin.split(',').map(Number);
      const [destLat, destLng] = destination.split(',').map(Number);
      
      if (isNaN(originLat) || isNaN(originLng) || isNaN(destLat) || isNaN(destLng)) {
        return null;
      }
      
      // Haversine formula to calculate distance between two points
      const R = 6371000; // Earth's radius in meters
      const dLat = this.toRadians(destLat - originLat);
      const dLng = this.toRadians(destLng - originLng);
      
      const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(this.toRadians(originLat)) * Math.cos(this.toRadians(destLat)) *
                Math.sin(dLng / 2) * Math.sin(dLng / 2);
      
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distance = R * c; // Distance in meters
      
      // Estimate duration based on average speeds
      let avgSpeed: number; // meters per minute
      switch (mode) {
        case 'walking':
          avgSpeed = 80; // ~4.8 km/h = 80 m/min
          break;
        case 'driving':
          avgSpeed = 1000; // ~60 km/h = 1000 m/min (accounting for traffic)
          break;
        case 'transit':
          avgSpeed = 300; // ~18 km/h = 300 m/min (including stops/waiting)
          break;
        default:
          avgSpeed = 80;
      }
      
      const duration = Math.round(distance / avgSpeed);
      
      console.log(`[TravelTimeService] Fallback calculation: ${distance}m, ${duration}min for ${mode}`);
      
      return { distance, duration };
      
    } catch (error) {
      console.error('[TravelTimeService] Straight-line distance calculation failed:', error);
      return null;
    }
  }
  
  /**
   * Convert degrees to radians
   */
  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
  
  private async addAdditionalModes(
    origin: string,
    destinations: string[],
    locations: EnhancedLocationItem[],
    results: TravelTimeResult[],
    mode: 'driving' | 'transit',
    batchIndex: number
  ): Promise<void> {
    try {
      const modeResults = await this.calculateBatch(origin, destinations, mode);
      
      if (modeResults.status === 'OK') {
        for (let j = 0; j < locations.length; j++) {
          const resultIndex = batchIndex + j;
          if (results[resultIndex] && modeResults.rows[0]?.elements[j]) {
            const element = modeResults.rows[0].elements[j];
            if (element.status === 'OK') {
              results[resultIndex][mode] = {
                distance: element.distance?.value || 0,
                duration: Math.round((element.duration?.value || 0) / 60)
              };
            }
          }
        }
      }
    } catch (error) {
      console.error(`[TravelTimeService] ${mode} batch calculation failed:`, error);
    }
  }
  
  private generateCacheKey(workCoords: { lat: number; lng: number }, location: { lat: number; lng: number }, mode: string): string {
    return `${workCoords.lat},${workCoords.lng}_${location.lat},${location.lng}_${mode}`;
  }
  
  private getFromCache(key: string): TravelTimes | null {
    const cached = this.cache.get(key);
    if (cached && cached.cached) {
      const now = Date.now();
      if ((now - cached.cached) < this.CACHE_TTL) {
        return cached.data;
      }
    }
    return null;
  }
  
  private setCache(key: string, data: TravelTimes): void {
    // Implement LRU cache cleanup if size exceeds limit
    if (this.cache.size >= this.MAX_CACHE_SIZE) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }
    
    this.cache.set(key, {
      data,
      cached: Date.now()
    });
  }
  
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}