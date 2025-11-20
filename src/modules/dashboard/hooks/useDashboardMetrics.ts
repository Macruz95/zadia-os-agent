/**
 * ZADIA OS - useDashboardMetrics Hook
 * 
 * Hook centralizado para obtener métricas del dashboard
 * Agrega datos de Finanzas, Ventas y Proyectos
 */

import { useState, useEffect } from 'react';
import { DashboardMetrics, PriorityAction } from '../types/dashboard.types';
// Importaremos los servicios reales cuando conectemos todo
// import { FinanceService } from '@/modules/finance/services/finance.service';
// import { ProjectsService } from '@/modules/projects/services/projects.service';

export function useDashboardMetrics() {
    const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadMetrics = async () => {
            try {
                setLoading(true);

                // TODO: Reemplazar con llamadas reales a servicios
                // Por ahora simulamos datos para construir la UI

                // Simulación de delay de red
                await new Promise(resolve => setTimeout(resolve, 1000));

                const mockMetrics: DashboardMetrics = {
                    financial: {
                        monthlyRevenue: 45250.00,
                        monthlyExpenses: 12800.50,
                        netProfit: 32449.50,
                        revenueGrowth: 15.5,
                        expenseGrowth: -2.3,
                    },
                    sales: {
                        activeLeads: 12,
                        pipelineValue: 125000.00,
                        opportunitiesCount: 5,
                        conversionRate: 24,
                    },
                    projects: {
                        active: 8,
                        atRisk: 2,
                        completedThisMonth: 3,
                        totalTasksPending: 45,
                    },
                    priorityActions: [
                        {
                            id: '1',
                            type: 'finance',
                            title: 'Factura Vencida',
                            description: 'Cliente "Tech Solutions" tiene una factura vencida por $2,500',
                            priority: 'critical',
                            actionLabel: 'Ver Factura',
                            actionUrl: '/finance/invoices/inv-123',
                            dueDate: new Date(),
                        },
                        {
                            id: '2',
                            type: 'sales',
                            title: 'Oportunidad Estancada',
                            description: 'La oportunidad "Sistema ERP" no ha tenido actividad en 7 días',
                            priority: 'high',
                            actionLabel: 'Contactar Cliente',
                            actionUrl: '/sales/opportunities/opp-456',
                        },
                        {
                            id: '3',
                            type: 'project',
                            title: 'Proyecto en Riesgo',
                            description: 'Proyecto "Web App" excede el presupuesto en 10%',
                            priority: 'high',
                            actionLabel: 'Revisar Gastos',
                            actionUrl: '/projects/proj-789/budget',
                        }
                    ]
                };

                setMetrics(mockMetrics);
            } catch (err) {
                console.error('Error loading dashboard metrics:', err);
                setError('Error al cargar métricas del dashboard');
            } finally {
                setLoading(false);
            }
        };

        loadMetrics();
    }, []);

    return { metrics, loading, error };
}
