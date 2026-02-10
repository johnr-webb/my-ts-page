import type { EnhancedLocationItem, TravelTimes } from "../types/ComparisonTypes";
import { UserServiceInstance } from "./UserService";

export interface CacheEntry {
  data: TravelTimes;
  timestamp: number;
  workCoords: { lat: number; lng: number; };
}

export interface CacheStats {
  totalEntries: number;
  expiredEntries: number;
  hitRate: number;
  lastCleanup: number;
}

export class TravelTimeCache {
  private static instance: TravelTimeCache;
  private cache: Map<string, CacheEntry> = new Map();
  private readonly STORAGE_KEY = 'travel_time_cache';
  
  // Cache configuration
  private readonly TTL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
  private readonly MAX_ENTRIES = 100;
  private readonly CLEANUP_INTERVAL = 60 * 60 * 1000; // 1 hour in milliseconds
  
  private cleanupTimer: number | null = null;
  private stats: CacheStats = {
    totalEntries: 0,
    expiredEntries: 0,
    hitRate: 0,
    lastCleanup: Date.now()
  };
  
  private constructor() {
    this.loadFromStorage();
    this.startCleanupTimer();
  }
  
  static getInstance(): TravelTimeCache {
    if (!this.instance) {
      this.instance = new TravelTimeCache();
    }
    return this.instance;
  }
  
  /**
   * Get cached travel times for a location
   */
  get(location: EnhancedLocationItem): TravelTimes | null {
    const userProfile = UserServiceInstance.getProfile();
    if (!userProfile.workCoords) {
      return null;
    }
    
    const key = this.generateKey(userProfile.workCoords, location);
    const entry = this.cache.get(key);
    
    if (!entry) {
      this.updateStats('miss');
      return null;
    }
    
    // Check if cache entry is still valid
    if (this.isExpired(entry)) {
      this.cache.delete(key);
      this.updateStats('expired');
      return null;
    }
    
    this.updateStats('hit');
    return entry.data;
  }
  
  /**
   * Set cached travel times for a location
   */
  set(location: EnhancedLocationItem, travelTimes: TravelTimes): void {
    const userProfile = UserServiceInstance.getProfile();
    if (!userProfile.workCoords) {
      return;
    }
    
    const key = this.generateKey(userProfile.workCoords, location);
    const entry: CacheEntry = {
      data: travelTimes,
      timestamp: Date.now(),
      workCoords: userProfile.workCoords
    };
    
    this.cache.set(key, entry);
    this.saveToStorage();
    
    // Cleanup if cache is getting full
    if (this.cache.size > this.MAX_ENTRIES) {
      this.performCleanup();
    }
  }
  
  /**
   * Clear all cached data
   */
  clear(): void {
    this.cache.clear();
    this.saveToStorage();
    this.stats = {
      totalEntries: 0,
      expiredEntries: 0,
      hitRate: 0,
      lastCleanup: Date.now()
    };
  }
  
  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    return { ...this.stats };
  }
  
  /**
   * Remove cache entries for a specific work address
   */
  invalidateByWorkAddress(workCoords: { lat: number; lng: number; }): void {
    let invalidated = 0;
    
    for (const [key, entry] of this.cache.entries()) {
      if (this.coordinatesMatch(entry.workCoords, workCoords)) {
        this.cache.delete(key);
        invalidated++;
      }
    }
    
    if (invalidated > 0) {
      console.log(`[TravelTimeCache] Invalidated ${invalidated} cache entries due to work address change`);
      this.saveToStorage();
    }
  }
  
  /**
   * Perform manual cleanup of expired entries
   */
  performCleanup(): void {
    const now = Date.now();
    let removed = 0;
    
    for (const [key, entry] of this.cache.entries()) {
      if (this.isExpired(entry)) {
        this.cache.delete(key);
        removed++;
      }
    }
    
    if (removed > 0) {
      console.log(`[TravelTimeCache] Cleaned up ${removed} expired cache entries`);
      this.stats.expiredEntries += removed;
      this.stats.lastCleanup = now;
      this.saveToStorage();
    }
    
    // Additional cleanup if cache is still too large
    if (this.cache.size > this.MAX_ENTRIES) {
      this.performLRUCleanup();
    }
  }
  
  /**
   * Check if cache has any entries for offline mode
   */
  hasOfflineData(): boolean {
    return this.cache.size > 0;
  }
  
  /**
   * Get all cached entries (for debugging/export)
   */
  getAllEntries(): Map<string, CacheEntry> {
    return new Map(this.cache);
  }
  
  /**
   * Destroy the cache service and cleanup timers
   */
  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
    this.saveToStorage();
  }
  
  // Private helper methods
  
  private generateKey(workCoords: { lat: number; lng: number }, location: EnhancedLocationItem): string {
    const workStr = `${workCoords.lat.toFixed(6)},${workCoords.lng.toFixed(6)}`;
    const locStr = `${location.position.lat.toFixed(6)},${location.position.lng.toFixed(6)}`;
    return `${workStr}_${locStr}`;
  }
  
  private isExpired(entry: CacheEntry): boolean {
    return (Date.now() - entry.timestamp) > this.TTL;
  }
  
  private coordinatesMatch(coords1: { lat: number; lng: number; }, coords2: { lat: number; lng: number; }): boolean {
    const tolerance = 0.000001; // Very small tolerance for floating point comparison
    return Math.abs(coords1.lat - coords2.lat) < tolerance && 
           Math.abs(coords1.lng - coords2.lng) < tolerance;
  }
  
  private updateStats(type: 'hit' | 'miss' | 'expired'): void {
    if (type === 'hit') {
      const hits = this.stats.hitRate * this.stats.totalEntries;
      this.stats.totalEntries++;
      this.stats.hitRate = (hits + 1) / this.stats.totalEntries;
    } else {
      this.stats.totalEntries++;
    }
    
    if (type === 'expired') {
      this.stats.expiredEntries++;
    }
  }
  
  private startCleanupTimer(): void {
    this.cleanupTimer = window.setInterval(() => {
      this.performCleanup();
    }, this.CLEANUP_INTERVAL);
  }
  
  private performLRUCleanup(): void {
    // Convert cache to array and sort by timestamp
    const entries = Array.from(this.cache.entries())
      .sort(([, a], [, b]) => a.timestamp - b.timestamp);
    
    // Keep only the most recent entries
    const keepCount = this.MAX_ENTRIES * 0.8; // Keep 80% of max
    const toRemove = entries.slice(keepCount);
    
    toRemove.forEach(([key]) => {
      this.cache.delete(key);
    });
    
    if (toRemove.length > 0) {
      console.log(`[TravelTimeCache] LRU cleanup removed ${toRemove.length} entries`);
      this.saveToStorage();
    }
  }
  
  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        
        if (data.entries && typeof data.entries === 'object') {
          this.cache = new Map(Object.entries(data.entries));
          
          // Clean expired entries on load
          this.performCleanup();
        }
        
        if (data.stats) {
          this.stats = { ...this.stats, ...data.stats };
        }
      }
    } catch (error) {
      console.error('[TravelTimeCache] Failed to load cache from storage:', error);
      this.cache.clear();
    }
  }
  
  private saveToStorage(): void {
    try {
      const data = {
        entries: Object.fromEntries(this.cache),
        stats: this.stats,
        version: '1.0',
        lastUpdated: Date.now()
      };
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('[TravelTimeCache] Failed to save cache to storage:', error);
      
      // If storage is full, perform aggressive cleanup
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        this.clear();
      }
    }
  }
}