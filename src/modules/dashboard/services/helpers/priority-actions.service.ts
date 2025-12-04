import { PriorityAction } from '../../types/dashboard.types';
import { InvoicesService } from '@/modules/finance/services/invoices.service';
import { OpportunitiesService } from '@/modules/sales/services/opportunities.service';
import { ProjectsService } from '@/modules/projects/services/projects.service';
import { logger } from '@/lib/logger';

export async function getPriorityActions(tenantId: string): Promise<PriorityAction[]> {
    try {
        if (!tenantId) {
            return [];
        }

        const actions: PriorityAction[] = [];
        const now = new Date();

        // 1. Overdue Invoices
        const overdueInvoices = await InvoicesService.searchInvoices({
            tenantId,
            overdue: true
        });

        overdueInvoices.forEach(inv => {
            actions.push({
                id: `inv-${inv.id}`,
                type: 'finance',
                title: 'Factura Vencida',
                description: `Cliente "${inv.clientName}" tiene una factura vencida por $${inv.total}`,
                priority: 'critical',
                actionLabel: 'Ver Factura',
                actionUrl: `/finance/invoices/${inv.id}`,
                dueDate: inv.dueDate.toDate(),
            });
        });

        // 2. Stalled Opportunities (No update in 7 days)
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const allOpportunities = await OpportunitiesService.getOpportunities(tenantId);
        const stalledOpportunities = allOpportunities.filter(opp =>
            opp.status === 'open' && opp.updatedAt.toDate() < sevenDaysAgo
        );

        stalledOpportunities.forEach(opp => {
            actions.push({
                id: `opp-${opp.id}`,
                type: 'sales',
                title: 'Oportunidad Estancada',
                description: `La oportunidad "${opp.name}" no ha tenido actividad en 7 días`,
                priority: 'high',
                actionLabel: 'Contactar Cliente',
                actionUrl: `/sales/opportunities/${opp.id}`,
            });
        });

        // 3. At Risk Projects
        const allProjectsResult = await ProjectsService.searchProjects({ tenantId }, 100);
        const atRiskProjects = allProjectsResult.projects.filter(p => {
            const isOverBudget = p.actualCost > p.estimatedCost;
            const isOverdue = p.estimatedEndDate && p.estimatedEndDate.toDate() < now && p.status !== 'completed' && p.status !== 'cancelled';
            return isOverBudget || isOverdue;
        });

        atRiskProjects.forEach(p => {
            actions.push({
                id: `proj-${p.id}`,
                type: 'project',
                title: 'Proyecto en Riesgo',
                description: `Proyecto "${p.name}" ${p.actualCost > p.estimatedCost ? 'excede el presupuesto' : 'está retrasado'}`,
                priority: 'high',
                actionLabel: 'Revisar Proyecto',
                actionUrl: `/projects/${p.id}`,
            });
        });

        // Sort by priority
        const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
        return actions.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]).slice(0, 5);

    } catch (error) {
        logger.error('Error calculating priority actions', error as Error);
        return [];
    }
}
