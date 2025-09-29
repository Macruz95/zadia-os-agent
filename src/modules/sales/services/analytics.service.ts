/**
 * ZADIA OS - Sales Analytics Service
 * 
 * Calculates real-time analytics from Firebase data
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
import { UsersTargetsService } from './users-targets.service';

export interface SalesOverview {
  totalRevenue: number;
  totalDeals: number;
  conversionRate: number;
  avgDealSize: number;
}

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

export interface LeadSource {
  source: string;
  count: number;
  value: number;
  percentage: number;
}

export interface SalesPerformance {
  name: string;
  deals: number;
  revenue: number;
  target: number;
  progress: number;
}

export interface SalesAnalyticsData {
  overview: SalesOverview;
  monthlyRevenue: MonthlyRevenue[];
  pipelineByStage: PipelineStage[];
  leadsBySource: LeadSource[];
  salesPerformance: SalesPerformance[];
}

export class SalesAnalyticsService {
  private static readonly COLLECTIONS = {
    leads: 'leads',
    opportunities: 'opportunities', 
    quotes: 'quotes',
    users: 'users'
  };

  private static readonly STAGE_COLORS = {
    'qualified': '#3B82F6',
    'proposal-sent': '#F59E0B', 
    'negotiation': '#EF4444',
    'closed-won': '#10B981',
    'closed-lost': '#6B7280'
  };

  /**
   * Get sales analytics data
   */
  static async getSalesAnalytics(): Promise<SalesAnalyticsData> {
    try {
      const [leads, opportunities] = await Promise.all([
        this.getLeads(),
        this.getOpportunities()
      ]);

      const overview = this.calculateOverview(opportunities, leads);
      const monthlyRevenue = this.calculateMonthlyRevenue(opportunities);
      const pipelineByStage = this.calculatePipelineByStage(opportunities);
      const leadsBySource = this.calculateLeadsBySource(leads, opportunities);
      const salesPerformance = await this.calculateSalesPerformance(opportunities);

      return {
        overview,
        monthlyRevenue,
        pipelineByStage,
        leadsBySource,
        salesPerformance
      };
    } catch (error) {
      logger.error('Error calculating sales analytics', error instanceof Error ? error : new Error(String(error)));
      throw new Error('Failed to calculate sales analytics');
    }
  }

  /**
   * Get all leads
   */
  private static async getLeads(): Promise<Lead[]> {
    const querySnapshot = await getDocs(collection(db, this.COLLECTIONS.leads));
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
  }

  /**
   * Get all opportunities
   */
  private static async getOpportunities(): Promise<Opportunity[]> {
    const querySnapshot = await getDocs(collection(db, this.COLLECTIONS.opportunities));
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
  }

  /**
   * Get all quotes
   */
  private static async getQuotes(): Promise<Quote[]> {
    const querySnapshot = await getDocs(collection(db, this.COLLECTIONS.quotes));
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
  }

  /**
   * Calculate overview metrics
   */
  private static calculateOverview(opportunities: Opportunity[], leads: Lead[]): SalesOverview {
    const wonOpportunities = opportunities.filter(opp => opp.status === 'won');
    const totalRevenue = wonOpportunities.reduce((sum, opp) => sum + opp.estimatedValue, 0);
    const totalDeals = wonOpportunities.length;
    const convertedLeads = leads.filter(lead => lead.status === 'converted');
    const conversionRate = leads.length > 0 ? (convertedLeads.length / leads.length) * 100 : 0;
    const avgDealSize = totalDeals > 0 ? totalRevenue / totalDeals : 0;

    return {
      totalRevenue,
      totalDeals,
      conversionRate,
      avgDealSize
    };
  }

  /**
   * Calculate monthly revenue
   */
  private static calculateMonthlyRevenue(opportunities: Opportunity[]): MonthlyRevenue[] {
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
  }

  /**
   * Calculate pipeline by stage
   */
  private static calculatePipelineByStage(opportunities: Opportunity[]): PipelineStage[] {
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
  }

  /**
   * Calculate leads by source
   */
  private static calculateLeadsBySource(leads: Lead[], opportunities: Opportunity[]): LeadSource[] {
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
  }

  /**
   * Calculate sales performance
   */
  private static async calculateSalesPerformance(opportunities: Opportunity[]): Promise<SalesPerformance[]> {
    try {
      // Group opportunities by assigned user
      const userPerformance = new Map<string, { deals: number; revenue: number }>();
      
      opportunities
        .filter(opp => opp.status === 'won')
        .forEach(opp => {
          if (!userPerformance.has(opp.assignedTo)) {
            userPerformance.set(opp.assignedTo, { deals: 0, revenue: 0 });
          }
          
          const current = userPerformance.get(opp.assignedTo)!;
          current.deals += 1;
          current.revenue += opp.estimatedValue;
        });

      // Get user names and calculate performance
      const performance: SalesPerformance[] = [];
      
      for (const [userId, data] of userPerformance.entries()) {
        // Calculate dynamic target using the new service
        const target = UsersTargetsService.calculateDynamicTarget(data.revenue, data.deals);
        const progress = (data.revenue / target) * 100;
        
        // Format user name using the new service
        const userName = UsersTargetsService.formatUserDisplayName(userId);
        
        performance.push({
          name: userName,
          deals: data.deals,
          revenue: data.revenue,
          target,
          progress: Math.min(progress, 100)
        });
      }

      return performance;
    } catch (error) {
      logger.error('Error calculating sales performance', error instanceof Error ? error : new Error(String(error)));
      return [];
    }
  }

  /**
   * Get revenue for date range
   */
  static async getRevenueForDateRange(startDate: Date, endDate: Date): Promise<number> {
    try {
      const startTimestamp = Timestamp.fromDate(startDate);
      const endTimestamp = Timestamp.fromDate(endDate);
      
      const q = query(
        collection(db, this.COLLECTIONS.opportunities),
        where('status', '==', 'won'),
        where('closedAt', '>=', startTimestamp),
        where('closedAt', '<=', endTimestamp)
      );
      
      const querySnapshot = await getDocs(q);
      let revenue = 0;
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        revenue += data.estimatedValue || 0;
      });

      return revenue;
    } catch (error) {
      logger.error('Error calculating revenue for date range', error instanceof Error ? error : new Error(String(error)));
      return 0;
    }
  }
}