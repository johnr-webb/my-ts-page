// src/services/RentalListingService.ts

import type { ApiProvider } from '../types/ApiProvider';
import type { SearchCriteria, SearchResponse, RentalListing } from '../types/RentalListing';
import type { LocationItem } from './LocationsService';
import { RentSpiderProvider } from './providers/RentSpiderProvider';
import { LocationService } from './LocationsService';
import { UserService } from './UserService';

export class RentalListingService {
  private static instance: RentalListingService;
  private provider: ApiProvider | null = null;
  private lastSearch: SearchCriteria | null = null;
  private lastResults: RentalListing[] = [];
  private isInitialized: boolean = false;

  private constructor() {
    // Private constructor for singleton pattern
  }

  static getInstance(): RentalListingService {
    if (!this.instance) {
      this.instance = new RentalListingService();
    }
    return this.instance;
  }

  initialize(apiKey: string): void {
    if (!apiKey || apiKey.trim().length === 0) {
      throw new Error('API key is required to initialize RentalListingService');
    }

    try {
      this.provider = new RentSpiderProvider(apiKey);
      this.isInitialized = true;
      console.log('[RentalListingService] Successfully initialized with RentSpider provider');
    } catch (error) {
      console.error('[RentalListingService] Failed to initialize provider:', error);
      throw new Error(`Failed to initialize rental service: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async search(criteria: SearchCriteria): Promise<SearchResponse> {
    if (!this.isInitialized || !this.provider) {
      throw new Error('RentalListingService not initialized. Call initialize() first.');
    }

    try {
      // Validate criteria
      this.validateCriteria(criteria);
      
      console.log('[RentalListingService] Starting search with criteria:', criteria);
      
      // Dispatch search started event
      window.dispatchEvent(
        new CustomEvent('searchStarted', { 
          detail: { criteria } 
        })
      );

      // Perform the search
      const response = await this.provider.search(criteria);
      
      // Store results for map display and other components
      this.lastSearch = criteria;
      this.lastResults = response.listings;
      
      console.log(`[RentalListingService] Search completed: ${response.listings.length} listings found`);
      
      // Dispatch listings updated event
      window.dispatchEvent(
        new CustomEvent('listingsUpdated', { 
          detail: { 
            listings: response.listings, 
            criteria: criteria,
            totalResults: response.totalResults,
            hasMore: response.hasMore
          } 
        })
      );

      return response;

    } catch (error) {
      console.error('[RentalListingService] Search failed:', error);
      
      // Dispatch search error event
      window.dispatchEvent(
        new CustomEvent('searchError', { 
          detail: { 
            error: error instanceof Error ? error.message : 'Unknown search error',
            criteria 
          } 
        })
      );
      
      // Re-throw the error for the calling component to handle
      throw error;
    }
  }

  getLastResults(): RentalListing[] {
    return [...this.lastResults]; // Return a copy to prevent external modification
  }

  getLastSearch(): SearchCriteria | null {
    return this.lastSearch ? { ...this.lastSearch } : null; // Return a copy
  }

  async importListing(listing: RentalListing): Promise<void> {
    try {
      console.log(`[RentalListingService] Importing listing: ${listing.title}`);
      
      // Convert RentalListing to LocationItem format
      const locationItem: LocationItem = {
        id: `imported_${listing.id}`,
        userId: UserService.getProfile().id,
        name: listing.title,
        type: this.mapPropertyTypeToLocationService(listing.propertyType),
        position: {
          lat: listing.coordinates.lat,
          lng: listing.coordinates.lng
        }
      };

      // Add to LocationService
      LocationService.add(locationItem);
      
      console.log(`[RentalListingService] Successfully imported listing as location: ${locationItem.name}`);
      
      // Dispatch import success event
      window.dispatchEvent(
        new CustomEvent('listingImported', { 
          detail: { 
            listing, 
            locationItem,
            success: true 
          } 
        })
      );

    } catch (error) {
      console.error('[RentalListingService] Failed to import listing:', error);
      
      // Dispatch import error event
      window.dispatchEvent(
        new CustomEvent('listingImported', { 
          detail: { 
            listing, 
            success: false,
            error: error instanceof Error ? error.message : 'Unknown import error'
          } 
        })
      );
      
      throw error;
    }
  }

  async checkProviderAvailability(): Promise<boolean> {
    if (!this.isInitialized || !this.provider) {
      return false;
    }

    try {
      const isAvailable = await this.provider.isAvailable();
      console.log(`[RentalListingService] Provider availability: ${isAvailable}`);
      return isAvailable;
    } catch (error) {
      console.error('[RentalListingService] Failed to check provider availability:', error);
      return false;
    }
  }

  getProviderName(): string {
    return this.provider?.name || 'Unknown';
  }

  isServiceInitialized(): boolean {
    return this.isInitialized;
  }

  // Clear stored results (useful for cleanup)
  clearResults(): void {
    this.lastResults = [];
    this.lastSearch = null;
    console.log('[RentalListingService] Cleared stored results');
  }

  private validateCriteria(criteria: SearchCriteria): void {
    if (!criteria) {
      throw new Error('Search criteria is required');
    }

    if (!criteria.location || criteria.location.trim().length === 0) {
      throw new Error('Location is required for search');
    }

    if (criteria.location.trim().length < 2) {
      throw new Error('Location must be at least 2 characters long');
    }

    if (criteria.maxPrice !== undefined) {
      if (criteria.maxPrice < 0) {
        throw new Error('Maximum price must be positive');
      }
      if (criteria.maxPrice > 50000 * 100) { // $50,000 in cents
        throw new Error('Maximum price seems unreasonably high');
      }
    }

    if (criteria.minPrice !== undefined) {
      if (criteria.minPrice < 0) {
        throw new Error('Minimum price must be positive');
      }
      if (criteria.maxPrice !== undefined && criteria.minPrice > criteria.maxPrice) {
        throw new Error('Minimum price cannot be higher than maximum price');
      }
    }

    if (criteria.bedrooms !== undefined && criteria.bedrooms < 0) {
      throw new Error('Number of bedrooms must be non-negative');
    }

    if (criteria.bathrooms !== undefined && criteria.bathrooms < 0) {
      throw new Error('Number of bathrooms must be non-negative');
    }

    if (criteria.radius !== undefined) {
      if (criteria.radius < 0) {
        throw new Error('Search radius must be positive');
      }
      if (criteria.radius > 100) {
        throw new Error('Search radius cannot exceed 100 miles');
      }
    }
  }

  private mapPropertyTypeToLocationService(propertyType: string): string {
    // Map RentalListing property types to LocationService types
    switch (propertyType) {
      case 'apartment':
        return 'walkup'; // Use existing LocationService type
      case 'house':
        return 'walkup'; // Map to existing type
      case 'condo':
        return 'highrise'; // Use existing LocationService type
      case 'townhouse':
        return 'walkup'; // Map to existing type
      default:
        return 'walkup'; // Default fallback
    }
  }
}