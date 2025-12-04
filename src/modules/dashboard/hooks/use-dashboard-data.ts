/**
 * ZADIA OS - Dashboard Hook
 * Hook para cargar datos del dashboard ejecutivo
 * Rule #5: Max 200 lines per file
 */

import { useState, useEffect } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { InvoicesService } from '@/modules/finance/services/invoices.service';
import { useTenantId } from '@/contexts/TenantContext';
import { useTenant } from '@/contexts/TenantContext';

export interface DashboardStats {
  totalLeads: number;
  totalClients: number;
  activeProjects: number;
  totalRevenue: number;
  pendingInvoices: number;
  activeOpportunities: number;
  workOrdersInProgress: number;
  conversionRate: number;
}

export interface StatusDistribution {
  name: string;
  value: number;
}

const EMPTY_STATS: DashboardStats = {
  totalLeads: 0,
  totalClients: 0,
  activeProjects: 0,
  totalRevenue: 0,
  pendingInvoices: 0,
  activeOpportunities: 0,
  workOrdersInProgress: 0,
  conversionRate: 0,
};

export function useDashboardData(userId?: string) {
  const tenantId = useTenantId();
  const { loading: tenantLoading } = useTenant();
  const [stats, setStats] = useState<DashboardStats>(EMPTY_STATS);
  const [projectStatus, setProjectStatus] = useState<StatusDistribution[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Wait for tenant context to finish loading
    if (tenantLoading) {
      return;
    }

    // If no userId or no tenantId after tenant loading, return empty stats
    if (!userId || !tenantId) {
      setStats(EMPTY_STATS);
      setProjectStatus([]);
      setLoading(false);
      return;
    }

    loadDashboardData();
  }, [userId, tenantId, tenantLoading]);

  const loadDashboardData = async () => {
    if (!tenantId) {
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);

      // Leads filtered by tenant
      const leadsSnapshot = await getDocs(
        query(collection(db, 'leads'), where('tenantId', '==', tenantId))
      );
      const totalLeads = leadsSnapshot.size;

      // Clientes filtered by tenant
      const clientsSnapshot = await getDocs(
        query(collection(db, 'clients'), where('tenantId', '==', tenantId))
      );
      const totalClients = clientsSnapshot.size;

      // Proyectos activos filtered by tenant
      const projectsSnapshot = await getDocs(
        query(
          collection(db, 'projects'),
          where('tenantId', '==', tenantId),
          where('status', 'in', ['planning', 'in-progress'])
        )
      );
      const activeProjects = projectsSnapshot.size;

      // Oportunidades activas filtered by tenant
      const oppsSnapshot = await getDocs(
        query(
          collection(db, 'opportunities'),
          where('tenantId', '==', tenantId),
          where('status', 'in', [
            'prospecting',
            'qualification',
            'proposal',
            'negotiation',
          ])
        )
      );
      const activeOpportunities = oppsSnapshot.size;

      // Work Orders en progreso filtered by tenant
      const workOrdersSnapshot = await getDocs(
        query(
          collection(db, 'workOrders'),
          where('tenantId', '==', tenantId),
          where('status', 'in', ['pending', 'in-progress'])
        )
      );
      const workOrdersInProgress = workOrdersSnapshot.size;

      // Facturas y revenue (already filtered by tenant in service)
      const invoiceStats = await InvoicesService.getInvoiceStats(undefined, tenantId);
      const totalRevenue = invoiceStats.totalPaid;
      const pendingInvoices =
        invoiceStats.totalInvoices - invoiceStats.overdueInvoices;

      // Tasa de conversión
      const conversionRate =
        totalLeads > 0 ? Math.round((totalClients / totalLeads) * 100) : 0;

      // Distribución de proyectos por estado filtered by tenant
      const allProjectsSnapshot = await getDocs(
        query(collection(db, 'projects'), where('tenantId', '==', tenantId))
      );
      const statusCounts: Record<string, number> = {};
      allProjectsSnapshot.docs.forEach((doc) => {
        const status = doc.data().status || 'unknown';
        statusCounts[status] = (statusCounts[status] || 0) + 1;
      });

      const statusLabels: Record<string, string> = {
        planning: 'Planificación',
        'in-progress': 'En Progreso',
        completed: 'Completados',
        'on-hold': 'En Espera',
      };

      const projectStatusData = Object.entries(statusCounts).map(
        ([status, count]) => ({
          name: statusLabels[status] || status,
          value: count,
        })
      );

      setStats({
        totalLeads,
        totalClients,
        activeProjects,
        totalRevenue,
        pendingInvoices,
        activeOpportunities,
        workOrdersInProgress,
        conversionRate,
      });

      setProjectStatus(projectStatusData);
    } catch (error) {
      // On error, just show empty stats
      console.error('Error loading dashboard data:', error);
      setStats(EMPTY_STATS);
      setProjectStatus([]);
    } finally {
      setLoading(false);
    }
  };

  return {
    stats,
    projectStatus,
    loading,
    refetch: loadDashboardData,
  };
}
