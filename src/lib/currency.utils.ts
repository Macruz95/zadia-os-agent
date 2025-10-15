/**
 * ZADIA OS - Currency Formatting Utilities
 * 
 * Centralized currency formatting functions for consistent display across the application.
 * Supports multiple currencies and locales commonly used in Latin America.
 */

/**
 * Supported currency codes
 */
export type CurrencyCode = 
  | 'USD'  // US Dollar
  | 'COP'  // Colombian Peso
  | 'GTQ'  // Guatemalan Quetzal
  | 'PYG'  // Paraguayan Guaraní
  | 'EUR'  // Euro
  | 'MXN'  // Mexican Peso
  | 'PEN'  // Peruvian Sol
  | 'CLP'  // Chilean Peso
  | 'ARS'; // Argentine Peso

/**
 * Supported locale codes
 */
export type LocaleCode =
  | 'es-CO' // Colombia
  | 'es-GT' // Guatemala
  | 'es-PY' // Paraguay
  | 'es-MX' // Mexico
  | 'es-PE' // Peru
  | 'es-CL' // Chile
  | 'es-AR' // Argentina
  | 'en-US'; // United States

/**
 * Currency formatting options
 */
export interface CurrencyFormatOptions {
  /**
   * Currency code (default: 'USD')
   */
  currency?: CurrencyCode;
  
  /**
   * Locale for number formatting (default: 'es-PY')
   */
  locale?: LocaleCode;
  
  /**
   * Minimum number of decimal places (default: 0)
   */
  minimumFractionDigits?: number;
  
  /**
   * Maximum number of decimal places (default: 2)
   */
  maximumFractionDigits?: number;
  
  /**
   * Whether to show currency symbol (default: true)
   */
  showSymbol?: boolean;
}

/**
 * Default configuration by currency
 */
const CURRENCY_DEFAULTS: Record<CurrencyCode, Partial<CurrencyFormatOptions>> = {
  USD: { locale: 'es-PY', minimumFractionDigits: 0, maximumFractionDigits: 2 },
  COP: { locale: 'es-CO', minimumFractionDigits: 0, maximumFractionDigits: 0 },
  GTQ: { locale: 'es-GT', minimumFractionDigits: 2, maximumFractionDigits: 2 },
  PYG: { locale: 'es-PY', minimumFractionDigits: 0, maximumFractionDigits: 0 },
  EUR: { locale: 'es-PY', minimumFractionDigits: 2, maximumFractionDigits: 2 },
  MXN: { locale: 'es-MX', minimumFractionDigits: 2, maximumFractionDigits: 2 },
  PEN: { locale: 'es-PE', minimumFractionDigits: 2, maximumFractionDigits: 2 },
  CLP: { locale: 'es-CL', minimumFractionDigits: 0, maximumFractionDigits: 0 },
  ARS: { locale: 'es-AR', minimumFractionDigits: 2, maximumFractionDigits: 2 },
};

/**
 * Format a number as currency with locale-specific formatting
 * 
 * @param amount - The numeric amount to format
 * @param options - Currency formatting options
 * @returns Formatted currency string
 * 
 * @example
 * ```ts
 * formatCurrency(1500.50) // "$1,501" (default USD, es-PY locale)
 * formatCurrency(1500.50, { currency: 'COP' }) // "$1.501" (Colombian pesos)
 * formatCurrency(1500.50, { currency: 'GTQ', minimumFractionDigits: 2 }) // "Q1,500.50"
 * formatCurrency(1500.50, { showSymbol: false }) // "1,501"
 * ```
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
 * 
 * @param amount - The numeric amount to format
 * @returns Formatted Colombian pesos
 * 
 * @example
 * ```ts
 * formatCOP(50000000) // "$50.000.000"
 * ```
 */
export function formatCOP(amount: number): string {
  return formatCurrency(amount, { currency: 'COP' });
}

/**
 * Format currency for Guatemala (GTQ)
 * 
 * @param amount - The numeric amount to format
 * @returns Formatted Guatemalan quetzales
 * 
 * @example
 * ```ts
 * formatGTQ(1500.50) // "Q1,500.50"
 * ```
 */
export function formatGTQ(amount: number): string {
  return formatCurrency(amount, { currency: 'GTQ' });
}

/**
 * Format currency for Paraguay (PYG)
 * 
 * @param amount - The numeric amount to format
 * @returns Formatted Paraguayan guaraníes
 * 
 * @example
 * ```ts
 * formatPYG(150000) // "₲150.000"
 * ```
 */
export function formatPYG(amount: number): string {
  return formatCurrency(amount, { currency: 'PYG' });
}

/**
 * Format currency for USA (USD)
 * 
 * @param amount - The numeric amount to format
 * @param options - Additional formatting options
 * @returns Formatted US dollars
 * 
 * @example
 * ```ts
 * formatUSD(1500) // "$1,500"
 * formatUSD(1500.50, { minimumFractionDigits: 2 }) // "$1,500.50"
 * ```
 */
export function formatUSD(
  amount: number,
  options: Omit<CurrencyFormatOptions, 'currency'> = {}
): string {
  return formatCurrency(amount, { ...options, currency: 'USD' });
}

/**
 * Parse a formatted currency string back to a number
 * 
 * @param formattedValue - The formatted currency string
 * @returns Numeric value
 * 
 * @example
 * ```ts
 * parseCurrency("$1,500.50") // 1500.50
 * parseCurrency("Q1.500,50") // 1500.50
 * ```
 */
export function parseCurrency(formattedValue: string): number {
  // Remove all non-numeric characters except dots and commas
  const cleaned = formattedValue.replace(/[^\d.,-]/g, '');
  
  // Handle different decimal separators
  // If there's a comma after the last dot, it's European format (dot=thousand, comma=decimal)
  // Otherwise, it's American format (comma=thousand, dot=decimal)
  const lastDot = cleaned.lastIndexOf('.');
  const lastComma = cleaned.lastIndexOf(',');
  
  let normalized: string;
  if (lastComma > lastDot) {
    // European format: 1.500,50
    normalized = cleaned.replace(/\./g, '').replace(',', '.');
  } else {
    // American format: 1,500.50
    normalized = cleaned.replace(/,/g, '');
  }
  
  return parseFloat(normalized) || 0;
}

/**
 * Format a number as a percentage
 * 
 * @param value - The numeric value (0-100)
 * @param decimals - Number of decimal places (default: 1)
 * @returns Formatted percentage string
 * 
 * @example
 * ```ts
 * formatPercentage(25.5) // "25.5%"
 * formatPercentage(25.5, 0) // "26%"
 * ```
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Compact number formatter for large values
 * 
 * @param value - The numeric value
 * @param currency - Currency code (optional)
 * @returns Compact formatted string
 * 
 * @example
 * ```ts
 * formatCompactCurrency(1500000) // "$1.5M"
 * formatCompactCurrency(1500000, 'COP') // "$1.5M"
 * formatCompactCurrency(1500) // "$1.5K"
 * ```
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
