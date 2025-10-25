/**
 * ZADIA OS - Quote Calculator Step
 * 
 * Step in quote wizard for financial calculations
 * Rule #2: ShadCN UI + Lucide React icons only
 * Rule #5: Max 200 lines per file
 * 
 * @module QuoteCalculatorStep
 */

'use client';

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useQuoteFinancialCalculator } from '../../hooks/use-quote-financial-calculator';
import {
  MaterialSelector,
  MaterialsList,
  LaborCostInput,
  AdditionalCostsConfig,
  CommercialMarginSlider,
  FinancialSummary,
} from './calculator';
import type { QuoteItem } from '../../types/sales.types';
import { 
  RawMaterialsService,
  FinishedProductsService 
} from '@/modules/inventory/services/inventory.service';

interface InventoryItem {
  id: string;
  name: string;
  unitPrice: number;
  unit: string;
  availableQuantity?: number;
}

interface QuoteCalculatorStepProps {
  /** Callback when items are updated from calculator */
  onItemsChange: (items: Omit<QuoteItem, 'id'>[]) => void;
  
  /** Currency for the quote */
  currency?: string;
}

/**
 * Quote calculator step component
 * Provides financial calculator interface for creating quotes
 */
export function QuoteCalculatorStep({
  onItemsChange,
  currency = 'USD',
}: QuoteCalculatorStepProps) {
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [isLoadingInventory, setIsLoadingInventory] = useState(true);

  const calculator = useQuoteFinancialCalculator({
    initialHourlyRate: 3.75,
    initialCommercialMargin: 30,
    initialTaxRate: 13,
  });

  // Load inventory materials
  useEffect(() => {
    const loadInventory = async () => {
      try {
        setIsLoadingInventory(true);
        // Load raw materials and finished products
        const [rawMaterialsData, productsData] = await Promise.all([
          RawMaterialsService.searchRawMaterials({}),
          FinishedProductsService.searchFinishedProducts({}),
        ]);

        const allItems: InventoryItem[] = [
          ...rawMaterialsData.rawMaterials.map((item) => ({
            id: item.id,
            name: item.name,
            unitPrice: item.unitCost || 0,
            unit: item.unitOfMeasure || 'Unidad',
            availableQuantity: item.currentStock || 0,
          })),
          ...productsData.finishedProducts.map((item) => ({
            id: item.id,
            name: item.name,
            unitPrice: item.sellingPrice || 0,
            unit: 'Unidad',
            availableQuantity: item.currentStock || 0,
          })),
        ];

        setInventoryItems(allItems);
      } catch {
        // Error is silently caught - inventory will be empty
      } finally {
        setIsLoadingInventory(false);
      }
    };

    loadInventory();
  }, []);

  // Sync calculator materials to quote items whenever they change
  useEffect(() => {
    const quoteItems: Omit<QuoteItem, 'id'>[] = calculator.state.materials.map((material) => ({
      productId: material.id,
      description: material.name,
      quantity: material.quantity,
      unitOfMeasure: material.unit,
      unitPrice: material.unitPrice,
      discount: 0,
      subtotal: material.subtotal,
    }));

    // Add labor as a service item if hours > 0
    if (calculator.state.labor.hours > 0) {
      quoteItems.unshift({
        productId: undefined,
        description: `Mano de Obra (${calculator.state.labor.hours} horas @ $${calculator.state.labor.hourlyRate}/hr)`,
        quantity: calculator.state.labor.hours,
        unitOfMeasure: 'Hora',
        unitPrice: calculator.state.labor.hourlyRate,
        discount: 0,
        subtotal: calculator.state.labor.total,
      });
    }

    // Add additional costs as a line item if > 0
    if (calculator.breakdown.additionalCosts > 0) {
      quoteItems.push({
        productId: undefined,
        description: 'Costos Adicionales (Desgaste, Mantenimiento, Logística)',
        quantity: 1,
        unitOfMeasure: 'Servicio',
        unitPrice: calculator.breakdown.additionalCosts,
        discount: 0,
        subtotal: calculator.breakdown.additionalCosts,
      });
    }

    onItemsChange(quoteItems);
  }, [
    calculator.state.materials,
    calculator.state.labor,
    calculator.breakdown.additionalCosts,
    // onItemsChange is intentionally excluded to prevent infinite loops
    // It's a callback from parent and recreated on every render
  ]);

  if (isLoadingInventory) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-3 text-gray-600">Cargando inventario...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 py-4">
      {/* Labor Cost */}
      <LaborCostInput
        labor={calculator.state.labor}
        onChange={calculator.updateLabor}
      />

      {/* Material Selection */}
      <div className="space-y-4">
        <MaterialSelector
          onAddMaterial={calculator.addMaterial}
          inventoryItems={inventoryItems}
          isLoading={isLoadingInventory}
        />

        <MaterialsList
          materials={calculator.state.materials}
          onUpdateQuantity={calculator.updateMaterialQuantity}
          onRemove={calculator.removeMaterial}
        />
      </div>

      {/* Additional Costs */}
      <AdditionalCostsConfig
        config={calculator.state.additionalCosts}
        onChange={calculator.updateAdditionalCosts}
        baseCost={calculator.breakdown.baseProductionCost}
        total={calculator.breakdown.additionalCosts}
      />

      {/* Commercial Margin */}
      <CommercialMarginSlider
        value={calculator.state.commercialMargin}
        onChange={calculator.setCommercialMargin}
        productionCost={calculator.breakdown.totalProductionCost}
        grossProfit={calculator.breakdown.grossProfit}
      />

      {/* Financial Summary */}
      <FinancialSummary
        breakdown={calculator.breakdown}
        currency={currency}
        showDetails={true}
      />

      {/* Info Message */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>💡 Nota:</strong> Los items calculados se agregarán automáticamente 
          a la cotización. Puede revisarlos en el siguiente paso antes de guardar.
        </p>
      </div>
    </div>
  );
}
