/**
 * ZADIA OS - Query Cache Service
 * 
 * Client-side caching layer for Firestore queries
 * Reduces duplicate requests and improves performance
 */

import { logger } from '@/lib/logger';

// ============================================
// Types
// ============================================

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
  queryKey: string;
}

interface CacheConfig {
  defaultTTL: number; // Time to live in milliseconds
  maxEntries: number;
  enableLogging: boolean;
}

export interface QueryCacheOptions {
  ttl?: number; // Override default TTL
  forceRefresh?: boolean; // Bypass cache
  staleWhileRevalidate?: boolean; // Return stale data while refreshing
}

// ============================================
// Default Configuration
// ============================================

const DEFAULT_CONFIG: CacheConfig = {
  defaultTTL: 5 * 60 * 1000, // 5 minutes default
  maxEntries: 200,
  enableLogging: process.env.NODE_ENV === 'development',
};

// TTL presets for different data types
export const CACHE_TTL = {
  // Frequently changing data - short cache
  realtime: 30 * 1000, // 30 seconds
  
  // Standard business data
  standard: 5 * 60 * 1000, // 5 minutes
  
  // Reference/master data - longer cache
  reference: 30 * 60 * 1000, // 30 minutes
  
  // Static data
  static: 60 * 60 * 1000, // 1 hour
} as const;

// ============================================
// Query Cache Service
// ============================================

class QueryCacheService {
  private cache: Map<string, CacheEntry<unknown>> = new Map();
  private pendingRequests: Map<string, Promise<unknown>> = new Map();
  private config: CacheConfig;
  private stats = {
    hits: 0,
    misses: 0,
    invalidations: 0,
  };

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    
    // Periodic cleanup
    if (typeof window !== 'undefined') {
      setInterval(() => this.cleanup(), 60 * 1000);
    }
  }

  /**
   * Generate a unique cache key from query parameters
   */
  generateKey(namespace: string, params: Record<string, unknown>): string {
    const sortedParams = Object.keys(params)
      .sort()
      .map(key => `${key}:${JSON.stringify(params[key])}`)
      .join('|');
    return `${namespace}::${sortedParams}`;
  }

  /**
   * Get data from cache or fetch using provided function
   */
  async get<T>(
    queryKey: string,
    fetchFn: () => Promise<T>,
    options: QueryCacheOptions = {}
  ): Promise<T> {
    const { ttl = this.config.defaultTTL, forceRefresh = false, staleWhileRevalidate = false } = options;

    // Check for forced refresh
    if (forceRefresh) {
      return this.fetchAndCache(queryKey, fetchFn, ttl);
    }

    // Check cache
    const cached = this.cache.get(queryKey) as CacheEntry<T> | undefined;
    const now = Date.now();

    if (cached) {
      // Fresh cache hit
      if (now < cached.expiresAt) {
        this.stats.hits++;
        this.log('Cache HIT', queryKey);
        return cached.data;
      }

      // Stale-while-revalidate pattern
      if (staleWhileRevalidate) {
        this.log('Cache STALE (revalidating)', queryKey);
        // Return stale data immediately, refresh in background
        this.fetchAndCache(queryKey, fetchFn, ttl).catch(() => {
          // Silently ignore background refresh errors
        });
        return cached.data;
      }
    }

    // Cache miss - fetch fresh data
    this.stats.misses++;
    this.log('Cache MISS', queryKey);
    return this.fetchAndCache(queryKey, fetchFn, ttl);
  }

  /**
   * Fetch data and store in cache
   * Deduplicates concurrent requests for the same key
   */
  private async fetchAndCache<T>(
    queryKey: string,
    fetchFn: () => Promise<T>,
    ttl: number
  ): Promise<T> {
    // Check for pending request (deduplication)
    const pending = this.pendingRequests.get(queryKey);
    if (pending) {
      this.log('Request DEDUPLICATED', queryKey);
      return pending as Promise<T>;
    }

    // Create new request
    const request = (async () => {
      try {
        const data = await fetchFn();
        const now = Date.now();

        // Store in cache
        this.cache.set(queryKey, {
          data,
          timestamp: now,
          expiresAt: now + ttl,
          queryKey,
        });

        // Enforce max entries
        this.enforceMaxEntries();

        return data;
      } finally {
        // Remove from pending
        this.pendingRequests.delete(queryKey);
      }
    })();

    // Track pending request
    this.pendingRequests.set(queryKey, request);

    return request;
  }

  /**
   * Invalidate cache entries by key or pattern
   */
  invalidate(keyOrPattern: string | RegExp): number {
    let invalidated = 0;

    if (typeof keyOrPattern === 'string') {
      // Exact key match
      if (this.cache.delete(keyOrPattern)) {
        invalidated = 1;
      }
    } else {
      // Pattern match
      for (const key of this.cache.keys()) {
        if (keyOrPattern.test(key)) {
          this.cache.delete(key);
          invalidated++;
        }
      }
    }

    if (invalidated > 0) {
      this.stats.invalidations += invalidated;
      this.log(`Cache INVALIDATED ${invalidated} entries`, keyOrPattern.toString());
    }

    return invalidated;
  }

  /**
   * Invalidate all cache entries for a namespace
   */
  invalidateNamespace(namespace: string): number {
    return this.invalidate(new RegExp(`^${namespace}::`));
  }

  /**
   * Invalidate cache entries related to a tenant
   */
  invalidateTenant(tenantId: string): number {
    return this.invalidate(new RegExp(`tenantId:["']?${tenantId}`));
  }

  /**
   * Set data directly in cache
   */
  set<T>(queryKey: string, data: T, ttl: number = this.config.defaultTTL): void {
    const now = Date.now();
    this.cache.set(queryKey, {
      data,
      timestamp: now,
      expiresAt: now + ttl,
      queryKey,
    });
  }

  /**
   * Check if a key exists and is not expired
   */
  has(queryKey: string): boolean {
    const entry = this.cache.get(queryKey);
    return entry !== undefined && Date.now() < entry.expiresAt;
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const total = this.stats.hits + this.stats.misses;
    return {
      ...this.stats,
      size: this.cache.size,
      hitRate: total > 0 ? (this.stats.hits / total) * 100 : 0,
      pendingRequests: this.pendingRequests.size,
    };
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
    this.pendingRequests.clear();
    this.stats = { hits: 0, misses: 0, invalidations: 0 };
    this.log('Cache CLEARED', 'all');
  }

  /**
   * Remove expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      this.log(`Cleanup removed ${cleaned} entries`, 'periodic');
    }
  }

  /**
   * Enforce maximum cache entries (LRU-like)
   */
  private enforceMaxEntries(): void {
    if (this.cache.size <= this.config.maxEntries) return;

    // Remove oldest entries
    const entries = Array.from(this.cache.entries())
      .sort((a, b) => a[1].timestamp - b[1].timestamp);

    const toRemove = entries.slice(0, this.cache.size - this.config.maxEntries);
    toRemove.forEach(([key]) => this.cache.delete(key));
  }

  private log(action: string, key: string): void {
    if (this.config.enableLogging) {
      logger.debug(`[QueryCache] ${action}: ${key.substring(0, 80)}...`, {
        component: 'QueryCache',
      });
    }
  }
}

// Singleton instance
export const queryCache = new QueryCacheService();

// ============================================
// React Hook
// ============================================

import { useState, useEffect, useCallback, useRef } from 'react';

interface UseQueryCacheResult<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  invalidate: () => void;
}

/**
 * React hook for cached queries
 */
export function useQueryCache<T>(
  queryKey: string,
  fetchFn: () => Promise<T>,
  options: QueryCacheOptions & { enabled?: boolean } = {}
): UseQueryCacheResult<T> {
  const { enabled = true, ...cacheOptions } = options;
  
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const mountedRef = useRef(true);

  const fetchData = useCallback(async () => {
    if (!enabled) return;
    
    setLoading(true);
    setError(null);

    try {
      const result = await queryCache.get(queryKey, fetchFn, cacheOptions);
      if (mountedRef.current) {
        setData(result);
      }
    } catch (err) {
      if (mountedRef.current) {
        setError(err as Error);
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [queryKey, enabled]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    mountedRef.current = true;
    fetchData();
    
    return () => {
      mountedRef.current = false;
    };
  }, [fetchData]);

  const refetch = useCallback(async () => {
    await queryCache.get(queryKey, fetchFn, { ...cacheOptions, forceRefresh: true });
    await fetchData();
  }, [queryKey, fetchData]); // eslint-disable-line react-hooks/exhaustive-deps

  const invalidate = useCallback(() => {
    queryCache.invalidate(queryKey);
  }, [queryKey]);

  return { data, loading, error, refetch, invalidate };
}

// ============================================
// Utility Functions
// ============================================

/**
 * Create a cached version of an async function
 */
export function createCachedFn<T extends (...args: unknown[]) => Promise<unknown>>(
  namespace: string,
  fn: T,
  options: QueryCacheOptions = {}
): T {
  return ((...args: Parameters<T>) => {
    const queryKey = queryCache.generateKey(namespace, { args });
    return queryCache.get(queryKey, () => fn(...args), options);
  }) as T;
}

/**
 * Decorator for caching class methods
 */
export function cached(namespace: string, ttl: number = CACHE_TTL.standard) {
  return function <T extends (...args: unknown[]) => Promise<unknown>>(
    _target: unknown,
    propertyKey: string,
    descriptor: TypedPropertyDescriptor<T>
  ): TypedPropertyDescriptor<T> {
    const originalMethod = descriptor.value!;

    descriptor.value = function (this: unknown, ...args: Parameters<T>) {
      const queryKey = queryCache.generateKey(`${namespace}:${propertyKey}`, { args });
      return queryCache.get(queryKey, () => originalMethod.apply(this, args), { ttl });
    } as T;

    return descriptor;
  };
}
