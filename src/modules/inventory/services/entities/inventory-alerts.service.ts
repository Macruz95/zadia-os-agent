/**
 * ZADIA OS - Inventory Alerts Service
 * 
 * Handles stock alerts and notifications
 */

import { 
  collection, 
  doc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  Timestamp 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { logger } from '@/lib/logger';
import { InventoryAlert } from '../../types/inventory-extended.types';
import { RawMaterial, FinishedProduct } from '../../types/inventory.types';

const COLLECTION_NAME = 'inventory-alerts';

export class InventoryAlertsService {
  /**
   * Create alert for low stock item
   */
  static async createLowStockAlert(
    item: RawMaterial | FinishedProduct,
    itemType: 'raw-material' | 'finished-product'
  ): Promise<InventoryAlert> {
    try {
      const alertData: Omit<InventoryAlert, 'id'> = {
        itemId: item.id,
        itemType,
        itemName: item.name,
        itemSku: item.sku,
        alertType: item.currentStock === 0 ? 'out-of-stock' : 'low-stock',
        currentStock: item.currentStock,
        minimumStock: item.minimumStock,
        message: item.currentStock === 0 
          ? `${item.name} está agotado` 
          : `${item.name} tiene stock bajo (${item.currentStock}/${item.minimumStock})`,
        priority: item.currentStock === 0 ? 'critical' : 'high',
        isRead: false,
        createdAt: new Date()
      };

      const docRef = await addDoc(collection(db, COLLECTION_NAME), {
        ...alertData,
        createdAt: Timestamp.fromDate(alertData.createdAt)
      });

      const createdAlert: InventoryAlert = {
        ...alertData,
        id: docRef.id
      };

      logger.info(`Stock alert created for item: ${item.name}`);
      return createdAlert;
    } catch (error) {
      logger.error('Error creating stock alert:', error as Error);
      throw new Error('Error al crear alerta de stock');
    }
  }

  /**
   * Check all items for stock alerts
   */
  static async checkStockLevels(
    rawMaterials: RawMaterial[],
    finishedProducts: FinishedProduct[]
  ): Promise<void> {
    try {
      // Check raw materials
      for (const item of rawMaterials) {
        if (item.currentStock <= item.minimumStock) {
          // Check if alert already exists
          const existingAlerts = await this.getActiveAlertsForItem(item.id);
          if (existingAlerts.length === 0) {
            await this.createLowStockAlert(item, 'raw-material');
          }
        }
      }

      // Check finished products
      for (const item of finishedProducts) {
        if (item.currentStock <= item.minimumStock) {
          // Check if alert already exists
          const existingAlerts = await this.getActiveAlertsForItem(item.id);
          if (existingAlerts.length === 0) {
            await this.createLowStockAlert(item, 'finished-product');
          }
        }
      }
    } catch (error) {
      logger.error('Error checking stock levels:', error as Error);
    }
  }

  /**
   * Get active alerts for specific item
   */
  static async getActiveAlertsForItem(itemId: string): Promise<InventoryAlert[]> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where('itemId', '==', itemId),
        where('isRead', '==', false)
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        readAt: doc.data().readAt?.toDate()
      })) as InventoryAlert[];
    } catch (error) {
      logger.error('Error getting alerts for item:', error as Error);
      return [];
    }
  }

  /**
   * Get all unread alerts
   */
  static async getUnreadAlerts(limitCount: number = 50): Promise<InventoryAlert[]> {
    try {
      // Temporalmente usando consulta simple hasta que se creen los índices compuestos
      const q = query(
        collection(db, COLLECTION_NAME),
        where('isRead', '==', false),
        limit(limitCount)
      );

      const querySnapshot = await getDocs(q);
      const alerts = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        readAt: doc.data().readAt?.toDate()
      })) as InventoryAlert[];

      // Ordenar en el cliente temporalmente
      return alerts.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    } catch (error) {
      logger.error('Error getting unread alerts:', error as Error);
      return [];
    }
  }

  /**
   * Mark alert as read
   */
  static async markAlertAsRead(alertId: string, readBy: string): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, alertId);
      await updateDoc(docRef, {
        isRead: true,
        readAt: Timestamp.fromDate(new Date()),
        readBy
      });

      logger.info(`Alert marked as read: ${alertId}`);
    } catch (error) {
      logger.error('Error marking alert as read:', error as Error);
      throw new Error('Error al marcar alerta como leída');
    }
  }

  /**
   * Mark multiple alerts as read
   */
  static async markMultipleAlertsAsRead(alertIds: string[], readBy: string): Promise<void> {
    try {
      const updatePromises = alertIds.map(alertId => 
        updateDoc(doc(db, COLLECTION_NAME, alertId), {
          isRead: true,
          readAt: Timestamp.fromDate(new Date()),
          readBy
        })
      );

      await Promise.all(updatePromises);
      logger.info(`${alertIds.length} alerts marked as read`);
    } catch (error) {
      logger.error('Error marking multiple alerts as read:', error as Error);
      throw new Error('Error al marcar alertas como leídas');
    }
  }

  /**
   * Get alerts by priority
   */
  static async getAlertsByPriority(priority: 'low' | 'medium' | 'high' | 'critical'): Promise<InventoryAlert[]> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where('priority', '==', priority),
        where('isRead', '==', false),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        readAt: doc.data().readAt?.toDate()
      })) as InventoryAlert[];
    } catch (error) {
      logger.error('Error getting alerts by priority:', error as Error);
      return [];
    }
  }
}