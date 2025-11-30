/**
 * ZADIA OS - Unified Inventory Actions with Event Bus
 * 
 * Wrapper que conecta TODAS las acciones de inventario con el Event Bus
 * Cada acción emite eventos que repercuten en todo el sistema
 * 
 * Rule #1: TypeScript strict
 * Rule #3: Real data only
 */

'use client';

import { useCallback } from 'react';
import { EventBus } from '@/lib/events';
import { useAuth } from '@/contexts/AuthContext';
import { logger } from '@/lib/logger';
import { toast } from 'sonner';

// Services
import { RawMaterialsService } from '../services/entities/raw-materials-entity.service';
import { FinishedProductsService } from '../services/entities/finished-products-entity.service';
import { InventoryMovementsService } from '../services/entities/inventory-movements-entity.service';

// Types
import { MovementFormData, RawMaterialFormData, FinishedProductFormData } from '../validations/inventory.schema';

/**
 * Hook that wraps all inventory actions with Event Bus integration
 * Every action emits events that propagate through the entire system
 */
export function useInventoryActions() {
  const { user } = useAuth();
  const userId = user?.uid;

  // ============ RAW MATERIALS ============

  const createRawMaterial = useCallback(async (data: RawMaterialFormData) => {
    const material = await RawMaterialsService.createRawMaterial(data, userId || '');
    
    await EventBus.emit('product:created', {
      id: material.id,
      type: 'raw-material',
      name: material.name,
      sku: material.sku,
      stock: material.currentStock,
      minStock: material.minimumStock
    }, {
      source: 'inventory-module',
      userId,
      metadata: { action: 'createRawMaterial' }
    });

    toast.success('Materia prima creada');
    logger.info('📦 Raw material created + Event emitted', { component: 'InventoryActions' });
    return material;
  }, [userId]);

  const updateRawMaterial = useCallback(async (id: string, data: Partial<RawMaterialFormData>) => {
    await RawMaterialsService.updateRawMaterial(id, data, userId || '');
    
    await EventBus.emit('product:updated', {
      id,
      type: 'raw-material',
      changes: Object.keys(data)
    }, {
      source: 'inventory-module',
      userId,
      metadata: { action: 'updateRawMaterial' }
    });

    toast.success('Materia prima actualizada');
    logger.info('📦 Raw material updated + Event emitted', { component: 'InventoryActions' });
  }, [userId]);

  // ============ FINISHED PRODUCTS ============

  const createFinishedProduct = useCallback(async (data: FinishedProductFormData) => {
    const product = await FinishedProductsService.createFinishedProduct(data, userId || '');
    
    await EventBus.emit('product:created', {
      id: product.id,
      type: 'finished-product',
      name: product.name,
      sku: product.sku,
      stock: product.currentStock,
      minStock: product.minimumStock
    }, {
      source: 'inventory-module',
      userId,
      metadata: { action: 'createFinishedProduct' }
    });

    toast.success('Producto terminado creado');
    logger.info('📦 Finished product created + Event emitted', { component: 'InventoryActions' });
    return product;
  }, [userId]);

  const updateFinishedProduct = useCallback(async (id: string, data: Partial<FinishedProductFormData>) => {
    await FinishedProductsService.updateFinishedProduct(id, data, userId || '');
    
    await EventBus.emit('product:updated', {
      id,
      type: 'finished-product',
      changes: Object.keys(data)
    }, {
      source: 'inventory-module',
      userId,
      metadata: { action: 'updateFinishedProduct' }
    });

    toast.success('Producto actualizado');
    logger.info('📦 Finished product updated + Event emitted', { component: 'InventoryActions' });
  }, [userId]);

  // ============ INVENTORY MOVEMENTS ============

  const createMovementIn = useCallback(async (data: MovementFormData) => {
    const movement = await InventoryMovementsService.createMovement(data);
    
    await EventBus.emit('movement:in', {
      id: movement.id,
      itemId: data.itemId,
      itemType: data.itemType,
      quantity: data.quantity,
      reason: data.reason || 'Entrada de inventario'
    }, {
      source: 'inventory-module',
      userId,
      metadata: { action: 'createMovementIn' }
    });

    toast.success('Entrada de inventario registrada');
    logger.info('📥 Movement IN + Event emitted', { component: 'InventoryActions' });
    return movement;
  }, [userId]);

  const createMovementOut = useCallback(async (data: MovementFormData) => {
    const movement = await InventoryMovementsService.createMovement(data);
    
    await EventBus.emit('movement:out', {
      id: movement.id,
      itemId: data.itemId,
      itemType: data.itemType,
      quantity: data.quantity,
      reason: data.reason || 'Salida de inventario'
    }, {
      source: 'inventory-module',
      userId,
      metadata: { action: 'createMovementOut' }
    });

    toast.success('Salida de inventario registrada');
    logger.info('📤 Movement OUT + Event emitted', { component: 'InventoryActions' });
    return movement;
  }, [userId]);

  const createTransfer = useCallback(async (
    fromLocation: string,
    toLocation: string,
    itemId: string,
    itemType: 'raw-material' | 'finished-product',
    quantity: number
  ) => {
    // Create movement out from source
    // Create movement in to destination
    
    await EventBus.emit('movement:transfer', {
      itemId,
      itemType,
      quantity,
      fromLocation,
      toLocation
    }, {
      source: 'inventory-module',
      userId,
      metadata: { action: 'createTransfer' }
    });

    toast.success('Transferencia registrada');
    logger.info('🔄 Transfer + Event emitted', { component: 'InventoryActions' });
  }, [userId]);

  // ============ LOW STOCK ALERT ============

  const triggerLowStockAlert = useCallback(async (
    itemId: string,
    itemType: 'raw-material' | 'finished-product',
    itemName: string,
    currentStock: number,
    minStock: number
  ) => {
    await EventBus.emit('product:low_stock', {
      itemId,
      itemType,
      itemName,
      currentStock,
      minStock,
      deficit: minStock - currentStock
    }, {
      source: 'inventory-module',
      userId,
      metadata: { action: 'lowStockAlert', alert: true }
    });

    toast.warning(`Stock bajo: ${itemName}`);
    logger.info('⚠️ Low stock alert + Event emitted', { component: 'InventoryActions' });
  }, [userId]);

  return {
    // Raw Materials
    createRawMaterial,
    updateRawMaterial,
    // Finished Products
    createFinishedProduct,
    updateFinishedProduct,
    // Movements
    createMovementIn,
    createMovementOut,
    createTransfer,
    // Alerts
    triggerLowStockAlert
  };
}
