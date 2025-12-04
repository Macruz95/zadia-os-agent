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
        totalLeads: number;
        totalOpportunities: number;
        conversionRate: number;
        pipelineValue: number;
        leadsGrowth: number;
        opportunitiesGrowth: number;
    };
    projects: {
        activeProjects: number;
        completedTasks: number;
        pendingTasks: number;
        projectProgress: number;
    };
    priorityActions: PriorityAction[];
}

export interface PriorityAction {
    id: string;
    type: 'finance' | 'sales' | 'project' | 'system';
    title: string;
    description: string;
    priority: 'critical' | 'high' | 'medium' | 'low';
    actionLabel: string;
    actionUrl: string; // Ruta interna para resolver la acción
    dueDate?: Date;
}
