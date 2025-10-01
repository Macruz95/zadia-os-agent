import { PhoneCode } from '../types/phone-codes.types';

/**
 * Phone Code Data Utilities
 * Handles phone code data manipulation, sorting, and filtering
 */
export class PhoneCodeDataUtils {
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
}