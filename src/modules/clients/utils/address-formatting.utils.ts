/**
 * Address formatting utilities
 */
import { Address } from '../types/clients.types';
import { 
  getCountryNameById, 
  getDepartmentNameById, 
  getMunicipalityNameById, 
  getDistrictNameById 
} from './location-async.utils';

/**
 * Format complete address with real location names (async version)
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

/**
 * Synchronous country name resolver for basic cases
 */
export const getCountryName = (countryCode: string): string => {
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

/**
 * Synchronous fallback functions for backward compatibility
 */
export const getDepartmentName = (departmentCode: string): string => {
  return departmentCode;
};

export const getMunicipalityName = (municipalityCode: string): string => {
  return municipalityCode;
};

export const getDistrictName = (districtCode: string): string => {
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