import { PhoneCode, PhoneNumber } from '../types/phone-codes.types';

/**
 * Phone code utility functions
 */
export class PhoneCodeUtils {
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
   * Validate phone number format
   */
  static isValidPhoneNumber(phoneNumber: string, phoneCode?: PhoneCode): boolean {
    // Basic validation
    const cleaned = phoneNumber.replace(/[^\d+]/g, '');
    
    if (cleaned.length < 7 || cleaned.length > 20) {
      return false;
    }
    
    // If phone code is provided, validate against it
    if (phoneCode) {
      return cleaned.startsWith(phoneCode.code) || cleaned.startsWith(phoneCode.dialCode);
    }
    
    return true;
  }

  /**
   * Extract country code from phone number
   */
  static extractCountryCode(phoneNumber: string, phoneCodes: PhoneCode[]): PhoneCode | null {
    const cleaned = phoneNumber.replace(/[^\d+]/g, '');
    
    // Sort by code length (longest first) to match more specific codes first
    const sortedCodes = [...phoneCodes].sort((a, b) => b.dialCode.length - a.dialCode.length);
    
    for (const phoneCode of sortedCodes) {
      if (cleaned.startsWith(phoneCode.code) || cleaned.startsWith('+' + phoneCode.dialCode)) {
        return phoneCode;
      }
    }
    
    return null;
  }

  /**
   * Parse phone number into components
   */
  static parsePhoneNumber(phoneNumber: string, phoneCodes: PhoneCode[]): PhoneNumber | null {
    const phoneCode = this.extractCountryCode(phoneNumber, phoneCodes);
    
    if (!phoneCode) {
      return null;
    }
    
    const cleaned = phoneNumber.replace(/[^\d+]/g, '');
    let number = cleaned;
    
    // Remove country code
    if (number.startsWith(phoneCode.code)) {
      number = number.substring(phoneCode.code.length);
    } else if (number.startsWith('+' + phoneCode.dialCode)) {
      number = number.substring(phoneCode.dialCode.length + 1);
    }
    
    return {
      countryId: phoneCode.countryId,
      phoneCode: phoneCode.code,
      number: number,
      fullNumber: phoneCode.code + number,
      isValid: this.isValidPhoneNumber(phoneNumber, phoneCode)
    };
  }

  /**
   * Get display name for phone code
   */
  static getDisplayName(phoneCode: PhoneCode, countryName?: string): string {
    const name = countryName || phoneCode.countryId;
    return `${name} (${phoneCode.code})`;
  }

  /**
   * Filter phone codes by search query
   */
  static searchPhoneCodes(phoneCodes: PhoneCode[], query: string): PhoneCode[] {
    if (!query.trim()) {
      return phoneCodes;
    }
    
    const normalizedQuery = query.toLowerCase().trim();
    
    return phoneCodes.filter(phoneCode => 
      phoneCode.code.toLowerCase().includes(normalizedQuery) ||
      phoneCode.dialCode.toLowerCase().includes(normalizedQuery) ||
      phoneCode.countryId.toLowerCase().includes(normalizedQuery)
    );
  }

  /**
   * Sort phone codes by priority and code
   */
  static sortPhoneCodes(phoneCodes: PhoneCode[]): PhoneCode[] {
    return [...phoneCodes].sort((a, b) => {
      // First by priority (higher first)
      if (a.priority !== b.priority) {
        return b.priority - a.priority;
      }
      // Then by code
      return a.code.localeCompare(b.code);
    });
  }

  /**
   * Group phone codes by country
   */
  static groupByCountry(phoneCodes: PhoneCode[]): Record<string, PhoneCode[]> {
    return phoneCodes.reduce((groups, phoneCode) => {
      const key = phoneCode.countryId;
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(phoneCode);
      return groups;
    }, {} as Record<string, PhoneCode[]>);
  }

  /**
   * Get statistics about phone codes
   */
  static getStatistics(phoneCodes: PhoneCode[]) {
    const total = phoneCodes.length;
    const active = phoneCodes.filter(pc => pc.isActive).length;
    const inactive = total - active;
    const withFormat = phoneCodes.filter(pc => pc.format).length;
    const withExample = phoneCodes.filter(pc => pc.example).length;
    const uniqueCountries = new Set(phoneCodes.map(pc => pc.countryId)).size;
    
    return {
      total,
      active,
      inactive,
      withFormat,
      withExample,
      withoutFormat: total - withFormat,
      withoutExample: total - withExample,
      uniqueCountries
    };
  }

  /**
   * Validate phone code data
   */
  static validatePhoneCode(phoneCode: Partial<PhoneCode>): string[] {
    const errors: string[] = [];
    
    if (!phoneCode.countryId || phoneCode.countryId.trim().length === 0) {
      errors.push('El ID del país es requerido');
    }
    
    if (!phoneCode.code || phoneCode.code.trim().length === 0) {
      errors.push('El código telefónico es requerido');
    } else if (!/^\+\d+$/.test(phoneCode.code)) {
      errors.push('El código debe comenzar con + seguido de números');
    }
    
    if (!phoneCode.dialCode || phoneCode.dialCode.trim().length === 0) {
      errors.push('El código de marcado es requerido');
    } else if (!/^\d+$/.test(phoneCode.dialCode)) {
      errors.push('El código de marcado debe contener solo números');
    }
    
    if (phoneCode.priority !== undefined && (phoneCode.priority < 1 || phoneCode.priority > 10)) {
      errors.push('La prioridad debe estar entre 1 y 10');
    }
    
    return errors;
  }

  /**
   * Check if phone code is unique
   */
  static isCodeUnique(phoneCodes: PhoneCode[], code: string, excludeId?: string): boolean {
    return !phoneCodes.some(phoneCode => 
      phoneCode.code === code && phoneCode.id !== excludeId
    );
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