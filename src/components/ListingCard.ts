// src/components/ListingCard.ts

import type { RentalListing } from '../types/RentalListing';
import { RentalListingService } from '../services/RentalListingService';

export function ListingCard(listing: RentalListing): HTMLElement {
  const card = document.createElement('div');
  card.className = 'listing-card';
  card.setAttribute('data-listing-id', listing.id);
  
  // Format price for display
  const priceFormatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0
  }).format(listing.price / 100);
  
  // Format date posted
  const datePosted = new Date(listing.datePosted);
  const dateFormatted = datePosted.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });

  // Generate amenities display (limit to first 3)
  const amenitiesDisplay = listing.amenities.length > 0 
    ? listing.amenities.slice(0, 3).join(', ') + (listing.amenities.length > 3 ? '...' : '')
    : '';

  card.innerHTML = `
    <div class="listing-image">
      ${listing.imageUrl 
        ? `<img src="${listing.imageUrl}" alt="${escapeHtml(listing.title)}" loading="lazy" data-listing-image="true">
           <div class="image-placeholder" style="display: none;">📷</div>`
        : `<div class="image-placeholder">📷</div>`
      }
      <div class="listing-badge">${formatPropertyType(listing.propertyType)}</div>
    </div>
    
    <div class="listing-content">
      <div class="listing-header">
        <h3 class="listing-title">${escapeHtml(listing.title)}</h3>
        <div class="listing-price">${priceFormatted}<span class="price-period">/month</span></div>
      </div>
      
      <p class="listing-address">📍 ${escapeHtml(listing.address)}</p>
      
      <div class="listing-details">
        <div class="detail-item">
          <span class="detail-icon">🛏️</span>
          <span class="detail-text">${listing.bedrooms} ${listing.bedrooms === 1 ? 'bed' : 'beds'}</span>
        </div>
        <div class="detail-item">
          <span class="detail-icon">🛁</span>
          <span class="detail-text">${listing.bathrooms} ${listing.bathrooms === 1 ? 'bath' : 'baths'}</span>
        </div>
        ${listing.squareFeet 
          ? `<div class="detail-item">
               <span class="detail-icon">📐</span>
               <span class="detail-text">${listing.squareFeet.toLocaleString()} sqft</span>
             </div>`
          : ''
        }
      </div>

      ${listing.description && listing.description.trim() 
        ? `<p class="listing-description">${escapeHtml(truncateText(listing.description, 120))}</p>`
        : ''
      }

      ${amenitiesDisplay 
        ? `<div class="listing-amenities">
             <span class="amenities-label">Amenities:</span>
             <span class="amenities-text">${escapeHtml(amenitiesDisplay)}</span>
           </div>`
        : ''
      }

      <div class="listing-meta">
        <span class="listing-source">via ${listing.source}</span>
        <span class="listing-date">Posted ${dateFormatted}</span>
      </div>
      
      <div class="listing-actions">
        <button class="import-btn" data-listing-id="${listing.id}" 
                title="Add to My Saved Locations"
                aria-label="Add listing: ${escapeHtml(listing.title)} to My Locations">
          <span class="btn-icon">⭐</span>
          <span class="btn-text">Add to My Locations</span>
          <span class="btn-loading" style="display: none;">
            <span class="spinner-small"></span>
            Adding...
          </span>
        </button>
        <a href="${listing.listingUrl}" target="_blank" rel="noopener noreferrer" 
           class="view-listing-btn" title="View Full Listing">
          <span class="btn-icon">🔗</span>
          <span class="btn-text">View Listing</span>
        </a>
      </div>
    </div>
  `;
  
  // Attach event listeners
  attachEventListeners(card, listing);
  
  return card;
}

function attachEventListeners(card: HTMLElement, listing: RentalListing): void {
  const importBtn = card.querySelector('.import-btn') as HTMLButtonElement;
  
  // Add image error handler
  const img = card.querySelector('img[data-listing-image="true"]') as HTMLImageElement;
  const placeholder = card.querySelector('.image-placeholder') as HTMLElement;
  
  if (img && placeholder) {
    img.onerror = () => {
      img.style.display = 'none';
      placeholder.style.display = 'flex';
    };
  }
  
  if (importBtn) {
    importBtn.addEventListener('click', () => handleImport(importBtn, listing));
  }

  // Add click handler to card for potential future features (highlighting, etc.)
  card.addEventListener('click', (event) => {
    // Don't trigger if clicking on buttons or links
    if ((event.target as HTMLElement).closest('.listing-actions')) {
      return;
    }
    
    console.log(`[ListingCard] Card clicked: ${listing.title}`);
    // Future: Could dispatch event for map highlighting, detail view, etc.
  });
}

let importController: AbortController | null = null;

async function handleImport(button: HTMLButtonElement, listing: RentalListing): Promise<void> {
  // Prevent multiple simultaneous imports
  if (importController) {
    console.log('[ListingCard] Import already in progress');
    return;
  }

  importController = new AbortController();
  try {
    showImportLoading(button, true);
    
    console.log(`[ListingCard] Importing listing: ${listing.title}`);
    
    const rentalService = RentalListingService.getInstance();
    await rentalService.importListing(listing);
    
    // Show success state
    showImportSuccess(button);
    
    console.log(`[ListingCard] Successfully imported: ${listing.title}`);
    
  } catch (error) {
    console.error('[ListingCard] Import failed:', error);
    showImportError(button, error instanceof Error ? error.message : 'Import failed');
  } finally {
    importController = null;
  }
}

function showImportLoading(button: HTMLButtonElement, loading: boolean): void {
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

function showImportSuccess(button: HTMLButtonElement): void {
  const btnIcon = button.querySelector('.btn-icon') as HTMLElement;
  const btnText = button.querySelector('.btn-text') as HTMLElement;
  
  button.disabled = true;
  button.classList.add('import-success');
  
  if (btnIcon) btnIcon.textContent = '✅';
  if (btnText) btnText.textContent = 'Added!';
  
  // Reset after 3 seconds
  setTimeout(() => {
    button.disabled = false;
    button.classList.remove('import-success');
    if (btnIcon) btnIcon.textContent = '⭐';
    if (btnText) btnText.textContent = 'Add to My Locations';
  }, 3000);
}

function showImportError(button: HTMLButtonElement, error: string): void {
  const btnIcon = button.querySelector('.btn-icon') as HTMLElement;
  const btnText = button.querySelector('.btn-text') as HTMLElement;
  
  button.classList.add('import-error');
  
  if (btnIcon) btnIcon.textContent = '❌';
  if (btnText) btnText.textContent = 'Failed';
  
  // Show error in console and reset after 3 seconds
  console.error('[ListingCard] Import error:', error);
  
  setTimeout(() => {
    button.disabled = false;
    button.classList.remove('import-error');
    if (btnIcon) btnIcon.textContent = '⭐';
    if (btnText) btnText.textContent = 'Add to My Locations';
  }, 3000);
}

// Utility functions
function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
}

function formatPropertyType(type: string): string {
  switch (type) {
    case 'apartment': return 'Apartment';
    case 'house': return 'House';
    case 'condo': return 'Condo';
    case 'townhouse': return 'Townhouse';
    default: return type.charAt(0).toUpperCase() + type.slice(1);
  }
}