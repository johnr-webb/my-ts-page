/**
 * Basic Scoring Algorithms for Housing Hunt Application
 * Implements normalized scoring functions (0-100 scale) for different metrics
 * with weight configuration system and score explanations
 */

import type { EnhancedLocationItem } from '../types/ComparisonTypes';

/**
 * Score calculation configuration interface
 */
export interface ScoreConfig {
  weights: {
    commute: number;
    cost: number;
    amenities: number;
    size: number;
  };
  thresholds: {
    maxCommuteTime: number; // minutes
    maxRent: number; // cents
    minSquareFootage: number;
  };
}

/**
 * Score breakdown interface for detailed explanations
 */
export interface ScoreBreakdown {
  score: number;
  explanation: string;
  factors: Array<{
    factor: string;
    value: number;
    weight: number;
    contribution: number;
  }>;
}

/**
 * Combined score result with all individual scores and overall score
 */
export interface CombinedScores {
  locationId: string;
  commuteScore: ScoreBreakdown;
  costScore: ScoreBreakdown;
  amenityScore: ScoreBreakdown;
  sizeScore: ScoreBreakdown;
  overallScore: ScoreBreakdown;
}

/**
 * Default score configuration
 */
export const DEFAULT_SCORE_CONFIG: ScoreConfig = {
  weights: {
    commute: 0.4,
    cost: 0.3,
    amenities: 0.2,
    size: 0.1
  },
  thresholds: {
    maxCommuteTime: 60, // 60 minutes
    maxRent: 500000, // $5000 in cents
    minSquareFootage: 500
  }
};

/**
 * Commute Score Calculator
 * Scores based on travel time to work (0-100 scale)
 * Lower commute times = higher score
 */
export class CommuteScore {
  /**
   * Calculate commute score for a location
   */
  static calculate(location: EnhancedLocationItem): ScoreBreakdown {
    const factors: Array<{ factor: string; value: number; weight: number; contribution: number }> = [];
    let score = 0;

    if (!location.travelTimes) {
      return {
        score: 0,
        explanation: 'No travel time data available',
        factors: []
      };
    }

    const walkingTime = location.travelTimes.walking.duration / 60; // Convert to minutes
    const drivingTime = location.travelTimes.driving.duration / 60;
    const transitTime = location.travelTimes.transit.duration / 60;

    // Best commute time (minimum of all modes)
    const bestCommuteTime = Math.min(walkingTime, drivingTime, transitTime);
    factors.push({
      factor: 'Best Commute Time',
      value: bestCommuteTime,
      weight: 0.7,
      contribution: 0
    });

    // Score based on best commute time (0-100 scale)
    if (bestCommuteTime <= 15) {
      score = 100;
    } else if (bestCommuteTime <= 30) {
      score = 85;
    } else if (bestCommuteTime <= 45) {
      score = 70;
    } else if (bestCommuteTime <= DEFAULT_SCORE_CONFIG.thresholds.maxCommuteTime) {
      score = 50;
    } else {
      score = 25;
    }

    // Bonus for multiple good options
    const goodOptions = [walkingTime, drivingTime, transitTime]
      .filter(time => time <= 30).length;
    
    const bonusContribution = goodOptions >= 2 ? 10 : 0;
    score = Math.min(100, score + bonusContribution);
    
    factors.push({
      factor: 'Multiple Commute Options',
      value: goodOptions,
      weight: 0.3,
      contribution: bonusContribution
    });

    // Update factor contributions
    factors[0].contribution = score - bonusContribution;

    const explanation = this.generateCommuteExplanation(bestCommuteTime, goodOptions, score);

    return { score, explanation, factors };
  }

  /**
   * Generate explanation for commute score
   */
  private static generateCommuteExplanation(
    bestTime: number, 
    goodOptions: number, 
    score: number
  ): string {
    const timeRating = bestTime <= 15 ? 'excellent' : 
                      bestTime <= 30 ? 'good' : 
                      bestTime <= 45 ? 'fair' : 'poor';
    
    const scoreRating = score >= 80 ? 'excellent' : 
                       score >= 60 ? 'good' : 
                       score >= 40 ? 'fair' : 'poor';
    
    let explanation = `Best commute time is ${bestTime.toFixed(0)} minutes (${timeRating}, score: ${score.toFixed(0)}/100 - ${scoreRating})`;
    
    if (goodOptions >= 2) {
      explanation += `. ${goodOptions} transportation options under 30 minutes`;
    }
    
    return explanation;
  }
}

/**
 * Cost Score Calculator
 * Scores based on rent affordability (0-100 scale)
 * Lower rent = higher score (within reasonable bounds)
 */
export class CostScore {
  /**
   * Calculate cost score for a location
   */
  static calculate(
    location: EnhancedLocationItem, 
    allLocations: EnhancedLocationItem[]
  ): ScoreBreakdown {
    const factors: Array<{ factor: string; value: number; weight: number; contribution: number }> = [];
    let score = 50;

    if (location.rent <= 0) {
      return {
        score: 0,
        explanation: 'No rent data available',
        factors: []
      };
    }

    // Calculate rent range for normalization
    const rents = allLocations
      .map(loc => loc.rent)
      .filter(rent => rent > 0);

    if (rents.length === 0) {
      return {
        score: 50,
        explanation: 'No rent data available for comparison',
        factors: []
      };
    }

    const minRent = Math.min(...rents);
    const maxRent = Math.min(Math.max(...rents), DEFAULT_SCORE_CONFIG.thresholds.maxRent);
    const rentRange = maxRent - minRent;

    // Score based on rent (lower is better)
    let baseScore = 50;
    if (rentRange > 0) {
      baseScore = 100 - ((location.rent - minRent) / rentRange) * 100;
    } else {
      baseScore = 100; // All rents are the same
    }
    factors.push({
      factor: 'Relative Rent Cost',
      value: location.rent,
      weight: 0.8,
      contribution: baseScore
    });

    // Bonus for very affordable options
    let bonusContribution = 0;
    if (location.rent <= minRent * 1.1) {
      bonusContribution = 10;
    }

    // Penalty for very expensive options
    if (location.rent >= DEFAULT_SCORE_CONFIG.thresholds.maxRent * 0.8) {
      bonusContribution = Math.max(-15, bonusContribution - 15);
    }

    score = Math.max(0, Math.min(100, baseScore + bonusContribution));
    
    factors.push({
      factor: 'Affordability Adjustment',
      value: bonusContribution,
      weight: 0.2,
      contribution: bonusContribution
    });

    const explanation = this.generateCostExplanation(location.rent, minRent, maxRent, score);

    return { score, explanation, factors };
  }

  /**
   * Generate explanation for cost score
   */
  private static generateCostExplanation(
    rent: number, 
    minRent: number, 
    maxRent: number, 
    score: number
  ): string {
    const rentFormatted = (rent / 100).toFixed(0);
    const rentRange = maxRent - minRent;
    const percentile = rentRange > 0 ? 
      ((maxRent - rent) / (maxRent - minRent)) * 100 : 50;
    
    const affordability = score >= 80 ? 'very affordable' : 
                          score >= 60 ? 'affordable' : 
                          score >= 40 ? 'moderately priced' : 'expensive';
    
    return `Rent is $${rentFormatted}/month (${affordability}, ${percentile.toFixed(0)}th percentile)`;
  }
}

/**
 * Amenity Score Calculator
 * Scores based on available amenities and their quality (0-100 scale)
 * More/better amenities = higher score
 */
export class AmenityScore {
  /**
   * Calculate amenity score for a location
   */
  static calculate(location: EnhancedLocationItem): ScoreBreakdown {
    const factors: Array<{ factor: string; value: number; weight: number; contribution: number }> = [];
    let score = 0;
    const amenities = location.amenities;

    // Basic amenities (0-40 points)
    let basicScore = 0;
    if (amenities.parking) {
      basicScore += 10;
      factors.push({
        factor: 'Parking',
        value: 1,
        weight: 0.25,
        contribution: 10
      });
    }

    if (amenities.laundry === 'in-unit') {
      basicScore += 15;
      factors.push({
        factor: 'In-unit Laundry',
        value: 1,
        weight: 0.375,
        contribution: 15
      });
    } else if (amenities.laundry === 'building') {
      basicScore += 8;
      factors.push({
        factor: 'Building Laundry',
        value: 1,
        weight: 0.2,
        contribution: 8
      });
    }

    if (amenities.pets) {
      basicScore += 5;
      factors.push({
        factor: 'Pet Friendly',
        value: 1,
        weight: 0.125,
        contribution: 5
      });
    }

    // Rated amenities (0-60 points)
    const ratedAmenities = [
      { amenity: amenities.gym, name: 'Gym', weight: 0.2 },
      { amenity: amenities.pool, name: 'Pool', weight: 0.2 },
      { amenity: amenities.outdoorSpace, name: 'Outdoor Space', weight: 0.2 }
    ];

    for (const { amenity, name, weight } of ratedAmenities) {
      if (amenity.has) {
        let contribution = 0;
        if (amenity.rating) {
          // Score based on rating (1-5 stars)
          contribution = (amenity.rating / 5) * 20;
          factors.push({
            factor: `${name} Quality`,
            value: amenity.rating,
            weight,
            contribution
          });
        } else {
          // Has amenity but no rating - give partial credit
          contribution = 20 * 0.6;
          factors.push({
            factor: `${name} Available`,
            value: 1,
            weight,
            contribution
          });
        }
        score += contribution;
      }
    }

    score += basicScore;
    score = Math.min(100, score);

    const explanation = this.generateAmenityExplanation(amenities, score);

    return { score, explanation, factors };
  }

  /**
   * Generate explanation for amenity score
   */
  private static generateAmenityExplanation(amenities: any, score: number): string {
    const amenityFeatures = [];
    
    if (amenities.parking) amenityFeatures.push('parking');
    if (amenities.laundry !== 'none') amenityFeatures.push(`${amenities.laundry} laundry`);
    if (amenities.pets) amenityFeatures.push('pet-friendly');
    if (amenities.gym.has) amenityFeatures.push('gym');
    if (amenities.pool.has) amenityFeatures.push('pool');
    if (amenities.outdoorSpace.has) amenityFeatures.push('outdoor space');

    const quality = score >= 80 ? 'excellent' : 
                   score >= 60 ? 'good' : 
                   score >= 40 ? 'moderate' : 'limited';
    
    return `${amenityFeatures.length} amenities: ${amenityFeatures.join(', ')} (${quality})`;
  }
}

/**
 * Size Score Calculator
 * Scores based on square footage and room counts (0-100 scale)
 * Larger spaces and better room ratios = higher score
 */
export class SizeScore {
  /**
   * Calculate size score for a location
   */
  static calculate(
    location: EnhancedLocationItem, 
    allLocations: EnhancedLocationItem[]
  ): ScoreBreakdown {
    const factors: Array<{ factor: string; value: number; weight: number; contribution: number }> = [];
    let score = 0;

    if (location.squareFootage <= 0) {
      return {
        score: 0,
        explanation: 'No size data available',
        factors: []
      };
    }

    // Calculate size ranges for normalization
    const sizes = allLocations
      .filter(loc => loc.squareFootage > 0)
      .map(loc => loc.squareFootage);

    if (sizes.length === 0) {
      return {
        score: 50,
        explanation: 'No size data available for comparison',
        factors: []
      };
    }

    const minSize = Math.min(...sizes);
    const maxSize = Math.max(...sizes);
    const sizeRange = maxSize - minSize;

    // Score based on square footage (0-50 points)
    let sizeScore = 0;
    if (sizeRange > 0) {
      sizeScore = ((location.squareFootage - minSize) / sizeRange) * 50;
    } else {
      sizeScore = 25; // All sizes are the same
    }
    factors.push({
      factor: 'Relative Square Footage',
      value: location.squareFootage,
      weight: 0.5,
      contribution: sizeScore
    });

    // Bonus for reasonable minimum size
    let bonusScore = 0;
    if (location.squareFootage >= DEFAULT_SCORE_CONFIG.thresholds.minSquareFootage) {
      bonusScore = 10;
    }
    factors.push({
      factor: 'Minimum Size Requirement',
      value: location.squareFootage >= DEFAULT_SCORE_CONFIG.thresholds.minSquareFootage ? 1 : 0,
      weight: 0.1,
      contribution: bonusScore
    });

    // Score based on bedrooms (0-30 points)
    let bedroomScore = 0;
    if (location.bedrooms >= 1) bedroomScore += 10;
    if (location.bedrooms >= 2) bedroomScore += 10;
    if (location.bedrooms >= 3) bedroomScore += 10;
    
    factors.push({
      factor: 'Bedroom Count',
      value: location.bedrooms,
      weight: 0.3,
      contribution: bedroomScore
    });

    // Score based on bathrooms (0-10 points)
    let bathroomScore = 0;
    if (location.bathrooms >= 1) bathroomScore += 5;
    if (location.bathrooms >= 2) bathroomScore += 5;
    
    factors.push({
      factor: 'Bathroom Count',
      value: location.bathrooms,
      weight: 0.1,
      contribution: bathroomScore
    });

    score = sizeScore + bonusScore + bedroomScore + bathroomScore;
    score = Math.min(100, Math.max(0, score));

    const explanation = this.generateSizeExplanation(
      location.squareFootage, 
      location.bedrooms, 
      location.bathrooms, 
      score
    );

    return { score, explanation, factors };
  }

  /**
   * Generate explanation for size score
   */
  private static generateSizeExplanation(
    sqft: number, 
    bedrooms: number, 
    bathrooms: number, 
    score: number
  ): string {
    const sizeRating = score >= 80 ? 'spacious' : 
                      score >= 60 ? 'comfortable' : 
                      score >= 40 ? 'adequate' : 'compact';
    
    const rooms = `${bedrooms}bed/${bathrooms}bath`;
    
    return `${sqft} sq ft, ${rooms} (${sizeRating})`;
  }
}

/**
 * Score Combiner
 * Combines individual scores with configurable weights
 */
export class ScoreCombiner {
  /**
   * Calculate combined scores for a location
   */
  static calculateCombinedScores(
    location: EnhancedLocationItem,
    allLocations: EnhancedLocationItem[],
    config: ScoreConfig = DEFAULT_SCORE_CONFIG
  ): CombinedScores {
    const commuteScore = CommuteScore.calculate(location);
    const costScore = CostScore.calculate(location, allLocations);
    const amenityScore = AmenityScore.calculate(location);
    const sizeScore = SizeScore.calculate(location, allLocations);

    // Calculate weighted overall score
    const overallScoreValue = 
      commuteScore.score * config.weights.commute +
      costScore.score * config.weights.cost +
      amenityScore.score * config.weights.amenities +
      sizeScore.score * config.weights.size;

    const overallScore: ScoreBreakdown = {
      score: overallScoreValue,
      explanation: this.generateOverallExplanation(config.weights),
      factors: [
        {
          factor: 'Commute Score',
          value: commuteScore.score,
          weight: config.weights.commute,
          contribution: commuteScore.score * config.weights.commute
        },
        {
          factor: 'Cost Score',
          value: costScore.score,
          weight: config.weights.cost,
          contribution: costScore.score * config.weights.cost
        },
        {
          factor: 'Amenity Score',
          value: amenityScore.score,
          weight: config.weights.amenities,
          contribution: amenityScore.score * config.weights.amenities
        },
        {
          factor: 'Size Score',
          value: sizeScore.score,
          weight: config.weights.size,
          contribution: sizeScore.score * config.weights.size
        }
      ]
    };

    return {
      locationId: location.id,
      commuteScore,
      costScore,
      amenityScore,
      sizeScore,
      overallScore
    };
  }

  /**
   * Generate explanation for overall score
   */
  private static generateOverallExplanation(weights: ScoreConfig['weights']): string {
    const weightKeys: Array<keyof ScoreConfig['weights']> = ['commute', 'cost', 'amenities', 'size'];
    const sortedWeights = weightKeys
      .map(key => ({ key, value: weights[key] }))
      .sort((a, b) => b.value - a.value)
      .map(({ key }) => key.charAt(0).toUpperCase() + key.slice(1));

    return `Overall score weighted by: ${sortedWeights.join(', ')}`;
  }
}

/**
 * Utility functions for score calculations
 */
export class ScoreUtils {
  /**
   * Normalize a value to 0-100 scale
   */
  static normalizeToScale(
    value: number, 
    min: number, 
    max: number, 
    invert: boolean = false
  ): number {
    if (max === min) return 50; // All values are the same
    
    const normalized = ((value - min) / (max - min)) * 100;
    return invert ? Math.max(0, 100 - normalized) : Math.min(100, Math.max(0, normalized));
  }

  /**
   * Validate score configuration
   */
static validateConfig(config: ScoreConfig): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check weight sum
    const weightKeys: Array<keyof ScoreConfig['weights']> = ['commute', 'cost', 'amenities', 'size'];
    const weightSum = weightKeys.reduce((sum, key) => sum + config.weights[key], 0);
    if (Math.abs(weightSum - 1.0) > 0.01) {
      errors.push(`Weights must sum to 1.0, current sum: ${weightSum.toFixed(3)}`);
    }

    // Check individual weights
    for (const key of weightKeys) {
      const weight = config.weights[key];
      if (weight < 0 || weight > 1) {
        errors.push(`${key} weight must be between 0 and 1, current: ${weight}`);
      }
    }

    // Check thresholds
    if (config.thresholds.maxCommuteTime <= 0) {
      errors.push('Max commute time must be positive');
    }
    if (config.thresholds.maxRent <= 0) {
      errors.push('Max rent must be positive');
    }
    if (config.thresholds.minSquareFootage <= 0) {
      errors.push('Min square footage must be positive');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Get default configuration
   */
  static getDefaultConfig(): ScoreConfig {
    return { ...DEFAULT_SCORE_CONFIG };
  }

  /**
   * Create custom configuration with validation
   */
  static createConfig(customConfig: Partial<ScoreConfig>): ScoreConfig {
    const mergedConfig = {
      weights: { ...DEFAULT_SCORE_CONFIG.weights, ...customConfig.weights },
      thresholds: { ...DEFAULT_SCORE_CONFIG.thresholds, ...customConfig.thresholds }
    };

    const validation = ScoreUtils.validateConfig(mergedConfig);
    if (!validation.isValid) {
      console.warn('Invalid score configuration:', validation.errors);
      return DEFAULT_SCORE_CONFIG;
    }

    return mergedConfig;
  }
}