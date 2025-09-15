import { Client, Transaction, Project, Quote, Task } from '../types/clients.types';

// Age calculation
export const calculateAge = (birthDate: Date): number => {
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age;
};

// Date formatting
export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
};

export const formatDateTime = (date: Date): string => {
  return new Intl.DateTimeFormat('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

// Currency formatting
export const formatCurrency = (amount: number, currency = 'USD'): string => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency,
  }).format(amount);
};

// Phone formatting
export const formatPhone = (phone: string): string => {
  // Simple formatting for phone numbers
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 8) {
    return `${cleaned.slice(0, 4)}-${cleaned.slice(4)}`;
  }
  return phone;
};

// Document ID formatting
export const formatDocumentId = (documentId: string): string => {
  if (documentId.length === 9) {
    return `${documentId.slice(0, 8)}-${documentId.slice(8)}`;
  }
  return documentId;
};

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

// KPI calculations
export const calculateClientKPIs = (transactions: Transaction[], projects: Project[], quotes: Quote[], tasks: Task[]) => {
  const totalInvoiced = transactions
    .filter(t => t.type === 'Factura')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalPaid = transactions
    .filter(t => t.type === 'Pago')
    .reduce((sum, t) => sum + t.amount, 0);

  const balanceDue = totalInvoiced - totalPaid;

  const activeProjects = projects.filter(p => p.status === 'EnProgreso').length;

  const openQuotes = quotes.filter(q => q.status === 'Enviada' || q.status === 'Borrador').length;

  const pendingTasks = tasks.filter(t => t.status === 'Pendiente' || t.status === 'EnProgreso').length;

  return {
    totalInvoiced,
    totalPaid,
    balanceDue,
    activeProjects,
    openQuotes,
    pendingTasks,
  };
};

// Upcoming events
export const getUpcomingBirthdays = (clients: Client[]): Client[] => {
  const today = new Date();
  const nextWeek = new Date(today);
  nextWeek.setDate(today.getDate() + 7);

  return clients.filter(client => {
    if (!client.birthDate) return false;

    const birthdayThisYear = new Date(today.getFullYear(), client.birthDate.getMonth(), client.birthDate.getDate());
    if (birthdayThisYear < today) {
      birthdayThisYear.setFullYear(today.getFullYear() + 1);
    }

    return birthdayThisYear >= today && birthdayThisYear <= nextWeek;
  });
};

export const getUpcomingDueDates = (transactions: Transaction[]): Transaction[] => {
  const today = new Date();
  const nextWeek = new Date(today);
  nextWeek.setDate(today.getDate() + 7);

  return transactions.filter(transaction => {
    if (!transaction.dueDate) return false;
    return transaction.dueDate >= today && transaction.dueDate <= nextWeek && transaction.status === 'Pendiente';
  });
};

export const getUpcomingTasks = (tasks: Task[]): Task[] => {
  const today = new Date();
  const nextWeek = new Date(today);
  nextWeek.setDate(today.getDate() + 7);

  return tasks.filter(task => {
    if (!task.dueDate) return false;
    return task.dueDate >= today && task.dueDate <= nextWeek && task.status !== 'Completada';
  });
};

// Status color utilities
export const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    Potencial: 'bg-yellow-100 text-yellow-800',
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

// Client type display
export const getClientTypeDisplay = (type: string): string => {
  const displays: Record<string, string> = {
    PersonaNatural: 'Persona Natural',
    Organización: 'Organización',
    Empresa: 'Empresa',
  };

  return displays[type] || type;
};

// Validation helpers
export const isValidDUI = (dui: string): boolean => {
  const cleaned = dui.replace(/\D/g, '');
  return cleaned.length === 9;
};

export const isValidPhone = (phone: string): boolean => {
  const cleaned = phone.replace(/\D/g, '');
  return cleaned.length >= 8;
};