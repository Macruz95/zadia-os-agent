import { Interaction, Transaction, Project, Quote, Meeting, Task } from '../types/clients.types';

export type TimelineItemType = 'interaction' | 'transaction' | 'project' | 'quote' | 'meeting' | 'task';

export type TimelineItemUnion = 
  | (Interaction & { type: 'interaction' })
  | (Transaction & { type: 'transaction' })
  | (Project & { type: 'project' })
  | (Quote & { type: 'quote' })
  | (Meeting & { type: 'meeting' })
  | (Task & { type: 'task' });

export interface TimelineItem {
  id: string;
  type: TimelineItemType;
  createdAt: Date;
  date?: Date;
  startDate?: Date;
  dueDate?: Date;
}

/**
 * Combina todos los items del timeline en un solo array
 */
export const combineTimelineItems = (
  interactions: Interaction[],
  transactions: Transaction[],
  projects: Project[],
  quotes: Quote[],
  meetings: Meeting[],
  tasks: Task[]
): TimelineItem[] => {
  return [
    ...interactions.map(i => ({ ...i, type: 'interaction' as const })),
    ...transactions.map(t => ({ ...t, type: 'transaction' as const })),
    ...projects.map(p => ({ ...p, type: 'project' as const })),
    ...quotes.map(q => ({ ...q, type: 'quote' as const })),
    ...meetings.map(m => ({ ...m, type: 'meeting' as const })),
    ...tasks.map(t => ({ ...t, type: 'task' as const })),
  ];
};

/**
 * Obtiene la fecha apropiada para ordenar un item del timeline
 */
export const getTimelineSortDate = (item: TimelineItem): Date => {
  return item.createdAt || item.date || item.startDate || item.dueDate || new Date(0);
};

/**
 * Ordena los items del timeline por fecha (más reciente primero)
 */
export const sortTimelineItems = (items: TimelineItem[]): TimelineItem[] => {
  return items.sort((a, b) => {
    const dateA = getTimelineSortDate(a);
    const dateB = getTimelineSortDate(b);
    return new Date(dateB).getTime() - new Date(dateA).getTime();
  });
};

/**
 * Filtra items del timeline por tipo
 */
export const filterTimelineByType = (
  items: TimelineItem[],
  type: TimelineItemType
): TimelineItem[] => {
  return items.filter(item => item.type === type);
};

/**
 * Limita el número de items del timeline
 */
export const limitTimelineItems = (items: TimelineItem[], limit: number): TimelineItem[] => {
  return items.slice(0, limit);
};

/**
 * Procesa y prepara los items del timeline para mostrar
 */
export const processTimelineItems = (
  interactions: Interaction[],
  transactions: Transaction[],
  projects: Project[],
  quotes: Quote[],
  meetings: Meeting[],
  tasks: Task[],
  limit?: number
): TimelineItem[] => {
  const combined = combineTimelineItems(interactions, transactions, projects, quotes, meetings, tasks);
  const sorted = sortTimelineItems(combined);

  if (limit) {
    return limitTimelineItems(sorted, limit);
  }

  return sorted;
};