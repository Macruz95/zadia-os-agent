import { District } from './types/districts.types';

/**
 * ⚠️ CRÍTICO: NO MODIFICAR ESTE ARCHIVO - SISTEMA DE DIRECCIONES
 * ⚠️ Si modificas cualquier parte del sistema de direcciones se rompe todo
 * ⚠️ Este sistema funciona perfecto tal como está - NO TOCAR
 */
export const MOCK_DISTRICTS: District[] = [
  // Ahuachapán Norte
  { id: 'dist1-1-1', name: 'Atiquizaya', municipalityId: 'm1-1', isActive: true },
  { id: 'dist1-1-2', name: 'El Refugio', municipalityId: 'm1-1', isActive: true },
  { id: 'dist1-1-3', name: 'San Lorenzo', municipalityId: 'm1-1', isActive: true },
  { id: 'dist1-1-4', name: 'Turín', municipalityId: 'm1-1', isActive: true },

  // Ahuachapán Centro
  { id: 'dist1-2-1', name: 'Ahuachapán', municipalityId: 'm1-2', isActive: true },
  { id: 'dist1-2-2', name: 'Apaneca', municipalityId: 'm1-2', isActive: true },
  { id: 'dist1-2-3', name: 'Concepción de Ataco', municipalityId: 'm1-2', isActive: true },
  { id: 'dist1-2-4', name: 'Tacuba', municipalityId: 'm1-2', isActive: true },

  // Ahuachapán Sur
  { id: 'dist1-3-1', name: 'Guaymango', municipalityId: 'm1-3', isActive: true },
  { id: 'dist1-3-2', name: 'Jujutla', municipalityId: 'm1-3', isActive: true },
  { id: 'dist1-3-3', name: 'San Francisco Menendez', municipalityId: 'm1-3', isActive: true },
  { id: 'dist1-3-4', name: 'San Pedro Puxtla', municipalityId: 'm1-3', isActive: true },

  // Cabañas Este
  { id: 'dist2-1-1', name: 'Sensuntepeque', municipalityId: 'm2-1', isActive: true },
  { id: 'dist2-1-2', name: 'Victoria', municipalityId: 'm2-1', isActive: true },
  { id: 'dist2-1-3', name: 'Dolores', municipalityId: 'm2-1', isActive: true },
  { id: 'dist2-1-4', name: 'Guacotecti', municipalityId: 'm2-1', isActive: true },
  { id: 'dist2-1-5', name: 'San Isidro', municipalityId: 'm2-1', isActive: true },

  // Cabañas Oeste
  { id: 'dist2-2-1', name: 'Ilobasco', municipalityId: 'm2-2', isActive: true },
  { id: 'dist2-2-2', name: 'Tejutepeque', municipalityId: 'm2-2', isActive: true },
  { id: 'dist2-2-3', name: 'Jutiapa', municipalityId: 'm2-2', isActive: true },
  { id: 'dist2-2-4', name: 'Cinquera', municipalityId: 'm2-2', isActive: true },

  // Chalatenango Norte
  { id: 'dist3-1-1', name: 'La Palma', municipalityId: 'm3-1', isActive: true },
  { id: 'dist3-1-2', name: 'Citalá', municipalityId: 'm3-1', isActive: true },
  { id: 'dist3-1-3', name: 'San Ignacio', municipalityId: 'm3-1', isActive: true },

  // Chalatenango Centro
  { id: 'dist3-2-1', name: 'Nueva Concepción', municipalityId: 'm3-2', isActive: true },
  { id: 'dist3-2-2', name: 'Tejutla', municipalityId: 'm3-2', isActive: true },
  { id: 'dist3-2-3', name: 'La Reina', municipalityId: 'm3-2', isActive: true },
  { id: 'dist3-2-4', name: 'Agua Caliente', municipalityId: 'm3-2', isActive: true },
  { id: 'dist3-2-5', name: 'Dulce Nombre de María', municipalityId: 'm3-2', isActive: true },
  { id: 'dist3-2-6', name: 'El Paraíso', municipalityId: 'm3-2', isActive: true },
  { id: 'dist3-2-7', name: 'San Francisco Morazán', municipalityId: 'm3-2', isActive: true },
  { id: 'dist3-2-8', name: 'San Rafael', municipalityId: 'm3-2', isActive: true },
  { id: 'dist3-2-9', name: 'Santa Rita', municipalityId: 'm3-2', isActive: true },
  { id: 'dist3-2-10', name: 'San Fernando', municipalityId: 'm3-2', isActive: true },

  // Chalatenango Sur
  { id: 'dist3-3-1', name: 'Chalatenango', municipalityId: 'm3-3', isActive: true },
  { id: 'dist3-3-2', name: 'Arcatao', municipalityId: 'm3-3', isActive: true },
  { id: 'dist3-3-3', name: 'Azacualpa', municipalityId: 'm3-3', isActive: true },
  { id: 'dist3-3-4', name: 'Comalapa', municipalityId: 'm3-3', isActive: true },
  { id: 'dist3-3-5', name: 'Concepción Quezaltepeque', municipalityId: 'm3-3', isActive: true },
  { id: 'dist3-3-6', name: 'El Carrizal', municipalityId: 'm3-3', isActive: true },
  { id: 'dist3-3-7', name: 'La Laguna', municipalityId: 'm3-3', isActive: true },
  { id: 'dist3-3-8', name: 'Las Vueltas', municipalityId: 'm3-3', isActive: true },
  { id: 'dist3-3-9', name: 'Nombre de Jesús', municipalityId: 'm3-3', isActive: true },
  { id: 'dist3-3-10', name: 'Nueva Trinidad', municipalityId: 'm3-3', isActive: true },
  { id: 'dist3-3-11', name: 'Ojos de Agua', municipalityId: 'm3-3', isActive: true },
  { id: 'dist3-3-12', name: 'Potonico', municipalityId: 'm3-3', isActive: true },
  { id: 'dist3-3-13', name: 'San Antonio de La Cruz', municipalityId: 'm3-3', isActive: true },
  { id: 'dist3-3-14', name: 'San Antonio Los Ranchos', municipalityId: 'm3-3', isActive: true },
  { id: 'dist3-3-15', name: 'San Francisco Lempa', municipalityId: 'm3-3', isActive: true },
  { id: 'dist3-3-16', name: 'San Isidro Labrador', municipalityId: 'm3-3', isActive: true },
  { id: 'dist3-3-17', name: 'San José Cancasque', municipalityId: 'm3-3', isActive: true },
  { id: 'dist3-3-18', name: 'San Miguel de Mercedes', municipalityId: 'm3-3', isActive: true },
  { id: 'dist3-3-19', name: 'San José Las Flores', municipalityId: 'm3-3', isActive: true },
  { id: 'dist3-3-20', name: 'San Luis del Carmen', municipalityId: 'm3-3', isActive: true },

  // Cuscatlán Norte
  { id: 'dist4-1-1', name: 'Suchitoto', municipalityId: 'm4-1', isActive: true },
  { id: 'dist4-1-2', name: 'San José Guayabal', municipalityId: 'm4-1', isActive: true },
  { id: 'dist4-1-3', name: 'Oratorio de Concepción', municipalityId: 'm4-1', isActive: true },
  { id: 'dist4-1-4', name: 'San Bartolomé Perulapán', municipalityId: 'm4-1', isActive: true },
  { id: 'dist4-1-5', name: 'San Pedro Perulapán', municipalityId: 'm4-1', isActive: true },

  // Cuscatlán Sur
  { id: 'dist4-2-1', name: 'Cojutepeque', municipalityId: 'm4-2', isActive: true },
  { id: 'dist4-2-2', name: 'San Rafael Cedros', municipalityId: 'm4-2', isActive: true },
  { id: 'dist4-2-3', name: 'Candelaria', municipalityId: 'm4-2', isActive: true },
  { id: 'dist4-2-4', name: 'Monte San Juan', municipalityId: 'm4-2', isActive: true },
  { id: 'dist4-2-5', name: 'El Carmen', municipalityId: 'm4-2', isActive: true },
  { id: 'dist4-2-6', name: 'San Cristóbal', municipalityId: 'm4-2', isActive: true },
  { id: 'dist4-2-7', name: 'Santa Cruz Michapa', municipalityId: 'm4-2', isActive: true },
  { id: 'dist4-2-8', name: 'San Ramón', municipalityId: 'm4-2', isActive: true },
  { id: 'dist4-2-9', name: 'El Rosario', municipalityId: 'm4-2', isActive: true },
  { id: 'dist4-2-10', name: 'Santa Cruz Analquito', municipalityId: 'm4-2', isActive: true },
  { id: 'dist4-2-11', name: 'Tenancingo', municipalityId: 'm4-2', isActive: true },

  // La Libertad Norte
  { id: 'dist5-1-1', name: 'Quezaltepeque', municipalityId: 'm5-1', isActive: true },
  { id: 'dist5-1-2', name: 'San Matías', municipalityId: 'm5-1', isActive: true },
  { id: 'dist5-1-3', name: 'San Pablo Tacachico', municipalityId: 'm5-1', isActive: true },

  // La Libertad Centro
  { id: 'dist5-2-1', name: 'San Juan Opico', municipalityId: 'm5-2', isActive: true },
  { id: 'dist5-2-2', name: 'Ciudad Arce', municipalityId: 'm5-2', isActive: true },

  // La Libertad Oeste
  { id: 'dist5-3-1', name: 'Colón', municipalityId: 'm5-3', isActive: true },
  { id: 'dist5-3-2', name: 'Jayaque', municipalityId: 'm5-3', isActive: true },
  { id: 'dist5-3-3', name: 'Sacacoyo', municipalityId: 'm5-3', isActive: true },
  { id: 'dist5-3-4', name: 'Tepecoyo', municipalityId: 'm5-3', isActive: true },
  { id: 'dist5-3-5', name: 'Talnique', municipalityId: 'm5-3', isActive: true },

  // La Libertad Este
  { id: 'dist5-4-1', name: 'Antiguo Cuscatlán', municipalityId: 'm5-4', isActive: true },
  { id: 'dist5-4-2', name: 'Huizúcar', municipalityId: 'm5-4', isActive: true },
  { id: 'dist5-4-3', name: 'Nuevo Cuscatlán', municipalityId: 'm5-4', isActive: true },
  { id: 'dist5-4-4', name: 'San José Villanueva', municipalityId: 'm5-4', isActive: true },
  { id: 'dist5-4-5', name: 'Zaragoza', municipalityId: 'm5-4', isActive: true },

  // La Libertad Costa
  { id: 'dist5-5-1', name: 'Chiltuipán', municipalityId: 'm5-5', isActive: true },
  { id: 'dist5-5-2', name: 'Jicalapa', municipalityId: 'm5-5', isActive: true },
  { id: 'dist5-5-3', name: 'La Libertad', municipalityId: 'm5-5', isActive: true },
  { id: 'dist5-5-4', name: 'Tamanique', municipalityId: 'm5-5', isActive: true },
  { id: 'dist5-5-5', name: 'Teotepeque', municipalityId: 'm5-5', isActive: true },

  // La Libertad Sur
  { id: 'dist5-6-1', name: 'Comasagua', municipalityId: 'm5-6', isActive: true },
  { id: 'dist5-6-2', name: 'Santa Tecla', municipalityId: 'm5-6', isActive: true },

  // La Paz Oeste
  { id: 'dist6-1-1', name: 'Cuyultitán', municipalityId: 'm6-1', isActive: true },
  { id: 'dist6-1-2', name: 'Olocuilta', municipalityId: 'm6-1', isActive: true },
  { id: 'dist6-1-3', name: 'San Juan Talpa', municipalityId: 'm6-1', isActive: true },
  { id: 'dist6-1-4', name: 'San Luis Talpa', municipalityId: 'm6-1', isActive: true },
  { id: 'dist6-1-5', name: 'San Pedro Masahuat', municipalityId: 'm6-1', isActive: true },
  { id: 'dist6-1-6', name: 'Tapalhuaca', municipalityId: 'm6-1', isActive: true },
  { id: 'dist6-1-7', name: 'San Francisco Chinameca', municipalityId: 'm6-1', isActive: true },

  // La Paz Centro
  { id: 'dist6-2-1', name: 'El Rosario', municipalityId: 'm6-2', isActive: true },
  { id: 'dist6-2-2', name: 'Jerusalén', municipalityId: 'm6-2', isActive: true },
  { id: 'dist6-2-3', name: 'Mercedes La Ceiba', municipalityId: 'm6-2', isActive: true },
  { id: 'dist6-2-4', name: 'Paraíso de Osorio', municipalityId: 'm6-2', isActive: true },
  { id: 'dist6-2-5', name: 'San Antonio Masahuat', municipalityId: 'm6-2', isActive: true },
  { id: 'dist6-2-6', name: 'San Emigdio', municipalityId: 'm6-2', isActive: true },
  { id: 'dist6-2-7', name: 'San Juan Tepezontes', municipalityId: 'm6-2', isActive: true },
  { id: 'dist6-2-8', name: 'San Luis La Herradura', municipalityId: 'm6-2', isActive: true },
  { id: 'dist6-2-9', name: 'San Miguel Tepezontes', municipalityId: 'm6-2', isActive: true },
  { id: 'dist6-2-10', name: 'San Pedro Nonualco', municipalityId: 'm6-2', isActive: true },
  { id: 'dist6-2-11', name: 'Santa María Ostuma', municipalityId: 'm6-2', isActive: true },
  { id: 'dist6-2-12', name: 'Santiago Nonualco', municipalityId: 'm6-2', isActive: true },

  // La Paz Este
  { id: 'dist6-3-1', name: 'San Juan Nonualco', municipalityId: 'm6-3', isActive: true },
  { id: 'dist6-3-2', name: 'San Rafael Obrajuelo', municipalityId: 'm6-3', isActive: true },
  { id: 'dist6-3-3', name: 'Zacatecoluca', municipalityId: 'm6-3', isActive: true },

  // La Unión Norte
  { id: 'dist7-1-1', name: 'Anamorós', municipalityId: 'm7-1', isActive: true },
  { id: 'dist7-1-2', name: 'Bolivar', municipalityId: 'm7-1', isActive: true },
  { id: 'dist7-1-3', name: 'Concepción de Oriente', municipalityId: 'm7-1', isActive: true },
  { id: 'dist7-1-4', name: 'El Sauce', municipalityId: 'm7-1', isActive: true },
  { id: 'dist7-1-5', name: 'Lislique', municipalityId: 'm7-1', isActive: true },
  { id: 'dist7-1-6', name: 'Nueva Esparta', municipalityId: 'm7-1', isActive: true },
  { id: 'dist7-1-7', name: 'Pasaquina', municipalityId: 'm7-1', isActive: true },
  { id: 'dist7-1-8', name: 'Polorós', municipalityId: 'm7-1', isActive: true },
  { id: 'dist7-1-9', name: 'San José La Fuente', municipalityId: 'm7-1', isActive: true },
  { id: 'dist7-1-10', name: 'Santa Rosa de Lima', municipalityId: 'm7-1', isActive: true },

  // La Unión Sur
  { id: 'dist7-2-1', name: 'Conchagua', municipalityId: 'm7-2', isActive: true },
  { id: 'dist7-2-2', name: 'El Carmen', municipalityId: 'm7-2', isActive: true },
  { id: 'dist7-2-3', name: 'Intipucá', municipalityId: 'm7-2', isActive: true },
  { id: 'dist7-2-4', name: 'La Unión', municipalityId: 'm7-2', isActive: true },
  { id: 'dist7-2-5', name: 'Meanguera del Golfo', municipalityId: 'm7-2', isActive: true },
  { id: 'dist7-2-6', name: 'San Alejo', municipalityId: 'm7-2', isActive: true },
  { id: 'dist7-2-7', name: 'Yayantique', municipalityId: 'm7-2', isActive: true },
  { id: 'dist7-2-8', name: 'Yucuaiquín', municipalityId: 'm7-2', isActive: true },

  // Morazán Norte
  { id: 'dist8-1-1', name: 'Arambala', municipalityId: 'm8-1', isActive: true },
  { id: 'dist8-1-2', name: 'Cacaopera', municipalityId: 'm8-1', isActive: true },
  { id: 'dist8-1-3', name: 'Corinto', municipalityId: 'm8-1', isActive: true },
  { id: 'dist8-1-4', name: 'El Rosario', municipalityId: 'm8-1', isActive: true },
  { id: 'dist8-1-5', name: 'Joateca', municipalityId: 'm8-1', isActive: true },
  { id: 'dist8-1-6', name: 'Jocoaitique', municipalityId: 'm8-1', isActive: true },
  { id: 'dist8-1-7', name: 'Meanguera', municipalityId: 'm8-1', isActive: true },
  { id: 'dist8-1-8', name: 'Perquín', municipalityId: 'm8-1', isActive: true },
  { id: 'dist8-1-9', name: 'San Fernando', municipalityId: 'm8-1', isActive: true },
  { id: 'dist8-1-10', name: 'San Isidro', municipalityId: 'm8-1', isActive: true },
  { id: 'dist8-1-11', name: 'Torola', municipalityId: 'm8-1', isActive: true },

  // Morazán Sur
  { id: 'dist8-2-1', name: 'Chilanga', municipalityId: 'm8-2', isActive: true },
  { id: 'dist8-2-2', name: 'Delicias de Concepción', municipalityId: 'm8-2', isActive: true },
  { id: 'dist8-2-3', name: 'El Divisadero', municipalityId: 'm8-2', isActive: true },
  { id: 'dist8-2-4', name: 'Gualococti', municipalityId: 'm8-2', isActive: true },
  { id: 'dist8-2-5', name: 'Guatajiagua', municipalityId: 'm8-2', isActive: true },
  { id: 'dist8-2-6', name: 'Jocoro', municipalityId: 'm8-2', isActive: true },
  { id: 'dist8-2-7', name: 'Lolotiquillo', municipalityId: 'm8-2', isActive: true },
  { id: 'dist8-2-8', name: 'Osicala', municipalityId: 'm8-2', isActive: true },
  { id: 'dist8-2-9', name: 'San Carlos', municipalityId: 'm8-2', isActive: true },
  { id: 'dist8-2-10', name: 'San Francisco Gotera', municipalityId: 'm8-2', isActive: true },
  { id: 'dist8-2-11', name: 'San Simón', municipalityId: 'm8-2', isActive: true },
  { id: 'dist8-2-12', name: 'Sensembra', municipalityId: 'm8-2', isActive: true },
  { id: 'dist8-2-13', name: 'Sociedad', municipalityId: 'm8-2', isActive: true },
  { id: 'dist8-2-14', name: 'Yamabal', municipalityId: 'm8-2', isActive: true },
  { id: 'dist8-2-15', name: 'Yoloaiquín', municipalityId: 'm8-2', isActive: true },

  // San Miguel Norte
  { id: 'dist9-1-1', name: 'Ciudad Barrios', municipalityId: 'm9-1', isActive: true },
  { id: 'dist9-1-2', name: 'Sesori', municipalityId: 'm9-1', isActive: true },
  { id: 'dist9-1-3', name: 'Nuevo Edén de San Juan', municipalityId: 'm9-1', isActive: true },
  { id: 'dist9-1-4', name: 'San Gerardo', municipalityId: 'm9-1', isActive: true },
  { id: 'dist9-1-5', name: 'San Luis de La Reina', municipalityId: 'm9-1', isActive: true },
  { id: 'dist9-1-6', name: 'Carolina', municipalityId: 'm9-1', isActive: true },
  { id: 'dist9-1-7', name: 'San Antonio del Mosco', municipalityId: 'm9-1', isActive: true },
  { id: 'dist9-1-8', name: 'Chapeltique', municipalityId: 'm9-1', isActive: true },

  // San Miguel Centro
  { id: 'dist9-2-1', name: 'San Miguel', municipalityId: 'm9-2', isActive: true },
  { id: 'dist9-2-2', name: 'Comacarán', municipalityId: 'm9-2', isActive: true },
  { id: 'dist9-2-3', name: 'Uluazapa', municipalityId: 'm9-2', isActive: true },
  { id: 'dist9-2-4', name: 'Moncagua', municipalityId: 'm9-2', isActive: true },
  { id: 'dist9-2-5', name: 'Quelepa', municipalityId: 'm9-2', isActive: true },
  { id: 'dist9-2-6', name: 'Chirilagua', municipalityId: 'm9-2', isActive: true },

  // San Miguel Oeste
  { id: 'dist9-3-1', name: 'Chinameca', municipalityId: 'm9-3', isActive: true },
  { id: 'dist9-3-2', name: 'Nueva Guadalupe', municipalityId: 'm9-3', isActive: true },
  { id: 'dist9-3-3', name: 'Lolotique', municipalityId: 'm9-3', isActive: true },
  { id: 'dist9-3-4', name: 'San Jorge', municipalityId: 'm9-3', isActive: true },
  { id: 'dist9-3-5', name: 'San Rafael Oriente', municipalityId: 'm9-3', isActive: true },
  { id: 'dist9-3-6', name: 'El Tránsito', municipalityId: 'm9-3', isActive: true },

  // San Salvador Norte
  { id: 'dist10-1-1', name: 'Aguilares', municipalityId: 'm10-1', isActive: true },
  { id: 'dist10-1-2', name: 'El Paisnal', municipalityId: 'm10-1', isActive: true },
  { id: 'dist10-1-3', name: 'Guazapa', municipalityId: 'm10-1', isActive: true },

  // San Salvador Oeste
  { id: 'dist10-2-1', name: 'Apopa', municipalityId: 'm10-2', isActive: true },
  { id: 'dist10-2-2', name: 'Nejapa', municipalityId: 'm10-2', isActive: true },

  // San Salvador Este
  { id: 'dist10-3-1', name: 'Ilopango', municipalityId: 'm10-3', isActive: true },
  { id: 'dist10-3-2', name: 'San Martín', municipalityId: 'm10-3', isActive: true },
  { id: 'dist10-3-3', name: 'Soyapango', municipalityId: 'm10-3', isActive: true },
  { id: 'dist10-3-4', name: 'Tonacatepeque', municipalityId: 'm10-3', isActive: true },

  // San Salvador Centro
  { id: 'dist10-4-1', name: 'Ayutuxtepeque', municipalityId: 'm10-4', isActive: true },
  { id: 'dist10-4-2', name: 'Mejicanos', municipalityId: 'm10-4', isActive: true },
  { id: 'dist10-4-3', name: 'San Salvador', municipalityId: 'm10-4', isActive: true },
  { id: 'dist10-4-4', name: 'Cuscatancingo', municipalityId: 'm10-4', isActive: true },
  { id: 'dist10-4-5', name: 'Ciudad Delgado', municipalityId: 'm10-4', isActive: true },

  // San Salvador Sur
  { id: 'dist10-5-1', name: 'Panchimalco', municipalityId: 'm10-5', isActive: true },
  { id: 'dist10-5-2', name: 'Rosario de Mora', municipalityId: 'm10-5', isActive: true },
  { id: 'dist10-5-3', name: 'San Marcos', municipalityId: 'm10-5', isActive: true },
  { id: 'dist10-5-4', name: 'Santo Tomás', municipalityId: 'm10-5', isActive: true },
  { id: 'dist10-5-5', name: 'Santiago Texacuangos', municipalityId: 'm10-5', isActive: true },

  // San Vicente Norte
  { id: 'dist11-1-1', name: 'Apastepeque', municipalityId: 'm11-1', isActive: true },
  { id: 'dist11-1-2', name: 'Santa Clara', municipalityId: 'm11-1', isActive: true },
  { id: 'dist11-1-3', name: 'San Ildefonso', municipalityId: 'm11-1', isActive: true },
  { id: 'dist11-1-4', name: 'San Esteban Catarina', municipalityId: 'm11-1', isActive: true },
  { id: 'dist11-1-5', name: 'San Sebastián', municipalityId: 'm11-1', isActive: true },
  { id: 'dist11-1-6', name: 'San Lorenzo', municipalityId: 'm11-1', isActive: true },
  { id: 'dist11-1-7', name: 'Santo Domingo', municipalityId: 'm11-1', isActive: true },

  // San Vicente Sur
  { id: 'dist11-2-1', name: 'San Vicente', municipalityId: 'm11-2', isActive: true },
  { id: 'dist11-2-2', name: 'Guadalupe', municipalityId: 'm11-2', isActive: true },
  { id: 'dist11-2-3', name: 'Verapaz', municipalityId: 'm11-2', isActive: true },
  { id: 'dist11-2-4', name: 'Tepetitán', municipalityId: 'm11-2', isActive: true },
  { id: 'dist11-2-5', name: 'Tecoluca', municipalityId: 'm11-2', isActive: true },
  { id: 'dist11-2-6', name: 'San Cayetano Istepeque', municipalityId: 'm11-2', isActive: true },

  // Santa Ana Norte
  { id: 'dist12-1-1', name: 'Masahuat', municipalityId: 'm12-1', isActive: true },
  { id: 'dist12-1-2', name: 'Metapán', municipalityId: 'm12-1', isActive: true },
  { id: 'dist12-1-3', name: 'Santa Rosa Guachipilín', municipalityId: 'm12-1', isActive: true },
  { id: 'dist12-1-4', name: 'Texistepeque', municipalityId: 'm12-1', isActive: true },

  // Santa Ana Centro
  { id: 'dist12-2-1', name: 'Santa Ana', municipalityId: 'm12-2', isActive: true },

  // Santa Ana Este
  { id: 'dist12-3-1', name: 'Coatepeque', municipalityId: 'm12-3', isActive: true },
  { id: 'dist12-3-2', name: 'El Congo', municipalityId: 'm12-3', isActive: true },

  // Santa Ana Oeste
  { id: 'dist12-4-1', name: 'Candelaria de la Frontera', municipalityId: 'm12-4', isActive: true },
  { id: 'dist12-4-2', name: 'Chalchuapa', municipalityId: 'm12-4', isActive: true },
  { id: 'dist12-4-3', name: 'El Porvenir', municipalityId: 'm12-4', isActive: true },
  { id: 'dist12-4-4', name: 'San Antonio Pajonal', municipalityId: 'm12-4', isActive: true },
  { id: 'dist12-4-5', name: 'San Sebastián Salitrillo', municipalityId: 'm12-4', isActive: true },
  { id: 'dist12-4-6', name: 'Santiago de La Frontera', municipalityId: 'm12-4', isActive: true },

  // Sonsonate Norte
  { id: 'dist13-1-1', name: 'Juayúa', municipalityId: 'm13-1', isActive: true },
  { id: 'dist13-1-2', name: 'Nahuizalco', municipalityId: 'm13-1', isActive: true },
  { id: 'dist13-1-3', name: 'Salcoatitán', municipalityId: 'm13-1', isActive: true },
  { id: 'dist13-1-4', name: 'Santa Catarina Masahuat', municipalityId: 'm13-1', isActive: true },

  // Sonsonate Centro
  { id: 'dist13-2-1', name: 'Sonsonate', municipalityId: 'm13-2', isActive: true },
  { id: 'dist13-2-2', name: 'Sonzacate', municipalityId: 'm13-2', isActive: true },
  { id: 'dist13-2-3', name: 'Nahulingo', municipalityId: 'm13-2', isActive: true },
  { id: 'dist13-2-4', name: 'San Antonio del Monte', municipalityId: 'm13-2', isActive: true },
  { id: 'dist13-2-5', name: 'Santo Domingo de Guzmán', municipalityId: 'm13-2', isActive: true },

  // Sonsonate Este
  { id: 'dist13-3-1', name: 'Izalco', municipalityId: 'm13-3', isActive: true },
  { id: 'dist13-3-2', name: 'Armenia', municipalityId: 'm13-3', isActive: true },
  { id: 'dist13-3-3', name: 'Caluco', municipalityId: 'm13-3', isActive: true },
  { id: 'dist13-3-4', name: 'San Julián', municipalityId: 'm13-3', isActive: true },
  { id: 'dist13-3-5', name: 'Cuisnahuat', municipalityId: 'm13-3', isActive: true },
  { id: 'dist13-3-6', name: 'Santa Isabel Ishuatán', municipalityId: 'm13-3', isActive: true },

  // Sonsonate Oeste
  { id: 'dist13-4-1', name: 'Acajutla', municipalityId: 'm13-4', isActive: true },

  // Usulután Norte
  { id: 'dist14-1-1', name: 'Santiago de María', municipalityId: 'm14-1', isActive: true },
  { id: 'dist14-1-2', name: 'Alegría', municipalityId: 'm14-1', isActive: true },
  { id: 'dist14-1-3', name: 'Berlín', municipalityId: 'm14-1', isActive: true },
  { id: 'dist14-1-4', name: 'Mercedes Umaña', municipalityId: 'm14-1', isActive: true },
  { id: 'dist14-1-5', name: 'Jucuapa', municipalityId: 'm14-1', isActive: true },
  { id: 'dist14-1-6', name: 'El Triunfo', municipalityId: 'm14-1', isActive: true },
  { id: 'dist14-1-7', name: 'Estanzuelas', municipalityId: 'm14-1', isActive: true },
  { id: 'dist14-1-8', name: 'San Buenaventura', municipalityId: 'm14-1', isActive: true },
  { id: 'dist14-1-9', name: 'Nueva Granada', municipalityId: 'm14-1', isActive: true },

  // Usulután Este
  { id: 'dist14-2-1', name: 'Usulután', municipalityId: 'm14-2', isActive: true },
  { id: 'dist14-2-2', name: 'Jucuarán', municipalityId: 'm14-2', isActive: true },
  { id: 'dist14-2-3', name: 'San Dionisio', municipalityId: 'm14-2', isActive: true },
  { id: 'dist14-2-4', name: 'Concepción Batres', municipalityId: 'm14-2', isActive: true },
  { id: 'dist14-2-5', name: 'Santa María', municipalityId: 'm14-2', isActive: true },
  { id: 'dist14-2-6', name: 'Ozatlán', municipalityId: 'm14-2', isActive: true },
  { id: 'dist14-2-7', name: 'Tecapán', municipalityId: 'm14-2', isActive: true },
  { id: 'dist14-2-8', name: 'Santa Elena', municipalityId: 'm14-2', isActive: true },
  { id: 'dist14-2-9', name: 'California', municipalityId: 'm14-2', isActive: true },
  { id: 'dist14-2-10', name: 'Ereguayquín', municipalityId: 'm14-2', isActive: true },

  // Usulután Oeste
  { id: 'dist14-3-1', name: 'Jiquilisco', municipalityId: 'm14-3', isActive: true },
  { id: 'dist14-3-2', name: 'Puerto El Triunfo', municipalityId: 'm14-3', isActive: true },
  { id: 'dist14-3-3', name: 'San Agustín', municipalityId: 'm14-3', isActive: true },
  { id: 'dist14-3-4', name: 'San Francisco Javier', municipalityId: 'm14-3', isActive: true }
];