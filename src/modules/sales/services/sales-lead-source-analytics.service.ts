/**
 * Sales Lead Source Analytics Service
 * Handles lead source analysis and performance tracking
 */

import { Lead, Opportunity } from '../types/sales.types';
import { logger } from '@/lib/logger';

export interface LeadSource {
  source: string;
  count: number;
  value: number;
  percentage: number;
}

export interface SourcePerformance {
  source: string;
  totalLeads: number;
  convertedLeads: number;
  conversionRate: number;
  totalRevenue: number;
  avgDealSize: number;
}

export class SalesLeadSourceAnalytics {
  /**
   * Calculate leads by source
   */
  static calculateLeadsBySource(leads: Lead[], opportunities: Opportunity[]): LeadSource[] {
    try {
      const sourceData = new Map<string, { count: number; value: number }>();
      
      // Count leads by source
      leads.forEach(lead => {
        if (!sourceData.has(lead.source)) {
          sourceData.set(lead.source, { count: 0, value: 0 });
        }
        sourceData.get(lead.source)!.count += 1;
      });

      // Add opportunity value for converted leads
      opportunities.forEach(opp => {
        if (opp.source) {
          const lead = leads.find(l => l.id === opp.source);
          if (lead && sourceData.has(lead.source)) {
            sourceData.get(lead.source)!.value += opp.estimatedValue;
          }
        }
      });

      const totalLeads = leads.length;
      
      return Array.from(sourceData.entries()).map(([source, data]) => ({
        source,
        count: data.count,
        value: data.value,
        percentage: totalLeads > 0 ? (data.count / totalLeads) * 100 : 0
      }));
    } catch (error) {
      logger.error('Error calculating leads by source:', error as Error);
      return [];
    }
  }

  /**
   * Calculate source performance metrics
   */
  static calculateSourcePerformance(leads: Lead[], opportunities: Opportunity[]): SourcePerformance[] {
    try {
      const sourceMetrics = new Map<string, {
        totalLeads: number;
        convertedLeads: number;
        totalRevenue: number;
      }>();

      // Initialize source metrics
      leads.forEach(lead => {
        if (!sourceMetrics.has(lead.source)) {
          sourceMetrics.set(lead.source, {
            totalLeads: 0,
            convertedLeads: 0,
            totalRevenue: 0
          });
        }
        sourceMetrics.get(lead.source)!.totalLeads += 1;
      });

      // Track conversions and revenue
      opportunities.forEach(opp => {
        if (opp.source && opp.status === 'won') {
          const lead = leads.find(l => l.id === opp.source);
          if (lead && sourceMetrics.has(lead.source)) {
            const metrics = sourceMetrics.get(lead.source)!;
            metrics.convertedLeads += 1;
            metrics.totalRevenue += opp.estimatedValue;
          }
        }
      });

      return Array.from(sourceMetrics.entries()).map(([source, metrics]) => ({
        source,
        totalLeads: metrics.totalLeads,
        convertedLeads: metrics.convertedLeads,
        conversionRate: metrics.totalLeads > 0 ? (metrics.convertedLeads / metrics.totalLeads) * 100 : 0,
        totalRevenue: metrics.totalRevenue,
        avgDealSize: metrics.convertedLeads > 0 ? metrics.totalRevenue / metrics.convertedLeads : 0
      }));
    } catch (error) {
      logger.error('Error calculating source performance:', error as Error);
      return [];
    }
  }

  /**
   * Get top performing sources
   */
  static getTopSources(leads: Lead[], opportunities: Opportunity[], limit: number = 5): SourcePerformance[] {
    try {
      const sourcePerformance = this.calculateSourcePerformance(leads, opportunities);
      
      return sourcePerformance
        .sort((a, b) => b.totalRevenue - a.totalRevenue)
        .slice(0, limit);
    } catch (error) {
      logger.error('Error getting top sources:', error as Error);
      return [];
    }
  }

  /**
   * Calculate source trends over time
   */
  static calculateSourceTrends(leads: Lead[]): Record<string, Record<string, number>> {
    try {
      const trends = new Map<string, Map<string, number>>();

      leads.forEach(lead => {
        const month = lead.createdAt.toDate().toISOString().substring(0, 7); // YYYY-MM
        
        if (!trends.has(lead.source)) {
          trends.set(lead.source, new Map());
        }
        
        const sourceMap = trends.get(lead.source)!;
        sourceMap.set(month, (sourceMap.get(month) || 0) + 1);
      });

      const result: Record<string, Record<string, number>> = {};
      
      trends.forEach((monthData, source) => {
        result[source] = Object.fromEntries(monthData);
      });

      return result;
    } catch (error) {
      logger.error('Error calculating source trends:', error as Error);
      return {};
    }
  }
}