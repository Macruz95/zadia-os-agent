/**
 * ZADIA OS - Inventory KPIs Service
 * 
 * Calculates inventory key performance indicators
 */

import { collection, getDocs, query, orderBy, limit, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { logger } from '@/lib/logger';
import { InventoryKPIs } from '../../types/inventory-extended.types';
import { RawMaterial, FinishedProduct, InventoryMovement } from '../../types/inventory.types';

export class InventoryKPIsService {
  /**
   * Calculate comprehensive inventory KPIs
   */
  static calculateInventoryKPIs(
    rawMaterials: RawMaterial[],
    finishedProducts: FinishedProduct[]
  ): InventoryKPIs {
    try {
      // Calculate total inventory value (safely)
      const rawMaterialsValue = rawMaterials.reduce((sum, item) => {
        const stock = typeof item.currentStock === 'number' ? item.currentStock : 0;
        const cost = typeof item.unitCost === 'number' ? item.unitCost : 0;
        return sum + (stock * cost);
      }, 0);
      
      const finishedProductsValue = finishedProducts.reduce((sum, item) => {
        const stock = typeof item.currentStock === 'number' ? item.currentStock : 0;
        const cost = typeof item.totalCost === 'number' ? item.totalCost : 0;
        return sum + (stock * cost);
      }, 0);
      
      const totalInventoryValue = rawMaterialsValue + finishedProductsValue;
      
      // Calculate low stock items (safely)
      const lowStockRawMaterials = rawMaterials.filter(item => {
        const current = typeof item.currentStock === 'number' ? item.currentStock : 0;
        const minimum = typeof item.minimumStock === 'number' ? item.minimumStock : 0;
        return current <= minimum;
      });
      
      const lowStockFinishedProducts = finishedProducts.filter(item => {
        const current = typeof item.currentStock === 'number' ? item.currentStock : 0;
        const minimum = typeof item.minimumStock === 'number' ? item.minimumStock : 0;
        return current <= minimum;
      });
      
      const lowStockItems = lowStockRawMaterials.length + lowStockFinishedProducts.length;
      
      // Return basic KPIs without complex calculations
      return {
        totalRawMaterials: rawMaterials.length,
        totalFinishedProducts: finishedProducts.length,
        lowStockItems,
        totalInventoryValue: Math.round(totalInventoryValue * 100) / 100, // Round to 2 decimals
        topMovingItems: [], // Empty for now
        recentMovements: [] // Empty for now
      };
    } catch (error) {
      logger.error('Error calculating inventory KPIs:', error as Error);
      // Return default values instead of throwing
      return {
        totalRawMaterials: 0,
        totalFinishedProducts: 0,
        lowStockItems: 0,
        totalInventoryValue: 0,
        topMovingItems: [],
        recentMovements: []
      };
    }
  }

  /**
   * Get recent inventory movements
   */
  private static async getRecentMovements(limitCount: number): Promise<InventoryMovement[]> {
    try {
      const q = query(
        collection(db, 'inventory-movements'),
        orderBy('performedAt', 'desc'),
        limit(limitCount)
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        performedAt: doc.data().performedAt?.toDate() || new Date()
      })) as InventoryMovement[];
    } catch (error) {
      logger.error('Error getting recent movements:', error as Error);
      return [];
    }
  }

  /**
   * Calculate top moving items based on movement frequency
   */
  private static async calculateTopMovingItems(): Promise<Array<{
    itemId: string;
    itemName: string;
    itemType: 'raw-material' | 'finished-product';
    movementCount: number;
  }>> {
    try {
      // Get all movements from last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const q = query(
        collection(db, 'inventory-movements'),
        where('performedAt', '>=', thirtyDaysAgo),
        orderBy('performedAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const movements = querySnapshot.docs.map(doc => doc.data()) as InventoryMovement[];

      // Count movements per item
      const movementCounts = new Map<string, {
        itemName: string;
        itemType: 'raw-material' | 'finished-product';
        count: number;
      }>();

      movements.forEach(movement => {
        const key = movement.itemId;
        const existing = movementCounts.get(key);
        
        if (existing) {
          existing.count++;
        } else {
          movementCounts.set(key, {
            itemName: movement.itemName,
            itemType: movement.itemType,
            count: 1
          });
        }
      });

      // Convert to array and sort by count
      const topItems = Array.from(movementCounts.entries())
        .map(([itemId, data]) => ({
          itemId,
          itemName: data.itemName,
          itemType: data.itemType,
          movementCount: data.count
        }))
        .sort((a, b) => b.movementCount - a.movementCount)
        .slice(0, 5); // Top 5

      return topItems;
    } catch (error) {
      logger.error('Error calculating top moving items:', error as Error);
      return [];
    }
  }

  /**
   * Calculate inventory turnover ratio
   */
  static async calculateInventoryTurnover(
    rawMaterials: RawMaterial[],
    finishedProducts: FinishedProduct[]
  ): Promise<{
    rawMaterialsTurnover: number;
    finishedProductsTurnover: number;
    overallTurnover: number;
  }> {
    try {
      // Get movements from last 12 months
      const twelveMonthsAgo = new Date();
      twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

      const q = query(
        collection(db, 'inventory-movements'),
        where('performedAt', '>=', twelveMonthsAgo),
        where('movementType', 'in', ['Salida', 'Venta', 'Produccion'])
      );

      const querySnapshot = await getDocs(q);
      const outboundMovements = querySnapshot.docs.map(doc => doc.data()) as InventoryMovement[];

      // Calculate COGS (Cost of Goods Sold)
      const rawMaterialsCOGS = outboundMovements
        .filter(m => m.itemType === 'raw-material')
        .reduce((sum, m) => sum + m.totalCost, 0);

      const finishedProductsCOGS = outboundMovements
        .filter(m => m.itemType === 'finished-product')
        .reduce((sum, m) => sum + m.totalCost, 0);

      // Calculate average inventory value
      const avgRawMaterialsValue = rawMaterials.reduce(
        (sum, item) => sum + (item.currentStock * item.unitCost), 0
      ) / 2; // Simplified: current value / 2

      const avgFinishedProductsValue = finishedProducts.reduce(
        (sum, item) => sum + (item.currentStock * item.totalCost), 0
      ) / 2; // Simplified: current value / 2

      // Calculate turnover ratios
      const rawMaterialsTurnover = avgRawMaterialsValue > 0 
        ? rawMaterialsCOGS / avgRawMaterialsValue 
        : 0;

      const finishedProductsTurnover = avgFinishedProductsValue > 0 
        ? finishedProductsCOGS / avgFinishedProductsValue 
        : 0;

      const overallTurnover = (avgRawMaterialsValue + avgFinishedProductsValue) > 0 
        ? (rawMaterialsCOGS + finishedProductsCOGS) / (avgRawMaterialsValue + avgFinishedProductsValue) 
        : 0;

      return {
        rawMaterialsTurnover,
        finishedProductsTurnover,
        overallTurnover
      };
    } catch (error) {
      logger.error('Error calculating inventory turnover:', error as Error);
      return {
        rawMaterialsTurnover: 0,
        finishedProductsTurnover: 0,
        overallTurnover: 0
      };
    }
  }

  /**
   * Get inventory value by category
   */
  static calculateInventoryValueByCategory(
    rawMaterials: RawMaterial[],
    finishedProducts: FinishedProduct[]
  ): {
    rawMaterialsByCategory: Record<string, number>;
    finishedProductsByCategory: Record<string, number>;
  } {
    const rawMaterialsByCategory: Record<string, number> = {};
    const finishedProductsByCategory: Record<string, number> = {};

    // Raw materials by category
    rawMaterials.forEach(item => {
      const value = item.currentStock * item.unitCost;
      rawMaterialsByCategory[item.category] = 
        (rawMaterialsByCategory[item.category] || 0) + value;
    });

    // Finished products by category
    finishedProducts.forEach(item => {
      const value = item.currentStock * item.totalCost;
      finishedProductsByCategory[item.category] = 
        (finishedProductsByCategory[item.category] || 0) + value;
    });

    return {
      rawMaterialsByCategory,
      finishedProductsByCategory
    };
  }
}