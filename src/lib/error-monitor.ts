/**
 * ZADIA OS - Error Monitoring Service
 * 
 * Centralized error tracking and monitoring for production
 * Provides structured error logging, categorization, and optional third-party integration
 */

import { logger } from '@/lib/logger';

// ============================================
// Types
// ============================================

export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';
export type ErrorCategory = 
  | 'network'
  | 'authentication'
  | 'authorization'
  | 'validation'
  | 'database'
  | 'ui'
  | 'business_logic'
  | 'integration'
  | 'unknown';

export interface ErrorContext {
  userId?: string;
  tenantId?: string;
  module?: string;
  action?: string;
  component?: string;
  route?: string;
  userAgent?: string;
  timestamp?: Date;
  sessionId?: string;
  additionalData?: Record<string, unknown>;
}

export interface TrackedError {
  id: string;
  message: string;
  stack?: string;
  severity: ErrorSeverity;
  category: ErrorCategory;
  context: ErrorContext;
  timestamp: Date;
  fingerprint: string;
  count: number;
}

export interface ErrorMetrics {
  totalErrors: number;
  errorsByCategory: Record<ErrorCategory, number>;
  errorsBySeverity: Record<ErrorSeverity, number>;
  recentErrors: TrackedError[];
  errorRate: number; // errors per minute
}

// ============================================
// Error Monitoring Service
// ============================================

class ErrorMonitoringService {
  private errors: Map<string, TrackedError> = new Map();
  private errorQueue: TrackedError[] = [];
  private readonly MAX_QUEUE_SIZE = 100;
  private readonly MAX_STORED_ERRORS = 500;
  private startTime: number = Date.now();
  private totalErrorCount: number = 0;

  // Third-party integration config (Sentry, Rollbar, etc.)
  private externalReporter?: (error: TrackedError) => void;

  constructor() {
    // Set up global error handlers in browser
    if (typeof window !== 'undefined') {
      this.setupGlobalHandlers();
    }
  }

  /**
   * Configure external error reporting (Sentry, Rollbar, etc.)
   */
  setExternalReporter(reporter: (error: TrackedError) => void): void {
    this.externalReporter = reporter;
    logger.info('External error reporter configured', { component: 'ErrorMonitor' });
  }

  /**
   * Track and log an error
   */
  captureError(
    error: Error | string,
    context: ErrorContext = {},
    severity: ErrorSeverity = 'medium',
    category: ErrorCategory = 'unknown'
  ): string {
    const errorMessage = typeof error === 'string' ? error : error.message;
    const errorStack = typeof error === 'string' ? undefined : error.stack;
    
    // Generate fingerprint for deduplication
    const fingerprint = this.generateFingerprint(errorMessage, context.module, context.action);
    
    // Check for existing error with same fingerprint
    const existingError = this.errors.get(fingerprint);
    
    if (existingError) {
      // Increment count for duplicate errors
      existingError.count++;
      existingError.timestamp = new Date();
      this.errors.set(fingerprint, existingError);
      return existingError.id;
    }

    // Create new tracked error
    const trackedError: TrackedError = {
      id: this.generateId(),
      message: errorMessage,
      stack: errorStack,
      severity,
      category: this.categorizeError(error, category),
      context: {
        ...context,
        timestamp: new Date(),
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
      },
      timestamp: new Date(),
      fingerprint,
      count: 1,
    };

    // Store error
    this.errors.set(fingerprint, trackedError);
    this.addToQueue(trackedError);
    this.totalErrorCount++;

    // Log to console in development
    logger.error(`[${severity.toUpperCase()}] ${trackedError.category}: ${errorMessage}`, undefined, {
      component: context.component || 'ErrorMonitor',
      action: context.action,
      userId: context.userId,
      tenantId: context.tenantId,
    });

    // Send to external reporter if configured
    if (this.externalReporter) {
      try {
        this.externalReporter(trackedError);
      } catch {
        logger.warn('Failed to send error to external reporter', {
          component: 'ErrorMonitor',
        });
      }
    }

    // Cleanup old errors if needed
    this.cleanup();

    return trackedError.id;
  }

  /**
   * Capture an exception with automatic categorization
   */
  captureException(error: Error, context: ErrorContext = {}): string {
    const severity = this.determineSeverity(error);
    const category = this.categorizeError(error, 'unknown');
    return this.captureError(error, context, severity, category);
  }

  /**
   * Capture a message as an error (for warnings, etc.)
   */
  captureMessage(
    message: string,
    context: ErrorContext = {},
    severity: ErrorSeverity = 'low'
  ): string {
    return this.captureError(message, context, severity, 'business_logic');
  }

  /**
   * Get error metrics for monitoring dashboard
   */
  getMetrics(): ErrorMetrics {
    const now = Date.now();
    const uptimeMinutes = (now - this.startTime) / 60000;
    
    const errorsByCategory: Record<ErrorCategory, number> = {
      network: 0,
      authentication: 0,
      authorization: 0,
      validation: 0,
      database: 0,
      ui: 0,
      business_logic: 0,
      integration: 0,
      unknown: 0,
    };

    const errorsBySeverity: Record<ErrorSeverity, number> = {
      low: 0,
      medium: 0,
      high: 0,
      critical: 0,
    };

    for (const error of this.errors.values()) {
      errorsByCategory[error.category] += error.count;
      errorsBySeverity[error.severity] += error.count;
    }

    return {
      totalErrors: this.totalErrorCount,
      errorsByCategory,
      errorsBySeverity,
      recentErrors: this.errorQueue.slice(-20),
      errorRate: uptimeMinutes > 0 ? this.totalErrorCount / uptimeMinutes : 0,
    };
  }

  /**
   * Get recent errors for display
   */
  getRecentErrors(limit: number = 20): TrackedError[] {
    return this.errorQueue.slice(-limit).reverse();
  }

  /**
   * Get errors by category
   */
  getErrorsByCategory(category: ErrorCategory): TrackedError[] {
    return Array.from(this.errors.values())
      .filter(e => e.category === category)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  /**
   * Clear all tracked errors (admin function)
   */
  clearErrors(): void {
    this.errors.clear();
    this.errorQueue = [];
    this.totalErrorCount = 0;
    this.startTime = Date.now();
    logger.info('Error tracking data cleared', { component: 'ErrorMonitor' });
  }

  // ============================================
  // Private Methods
  // ============================================

  private setupGlobalHandlers(): void {
    // Unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.captureError(
        event.reason?.message || 'Unhandled Promise Rejection',
        { component: 'Global', action: 'unhandledrejection' },
        'high',
        'unknown'
      );
    });

    // Global errors
    window.addEventListener('error', (event) => {
      // Ignore script errors from other origins
      if (event.message === 'Script error.') return;
      
      this.captureError(
        event.error || event.message,
        { 
          component: 'Global', 
          action: 'error',
          additionalData: {
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno,
          }
        },
        'high',
        'ui'
      );
    });
  }

  private generateId(): string {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateFingerprint(message: string, module?: string, action?: string): string {
    const key = `${message}:${module || ''}:${action || ''}`;
    // Simple hash for fingerprinting
    let hash = 0;
    for (let i = 0; i < key.length; i++) {
      const char = key.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return `fp_${Math.abs(hash).toString(36)}`;
  }

  private categorizeError(error: Error | string, defaultCategory: ErrorCategory): ErrorCategory {
    const message = typeof error === 'string' ? error : error.message;
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes('network') || lowerMessage.includes('fetch') || lowerMessage.includes('timeout')) {
      return 'network';
    }
    if (lowerMessage.includes('auth') || lowerMessage.includes('login') || lowerMessage.includes('token')) {
      return 'authentication';
    }
    if (lowerMessage.includes('permission') || lowerMessage.includes('forbidden') || lowerMessage.includes('unauthorized')) {
      return 'authorization';
    }
    if (lowerMessage.includes('valid') || lowerMessage.includes('required') || lowerMessage.includes('format')) {
      return 'validation';
    }
    if (lowerMessage.includes('firebase') || lowerMessage.includes('firestore') || lowerMessage.includes('database')) {
      return 'database';
    }
    if (lowerMessage.includes('render') || lowerMessage.includes('component') || lowerMessage.includes('hook')) {
      return 'ui';
    }

    return defaultCategory;
  }

  private determineSeverity(error: Error): ErrorSeverity {
    const message = error.message.toLowerCase();
    
    if (message.includes('critical') || message.includes('fatal')) {
      return 'critical';
    }
    if (message.includes('auth') || message.includes('permission') || message.includes('security')) {
      return 'high';
    }
    if (message.includes('failed') || message.includes('error')) {
      return 'medium';
    }
    return 'low';
  }

  private addToQueue(error: TrackedError): void {
    this.errorQueue.push(error);
    if (this.errorQueue.length > this.MAX_QUEUE_SIZE) {
      this.errorQueue.shift();
    }
  }

  private cleanup(): void {
    if (this.errors.size > this.MAX_STORED_ERRORS) {
      // Remove oldest errors
      const sortedErrors = Array.from(this.errors.entries())
        .sort((a, b) => a[1].timestamp.getTime() - b[1].timestamp.getTime());
      
      const toRemove = sortedErrors.slice(0, this.errors.size - this.MAX_STORED_ERRORS);
      toRemove.forEach(([key]) => this.errors.delete(key));
    }
  }
}

// Singleton instance
export const errorMonitor = new ErrorMonitoringService();

// ============================================
// React Integration
// ============================================

/**
 * React hook for error monitoring
 */
export function useErrorMonitor(context: Partial<ErrorContext> = {}) {
  const captureError = (
    error: Error | string,
    additionalContext: Partial<ErrorContext> = {},
    severity?: ErrorSeverity
  ) => {
    return errorMonitor.captureError(
      error,
      { ...context, ...additionalContext },
      severity
    );
  };

  const captureException = (error: Error, additionalContext: Partial<ErrorContext> = {}) => {
    return errorMonitor.captureException(error, { ...context, ...additionalContext });
  };

  return { captureError, captureException, getMetrics: () => errorMonitor.getMetrics() };
}

/**
 * Higher-order function to wrap async operations with error monitoring
 */
export function withErrorMonitoring<T extends (...args: unknown[]) => Promise<unknown>>(
  fn: T,
  context: ErrorContext
): T {
  return (async (...args: Parameters<T>) => {
    try {
      return await fn(...args);
    } catch (error) {
      errorMonitor.captureException(error as Error, context);
      throw error;
    }
  }) as T;
}
