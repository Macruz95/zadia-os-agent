/**
 * Main location utilities - re-exports from modular location services
 * 
 * This file maintains backward compatibility while using the new modular structure
 */

// Re-export async location resolvers
export {
  getCountryNameById,
  getDepartmentNameById,
  getMunicipalityNameById,
  getDistrictNameById
} from './location-async.utils';

// Re-export address formatting utilities
export {
  formatFullAddressAsync,
  formatFullAddress,
  formatShortAddress,
  getCountryName,
  getDepartmentName,
  getMunicipalityName,
  getDistrictName
} from './address-formatting.utils';

// Re-export cache service for advanced usage
export { LocationCache } from './location-cache.service';