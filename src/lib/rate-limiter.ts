/**
 * ZADIA OS - Rate Limiter Service
 * 
 * Client-side rate limiting to prevent API abuse and control costs
 * Uses in-memory storage with sliding window algorithm
 */

import { logger } from '@/lib/logger';

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  keyPrefix?: string;
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// Default configurations for different operation types
export const RATE_LIMIT_CONFIGS = {
  // Read operations - more permissive
  read: {
    maxRequests: 100,
    windowMs: 60 * 1000, // 100 requests per minute
    keyPrefix: 'read',
  },
  // Write operations - more restrictive
  write: {
    maxRequests: 30,
    windowMs: 60 * 1000, // 30 writes per minute
    keyPrefix: 'write',
  },
  // Search operations - moderate
  search: {
    maxRequests: 50,
    windowMs: 60 * 1000, // 50 searches per minute
    keyPrefix: 'search',
  },
  // Export operations - very restrictive
  export: {
    maxRequests: 5,
    windowMs: 60 * 1000, // 5 exports per minute
    keyPrefix: 'export',
  },
  // Auth operations - prevent brute force
  auth: {
    maxRequests: 10,
    windowMs: 60 * 1000, // 10 auth attempts per minute
    keyPrefix: 'auth',
  },
  // AI operations - moderate (API costs)
  ai: {
    maxRequests: 20,
    windowMs: 60 * 1000, // 20 AI requests per minute
    keyPrefix: 'ai',
  },
} as const;

export type RateLimitType = keyof typeof RATE_LIMIT_CONFIGS;

class RateLimiterService {
  private limits: Map<string, RateLimitEntry> = new Map();
  private cleanupInterval: ReturnType<typeof setInterval> | null = null;

  constructor() {
    // Clean up expired entries every 5 minutes
    if (typeof window !== 'undefined') {
      this.cleanupInterval = setInterval(() => this.cleanup(), 5 * 60 * 1000);
    }
  }

  /**
   * Check if a request is allowed under rate limits
   * @param userId - User identifier
   * @param type - Type of operation (read, write, search, etc.)
   * @param customConfig - Optional custom configuration
   * @returns Object with allowed status and remaining requests
   */
  checkLimit(
    userId: string,
    type: RateLimitType,
    customConfig?: Partial<RateLimitConfig>
  ): { allowed: boolean; remaining: number; resetIn: number } {
    const config = { ...RATE_LIMIT_CONFIGS[type], ...customConfig };
    const key = `${config.keyPrefix}:${userId}`;
    const now = Date.now();

    const entry = this.limits.get(key);

    // No existing entry or window expired
    if (!entry || now > entry.resetTime) {
      this.limits.set(key, {
        count: 1,
        resetTime: now + config.windowMs,
      });
      return {
        allowed: true,
        remaining: config.maxRequests - 1,
        resetIn: config.windowMs,
      };
    }

    // Check if limit exceeded
    if (entry.count >= config.maxRequests) {
      const resetIn = entry.resetTime - now;
      logger.warn('Rate limit exceeded', {
        userId,
        component: 'RateLimiter',
        action: type,
      });
      return {
        allowed: false,
        remaining: 0,
        resetIn,
      };
    }

    // Increment counter
    entry.count++;
    this.limits.set(key, entry);

    return {
      allowed: true,
      remaining: config.maxRequests - entry.count,
      resetIn: entry.resetTime - now,
    };
  }

  /**
   * Wrapper for async operations with rate limiting
   * @param userId - User identifier
   * @param type - Type of operation
   * @param operation - The async operation to execute
   * @returns Promise with the operation result or throws if rate limited
   */
  async withRateLimit<T>(
    userId: string,
    type: RateLimitType,
    operation: () => Promise<T>
  ): Promise<T> {
    const { allowed, remaining, resetIn } = this.checkLimit(userId, type);

    if (!allowed) {
      const error = new RateLimitError(
        `Rate limit exceeded for ${type} operations. Try again in ${Math.ceil(resetIn / 1000)} seconds.`,
        resetIn
      );
      throw error;
    }

    logger.debug(`Rate limit check passed: ${remaining} ${type} requests remaining`, {
      component: 'RateLimiter',
      userId,
    });

    return operation();
  }

  /**
   * Get current usage stats for a user
   */
  getUsageStats(userId: string): Record<RateLimitType, { used: number; limit: number; resetIn: number }> {
    const now = Date.now();
    const stats: Record<string, { used: number; limit: number; resetIn: number }> = {};

    for (const [type, config] of Object.entries(RATE_LIMIT_CONFIGS)) {
      const key = `${config.keyPrefix}:${userId}`;
      const entry = this.limits.get(key);

      if (!entry || now > entry.resetTime) {
        stats[type] = { used: 0, limit: config.maxRequests, resetIn: 0 };
      } else {
        stats[type] = {
          used: entry.count,
          limit: config.maxRequests,
          resetIn: entry.resetTime - now,
        };
      }
    }

    return stats as Record<RateLimitType, { used: number; limit: number; resetIn: number }>;
  }

  /**
   * Reset limits for a specific user (admin function)
   */
  resetUserLimits(userId: string): void {
    const keysToDelete: string[] = [];
    
    for (const key of this.limits.keys()) {
      if (key.includes(`:${userId}`)) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => this.limits.delete(key));
    
    logger.info('Rate limits reset for user', { userId, component: 'RateLimiter' });
  }

  /**
   * Clean up expired entries to prevent memory leaks
   */
  private cleanup(): void {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, entry] of this.limits.entries()) {
      if (now > entry.resetTime) {
        this.limits.delete(key);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      logger.debug(`Rate limiter cleanup: removed ${cleaned} expired entries`, {
        component: 'RateLimiter',
      });
    }
  }

  /**
   * Dispose of the rate limiter (cleanup interval)
   */
  dispose(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.limits.clear();
  }
}

/**
 * Custom error class for rate limit violations
 */
export class RateLimitError extends Error {
  public readonly resetIn: number;
  public readonly isRateLimitError = true;

  constructor(message: string, resetIn: number) {
    super(message);
    this.name = 'RateLimitError';
    this.resetIn = resetIn;
  }
}

// Singleton instance
export const rateLimiter = new RateLimiterService();

// React hook for rate limiting
export function useRateLimiter(userId: string | undefined) {
  const checkLimit = (type: RateLimitType) => {
    if (!userId) return { allowed: false, remaining: 0, resetIn: 0 };
    return rateLimiter.checkLimit(userId, type);
  };

  const withRateLimit = async <T>(type: RateLimitType, operation: () => Promise<T>) => {
    if (!userId) throw new Error('User ID required for rate limiting');
    return rateLimiter.withRateLimit(userId, type, operation);
  };

  const getUsageStats = () => {
    if (!userId) return null;
    return rateLimiter.getUsageStats(userId);
  };

  return { checkLimit, withRateLimit, getUsageStats };
}
