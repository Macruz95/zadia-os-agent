import { Country } from '../types/countries.types';

/**
 * Format phone number with country code
 */
export function formatPhoneNumber(phoneNumber: string, country: Country): string {
  // Remove any existing + from phone number
  const cleanNumber = phoneNumber.replace(/^\+/, '');

  // If number already starts with country code, return as is
  if (cleanNumber.startsWith(country.phoneCode.replace(/^\+/, ''))) {
    return `+${cleanNumber}`;
  }

  // Otherwise, prepend country code
  return `${country.phoneCode}${cleanNumber}`;
}

/**
 * Get country flag emoji by ISO code
 */
export function getFlagEmoji(isoCode: string): string {
  const codePoints = isoCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

/**
 * Validate phone number format
 */
export function isValidPhoneNumber(phoneNumber: string, country: Country): boolean {
  const countryCode = country.phoneCode.replace(/^\+/, '');
  const cleanNumber = phoneNumber.replace(/^\+/, '');

  // Check if number starts with country code
  return cleanNumber.startsWith(countryCode) && cleanNumber.length > countryCode.length;
}

/**
 * Search countries by name or ISO code
 */
export function searchCountries(countries: Country[], query: string): Country[] {
  if (!query.trim()) return countries;

  const lowerQuery = query.toLowerCase();
  return countries.filter(country =>
    country.name.toLowerCase().includes(lowerQuery) ||
    country.isoCode.toLowerCase().includes(lowerQuery) ||
    country.phoneCode.includes(query)
  );
}