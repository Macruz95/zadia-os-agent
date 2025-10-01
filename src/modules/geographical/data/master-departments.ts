import { Department } from '@/modules/departments/types/departments.types';

/**
 * Master Departments Data - Real geographical data for ZADIA OS
 * This is NOT mock data - these are real departments/states used across the system
 * Maintained as master data for consistency and reusability
 * 
 * Data source: Official government geographical divisions
 */
export const MASTER_DEPARTMENTS: Department[] = [
  // EL SALVADOR - 14 Departamentos oficiales
  {
    id: 'd1',
    name: 'Ahuachapán',
    code: 'AH',
    countryId: 'sv',
    isActive: true
  },
  {
    id: 'd2',
    name: 'Cabañas',
    code: 'CA',
    countryId: 'sv',
    isActive: true
  },
  {
    id: 'd3',
    name: 'Chalatenango',
    code: 'CH',
    countryId: 'sv',
    isActive: true
  },
  {
    id: 'd4',
    name: 'Cuscatlán',
    code: 'CU',
    countryId: 'sv',
    isActive: true
  },
  {
    id: 'd5',
    name: 'La Libertad',
    code: 'LI',
    countryId: 'sv',
    isActive: true
  },
  {
    id: 'd6',
    name: 'La Paz',
    code: 'PA',
    countryId: 'sv',
    isActive: true
  },
  {
    id: 'd7',
    name: 'La Unión',
    code: 'UN',
    countryId: 'sv',
    isActive: true
  },
  {
    id: 'd8',
    name: 'Morazán',
    code: 'MO',
    countryId: 'sv',
    isActive: true
  },
  {
    id: 'd9',
    name: 'San Miguel',
    code: 'SM',
    countryId: 'sv',
    isActive: true
  },
  {
    id: 'd10',
    name: 'San Salvador',
    code: 'SS',
    countryId: 'sv',
    isActive: true
  },
  {
    id: 'd11',
    name: 'San Vicente',
    code: 'SV',
    countryId: 'sv',
    isActive: true
  },
  {
    id: 'd12',
    name: 'Santa Ana',
    code: 'SA',
    countryId: 'sv',
    isActive: true
  },
  {
    id: 'd13',
    name: 'Sonsonate',
    code: 'SO',
    countryId: 'sv',
    isActive: true
  },
  {
    id: 'd14',
    name: 'Usulután',
    code: 'US',
    countryId: 'sv',
    isActive: true
  },

  // PERÚ - Departamentos oficiales
  {
    id: 'PE-01',
    name: 'Amazonas',
    code: 'AMA',
    countryId: 'PE',
    isActive: true
  },
  {
    id: 'PE-02',
    name: 'Áncash',
    code: 'ANC',
    countryId: 'PE',
    isActive: true
  },
  {
    id: 'PE-03',
    name: 'Apurímac',
    code: 'APU',
    countryId: 'PE',
    isActive: true
  },
  {
    id: 'PE-04',
    name: 'Arequipa',
    code: 'ARE',
    countryId: 'PE',
    isActive: true
  },
  {
    id: 'PE-05',
    name: 'Ayacucho',
    code: 'AYA',
    countryId: 'PE',
    isActive: true
  },
  {
    id: 'PE-06',
    name: 'Cajamarca',
    code: 'CAJ',
    countryId: 'PE',
    isActive: true
  },
  {
    id: 'PE-07',
    name: 'Callao',
    code: 'CAL',
    countryId: 'PE',
    isActive: true
  },
  {
    id: 'PE-08',
    name: 'Cusco',
    code: 'CUS',
    countryId: 'PE',
    isActive: true
  },
  {
    id: 'PE-09',
    name: 'Huancavelica',
    code: 'HUV',
    countryId: 'PE',
    isActive: true
  },
  {
    id: 'PE-10',
    name: 'Huánuco',
    code: 'HUC',
    countryId: 'PE',
    isActive: true
  },
  {
    id: 'PE-11',
    name: 'Ica',
    code: 'ICA',
    countryId: 'PE',
    isActive: true
  },
  {
    id: 'PE-12',
    name: 'Junín',
    code: 'JUN',
    countryId: 'PE',
    isActive: true
  },
  {
    id: 'PE-13',
    name: 'La Libertad',
    code: 'LAL',
    countryId: 'PE',
    isActive: true
  },
  {
    id: 'PE-14',
    name: 'Lambayeque',
    code: 'LAM',
    countryId: 'PE',
    isActive: true
  },
  {
    id: 'PE-15',
    name: 'Lima',
    code: 'LIM',
    countryId: 'PE',
    isActive: true
  },
  {
    id: 'PE-16',
    name: 'Loreto',
    code: 'LOR',
    countryId: 'PE',
    isActive: true
  },
  {
    id: 'PE-17',
    name: 'Madre de Dios',
    code: 'MDD',
    countryId: 'PE',
    isActive: true
  },
  {
    id: 'PE-18',
    name: 'Moquegua',
    code: 'MOQ',
    countryId: 'PE',
    isActive: true
  },
  {
    id: 'PE-19',
    name: 'Pasco',
    code: 'PAS',
    countryId: 'PE',
    isActive: true
  },
  {
    id: 'PE-20',
    name: 'Piura',
    code: 'PIU',
    countryId: 'PE',
    isActive: true
  },
  {
    id: 'PE-21',
    name: 'Puno',
    code: 'PUN',
    countryId: 'PE',
    isActive: true
  },
  {
    id: 'PE-22',
    name: 'San Martín',
    code: 'SAM',
    countryId: 'PE',
    isActive: true
  },
  {
    id: 'PE-23',
    name: 'Tacna',
    code: 'TAC',
    countryId: 'PE',
    isActive: true
  },
  {
    id: 'PE-24',
    name: 'Tumbes',
    code: 'TUM',
    countryId: 'PE',
    isActive: true
  },
  {
    id: 'PE-25',
    name: 'Ucayali',
    code: 'UCA',
    countryId: 'PE',
    isActive: true
  },

  // COLOMBIA - Departamentos oficiales principales
  {
    id: 'CO-01',
    name: 'Antioquia',
    code: 'ANT',
    countryId: 'CO',
    isActive: true
  },
  {
    id: 'CO-02',
    name: 'Bogotá D.C.',
    code: 'BOG',
    countryId: 'CO',
    isActive: true
  },
  {
    id: 'CO-03',
    name: 'Valle del Cauca',
    code: 'VAL',
    countryId: 'CO',
    isActive: true
  },
  {
    id: 'CO-04',
    name: 'Atlántico',
    code: 'ATL',
    countryId: 'CO',
    isActive: true
  },
  {
    id: 'CO-05',
    name: 'Santander',
    code: 'SAN',
    countryId: 'CO',
    isActive: true
  }
];