/**
 * Sales Performance Analytics Service
 * Handles sales team performance analysis and user metrics
 */

import { Opportunity } from '../types/sales.types';
import { UsersTargetsService } from './users-targets.service';
import { logger } from '@/lib/logger';
import { 
  collection, 
  getDocs, 
  query, 
  where,
  Timestamp 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface SalesPerformance {
  name: string;
  deals: number;
  revenue: number;
  target: number;
  progress: number;
}

export interface TeamMetrics {
  totalTeamRevenue: number;
  totalTeamDeals: number;
  avgPerformance: number;
  topPerformer: string;
  teamTarget: number;
}

export class SalesPerformanceAnalytics {
  /**
   * Calculate sales performance by user
   */
  static async calculateSalesPerformance(opportunities: Opportunity[]): Promise<SalesPerformance[]> {
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

      return performance.sort((a, b) => b.revenue - a.revenue);
    } catch (error) {
      logger.error('Error calculating sales performance:', error as Error);
      return [];
    }
  }

  /**
   * Calculate team metrics
   */
  static calculateTeamMetrics(performance: SalesPerformance[]): TeamMetrics {
    try {
      if (performance.length === 0) {
        return {
          totalTeamRevenue: 0,
          totalTeamDeals: 0,
          avgPerformance: 0,
          topPerformer: 'N/A',
          teamTarget: 0
        };
      }

      const totalTeamRevenue = performance.reduce((sum, p) => sum + p.revenue, 0);
      const totalTeamDeals = performance.reduce((sum, p) => sum + p.deals, 0);
      const avgPerformance = performance.reduce((sum, p) => sum + p.progress, 0) / performance.length;
      const topPerformer = performance[0]?.name || 'N/A';
      const teamTarget = performance.reduce((sum, p) => sum + p.target, 0);

      return {
        totalTeamRevenue,
        totalTeamDeals,
        avgPerformance: Math.round(avgPerformance),
        topPerformer,
        teamTarget
      };
    } catch (error) {
      logger.error('Error calculating team metrics:', error as Error);
      return {
        totalTeamRevenue: 0,
        totalTeamDeals: 0,
        avgPerformance: 0,
        topPerformer: 'N/A',
        teamTarget: 0
      };
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
        collection(db, 'opportunities'),
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
      logger.error('Error calculating revenue for date range:', error as Error);
      return 0;
    }
  }

  /**
   * Calculate quarter-over-quarter growth
   */
  static async calculateQoQGrowth(): Promise<number> {
    try {
      const now = new Date();
      const currentQuarter = Math.floor(now.getMonth() / 3);
      const currentYear = now.getFullYear();
      
      // Current quarter dates
      const currentQuarterStart = new Date(currentYear, currentQuarter * 3, 1);
      const currentQuarterEnd = new Date(currentYear, (currentQuarter + 1) * 3, 0);
      
      // Previous quarter dates
      const prevQuarterStart = new Date(currentYear, (currentQuarter - 1) * 3, 1);
      const prevQuarterEnd = new Date(currentYear, currentQuarter * 3, 0);
      
      const currentRevenue = await this.getRevenueForDateRange(currentQuarterStart, currentQuarterEnd);
      const prevRevenue = await this.getRevenueForDateRange(prevQuarterStart, prevQuarterEnd);
      
      if (prevRevenue === 0) return 0;
      
      return ((currentRevenue - prevRevenue) / prevRevenue) * 100;
    } catch (error) {
      logger.error('Error calculating QoQ growth:', error as Error);
      return 0;
    }
  }
}