/**
 * Professional Logging Utility for ZADIA OS
 * Provides conditional logging based on environment
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  component?: string;
  action?: string;
  userId?: string;
  fileName?: string;
  path?: string;
  projectId?: string;
  employeeId?: string;
  periodId?: string;
  invoiceId?: string;
  quoteId?: string;
  clientId?: string;
  orderId?: string;
  taskId?: string;
  milestoneId?: string;
  interactionId?: string;
  newStatus?: string;
  status?: string;
  url?: string;
  // HR Module fields
  name?: string;
  amount?: number;
  netPayable?: number;
  loanId?: string;
  workPeriodId?: string;
  newPosition?: string;
  // Additional context fields
  reason?: string;
  segment?: string;
  flag?: string;
  progress?: number;
  daysDelayed?: number;
  overrunPercent?: number;
  priority?: string;
  severity?: string;
  // Calendar fields
  eventId?: string;
  reminderId?: string;
  deadlineId?: string;
  meetingId?: string;
  event1Title?: string;
  event2Title?: string;
  title?: string;
  newStartDate?: string;
  attendeeName?: string;
  dueDate?: string;
  // Orders fields
  orderNumber?: string;
  newDate?: string;
  // HR additional fields
  toDepartment?: string;
  requestId?: string;
  reviewId?: string;
  type?: string;
  // Client fields
  clientName?: string;
  // Tenant/Multi-tenancy fields
  tenantId?: string;
  invitationId?: string;
  role?: string;
  plan?: string;
  ownerId?: string;
  email?: string;
  // Settings/Integration fields
  sessionId?: string;
  integrationId?: string;
  webhookId?: string;
  keyId?: string;
  // Inventory/BOM fields
  bomId?: string;
  // AI/Conversation fields
  id?: string;
  count?: number;
  messageCount?: number;
  conversationId?: string;
  // Additional HR fields
  fullName?: string;
  // Generic metadata for any additional fields
  metadata?: Record<string, unknown>;
}

class Logger {
  private isDevelopment: boolean;
  private logLevel: LogLevel;

  constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development';
    this.logLevel = (process.env.NEXT_PUBLIC_LOG_LEVEL as LogLevel) || 'info';
  }

  private shouldLog(level: LogLevel): boolean {
    if (!this.isDevelopment) {
      // In production, only log errors
      return level === 'error';
    }

    const levels = ['debug', 'info', 'warn', 'error'];
    const currentLevelIndex = levels.indexOf(this.logLevel);
    const requestedLevelIndex = levels.indexOf(level);

    return requestedLevelIndex >= currentLevelIndex;
  }

  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const prefix = level.toUpperCase().padEnd(5);

    let formatted = `[${timestamp}] ${prefix} ${message}`;

    if (context) {
      const contextStr = Object.entries(context)
        .filter(([, value]) => value !== undefined)
        .map(([key, value]) => `${key}=${JSON.stringify(value)}`)
        .join(' ');

      if (contextStr) {
        formatted += ` | ${contextStr}`;
      }
    }

    return formatted;
  }

  debug(message: string, context?: LogContext): void {
    if (this.shouldLog('debug')) {
      // eslint-disable-next-line no-console
      console.log(this.formatMessage('debug', message, context));
    }
  }

  info(message: string, context?: LogContext): void {
    if (this.shouldLog('info')) {
      // eslint-disable-next-line no-console
      console.info(this.formatMessage('info', message, context));
    }
  }

  warn(message: string, context?: LogContext): void {
    if (this.shouldLog('warn')) {
      // eslint-disable-next-line no-console
      console.warn(this.formatMessage('warn', message, context));
    }
  }

  error(message: string, error?: Error, context?: LogContext): void {
    if (this.shouldLog('error')) {
      const errorContext = error ? { ...context, error: error.message, stack: error.stack } : context;
      // eslint-disable-next-line no-console
      console.error(this.formatMessage('error', message, errorContext));
    }
  }

  // Utility methods for common scenarios
  dataConversion(operation: string, data: Record<string, unknown>): void {
    this.debug(`Data conversion: ${operation}`, {
      component: 'DataConverter',
      action: operation,
      metadata: data
    });
  }

  serviceCall(service: string, method: string, params?: Record<string, unknown>): void {
    this.debug(`Service call: ${service}.${method}`, {
      component: service,
      action: method,
      metadata: params
    });
  }

  userAction(action: string, userId: string, metadata?: Record<string, unknown>): void {
    this.info(`User action: ${action}`, {
      action,
      userId,
      metadata
    });
  }
}

// Export singleton instance
export const logger = new Logger();
export type { LogContext };
