/**
 * ZADIA OS - Currency Parser
 * Parse formatted currency strings back to numbers
 */

/**
 * Parse a formatted currency string back to a number
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
