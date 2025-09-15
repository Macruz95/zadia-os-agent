import { Client } from '../types/clients.types';

// Re-export utilities from separate files for backward compatibility
export { calculateAge } from './age.utils';
export { formatDate, formatDateTime } from './date.utils';
export { formatCurrency } from './currency.utils';
export { formatPhone } from './phone.utils';
export { formatDocumentId, isValidDUI } from './document.utils';
export { isValidPhone } from './validation.utils';
export { getStatusColor, getClientTypeDisplay } from './display.utils';
export { calculateClientKPIs, getUpcomingBirthdays, getUpcomingDueDates, getUpcomingTasks } from './events.utils';

// Search and filter utilities
export const searchInClient = (client: Client, query: string): boolean => {
  const searchTerm = query.toLowerCase();
  return (
    client.name.toLowerCase().includes(searchTerm) ||
    client.documentId.toLowerCase().includes(searchTerm) ||
    client.address.city.toLowerCase().includes(searchTerm) ||
    client.tags.some((tag: string) => tag.toLowerCase().includes(searchTerm))
  );
};