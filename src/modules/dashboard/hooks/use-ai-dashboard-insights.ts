/**
 * ZADIA OS - AI-Enhanced Dashboard Hook
 * 
 * Integrates AI insights into dashboard data
 */

import { useState, useEffect } from 'react';
import { FinancialInsightsAgent } from '@/lib/ai/agents';
import type { AgentExecutionResult } from '@/lib/ai/agents';
import { logger } from '@/lib/logger';

interface AIInsightsState {
  insights: string[];
  healthScore: number;
  loading: boolean;
  error: string | null;
}

export function useAIDashboardInsights(
  revenue: number,
  expenses: number,
  profit: number,
  monthlyRevenue?: Array<{ month: string; revenue: number }>,
  pendingInvoices?: number,
  activeOpportunities?: number
) {
  const [aiState, setAIState] = useState<AIInsightsState>({
    insights: [],
    healthScore: 50,
    loading: false,
    error: null
  });

  useEffect(() => {
    // Only analyze if we have meaningful data
    if (revenue === 0 && expenses === 0 && profit === 0) {
      return;
    }

    const analyzeFinancials = async () => {
      try {
        setAIState(prev => ({ ...prev, loading: true, error: null }));

        const agent = new FinancialInsightsAgent();

        const result: AgentExecutionResult = await agent.analyze({
          revenue,
          expenses,
          profit,
          monthlyRevenue,
          pendingInvoices,
          activeOpportunities
        });

        if (result.success && result.data) {
          const healthScore = (result.data as { healthIndicators: { overallHealth: number } })
            .healthIndicators.overallHealth;

          setAIState({
            insights: result.insights || [],
            healthScore,
            loading: false,
            error: null
          });
        } else {
          setAIState(prev => ({
            ...prev,
            loading: false,
            error: result.error || 'Error analyzing data'
          }));
        }

      } catch (error) {
        logger.error('Error getting AI insights', error as Error, {
          component: 'useAIDashboardInsights'
        });
        setAIState(prev => ({
          ...prev,
          loading: false,
          error: 'Error al obtener insights de IA'
        }));
      }
    };

    // Debounce: only analyze after data is stable
    const timeoutId = setTimeout(analyzeFinancials, 1000);

    return () => clearTimeout(timeoutId);
  }, [revenue, expenses, profit, monthlyRevenue, pendingInvoices, activeOpportunities]);

  return aiState;
}
