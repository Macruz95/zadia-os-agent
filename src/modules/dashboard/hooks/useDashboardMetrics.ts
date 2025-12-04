import { useState, useEffect } from 'react';
import { DashboardMetrics } from '../types/dashboard.types';
import { logger } from '@/lib/logger';
import { DashboardService } from '../services/dashboard.service';
import { useTenantId, useTenant } from '@/contexts/TenantContext';

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

export function useDashboardMetrics() {
    const tenantId = useTenantId();
    const { loading: tenantLoading } = useTenant();
    const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Wait for tenant context to finish loading
        if (tenantLoading) {
            return;
        }

        const loadMetrics = async () => {
            try {
                setLoading(true);
                const data = await DashboardService.getDashboardMetrics(tenantId);
                setMetrics(data);
            } catch (err) {
                logger.error('Error loading dashboard metrics', err as Error);
                setError('Error al cargar métricas del dashboard');
                setMetrics(EMPTY_METRICS);
            } finally {
                setLoading(false);
            }
        };

        loadMetrics();
    }, [tenantId, tenantLoading]);

    return { metrics, loading, error };
}
