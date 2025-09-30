/**
 * ZADIA OS - Districts Module
 * 
 * Comprehensive district management system with CRUD operations,
 * municipality relationships, and form validation.
 * 
 * @module Districts
 * @version 1.0.0
 */

// Components
export {
  DistrictsDirectory,
  DistrictsForm,
  DistrictsTable,
  DistrictsSelect
} from './components';

// Hooks
export {
  useDistricts
} from './hooks';

// Services
export {
  DistrictsService
} from './services';

// Types
export type {
  District,
  DistrictFormData,
  DistrictSearchData
} from './types';

// Validations
export {
  districtFormSchema,
  districtSearchSchema,
  type DistrictFormData as DistrictFormDataType,
  type DistrictSearchData as DistrictSearchDataType
} from './validations';

// Utils
export {
  DistrictUtils
} from './utils';