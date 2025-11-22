import { getFinancialMetrics } from './helpers/financial-metrics.service';
import { getSalesMetrics } from './helpers/sales-metrics.service';
import { getProjectMetrics } from './helpers/project-metrics.service';
import { getPriorityActions } from './helpers/priority-actions.service';
import { DashboardMetrics } from '../types/dashboard.types';
import { logger } from '@/lib/logger';

export const DashboardService = {
    async getDashboardMetrics(): Promise<DashboardMetrics> {
        try {
            const [financial, sales, projects, priorityActions] = await Promise.all([
                getFinancialMetrics(),
                getSalesMetrics(),
                getProjectMetrics(),
                getPriorityActions()
            ]);

            return {
                financial,
                sales,
                projects,
                priorityActions
            };
        } catch (error) {
            logger.error('Error fetching dashboard metrics', error as Error);
            throw new Error('Failed to fetch dashboard metrics');
        }
    }
};
