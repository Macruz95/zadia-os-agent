/**
 * ZADIA OS - Dashboard Hook
 * Hook para cargar datos del dashboard ejecutivo
 * Rule #5: Max 200 lines per file
 */

import { useState, useEffect } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { InvoicesService } from '@/modules/finance/services/invoices.service';

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

export function useDashboardData(userId?: string) {
  const [stats, setStats] = useState<DashboardStats>({
    totalLeads: 0,
    totalClients: 0,
    activeProjects: 0,
    totalRevenue: 0,
    pendingInvoices: 0,
    activeOpportunities: 0,
    workOrdersInProgress: 0,
    conversionRate: 0,
  });
  const [projectStatus, setProjectStatus] = useState<StatusDistribution[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      loadDashboardData();
    }
  }, [userId]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Leads
      const leadsSnapshot = await getDocs(collection(db, 'leads'));
      const totalLeads = leadsSnapshot.size;

      // Clientes
      const clientsSnapshot = await getDocs(collection(db, 'clients'));
      const totalClients = clientsSnapshot.size;

      // Proyectos activos
      const projectsSnapshot = await getDocs(
        query(
          collection(db, 'projects'),
          where('status', 'in', ['planning', 'in-progress'])
        )
      );
      const activeProjects = projectsSnapshot.size;

      // Oportunidades activas
      const oppsSnapshot = await getDocs(
        query(
          collection(db, 'opportunities'),
          where('status', 'in', [
            'prospecting',
            'qualification',
            'proposal',
            'negotiation',
          ])
        )
      );
      const activeOpportunities = oppsSnapshot.size;

      // Work Orders en progreso
      const workOrdersSnapshot = await getDocs(
        query(
          collection(db, 'workOrders'),
          where('status', 'in', ['pending', 'in-progress'])
        )
      );
      const workOrdersInProgress = workOrdersSnapshot.size;

      // Facturas y revenue
      const invoiceStats = await InvoicesService.getInvoiceStats();
      const totalRevenue = invoiceStats.totalPaid;
      const pendingInvoices =
        invoiceStats.totalInvoices - invoiceStats.overdueInvoices;

      // Tasa de conversión
      const conversionRate =
        totalLeads > 0 ? Math.round((totalClients / totalLeads) * 100) : 0;

      // Distribución de proyectos por estado
      const allProjectsSnapshot = await getDocs(collection(db, 'projects'));
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
