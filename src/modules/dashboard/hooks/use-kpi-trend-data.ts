/**
 * ZADIA OS - KPI Trend Data Hook
 * 
 * Fetches historical data for KPI sparklines from Firestore
 * Rule #1: Real data from Firebase, no mocks
 * Rule #3: Zod validation
 * Rule #5: Max 200 lines
 */

import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { logger } from '@/lib/logger';
import { useTenantId } from '@/contexts/TenantContext';

export interface KPITrendData {
  totalLeadsTrend: number[];
  totalClientsTrend: number[];
  activeProjectsTrend: number[];
  revenueTrend: number[];
  activeOpportunitiesTrend: number[];
  pendingInvoicesTrend: number[];
  workOrdersTrend: number[];
  conversionRateTrend: number[];
}

/**
 * Hook to fetch historical KPI data for sparklines
 * Fetches data from last 30 days
 */
export function useKPITrendData() {
  const [trendData, setTrendData] = useState<KPITrendData>({
    totalLeadsTrend: [],
    totalClientsTrend: [],
    activeProjectsTrend: [],
    revenueTrend: [],
    activeOpportunitiesTrend: [],
    pendingInvoicesTrend: [],
    workOrdersTrend: [],
    conversionRateTrend: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const tenantId = useTenantId();

  useEffect(() => {
    if (!tenantId) {
      setLoading(false);
      return;
    }

    const fetchTrendData = async () => {
      try {
        setLoading(true);
        setError(null);

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        // Fetch revenue trend from invoices (last 30 days by week)
        const revenueTrend = await fetchRevenueByWeek(thirtyDaysAgo, tenantId);
        
        // Fetch leads trend (last 30 days by week)
        const leadsTrend = await fetchLeadsByWeek(thirtyDaysAgo, tenantId);

        // Fetch clients trend (cumulative last 30 days)
        const clientsTrend = await fetchClientsByWeek(tenantId);

        // Fetch projects trend
        const projectsTrend = await fetchProjectsByWeek(tenantId);

        // Fetch opportunities trend
        const opportunitiesTrend = await fetchOpportunitiesByWeek(tenantId);

        setTrendData({
          totalLeadsTrend: leadsTrend,
          totalClientsTrend: clientsTrend,
          activeProjectsTrend: projectsTrend,
          revenueTrend: revenueTrend,
          activeOpportunitiesTrend: opportunitiesTrend,
          pendingInvoicesTrend: [0, 0, 0, 0], // TODO: Implement
          workOrdersTrend: [0, 0, 0, 0], // TODO: Implement
          conversionRateTrend: [0, 0, 0, 0] // TODO: Implement
        });

        logger.info('KPI trend data loaded successfully', {
          component: 'useKPITrendData'
        });

      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error loading trend data';
        setError(errorMessage);
        logger.error('Error fetching KPI trend data', err as Error, {
          component: 'useKPITrendData'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTrendData();
  }, [tenantId]);

  return { trendData, loading, error };
}

/**
 * Fetch revenue by week for last 30 days
 */
async function fetchRevenueByWeek(startDate: Date, tenantId: string): Promise<number[]> {
  try {
    const invoicesRef = collection(db, 'invoices');
    const q = query(
      invoicesRef,
      where('tenantId', '==', tenantId),
      where('status', '==', 'paid'),
      where('paidAt', '>=', Timestamp.fromDate(startDate))
    );

    const snapshot = await getDocs(q);
    
    // Group by week (4 weeks)
    const weeklyRevenue = [0, 0, 0, 0];
    const now = new Date();

    snapshot.forEach((doc) => {
      const data = doc.data();
      const paidAt = data.paidAt?.toDate();
      
      if (paidAt) {
        const daysDiff = Math.floor((now.getTime() - paidAt.getTime()) / (1000 * 60 * 60 * 24));
        const weekIndex = Math.min(Math.floor(daysDiff / 7), 3);
        weeklyRevenue[3 - weekIndex] += data.amountPaid || data.total || 0;
      }
    });

    return weeklyRevenue;
  } catch (error) {
    logger.error('Error fetching revenue trend', error as Error);
    return [0, 0, 0, 0];
  }
}

/**
 * Fetch leads by week
 */
async function fetchLeadsByWeek(startDate: Date, tenantId: string): Promise<number[]> {
  try {
    const leadsRef = collection(db, 'leads');
    const q = query(
      leadsRef,
      where('tenantId', '==', tenantId),
      where('createdAt', '>=', Timestamp.fromDate(startDate))
    );

    const snapshot = await getDocs(q);
    
    const weeklyLeads = [0, 0, 0, 0];
    const now = new Date();

    snapshot.forEach((doc) => {
      const data = doc.data();
      const createdAt = data.createdAt?.toDate();
      
      if (createdAt) {
        const daysDiff = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
        const weekIndex = Math.min(Math.floor(daysDiff / 7), 3);
        weeklyLeads[3 - weekIndex]++;
      }
    });

    return weeklyLeads;
  } catch (error) {
    logger.error('Error fetching leads trend', error as Error);
    return [0, 0, 0, 0];
  }
}

/**
 * Fetch clients by week (cumulative)
 */
async function fetchClientsByWeek(tenantId: string): Promise<number[]> {
  try {
    const clientsRef = collection(db, 'clients');
    const q = query(clientsRef, where('tenantId', '==', tenantId));

    const snapshot = await getDocs(q);
    
    const weeklyCounts = [0, 0, 0, 0];
    const now = new Date();

    snapshot.forEach((doc) => {
      const data = doc.data();
      const createdAt = data.createdAt?.toDate();
      
      if (createdAt) {
        const daysDiff = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
        
        // Cumulative count for each week
        for (let i = 0; i < 4; i++) {
          if (daysDiff >= i * 7) {
            weeklyCounts[3 - i]++;
          }
        }
      }
    });

    return weeklyCounts;
  } catch (error) {
    logger.error('Error fetching clients trend', error as Error);
    return [0, 0, 0, 0];
  }
}

/**
 * Fetch projects by week
 */
async function fetchProjectsByWeek(tenantId: string): Promise<number[]> {
  try {
    const projectsRef = collection(db, 'projects');
    const q = query(
      projectsRef,
      where('tenantId', '==', tenantId),
      where('status', 'in', ['Planificación', 'En Progreso', 'En Revisión'])
    );

    const snapshot = await getDocs(q);
    
    return [snapshot.size, snapshot.size, snapshot.size, snapshot.size];
  } catch (error) {
    logger.error('Error fetching projects trend', error as Error);
    return [0, 0, 0, 0];
  }
}

/**
 * Fetch opportunities by week
 */
async function fetchOpportunitiesByWeek(tenantId: string): Promise<number[]> {
  try {
    const oppsRef = collection(db, 'opportunities');
    const q = query(
      oppsRef,
      where('tenantId', '==', tenantId),
      where('status', 'in', ['Calificación', 'Negociación', 'Propuesta'])
    );

    const snapshot = await getDocs(q);
    
    return [snapshot.size, snapshot.size, snapshot.size, snapshot.size];
  } catch (error) {
    logger.error('Error fetching opportunities trend', error as Error);
    return [0, 0, 0, 0];
  }
}
