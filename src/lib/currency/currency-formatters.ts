/**
 * ZADIA OS - Currency Formatters
 * Core currency formatting functions
 */

import { CurrencyCode, CurrencyFormatOptions, CURRENCY_DEFAULTS } from './currency-types';

/**
 * Format a number as currency with locale-specific formatting
 */
export function formatCurrency(
  amount: number,
  options: CurrencyFormatOptions = {}
): string {
  const {
    currency = 'USD',
    locale,
    minimumFractionDigits,
    maximumFractionDigits,
    showSymbol = true,
  } = options;

  // Get currency-specific defaults
  const currencyDefaults = CURRENCY_DEFAULTS[currency] || {};
  
  // Merge options with currency defaults
  const finalLocale = locale || currencyDefaults.locale || 'es-PY';
  const finalMinDigits = minimumFractionDigits ?? currencyDefaults.minimumFractionDigits ?? 0;
  const finalMaxDigits = maximumFractionDigits ?? currencyDefaults.maximumFractionDigits ?? 2;

  const formatter = new Intl.NumberFormat(finalLocale, {
    style: showSymbol ? 'currency' : 'decimal',
    currency: showSymbol ? currency : undefined,
    minimumFractionDigits: finalMinDigits,
    maximumFractionDigits: finalMaxDigits,
  });

  return formatter.format(amount);
}

/**
 * Format currency for Colombia (COP)
 */
export function formatCOP(amount: number): string {
  return formatCurrency(amount, { currency: 'COP' });
}

/**
 * Format currency for Guatemala (GTQ)
 */
export function formatGTQ(amount: number): string {
  return formatCurrency(amount, { currency: 'GTQ' });
}

/**
 * Format currency for Paraguay (PYG)
 */
export function formatPYG(amount: number): string {
  return formatCurrency(amount, { currency: 'PYG' });
}

/**
 * Format currency for USA (USD)
 */
export function formatUSD(
  amount: number,
  options: Omit<CurrencyFormatOptions, 'currency'> = {}
): string {
  return formatCurrency(amount, { ...options, currency: 'USD' });
}

/**
 * Compact number formatter for large values
 */
export function formatCompactCurrency(
  value: number,
  currency: CurrencyCode = 'USD'
): string {
  const absValue = Math.abs(value);
  const sign = value < 0 ? '-' : '';
  
  const formatter = new Intl.NumberFormat('es-PY', {
    style: 'currency',
    currency,
    notation: 'compact',
    compactDisplay: 'short',
    maximumFractionDigits: 1,
  });
  
  return sign + formatter.format(absValue);
}

/**
 * Format a number as a percentage
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}
