

export interface ValidationResult {
  isValid: boolean;
  message?: string;
}

export interface ValidationErrors {
  [fieldName: string]: string;
}

export interface CompleteValidationResult {
  isValid: boolean;
  errors: ValidationErrors;
}

export class LocationValidator {
  
  // Individual field validators
  static validateAddress(address: string): ValidationResult {
    if (!address || address.trim().length === 0) {
      return { isValid: false, message: "Address is required" };
    }
    
    if (address.trim().length < 5) {
      return { isValid: false, message: "Address must be at least 5 characters long" };
    }
    
    // Basic address pattern check (simplified)
    const addressPattern = /^\\d+\\s+[a-zA-Z].+/;
    if (!addressPattern.test(address.trim())) {
      return { isValid: false, message: "Please enter a valid street address (e.g., 123 Main St)" };
    }
    
    return { isValid: true };
  }
  
  static validateRent(rent: string): ValidationResult {
    const rentValue = parseFloat(rent);
    
    if (!rent || isNaN(rentValue)) {
      return { isValid: false, message: "Rent amount is required" };
    }
    
    if (rentValue < 500) {
      return { isValid: false, message: "Rent must be at least $500" };
    }
    
    if (rentValue > 10000) {
      return { isValid: false, message: "Rent must be less than $10,000" };
    }
    
    return { isValid: true };
  }
  
  static validateSquareFootage(sqft: string): ValidationResult {
    const sqftValue = parseInt(sqft);
    
    if (!sqft || isNaN(sqftValue)) {
      return { isValid: false, message: "Square footage is required" };
    }
    
    if (sqftValue < 100) {
      return { isValid: false, message: "Square footage must be at least 100" };
    }
    
    if (sqftValue > 10000) {
      return { isValid: false, message: "Square footage must be less than 10,000" };
    }
    
    return { isValid: true };
  }
  
  static validateBedrooms(bedrooms: string): ValidationResult {
    const bedroomValue = parseInt(bedrooms);
    
    if (!bedrooms || isNaN(bedroomValue)) {
      return { isValid: false, message: "Number of bedrooms is required" };
    }
    
    if (bedroomValue < 0) {
      return { isValid: false, message: "Bedrooms cannot be negative" };
    }
    
    if (bedroomValue > 10) {
      return { isValid: false, message: "Bedrooms cannot exceed 10" };
    }
    
    if (!Number.isInteger(bedroomValue)) {
      return { isValid: false, message: "Bedrooms must be a whole number" };
    }
    
    return { isValid: true };
  }
  
  static validateBathrooms(bathrooms: string): ValidationResult {
    const bathroomValue = parseFloat(bathrooms);
    
    if (!bathrooms || isNaN(bathroomValue)) {
      return { isValid: false, message: "Number of bathrooms is required" };
    }
    
    if (bathroomValue < 0) {
      return { isValid: false, message: "Bathrooms cannot be negative" };
    }
    
    if (bathroomValue > 10) {
      return { isValid: false, message: "Bathrooms cannot exceed 10" };
    }
    
    return { isValid: true };
  }
  
  static validateName(name: string): ValidationResult {
    if (!name || name.trim().length === 0) {
      return { isValid: false, message: "Location name is required" };
    }
    
    if (name.trim().length < 2) {
      return { isValid: false, message: "Location name must be at least 2 characters long" };
    }
    
    if (name.trim().length > 100) {
      return { isValid: false, message: "Location name cannot exceed 100 characters" };
    }
    
    return { isValid: true };
  }
  
  // Comprehensive validation for the entire enhanced location
  static validateEnhancedLocation(data: any): CompleteValidationResult {
    const errors: ValidationErrors = {};
    
    // Validate basic fields
    const nameValidation = this.validateName(data.name);
    if (!nameValidation.isValid) {
      errors.name = nameValidation.message!;
    }
    
    const addressValidation = this.validateAddress(data.address);
    if (!addressValidation.isValid) {
      errors.address = addressValidation.message!;
    }
    
    const rentValidation = this.validateRent(data.rent.toString());
    if (!rentValidation.isValid) {
      errors.rent = rentValidation.message!;
    }
    
    const sqftValidation = this.validateSquareFootage(data.squareFootage.toString());
    if (!sqftValidation.isValid) {
      errors.squareFootage = sqftValidation.message!;
    }
    
    const bedroomsValidation = this.validateBedrooms(data.bedrooms.toString());
    if (!bedroomsValidation.isValid) {
      errors.bedrooms = bedroomsValidation.message!;
    }
    
    const bathroomsValidation = this.validateBathrooms(data.bathrooms.toString());
    if (!bathroomsValidation.isValid) {
      errors.bathrooms = bathroomsValidation.message!;
    }
    
    // Validate amenities (optional fields)
    if (data.amenities) {
      const amenityValidation = this.validateAmenities(data.amenities);
      if (!amenityValidation.isValid) {
        errors.amenities = amenityValidation.message!;
      }
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }
  
  static validateAmenities(amenities: any): ValidationResult {
    if (!amenities || typeof amenities !== 'object') {
      return { isValid: false, message: "Invalid amenities data" };
    }
    
    // Validate gym amenities
    if (amenities.gym) {
      if (amenities.gym.has && amenities.gym.rating) {
        if (amenities.gym.rating < 1 || amenities.gym.rating > 5) {
          return { isValid: false, message: "Gym rating must be between 1 and 5 stars" };
        }
      }
    }
    
    // Validate pool amenities
    if (amenities.pool) {
      if (amenities.pool.has && amenities.pool.rating) {
        if (amenities.pool.rating < 1 || amenities.pool.rating > 5) {
          return { isValid: false, message: "Pool rating must be between 1 and 5 stars" };
        }
      }
    }
    
    // Validate outdoor space amenities
    if (amenities.outdoorSpace) {
      if (amenities.outdoorSpace.has && amenities.outdoorSpace.rating) {
        if (amenities.outdoorSpace.rating < 1 || amenities.outdoorSpace.rating > 5) {
          return { isValid: false, message: "Outdoor space rating must be between 1 and 5 stars" };
        }
      }
    }
    
    return { isValid: true };
  }
  
  // Utility method to sanitize and normalize input
  static sanitizeInput(input: string): string {
    return input
      .replace(/<[^>]*>/g, "") // Remove HTML tags
      .replace(/[<>'"]/g, "") // Remove potentially dangerous characters
      .trim()
      .substring(0, 500); // Limit length
  }
}