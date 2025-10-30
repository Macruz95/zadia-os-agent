/**
 * ZADIA OS - Labor Cost Service
 * 
 * Service for calculating labor costs from work sessions
 * REGLA #1: Datos reales - Conectado a Firestore
 * REGLA #4: Arquitectura modular
 * REGLA #5: <200 líneas
 */

import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { logger } from '@/lib/logger';

export interface ProjectLaborCost {
  projectId: string;
  totalHours: number;
  totalCost: number;
  billableHours: number;
  billableCost: number;
  nonBillableHours: number;
  nonBillableCost: number;
  sessionsCount: number;
}

export const LaborCostService = {
  /**
   * Calculate labor cost for a specific project
   */
  async calculateProjectCost(projectId: string): Promise<ProjectLaborCost> {
    try {
      const q = query(
        collection(db, 'workSessions'),
        where('projectId', '==', projectId),
        where('status', '==', 'completed')
      );

      const snapshot = await getDocs(q);
      
      const result: ProjectLaborCost = {
        projectId,
        totalHours: 0,
        totalCost: 0,
        billableHours: 0,
        billableCost: 0,
        nonBillableHours: 0,
        nonBillableCost: 0,
        sessionsCount: snapshot.size,
      };

      snapshot.docs.forEach(doc => {
        const session = doc.data();
        const hours = session.durationSeconds / 3600;
        const cost = session.laborCost || 0;

        result.totalHours += hours;
        result.totalCost += cost;

        if (session.isBillable) {
          result.billableHours += hours;
          result.billableCost += cost;
        } else {
          result.nonBillableHours += hours;
          result.nonBillableCost += cost;
        }
      });

      return result;
    } catch (error) {
      logger.error('Error calculating project labor cost', error as Error);
      throw error;
    }
  },

  /**
   * Calculate labor cost for multiple projects
   */
  async calculateMultipleProjectsCost(projectIds: string[]): Promise<Map<string, ProjectLaborCost>> {
    try {
      const results = new Map<string, ProjectLaborCost>();

      await Promise.all(
        projectIds.map(async (projectId) => {
          const cost = await this.calculateProjectCost(projectId);
          results.set(projectId, cost);
        })
      );

      return results;
    } catch (error) {
      logger.error('Error calculating multiple projects cost', error as Error);
      throw error;
    }
  },

  /**
   * Get total labor cost for all projects
   */
  async getTotalLaborCost(): Promise<number> {
    try {
      const q = query(
        collection(db, 'workSessions'),
        where('status', '==', 'completed')
      );

      const snapshot = await getDocs(q);
      
      let total = 0;
      snapshot.docs.forEach(doc => {
        total += doc.data().laborCost || 0;
      });

      return total;
    } catch (error) {
      logger.error('Error calculating total labor cost', error as Error);
      throw error;
    }
  },
};
