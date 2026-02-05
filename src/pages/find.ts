import { SearchFilters } from '../components/SearchFilters';
import { ListingsGrid } from '../components/ListingsGrid';
import { renderMap } from '../components/MapView';
import { RentalListingService } from '../services/RentalListingService';
import { AuthService } from '../services/AuthService';

export async function renderFindPage(appElement: HTMLElement): Promise<void> {
  // Ensure user is authenticated
  if (!AuthService.isAuthenticated()) {
    appElement.innerHTML = `
      <div class="page-container">
        <div class="page-content">
          <div class="auth-required">
            <h2>Authentication Required</h2>
            <p>Please sign in to search for rental listings.</p>
            <div class="auth-actions">
              <a href="/signin" data-link class="btn btn-primary">Sign In</a>
              <a href="/signup" data-link class="btn btn-secondary">Create Account</a>
            </div>
          </div>
        </div>
      </div>
    `;
    return;
  }

  // Check for API key configuration
  const apiKey = import.meta.env.VITE_RENTSPIDER_API_KEY;
  if (!apiKey) {
    appElement.innerHTML = `
      <div class="page-container">
        <div class="page-content">
          <div class="config-error">
            <h2>Configuration Error</h2>
            <p>Rental search is not available. The RentSpider API key is missing.</p>
            <p class="error-details">
              Please configure <code>VITE_RENTSPIDER_API_KEY</code> in your environment variables.
            </p>
          </div>
        </div>
      </div>
    `;
    return;
  }

  // Initialize the rental service
  try {
    const rentalService = RentalListingService.getInstance();
    if (!rentalService.isServiceInitialized()) {
      rentalService.initialize(apiKey);
    }

    // Check provider availability (optional - don't block on this)
    rentalService.checkProviderAvailability().then(available => {
      if (!available) {
        console.warn('[FindPage] RentSpider provider appears to be unavailable');
      }
    });

  } catch (error) {
    console.error('[FindPage] Failed to initialize rental service:', error);
    appElement.innerHTML = `
      <div class="page-container">
        <div class="page-content">
          <div class="service-error">
            <h2>Service Initialization Failed</h2>
            <p>Unable to initialize the rental search service.</p>
            <p class="error-details">${error instanceof Error ? error.message : 'Unknown error'}</p>
            <button onclick="location.reload()" class="retry-btn">Try Again</button>
          </div>
        </div>
      </div>
    `;
    return;
  }

  // Render the main find page layout
  const content = `
    <div class="page-container page-container--wide">
      <div class="page-content">
        <div class="find-page-header">
          <div class="page-title-section">
            <h1>Find Rentals</h1>
            <p class="page-description">
              Search for available apartments and houses in your area. 
              Use the filters below to narrow down your search and find the perfect place.
            </p>
          </div>
          
          <div class="provider-info">
            <span class="provider-badge">
              Search Powered by API
            </span>
          </div>
        </div>

        <div class="search-section">
          <div class="search-filters-container"></div>
        </div>

        <div class="results-section">
          <div class="results-layout">
            <div class="listings-container-wrapper">
              <div class="listings-grid-container"></div>
            </div>
            <div class="map-container">
              <div class="map-header">
                <h3>Map View</h3>
                <p class="map-description">Listings will appear on the map after searching</p>
              </div>
              <div class="map-view"></div>
            </div>
          </div>
        </div>

        <div class="find-page-help">
          <div class="help-section">
            <h3>Search Tips</h3>
            <ul class="help-list">
              <li><strong>Location:</strong> Try city names, zip codes, or specific addresses</li>
              <li><strong>Price:</strong> Set a realistic budget to see relevant options</li>
              <li><strong>Bedrooms:</strong> Leave blank for all options, or specify your needs</li>
              <li><strong>Import:</strong> Click "Add to My Locations" to save favorites</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  `;

  appElement.innerHTML = content;

  // Initialize components
  const filtersContainer = appElement.querySelector('.search-filters-container') as HTMLElement;
  const gridContainer = appElement.querySelector('.listings-grid-container') as HTMLElement;
  const mapContainer = appElement.querySelector('.map-view') as HTMLElement;

  if (!filtersContainer || !gridContainer || !mapContainer) {
    console.error('[FindPage] Required DOM elements not found');
    return;
  }

  try {
    // Initialize search filters component with cleanup tracking
    SearchFilters(filtersContainer); // Returns cleanup function for future use
    console.log('[FindPage] SearchFilters component initialized');

    // Initialize listings grid component
    ListingsGrid(gridContainer);
    console.log('[FindPage] ListingsGrid component initialized');

    // Initialize map component
    await renderMap(mapContainer);
    console.log('[FindPage] Map component initialized');

    // Set up additional event listeners
    setupPageEventListeners(appElement);

    console.log('[FindPage] Find page fully initialized and ready');

  } catch (error) {
    console.error('[FindPage] Component initialization failed:', error);
    
    // Show error state but don't completely fail
    const errorElement = document.createElement('div');
    errorElement.className = 'component-error';
    errorElement.innerHTML = `
      <div class="error-content">
        <h3>Component Loading Error</h3>
        <p>Some components failed to load properly. You may experience limited functionality.</p>
        <button onclick="location.reload()" class="retry-btn">Reload Page</button>
      </div>
    `;
    
    appElement.querySelector('.results-section')?.prepend(errorElement);
  }
}

function setupPageEventListeners(pageElement: HTMLElement): void {
  // Listen for successful searches to update map description
  window.addEventListener('listingsUpdated', (event) => {
    const { listings } = (event as CustomEvent).detail;
    const mapDescription = pageElement.querySelector('.map-description') as HTMLElement;
    
    if (mapDescription) {
      if (listings && listings.length > 0) {
        mapDescription.textContent = `Showing ${listings.length} listing${listings.length === 1 ? '' : 's'} on the map`;
      } else {
        mapDescription.textContent = 'No listings to display on map';
      }
    }
  });

  // Listen for search errors to show helpful messaging
  window.addEventListener('searchError', (event) => {
    const { error } = (event as CustomEvent).detail;
    console.error('[FindPage] Search error received:', error);
    
    // Could add additional error handling here if needed
  });

  // Listen for successful imports to show feedback
  window.addEventListener('listingImported', (event) => {
    const { success, listing } = (event as CustomEvent).detail;
    
    if (success && listing) {
      console.log(`[FindPage] Successfully imported listing: ${listing.title}`);
      // Could show toast notification or other feedback here
    }
  });

  // Handle retry events from grid component
  window.addEventListener('retrySearch', () => {
    console.log('[FindPage] Retry search requested');
    // The search filters component will handle the actual retry
    // This event just provides awareness at the page level
  });

  console.log('[FindPage] Page-level event listeners set up');
}
