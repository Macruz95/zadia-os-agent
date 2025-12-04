import { getFinancialMetrics } from './helpers/financial-metrics.service';
import { getSalesMetrics } from './helpers/sales-metrics.service';
import { getProjectMetrics } from './helpers/project-metrics.service';
import { getPriorityActions } from './helpers/priority-actions.service';
import { DashboardMetrics } from '../types/dashboard.types';
import { logger } from '@/lib/logger';

const EMPTY_METRICS: DashboardMetrics = {
    financial: {
        monthlyRevenue: 0,
        monthlyExpenses: 0,
        netProfit: 0,
        revenueGrowth: 0,
        expenseGrowth: 0
    },
    sales: {
        totalLeads: 0,
        totalOpportunities: 0,
        conversionRate: 0,
        pipelineValue: 0,
        leadsGrowth: 0,
        opportunitiesGrowth: 0
    },
    projects: {
        activeProjects: 0,
        completedTasks: 0,
        pendingTasks: 0,
        projectProgress: 0
    },
    priorityActions: []
};

export const DashboardService = {
    async getDashboardMetrics(tenantId?: string | null): Promise<DashboardMetrics> {
        // If no tenantId, return empty metrics (new user without tenant)
        if (!tenantId) {
            logger.info('No tenantId provided - returning empty dashboard metrics');
            return EMPTY_METRICS;
        }

        try {
            const [financial, sales, projects, priorityActions] = await Promise.all([
                getFinancialMetrics(tenantId),
                getSalesMetrics(tenantId),
                getProjectMetrics(tenantId),
                getPriorityActions(tenantId)
            ]);

            return {
                financial,
                sales,
                projects,
                priorityActions
            };
        } catch (error) {
            logger.error('Error fetching dashboard metrics', error as Error);
            // Return empty metrics instead of throwing to prevent dashboard crash
            return EMPTY_METRICS;
        }
    }
};
