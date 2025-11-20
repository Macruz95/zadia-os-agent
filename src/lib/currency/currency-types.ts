/**
 * ZADIA OS - Currency Types & Constants
 * Shared types and configuration for currency utilities
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
  currency?: CurrencyCode;
  locale?: LocaleCode;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
  showSymbol?: boolean;
}

/**
 * Default configuration by currency
 */
export const CURRENCY_DEFAULTS: Record<CurrencyCode, Partial<CurrencyFormatOptions>> = {
  USD: { locale: 'en-US', minimumFractionDigits: 2, maximumFractionDigits: 2 },
  COP: { locale: 'es-CO', minimumFractionDigits: 0, maximumFractionDigits: 0 },
  GTQ: { locale: 'es-GT', minimumFractionDigits: 2, maximumFractionDigits: 2 },
  PYG: { locale: 'es-PY', minimumFractionDigits: 0, maximumFractionDigits: 0 },
  EUR: { locale: 'es-PY', minimumFractionDigits: 2, maximumFractionDigits: 2 },
  MXN: { locale: 'es-MX', minimumFractionDigits: 2, maximumFractionDigits: 2 },
  PEN: { locale: 'es-PE', minimumFractionDigits: 2, maximumFractionDigits: 2 },
  CLP: { locale: 'es-CL', minimumFractionDigits: 0, maximumFractionDigits: 0 },
  ARS: { locale: 'es-AR', minimumFractionDigits: 2, maximumFractionDigits: 2 },
};
