/**
 * Analytics Engine for Housing Hunt Application
 * Provides extensible plugin architecture for scoring algorithms,
 * event-driven calculation triggers, and configuration-based metric weights
 */

import type { EnhancedLocationItem } from '../types/ComparisonTypes';
import { CommuteScore, CostScore, AmenityScore, SizeScore } from '../utils/Calculators';

/**
 * Analytics plugin interface for extensible scoring algorithms
 */
export interface AnalyticsPlugin {
  id: string;
  name: string;
  description: string;
  calculate(locations: EnhancedLocationItem[], _config: AnalyticsConfig): AnalyticsResult;
  getWeight(_config: AnalyticsConfig): number;
}

/**
 * Analytics result interface for scoring calculations
 */
export interface AnalyticsResult {
  scores: Record<string, number>; // Location ID -> Score (0-100)
  insights: string[];
  recommendations: string[];
  metadata: {
    calculationTime: number;
    locationsProcessed: number;
    pluginId: string;
  };
}

/**
 * Analytics configuration interface for metric weights and plugin settings
 */
export interface AnalyticsConfig {
  weights: {
    commute: number;
    cost: number;
    amenities: number;
    size: number;
  };
  plugins: {
    [pluginId: string]: unknown;
  };
  thresholds: {
    maxCommuteTime: number; // minutes
    maxRent: number; // cents
    minSquareFootage: number;
  };
}

/**
 * Combined analytics results from all plugins
 */
export interface CombinedAnalyticsResult {
  overallScores: Record<string, number>; // Location ID -> Overall Score (0-100)
  pluginScores: Record<string, Record<string, number>>; // Plugin ID -> Location ID -> Score
  insights: string[];
  recommendations: string[];
  topLocations: Array<{
    id: string;
    score: number;
    rank: number;
  }>;
  metadata: {
    calculationTime: number;
    locationsProcessed: number;
    pluginsExecuted: string[];
  };
}

/**
 * Analytics Engine class with plugin architecture
 */
export class AnalyticsEngine {
  private static instance: AnalyticsEngine;
  private plugins: Map<string, AnalyticsPlugin> = new Map();
  private eventTarget: EventTarget = new EventTarget();
  public config: AnalyticsConfig;
  private isCalculating: boolean = false;

  public constructor(config?: Partial<AnalyticsConfig>) {
    this.config = {
      weights: {
        commute: 0.4,
        cost: 0.3,
        amenities: 0.2,
        size: 0.1
      },
      plugins: {},
      thresholds: {
        maxCommuteTime: 60, // 60 minutes
        maxRent: 500000, // $5000 in cents
        minSquareFootage: 500
      },
      ...config
    };

    // Register core plugins
    this.registerCorePlugins();
  }

  /**
   * Get singleton instance of AnalyticsEngine
   */
  static getInstance(config?: Partial<AnalyticsConfig>): AnalyticsEngine {
    if (!AnalyticsEngine.instance) {
      AnalyticsEngine.instance = new AnalyticsEngine(config);
    }
    return AnalyticsEngine.instance;
  }

  /**
   * Register a new analytics plugin
   */
  registerPlugin(plugin: AnalyticsPlugin): void {
    if (this.plugins.has(plugin.id)) {
      console.warn(`Plugin ${plugin.id} is already registered. Overwriting...`);
    }
    this.plugins.set(plugin.id, plugin);
    this.dispatchEvent('pluginRegistered', { pluginId: plugin.id });
  }

  /**
   * Unregister an analytics plugin
   */
  unregisterPlugin(pluginId: string): boolean {
    const removed = this.plugins.delete(pluginId);
    if (removed) {
      this.dispatchEvent('pluginUnregistered', { pluginId });
    }
    return removed;
  }

  /**
   * Get all registered plugins
   */
  getPlugins(): AnalyticsPlugin[] {
    return Array.from(this.plugins.values());
  }

  /**
   * Get a specific plugin by ID
   */
  getPlugin(pluginId: string): AnalyticsPlugin | undefined {
    return this.plugins.get(pluginId);
  }

  /**
   * Update analytics configuration
   */
  updateConfig(config: Partial<AnalyticsConfig>): void {
    this.config = {
      ...this.config,
      ...config,
      weights: { ...this.config.weights, ...config.weights },
      plugins: { ...this.config.plugins, ...config.plugins },
      thresholds: { ...this.config.thresholds, ...config.thresholds }
    };
    this.dispatchEvent('configUpdated', { config: this.config });
  }

  /**
   * Get current analytics configuration
   */
  getConfig(): AnalyticsConfig {
    return { ...this.config };
  }

  /**
   * Calculate analytics for all locations using all registered plugins
   */
  async calculateAnalytics(locations: EnhancedLocationItem[]): Promise<CombinedAnalyticsResult> {
    if (this.isCalculating) {
      throw new Error('Analytics calculation is already in progress');
    }

    this.isCalculating = true;
    const startTime = performance.now();

    try {
      this.dispatchEvent('calculationStarted', { locationsCount: locations.length });

      const pluginResults: Record<string, AnalyticsResult> = {};
      const pluginScores: Record<string, Record<string, number>> = {};
      const allInsights: string[] = [];
      const allRecommendations: string[] = [];

      // Execute each plugin
      for (const plugin of this.plugins.values()) {
        try {
          this.dispatchEvent('pluginCalculationStarted', { 
            pluginId: plugin.id, 
            pluginName: plugin.name 
          });

          const result = plugin.calculate(locations, this.config);
          pluginResults[plugin.id] = result;
          pluginScores[plugin.id] = result.scores;
          
          allInsights.push(...result.insights);
          allRecommendations.push(...result.recommendations);

          this.dispatchEvent('pluginCalculationCompleted', {
            pluginId: plugin.id,
            result
          });
        } catch (error) {
          console.error(`Error in plugin ${plugin.id}:`, error);
          this.dispatchEvent('pluginCalculationError', {
            pluginId: plugin.id,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }

      // Calculate weighted overall scores
      const overallScores = this.calculateOverallScores(pluginScores, locations);

      // Determine top locations
      const topLocations = this.getTopLocations(overallScores);

      const calculationTime = performance.now() - startTime;
      const result: CombinedAnalyticsResult = {
        overallScores,
        pluginScores,
        insights: allInsights,
        recommendations: allRecommendations,
        topLocations,
        metadata: {
          calculationTime,
          locationsProcessed: locations.length,
          pluginsExecuted: Object.keys(pluginResults)
        }
      };

      this.dispatchEvent('calculationCompleted', { result });
      return result;

    } finally {
      this.isCalculating = false;
    }
  }

  /**
   * Calculate weighted overall scores from plugin scores
   */
  private calculateOverallScores(
    pluginScores: Record<string, Record<string, number>>,
    locations: EnhancedLocationItem[]
  ): Record<string, number> {
    const overallScores: Record<string, number> = {};

    for (const location of locations) {
      let weightedScore = 0;

      // Calculate weighted average using plugin weights
      for (const [pluginId, scores] of Object.entries(pluginScores)) {
        const locationScore = scores[location.id] || 0;
        const weight = this.getPluginWeight(pluginId);
        weightedScore += locationScore * weight;
      }

      overallScores[location.id] = weightedScore;
    }

    return overallScores;
  }

  /**
   * Get weight for a specific plugin
   */
  private getPluginWeight(pluginId: string): number {
    switch (pluginId) {
      case 'commute-score':
        return this.config.weights.commute;
      case 'cost-score':
        return this.config.weights.cost;
      case 'amenities-score':
        return this.config.weights.amenities;
      case 'size-score':
        return this.config.weights.size;
      default:
        return 0.25; // Default weight for unknown plugins
    }
  }

  /**
   * Get top locations based on overall scores
   */
  private getTopLocations(overallScores: Record<string, number>): Array<{
    id: string;
    score: number;
    rank: number;
  }> {
    const sorted = Object.entries(overallScores)
      .sort(([, a], [, b]) => b - a)
      .map(([id, score], index) => ({
        id,
        score,
        rank: index + 1
      }));

    return sorted;
  }

  /**
   * Add event listener for analytics events
   */
  /**
   * Add event listener for analytics events
   */
  addEventListener<T = unknown>(type: string, listener: (event: CustomEvent<T>) => void): void {
    this.eventTarget.addEventListener(type, listener as EventListener);
  }

  /**
   * Remove event listener for analytics events
   */
  removeEventListener<T = unknown>(type: string, listener: (event: CustomEvent<T>) => void): void {
    this.eventTarget.removeEventListener(type, listener as EventListener);
  }

  /**
   * Dispatch custom event
   */
  /**
   * Dispatch custom event with proper typing
   */
  private dispatchEvent<T = unknown>(type: string, detail: T): void {
    const event = new CustomEvent<T>(type, { detail });
    this.eventTarget.dispatchEvent(event);
  }

  /**
   * Reset analytics engine to default state
   */
  reset(): void {
    this.plugins.clear();
    this.config = {
      weights: {
        commute: 0.4,
        cost: 0.3,
        amenities: 0.2,
        size: 0.1
      },
      plugins: {},
      thresholds: {
        maxCommuteTime: 60,
        maxRent: 500000,
        minSquareFootage: 500
      }
    };
    this.registerCorePlugins();
    this.dispatchEvent('engineReset', {});
  }

  /**
   * Register core analytics plugins
   */
  private registerCorePlugins(): void {
    this.registerPlugin(new CommuteScorePlugin());
    this.registerPlugin(new CostScorePlugin());
    this.registerPlugin(new AmenityScorePlugin());
    this.registerPlugin(new SizeScorePlugin());
  }
}

/**
 * Base class for analytics plugins with common functionality
 */
abstract class BaseAnalyticsPlugin implements AnalyticsPlugin {
  abstract id: string;
  abstract name: string;
  abstract description: string;

  abstract calculate(locations: EnhancedLocationItem[], _config: AnalyticsConfig): AnalyticsResult;

  getWeight(_config: AnalyticsConfig): number {
    return 0.25; // Default weight
  }

  /**
   * Create a standard analytics result
   */
  protected createResult(
    scores: Record<string, number>,
    insights: string[],
    recommendations: string[],
    pluginId: string,
    startTime: number
  ): AnalyticsResult {
    return {
      scores,
      insights,
      recommendations,
      metadata: {
        calculationTime: performance.now() - startTime,
        locationsProcessed: Object.keys(scores).length,
        pluginId
      }
    };
  }
}

/**
 * Commute Score Plugin - Scores based on travel time to work
 */
export class CommuteScorePlugin extends BaseAnalyticsPlugin {
  id = 'commute-score';
  name = 'Commute Score';
  description = 'Scores locations based on travel time to work';

  calculate(locations: EnhancedLocationItem[], _config: AnalyticsConfig): AnalyticsResult {
    const startTime = performance.now();
    const scores: Record<string, number> = {};
    const insights: string[] = [];
    const recommendations: string[] = [];

    // Use the centralized calculator
    for (const location of locations) {
      const result = CommuteScore.calculate(location);
      scores[location.id] = result.score;
      insights.push(result.explanation);
    }

    return this.createResult(scores, insights, recommendations, this.id, startTime);
  }
}

/**
 * Cost Score Plugin - Scores based on rent affordability and value
 */
export class CostScorePlugin extends BaseAnalyticsPlugin {
  id = 'cost-score';
  name = 'Cost Score';
  description = 'Scores locations based on rent affordability and value';

  calculate(locations: EnhancedLocationItem[], _config: AnalyticsConfig): AnalyticsResult {
    const startTime = performance.now();
    const scores: Record<string, number> = {};
    const insights: string[] = [];
    const recommendations: string[] = [];

    // Use the centralized calculator
    for (const location of locations) {
      const result = CostScore.calculate(location, locations);
      scores[location.id] = result.score;
      insights.push(result.explanation);
    }

    // Generate additional insights
    const rents = locations.map(loc => loc.rent).filter(rent => rent > 0);
    if (rents.length > 0) {
      const avgRent = rents.reduce((a, b) => a + b, 0) / rents.length;
      insights.push(`Average rent: $${(avgRent / 100).toFixed(0)}`);
      
      const affordableCount = rents.filter(rent => rent <= 500000 * 0.6).length;
      if (affordableCount > 0) {
        recommendations.push(`${affordableCount} locations are particularly affordable`);
      }
    }

    return this.createResult(scores, insights, recommendations, this.id, startTime);
  }
}

/**
 * Amenity Score Plugin - Scores based on available amenities and their quality
 */
export class AmenityScorePlugin extends BaseAnalyticsPlugin {
  id = 'amenities-score';
  name = 'Amenity Score';
  description = 'Scores locations based on available amenities and their quality ratings';

  calculate(locations: EnhancedLocationItem[], _config: AnalyticsConfig): AnalyticsResult {
    const startTime = performance.now();
    const scores: Record<string, number> = {};
    const insights: string[] = [];
    const recommendations: string[] = [];

    // Use centralized calculator
    for (const location of locations) {
      const result = AmenityScore.calculate(location);
      scores[location.id] = result.score;
      insights.push(result.explanation);
    }

    return this.createResult(scores, insights, recommendations, this.id, startTime);
  }
}

/**
 * Size Score Plugin - Scores based on square footage and room counts
 */
export class SizeScorePlugin extends BaseAnalyticsPlugin {
  id = 'size-score';
  name = 'Size Score';
  description = 'Scores locations based on square footage and room counts';

  calculate(locations: EnhancedLocationItem[], _config: AnalyticsConfig): AnalyticsResult {
    const startTime = performance.now();
    const scores: Record<string, number> = {};
    const insights: string[] = [];
    const recommendations: string[] = [];

    // Use centralized calculator
    for (const location of locations) {
      const result = SizeScore.calculate(location, locations);
      scores[location.id] = result.score;
      insights.push(result.explanation);
    }

    return this.createResult(scores, insights, recommendations, this.id, startTime);
  }
}