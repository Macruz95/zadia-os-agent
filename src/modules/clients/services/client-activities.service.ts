import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { logger } from '@/lib/logger';
import { ProjectsService } from '@/modules/projects/services/projects.service';
import { QuotesService } from '@/modules/sales/services/quotes.service';
import { InvoicesService } from '@/modules/finance/services/invoices.service';
import {
    Task,
    Meeting,
    Transaction,
    Project as ClientProject,
    Quote as ClientQuote,
    ProjectStatus as ClientProjectStatus,
    QuoteStatus as ClientQuoteStatus
} from '../types/clients.types';
import { ProjectStatus as ModuleProjectStatus } from '@/modules/projects/types/projects.types';
import { QuoteStatus as ModuleQuoteStatus } from '@/modules/sales/types/sales.types';

// Helper mappings
const mapProjectStatus = (status: ModuleProjectStatus): ClientProjectStatus => {
    switch (status) {
        case 'planning': return 'Planificación';
        case 'in-progress': return 'EnProgreso';
        case 'completed': return 'Completado';
        case 'cancelled': return 'Cancelado';
        default: return 'Planificación';
    }
};

const mapQuoteStatus = (status: ModuleQuoteStatus): ClientQuoteStatus => {
    switch (status) {
        case 'draft': return 'Borrador';
        case 'sent': return 'Enviada';
        case 'accepted': return 'Aceptada';
        case 'rejected': return 'Rechazada';
        default: return 'Borrador';
    }
};

export const ClientActivitiesService = {
    async getClientProjects(clientId: string): Promise<ClientProject[]> {
        try {
            const result = await ProjectsService.searchProjects({ clientId }, 100);
            return result.projects.map(p => ({
                id: p.id,
                clientId: p.clientId,
                name: p.name,
                status: mapProjectStatus(p.status),
                progress: p.progressPercent || 0,
                startDate: p.startDate?.toDate ? p.startDate.toDate() : (p.createdAt?.toDate ? p.createdAt.toDate() : new Date()),
                endDate: p.estimatedEndDate?.toDate ? p.estimatedEndDate.toDate() : undefined,
                createdAt: p.createdAt?.toDate ? p.createdAt.toDate() : new Date(),
            }));
        } catch (error) {
            logger.error('Error fetching client projects', error as Error, { metadata: { clientId } });
            return [];
        }
    },

    async getClientQuotes(clientId: string): Promise<ClientQuote[]> {
        try {
            const quotes = await QuotesService.getQuotesByClient(clientId);
            return quotes.map(q => ({
                id: q.id,
                clientId: q.clientId,
                number: q.number,
                date: q.createdAt?.toDate ? q.createdAt.toDate() : new Date(),
                estimatedAmount: q.total,
                status: mapQuoteStatus(q.status),
                createdAt: q.createdAt?.toDate ? q.createdAt.toDate() : new Date(),
            }));
        } catch (error) {
            logger.error('Error fetching client quotes', error as Error, { metadata: { clientId } });
            return [];
        }
    },

    async getClientTransactions(clientId: string): Promise<Transaction[]> {
        try {
            const invoices = await InvoicesService.searchInvoices({ clientId });

            return invoices.map(inv => {
                let status: 'Pendiente' | 'Pagada' | 'Vencida' = 'Pendiente';
                if (inv.status === 'paid') status = 'Pagada';
                else if (inv.status === 'overdue') status = 'Vencida';

                return {
                    id: inv.id,
                    clientId: inv.clientId,
                    type: 'Factura',
                    amount: inv.total,
                    status: status,
                    dueDate: inv.dueDate?.toDate ? inv.dueDate.toDate() : undefined,
                    createdAt: inv.issueDate?.toDate ? inv.issueDate.toDate() : new Date(),
                } as Transaction;
            });
        } catch (error) {
            logger.error('Error fetching client transactions', error as Error, { metadata: { clientId } });
            return [];
        }
    },

    async getClientTasks(clientId: string): Promise<Task[]> {
        try {
            const q = query(
                collection(db, 'tasks'),
                where('clientId', '==', clientId),
                orderBy('createdAt', 'desc')
            );
            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
                    dueDate: data.dueDate?.toDate ? data.dueDate.toDate() : undefined,
                } as Task;
            });
        } catch (error) {
            // Silent fail for tasks as the collection might not exist or be used differently
            logger.warn('Error fetching client tasks', { metadata: { error } });
            return [];
        }
    },

    async getClientMeetings(clientId: string): Promise<Meeting[]> {
        try {
            // Fetch interactions of type 'Reunión'
            const q = query(
                collection(db, 'interactions'),
                where('clientId', '==', clientId),
                where('type', '==', 'Reunión'),
                orderBy('date', 'desc')
            );
            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    clientId: data.clientId,
                    date: data.date?.toDate ? data.date.toDate() : new Date(),
                    attendees: [], // Placeholder
                    duration: 60, // Placeholder
                    status: 'Programada', // Placeholder
                    notes: data.notes,
                    createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
                } as Meeting;
            });
        } catch (error) {
            logger.error('Error fetching client meetings', error as Error);
            return [];
        }
    }
};
