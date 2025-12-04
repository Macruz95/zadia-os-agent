/**
 * Sales Analytics Service - Refactored
 * Main analytics service that orchestrates specialized analytics modules
 */

import { 
  collection, 
  getDocs, 
  query,
  where,
  Timestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { logger } from '@/lib/logger';
import { Lead, Opportunity, Quote } from '../types/sales.types';

// Import specialized analytics services
import { SalesMetricsCalculator, SalesOverview } from './sales-metrics-calculator.service';
import { SalesPipelineAnalytics, MonthlyRevenue, PipelineStage } from './sales-pipeline-analytics.service';
import { SalesLeadSourceAnalytics, LeadSource } from './sales-lead-source-analytics.service';
import { SalesPerformanceAnalytics, SalesPerformance } from './sales-performance-analytics.service';

export interface SalesAnalytics {
  overview: SalesOverview;
  monthlyRevenue: MonthlyRevenue[];
  pipelineStages: PipelineStage[];
  leadSources: LeadSource[];
  salesPerformance: SalesPerformance[];
}

// Legacy alias for backward compatibility
export type SalesAnalyticsData = SalesAnalytics;

export class AnalyticsService {
  private static readonly COLLECTIONS = {
    leads: 'leads',
    opportunities: 'opportunities',
    quotes: 'quotes'
  };

  /**
   * Get comprehensive sales analytics
   */
  static async getSalesAnalytics(tenantId: string): Promise<SalesAnalytics> {
    try {
      if (!tenantId) {
        logger.warn('getSalesAnalytics called without tenantId');
        return {
          overview: { totalRevenue: 0, totalDeals: 0, conversionRate: 0, avgDealSize: 0 },
          monthlyRevenue: [],
          pipelineStages: [],
          leadSources: [],
          salesPerformance: []
        };
      }

      logger.info('Calculating sales analytics...');

      // Fetch all data in parallel
      const [leads, opportunities] = await Promise.all([
        this.getLeads(tenantId),
        this.getOpportunities(tenantId)
      ]);

      // Calculate all analytics using specialized services
      const [
        overview,
        monthlyRevenue,
        pipelineStages,
        leadSources,
        salesPerformance
      ] = await Promise.all([
        Promise.resolve(SalesMetricsCalculator.calculateSalesOverview(opportunities, leads)),
        Promise.resolve(SalesPipelineAnalytics.calculateMonthlyRevenue(opportunities)),
        Promise.resolve(SalesPipelineAnalytics.calculatePipelineByStage(opportunities)),
        Promise.resolve(SalesLeadSourceAnalytics.calculateLeadsBySource(leads, opportunities)),
        SalesPerformanceAnalytics.calculateSalesPerformance(opportunities)
      ]);

      return {
        overview,
        monthlyRevenue,
        pipelineStages,
        leadSources,
        salesPerformance
      };
    } catch (error) {
      logger.error('Error calculating sales analytics:', error as Error);
      throw new Error('Failed to calculate sales analytics');
    }
  }

  /**
   * Get all leads filtered by tenant
   */
  private static async getLeads(tenantId: string): Promise<Lead[]> {
    try {
      const q = query(
        collection(db, this.COLLECTIONS.leads),
        where('tenantId', '==', tenantId)
      );
      const querySnapshot = await getDocs(q);
      const leads: Lead[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        leads.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt || Timestamp.now(),
          updatedAt: data.updatedAt || Timestamp.now(),
        } as Lead);
      });

      return leads;
    } catch (error) {
      logger.error('Error fetching leads:', error as Error);
      return [];
    }
  }

  /**
   * Get all opportunities filtered by tenant
   */
  private static async getOpportunities(tenantId: string): Promise<Opportunity[]> {
    try {
      const q = query(
        collection(db, this.COLLECTIONS.opportunities),
        where('tenantId', '==', tenantId)
      );
      const querySnapshot = await getDocs(q);
      const opportunities: Opportunity[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        opportunities.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt || Timestamp.now(),
          updatedAt: data.updatedAt || Timestamp.now(),
        } as Opportunity);
      });

      return opportunities;
    } catch (error) {
      logger.error('Error fetching opportunities:', error as Error);
      return [];
    }
  }

  /**
   * Get all quotes filtered by tenant
   */
  private static async getQuotes(tenantId: string): Promise<Quote[]> {
    try {
      const q = query(
        collection(db, this.COLLECTIONS.quotes),
        where('tenantId', '==', tenantId)
      );
      const querySnapshot = await getDocs(q);
      const quotes: Quote[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        quotes.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt || Timestamp.now(),
          updatedAt: data.updatedAt || Timestamp.now(),
        } as Quote);
      });

      return quotes;
    } catch (error) {
      logger.error('Error fetching quotes:', error as Error);
      return [];
    }
  }

  // Re-export specialized service methods for direct access
  static getRevenueForDateRange = SalesPerformanceAnalytics.getRevenueForDateRange;
  static calculateQoQGrowth = SalesPerformanceAnalytics.calculateQoQGrowth;
  static calculateSourcePerformance = SalesLeadSourceAnalytics.calculateSourcePerformance;
  static calculateStageConversionRates = SalesPipelineAnalytics.calculateStageConversionRates;
}

// Legacy alias for backward compatibility
export const SalesAnalyticsService = AnalyticsService;