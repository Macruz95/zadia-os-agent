/**
 * ZADIA OS - Product Search Hook
 * 
 * Hook for searching inventory products (raw materials + finished products) for quotes
 * 
 * @module sales/hooks/use-product-search
 */

import { useState, useCallback } from 'react';
import { logger } from '@/lib/logger';
import { RawMaterialsService } from '@/modules/inventory/services/entities/raw-materials-entity.service';
import { FinishedProductsService } from '@/modules/inventory/services/entities/finished-products-entity.service';
import type { RawMaterial, FinishedProduct } from '@/modules/inventory/types/inventory.types';

/**
 * Combined product type for quote items
 */
export interface QuoteProduct {
  id: string;
  name: string;
  description?: string;
  type: 'raw-material' | 'finished-product';
  category: string;
  unitOfMeasure: string;
  unitPrice: number; // unit cost for raw materials, selling price for finished products
  currentStock: number;
  status: string;
}

export interface UseProductSearchReturn {
  products: QuoteProduct[];
  loading: boolean;
  error?: string;
  searchProducts: (query?: string) => Promise<void>;
  clearSearch: () => void;
}

export function useProductSearch(): UseProductSearchReturn {
  const [products, setProducts] = useState<QuoteProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();

  /**
   * Convert RawMaterial to QuoteProduct
   */
  const rawMaterialToQuoteProduct = (rm: RawMaterial): QuoteProduct => ({
    id: rm.id,
    name: rm.name,
    description: rm.description,
    type: 'raw-material',
    category: rm.category,
    unitOfMeasure: rm.unitOfMeasure,
    unitPrice: rm.unitCost,
    currentStock: rm.currentStock,
    status: rm.isActive ? 'Disponible' : 'Inactivo',
  });

  /**
   * Convert FinishedProduct to QuoteProduct
   */
  const finishedProductToQuoteProduct = (fp: FinishedProduct): QuoteProduct => ({
    id: fp.id,
    name: fp.name,
    description: fp.description,
    type: 'finished-product',
    category: fp.category,
    unitOfMeasure: 'unidades', // Finished products are always in units
    unitPrice: fp.sellingPrice,
    currentStock: fp.currentStock,
    status: fp.status,
  });

  /**
   * Search products from inventory (both raw materials and finished products)
   */
  const searchProducts = useCallback(async (query?: string) => {
    try {
      setLoading(true);
      setError(undefined);

      // Search both raw materials and finished products
      const [rawMaterialsResult, finishedProductsResult] = await Promise.all([
        RawMaterialsService.searchRawMaterials({
          query,
        }),
        FinishedProductsService.searchFinishedProducts({
          query,
          filters: { status: 'Disponible' },
        }),
      ]);

      // Convert to QuoteProduct format
      const rawMaterialProducts = rawMaterialsResult.rawMaterials
        .filter((rm) => rm.isActive) // Only active raw materials
        .map(rawMaterialToQuoteProduct);
      const finishedProducts = finishedProductsResult.finishedProducts.map(finishedProductToQuoteProduct);

      // Combine and sort by name
      const allProducts = [...rawMaterialProducts, ...finishedProducts].sort((a, b) =>
        a.name.localeCompare(b.name)
      );

      setProducts(allProducts);
      logger.info('Products searched successfully', {
        metadata: { count: allProducts.length, query },
      });
    } catch (err) {
      const errorMessage = 'Error al buscar productos';
      setError(errorMessage);
      logger.error('Error searching products', err as Error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Clear search results
   */
  const clearSearch = useCallback(() => {
    setProducts([]);
    setError(undefined);
  }, []);

  return {
    products,
    loading,
    error,
    searchProducts,
    clearSearch,
  };
}
