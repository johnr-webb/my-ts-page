import { LocationServiceInstance } from "../services/LocationsService";
import { LocationValidator, type ValidationResult } from "../services/LocationValidator.js";
import { UserServiceInstance } from "../services/UserService";
import type { EnhancedLocationItem } from "../types/ComparisonTypes";
import { createDefaultLocation } from "../types/ComparisonTypes";

// Create a validator map to avoid dynamic property access
const validatorMap: Record<string, (value: string) => ValidationResult> = {
  validateAddress: LocationValidator.validateAddress.bind(LocationValidator),
  validateRent: LocationValidator.validateRent.bind(LocationValidator),
  validateSquareFootage: LocationValidator.validateSquareFootage.bind(LocationValidator),
  validateBedrooms: LocationValidator.validateBedrooms.bind(LocationValidator),
  validateBathrooms: LocationValidator.validateBathrooms.bind(LocationValidator),
};

export function renderEnhancedForm(mount: HTMLElement) {
  mount.className = "add-location-card enhanced";
  mount.innerHTML = `
    <form id="enhanced-location-form" class="location-form enhanced-location-form">
      <h3>Add New Location</h3>
      
      <!-- Basic Information Section -->
      <div class="form-section">
        <h4 class="section-title">Basic Information</h4>
        
        <div class="form-group">
          <label for="location-type">Property Type</label>
          <select id="location-type" required>
            <option value="apartment">Apartment</option>
            <option value="house">House</option>
            <option value="condo">Condo</option>
            <option value="townhouse">Townhouse</option>
          </select>
        </div>
        
        <div class="form-group">
          <label for="location-name">Location Name</label>
          <input type="text" id="location-name" placeholder="e.g. Downtown Apartment" required />
        </div>
        
        <div class="form-group">
          <label for="location-address">Street Address</label>
          <input type="text" id="location-address" placeholder="Enter full address..." required />
          <span class="form-error" id="address-error"></span>
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label for="monthly-rent">Monthly Rent ($)</label>
            <input type="number" id="monthly-rent" placeholder="1500" min="500" max="10000" required />
            <span class="form-error" id="rent-error"></span>
          </div>
          
          <div class="form-group">
            <label for="square-footage">Square Feet</label>
            <input type="number" id="square-footage" placeholder="850" min="100" max="10000" required />
            <span class="form-error" id="sqft-error"></span>
          </div>
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label for="bedrooms">Bedrooms</label>
            <input type="number" id="bedrooms" placeholder="2" min="0" max="10" required />
            <span class="form-error" id="bedrooms-error"></span>
          </div>
          
          <div class="form-group">
            <label for="bathrooms">Bathrooms</label>
            <input type="number" id="bathrooms" placeholder="1.5" min="0" max="10" step="0.5" required />
            <span class="form-error" id="bathrooms-error"></span>
          </div>
        </div>
      </div>
      
      <!-- Amenities Section -->
      <div class="form-section">
        <button type="button" class="section-toggle" id="amenities-toggle">
          <span class="toggle-icon">▼</span> Amenities & Features
        </button>
        
        <div class="collapsible-section" id="amenities-section" style="display: none;">
          <h4 class="section-subtitle">Amenities</h4>
          
          <div class="amenity-group">
            <div class="amenity-item">
              <div class="amenity-header">
                <label class="checkbox-label">
                  <input type="checkbox" id="gym-has">
                  <span class="checkbox-custom"></span>
                  Gym
                </label>
              </div>
              <div class="rating-container" id="gym-rating-container" style="display: none;">
                <label class="rating-label">Rating:</label>
                <div class="star-rating" data-field="gym">
                  <span class="star" data-value="1">★</span>
                  <span class="star" data-value="2">★</span>
                  <span class="star" data-value="3">★</span>
                  <span class="star" data-value="4">★</span>
                  <span class="star" data-value="5">★</span>
                </div>
              </div>
            </div>
            
            <div class="amenity-item">
              <div class="amenity-header">
                <label class="checkbox-label">
                  <input type="checkbox" id="pool-has">
                  <span class="checkbox-custom"></span>
                  Pool
                </label>
              </div>
              <div class="rating-container" id="pool-rating-container" style="display: none;">
                <label class="rating-label">Rating:</label>
                <div class="star-rating" data-field="pool">
                  <span class="star" data-value="1">★</span>
                  <span class="star" data-value="2">★</span>
                  <span class="star" data-value="3">★</span>
                  <span class="star" data-value="4">★</span>
                  <span class="star" data-value="5">★</span>
                </div>
              </div>
            </div>
            
            <div class="amenity-item">
              <div class="amenity-header">
                <label class="checkbox-label">
                  <input type="checkbox" id="outdoor-has">
                  <span class="checkbox-custom"></span>
                  Outdoor Space
                </label>
              </div>
              <div class="rating-container" id="outdoor-rating-container" style="display: none;">
                <label class="rating-label">Rating:</label>
                <div class="star-rating" data-field="outdoor">
                  <span class="star" data-value="1">★</span>
                  <span class="star" data-value="2">★</span>
                  <span class="star" data-value="3">★</span>
                  <span class="star" data-value="4">★</span>
                  <span class="star" data-value="5">★</span>
                </div>
              </div>
            </div>
          </div>
          
          <h4 class="section-subtitle">Additional Features</h4>
          
          <div class="feature-group">
            <div class="form-group">
              <label for="parking">Parking</label>
              <select id="parking">
                <option value="true">Available</option>
                <option value="false">Not Available</option>
              </select>
            </div>
            
            <div class="form-group">
              <label for="laundry">Laundry</label>
              <select id="laundry">
                <option value="in-unit">In-Unit</option>
                <option value="building">Building</option>
                <option value="none">None</option>
              </select>
            </div>
            
            <div class="form-group">
              <label class="checkbox-label">
                <input type="checkbox" id="pets-allowed">
                <span class="checkbox-custom"></span>
                Pets Allowed
              </label>
            </div>
          </div>
          
          <div class="form-group">
            <label for="description">Additional Notes</label>
            <textarea id="description" placeholder="Any additional details about the property..." rows="3"></textarea>
          </div>
        </div>
      </div>
      
      <div class="form-actions">
        <button type="submit" class="btn btn-primary" id="submit-btn">
          <span class="btn-text">Add Location</span>
          <span class="btn-spinner" style="display: none;">Adding...</span>
        </button>
        <button type="button" class="btn btn-secondary" id="cancel-btn">Cancel</button>
      </div>
      
      <div class="form-error" id="form-error" role="alert"></div>
      <div class="form-success" id="form-success" role="alert"></div>
    </form>
  `;

  setupEventListeners(mount);
  setupValidation(mount);
}

function setupEventListeners(mount: HTMLElement) {
  const form = mount.querySelector<HTMLFormElement>("#enhanced-location-form");
  const amenitiesToggle = mount.querySelector<HTMLButtonElement>("#amenities-toggle");
  const amenitiesSection = mount.querySelector<HTMLDivElement>("#amenities-section");
  const toggleIcon = mount.querySelector<HTMLElement>(".toggle-icon");
  
  // Section toggle
  amenitiesToggle?.addEventListener("click", () => {
    if (!amenitiesSection || !toggleIcon) return;
    
    const isVisible = amenitiesSection.style.display !== "none";
    amenitiesSection.style.display = isVisible ? "none" : "block";
    toggleIcon.textContent = isVisible ? "▼" : "▲";
    toggleIcon.style.transform = isVisible ? "rotate(0deg)" : "rotate(180deg)";
  });

  // Amenity checkbox and rating interactions
  if (form) {
    setupAmenityInteractions(mount);
  }

  // Form submission
  form?.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (form) {
      await handleFormSubmit(form, mount);
    }
  });

  // Cancel button
  mount.querySelector("#cancel-btn")?.addEventListener("click", () => {
    form?.reset();
    clearAllErrors(mount);
  });
}

function setupAmenityInteractions(mount: HTMLElement) {
  const amenities = [
    { checkbox: "gym-has", rating: "gym-rating-container" },
    { checkbox: "pool-has", rating: "pool-rating-container" },
    { checkbox: "outdoor-has", rating: "outdoor-rating-container" }
  ];

  amenities.forEach(amenity => {
    const checkbox = mount.querySelector<HTMLInputElement>(`#${amenity.checkbox}`);
    const ratingContainer = mount.querySelector<HTMLDivElement>(`#${amenity.rating}`);
    
    checkbox?.addEventListener("change", () => {
      if (!ratingContainer) return;
      
      ratingContainer.style.display = checkbox.checked ? "block" : "none";
      if (!checkbox.checked) {
        clearStarRating(ratingContainer);
      }
    });
  });

  // Star rating interactions
  const starRatings = mount.querySelectorAll(".star-rating");
  starRatings.forEach(rating => {
    const stars = rating.querySelectorAll<HTMLElement>(".star");
    let currentRating = 0;

    stars.forEach((star, index) => {
      star.addEventListener("click", () => {
        currentRating = index + 1;
        updateStarDisplay(stars, currentRating);
      });

      star.addEventListener("mouseenter", () => {
        updateStarDisplay(stars, index + 1);
      });
    });

    rating.addEventListener("mouseleave", () => {
      updateStarDisplay(stars, currentRating);
    });
  });
}

function updateStarDisplay(stars: NodeListOf<HTMLElement>, rating: number) {
  stars.forEach((star, index) => {
    star.classList.toggle("active", index < rating);
    star.style.color = index < rating ? "var(--color-primary, #3f3d56)" : "var(--color-border-muted, #d1d5db)";
  });
}

function clearStarRating(ratingContainer: HTMLElement) {
  const stars = ratingContainer.querySelectorAll<HTMLElement>(".star");
  updateStarDisplay(stars, 0);
}

async function handleFormSubmit(form: HTMLFormElement, mount: HTMLElement) {
  clearAllErrors(mount);
  
  const submitBtn = mount.querySelector<HTMLButtonElement>("#submit-btn");
  const btnText = mount.querySelector<HTMLElement>(".btn-text");
  const btnSpinner = mount.querySelector<HTMLElement>(".btn-spinner");
  
  // Show loading state
  if (submitBtn) submitBtn.disabled = true;
  if (btnText) btnText.style.display = "none";
  if (btnSpinner) btnSpinner.style.display = "inline";

  try {
    // Collect form data
    const formData = collectFormData(form);
    
    // Validate all data
    const validation = LocationValidator.validateEnhancedLocation(formData);
    if (!validation.isValid) {
      showValidationErrors(mount, validation.errors);
      return;
    }

    // Create enhanced location item
    const locationItem = createEnhancedLocationItem(formData);
    
    // Geocode address and add to service
    await geocodeAndAddLocation(locationItem, mount);

  } catch (error) {
    console.error("Form submission error:", error);
    showFormError(mount, "An unexpected error occurred. Please try again.");
  } finally {
    // Reset loading state
    if (submitBtn) submitBtn.disabled = false;
    if (btnText) btnText.style.display = "inline";
    if (btnSpinner) btnSpinner.style.display = "none";
  }
}

function collectFormData(form: HTMLFormElement): any {
  const amenityRatings = getAmenityRatings(form);
  
  return {
    // Basic info
    type: form.querySelector<HTMLSelectElement>("#location-type")!.value,
    name: form.querySelector<HTMLInputElement>("#location-name")!.value.trim(),
    address: form.querySelector<HTMLInputElement>("#location-address")!.value.trim(),
    rent: parseFloat(form.querySelector<HTMLInputElement>("#monthly-rent")!.value) * 100, // Convert to cents
    squareFootage: parseInt(form.querySelector<HTMLInputElement>("#square-footage")!.value),
    bedrooms: parseInt(form.querySelector<HTMLInputElement>("#bedrooms")!.value),
    bathrooms: parseFloat(form.querySelector<HTMLInputElement>("#bathrooms")!.value),
    
    // Features
    parking: form.querySelector<HTMLSelectElement>("#parking")!.value === "true",
    laundry: form.querySelector<HTMLSelectElement>("#laundry")!.value as any,
    petsAllowed: form.querySelector<HTMLInputElement>("#pets-allowed")!.checked,
    description: form.querySelector<HTMLTextAreaElement>("#description")!.value.trim(),
    
    // Amenities with ratings
    amenities: {
      gym: amenityRatings.gym,
      pool: amenityRatings.pool,
      outdoorSpace: amenityRatings.outdoorSpace
    }
  };
}

function getAmenityRatings(form: HTMLFormElement): any {
  return {
    gym: {
      has: form.querySelector<HTMLInputElement>("#gym-has")!.checked,
      rating: getStarRating(form, "gym")
    },
    pool: {
      has: form.querySelector<HTMLInputElement>("#pool-has")!.checked,
      rating: getStarRating(form, "pool")
    },
    outdoorSpace: {
      has: form.querySelector<HTMLInputElement>("#outdoor-has")!.checked,
      rating: getStarRating(form, "outdoor")
    }
  };
}

function getStarRating(form: HTMLFormElement, field: string): number | undefined {
  const activeStars = form.querySelectorAll(`.star-rating[data-field="${field}"] .star.active`);
  return activeStars.length > 0 ? activeStars.length : undefined;
}

function createEnhancedLocationItem(formData: any): Omit<EnhancedLocationItem, 'id' | 'userId' | 'position'> {
  const baseLocation = createDefaultLocation();
  
  return {
    ...baseLocation,
    name: formData.name,
    type: formData.type,
    rent: formData.rent,
    squareFootage: formData.squareFootage,
    bedrooms: formData.bedrooms,
    bathrooms: formData.bathrooms,
    propertyType: formData.type,
    description: formData.description,
    amenities: formData.amenities,
    addedDate: new Date().toISOString(),
    lastUpdated: new Date().toISOString()
  };
}

async function geocodeAndAddLocation(locationItem: Omit<EnhancedLocationItem, 'id' | 'userId' | 'position'>, mount: HTMLElement) {
  const geocoder = new google.maps.Geocoder();
  
  try {
    const result = await geocoder.geocode({ address: locationItem.name || "" });
    
    if (result.results && result.results[0]) {
      const location = result.results[0].geometry.location;
      
      // Create basic location item for LocationService (which only stores basic fields)
      const basicLocationItem = {
        id: crypto.randomUUID(),
        userId: UserServiceInstance.getProfile().id,
        name: locationItem.name,
        type: locationItem.type,
        position: {
          lat: location.lat(),
          lng: location.lng()
        }
      };
      
      // Add to service
      LocationServiceInstance.add(basicLocationItem);
      
      showFormSuccess(mount, "Location added successfully!");
      
      // Reset form after successful submission
      const form = mount.querySelector<HTMLFormElement>("#enhanced-location-form");
      form?.reset();
      clearAllErrors(mount);
      
      // Reset amenity sections
      mount.querySelectorAll<HTMLElement>(".rating-container").forEach(container => {
        container.style.display = "none";
      });
      mount.querySelectorAll<HTMLInputElement>("[type='checkbox']").forEach(checkbox => {
        checkbox.checked = false;
      });
      
    } else {
      showFormError(mount, "Address not found. Please try a more specific address.");
    }
  } catch (e) {
    console.error("Geocoding failed:", e);
    showFormError(mount, "Error connecting to Google Geocoding service.");
  }
}

function setupValidation(mount: HTMLElement) {
  // Real-time validation setup
  const fields = [
    { id: "location-address", validator: "validateAddress" as const },
    { id: "monthly-rent", validator: "validateRent" as const },
    { id: "square-footage", validator: "validateSquareFootage" as const },
    { id: "bedrooms", validator: "validateBedrooms" as const },
    { id: "bathrooms", validator: "validateBathrooms" as const }
  ];

  fields.forEach(field => {
    const input = mount.querySelector<HTMLInputElement>(`#${field.id}`);
    input?.addEventListener("blur", () => {
      const value = input.value.trim();
      if (!value) return;
      
      const validation = validatorMap[field.validator](value);
      
      if (!validation.isValid) {
        showFieldError(mount, field.id, validation.message || "Invalid input");
      } else {
        clearFieldError(mount, field.id);
      }
    });
  });
}

function showValidationErrors(mount: HTMLElement, errors: Record<string, string>) {
  Object.entries(errors).forEach(([field, message]) => {
    showFieldError(mount, field, message);
  });
}

function showFieldError(mount: HTMLElement, fieldId: string, message: string) {
  const errorElement = mount.querySelector<HTMLElement>(`#${fieldId}-error`);
  if (errorElement) {
    errorElement.textContent = message;
    errorElement.style.display = "block";
  }
  
  const inputElement = mount.querySelector<HTMLInputElement>(`#${fieldId}`);
  if (inputElement) {
    inputElement.classList.add("error");
    inputElement.setAttribute("aria-invalid", "true");
  }
}

function clearFieldError(mount: HTMLElement, fieldId: string) {
  const errorElement = mount.querySelector<HTMLElement>(`#${fieldId}-error`);
  if (errorElement) {
    errorElement.textContent = "";
    errorElement.style.display = "none";
  }
  
  const inputElement = mount.querySelector<HTMLInputElement>(`#${fieldId}`);
  if (inputElement) {
    inputElement.classList.remove("error");
    inputElement.setAttribute("aria-invalid", "false");
  }
}

function showFormError(mount: HTMLElement, message: string) {
  const errorElement = mount.querySelector<HTMLElement>("#form-error");
  if (errorElement) {
    errorElement.textContent = message;
    errorElement.style.display = "block";
  }
}

function showFormSuccess(mount: HTMLElement, message: string) {
  const successElement = mount.querySelector<HTMLElement>("#form-success");
  if (successElement) {
    successElement.textContent = message;
    successElement.style.display = "block";
    
    // Hide success message after 3 seconds
    setTimeout(() => {
      successElement.style.display = "none";
    }, 3000);
  }
}

function clearAllErrors(mount: HTMLElement) {
  // Clear field errors
  mount.querySelectorAll<HTMLElement>(".form-error").forEach(error => {
    error.textContent = "";
    error.style.display = "none";
  });
  
  // Clear form-level errors
  const formError = mount.querySelector<HTMLElement>("#form-error");
  const formSuccess = mount.querySelector<HTMLElement>("#form-success");
  
  if (formError) formError.style.display = "none";
  if (formSuccess) formSuccess.style.display = "none";
  
  // Clear input error states
  mount.querySelectorAll<HTMLInputElement>(".error").forEach(input => {
    input.classList.remove("error");
    input.setAttribute("aria-invalid", "false");
  });
}