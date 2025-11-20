/**
 * ZADIA OS - Dashboard Types
 * 
 * Tipos de datos para el Dashboard Ejecutivo
 */

export interface DashboardMetrics {
    financial: {
        monthlyRevenue: number;
        monthlyExpenses: number;
        netProfit: number;
        revenueGrowth: number; // Porcentaje vs mes anterior
        expenseGrowth: number;
    };
    sales: {
        activeLeads: number;
        pipelineValue: number;
        opportunitiesCount: number;
        conversionRate: number;
    };
    projects: {
        active: number;
        atRisk: number;
        completedThisMonth: number;
        totalTasksPending: number;
    };
    priorityActions: PriorityAction[];
}

export interface PriorityAction {
    id: string;
    type: 'finance' | 'sales' | 'project' | 'system';
    title: string;
    description: string;
    priority: 'critical' | 'high' | 'medium';
    actionLabel: string;
    actionUrl: string; // Ruta interna para resolver la acción
    dueDate?: Date;
}
