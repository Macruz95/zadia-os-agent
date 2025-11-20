/**
 * ZADIA OS - Project Defaults
 * Centralized configuration for system-wide defaults
 */

export const SYSTEM_DEFAULTS = {
  currency: {
    code: 'USD',
    locale: 'en-US', // Use en-US for standard $ formatting
    symbol: '$',
  },
  pagination: {
    pageSize: 10,
  },
} as const;

export const DEFAULT_CURRENCY = SYSTEM_DEFAULTS.currency.code;
export const DEFAULT_LOCALE = SYSTEM_DEFAULTS.currency.locale;
