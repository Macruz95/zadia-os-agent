import { Municipality } from '../types/municipalities.types';

/**
 * Municipality utility functions
 */
export class MunicipalityUtils {
  /**
   * Search municipalities by name or postal code
   */
  static searchMunicipalities(municipalities: Municipality[], query: string): Municipality[] {
    if (!query.trim()) return municipalities;

    const lowerQuery = query.toLowerCase();
    return municipalities.filter(municipality =>
      municipality.name.toLowerCase().includes(lowerQuery) ||
      (municipality.postalCode && municipality.postalCode.toLowerCase().includes(lowerQuery))
    );
  }

  /**
   * Get municipality display name with postal code
   */
  static getMunicipalityDisplayName(municipality: Municipality): string {
    if (municipality.postalCode) {
      return `${municipality.name} (${municipality.postalCode})`;
    }
    return municipality.name;
  }

  /**
   * Format municipality display name
   */
  static formatDisplayName(municipality: Municipality): string {
    return this.getMunicipalityDisplayName(municipality);
  }

  /**
   * Filter active municipalities
   */
  static filterActive(municipalities: Municipality[]): Municipality[] {
    return municipalities.filter(municipality => municipality.isActive);
  }

  /**
   * Filter municipalities by department
   */
  static filterByDepartment(municipalities: Municipality[], departmentId: string): Municipality[] {
    return municipalities.filter(municipality => municipality.departmentId === departmentId);
  }

  /**
   * Sort municipalities by name
   */
  static sortByName(municipalities: Municipality[]): Municipality[] {
    return [...municipalities].sort((a, b) => a.name.localeCompare(b.name));
  }

  /**
   * Group municipalities by department
   */
  static groupByDepartment(municipalities: Municipality[]): Record<string, Municipality[]> {
    return municipalities.reduce((groups, municipality) => {
      const key = municipality.departmentId;
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(municipality);
      return groups;
    }, {} as Record<string, Municipality[]>);
  }

  /**
   * Get municipality statistics
   */
  static getStatistics(municipalities: Municipality[]) {
    const total = municipalities.length;
    const active = municipalities.filter(m => m.isActive).length;
    const inactive = total - active;
    const withCoordinates = municipalities.filter(m => m.latitude && m.longitude).length;
    const withPostalCode = municipalities.filter(m => m.postalCode).length;
    
    return {
      total,
      active,
      inactive,
      withCoordinates,
      withPostalCode,
      withoutCoordinates: total - withCoordinates,
      withoutPostalCode: total - withPostalCode
    };
  }

  /**
   * Validate municipality data
   */
  static validateMunicipality(municipality: Partial<Municipality>): string[] {
    const errors: string[] = [];

    if (!municipality.name || municipality.name.trim().length === 0) {
      errors.push('El nombre del municipio es requerido');
    }

    if (municipality.name && municipality.name.length > 100) {
      errors.push('El nombre no puede exceder 100 caracteres');
    }

    if (!municipality.departmentId || municipality.departmentId.trim().length === 0) {
      errors.push('El ID del departamento es requerido');
    }

    if (municipality.postalCode && municipality.postalCode.length > 10) {
      errors.push('El código postal no puede exceder 10 caracteres');
    }

    if (municipality.latitude && (municipality.latitude < -90 || municipality.latitude > 90)) {
      errors.push('La latitud debe estar entre -90 y 90');
    }

    if (municipality.longitude && (municipality.longitude < -180 || municipality.longitude > 180)) {
      errors.push('La longitud debe estar entre -180 y 180');
    }

    return errors;
  }

  /**
   * Check if municipality name is unique
   */
  static isNameUnique(municipalities: Municipality[], name: string, excludeId?: string): boolean {
    return !municipalities.some(municipality => 
      municipality.name.toLowerCase() === name.toLowerCase() && 
      municipality.id !== excludeId
    );
  }

  /**
   * Check if postal code is unique
   */
  static isPostalCodeUnique(municipalities: Municipality[], postalCode: string, excludeId?: string): boolean {
    if (!postalCode) return true;
    
    return !municipalities.some(municipality => 
      municipality.postalCode?.toLowerCase() === postalCode.toLowerCase() && 
      municipality.id !== excludeId
    );
  }

  /**
   * Calculate distance between two municipalities (if coordinates are available)
   */
  static calculateDistance(
    municipality1: Municipality,
    municipality2: Municipality
  ): number | null {
    if (
      !municipality1.latitude ||
      !municipality1.longitude ||
      !municipality2.latitude ||
      !municipality2.longitude
    ) {
      return null;
    }

    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(municipality2.latitude - municipality1.latitude);
    const dLon = this.toRadians(municipality2.longitude - municipality1.longitude);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(municipality1.latitude)) *
        Math.cos(this.toRadians(municipality2.latitude)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return distance;
  }

  /**
   * Find nearest municipalities
   */
  static findNearestMunicipalities(
    targetMunicipality: Municipality,
    municipalities: Municipality[],
    limit: number = 5
  ): Array<{ municipality: Municipality; distance: number }> {
    const withDistances = municipalities
      .filter(m => m.id !== targetMunicipality.id)
      .map(municipality => ({
        municipality,
        distance: this.calculateDistance(targetMunicipality, municipality)
      }))
      .filter(item => item.distance !== null)
      .sort((a, b) => (a.distance || 0) - (b.distance || 0))
      .slice(0, limit);

    return withDistances as Array<{ municipality: Municipality; distance: number }>;
  }

  /**
   * Convert degrees to radians
   */
  private static toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
}