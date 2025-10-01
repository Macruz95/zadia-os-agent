import { PhoneCode } from '@/modules/phone-codes/types/phone-codes.types';

/**
 * Master Phone Codes Data - Real phone codes used across the system
 * This is NOT mock data - these are real international phone codes
 * Maintained as master data for consistency and reusability
 * 
 * Data source: ITU-T international calling codes
 */
export const MASTER_PHONE_CODES: PhoneCode[] = [
  // PERÚ
  {
    id: 'PE-51',
    countryId: 'PE',
    code: '+51',
    dialCode: '51',
    format: '+51 ### ### ###',
    example: '+51 999 123 456',
    priority: 1,
    isActive: true
  },

  // COLOMBIA
  {
    id: 'CO-57',
    countryId: 'CO',
    code: '+57',
    dialCode: '57',
    format: '+57 ### ### ####',
    example: '+57 300 123 4567',
    priority: 1,
    isActive: true
  },

  // ECUADOR
  {
    id: 'EC-593',
    countryId: 'EC',
    code: '+593',
    dialCode: '593',
    format: '+593 ## ### ####',
    example: '+593 99 123 4567',
    priority: 1,
    isActive: true
  },

  // BOLIVIA
  {
    id: 'BO-591',
    countryId: 'BO',
    code: '+591',
    dialCode: '591',
    format: '+591 # ### ####',
    example: '+591 7 123 4567',
    priority: 1,
    isActive: true
  },

  // VENEZUELA
  {
    id: 'VE-58',
    countryId: 'VE',
    code: '+58',
    dialCode: '58',
    format: '+58 ### ### ####',
    example: '+58 412 123 4567',
    priority: 1,
    isActive: true
  },

  // BRASIL
  {
    id: 'BR-55',
    countryId: 'BR',
    code: '+55',
    dialCode: '55',
    format: '+55 ## ##### ####',
    example: '+55 11 99999 1234',
    priority: 1,
    isActive: true
  },

  // ARGENTINA
  {
    id: 'AR-54',
    countryId: 'AR',
    code: '+54',
    dialCode: '54',
    format: '+54 ## #### ####',
    example: '+54 11 1234 5678',
    priority: 1,
    isActive: true
  },

  // CHILE
  {
    id: 'CL-56',
    countryId: 'CL',
    code: '+56',
    dialCode: '56',
    format: '+56 # #### ####',
    example: '+56 9 1234 5678',
    priority: 1,
    isActive: true
  },

  // URUGUAY
  {
    id: 'UY-598',
    countryId: 'UY',
    code: '+598',
    dialCode: '598',
    format: '+598 ## ### ###',
    example: '+598 99 123 456',
    priority: 1,
    isActive: true
  },

  // PARAGUAY
  {
    id: 'PY-595',
    countryId: 'PY',
    code: '+595',
    dialCode: '595',
    format: '+595 ### ### ###',
    example: '+595 961 123 456',
    priority: 1,
    isActive: true
  }
];