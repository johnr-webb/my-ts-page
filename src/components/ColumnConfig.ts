// Column configuration definitions for the flexible table system

// Helper function to get score class based on score value
function getScoreClass(score: number): string {
  if (score >= 80) return 'excellent';
  if (score >= 60) return 'good';
  if (score >= 40) return 'average';
  if (score >= 20) return 'fair';
  return 'poor';
}

export const AVAILABLE_COLUMNS = [
  // Basic Information Columns
  {
    id: 'name',
    label: 'Location Name',
    group: 'basic',
    sortable: true,
    visible: true,
    width: '150px',
    order: 1,
    formatter: (value: string) => value || 'Unnamed'
  },
  {
    id: 'address',
    label: 'Address',
    group: 'basic',
    sortable: false,
    visible: true,
    width: '200px',
    order: 2,
    formatter: (value: any) => {
      // Generate address from position if not available
      if (typeof value === 'string') return value;
      if (value?.position) {
        return `${value.position.lat.toFixed(4)}, ${value.position.lng.toFixed(4)}`;
      }
      return 'No Address';
    }
  },
  {
    id: 'type',
    label: 'Property Type',
    group: 'basic',
    sortable: true,
    visible: true,
    width: '120px',
    order: 3,
    formatter: (value: string) => {
      const typeMap: Record<string, string> = {
        apartment: '🏠 Apartment',
        house: '🏡 House',
        condo: '🏢 Condo',
        townhouse: '🏘 Townhouse'
      };
      return typeMap[value] || value;
    }
  },
  {
    id: 'rent',
    label: 'Monthly Rent',
    group: 'basic',
    sortable: true,
    visible: true,
    width: '120px',
    order: 4,
    formatter: (value: number) => {
      if (!value || value === 0) return '$0';
      return `$${(value / 100).toLocaleString()}`; // Convert from cents to dollars
    }
  },
  {
    id: 'squareFootage',
    label: 'Sq Ft',
    group: 'basic',
    sortable: true,
    visible: true,
    width: '100px',
    order: 5,
    formatter: (value: number) => value?.toLocaleString() || '0'
  },
  {
    id: 'bedrooms',
    label: 'Beds',
    group: 'basic',
    sortable: true,
    visible: true,
    width: '80px',
    order: 6,
    formatter: (value: number) => value?.toString() || '0'
  },
  {
    id: 'bathrooms',
    label: 'Baths',
    group: 'basic',
    sortable: true,
    visible: true,
    width: '80px',
    order: 7,
    formatter: (value: number) => value?.toString() || '0'
  },

  // Travel Time Columns
  {
    id: 'walkingTime',
    label: 'Walk Time',
    group: 'travel',
    sortable: true,
    visible: true,
    width: '120px',
    order: 8,
    formatter: (value: any) => {
      if (!value?.walking?.duration) return '--';
      return `${value.walking.duration}m`;
    }
  },
  {
    id: 'drivingTime',
    label: 'Drive Time',
    group: 'travel',
    sortable: true,
    visible: true,
    width: '120px',
    order: 9,
    formatter: (value: any) => {
      if (!value?.driving?.duration) return '--';
      return `${value.driving.duration}m`;
    }
  },
  {
    id: 'transitTime',
    label: 'Transit Time',
    group: 'travel',
    sortable: true,
    visible: true,
    width: '120px',
    order: 10,
    formatter: (value: any) => {
      if (!value?.transit?.duration) return '--';
      return `${value.transit.duration}m`;
    }
  },
  {
    id: 'distance',
    label: 'Distance',
    group: 'travel',
    sortable: true,
    visible: false,
    width: '120px',
    order: 11,
    formatter: (value: any) => {
      const distance = value?.walking?.distance || value?.driving?.distance;
      if (!distance) return '--';
      return `${(distance / 1609.34).toFixed(1)}mi`; // Convert meters to miles
    }
  },

  // Amenity Columns
  {
    id: 'gym',
    label: 'Gym',
    group: 'amenities',
    sortable: true,
    visible: false,
    width: '100px',
    order: 12,
    formatter: (value: any) => {
      if (!value?.gym?.has) return 'No';
      if (value.gym.rating) {
        return `${'★'.repeat(value.gym.rating)} (${value.gym.rating}/5)`;
      }
      return 'Yes';
    }
  },
  {
    id: 'pool',
    label: 'Pool',
    group: 'amenities',
    sortable: true,
    visible: false,
    width: '100px',
    order: 13,
    formatter: (value: any) => {
      if (!value?.pool?.has) return 'No';
      if (value.pool.rating) {
        return `${'★'.repeat(value.pool.rating)} (${value.pool.rating}/5)`;
      }
      return 'Yes';
    }
  },
  {
    id: 'outdoorSpace',
    label: 'Outdoor Space',
    group: 'amenities',
    sortable: true,
    visible: false,
    width: '120px',
    order: 14,
    formatter: (value: any) => {
      if (!value?.outdoorSpace?.has) return 'No';
      if (value.outdoorSpace.rating) {
        return `${'★'.repeat(value.outdoorSpace.rating)} (${value.outdoorSpace.rating}/5)`;
      }
      return 'Yes';
    }
  },
  {
    id: 'parking',
    label: 'Parking',
    group: 'amenities',
    sortable: true,
    visible: false,
    width: '100px',
    order: 15,
    formatter: (value: any) => value?.parking ? '✓' : '✗'
  },
  {
    id: 'laundry',
    label: 'Laundry',
    group: 'amenities',
    sortable: true,
    visible: false,
    width: '100px',
    order: 16,
    formatter: (value: any) => {
      const laundryMap: Record<string, string> = {
        'in-unit': 'In-Unit',
        'building': 'Building',
        'none': 'None'
      };
      return laundryMap[value] || value || 'None';
    }
  },
  {
    id: 'petsAllowed',
    label: 'Pets',
    group: 'amenities',
    sortable: true,
    visible: false,
    width: '100px',
    order: 17,
    formatter: (value: any) => value?.petsAllowed ? '✓' : '✗'
  },

  // Cost Columns
  {
    id: 'estimatedUtilities',
    label: 'Est. Utilities',
    group: 'costs',
    sortable: true,
    visible: false,
    width: '120px',
    order: 18,
    formatter: (value: any) => {
      // Estimate utilities based on square footage and bedrooms
      if (!value?.squareFootage) return '$0';
      const baseUtility = 100; // Base utility cost
      const sqftFactor = value.squareFootage * 0.15;
      const bedroomFactor = (value.bedrooms || 0) * 30;
      const estimated = baseUtility + sqftFactor + bedroomFactor;
      return `$${estimated.toFixed(0)}`;
    }
  },
  {
    id: 'totalMonthlyCost',
    label: 'Total Monthly',
    group: 'costs',
    sortable: true,
    visible: true,
    width: '120px',
    order: 19,
    formatter: (value: any) => {
      if (!value?.rent) return '$0';
      const rent = value.rent / 100; // Convert from cents
      const estimatedUtilities = value.estimatedUtilities ? parseFloat(value.estimatedUtilities.replace('$', '')) : 0;
      const total = rent + estimatedUtilities;
      return `$${total.toFixed(0)}`;
    }
  },

  // Analytics Score Columns
  {
    id: 'overallScore',
    label: 'Overall Score',
    group: 'analytics',
    sortable: true,
    visible: false,
    width: '120px',
    order: 20,
    formatter: (value: any) => {
      const score = value?.scores?.overall || 0;
      return `<div class="score-badge ${getScoreClass(score)}">${score.toFixed(0)}</div>`;
    }
  },
  {
    id: 'commuteScore',
    label: 'Commute Score',
    group: 'analytics',
    sortable: true,
    visible: false,
    width: '120px',
    order: 21,
    formatter: (value: any) => {
      const score = value?.scores?.commute || 0;
      return `<div class="score-badge ${getScoreClass(score)}">${score.toFixed(0)}</div>`;
    }
  },
  {
    id: 'costScore',
    label: 'Cost Score',
    group: 'analytics',
    sortable: true,
    visible: false,
    width: '120px',
    order: 22,
    formatter: (value: any) => {
      const score = value?.scores?.cost || 0;
      return `<div class="score-badge ${getScoreClass(score)}">${score.toFixed(0)}</div>`;
    }
  },
  {
    id: 'amenitiesScore',
    label: 'Amenities Score',
    group: 'analytics',
    sortable: true,
    visible: false,
    width: '120px',
    order: 23,
    formatter: (value: any) => {
      const score = value?.scores?.amenities || 0;
      return `<div class="score-badge ${getScoreClass(score)}">${score.toFixed(0)}</div>`;
    }
  },
  {
    id: 'sizeScore',
    label: 'Size Score',
    group: 'analytics',
    sortable: true,
    visible: false,
    width: '120px',
    order: 24,
    formatter: (value: any) => {
      const score = value?.scores?.size || 0;
      return `<div class="score-badge ${getScoreClass(score)}">${score.toFixed(0)}</div>`;
    }
  }
];

// Preset configurations for different use cases
export const COLUMN_PRESETS = {
  COMMUTE_FOCUS: {
    name: 'Commute Focus',
    description: 'Focus on travel times and distance',
    columns: ['name', 'address', 'type', 'rent', 'walkingTime', 'drivingTime', 'transitTime', 'distance']
  },
  BUDGET_FOCUS: {
    name: 'Budget Focus',
    description: 'Focus on costs and affordability',
    columns: ['name', 'address', 'type', 'rent', 'squareFootage', 'bedrooms', 'bathrooms', 'estimatedUtilities', 'totalMonthlyCost']
  },
  AMENITIES_FOCUS: {
    name: 'Amenities Focus',
    description: 'Focus on building features and amenities',
    columns: ['name', 'address', 'type', 'rent', 'gym', 'pool', 'outdoorSpace', 'parking', 'laundry', 'petsAllowed']
  },
  ANALYTICS_FOCUS: {
    name: 'Analytics Focus',
    description: 'Focus on scoring and comparison analytics',
    columns: ['name', 'address', 'type', 'rent', 'overallScore', 'commuteScore', 'costScore', 'amenitiesScore', 'sizeScore']
  },
  COMPARISON_ALL: {
    name: 'All Features',
    description: 'Show all available columns for comprehensive comparison',
    columns: AVAILABLE_COLUMNS.map(col => col.id)
  },
  MINIMAL: {
    name: 'Minimal View',
    description: 'Show only essential information',
    columns: ['name', 'address', 'type', 'rent']
  }
};

// Default column configuration
export const DEFAULT_COLUMN_CONFIG = AVAILABLE_COLUMNS.map(column => ({
  ...column,
  visible: ['name', 'address', 'type', 'rent', 'bedrooms', 'bathrooms'].includes(column.id)
}));