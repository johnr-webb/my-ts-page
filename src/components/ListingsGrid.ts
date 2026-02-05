// src/components/ListingsGrid.ts

import type { RentalListing } from '../types/RentalListing';
import { ListingCard } from './ListingCard';

export function ListingsGrid(container: HTMLElement): void {
  let currentListings: RentalListing[] = [];
  
  function render(): void {
    container.innerHTML = `
      <div class="listings-container">
        <div class="listings-header">
          <h2 class="listings-title">Search Results</h2>
          <div class="results-summary">
            <span class="results-count">0 listings found</span>
            <div class="results-actions">
              <button class="clear-results-btn" style="display: none;" title="Clear current results">
                Clear Results
              </button>
            </div>
          </div>
        </div>
        
        <div class="listings-grid">
          <!-- Listing cards will be inserted here -->
        </div>
        
        <div class="no-results" style="display: none;">
          <div class="no-results-icon">🔍</div>
          <h3 class="no-results-title">No listings found</h3>
          <p class="no-results-message">
            Try adjusting your search criteria or expanding your location radius.
          </p>
          <div class="no-results-suggestions">
            <p><strong>Suggestions:</strong></p>
            <ul>
              <li>Try a broader location (city instead of specific address)</li>
              <li>Increase your maximum price range</li>
              <li>Remove bedroom or bathroom requirements</li>
              <li>Try a different property type</li>
            </ul>
          </div>
        </div>
        
        <div class="loading-state" style="display: none;">
          <div class="loading-content">
            <div class="loading-spinner"></div>
            <p class="loading-text">Searching for rentals...</p>
            <p class="loading-subtext">This may take a few moments</p>
          </div>
        </div>

        <div class="error-state" style="display: none;">
          <div class="error-icon">⚠️</div>
          <h3 class="error-title">Search Failed</h3>
          <p class="error-message">Unable to search for listings at this time.</p>
          <button class="retry-btn">Try Again</button>
        </div>
      </div>
    `;
    attachEventListeners();
  }

  function attachEventListeners(): void {
    // Listen for service events
    window.addEventListener('searchStarted', handleSearchStarted);
    window.addEventListener('listingsUpdated', handleListingsUpdate);
    window.addEventListener('searchError', handleSearchError);

    // Clear results button
    const clearBtn = container.querySelector('.clear-results-btn') as HTMLButtonElement;
    if (clearBtn) {
      clearBtn.addEventListener('click', handleClearResults);
    }

    // Retry button
    const retryBtn = container.querySelector('.retry-btn') as HTMLButtonElement;
    if (retryBtn) {
      retryBtn.addEventListener('click', handleRetry);
    }
  }

  function handleSearchStarted(): void {
    console.log('[ListingsGrid] Search started - showing loading state');
    showLoadingState();
  }

  function handleListingsUpdate(event: Event): void {
    const { listings, totalResults, criteria } = (event as CustomEvent).detail;
    console.log(`[ListingsGrid] Received ${listings.length} listings`);
    
    currentListings = listings;
    displayListings(listings, totalResults, criteria);
  }

  function handleSearchError(event: Event): void {
    const { error } = (event as CustomEvent).detail;
    console.error('[ListingsGrid] Search error:', error);
    showErrorState(error);
  }

  function handleClearResults(): void {
    console.log('[ListingsGrid] Clearing results');
    currentListings = [];
    clearResults();
  }

  function handleRetry(): void {
    console.log('[ListingsGrid] Retrying search');
    // Hide error state and show loading
    showLoadingState();
    
    // Dispatch retry event for search filters to handle
    window.dispatchEvent(new CustomEvent('retrySearch'));
  }

  function displayListings(listings: RentalListing[], totalResults: number, criteria: any): void {
    const grid = container.querySelector('.listings-grid') as HTMLElement;
    const resultsCount = container.querySelector('.results-count') as HTMLElement;
    const clearBtn = container.querySelector('.clear-results-btn') as HTMLElement;
    const noResults = container.querySelector('.no-results') as HTMLElement;
    const listingsTitle = container.querySelector('.listings-title') as HTMLElement;
    
    // Hide loading and error states
    hideLoadingState();
    hideErrorState();
    
    // Update results count and title
    const resultText = totalResults === 1 ? 'listing' : 'listings';
    resultsCount.textContent = `${totalResults.toLocaleString()} ${resultText} found`;
    
    if (criteria && criteria.location) {
      listingsTitle.textContent = `Rentals in ${criteria.location}`;
    } else {
      listingsTitle.textContent = 'Search Results';
    }

    // Show/hide clear button
    if (listings.length > 0) {
      clearBtn.style.display = 'block';
    } else {
      clearBtn.style.display = 'none';
    }

    if (listings.length === 0) {
      // Show no results state
      grid.innerHTML = '';
      grid.style.display = 'none';
      noResults.style.display = 'block';
      return;
    }

    // Show results
    noResults.style.display = 'none';
    grid.style.display = 'grid';
    
    // Clear existing content
    grid.innerHTML = '';
    
    // Create and append listing cards
    listings.forEach((listing, index) => {
      const card = ListingCard(listing);
      
      // Add staggered animation
      card.style.animationDelay = `${index * 0.05}s`;
      card.classList.add('listing-card-animated');
      
      grid.appendChild(card);
    });

    console.log(`[ListingsGrid] Displayed ${listings.length} listing cards`);
  }

  function showLoadingState(): void {
    const loadingState = container.querySelector('.loading-state') as HTMLElement;
    const grid = container.querySelector('.listings-grid') as HTMLElement;
    const noResults = container.querySelector('.no-results') as HTMLElement;
    const errorState = container.querySelector('.error-state') as HTMLElement;

    loadingState.style.display = 'flex';
    grid.style.display = 'none';
    noResults.style.display = 'none';
    errorState.style.display = 'none';
  }

  function hideLoadingState(): void {
    const loadingState = container.querySelector('.loading-state') as HTMLElement;
    loadingState.style.display = 'none';
  }

  function showErrorState(error: string): void {
    const errorState = container.querySelector('.error-state') as HTMLElement;
    const errorMessage = container.querySelector('.error-message') as HTMLElement;
    const grid = container.querySelector('.listings-grid') as HTMLElement;
    const noResults = container.querySelector('.no-results') as HTMLElement;
    const loadingState = container.querySelector('.loading-state') as HTMLElement;

    errorMessage.textContent = error || 'Unable to search for listings at this time.';
    
    errorState.style.display = 'flex';
    grid.style.display = 'none';
    noResults.style.display = 'none';
    loadingState.style.display = 'none';
  }

  function hideErrorState(): void {
    const errorState = container.querySelector('.error-state') as HTMLElement;
    errorState.style.display = 'none';
  }

  function clearResults(): void {
    const grid = container.querySelector('.listings-grid') as HTMLElement;
    const resultsCount = container.querySelector('.results-count') as HTMLElement;
    const clearBtn = container.querySelector('.clear-results-btn') as HTMLElement;
    const listingsTitle = container.querySelector('.listings-title') as HTMLElement;
    const noResults = container.querySelector('.no-results') as HTMLElement;
    const errorState = container.querySelector('.error-state') as HTMLElement;
    const loadingState = container.querySelector('.loading-state') as HTMLElement;

    // Clear grid content
    grid.innerHTML = '';
    grid.style.display = 'none';
    
    // Reset UI elements
    resultsCount.textContent = '0 listings found';
    listingsTitle.textContent = 'Search Results';
    clearBtn.style.display = 'none';
    
    // Hide all states
    noResults.style.display = 'none';
    errorState.style.display = 'none';
    loadingState.style.display = 'none';
  }

  // Public methods for external access
  function getDisplayedListings(): RentalListing[] {
    return [...currentListings]; // Return a copy
  }

  function getListingCount(): number {
    return currentListings.length;
  }

  // Cleanup function for removing event listeners
  function cleanup(): void {
    window.removeEventListener('searchStarted', handleSearchStarted);
    window.removeEventListener('listingsUpdated', handleListingsUpdate);
    window.removeEventListener('searchError', handleSearchError);
  }

  // Store public methods on container for external access
  (container as any).listingsGridApi = {
    getDisplayedListings,
    getListingCount,
    clearResults,
    cleanup
  };

  // Initial render
  render();
}