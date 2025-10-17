/**
 * ZADIA OS - Use Inventory Alerts Hook
 * 
 * Manages inventory alerts state and operations
 */

import { useState, useEffect, useCallback } from 'react';
import { InventoryAlert } from '../types/inventory-extended.types';
import { RawMaterial, FinishedProduct } from '../types/inventory.types';
import { InventoryAlertsService } from '../services/entities/inventory-alerts.service';
import { logger } from '@/lib/logger';
import { useAuth } from '@/contexts/AuthContext';
import { auth } from '@/lib/firebase';

interface UseInventoryAlertsReturn {
  alerts: InventoryAlert[];
  criticalAlerts: InventoryAlert[];
  highAlerts: InventoryAlert[];
  loading: boolean;
  error?: string;
  totalUnread: number;
  refreshAlerts: () => Promise<void>;
  markAsRead: (alertId: string, readBy: string) => Promise<void>;
  markAllAsRead: (readBy: string) => Promise<void>;
  checkStockLevels: (rawMaterials: RawMaterial[], finishedProducts: FinishedProduct[]) => Promise<void>;
}

export function useInventoryAlerts(): UseInventoryAlertsReturn {
  const { firebaseUser, loading: authLoading } = useAuth();
  const [alerts, setAlerts] = useState<InventoryAlert[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();

  const refreshAlerts = useCallback(async () => {
    // 🔥 CRITICAL: Don't fetch if user is not authenticated
    if (!firebaseUser || authLoading) {
      return;
    }

    // 🔥 CRITICAL: Ensure Firebase Auth token is ready
    try {
      await auth.currentUser?.getIdToken(true); // Force token refresh
      await new Promise(resolve => setTimeout(resolve, 500)); // Wait for token propagation
    } catch {
      // Auth token refresh failed, return early
      return;
    }

    try {
      setLoading(true);
      setError(undefined);
      
      const unreadAlerts = await InventoryAlertsService.getUnreadAlerts(100);
      setAlerts(unreadAlerts);
    } catch (err) {
      const errorMessage = 'Error al cargar alertas de inventario';
      setError(errorMessage);
      logger.error('Error loading inventory alerts:', err as Error);
    } finally {
      setLoading(false);
    }
  }, [firebaseUser, authLoading]);

  const markAsRead = useCallback(async (alertId: string, readBy: string) => {
    try {
      await InventoryAlertsService.markAlertAsRead(alertId, readBy);
      // Update local state
      setAlerts(prev => prev.filter(alert => alert.id !== alertId));
    } catch (err) {
      logger.error('Error marking alert as read:', err as Error);
      throw err;
    }
  }, []);

  const markAllAsRead = useCallback(async (readBy: string) => {
    try {
      const alertIds = alerts.map(alert => alert.id);
      await InventoryAlertsService.markMultipleAlertsAsRead(alertIds, readBy);
      setAlerts([]);
    } catch (err) {
      logger.error('Error marking all alerts as read:', err as Error);
      throw err;
    }
  }, [alerts]);

  const checkStockLevels = useCallback(async (
    rawMaterials: RawMaterial[],
    finishedProducts: FinishedProduct[]
  ) => {
    try {
      await InventoryAlertsService.checkStockLevels(rawMaterials, finishedProducts);
      await refreshAlerts(); // Refresh to get new alerts
    } catch (err) {
      logger.error('Error checking stock levels:', err as Error);
    }
  }, [refreshAlerts]);

  // Derived values
  const criticalAlerts = alerts.filter(alert => alert.priority === 'critical');
  const highAlerts = alerts.filter(alert => alert.priority === 'high');
  const totalUnread = alerts.length;

  // Load alerts on mount
  useEffect(() => {
    refreshAlerts();
  }, [refreshAlerts]);

  return {
    alerts,
    criticalAlerts,
    highAlerts,
    loading,
    error,
    totalUnread,
    refreshAlerts,
    markAsRead,
    markAllAsRead,
    checkStockLevels
  };
}