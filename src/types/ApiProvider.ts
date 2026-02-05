// src/types/ApiProvider.ts

import type { SearchCriteria, SearchResponse } from './RentalListing';

export interface ApiProvider {
  name: string;
  search(criteria: SearchCriteria): Promise<SearchResponse>;
  isAvailable(): Promise<boolean>;
}

export interface ApiConfig {
  baseUrl: string;
  apiKey: string;
  rateLimit: {
    requestsPerMinute: number;
    requestsPerDay: number;
  };
}