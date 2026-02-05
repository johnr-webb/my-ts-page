// src/services/providers/RentSpiderProvider.ts

import type { ApiProvider, ApiConfig } from '../../types/ApiProvider';
import type { SearchCriteria, SearchResponse, RentalListing } from '../../types/RentalListing';
import { HttpClient, ApiError } from '../HttpClient';

// RentSpider API response interfaces
interface RentSpiderListing {
  id: string;
  name?: string;
  full_address: string;
  rent_amount: number;
  bedrooms: number;
  bathrooms: number;
  square_feet?: number;
  description: string;
  photos?: Array<{ url: string }>;
  listing_url: string;
  latitude: number;
  longitude: number;
  amenities?: string[];
  property_type: string;
  created_at: string;
}

interface RentSpiderResponse {
  listings: RentSpiderListing[];
  total_count: number;
  has_more: boolean;
  next_page_token?: string;
}

export class RentSpiderProvider implements ApiProvider {
  name = 'RentSpider';
  private config: ApiConfig;

  constructor(apiKey: string) {
    this.config = {
      baseUrl: 'https://api.rentspider.com/v2/',
      apiKey,
      rateLimit: { 
        requestsPerMinute: 60, 
        requestsPerDay: 1000 
      }
    };
  }

  async search(criteria: SearchCriteria): Promise<SearchResponse> {
    try {
      this.validateCriteria(criteria);
      
      const searchParams = this.buildSearchParams(criteria);
      const url = `${this.config.baseUrl}listings/search`;
      
      console.log(`[RentSpider] Searching with criteria:`, criteria);
      
      const apiResponse: RentSpiderResponse = await HttpClient.post(
        url,
        searchParams,
        {
          'Authorization': `Bearer ${this.config.apiKey}`
        }
      );

      const transformedListings = apiResponse.listings
        .map(listing => this.transformListing(listing))
        .filter(listing => listing !== null) as RentalListing[];

      const searchResponse: SearchResponse = {
        listings: transformedListings,
        totalResults: apiResponse.total_count,
        hasMore: apiResponse.has_more,
        nextPage: apiResponse.next_page_token
      };

      console.log(`[RentSpider] Found ${transformedListings.length} listings`);
      return searchResponse;

    } catch (error) {
      console.error('[RentSpider] Search failed:', error);
      
      if (error instanceof ApiError) {
        // Re-throw with provider context
        throw new ApiError(error.message, error.status, this.name);
      }
      
      throw new ApiError(
        `Failed to search RentSpider: ${error instanceof Error ? error.message : 'Unknown error'}`,
        0,
        this.name
      );
    }
  }

  async isAvailable(): Promise<boolean> {
    try {
      const url = `${this.config.baseUrl}health`;
      return await HttpClient.head(url, {
        'Authorization': `Bearer ${this.config.apiKey}`
      });
    } catch (error) {
      console.error('[RentSpider] Availability check failed:', error);
      return false;
    }
  }

  private validateCriteria(criteria: SearchCriteria): void {
    if (!criteria.location || criteria.location.trim().length === 0) {
      throw new Error('Location is required for search');
    }

    if (criteria.maxPrice && criteria.maxPrice < 0) {
      throw new Error('Max price must be positive');
    }

    if (criteria.minPrice && criteria.minPrice < 0) {
      throw new Error('Min price must be positive');
    }

    if (criteria.bedrooms && criteria.bedrooms < 0) {
      throw new Error('Bedrooms must be non-negative');
    }

    if (criteria.bathrooms && criteria.bathrooms < 0) {
      throw new Error('Bathrooms must be non-negative');
    }
  }

  private buildSearchParams(criteria: SearchCriteria): any {
    const params: any = {
      location: criteria.location.trim(),
      limit: 50 // Default result limit
    };

    if (criteria.maxPrice) {
      params.max_rent = Math.floor(criteria.maxPrice / 100); // Convert cents to dollars
    }

    if (criteria.minPrice) {
      params.min_rent = Math.floor(criteria.minPrice / 100); // Convert cents to dollars
    }

    if (criteria.bedrooms !== undefined) {
      params.bedrooms = criteria.bedrooms;
    }

    if (criteria.bathrooms !== undefined) {
      params.bathrooms = criteria.bathrooms;
    }

    if (criteria.propertyType && criteria.propertyType.length > 0) {
      params.property_types = criteria.propertyType;
    }

    if (criteria.radius) {
      params.radius_miles = criteria.radius;
    }

    return params;
  }

  private transformListing(apiListing: RentSpiderListing): RentalListing | null {
    try {
      // Validate required fields
      if (!apiListing.id || !apiListing.full_address || !apiListing.listing_url) {
        console.warn('[RentSpider] Skipping listing with missing required fields:', apiListing.id);
        return null;
      }

      if (!apiListing.latitude || !apiListing.longitude) {
        console.warn('[RentSpider] Skipping listing without coordinates:', apiListing.id);
        return null;
      }

      const listing: RentalListing = {
        id: `rentspider_${apiListing.id}`,
        title: apiListing.name || `${apiListing.bedrooms}BR ${this.mapPropertyType(apiListing.property_type)}`,
        address: apiListing.full_address,
        price: Math.round(apiListing.rent_amount * 100), // Convert dollars to cents
        bedrooms: apiListing.bedrooms || 0,
        bathrooms: apiListing.bathrooms || 0,
        squareFeet: apiListing.square_feet,
        description: apiListing.description || '',
        imageUrl: apiListing.photos && apiListing.photos.length > 0 
          ? apiListing.photos[0].url 
          : undefined,
        listingUrl: apiListing.listing_url,
        coordinates: {
          lat: apiListing.latitude,
          lng: apiListing.longitude
        },
        amenities: apiListing.amenities || [],
        propertyType: this.mapPropertyType(apiListing.property_type),
        datePosted: apiListing.created_at || new Date().toISOString(),
        source: 'RentSpider'
      };

      return listing;
    } catch (error) {
      console.warn('[RentSpider] Failed to transform listing:', apiListing.id, error);
      return null;
    }
  }

  private mapPropertyType(apiType: string): 'apartment' | 'house' | 'condo' | 'townhouse' {
    const type = apiType.toLowerCase();
    
    switch (type) {
      case 'apartment':
      case 'apt':
      case 'flat':
        return 'apartment';
      case 'house':
      case 'single-family':
      case 'single_family':
        return 'house';
      case 'condo':
      case 'condominium':
        return 'condo';
      case 'townhouse':
      case 'townhome':
      case 'town_house':
        return 'townhouse';
      default:
        return 'apartment'; // Default fallback
    }
  }
}