/**
 * Simple caching utility for supersweets
 * Provides in-memory and localStorage caching for API responses
 */

interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

class Cache {
  private memoryCache = new Map<string, CacheItem<any>>();
  private readonly maxMemoryItems = 100;

  // Set item in cache
  set<T>(key: string, data: T, ttlMinutes: number = 5): void {
    const ttl = ttlMinutes * 60 * 1000; // Convert to milliseconds
    const item: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      ttl,
    };

    // Memory cache
    this.memoryCache.set(key, item);

    // Cleanup old items if cache is too large
    if (this.memoryCache.size > this.maxMemoryItems) {
      const oldestKey = this.memoryCache.keys().next().value;
      this.memoryCache.delete(oldestKey);
    }

    // localStorage cache for persistent data
    try {
      localStorage.setItem(`supersweets_cache_${key}`, JSON.stringify(item));
    } catch (error) {
      // localStorage might be full or disabled
      console.warn('Failed to save to localStorage:', error);
    }
  }

  // Get item from cache
  get<T>(key: string): T | null {
    // Try memory cache first
    const memoryItem = this.memoryCache.get(key);
    if (memoryItem && this.isValid(memoryItem)) {
      return memoryItem.data;
    }

    // Try localStorage cache
    try {
      const stored = localStorage.getItem(`supersweets_cache_${key}`);
      if (stored) {
        const item: CacheItem<T> = JSON.parse(stored);
        if (this.isValid(item)) {
          // Restore to memory cache
          this.memoryCache.set(key, item);
          return item.data;
        } else {
          // Remove expired item
          localStorage.removeItem(`supersweets_cache_${key}`);
        }
      }
    } catch (error) {
      console.warn('Failed to read from localStorage:', error);
    }

    return null;
  }

  // Check if cache item is still valid
  private isValid<T>(item: CacheItem<T>): boolean {
    return Date.now() - item.timestamp < item.ttl;
  }

  // Remove item from cache
  remove(key: string): void {
    this.memoryCache.delete(key);
    try {
      localStorage.removeItem(`supersweets_cache_${key}`);
    } catch (error) {
      console.warn('Failed to remove from localStorage:', error);
    }
  }

  // Clear all cache
  clear(): void {
    this.memoryCache.clear();
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('supersweets_cache_')) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.warn('Failed to clear localStorage:', error);
    }
  }

  // Get cache statistics
  getStats() {
    return {
      memoryItems: this.memoryCache.size,
      maxMemoryItems: this.maxMemoryItems,
    };
  }
}

// Create singleton instance
export const cache = new Cache();

// Utility function to cache API calls
export async function cachedApiCall<T>(
  key: string,
  apiCall: () => Promise<T>,
  ttlMinutes: number = 5
): Promise<T> {
  // Try to get from cache first
  const cached = cache.get<T>(key);
  if (cached !== null) {
    return cached;
  }

  // Make API call and cache result
  try {
    const result = await apiCall();
    cache.set(key, result, ttlMinutes);
    return result;
  } catch (error) {
    // Don't cache errors
    throw error;
  }
}

// Utility function to invalidate related cache keys
export function invalidateCache(pattern: string): void {
  // Clear memory cache
  const memoryKeys = Array.from(cache['memoryCache'].keys());
  memoryKeys.forEach(key => {
    if (key.includes(pattern)) {
      cache.remove(key);
    }
  });

  // Clear localStorage cache
  try {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('supersweets_cache_') && key.includes(pattern)) {
        localStorage.removeItem(key);
      }
    });
  } catch (error) {
    console.warn('Failed to invalidate localStorage cache:', error);
  }
}

// Cache keys constants
export const CACHE_KEYS = {
  PRODUCTS: 'products',
  CATEGORIES: 'categories',
  SETTINGS: 'settings',
  USER_PROFILE: 'user_profile',
  ORDERS: 'orders',
  COUPONS: 'coupons',
  ANALYTICS: 'analytics',
} as const;

// Cache TTL constants (in minutes)
export const CACHE_TTL = {
  SHORT: 1,      // 1 minute
  MEDIUM: 5,     // 5 minutes
  LONG: 15,      // 15 minutes
  VERY_LONG: 60, // 1 hour
} as const;