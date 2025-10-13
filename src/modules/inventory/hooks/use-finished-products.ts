/**
 * ZADIA OS - Use Finished Products Hook
 * 
 * Manages finished products state and operations
 */

import { useState, useCallback } from 'react';
import { FinishedProduct } from '../types/inventory.types';
import { FinishedProductFormData } from '../validations/inventory.schema';
import { FinishedProductsService } from '../services/entities/finished-products-entity.service';
import { useAuth } from '@/contexts/AuthContext';
import { logger } from '@/lib/logger';

interface UseFinishedProductsReturn {
  finishedProducts: FinishedProduct[];
  loading: boolean;
  error?: string;
  totalCount: number;
  searchFinishedProducts: () => Promise<void>;
  createFinishedProduct: (data: FinishedProductFormData) => Promise<FinishedProduct>;
  updateFinishedProduct: (id: string, data: Partial<FinishedProductFormData>) => Promise<void>;
  updateStock: (id: string, newStock: number) => Promise<void>;
  updateUnitCost: (id: string, newCost: number) => Promise<void>;
  deleteFinishedProduct: (id: string) => Promise<void>;
  getLowStockProducts: () => Promise<void>;
  refresh: () => Promise<void>;
}

export function useFinishedProducts(): UseFinishedProductsReturn {
  const { user } = useAuth();
  const [finishedProducts, setFinishedProducts] = useState<FinishedProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();
  const [totalCount, setTotalCount] = useState(0);
  const [lastQuery, setLastQuery] = useState<string>('search');

  const searchFinishedProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(undefined);

      const result = await FinishedProductsService.searchFinishedProducts();
      setFinishedProducts(result.finishedProducts);
      setTotalCount(result.totalCount);
      setLastQuery('search');
    } catch (err) {
      const errorMessage = 'Error al buscar productos terminados';
      setError(errorMessage);
      logger.error('Error searching finished products:', err as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  const createFinishedProduct = useCallback(async (
    data: FinishedProductFormData
  ): Promise<FinishedProduct> => {
    try {
      setLoading(true);
      setError(undefined);

      const newProduct = await FinishedProductsService.createFinishedProduct(data, user?.uid || '');
      
      setFinishedProducts(prev => [newProduct, ...prev]);
      setTotalCount(prev => prev + 1);

      return newProduct;
    } catch (err) {
      const errorMessage = 'Error al crear producto terminado';
      setError(errorMessage);
      logger.error('Error creating finished product:', err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  const updateFinishedProduct = useCallback(async (
    id: string,
    data: Partial<FinishedProductFormData>
  ) => {
    try {
      setError(undefined);

      await FinishedProductsService.updateFinishedProduct(id, data, user?.uid || '');
      
      // Refresh data after update
      await searchFinishedProducts();

      logger.info(`Finished product updated: ${id}`);
    } catch (err) {
      const errorMessage = 'Error al actualizar producto terminado';
      setError(errorMessage);
      logger.error('Error updating finished product:', err as Error);
      throw err;
    }
  }, [user?.uid, searchFinishedProducts]);

  const updateStock = useCallback(async (
    id: string,
    newStock: number
  ) => {
    try {
      setError(undefined);

      await FinishedProductsService.updateStock(id, newStock, user?.uid);
      
      setFinishedProducts(prev => prev.map(product => 
        product.id === id ? { ...product, currentStock: newStock } : product
      ));

      logger.info(`Finished product stock updated: ${id}`);
    } catch (err) {
      const errorMessage = 'Error al actualizar stock';
      setError(errorMessage);
      logger.error('Error updating stock:', err as Error);
      throw err;
    }
  }, [user?.uid]);

  const updateUnitCost = useCallback(async (
    id: string,
    newCost: number
  ) => {
    try {
      setError(undefined);

      await FinishedProductsService.updateUnitCost(id, newCost, user?.uid);
      
      setFinishedProducts(prev => prev.map(product => 
        product.id === id ? { ...product, unitCost: newCost } : product
      ));

      logger.info(`Finished product cost updated: ${id}`);
    } catch (err) {
      const errorMessage = 'Error al actualizar costo unitario';
      setError(errorMessage);
      logger.error('Error updating unit cost:', err as Error);
      throw err;
    }
  }, [user?.uid]);

  const deleteFinishedProduct = useCallback(async (id: string) => {
    try {
      setError(undefined);

      await FinishedProductsService.deleteFinishedProduct(id, user?.uid || '');
      
      setFinishedProducts(prev => prev.filter(product => product.id !== id));
      setTotalCount(prev => prev - 1);

      logger.info(`Finished product deleted: ${id}`);
    } catch (err) {
      const errorMessage = 'Error al eliminar producto terminado';
      setError(errorMessage);
      logger.error('Error deleting finished product:', err as Error);
      throw err;
    }
  }, [user?.uid]);

  const getLowStockProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(undefined);

      const result = await FinishedProductsService.getLowStockFinishedProducts();
      setFinishedProducts(result);
      setTotalCount(result.length);
      setLastQuery('lowStock');
    } catch (err) {
      const errorMessage = 'Error al buscar productos con stock bajo';
      setError(errorMessage);
      logger.error('Error getting low stock products:', err as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    switch (lastQuery) {
      case 'lowStock':
        await getLowStockProducts();
        break;
      default:
        await searchFinishedProducts();
    }
  }, [lastQuery, searchFinishedProducts, getLowStockProducts]);

  return {
    finishedProducts,
    loading,
    error,
    totalCount,
    searchFinishedProducts,
    createFinishedProduct,
    updateFinishedProduct,
    updateStock,
    updateUnitCost,
    deleteFinishedProduct,
    getLowStockProducts,
    refresh,
  };
}