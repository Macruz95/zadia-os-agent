/**
 * ZADIA OS - Bonuses Service
 * 
 * Manages bonuses, gratifications, and aguinaldo for employees
 */

import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { logger } from '@/lib/logger';
import type { Bonus, BonusType } from '../types/hr.types';

const COLLECTION = 'bonuses';

export class BonusesService {
  /**
   * Add a bonus to a work period
   */
  static async addBonus(
    employeeId: string,
    workPeriodId: string,
    type: BonusType,
    amount: number,
    description: string,
    approvedBy: string,
    date: Date = new Date()
  ): Promise<Bonus> {
    try {
      const bonusData = {
        employeeId,
        workPeriodId,
        type,
        amount,
        description,
        date: Timestamp.fromDate(date),
        approvedBy,
        createdAt: Timestamp.now(),
      };

      const docRef = await addDoc(collection(db, COLLECTION), bonusData);

      logger.info('Bonus added', {
        component: 'BonusesService',
        metadata: { bonusId: docRef.id, type, amount },
      });

      return {
        id: docRef.id,
        ...bonusData,
      } as Bonus;
    } catch (error) {
      logger.error('Error adding bonus', error as Error);
      throw error;
    }
  }

  /**
   * Get all bonuses for a work period
   */
  static async getBonusesByPeriod(workPeriodId: string): Promise<Bonus[]> {
    try {
      const q = query(
        collection(db, COLLECTION),
        where('workPeriodId', '==', workPeriodId),
        orderBy('date', 'desc')
      );

      const snapshot = await getDocs(q);

      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Bonus[];
    } catch (error) {
      // Fallback: try without orderBy if index is missing
      if (error instanceof Error && error.message.includes('index')) {
        logger.warn('Bonuses index missing, fetching without order', {
          component: 'BonusesService',
        });
        
        try {
          const q = query(
            collection(db, COLLECTION),
            where('workPeriodId', '==', workPeriodId)
          );
          const snapshot = await getDocs(q);
          const bonuses = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as Bonus[];
          
          // Sort manually
          return bonuses.sort((a, b) => 
            b.date.toDate().getTime() - a.date.toDate().getTime()
          );
        } catch (fallbackError) {
          logger.error('Error getting bonuses (fallback)', fallbackError as Error);
          return [];
        }
      }
      
      logger.error('Error getting bonuses by period', error as Error);
      return [];
    }
  }

  /**
   * Get all bonuses for an employee
   */
  static async getBonusesByEmployee(employeeId: string): Promise<Bonus[]> {
    try {
      const q = query(
        collection(db, COLLECTION),
        where('employeeId', '==', employeeId),
        orderBy('date', 'desc')
      );

      const snapshot = await getDocs(q);

      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Bonus[];
    } catch (error) {
      logger.error('Error getting bonuses by employee', error as Error);
      return [];
    }
  }

  /**
   * Update a bonus
   */
  static async updateBonus(
    bonusId: string,
    data: Partial<Pick<Bonus, 'type' | 'amount' | 'description'>>
  ): Promise<void> {
    try {
      await updateDoc(doc(db, COLLECTION, bonusId), data);

      logger.info('Bonus updated', {
        component: 'BonusesService',
        metadata: { bonusId },
      });
    } catch (error) {
      logger.error('Error updating bonus', error as Error);
      throw error;
    }
  }

  /**
   * Delete a bonus
   */
  static async deleteBonus(bonusId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, COLLECTION, bonusId));

      logger.info('Bonus deleted', {
        component: 'BonusesService',
        metadata: { bonusId },
      });
    } catch (error) {
      logger.error('Error deleting bonus', error as Error);
      throw error;
    }
  }

  /**
   * Calculate total bonuses for a period
   */
  static async calculateTotalBonuses(workPeriodId: string): Promise<number> {
    const bonuses = await this.getBonusesByPeriod(workPeriodId);
    return bonuses.reduce((sum, bonus) => sum + bonus.amount, 0);
  }
}
