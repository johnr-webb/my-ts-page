// src/components/SearchFilters.ts

import type { SearchCriteria } from '../types/RentalListing';
import { RentalListingService } from '../services/RentalListingService';

export function SearchFilters(container: HTMLElement): (() => void) {
  // Event handler functions with proper cleanup reference
  const eventListeners = {
    handleSearchSuccess: () => {
      console.log('[SearchFilters] Search completed successfully');
      showLoading(false);
    },

    handleSearchError: (event: Event) => {
      const customEvent = event as CustomEvent;
      const error = customEvent.detail?.error;
      console.error('[SearchFilters] Search failed:', error);
      showLoading(false);
      showError(error || 'Search failed. Please try again.');
    }
  };
  function render(): void {
    container.innerHTML = `
      <div class="search-filters">
        <form class="search-form">
          <div class="search-row">
            <div class="form-group form-group--primary">
              <label for="location">Location *</label>
              <input type="text" id="location" name="location" 
                     placeholder="Address, city, or zip code" required
                     autocomplete="address-line1">
            </div>
            <button type="submit" class="search-btn" id="searchBtn">
              <span class="btn-text">Search Rentals</span>
              <span class="btn-loading" style="display: none;">
                <span class="spinner"></span>
                Searching...
              </span>
            </button>
          </div>
          
          <div class="filters-row">
            <div class="form-group">
              <label for="maxPrice">Max Price</label>
              <select id="maxPrice" name="maxPrice">
                <option value="">Any</option>
                <option value="100000">$1,000</option>
                <option value="150000">$1,500</option>
                <option value="200000">$2,000</option>
                <option value="250000">$2,500</option>
                <option value="300000">$3,000</option>
                <option value="400000">$4,000</option>
                <option value="500000">$5,000</option>
              </select>
            </div>
            
            <div class="form-group">
              <label for="bedrooms">Bedrooms</label>
              <select id="bedrooms" name="bedrooms">
                <option value="">Any</option>
                <option value="0">Studio</option>
                <option value="1">1 BR</option>
                <option value="2">2 BR</option>
                <option value="3">3 BR</option>
                <option value="4">4+ BR</option>
              </select>
            </div>
            
            <div class="form-group">
              <label for="bathrooms">Bathrooms</label>
              <select id="bathrooms" name="bathrooms">
                <option value="">Any</option>
                <option value="1">1+ Bath</option>
                <option value="2">2+ Bath</option>
                <option value="3">3+ Bath</option>
              </select>
            </div>
            
            <div class="form-group">
              <label for="propertyType">Property Type</label>
              <select id="propertyType" name="propertyType">
                <option value="">Any</option>
                <option value="apartment">Apartment</option>
                <option value="house">House</option>
                <option value="condo">Condo</option>
                <option value="townhouse">Townhouse</option>
              </select>
            </div>
          </div>

          <div class="error-message" id="errorMessage" style="display: none;"></div>
        </form>
      </div>
    `;
    attachEventListeners();
  }

  function attachEventListeners(): void {
    const form = container.querySelector('.search-form') as HTMLFormElement;
    const locationInput = container.querySelector('#location') as HTMLInputElement;
    
    form.addEventListener('submit', handleSubmit);
    
    // Enable search on Enter key
    locationInput.addEventListener('keypress', (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        handleSubmit(event);
      }
    });

    // Clear error on input change
    const inputs = form.querySelectorAll('input, select');
    inputs.forEach(input => {
      input.addEventListener('change', clearError);
      input.addEventListener('input', clearError);
    });
  }

  async function handleSubmit(event: Event): Promise<void> {
    event.preventDefault();
    
    try {
      const formData = extractFormData();
      const criteria = buildSearchCriteria(formData);
      
      showLoading(true);
      clearError();
      
      console.log('[SearchFilters] Starting search with criteria:', criteria);
      
      const rentalService = RentalListingService.getInstance();
      await rentalService.search(criteria);
      
      // Success feedback is handled by the listingsUpdated event
      
    } catch (error) {
      console.error('[SearchFilters] Search failed:', error);
      showError(error instanceof Error ? error.message : 'Search failed. Please try again.');
    } finally {
      showLoading(false);
    }
  }

  function extractFormData(): Record<string, string> {
    const form = container.querySelector('.search-form') as HTMLFormElement;
    const formData = new FormData(form);
    const data: Record<string, string> = {};
    
    for (const [key, value] of formData.entries()) {
      if (typeof value === 'string' && value.trim()) {
        data[key] = value.trim();
      }
    }
    
    return data;
  }

  function buildSearchCriteria(formData: Record<string, string>): SearchCriteria {
    const criteria: SearchCriteria = {
      location: formData.location
    };

    // Parse max price (values are in cents)
    if (formData.maxPrice) {
      const price = parseInt(formData.maxPrice);
      if (!isNaN(price)) {
        criteria.maxPrice = price;
      }
    }

    // Parse bedrooms
    if (formData.bedrooms) {
      const bedrooms = parseInt(formData.bedrooms);
      if (!isNaN(bedrooms)) {
        criteria.bedrooms = bedrooms;
      }
    }

    // Parse bathrooms
    if (formData.bathrooms) {
      const bathrooms = parseInt(formData.bathrooms);
      if (!isNaN(bathrooms)) {
        criteria.bathrooms = bathrooms;
      }
    }

    // Property type
    if (formData.propertyType) {
      criteria.propertyType = [formData.propertyType];
    }

    // Validate price range locally before search
    if (criteria.minPrice !== undefined && criteria.maxPrice !== undefined && criteria.minPrice > criteria.maxPrice) {
      showError('Minimum price cannot exceed maximum price');
      return criteria; // Return the criteria even with error for clarity
    }

    // Set default radius
    criteria.radius = 10; // 10 mile radius

    return criteria;
  }

  function showLoading(loading: boolean): void {
    const button = container.querySelector('#searchBtn') as HTMLButtonElement;
    const btnText = button.querySelector('.btn-text') as HTMLElement;
    const btnLoading = button.querySelector('.btn-loading') as HTMLElement;
    
    button.disabled = loading;
    
    if (loading) {
      btnText.style.display = 'none';
      btnLoading.style.display = 'flex';
    } else {
      btnText.style.display = 'block';
      btnLoading.style.display = 'none';
    }
  }

  function showError(message: string): void {
    const errorElement = container.querySelector('#errorMessage') as HTMLElement;
    errorElement.textContent = message;
    errorElement.style.display = 'block';
  }

  function clearError(): void {
    const errorElement = container.querySelector('#errorMessage') as HTMLElement;
    errorElement.style.display = 'none';
  }

  // Set up event listeners for service events
  window.addEventListener('listingsUpdated', eventListeners.handleSearchSuccess);
  window.addEventListener('searchError', eventListeners.handleSearchError);

  // Initial render
  render();

  // Return cleanup function
  return () => {
    window.removeEventListener('listingsUpdated', eventListeners.handleSearchSuccess);
    window.removeEventListener('searchError', eventListeners.handleSearchError);
  };
}