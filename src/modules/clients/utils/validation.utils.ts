/**
 * Validation utilities for client module
 */

/**
 * Validate phone number format
 * @param phone - Phone number string to validate
 * @returns True if phone number is valid
 */
export const isValidPhone = (phone: string): boolean => {
  if (!phone || typeof phone !== 'string') {
    return false;
  }

  const cleaned = phone.replace(/\D/g, '');
  return cleaned.length >= 8;
};