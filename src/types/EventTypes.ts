/**
 * Event types for consistent event system across the application
 */

// Service error event type
export interface ServiceErrorDetail {
  service: string;
  context: string;
  error: string;
  timestamp: string;
}

// Location events
export interface LocationUpdatedDetail {
  locations: import('../services/LocationsService').LocationItem[];
}

export interface LocationAddedDetail {
  location: import('../services/LocationsService').LocationItem;
}

export interface LocationRemovedDetail {
  id: string;
}

// Authentication events
export interface AuthStateChangedDetail {
  user: import('../services/AuthService').AuthUser | null;
  isAuthenticated: boolean;
}

// Analytics events
export interface AnalyticsCalculationDetail {
  locationsCount: number;
}

export interface AnalyticsCompletedDetail {
  result: import('../services/AnalyticsEngine').CombinedAnalyticsResult;
}

// Travel time events
export interface TravelTimeCalculationCompletedDetail {
  results: import('../services/TravelTimeService').TravelTimeResult[];
}

// Component events
export interface ColumnConfigurationChangedDetail {
  columns: any[];
}

export interface EditLocationDetail {
  id: string;
}

// Event type registry
export const EventTypes = {
  // Service events
  SERVICE_ERROR: 'serviceError',
  
  // Location events
  LOCATIONS_UPDATED: 'locationsUpdated',
  LOCATION_ADDED: 'locationAdded',
  LOCATION_REMOVED: 'locationRemoved',
  
  // Authentication events
  AUTH_STATE_CHANGED: 'authStateChanged',
  
  // Analytics events
  ANALYTICS_CALCULATION_STARTED: 'calculationStarted',
  ANALYTICS_CALCULATION_COMPLETED: 'calculationCompleted',
  ANALYTICS_SCORES_UPDATED: 'analyticsScoresUpdated',
  
  // Travel time events
  TRAVEL_TIME_CALCULATION_COMPLETED: 'travelTimeCalculationCompleted',
  
  // Component events
  COLUMN_CONFIGURATION_CHANGED: 'columnConfigurationChanged',
  EDIT_LOCATION: 'editLocation',
  OPEN_COLUMN_MANAGER: 'openColumnManager',
  REQUEST_CURRENT_LOCATIONS: 'requestCurrentLocations'
} as const;

export type EventType = typeof EventTypes[keyof typeof EventTypes];