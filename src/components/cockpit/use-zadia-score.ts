/**
 * ZADIA Score™ - Hook de Cálculo
 * 
 * Calcula la puntuación holística de salud empresarial
 * basada en métricas REALES del DTO (Firebase Firestore)
 * 
 * REGLA 1: DATOS REALES - No mocks, no hardcode
 * REGLA 5: < 200 líneas
 */

'use client';

import { useState, useEffect, useMemo } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useTenantId } from '@/contexts/TenantContext';

interface ScoreMetrics {
  profitability: number;         // 0-100 (25% weight)
  liquidity: number;             // 0-100 (20% weight)
  operationalEfficiency: number; // 0-100 (20% weight)
  customerSatisfaction: number;  // 0-100 (15% weight)
  salesGrowth: number;           // 0-100 (20% weight)
}

interface ZadiaScoreResult {
  score: number;
  previousScore: number | null;
  metrics: ScoreMetrics;
  loading: boolean;
  error: string | null;
  hasData: boolean;
}

const WEIGHTS = {
  profitability: 0.25,
  liquidity: 0.20,
  operationalEfficiency: 0.20,
  customerSatisfaction: 0.15,
  salesGrowth: 0.20,
};

export function useZadiaScore(): ZadiaScoreResult {
  const [metrics, setMetrics] = useState<ScoreMetrics>({
    profitability: 0,
    liquidity: 0,
    operationalEfficiency: 0,
    customerSatisfaction: 0,
    salesGrowth: 0,
  });
  const [previousScore, setPreviousScore] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasData, setHasData] = useState(false);
  const tenantId = useTenantId();

  useEffect(() => {
    async function calculateMetrics() {
      if (!tenantId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        let dataFound = false;

        // 1. PROFITABILITY - Based on paid vs total invoices value
        let profitabilityScore = 0;
        try {
          const invoicesRef = collection(db, 'invoices');
          const invoicesQ = query(invoicesRef, where('tenantId', '==', tenantId));
          const allInvoicesSnap = await getDocs(invoicesQ);
          
          if (allInvoicesSnap.size > 0) {
            dataFound = true;
            let totalValue = 0;
            let paidValue = 0;
            
            allInvoicesSnap.docs.forEach(doc => {
              const data = doc.data();
              const amount = data.total || data.amount || 0;
              totalValue += amount;
              if (data.status === 'paid' || data.status === 'pagada') {
                paidValue += amount;
              }
            });
            
            if (totalValue > 0) {
              profitabilityScore = Math.round((paidValue / totalValue) * 100);
            }
          }
        } catch {
          // Collection might not exist - score stays at 0
        }

        // 2. LIQUIDITY - Ratio of paid invoices count
        let liquidityScore = 0;
        try {
          const invoicesRef = collection(db, 'invoices');
          const invoicesQ2 = query(invoicesRef, where('tenantId', '==', tenantId));
          const allInvoicesSnap = await getDocs(invoicesQ2);
          
          if (allInvoicesSnap.size > 0) {
            dataFound = true;
            const paidCount = allInvoicesSnap.docs.filter(doc => {
              const status = doc.data().status;
              return status === 'paid' || status === 'pagada';
            }).length;
            
            liquidityScore = Math.round((paidCount / allInvoicesSnap.size) * 100);
          }
        } catch {
          // Collection might not exist
        }

        // 3. OPERATIONAL EFFICIENCY - Projects completed vs total
        let operationalScore = 0;
        try {
          const projectsRef = collection(db, 'projects');
          const projectsQ = query(projectsRef, where('tenantId', '==', tenantId));
          const allProjectsSnap = await getDocs(projectsQ);
          
          if (allProjectsSnap.size > 0) {
            dataFound = true;
            const completedCount = allProjectsSnap.docs.filter(doc => {
              const status = doc.data().status;
              return status === 'completed' || status === 'completado' || status === 'done';
            }).length;
            
            operationalScore = Math.round((completedCount / allProjectsSnap.size) * 100);
          }
        } catch {
          // Collection might not exist
        }

        // 4. CUSTOMER SATISFACTION - Based on active clients with recent activity
        let satisfactionScore = 0;
        try {
          const clientsRef = collection(db, 'clients');
          const clientsQ = query(clientsRef, where('tenantId', '==', tenantId));
          const allClientsSnap = await getDocs(clientsQ);
          
          if (allClientsSnap.size > 0) {
            dataFound = true;
            const activeClients = allClientsSnap.docs.filter(doc => {
              const data = doc.data();
              return data.status === 'active' || data.status === 'activo' || !data.status;
            }).length;
            
            // Score based on active ratio
            satisfactionScore = Math.round((activeClients / allClientsSnap.size) * 100);
          }
        } catch {
          // Collection might not exist
        }

        // 5. SALES GROWTH - Based on opportunities won vs total
        let salesGrowthScore = 0;
        try {
          const opportunitiesRef = collection(db, 'opportunities');
          const oppsQ = query(opportunitiesRef, where('tenantId', '==', tenantId));
          const allOppsSnap = await getDocs(oppsQ);
          
          if (allOppsSnap.size > 0) {
            dataFound = true;
            const wonOpps = allOppsSnap.docs.filter(doc => {
              const stage = doc.data().stage;
              return stage === 'won' || stage === 'ganada' || stage === 'closed_won';
            }).length;
            
            salesGrowthScore = Math.round((wonOpps / allOppsSnap.size) * 100);
          } else {
            // Try leads as fallback
            const leadsRef = collection(db, 'leads');
            const leadsQ = query(leadsRef, where('tenantId', '==', tenantId));
            const allLeadsSnap = await getDocs(leadsQ);
            
            if (allLeadsSnap.size > 0) {
              dataFound = true;
              const convertedLeads = allLeadsSnap.docs.filter(doc => {
                const status = doc.data().status;
                return status === 'converted' || status === 'convertido' || status === 'qualified';
              }).length;
              
              salesGrowthScore = Math.round((convertedLeads / allLeadsSnap.size) * 100);
            }
          }
        } catch {
          // Collection might not exist
        }

        setMetrics({
          profitability: profitabilityScore,
          liquidity: liquidityScore,
          operationalEfficiency: operationalScore,
          customerSatisfaction: satisfactionScore,
          salesGrowth: salesGrowthScore,
        });

        setHasData(dataFound);
        setPreviousScore(null); // No historical data tracking yet

      } catch {
        setError('Error calculando ZADIA Score');
        setHasData(false);
      } finally {
        setLoading(false);
      }
    }

    calculateMetrics();
  }, [tenantId]);

  const score = useMemo(() => {
    return (
      metrics.profitability * WEIGHTS.profitability +
      metrics.liquidity * WEIGHTS.liquidity +
      metrics.operationalEfficiency * WEIGHTS.operationalEfficiency +
      metrics.customerSatisfaction * WEIGHTS.customerSatisfaction +
      metrics.salesGrowth * WEIGHTS.salesGrowth
    );
  }, [metrics]);

  return {
    score,
    previousScore,
    metrics,
    loading,
    error,
    hasData,
  };
}
