/**
 * ZADIA OS - Inventory Utilities
 * 
 * Business logic and helper functions for inventory management
 */

import { RawMaterialCategory, FinishedProductCategory, UnitOfMeasure, ProductStatus, MovementType } from '../types/inventory.types';

/**
 * Formatting utilities
 */
export const inventoryUtils = {
  /**
   * Format quantity with unit of measure
   */
  formatQuantity: (quantity: number, unit: UnitOfMeasure): string => {
    const formatted = new Intl.NumberFormat('es-GT', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(quantity);
    
    return `${formatted} ${unit}`;
  },

  /**
   * Format unit cost with currency
   */
  formatUnitCost: (cost: number, currency: string = 'GTQ'): string => {
    return new Intl.NumberFormat('es-GT', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2
    }).format(cost);
  },

  /**
   * Calculate total value
   */
  calculateTotalValue: (quantity: number, unitCost: number): number => {
    return quantity * unitCost;
  },

  /**
   * Format total value with currency
   */
  formatTotalValue: (quantity: number, unitCost: number, currency: string = 'GTQ'): string => {
    const total = inventoryUtils.calculateTotalValue(quantity, unitCost);
    return inventoryUtils.formatUnitCost(total, currency);
  },

  /**
   * Get status color for inventory status
   */
  getStatusColor: (status: ProductStatus): string => {
    const statusColors = {
      'Disponible': 'green',
      'Reservado': 'blue',
      'Vendido': 'gray',
      'FueraDeCatalogo': 'red',
      'EnProduccion': 'yellow'
    };
    
    return statusColors[status] || 'gray';
  },

  /**
   * Get movement type color
   */
  getMovementTypeColor: (type: MovementType): string => {
    const typeColors = {
      'Entrada': 'green',
      'Salida': 'red',
      'Ajuste': 'yellow',
      'Merma': 'orange',
      'Produccion': 'blue',
      'Venta': 'purple',
      'Devolucion': 'cyan'
    };
    
    return typeColors[type] || 'gray';
  },

  /**
   * Get category icon for raw materials
   */
  getRawMaterialCategoryIcon: (category: RawMaterialCategory): string => {
    const categoryIcons = {
      'Maderas': '🪵',
      'Acabados': '✨',
      'Adhesivos': '🧴',
      'Herrajes': '🔩',
      'Químicos': '⚗️',
      'Textiles': '🧵',
      'Herramientas': '🔨',
      'Otros': '📦'
    };
    
    return categoryIcons[category] || '📦';
  },

  /**
   * Get category icon for finished products
   */
  getFinishedProductCategoryIcon: (category: FinishedProductCategory): string => {
    const categoryIcons = {
      'Dormitorio': '🛏️',
      'Oficina': '🏢',
      'Sala': '🛋️',
      'Cocina': '🍳',
      'Comedor': '🍽️',
      'Baño': '🚿',
      'Infantil': '🧸',
      'Exterior': '🌳',
      'Otros': '🪑'
    };
    
    return categoryIcons[category] || '🪑';
  },

  /**
   * Check if stock is low
   */
  isLowStock: (currentStock: number, minStock: number): boolean => {
    return currentStock <= minStock;
  },

  /**
   * Check if stock is critical (below 25% of minimum)
   */
  isCriticalStock: (currentStock: number, minStock: number): boolean => {
    return currentStock <= (minStock * 0.25);
  },

  /**
   * Calculate stock percentage
   */
  calculateStockPercentage: (currentStock: number, maxStock: number): number => {
    if (maxStock === 0) return 0;
    return Math.min((currentStock / maxStock) * 100, 100);
  },

  /**
   * Generate SKU for products
   */
  generateSKU: (category: string, name: string): string => {
    const categoryPrefix = category.substring(0, 3).toUpperCase();
    const namePrefix = name.replace(/\s+/g, '').substring(0, 6).toUpperCase();
    const timestamp = Date.now().toString().slice(-4);
    
    return `${categoryPrefix}-${namePrefix}-${timestamp}`;
  },

  /**
   * Validate quantity input
   */
  validateQuantity: (quantity: number, unit: UnitOfMeasure): boolean => {
    if (quantity < 0) return false;
    
    // Check decimal places based on unit
    const integerOnlyUnits = ['unidades'];
    if (integerOnlyUnits.includes(unit) && !Number.isInteger(quantity)) {
      return false;
    }
    
    return true;
  },

  /**
   * Format date for inventory records
   */
  formatInventoryDate: (date: Date): string => {
    return new Intl.DateTimeFormat('es-GT', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  },

  /**
   * Calculate days between dates
   */
  calculateDaysBetween: (startDate: Date, endDate: Date): number => {
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  },

  /**
   * Search filter for products
   */
  searchProducts: <T extends { name: string; sku?: string; description?: string }>(
    products: T[],
    searchTerm: string
  ): T[] => {
    if (!searchTerm.trim()) return products;
    
    const term = searchTerm.toLowerCase();
    return products.filter(product => 
      product.name.toLowerCase().includes(term) ||
      product.sku?.toLowerCase().includes(term) ||
      product.description?.toLowerCase().includes(term)
    );
  }
};

/**
 * Stock level calculations
 */
export const stockCalculations = {
  /**
   * Calculate reorder point
   */
  calculateReorderPoint: (averageDemand: number, leadTimeDays: number, safetyStock: number): number => {
    return (averageDemand * leadTimeDays) + safetyStock;
  },

  /**
   * Calculate economic order quantity (EOQ)
   */
  calculateEOQ: (annualDemand: number, orderingCost: number, holdingCost: number): number => {
    return Math.sqrt((2 * annualDemand * orderingCost) / holdingCost);
  },

  /**
   * Calculate inventory turnover ratio
   */
  calculateTurnoverRatio: (costOfGoodsSold: number, averageInventoryValue: number): number => {
    if (averageInventoryValue === 0) return 0;
    return costOfGoodsSold / averageInventoryValue;
  }
};