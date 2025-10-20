/**
 * ZADIA OS - Phone Codes Service (Facade)
 * Punto de entrada unificado para operaciones de códigos telefónicos
 * Rule #5: Max 200 lines per file
 */

// CRUD Operations
export {
  getPhoneCodeById,
  createPhoneCode,
  updatePhoneCode,
  deletePhoneCode
} from './helpers/phone-code-crud.service';

// Search Operations
export {
  getPhoneCodes,
  getPhoneCodesByCountry,
  findByDialCode
} from './helpers/phone-code-search.service';

// Initialization
export {
  initializePhoneCodes
} from './helpers/phone-code-init.service';

/**
 * PhoneCodesService Class - Backward Compatibility
 */
import * as PhoneCodeCRUD from './helpers/phone-code-crud.service';
import * as PhoneCodeSearch from './helpers/phone-code-search.service';

export class PhoneCodesService {
  static getPhoneCodes = PhoneCodeSearch.getPhoneCodes;
  static getPhoneCodesByCountry = PhoneCodeSearch.getPhoneCodesByCountry;
  static getPhoneCodeById = PhoneCodeCRUD.getPhoneCodeById;
  static createPhoneCode = PhoneCodeCRUD.createPhoneCode;
  static updatePhoneCode = PhoneCodeCRUD.updatePhoneCode;
  static deletePhoneCode = PhoneCodeCRUD.deletePhoneCode;
  static findByDialCode = PhoneCodeSearch.findByDialCode;
}
