/**
 * ZADIA OS - Users & Targets Service
 * 
 * Handles user information and sales targets for better analytics
 */

import { 
  collection, 
  doc, 
  getDoc,
  getDocs,
  setDoc,
  query,
  where,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { logger } from '@/lib/logger';

export interface SalesUser {
  id: string;
  name: string;
  email: string;
  role: 'sales-rep' | 'sales-manager' | 'admin';
  monthlyTarget: number;
  yearlyTarget: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface SalesTarget {
  userId: string;
  period: 'monthly' | 'quarterly' | 'yearly';
  targetValue: number;
  year: number;
  month?: number; // For monthly targets
  quarter?: number; // For quarterly targets
  createdAt: Date;
  updatedAt: Date;
}

const SALES_USERS_COLLECTION = 'sales-users';
const SALES_TARGETS_COLLECTION = 'sales-targets';

export class UsersTargetsService {
  /**
   * Get sales user by ID
   */
  static async getSalesUserById(userId: string): Promise<SalesUser | null> {
    try {
      const docRef = doc(db, SALES_USERS_COLLECTION, userId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        return null;
      }

      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as SalesUser;
    } catch (error) {
      logger.error('Error fetching sales user:', error as Error);
      return null;
    }
  }

  /**
   * Get all active sales users
   */
  static async getActiveSalesUsers(): Promise<SalesUser[]> {
    try {
      const q = query(
        collection(db, SALES_USERS_COLLECTION),
        where('isActive', '==', true)
      );
      
      const querySnapshot = await getDocs(q);
      const users: SalesUser[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        users.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as SalesUser);
      });

      return users;
    } catch (error) {
      logger.error('Error fetching active sales users:', error as Error);
      return [];
    }
  }

  /**
   * Create or update sales user
   */
  static async upsertSalesUser(userId: string, userData: Partial<SalesUser>): Promise<void> {
    try {
      const docRef = doc(db, SALES_USERS_COLLECTION, userId);
      const now = new Date();
      
      const existingUser = await this.getSalesUserById(userId);
      
      const data = {
        ...userData,
        updatedAt: now,
        ...(existingUser ? {} : { createdAt: now }),
      };

      await setDoc(docRef, data, { merge: true });
      logger.info(`Sales user upserted: ${userId}`);
    } catch (error) {
      logger.error('Error upserting sales user:', error as Error);
      throw new Error('Error al actualizar usuario de ventas');
    }
  }

  /**
   * Get user's current monthly target
   */
  static async getUserMonthlyTarget(userId: string, year: number, month: number): Promise<number> {
    try {
      // Try to get specific monthly target first
      const q = query(
        collection(db, SALES_TARGETS_COLLECTION),
        where('userId', '==', userId),
        where('period', '==', 'monthly'),
        where('year', '==', year),
        where('month', '==', month)
      );

      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        return doc.data().targetValue || 0;
      }

      // Fallback to user's default monthly target
      const user = await this.getSalesUserById(userId);
      return user?.monthlyTarget || 50000; // Default fallback
    } catch (error) {
      logger.error('Error getting user monthly target:', error as Error);
      return 50000; // Default fallback
    }
  }

  /**
   * Set user's monthly target
   */
  static async setUserMonthlyTarget(
    userId: string, 
    year: number, 
    month: number, 
    targetValue: number
  ): Promise<void> {
    try {
      const docId = `${userId}_${year}_${month}`;
      const docRef = doc(db, SALES_TARGETS_COLLECTION, docId);
      const now = new Date();

      await setDoc(docRef, {
        userId,
        period: 'monthly',
        targetValue,
        year,
        month,
        updatedAt: now,
        createdAt: now,
      }, { merge: true });

      logger.info(`Monthly target set for user ${userId}: ${targetValue}`);
    } catch (error) {
      logger.error('Error setting monthly target:', error as Error);
      throw new Error('Error al establecer meta mensual');
    }
  }

  /**
   * Calculate dynamic target based on historical performance
   */
  static calculateDynamicTarget(historicalRevenue: number, dealCount: number): number {
    // Base target calculation
    let baseTarget = historicalRevenue > 0 ? historicalRevenue * 1.1 : 50000;
    
    // Adjust based on deal count (more deals = higher confidence in target)
    if (dealCount > 10) {
      baseTarget *= 1.2; // 20% increase for high performers
    } else if (dealCount > 5) {
      baseTarget *= 1.1; // 10% increase for moderate performers
    }
    
    // Round to nearest thousand
    return Math.round(baseTarget / 1000) * 1000;
  }

  /**
   * Get formatted user name for display
   */
  static formatUserDisplayName(userId: string, fallbackName?: string): string {
    if (fallbackName) {
      return fallbackName;
    }
    
    // Extract readable part from userId if possible
    if (userId.includes('@')) {
      return userId.split('@')[0];
    }
    
    if (userId.length > 8) {
      return `Usuario ${userId.slice(0, 8)}`;
    }
    
    return `Usuario ${userId}`;
  }
}