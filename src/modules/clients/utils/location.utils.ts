/**
 * Location utilities for displaying full location names using real data services
 */
import { Address } from '../types/clients.types';
import { CountriesService } from '../../countries/services/countries.service';
import { DepartmentsService } from '../../departments/services/departments.service';
import { MunicipalitiesService } from '../../municipalities/services/municipalities.service';
import { DistrictsService } from '../../districts/services/districts.service';
import type { Country } from '../../countries/types/countries.types';
import type { Department } from '../../departments/types/departments.types';
import type { Municipality } from '../../municipalities/types/municipalities.types';
import type { District } from '../../districts/types/districts.types';

// Cache for location data to avoid repeated API calls
let countriesCache: Country[] = [];
let departmentsCache: Department[] = [];
let municipalitiesCache: Municipality[] = [];
let districtsCache: District[] = [];

/**
 * Get country name by ID from real data
 */
export const getCountryNameById = async (countryId: string): Promise<string> => {
  try {
    if (countriesCache.length === 0) {
      countriesCache = await CountriesService.getCountries();
    }
    
    const country = countriesCache.find(c => c.id === countryId || c.isoCode === countryId);
    return country ? country.name : countryId;
  } catch (error) {
    console.error('Error getting country name:', error);
    return countryId;
  }
};

/**
 * Get department name by ID from real data
 */
export const getDepartmentNameById = async (departmentId: string): Promise<string> => {
  try {
    if (departmentsCache.length === 0) {
      departmentsCache = await DepartmentsService.getDepartments();
    }
    
    const department = departmentsCache.find(d => d.id === departmentId);
    return department ? department.name : departmentId;
  } catch (error) {
    console.error('Error getting department name:', error);
    return departmentId;
  }
};

/**
 * Get municipality name by ID from real data
 */
export const getMunicipalityNameById = async (municipalityId: string, departmentId?: string): Promise<string> => {
  try {
    // Try to get from cache first
    let municipality = municipalitiesCache.find(m => m.id === municipalityId);
    
    if (!municipality && departmentId) {
      // If not in cache and we have departmentId, fetch by department
      const municipalities = await MunicipalitiesService.getMunicipalitiesByDepartment(departmentId);
      municipalitiesCache = [...municipalitiesCache, ...municipalities];
      municipality = municipalities.find(m => m.id === municipalityId);
    }
    
    return municipality ? municipality.name : municipalityId;
  } catch (error) {
    console.error('Error getting municipality name:', error);
    return municipalityId;
  }
};

/**
 * Get district name by ID from real data
 */
export const getDistrictNameById = async (districtId: string, municipalityId?: string): Promise<string> => {
  try {
    // Try to get from cache first
    let district = districtsCache.find(d => d.id === districtId);
    
    if (!district && municipalityId) {
      // If not in cache and we have municipalityId, fetch by municipality
      const districts = await DistrictsService.getDistrictsByMunicipality(municipalityId);
      districtsCache = [...districtsCache, ...districts];
      district = districts.find(d => d.id === districtId);
    }
    
    return district ? district.name : districtId;
  } catch (error) {
    console.error('Error getting district name:', error);
    return districtId;
  }
};

/**
 * Format complete address with real location names
 */
export const formatFullAddressAsync = async (address: Address): Promise<string> => {
  const parts: string[] = [];
  
  // Street address
  if (address.street) {
    parts.push(address.street);
  }
  
  // District (if available) - using real district name
  if (address.district) {
    const districtName = await getDistrictNameById(address.district, address.city);
    parts.push(districtName);
  }
  
  // Municipality/City
  if (address.city) {
    const municipalityName = await getMunicipalityNameById(address.city, address.state);
    parts.push(municipalityName);
  }
  
  // Department/State
  if (address.state) {
    const departmentName = await getDepartmentNameById(address.state);
    parts.push(departmentName);
  }
  
  // Country
  if (address.country) {
    const countryName = await getCountryNameById(address.country);
    parts.push(countryName);
  }
  
  return parts.join(', ');
};

// Synchronous fallback functions for backward compatibility
export const getCountryName = (countryCode: string): string => {
  // Basic mapping for common cases
  const basicCountries: Record<string, string> = {
    'SV': 'El Salvador',
    'sv': 'El Salvador',
    'GT': 'Guatemala',
    'HN': 'Honduras',
    'NI': 'Nicaragua',
    'CR': 'Costa Rica'
  };
  
  return basicCountries[countryCode] || countryCode;
};

export const getDepartmentName = (departmentCode: string): string => {
  return departmentCode;
};

export const getMunicipalityName = (municipalityCode: string): string => {
  return municipalityCode;
};

export const getDistrictName = (districtCode: string): string => {
  // For backward compatibility, return the district code
  // In the future, this could use a synchronous cache lookup
  return districtCode;
};

/**
 * Format complete address with full location names (synchronous version)
 */
export const formatFullAddress = (address: Address): string => {
  const parts: string[] = [];
  
  // Street address
  if (address.street) {
    parts.push(address.street);
  }
  
  // District (if available)
  if (address.district) {
    parts.push(address.district);
  }
  
  // Municipality/City
  if (address.city) {
    parts.push(address.city);
  }
  
  // Department/State
  if (address.state) {
    parts.push(address.state);
  }
  
  // Country
  if (address.country) {
    parts.push(getCountryName(address.country));
  }
  
  return parts.join(', ');
};

/**
 * Format short address for display
 */
export const formatShortAddress = (address: Address): string => {
  const parts: string[] = [];
  
  if (address.district) {
    parts.push(address.district);
  } else if (address.street) {
    parts.push(address.street);
  }
  
  if (address.city) {
    parts.push(address.city);
  }
  
  return parts.join(', ');
};