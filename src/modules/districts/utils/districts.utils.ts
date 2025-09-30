import { District } from '../types/districts.types';

/**
 * District utility functions
 */
export class DistrictUtils {
  /**
   * Format district display name
   */
  static formatDisplayName(district: District): string {
    if (district.code) {
      return `${district.name} (${district.code})`;
    }
    return district.name;
  }

  /**
   * Validate district code format
   */
  static isValidCode(code: string): boolean {
    // District codes should be 2-10 characters, alphanumeric
    return /^[A-Z0-9]{2,10}$/.test(code.toUpperCase());
  }

  /**
   * Find district by code
   */
  static findByCode(districts: District[], code: string): District | undefined {
    return districts.find(district => 
      district.code?.toLowerCase() === code.toLowerCase()
    );
  }

  /**
   * Filter active districts
   */
  static filterActive(districts: District[]): District[] {
    return districts.filter(district => district.isActive);
  }

  /**
   * Filter districts by municipality
   */
  static filterByMunicipality(districts: District[], municipalityId: string): District[] {
    return districts.filter(district => district.municipalityId === municipalityId);
  }

  /**
   * Sort districts by name
   */
  static sortByName(districts: District[]): District[] {
    return [...districts].sort((a, b) => a.name.localeCompare(b.name));
  }

  /**
   * Group districts by municipality
   */
  static groupByMunicipality(districts: District[]): Record<string, District[]> {
    return districts.reduce((groups, district) => {
      const key = district.municipalityId;
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(district);
      return groups;
    }, {} as Record<string, District[]>);
  }

  /**
   * Search districts by name or code
   */
  static search(districts: District[], query: string): District[] {
    const normalizedQuery = query.toLowerCase().trim();
    
    if (!normalizedQuery) {
      return districts;
    }

    return districts.filter(district => 
      district.name.toLowerCase().includes(normalizedQuery) ||
      district.code?.toLowerCase().includes(normalizedQuery)
    );
  }

  /**
   * Get district statistics
   */
  static getStatistics(districts: District[]) {
    const total = districts.length;
    const active = districts.filter(d => d.isActive).length;
    const inactive = total - active;
    const withCode = districts.filter(d => d.code).length;
    
    return {
      total,
      active,
      inactive,
      withCode,
      withoutCode: total - withCode
    };
  }

  /**
   * Validate district data
   */
  static validateDistrict(district: Partial<District>): string[] {
    const errors: string[] = [];

    if (!district.name || district.name.trim().length === 0) {
      errors.push('El nombre del distrito es requerido');
    }

    if (district.name && district.name.length > 100) {
      errors.push('El nombre no puede exceder 100 caracteres');
    }

    if (!district.municipalityId || district.municipalityId.trim().length === 0) {
      errors.push('El ID del municipio es requerido');
    }

    if (district.code && !this.isValidCode(district.code)) {
      errors.push('El código debe tener entre 2-10 caracteres alfanuméricos');
    }

    return errors;
  }

  /**
   * Generate district code from name
   */
  static generateCodeFromName(name: string): string {
    return name
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '')
      .substring(0, 5);
  }

  /**
   * Check if district name is unique
   */
  static isNameUnique(districts: District[], name: string, excludeId?: string): boolean {
    return !districts.some(district => 
      district.name.toLowerCase() === name.toLowerCase() && 
      district.id !== excludeId
    );
  }

  /**
   * Check if district code is unique
   */
  static isCodeUnique(districts: District[], code: string, excludeId?: string): boolean {
    if (!code) return true;
    
    return !districts.some(district => 
      district.code?.toLowerCase() === code.toLowerCase() && 
      district.id !== excludeId
    );
  }
}