/**
 * Sales Pipeline Analytics Service
 * Handles pipeline stage analysis and monthly revenue calculations
 */

import { Opportunity } from '../types/sales.types';
import { logger } from '@/lib/logger';

export interface MonthlyRevenue {
  month: string;
  revenue: number;
  deals: number;
}

export interface PipelineStage {
  stage: string;
  value: number;
  count: number;
  color: string;
}

export class SalesPipelineAnalytics {
  private static readonly STAGE_COLORS = {
    'qualified': '#10B981',
    'proposal-sent': '#3B82F6',
    'negotiation': '#F59E0B',
    'closed-won': '#059669',
    'closed-lost': '#EF4444'
  };

  /**
   * Calculate monthly revenue trends
   */
  static calculateMonthlyRevenue(opportunities: Opportunity[]): MonthlyRevenue[] {
    try {
      const monthlyData = new Map<string, { revenue: number; deals: number }>();

      opportunities
        .filter(opp => opp.status === 'won' && opp.closedAt)
        .forEach(opp => {
          const date = opp.closedAt!.toDate();
          const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          
          if (!monthlyData.has(monthKey)) {
            monthlyData.set(monthKey, { revenue: 0, deals: 0 });
          }
          
          const current = monthlyData.get(monthKey)!;
          current.revenue += opp.estimatedValue;
          current.deals += 1;
        });

      // Convert to array and sort by month
      const result = Array.from(monthlyData.entries())
        .map(([month, data]) => ({
          month,
          revenue: data.revenue,
          deals: data.deals
        }))
        .sort((a, b) => a.month.localeCompare(b.month));

      return result;
    } catch (error) {
      logger.error('Error calculating monthly revenue:', error as Error);
      return [];
    }
  }

  /**
   * Calculate pipeline by stage
   */
  static calculatePipelineByStage(opportunities: Opportunity[]): PipelineStage[] {
    try {
      const stageData = new Map<string, { value: number; count: number }>();
      
      opportunities
        .filter(opp => opp.status === 'open')
        .forEach(opp => {
          if (!stageData.has(opp.stage)) {
            stageData.set(opp.stage, { value: 0, count: 0 });
          }
          
          const current = stageData.get(opp.stage)!;
          current.value += opp.estimatedValue;
          current.count += 1;
        });

      return Array.from(stageData.entries()).map(([stage, data]) => ({
        stage,
        value: data.value,
        count: data.count,
        color: this.STAGE_COLORS[stage as keyof typeof this.STAGE_COLORS] || '#6B7280'
      }));
    } catch (error) {
      logger.error('Error calculating pipeline by stage:', error as Error);
      return [];
    }
  }

  /**
   * Calculate stage conversion rates
   */
  static calculateStageConversionRates(opportunities: Opportunity[]): Record<string, number> {
    try {
      const stageFlow = new Map<string, { entered: number; converted: number }>();
      
      opportunities.forEach(opp => {
        const stage = opp.stage;
        
        if (!stageFlow.has(stage)) {
          stageFlow.set(stage, { entered: 0, converted: 0 });
        }
        
        stageFlow.get(stage)!.entered += 1;
        
        // If won, count as converted
        if (opp.status === 'won') {
          stageFlow.get(stage)!.converted += 1;
        }
      });

      const conversionRates: Record<string, number> = {};
      
      stageFlow.forEach((data, stage) => {
        conversionRates[stage] = data.entered > 0 ? (data.converted / data.entered) * 100 : 0;
      });

      return conversionRates;
    } catch (error) {
      logger.error('Error calculating stage conversion rates:', error as Error);
      return {};
    }
  }

  /**
   * Calculate average time in each stage
   */
  static calculateAverageTimeInStage(opportunities: Opportunity[]): Record<string, number> {
    try {
      const stageTime = new Map<string, number[]>();
      
      opportunities.forEach(opp => {
        if (opp.createdAt && opp.updatedAt) {
          const timeInStage = opp.updatedAt.toDate().getTime() - opp.createdAt.toDate().getTime();
          const days = timeInStage / (1000 * 60 * 60 * 24);
          
          if (!stageTime.has(opp.stage)) {
            stageTime.set(opp.stage, []);
          }
          
          stageTime.get(opp.stage)!.push(days);
        }
      });

      const averageTimes: Record<string, number> = {};
      
      stageTime.forEach((times, stage) => {
        const average = times.reduce((sum, time) => sum + time, 0) / times.length;
        averageTimes[stage] = Math.round(average);
      });

      return averageTimes;
    } catch (error) {
      logger.error('Error calculating average time in stage:', error as Error);
      return {};
    }
  }
}