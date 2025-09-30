/**
 * ZADIA OS - Municipalities Types
 * 
 * TypeScript type definitions for municipality entities
 */

export type { Municipality } from './municipalities.types';
export { municipalitySchema } from './municipalities.types';

// Re-export validation types
export type {
  MunicipalityFormData,
  MunicipalitySearchData
} from '../validations/municipalities.schema';