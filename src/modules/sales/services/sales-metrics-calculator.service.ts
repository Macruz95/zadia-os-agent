/**
 * Sales Metrics Calculator
 * Handles calculation of basic sales metrics and KPIs
 */

import { Opportunity, Lead } from '../types/sales.types';
import { logger } from '@/lib/logger';

export interface SalesOverview {
  totalRevenue: number;
  totalDeals: number;
  conversionRate: number;
  avgDealSize: number;
}

export class SalesMetricsCalculator {
  /**
   * Calculate sales overview metrics
   */
  static calculateSalesOverview(opportunities: Opportunity[], leads: Lead[]): SalesOverview {
    try {
      const closedOpportunities = opportunities.filter(opp => opp.stage === 'closed-won');
      
      const totalRevenue = closedOpportunities.reduce((sum, opp) => sum + opp.estimatedValue, 0);
      const totalDeals = closedOpportunities.length;
      const totalLeads = leads.length;
      const conversionRate = totalLeads > 0 ? (totalDeals / totalLeads) * 100 : 0;
      const avgDealSize = totalDeals > 0 ? totalRevenue / totalDeals : 0;

      return {
        totalRevenue,
        totalDeals,
        conversionRate,
        avgDealSize
      };
    } catch (error) {
      logger.error('Error calculating sales overview:', error as Error);
      return {
        totalRevenue: 0,
        totalDeals: 0,
        conversionRate: 0,
        avgDealSize: 0
      };
    }
  }

  /**
   * Calculate conversion rate by lead source
   */
  static calculateConversionBySource(leads: Lead[], opportunities: Opportunity[]): Record<string, number> {
    try {
      const conversionRates: Record<string, number> = {};
      
      // Group leads by source
      const leadsBySource = leads.reduce((acc, lead) => {
        const source = lead.source || 'Unknown';
        acc[source] = (acc[source] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Count conversions by source
      const conversionsBySource = opportunities.reduce((acc, opp) => {
        if (opp.stage === 'closed-won' && opp.source) {
          acc[opp.source] = (acc[opp.source] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>);

      // Calculate conversion rates
      Object.keys(leadsBySource).forEach(source => {
        const totalLeads = leadsBySource[source];
        const conversions = conversionsBySource[source] || 0;
        conversionRates[source] = totalLeads > 0 ? (conversions / totalLeads) * 100 : 0;
      });

      return conversionRates;
    } catch (error) {
      logger.error('Error calculating conversion by source:', error as Error);
      return {};
    }
  }

  /**
   * Calculate deal size distribution
   */
  static calculateDealSizeDistribution(opportunities: Opportunity[]): {
    small: number;
    medium: number;
    large: number;
    enterprise: number;
  } {
    try {
      const closedOpportunities = opportunities.filter(opp => opp.stage === 'closed-won');
      const distribution = { small: 0, medium: 0, large: 0, enterprise: 0 };

      closedOpportunities.forEach(opp => {
        if (opp.estimatedValue < 10000) {
          distribution.small++;
        } else if (opp.estimatedValue < 50000) {
          distribution.medium++;
        } else if (opp.estimatedValue < 200000) {
          distribution.large++;
        } else {
          distribution.enterprise++;
        }
      });

      return distribution;
    } catch (error) {
      logger.error('Error calculating deal size distribution:', error as Error);
      return { small: 0, medium: 0, large: 0, enterprise: 0 };
    }
  }
}