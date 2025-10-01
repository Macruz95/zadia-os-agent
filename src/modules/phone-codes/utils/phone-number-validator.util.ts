import { PhoneCode, PhoneNumber } from '../types/phone-codes.types';

/**
 * Phone Number Validation Utilities
 * Handles phone number validation and parsing logic
 */
export class PhoneNumberValidator {
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
}