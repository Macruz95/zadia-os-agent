/**
 * Currency formatting utilities for client module
 */

/**
 * Format currency amount for display in Spanish locale
 * @param amount - Amount to format
 * @param currency - Currency code (default: 'USD')
 * @returns Formatted currency string
 */
export const formatCurrency = (amount: number, currency = 'USD'): string => {
  if (typeof amount !== 'number' || isNaN(amount)) {
    throw new Error('Invalid amount provided to formatCurrency');
  }

  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency,
  }).format(amount);
};