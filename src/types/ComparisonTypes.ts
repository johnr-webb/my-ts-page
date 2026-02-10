/**
 * Enhanced comparison types for the Housing Hunt application
 * Extends existing LocationItem to maintain backward compatibility
 */

import type { LocationItem } from '../services/LocationsService';

/**
 * Property type enumeration for location categorization
 */
export const PropertyType = {
  APARTMENT: 'apartment',
  HOUSE: 'house',
  CONDO: 'condo',
  TOWNHOUSE: 'townhouse'
} as const;

export type PropertyType = typeof PropertyType[keyof typeof PropertyType];

/**
 * Laundry type enumeration for amenity categorization
 */
export const LaundryType = {
  IN_UNIT: 'in-unit',
  BUILDING: 'building',
  NONE: 'none'
} as const;

export type LaundryType = typeof LaundryType[keyof typeof LaundryType];

/**
 * Amenity rating interface for features that can be rated 1-5 stars
 */
export interface AmenityRating {
  has: boolean;
  rating?: number; // 1-5 star rating
}

/**
 * Amenities interface for all property amenities
 */
export interface Amenities {
  gym: AmenityRating;
  pool: AmenityRating;
  outdoorSpace: AmenityRating;
  parking: boolean;
  laundry: LaundryType;
  pets: boolean;
}

/**
 * Travel time information for different modes of transportation
 */
export interface TravelTime {
  distance: number; // in meters
  duration: number; // in seconds
}

/**
 * Travel times collection for a location
 */
export interface TravelTimes {
  walking: TravelTime;
  driving: TravelTime;
  transit: TravelTime;
}

/**
 * Analytics scores for a location
 */
export interface LocationScores {
  overall: number; // 0-100
  commute: number; // 0-100
  cost: number; // 0-100
  amenities: number; // 0-100
  size: number; // 0-100
}

/**
 * Enhanced location interface extending the base LocationItem
 */
export interface EnhancedLocationItem extends LocationItem {
  // Basic Property Info
  rent: number; // Monthly rent in cents (e.g., 150000 for $1500)
  squareFootage: number;
  bedrooms: number;
  bathrooms: number;
  
  // Property Features
  propertyType: PropertyType;
  yearBuilt?: number;
  description?: string;
  
  // Amenities & Ratings
  amenities: Amenities;
  
  // Travel Times (calculated)
  travelTimes?: TravelTimes;
  
  // Analytics Scores (calculated)
  scores?: LocationScores;
  
  // Metadata
  addedDate: string; // ISO timestamp
  lastUpdated: string; // ISO timestamp
}

/**
 * Column configuration for the flexible table system
 */
export interface ColumnConfig {
  id: string;
  label: string;
  group: ColumnGroup;
  sortable: boolean;
  visible: boolean;
  width?: string;
  formatter?: (value: any) => string;
  order: number;
}

/**
 * Column group enumeration for organizing table columns
 */
export const ColumnGroup = {
  BASIC: 'basic',
  TRAVEL: 'travel',
  AMENITIES: 'amenities',
  COSTS: 'costs'
} as const;

export type ColumnGroup = typeof ColumnGroup[keyof typeof ColumnGroup];

// Utility function to create default enhanced location
export function createDefaultLocation(): Omit<EnhancedLocationItem, 'id' | 'userId' | 'position'> {
  return {
    name: '',
    type: 'apartment',
    rent: 0,
    squareFootage: 0,
    bedrooms: 0,
    bathrooms: 0,
    propertyType: 'apartment',
    description: '',
    amenities: {
      gym: { has: false },
      pool: { has: false },
      outdoorSpace: { has: false },
      parking: false,
      laundry: 'none',
      pets: false
    },
    addedDate: new Date().toISOString(),
    lastUpdated: new Date().toISOString()
  };
}

/**
 * Validation error interface
 */
export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

/**
 * Validation result interface
 */
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

/**
 * Validation schema interface for property data
 */
export interface ValidationSchema {
  [key: string]: {
    required?: boolean;
    type: 'string' | 'number' | 'boolean' | 'enum' | 'array' | 'object';
    min?: number;
    max?: number;
    options?: any[];
    pattern?: RegExp;
    custom?: (value: any) => string | null;
  };
}

/**
 * Validation schemas for different property types
 */
export const ValidationSchemas: Record<string, ValidationSchema> = {
  basic: {
    name: {
      required: true,
      type: 'string',
      min: 1,
      max: 100
    },
    rent: {
      required: true,
      type: 'number',
      min: 50000, // $500 in cents
      max: 1000000, // $10000 in cents
      custom: (value: number) => {
        if (value <= 0) return 'Rent must be positive';
        if (value > 1000000) return 'Rent exceeds maximum allowed amount';
        return null;
      }
    },
    squareFootage: {
      required: true,
      type: 'number',
      min: 100,
      max: 10000,
      custom: (value: number) => {
        if (value <= 0) return 'Square footage must be positive';
        if (value > 10000) return 'Square footage exceeds maximum allowed';
        return null;
      }
    },
    bedrooms: {
      required: true,
      type: 'number',
      min: 0,
      max: 10,
      custom: (value: number) => {
        if (!Number.isInteger(value)) return 'Bedrooms must be a whole number';
        return null;
      }
    },
    bathrooms: {
      required: true,
      type: 'number',
      min: 0,
      max: 10,
      custom: (value: number) => {
        if (value < 0) return 'Bathrooms cannot be negative';
        if (value > 10) return 'Bathrooms exceed maximum allowed';
        return null;
      }
    },
    propertyType: {
      required: true,
      type: 'enum',
      options: Object.values(PropertyType)
    }
  },
  amenities: {
    'amenities.gym.rating': {
      required: false,
      type: 'number',
      min: 1,
      max: 5,
      custom: (value: number) => {
        if (value && (value < 1 || value > 5)) return 'Gym rating must be 1-5 stars';
        return null;
      }
    },
    'amenities.pool.rating': {
      required: false,
      type: 'number',
      min: 1,
      max: 5,
      custom: (value: number) => {
        if (value && (value < 1 || value > 5)) return 'Pool rating must be 1-5 stars';
        return null;
      }
    },
    'amenities.outdoorSpace.rating': {
      required: false,
      type: 'number',
      min: 1,
      max: 5,
      custom: (value: number) => {
        if (value && (value < 1 || value > 5)) return 'Outdoor space rating must be 1-5 stars';
        return null;
      }
    },
    'amenities.laundry': {
      required: true,
      type: 'enum',
      options: Object.values(LaundryType)
    }
  },
  metadata: {
    yearBuilt: {
      required: false,
      type: 'number',
      min: 1800,
      max: new Date().getFullYear() + 1,
      custom: (value: number) => {
        if (value && (value < 1800 || value > new Date().getFullYear() + 1)) {
          return 'Year built must be between 1800 and next year';
        }
        return null;
      }
    },
    description: {
      required: false,
      type: 'string',
      max: 1000
    }
  }
};

/**
 * Default amenities for new locations
 */
export const DefaultAmenities: Amenities = {
  gym: { has: false },
  pool: { has: false },
  outdoorSpace: { has: false },
  parking: false,
  laundry: LaundryType.NONE,
  pets: false
};

/**
 * Helper function to create a default enhanced location
 */
export function createDefaultEnhancedLocation(baseLocation: LocationItem): EnhancedLocationItem {
  const now = new Date().toISOString();
  
  return {
    ...baseLocation,
    rent: 0,
    squareFootage: 0,
    bedrooms: 0,
    bathrooms: 0,
    propertyType: PropertyType.APARTMENT,
    amenities: { ...DefaultAmenities },
    addedDate: now,
    lastUpdated: now
  };
}

/**
 * Helper function to validate enhanced location data
 */
export function validateEnhancedLocation(data: Partial<EnhancedLocationItem>): ValidationResult {
  const errors: ValidationError[] = [];
  
  // Validate basic schema
  const basicSchema = ValidationSchemas.basic;
  for (const [field, rules] of Object.entries(basicSchema)) {
    const value = data[field as keyof EnhancedLocationItem];
    
    if (rules.required && (value === undefined || value === null || value === '')) {
      errors.push({
        field,
        message: `${field.charAt(0).toUpperCase() + field.slice(1)} is required`,
        value
      });
      continue;
    }
    
    if (value !== undefined && value !== null) {
      if (rules.type === 'number' && typeof value !== 'number') {
        errors.push({
          field,
          message: `${field} must be a number`,
          value
        });
      } else if (rules.type === 'string' && typeof value !== 'string') {
        errors.push({
          field,
          message: `${field} must be a string`,
          value
        });
      } else if (rules.type === 'enum' && !rules.options?.includes(value)) {
        errors.push({
          field,
          message: `${field} must be one of: ${rules.options?.join(', ')}`,
          value
        });
      }
      
      if (rules.custom) {
        const customError = rules.custom(value);
        if (customError) {
          errors.push({
            field,
            message: customError,
            value
          });
        }
      }
      
      if (typeof value === 'number') {
        if (rules.min !== undefined && value < rules.min) {
          errors.push({
            field,
            message: `${field} must be at least ${rules.min}`,
            value
          });
        }
        if (rules.max !== undefined && value > rules.max) {
          errors.push({
            field,
            message: `${field} must be at most ${rules.max}`,
            value
          });
        }
      }
      
      if (typeof value === 'string') {
        if (rules.min !== undefined && value.length < rules.min) {
          errors.push({
            field,
            message: `${field} must be at least ${rules.min} characters`,
            value
          });
        }
        if (rules.max !== undefined && value.length > rules.max) {
          errors.push({
            field,
            message: `${field} must be at most ${rules.max} characters`,
            value
          });
        }
      }
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}