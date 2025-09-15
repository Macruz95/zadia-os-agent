import { Client, Transaction, Project, Quote, Task } from '../types/clients.types';

/**
 * Event and KPI utilities for client module
 */

/**
 * Calculate client KPIs from related data
 * @param transactions - Client transactions
 * @param projects - Client projects
 * @param quotes - Client quotes
 * @param tasks - Client tasks
 * @returns KPI object with calculated metrics
 */
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

/**
 * Get upcoming birthdays within next week
 * @param clients - Array of clients
 * @returns Array of clients with upcoming birthdays
 */
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

/**
 * Get upcoming due dates within next week
 * @param transactions - Array of transactions
 * @returns Array of transactions with upcoming due dates
 */
export const getUpcomingDueDates = (transactions: Transaction[]): Transaction[] => {
  const today = new Date();
  const nextWeek = new Date(today);
  nextWeek.setDate(today.getDate() + 7);

  return transactions.filter(transaction => {
    if (!transaction.dueDate) return false;
    return transaction.dueDate >= today && transaction.dueDate <= nextWeek && transaction.status === 'Pendiente';
  });
};

/**
 * Get upcoming tasks within next week
 * @param tasks - Array of tasks
 * @returns Array of tasks with upcoming due dates
 */
export const getUpcomingTasks = (tasks: Task[]): Task[] => {
  const today = new Date();
  const nextWeek = new Date(today);
  nextWeek.setDate(today.getDate() + 7);

  return tasks.filter(task => {
    if (!task.dueDate) return false;
    return task.dueDate >= today && task.dueDate <= nextWeek && task.status !== 'Completada';
  });
};