import { Municipality } from '@/modules/municipalities/types/municipalities.types';

/**
 * Master Municipalities Data - El Salvador (Real Official Data)
 * 44 Municipios oficiales de El Salvador
 * Fuente: División político-administrativa oficial de El Salvador
 */
export const MASTER_MUNICIPALITIES_SV: Municipality[] = [
  // AHUACHAPÁN - 3 Municipios
  { id: 'sv-m-ah-01', name: 'Ahuachapán Norte', code: 'AH-N', departmentId: 'd1', isActive: true },
  { id: 'sv-m-ah-02', name: 'Ahuachapán Centro', code: 'AH-C', departmentId: 'd1', isActive: true },
  { id: 'sv-m-ah-03', name: 'Ahuachapán Sur', code: 'AH-S', departmentId: 'd1', isActive: true },

  // SAN SALVADOR - 5 Municipios
  { id: 'sv-m-ss-01', name: 'San Salvador Norte', code: 'SS-N', departmentId: 'd10', isActive: true },
  { id: 'sv-m-ss-02', name: 'San Salvador Oeste', code: 'SS-O', departmentId: 'd10', isActive: true },
  { id: 'sv-m-ss-03', name: 'San Salvador Este', code: 'SS-E', departmentId: 'd10', isActive: true },
  { id: 'sv-m-ss-04', name: 'San Salvador Centro', code: 'SS-C', departmentId: 'd10', isActive: true },
  { id: 'sv-m-ss-05', name: 'San Salvador Sur', code: 'SS-S', departmentId: 'd10', isActive: true },

  // LA LIBERTAD - 6 Municipios
  { id: 'sv-m-ll-01', name: 'La Libertad Norte', code: 'LL-N', departmentId: 'd5', isActive: true },
  { id: 'sv-m-ll-02', name: 'La Libertad Centro', code: 'LL-C', departmentId: 'd5', isActive: true },
  { id: 'sv-m-ll-03', name: 'La Libertad Oeste', code: 'LL-O', departmentId: 'd5', isActive: true },
  { id: 'sv-m-ll-04', name: 'La Libertad Este', code: 'LL-E', departmentId: 'd5', isActive: true },
  { id: 'sv-m-ll-05', name: 'La Libertad Costa', code: 'LL-CO', departmentId: 'd5', isActive: true },
  { id: 'sv-m-ll-06', name: 'La Libertad Sur', code: 'LL-S', departmentId: 'd5', isActive: true },

  // CHALATENANGO - 3 Municipios
  { id: 'sv-m-ch-01', name: 'Chalatenango Norte', code: 'CH-N', departmentId: 'd3', isActive: true },
  { id: 'sv-m-ch-02', name: 'Chalatenango Centro', code: 'CH-C', departmentId: 'd3', isActive: true },
  { id: 'sv-m-ch-03', name: 'Chalatenango Sur', code: 'CH-S', departmentId: 'd3', isActive: true },

  // CUSCATLÁN - 2 Municipios
  { id: 'sv-m-cu-01', name: 'Cuscatlán Norte', code: 'CU-N', departmentId: 'd4', isActive: true },
  { id: 'sv-m-cu-02', name: 'Cuscatlán Sur', code: 'CU-S', departmentId: 'd4', isActive: true },

  // CABAÑAS - 2 Municipios
  { id: 'sv-m-ca-01', name: 'Cabañas Este', code: 'CA-E', departmentId: 'd2', isActive: true },
  { id: 'sv-m-ca-02', name: 'Cabañas Oeste', code: 'CA-O', departmentId: 'd2', isActive: true },

  // LA PAZ - 3 Municipios
  { id: 'sv-m-lp-01', name: 'La Paz Oeste', code: 'LP-O', departmentId: 'd6', isActive: true },
  { id: 'sv-m-lp-02', name: 'La Paz Centro', code: 'LP-C', departmentId: 'd6', isActive: true },
  { id: 'sv-m-lp-03', name: 'La Paz Este', code: 'LP-E', departmentId: 'd6', isActive: true },

  // LA UNIÓN - 2 Municipios
  { id: 'sv-m-lu-01', name: 'La Unión Norte', code: 'LU-N', departmentId: 'd7', isActive: true },
  { id: 'sv-m-lu-02', name: 'La Unión Sur', code: 'LU-S', departmentId: 'd7', isActive: true },

  // USULUTÁN - 3 Municipios
  { id: 'sv-m-us-01', name: 'Usulután Norte', code: 'US-N', departmentId: 'd14', isActive: true },
  { id: 'sv-m-us-02', name: 'Usulután Este', code: 'US-E', departmentId: 'd14', isActive: true },
  { id: 'sv-m-us-03', name: 'Usulután Oeste', code: 'US-O', departmentId: 'd14', isActive: true },

  // SONSONATE - 4 Municipios
  { id: 'sv-m-so-01', name: 'Sonsonate Norte', code: 'SO-N', departmentId: 'd13', isActive: true },
  { id: 'sv-m-so-02', name: 'Sonsonate Centro', code: 'SO-C', departmentId: 'd13', isActive: true },
  { id: 'sv-m-so-03', name: 'Sonsonate Este', code: 'SO-E', departmentId: 'd13', isActive: true },
  { id: 'sv-m-so-04', name: 'Sonsonate Oeste', code: 'SO-O', departmentId: 'd13', isActive: true },

  // SANTA ANA - 4 Municipios
  { id: 'sv-m-sa-01', name: 'Santa Ana Norte', code: 'SA-N', departmentId: 'd12', isActive: true },
  { id: 'sv-m-sa-02', name: 'Santa Ana Centro', code: 'SA-C', departmentId: 'd12', isActive: true },
  { id: 'sv-m-sa-03', name: 'Santa Ana Este', code: 'SA-E', departmentId: 'd12', isActive: true },
  { id: 'sv-m-sa-04', name: 'Santa Ana Oeste', code: 'SA-O', departmentId: 'd12', isActive: true },

  // SAN VICENTE - 2 Municipios
  { id: 'sv-m-sv-01', name: 'San Vicente Norte', code: 'SV-N', departmentId: 'd11', isActive: true },
  { id: 'sv-m-sv-02', name: 'San Vicente Sur', code: 'SV-S', departmentId: 'd11', isActive: true },

  // SAN MIGUEL - 3 Municipios
  { id: 'sv-m-sm-01', name: 'San Miguel Norte', code: 'SM-N', departmentId: 'd9', isActive: true },
  { id: 'sv-m-sm-02', name: 'San Miguel Centro', code: 'SM-C', departmentId: 'd9', isActive: true },
  { id: 'sv-m-sm-03', name: 'San Miguel Oeste', code: 'SM-O', departmentId: 'd9', isActive: true },

  // MORAZÁN - 2 Municipios
  { id: 'sv-m-mo-01', name: 'Morazán Norte', code: 'MO-N', departmentId: 'd8', isActive: true },
  { id: 'sv-m-mo-02', name: 'Morazán Sur', code: 'MO-S', departmentId: 'd8', isActive: true },
];

