import { PhoneCode } from '../types/phone-codes.types';

/**
 * Phone Number Formatting Utilities
 * Handles phone number formatting and display logic
 */
export class PhoneNumberFormatter {
  /**
   * Format phone number with country code
   */
  static formatPhoneNumber(phoneNumber: string, phoneCode: PhoneCode): string {
    // Remove all non-numeric characters except +
    const cleaned = phoneNumber.replace(/[^\d+]/g, '');
    
    // If the number already starts with the country code, return as is
    if (cleaned.startsWith(phoneCode.code)) {
      return cleaned;
    }
    
    // Remove leading + or country code if present
    let number = cleaned;
    if (number.startsWith('+')) {
      number = number.substring(1);
    }
    if (number.startsWith(phoneCode.dialCode)) {
      number = number.substring(phoneCode.dialCode.length);
    }
    
    // Apply format if available
    if (phoneCode.format) {
      return this.applyFormat(phoneCode.code + number, phoneCode.format);
    }
    
    return phoneCode.code + number;
  }

  /**
   * Apply formatting pattern to phone number
   */
  static applyFormat(phoneNumber: string, format: string): string {
    let formatted = format;
    let numberIndex = 0;
    
    for (let i = 0; i < formatted.length; i++) {
      if (formatted[i] === '#') {
        if (numberIndex < phoneNumber.length) {
          formatted = formatted.substring(0, i) + phoneNumber[numberIndex] + formatted.substring(i + 1);
          numberIndex++;
        } else {
          formatted = formatted.substring(0, i);
          break;
        }
      }
    }
    
    return formatted;
  }

  /**
   * Get display name for phone code
   */
  static getDisplayName(phoneCode: PhoneCode, countryName?: string): string {
    const name = countryName || phoneCode.countryId;
    return `${name} (${phoneCode.code})`;
  }

  /**
   * Generate example phone number
   */
  static generateExample(phoneCode: PhoneCode): string {
    if (phoneCode.example) {
      return phoneCode.example;
    }
    
    // Generate a basic example
    const baseNumber = '1234567890'.substring(0, 7);
    return this.formatPhoneNumber(baseNumber, phoneCode);
  }
}