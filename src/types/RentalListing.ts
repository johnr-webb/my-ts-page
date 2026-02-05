// src/types/RentalListing.ts

export interface RentalListing {
  id: string;
  title: string;
  address: string;
  price: number; // Monthly rent in USD cents
  bedrooms: number;
  bathrooms: number;
  squareFeet?: number;
  description: string;
  imageUrl?: string;
  listingUrl: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  amenities: string[];
  propertyType: 'apartment' | 'house' | 'condo' | 'townhouse';
  datePosted: string; // ISO 8601 format
  source: string; // API provider name
}

export interface SearchCriteria {
  location: string; // address or zip code
  maxPrice?: number; // in USD cents
  minPrice?: number; // in USD cents
  bedrooms?: number;
  bathrooms?: number;
  propertyType?: string[];
  radius?: number; // miles from location
}

export interface SearchResponse {
  listings: RentalListing[];
  totalResults: number;
  hasMore: boolean;
  nextPage?: string;
}