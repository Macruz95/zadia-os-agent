/**
 * Display and status utilities for client module
 */

/**
 * Get status color class for UI components
 * @param status - Status string
 * @returns Tailwind CSS classes for status styling
 */
export const getStatusColor = (status: string): string => {
  if (!status || typeof status !== 'string') {
    return 'bg-gray-100 text-gray-800';
  }

  const colors: Record<string, string> = {
    Prospecto: 'bg-yellow-100 text-yellow-800',
    Activo: 'bg-green-100 text-green-800',
    Inactivo: 'bg-gray-100 text-gray-800',
    Pendiente: 'bg-orange-100 text-orange-800',
    Pagada: 'bg-blue-100 text-blue-800',
    Vencida: 'bg-red-100 text-red-800',
    Planificación: 'bg-purple-100 text-purple-800',
    EnProgreso: 'bg-blue-100 text-blue-800',
    Completado: 'bg-green-100 text-green-800',
    Cancelado: 'bg-red-100 text-red-800',
    Borrador: 'bg-gray-100 text-gray-800',
    Enviada: 'bg-yellow-100 text-yellow-800',
    Aceptada: 'bg-green-100 text-green-800',
    Rechazada: 'bg-red-100 text-red-800',
    Programada: 'bg-blue-100 text-blue-800',
    Realizada: 'bg-green-100 text-green-800',
    Baja: 'bg-green-100 text-green-800',
    Media: 'bg-yellow-100 text-yellow-800',
    Alta: 'bg-orange-100 text-orange-800',
    Urgente: 'bg-red-100 text-red-800',
  };

  return colors[status] || 'bg-gray-100 text-gray-800';
};

/**
 * Get client type display name
 * @param type - Client type string
 * @returns Display name for client type
 */
export const getClientTypeDisplay = (type: string): string => {
  if (!type || typeof type !== 'string') {
    return type || '';
  }

  const displays: Record<string, string> = {
    PersonaNatural: 'Persona Natural',
    Organización: 'Organización',
    Empresa: 'Empresa',
  };

  return displays[type] || type;
};