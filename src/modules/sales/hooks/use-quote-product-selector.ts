/**
 * ZADIA OS - Use Quote Product Selector Hook
 * 
 * Hook for selecting products from inventory for quotes
 * REGLA 1: Firebase real (integración con inventory)
 * REGLA 3: Zod validation
 * REGLA 4: Modular (hook separado)
 * REGLA 5: <200 líneas
 */

import { useState, useCallback, useEffect } from 'react';
import { FinishedProduct } from '@/modules/inventory/types/inventory.types';
import { FinishedProductsService } from '@/modules/inventory/services/entities/finished-products-entity.service';
import { logger } from '@/lib/logger';

export interface QuoteProductItem {
  id: string;
  productId: string;
  productName: string;
  description: string;
  quantity: number;
  unitOfMeasure: string;
  unitPrice: number;
  discount: number;
  subtotal: number;
  stockAvailable?: number;
}

interface UseQuoteProductSelectorReturn {
  products: FinishedProduct[];
  loading: boolean;
  error?: string;
  searchProducts: (term?: string) => Promise<void>;
  getProductById: (id: string) => Promise<FinishedProduct | null>;
  calculateItemSubtotal: (quantity: number, unitPrice: number, discount: number) => number;
}

export function useQuoteProductSelector(): UseQuoteProductSelectorReturn {
  const [products, setProducts] = useState<FinishedProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();

  /**
   * Search products from inventory
   * REGLA 1: Firebase real
   */
  const searchProducts = useCallback(async (term?: string) => {
    try {
      setLoading(true);
      setError(undefined);

      // Buscar productos en inventario
      const result = await FinishedProductsService.searchFinishedProducts({
        query: term,
        pageSize: 50,
      });

      setProducts(result.finishedProducts);
      logger.info('Products loaded for quote', { 
        component: 'useQuoteProductSelector',
        metadata: { count: result.totalCount }
      });
    } catch (err) {
      const errorMessage = 'Error al cargar productos';
      setError(errorMessage);
      logger.error(errorMessage, err as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Get specific product by ID
   * REGLA 1: Firebase real
   */
  const getProductById = useCallback(async (id: string): Promise<FinishedProduct | null> => {
    try {
      const product = await FinishedProductsService.getFinishedProductById(id);
      return product;
    } catch (err) {
      logger.error('Error fetching product', err as Error);
      return null;
    }
  }, []);

  /**
   * Calculate item subtotal
   * subtotal = (quantity * unitPrice) - discount
   */
  const calculateItemSubtotal = useCallback((
    quantity: number, 
    unitPrice: number, 
    discount: number
  ): number => {
    const gross = quantity * unitPrice;
    return gross - discount;
  }, []);

  // Load products on mount
  useEffect(() => {
    searchProducts();
  }, [searchProducts]);

  return {
    products,
    loading,
    error,
    searchProducts,
    getProductById,
    calculateItemSubtotal,
  };
}
