import { District } from '@/modules/districts/types/districts.types';

/**
 * Master Districts Data - El Salvador (Real Official Data)
 * 262 Distritos oficiales de El Salvador
 * Fuente: División político-administrativa oficial de El Salvador
 */
export const MASTER_DISTRICTS_SV: District[] = [
  // AHUACHAPÁN - 12 Distritos
  // Municipio: Ahuachapán Norte
  { id: 'sv-d-ah-n-01', name: 'Atiquizaya', municipalityId: 'sv-m-ah-01', isActive: true },
  { id: 'sv-d-ah-n-02', name: 'El Refugio', municipalityId: 'sv-m-ah-01', isActive: true },
  { id: 'sv-d-ah-n-03', name: 'San Lorenzo', municipalityId: 'sv-m-ah-01', isActive: true },
  { id: 'sv-d-ah-n-04', name: 'Turín', municipalityId: 'sv-m-ah-01', isActive: true },
  
  // Municipio: Ahuachapán Centro
  { id: 'sv-d-ah-c-01', name: 'Ahuachapán', municipalityId: 'sv-m-ah-02', isActive: true },
  { id: 'sv-d-ah-c-02', name: 'Apaneca', municipalityId: 'sv-m-ah-02', isActive: true },
  { id: 'sv-d-ah-c-03', name: 'Concepción de Ataco', municipalityId: 'sv-m-ah-02', isActive: true },
  { id: 'sv-d-ah-c-04', name: 'Tacuba', municipalityId: 'sv-m-ah-02', isActive: true },
  
  // Municipio: Ahuachapán Sur
  { id: 'sv-d-ah-s-01', name: 'Guaymango', municipalityId: 'sv-m-ah-03', isActive: true },
  { id: 'sv-d-ah-s-02', name: 'Jujutla', municipalityId: 'sv-m-ah-03', isActive: true },
  { id: 'sv-d-ah-s-03', name: 'San Francisco Menendez', municipalityId: 'sv-m-ah-03', isActive: true },
  { id: 'sv-d-ah-s-04', name: 'San Pedro Puxtla', municipalityId: 'sv-m-ah-03', isActive: true },

  // SAN SALVADOR - 19 Distritos
  // Municipio: San Salvador Norte
  { id: 'sv-d-ss-n-01', name: 'Aguilares', municipalityId: 'sv-m-ss-01', isActive: true },
  { id: 'sv-d-ss-n-02', name: 'El Paisnal', municipalityId: 'sv-m-ss-01', isActive: true },
  { id: 'sv-d-ss-n-03', name: 'Guazapa', municipalityId: 'sv-m-ss-01', isActive: true },
  
  // Municipio: San Salvador Oeste
  { id: 'sv-d-ss-o-01', name: 'Apopa', municipalityId: 'sv-m-ss-02', isActive: true },
  { id: 'sv-d-ss-o-02', name: 'Nejapa', municipalityId: 'sv-m-ss-02', isActive: true },
  
  // Municipio: San Salvador Este
  { id: 'sv-d-ss-e-01', name: 'Ilopango', municipalityId: 'sv-m-ss-03', isActive: true },
  { id: 'sv-d-ss-e-02', name: 'San Martín', municipalityId: 'sv-m-ss-03', isActive: true },
  { id: 'sv-d-ss-e-03', name: 'Soyapango', municipalityId: 'sv-m-ss-03', isActive: true },
  { id: 'sv-d-ss-e-04', name: 'Tonacatepeque', municipalityId: 'sv-m-ss-03', isActive: true },
  
  // Municipio: San Salvador Centro
  { id: 'sv-d-ss-c-01', name: 'Ayutuxtepeque', municipalityId: 'sv-m-ss-04', isActive: true },
  { id: 'sv-d-ss-c-02', name: 'Mejicanos', municipalityId: 'sv-m-ss-04', isActive: true },
  { id: 'sv-d-ss-c-03', name: 'San Salvador', municipalityId: 'sv-m-ss-04', isActive: true },
  { id: 'sv-d-ss-c-04', name: 'Cuscatancingo', municipalityId: 'sv-m-ss-04', isActive: true },
  { id: 'sv-d-ss-c-05', name: 'Ciudad Delgado', municipalityId: 'sv-m-ss-04', isActive: true },
  
  // Municipio: San Salvador Sur
  { id: 'sv-d-ss-s-01', name: 'Panchimalco', municipalityId: 'sv-m-ss-05', isActive: true },
  { id: 'sv-d-ss-s-02', name: 'Rosario de Mora', municipalityId: 'sv-m-ss-05', isActive: true },
  { id: 'sv-d-ss-s-03', name: 'San Marcos', municipalityId: 'sv-m-ss-05', isActive: true },
  { id: 'sv-d-ss-s-04', name: 'Santo Tomás', municipalityId: 'sv-m-ss-05', isActive: true },
  { id: 'sv-d-ss-s-05', name: 'Santiago Texacuangos', municipalityId: 'sv-m-ss-05', isActive: true },

  // LA LIBERTAD - 22 Distritos
  // Municipio: La Libertad Norte
  { id: 'sv-d-ll-n-01', name: 'Quezaltepeque', municipalityId: 'sv-m-ll-01', isActive: true },
  { id: 'sv-d-ll-n-02', name: 'San Matías', municipalityId: 'sv-m-ll-01', isActive: true },
  { id: 'sv-d-ll-n-03', name: 'San Pablo Tacachico', municipalityId: 'sv-m-ll-01', isActive: true },
  
  // Municipio: La Libertad Centro
  { id: 'sv-d-ll-c-01', name: 'San Juan Opico', municipalityId: 'sv-m-ll-02', isActive: true },
  { id: 'sv-d-ll-c-02', name: 'Ciudad Arce', municipalityId: 'sv-m-ll-02', isActive: true },
  
  // Municipio: La Libertad Oeste
  { id: 'sv-d-ll-o-01', name: 'Colón', municipalityId: 'sv-m-ll-03', isActive: true },
  { id: 'sv-d-ll-o-02', name: 'Jayaque', municipalityId: 'sv-m-ll-03', isActive: true },
  { id: 'sv-d-ll-o-03', name: 'Sacacoyo', municipalityId: 'sv-m-ll-03', isActive: true },
  { id: 'sv-d-ll-o-04', name: 'Tepecoyo', municipalityId: 'sv-m-ll-03', isActive: true },
  { id: 'sv-d-ll-o-05', name: 'Talnique', municipalityId: 'sv-m-ll-03', isActive: true },
  
  // Municipio: La Libertad Este
  { id: 'sv-d-ll-e-01', name: 'Antiguo Cuscatlán', municipalityId: 'sv-m-ll-04', isActive: true },
  { id: 'sv-d-ll-e-02', name: 'Huizucar', municipalityId: 'sv-m-ll-04', isActive: true },
  { id: 'sv-d-ll-e-03', name: 'Nuevo Cuscatlán', municipalityId: 'sv-m-ll-04', isActive: true },
  { id: 'sv-d-ll-e-04', name: 'San José Villanueva', municipalityId: 'sv-m-ll-04', isActive: true },
  { id: 'sv-d-ll-e-05', name: 'Zaragoza', municipalityId: 'sv-m-ll-04', isActive: true },
  
  // Municipio: La Libertad Costa
  { id: 'sv-d-ll-co-01', name: 'Chiltuipán', municipalityId: 'sv-m-ll-05', isActive: true },
  { id: 'sv-d-ll-co-02', name: 'Jicalapa', municipalityId: 'sv-m-ll-05', isActive: true },
  { id: 'sv-d-ll-co-03', name: 'La Libertad', municipalityId: 'sv-m-ll-05', isActive: true },
  { id: 'sv-d-ll-co-04', name: 'Tamanique', municipalityId: 'sv-m-ll-05', isActive: true },
  { id: 'sv-d-ll-co-05', name: 'Teotepeque', municipalityId: 'sv-m-ll-05', isActive: true },
  
  // Municipio: La Libertad Sur
  { id: 'sv-d-ll-s-01', name: 'Comasagua', municipalityId: 'sv-m-ll-06', isActive: true },
  { id: 'sv-d-ll-s-02', name: 'Santa Tecla', municipalityId: 'sv-m-ll-06', isActive: true },

  // CHALATENANGO - 33 Distritos
  // Municipio: Chalatenango Norte
  { id: 'sv-d-ch-n-01', name: 'La Palma', municipalityId: 'sv-m-ch-01', isActive: true },
  { id: 'sv-d-ch-n-02', name: 'Citalá', municipalityId: 'sv-m-ch-01', isActive: true },
  { id: 'sv-d-ch-n-03', name: 'San Ignacio', municipalityId: 'sv-m-ch-01', isActive: true },
  
  // Municipio: Chalatenango Centro
  { id: 'sv-d-ch-c-01', name: 'Nueva Concepción', municipalityId: 'sv-m-ch-02', isActive: true },
  { id: 'sv-d-ch-c-02', name: 'Tejutla', municipalityId: 'sv-m-ch-02', isActive: true },
  { id: 'sv-d-ch-c-03', name: 'La Reina', municipalityId: 'sv-m-ch-02', isActive: true },
  { id: 'sv-d-ch-c-04', name: 'Agua Caliente', municipalityId: 'sv-m-ch-02', isActive: true },
  { id: 'sv-d-ch-c-05', name: 'Dulce Nombre de María', municipalityId: 'sv-m-ch-02', isActive: true },
  { id: 'sv-d-ch-c-06', name: 'El Paraíso', municipalityId: 'sv-m-ch-02', isActive: true },
  { id: 'sv-d-ch-c-07', name: 'San Francisco Morazán', municipalityId: 'sv-m-ch-02', isActive: true },
  { id: 'sv-d-ch-c-08', name: 'San Rafael', municipalityId: 'sv-m-ch-02', isActive: true },
  { id: 'sv-d-ch-c-09', name: 'Santa Rita', municipalityId: 'sv-m-ch-02', isActive: true },
  { id: 'sv-d-ch-c-10', name: 'San Fernando', municipalityId: 'sv-m-ch-02', isActive: true },
  
  // Municipio: Chalatenango Sur
  { id: 'sv-d-ch-s-01', name: 'Chalatenango', municipalityId: 'sv-m-ch-03', isActive: true },
  { id: 'sv-d-ch-s-02', name: 'Arcatao', municipalityId: 'sv-m-ch-03', isActive: true },
  { id: 'sv-d-ch-s-03', name: 'Azacualpa', municipalityId: 'sv-m-ch-03', isActive: true },
  { id: 'sv-d-ch-s-04', name: 'Comalapa', municipalityId: 'sv-m-ch-03', isActive: true },
  { id: 'sv-d-ch-s-05', name: 'Concepción Quezaltepeque', municipalityId: 'sv-m-ch-03', isActive: true },
  { id: 'sv-d-ch-s-06', name: 'El Carrizal', municipalityId: 'sv-m-ch-03', isActive: true },
  { id: 'sv-d-ch-s-07', name: 'La Laguna', municipalityId: 'sv-m-ch-03', isActive: true },
  { id: 'sv-d-ch-s-08', name: 'Las Vueltas', municipalityId: 'sv-m-ch-03', isActive: true },
  { id: 'sv-d-ch-s-09', name: 'Nombre de Jesús', municipalityId: 'sv-m-ch-03', isActive: true },
  { id: 'sv-d-ch-s-10', name: 'Nueva Trinidad', municipalityId: 'sv-m-ch-03', isActive: true },
  { id: 'sv-d-ch-s-11', name: 'Ojos de Agua', municipalityId: 'sv-m-ch-03', isActive: true },
  { id: 'sv-d-ch-s-12', name: 'Potonico', municipalityId: 'sv-m-ch-03', isActive: true },
  { id: 'sv-d-ch-s-13', name: 'San Antonio de La Cruz', municipalityId: 'sv-m-ch-03', isActive: true },
  { id: 'sv-d-ch-s-14', name: 'San Antonio Los Ranchos', municipalityId: 'sv-m-ch-03', isActive: true },
  { id: 'sv-d-ch-s-15', name: 'San Francisco Lempa', municipalityId: 'sv-m-ch-03', isActive: true },
  { id: 'sv-d-ch-s-16', name: 'San Isidro Labrador', municipalityId: 'sv-m-ch-03', isActive: true },
  { id: 'sv-d-ch-s-17', name: 'San José Cancasque', municipalityId: 'sv-m-ch-03', isActive: true },
  { id: 'sv-d-ch-s-18', name: 'San Miguel de Mercedes', municipalityId: 'sv-m-ch-03', isActive: true },
  { id: 'sv-d-ch-s-19', name: 'San José Las Flores', municipalityId: 'sv-m-ch-03', isActive: true },
  { id: 'sv-d-ch-s-20', name: 'San Luis del Carmen', municipalityId: 'sv-m-ch-03', isActive: true },

  // CUSCATLÁN - 16 Distritos
  // Municipio: Cuscatlán Norte
  { id: 'sv-d-cu-n-01', name: 'Suchitoto', municipalityId: 'sv-m-cu-01', isActive: true },
  { id: 'sv-d-cu-n-02', name: 'San José Guayabal', municipalityId: 'sv-m-cu-01', isActive: true },
  { id: 'sv-d-cu-n-03', name: 'Oratorio de Concepción', municipalityId: 'sv-m-cu-01', isActive: true },
  { id: 'sv-d-cu-n-04', name: 'San Bartolomé Perulapán', municipalityId: 'sv-m-cu-01', isActive: true },
  { id: 'sv-d-cu-n-05', name: 'San Pedro Perulapán', municipalityId: 'sv-m-cu-01', isActive: true },
  
  // Municipio: Cuscatlán Sur
  { id: 'sv-d-cu-s-01', name: 'Cojutepeque', municipalityId: 'sv-m-cu-02', isActive: true },
  { id: 'sv-d-cu-s-02', name: 'San Rafael Cedros', municipalityId: 'sv-m-cu-02', isActive: true },
  { id: 'sv-d-cu-s-03', name: 'Candelaria', municipalityId: 'sv-m-cu-02', isActive: true },
  { id: 'sv-d-cu-s-04', name: 'Monte San Juan', municipalityId: 'sv-m-cu-02', isActive: true },
  { id: 'sv-d-cu-s-05', name: 'El Carmen', municipalityId: 'sv-m-cu-02', isActive: true },
  { id: 'sv-d-cu-s-06', name: 'San Cristóbal', municipalityId: 'sv-m-cu-02', isActive: true },
  { id: 'sv-d-cu-s-07', name: 'Santa Cruz Michapa', municipalityId: 'sv-m-cu-02', isActive: true },
  { id: 'sv-d-cu-s-08', name: 'San Ramón', municipalityId: 'sv-m-cu-02', isActive: true },
  { id: 'sv-d-cu-s-09', name: 'El Rosario', municipalityId: 'sv-m-cu-02', isActive: true },
  { id: 'sv-d-cu-s-10', name: 'Santa Cruz Analquito', municipalityId: 'sv-m-cu-02', isActive: true },
  { id: 'sv-d-cu-s-11', name: 'Tenancingo', municipalityId: 'sv-m-cu-02', isActive: true },

  // CABAÑAS - 9 Distritos
  // Municipio: Cabañas Este
  { id: 'sv-d-ca-e-01', name: 'Sensuntepeque', municipalityId: 'sv-m-ca-01', isActive: true },
  { id: 'sv-d-ca-e-02', name: 'Victoria', municipalityId: 'sv-m-ca-01', isActive: true },
  { id: 'sv-d-ca-e-03', name: 'Dolores', municipalityId: 'sv-m-ca-01', isActive: true },
  { id: 'sv-d-ca-e-04', name: 'Guacotecti', municipalityId: 'sv-m-ca-01', isActive: true },
  { id: 'sv-d-ca-e-05', name: 'San Isidro', municipalityId: 'sv-m-ca-01', isActive: true },
  
  // Municipio: Cabañas Oeste
  { id: 'sv-d-ca-o-01', name: 'Ilobasco', municipalityId: 'sv-m-ca-02', isActive: true },
  { id: 'sv-d-ca-o-02', name: 'Tejutepeque', municipalityId: 'sv-m-ca-02', isActive: true },
  { id: 'sv-d-ca-o-03', name: 'Jutiapa', municipalityId: 'sv-m-ca-02', isActive: true },
  { id: 'sv-d-ca-o-04', name: 'Cinquera', municipalityId: 'sv-m-ca-02', isActive: true },

  // LA PAZ - 22 Distritos
  // Municipio: La Paz Oeste
  { id: 'sv-d-lp-o-01', name: 'Cuyultitán', municipalityId: 'sv-m-lp-01', isActive: true },
  { id: 'sv-d-lp-o-02', name: 'Olocuilta', municipalityId: 'sv-m-lp-01', isActive: true },
  { id: 'sv-d-lp-o-03', name: 'San Juan Talpa', municipalityId: 'sv-m-lp-01', isActive: true },
  { id: 'sv-d-lp-o-04', name: 'San Luis Talpa', municipalityId: 'sv-m-lp-01', isActive: true },
  { id: 'sv-d-lp-o-05', name: 'San Pedro Masahuat', municipalityId: 'sv-m-lp-01', isActive: true },
  { id: 'sv-d-lp-o-06', name: 'Tapalhuaca', municipalityId: 'sv-m-lp-01', isActive: true },
  { id: 'sv-d-lp-o-07', name: 'San Francisco Chinameca', municipalityId: 'sv-m-lp-01', isActive: true },
  
  // Municipio: La Paz Centro
  { id: 'sv-d-lp-c-01', name: 'El Rosario', municipalityId: 'sv-m-lp-02', isActive: true },
  { id: 'sv-d-lp-c-02', name: 'Jerusalén', municipalityId: 'sv-m-lp-02', isActive: true },
  { id: 'sv-d-lp-c-03', name: 'Mercedes La Ceiba', municipalityId: 'sv-m-lp-02', isActive: true },
  { id: 'sv-d-lp-c-04', name: 'Paraíso de Osorio', municipalityId: 'sv-m-lp-02', isActive: true },
  { id: 'sv-d-lp-c-05', name: 'San Antonio Masahuat', municipalityId: 'sv-m-lp-02', isActive: true },
  { id: 'sv-d-lp-c-06', name: 'San Emigdio', municipalityId: 'sv-m-lp-02', isActive: true },
  { id: 'sv-d-lp-c-07', name: 'San Juan Tepezontes', municipalityId: 'sv-m-lp-02', isActive: true },
  { id: 'sv-d-lp-c-08', name: 'San Luis La Herradura', municipalityId: 'sv-m-lp-02', isActive: true },
  { id: 'sv-d-lp-c-09', name: 'San Miguel Tepezontes', municipalityId: 'sv-m-lp-02', isActive: true },
  { id: 'sv-d-lp-c-10', name: 'San Pedro Nonualco', municipalityId: 'sv-m-lp-02', isActive: true },
  { id: 'sv-d-lp-c-11', name: 'Santa María Ostuma', municipalityId: 'sv-m-lp-02', isActive: true },
  { id: 'sv-d-lp-c-12', name: 'Santiago Nonualco', municipalityId: 'sv-m-lp-02', isActive: true },
  
  // Municipio: La Paz Este
  { id: 'sv-d-lp-e-01', name: 'San Juan Nonualco', municipalityId: 'sv-m-lp-03', isActive: true },
  { id: 'sv-d-lp-e-02', name: 'San Rafael Obrajuelo', municipalityId: 'sv-m-lp-03', isActive: true },
  { id: 'sv-d-lp-e-03', name: 'Zacatecoluca', municipalityId: 'sv-m-lp-03', isActive: true },

  // LA UNIÓN - 18 Distritos
  // Municipio: La Unión Norte
  { id: 'sv-d-lu-n-01', name: 'Anamorós', municipalityId: 'sv-m-lu-01', isActive: true },
  { id: 'sv-d-lu-n-02', name: 'Bolivar', municipalityId: 'sv-m-lu-01', isActive: true },
  { id: 'sv-d-lu-n-03', name: 'Concepción de Oriente', municipalityId: 'sv-m-lu-01', isActive: true },
  { id: 'sv-d-lu-n-04', name: 'El Sauce', municipalityId: 'sv-m-lu-01', isActive: true },
  { id: 'sv-d-lu-n-05', name: 'Lislique', municipalityId: 'sv-m-lu-01', isActive: true },
  { id: 'sv-d-lu-n-06', name: 'Nueva Esparta', municipalityId: 'sv-m-lu-01', isActive: true },
  { id: 'sv-d-lu-n-07', name: 'Pasaquina', municipalityId: 'sv-m-lu-01', isActive: true },
  { id: 'sv-d-lu-n-08', name: 'Polorós', municipalityId: 'sv-m-lu-01', isActive: true },
  { id: 'sv-d-lu-n-09', name: 'San José La Fuente', municipalityId: 'sv-m-lu-01', isActive: true },
  { id: 'sv-d-lu-n-10', name: 'Santa Rosa de Lima', municipalityId: 'sv-m-lu-01', isActive: true },
  
  // Municipio: La Unión Sur
  { id: 'sv-d-lu-s-01', name: 'Conchagua', municipalityId: 'sv-m-lu-02', isActive: true },
  { id: 'sv-d-lu-s-02', name: 'El Carmen', municipalityId: 'sv-m-lu-02', isActive: true },
  { id: 'sv-d-lu-s-03', name: 'Intipucá', municipalityId: 'sv-m-lu-02', isActive: true },
  { id: 'sv-d-lu-s-04', name: 'La Unión', municipalityId: 'sv-m-lu-02', isActive: true },
  { id: 'sv-d-lu-s-05', name: 'Meanguera del Golfo', municipalityId: 'sv-m-lu-02', isActive: true },
  { id: 'sv-d-lu-s-06', name: 'San Alejo', municipalityId: 'sv-m-lu-02', isActive: true },
  { id: 'sv-d-lu-s-07', name: 'Yayantique', municipalityId: 'sv-m-lu-02', isActive: true },
  { id: 'sv-d-lu-s-08', name: 'Yucuaiquín', municipalityId: 'sv-m-lu-02', isActive: true },

  // USULUTÁN - 23 Distritos
  // Municipio: Usulután Norte
  { id: 'sv-d-us-n-01', name: 'Santiago de María', municipalityId: 'sv-m-us-01', isActive: true },
  { id: 'sv-d-us-n-02', name: 'Alegría', municipalityId: 'sv-m-us-01', isActive: true },
  { id: 'sv-d-us-n-03', name: 'Berlín', municipalityId: 'sv-m-us-01', isActive: true },
  { id: 'sv-d-us-n-04', name: 'Mercedes Umana', municipalityId: 'sv-m-us-01', isActive: true },
  { id: 'sv-d-us-n-05', name: 'Jucuapa', municipalityId: 'sv-m-us-01', isActive: true },
  { id: 'sv-d-us-n-06', name: 'El Triunfo', municipalityId: 'sv-m-us-01', isActive: true },
  { id: 'sv-d-us-n-07', name: 'Estanzuelas', municipalityId: 'sv-m-us-01', isActive: true },
  { id: 'sv-d-us-n-08', name: 'San Buenaventura', municipalityId: 'sv-m-us-01', isActive: true },
  { id: 'sv-d-us-n-09', name: 'Nueva Granada', municipalityId: 'sv-m-us-01', isActive: true },
  
  // Municipio: Usulután Este
  { id: 'sv-d-us-e-01', name: 'Usulután', municipalityId: 'sv-m-us-02', isActive: true },
  { id: 'sv-d-us-e-02', name: 'Jucuarán', municipalityId: 'sv-m-us-02', isActive: true },
  { id: 'sv-d-us-e-03', name: 'San Dionisio', municipalityId: 'sv-m-us-02', isActive: true },
  { id: 'sv-d-us-e-04', name: 'Concepción Batres', municipalityId: 'sv-m-us-02', isActive: true },
  { id: 'sv-d-us-e-05', name: 'Santa María', municipalityId: 'sv-m-us-02', isActive: true },
  { id: 'sv-d-us-e-06', name: 'Ozatlán', municipalityId: 'sv-m-us-02', isActive: true },
  { id: 'sv-d-us-e-07', name: 'Tecapán', municipalityId: 'sv-m-us-02', isActive: true },
  { id: 'sv-d-us-e-08', name: 'Santa Elena', municipalityId: 'sv-m-us-02', isActive: true },
  { id: 'sv-d-us-e-09', name: 'California', municipalityId: 'sv-m-us-02', isActive: true },
  { id: 'sv-d-us-e-10', name: 'Ereguayquín', municipalityId: 'sv-m-us-02', isActive: true },
  
  // Municipio: Usulután Oeste
  { id: 'sv-d-us-o-01', name: 'Jiquilisco', municipalityId: 'sv-m-us-03', isActive: true },
  { id: 'sv-d-us-o-02', name: 'Puerto El Triunfo', municipalityId: 'sv-m-us-03', isActive: true },
  { id: 'sv-d-us-o-03', name: 'San Agustín', municipalityId: 'sv-m-us-03', isActive: true },
  { id: 'sv-d-us-o-04', name: 'San Francisco Javier', municipalityId: 'sv-m-us-03', isActive: true },

  // SONSONATE - 17 Distritos
  // Municipio: Sonsonate Norte
  { id: 'sv-d-so-n-01', name: 'Juayúa', municipalityId: 'sv-m-so-01', isActive: true },
  { id: 'sv-d-so-n-02', name: 'Nahuizalco', municipalityId: 'sv-m-so-01', isActive: true },
  { id: 'sv-d-so-n-03', name: 'Salcoatitán', municipalityId: 'sv-m-so-01', isActive: true },
  { id: 'sv-d-so-n-04', name: 'Santa Catarina Masahuat', municipalityId: 'sv-m-so-01', isActive: true },
  
  // Municipio: Sonsonate Centro
  { id: 'sv-d-so-c-01', name: 'Sonsonate', municipalityId: 'sv-m-so-02', isActive: true },
  { id: 'sv-d-so-c-02', name: 'Sonzacate', municipalityId: 'sv-m-so-02', isActive: true },
  { id: 'sv-d-so-c-03', name: 'Nahulingo', municipalityId: 'sv-m-so-02', isActive: true },
  { id: 'sv-d-so-c-04', name: 'San Antonio del Monte', municipalityId: 'sv-m-so-02', isActive: true },
  { id: 'sv-d-so-c-05', name: 'Santo Domingo de Guzmán', municipalityId: 'sv-m-so-02', isActive: true },
  
  // Municipio: Sonsonate Este
  { id: 'sv-d-so-e-01', name: 'Izalco', municipalityId: 'sv-m-so-03', isActive: true },
  { id: 'sv-d-so-e-02', name: 'Armenia', municipalityId: 'sv-m-so-03', isActive: true },
  { id: 'sv-d-so-e-03', name: 'Caluco', municipalityId: 'sv-m-so-03', isActive: true },
  { id: 'sv-d-so-e-04', name: 'San Julián', municipalityId: 'sv-m-so-03', isActive: true },
  { id: 'sv-d-so-e-05', name: 'Cuisnahuat', municipalityId: 'sv-m-so-03', isActive: true },
  { id: 'sv-d-so-e-06', name: 'Santa Isabel Ishuatán', municipalityId: 'sv-m-so-03', isActive: true },
  
  // Municipio: Sonsonate Oeste
  { id: 'sv-d-so-o-01', name: 'Acajutla', municipalityId: 'sv-m-so-04', isActive: true },

  // SANTA ANA - 13 Distritos
  // Municipio: Santa Ana Norte
  { id: 'sv-d-sa-n-01', name: 'Masahuat', municipalityId: 'sv-m-sa-01', isActive: true },
  { id: 'sv-d-sa-n-02', name: 'Metapán', municipalityId: 'sv-m-sa-01', isActive: true },
  { id: 'sv-d-sa-n-03', name: 'Santa Rosa Guachipilín', municipalityId: 'sv-m-sa-01', isActive: true },
  { id: 'sv-d-sa-n-04', name: 'Texistepeque', municipalityId: 'sv-m-sa-01', isActive: true },
  
  // Municipio: Santa Ana Centro
  { id: 'sv-d-sa-c-01', name: 'Santa Ana', municipalityId: 'sv-m-sa-02', isActive: true },
  
  // Municipio: Santa Ana Este
  { id: 'sv-d-sa-e-01', name: 'Coatepeque', municipalityId: 'sv-m-sa-03', isActive: true },
  { id: 'sv-d-sa-e-02', name: 'El Congo', municipalityId: 'sv-m-sa-03', isActive: true },
  
  // Municipio: Santa Ana Oeste
  { id: 'sv-d-sa-o-01', name: 'Candelaria de la Frontera', municipalityId: 'sv-m-sa-04', isActive: true },
  { id: 'sv-d-sa-o-02', name: 'Chalchuapa', municipalityId: 'sv-m-sa-04', isActive: true },
  { id: 'sv-d-sa-o-03', name: 'El Porvenir', municipalityId: 'sv-m-sa-04', isActive: true },
  { id: 'sv-d-sa-o-04', name: 'San Antonio Pajonal', municipalityId: 'sv-m-sa-04', isActive: true },
  { id: 'sv-d-sa-o-05', name: 'San Sebastián Salitrillo', municipalityId: 'sv-m-sa-04', isActive: true },
  { id: 'sv-d-sa-o-06', name: 'Santiago de La Frontera', municipalityId: 'sv-m-sa-04', isActive: true },

  // SAN VICENTE - 13 Distritos
  // Municipio: San Vicente Norte
  { id: 'sv-d-sv-n-01', name: 'Apastepeque', municipalityId: 'sv-m-sv-01', isActive: true },
  { id: 'sv-d-sv-n-02', name: 'Santa Clara', municipalityId: 'sv-m-sv-01', isActive: true },
  { id: 'sv-d-sv-n-03', name: 'San Ildefonso', municipalityId: 'sv-m-sv-01', isActive: true },
  { id: 'sv-d-sv-n-04', name: 'San Esteban Catarina', municipalityId: 'sv-m-sv-01', isActive: true },
  { id: 'sv-d-sv-n-05', name: 'San Sebastián', municipalityId: 'sv-m-sv-01', isActive: true },
  { id: 'sv-d-sv-n-06', name: 'San Lorenzo', municipalityId: 'sv-m-sv-01', isActive: true },
  { id: 'sv-d-sv-n-07', name: 'Santo Domingo', municipalityId: 'sv-m-sv-01', isActive: true },
  
  // Municipio: San Vicente Sur
  { id: 'sv-d-sv-s-01', name: 'San Vicente', municipalityId: 'sv-m-sv-02', isActive: true },
  { id: 'sv-d-sv-s-02', name: 'Guadalupe', municipalityId: 'sv-m-sv-02', isActive: true },
  { id: 'sv-d-sv-s-03', name: 'Verapaz', municipalityId: 'sv-m-sv-02', isActive: true },
  { id: 'sv-d-sv-s-04', name: 'Tepetitán', municipalityId: 'sv-m-sv-02', isActive: true },
  { id: 'sv-d-sv-s-05', name: 'Tecoluca', municipalityId: 'sv-m-sv-02', isActive: true },
  { id: 'sv-d-sv-s-06', name: 'San Cayetano Istepeque', municipalityId: 'sv-m-sv-02', isActive: true },

  // SAN MIGUEL - 20 Distritos
  // Municipio: San Miguel Norte
  { id: 'sv-d-sm-n-01', name: 'Ciudad Barrios', municipalityId: 'sv-m-sm-01', isActive: true },
  { id: 'sv-d-sm-n-02', name: 'Sesori', municipalityId: 'sv-m-sm-01', isActive: true },
  { id: 'sv-d-sm-n-03', name: 'Nuevo Edén de San Juan', municipalityId: 'sv-m-sm-01', isActive: true },
  { id: 'sv-d-sm-n-04', name: 'San Gerardo', municipalityId: 'sv-m-sm-01', isActive: true },
  { id: 'sv-d-sm-n-05', name: 'San Luis de La Reina', municipalityId: 'sv-m-sm-01', isActive: true },
  { id: 'sv-d-sm-n-06', name: 'Carolina', municipalityId: 'sv-m-sm-01', isActive: true },
  { id: 'sv-d-sm-n-07', name: 'San Antonio del Mosco', municipalityId: 'sv-m-sm-01', isActive: true },
  { id: 'sv-d-sm-n-08', name: 'Chapeltique', municipalityId: 'sv-m-sm-01', isActive: true },
  
  // Municipio: San Miguel Centro
  { id: 'sv-d-sm-c-01', name: 'San Miguel', municipalityId: 'sv-m-sm-02', isActive: true },
  { id: 'sv-d-sm-c-02', name: 'Comacarán', municipalityId: 'sv-m-sm-02', isActive: true },
  { id: 'sv-d-sm-c-03', name: 'Uluazapa', municipalityId: 'sv-m-sm-02', isActive: true },
  { id: 'sv-d-sm-c-04', name: 'Moncagua', municipalityId: 'sv-m-sm-02', isActive: true },
  { id: 'sv-d-sm-c-05', name: 'Quelepa', municipalityId: 'sv-m-sm-02', isActive: true },
  { id: 'sv-d-sm-c-06', name: 'Chirilagua', municipalityId: 'sv-m-sm-02', isActive: true },
  
  // Municipio: San Miguel Oeste
  { id: 'sv-d-sm-o-01', name: 'Chinameca', municipalityId: 'sv-m-sm-03', isActive: true },
  { id: 'sv-d-sm-o-02', name: 'Nueva Guadalupe', municipalityId: 'sv-m-sm-03', isActive: true },
  { id: 'sv-d-sm-o-03', name: 'Lolotique', municipalityId: 'sv-m-sm-03', isActive: true },
  { id: 'sv-d-sm-o-04', name: 'San Jorge', municipalityId: 'sv-m-sm-03', isActive: true },
  { id: 'sv-d-sm-o-05', name: 'San Rafael Oriente', municipalityId: 'sv-m-sm-03', isActive: true },
  { id: 'sv-d-sm-o-06', name: 'El Tránsito', municipalityId: 'sv-m-sm-03', isActive: true },

  // MORAZÁN - 25 Distritos
  // Municipio: Morazán Norte
  { id: 'sv-d-mo-n-01', name: 'Arambala', municipalityId: 'sv-m-mo-01', isActive: true },
  { id: 'sv-d-mo-n-02', name: 'Cacaopera', municipalityId: 'sv-m-mo-01', isActive: true },
  { id: 'sv-d-mo-n-03', name: 'Corinto', municipalityId: 'sv-m-mo-01', isActive: true },
  { id: 'sv-d-mo-n-04', name: 'El Rosario', municipalityId: 'sv-m-mo-01', isActive: true },
  { id: 'sv-d-mo-n-05', name: 'Joateca', municipalityId: 'sv-m-mo-01', isActive: true },
  { id: 'sv-d-mo-n-06', name: 'Jocoaitique', municipalityId: 'sv-m-mo-01', isActive: true },
  { id: 'sv-d-mo-n-07', name: 'Meanguera', municipalityId: 'sv-m-mo-01', isActive: true },
  { id: 'sv-d-mo-n-08', name: 'Perquín', municipalityId: 'sv-m-mo-01', isActive: true },
  { id: 'sv-d-mo-n-09', name: 'San Fernando', municipalityId: 'sv-m-mo-01', isActive: true },
  { id: 'sv-d-mo-n-10', name: 'San Isidro', municipalityId: 'sv-m-mo-01', isActive: true },
  { id: 'sv-d-mo-n-11', name: 'Torola', municipalityId: 'sv-m-mo-01', isActive: true },
  
  // Municipio: Morazán Sur
  { id: 'sv-d-mo-s-01', name: 'Chilanga', municipalityId: 'sv-m-mo-02', isActive: true },
  { id: 'sv-d-mo-s-02', name: 'Delicias de Concepción', municipalityId: 'sv-m-mo-02', isActive: true },
  { id: 'sv-d-mo-s-03', name: 'El Divisadero', municipalityId: 'sv-m-mo-02', isActive: true },
  { id: 'sv-d-mo-s-04', name: 'Gualococti', municipalityId: 'sv-m-mo-02', isActive: true },
  { id: 'sv-d-mo-s-05', name: 'Guatajiagua', municipalityId: 'sv-m-mo-02', isActive: true },
  { id: 'sv-d-mo-s-06', name: 'Jocoro', municipalityId: 'sv-m-mo-02', isActive: true },
  { id: 'sv-d-mo-s-07', name: 'Lolotiquillo', municipalityId: 'sv-m-mo-02', isActive: true },
  { id: 'sv-d-mo-s-08', name: 'Osicala', municipalityId: 'sv-m-mo-02', isActive: true },
  { id: 'sv-d-mo-s-09', name: 'San Carlos', municipalityId: 'sv-m-mo-02', isActive: true },
  { id: 'sv-d-mo-s-10', name: 'San Francisco Gotera', municipalityId: 'sv-m-mo-02', isActive: true },
  { id: 'sv-d-mo-s-11', name: 'San Simón', municipalityId: 'sv-m-mo-02', isActive: true },
  { id: 'sv-d-mo-s-12', name: 'Sensembra', municipalityId: 'sv-m-mo-02', isActive: true },
  { id: 'sv-d-mo-s-13', name: 'Sociedad', municipalityId: 'sv-m-mo-02', isActive: true },
  { id: 'sv-d-mo-s-14', name: 'Yamabal', municipalityId: 'sv-m-mo-02', isActive: true },
  { id: 'sv-d-mo-s-15', name: 'Yoloaiquín', municipalityId: 'sv-m-mo-02', isActive: true },
];

