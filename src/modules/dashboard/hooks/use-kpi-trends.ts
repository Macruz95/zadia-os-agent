/**
 * ZADIA OS - KPI Trends Hook
 * 
 * Fetch historical KPI data from Firebase for sparklines
 * Rule #1: Real data only (no mocks) - Firebase integration
 * Rule #3: Zod validation
 * Rule #4: Modular architecture
 */

import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { KPITrendDirection } from '../types/kpi-thresholds.types';
import { logger } from '@/lib/logger';

export interface TrendDataPoint {
  date: Date;
  value: number;
}

export interface KPITrendResult {
  data: number[]; // Simplified for sparklines (just values)
  fullData: TrendDataPoint[];
  direction: KPITrendDirection;
  changePercentage: number;
  isLoading: boolean;
  error: Error | null;
}

/**
 * Calculate trend direction and percentage change
 */
function calculateTrend(data: number[]): {
  direction: KPITrendDirection;
  changePercentage: number;
} {
  if (data.length < 2) {
    return { direction: 'stable', changePercentage: 0 };
  }

  const first = data[0];
  const last = data[data.length - 1];

  if (first === 0) {
    return { 
      direction: last > 0 ? 'up' : 'stable', 
      changePercentage: last > 0 ? 100 : 0 
    };
  }

  const changePercentage = ((last - first) / first) * 100;

  let direction: KPITrendDirection = 'stable';
  if (Math.abs(changePercentage) > 5) {
    direction = changePercentage > 0 ? 'up' : 'down';
  }

  return { direction, changePercentage };
}

/**
 * Hook to fetch KPI trend data from Firebase
 * 
 * @param collectionName - Firestore collection name
 * @param kpiField - Field name containing the KPI value
 * @param tenantId - Current tenant ID for data isolation
 * @param days - Number of days to fetch (default: 30)
 */
export function useKPITrends(
  collectionName: string,
  kpiField: string,
  tenantId: string | undefined,
  days: number = 30
): KPITrendResult {
  const [data, setData] = useState<number[]>([]);
  const [fullData, setFullData] = useState<TrendDataPoint[]>([]);
  const [direction, setDirection] = useState<KPITrendDirection>('stable');
  const [changePercentage, setChangePercentage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!tenantId) {
      setIsLoading(false);
      return;
    }

    const fetchTrends = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Calculate date range
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        // Query Firestore with tenant isolation
        const q = query(
          collection(db, collectionName),
          where('tenantId', '==', tenantId),
          where('createdAt', '>=', startDate),
          where('createdAt', '<=', endDate),
          orderBy('createdAt', 'asc'),
          limit(days)
        );

        const snapshot = await getDocs(q);

        const trendData: TrendDataPoint[] = snapshot.docs.map((doc) => {
          const docData = doc.data();
          return {
            date: docData.createdAt?.toDate() || new Date(),
            value: Number(docData[kpiField]) || 0,
          };
        });

        setFullData(trendData);

        const values = trendData.map((point) => point.value);
        setData(values);

        const { direction: trendDir, changePercentage: change } = calculateTrend(values);
        setDirection(trendDir);
        setChangePercentage(change);

      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error');
        logger.error('Error fetching KPI trends', error, {
          component: 'useKPITrends',
          metadata: {
            collection: collectionName,
            field: kpiField,
          }
        });
        setError(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrends();
  }, [collectionName, kpiField, tenantId, days]);

  return {
    data,
    fullData,
    direction,
    changePercentage,
    isLoading,
    error,
  };
}
