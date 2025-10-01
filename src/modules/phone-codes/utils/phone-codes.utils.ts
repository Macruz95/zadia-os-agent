// Re-export utilities
import { PhoneNumberFormatter } from './phone-number-formatter.util';
import { PhoneNumberValidator } from './phone-number-validator.util';
import { PhoneCodeDataUtils } from './phone-code-data.util';

/**
 * Phone Code Utilities - Main Class
 * Unified interface for all phone code utility functions
 */
export class PhoneCodeUtils {
  // Formatting utilities
  static formatPhoneNumber = PhoneNumberFormatter.formatPhoneNumber;
  static applyFormat = PhoneNumberFormatter.applyFormat;
  static getDisplayName = PhoneNumberFormatter.getDisplayName;
  static generateExample = PhoneNumberFormatter.generateExample;

  // Validation utilities
  static isValidPhoneNumber = PhoneNumberValidator.isValidPhoneNumber;
  static extractCountryCode = PhoneNumberValidator.extractCountryCode;
  static parsePhoneNumber = PhoneNumberValidator.parsePhoneNumber;
  static validatePhoneCode = PhoneNumberValidator.validatePhoneCode;
  static isCodeUnique = PhoneNumberValidator.isCodeUnique;

  // Data utilities
  static searchPhoneCodes = PhoneCodeDataUtils.searchPhoneCodes;
  static sortPhoneCodes = PhoneCodeDataUtils.sortPhoneCodes;
  static groupByCountry = PhoneCodeDataUtils.groupByCountry;
  static getStatistics = PhoneCodeDataUtils.getStatistics;
}

// Export individual utility classes for direct use
export { PhoneNumberFormatter };
export { PhoneNumberValidator };
export { PhoneCodeDataUtils };