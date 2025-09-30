/**
 * ZADIA OS - Districts Types
 * 
 * TypeScript type definitions for district entities
 */

export type { District } from './districts.types';
export { districtSchema } from './districts.types';

// Re-export validation types
export type {
  DistrictFormData,
  DistrictSearchData
} from '../validations/districts.schema';