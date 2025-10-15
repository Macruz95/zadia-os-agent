'use client';

import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { BillOfMaterialsSchema, BillOfMaterialsFormData } from '../../validations/inventory.schema';
import { RawMaterial } from '../../types/inventory.types';
import { RawMaterialsService } from '../../services/entities/raw-materials-entity.service';
import { logger } from '@/lib/logger';
import { BOMHeader } from './BOMHeader';
import { BOMBasicInfo } from './BOMBasicInfo';
import { BOMItemsList } from './BOMItemsList';
import { BOMCostSummary } from './BOMCostSummary';
import { BOMActions } from './BOMActions';

interface BOMBuilderProps {
  finishedProductId: string;
  finishedProductName: string;
  initialData?: Partial<BillOfMaterialsFormData>;
  onSave: (data: BillOfMaterialsFormData) => Promise<void>;
  onCancel: () => void;
}

export function BOMBuilder({ 
  finishedProductId, 
  finishedProductName, 
  initialData, 
  onSave, 
  onCancel 
}: BOMBuilderProps) {
  const [rawMaterials, setRawMaterials] = useState<RawMaterial[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMaterials, setLoadingMaterials] = useState(true);

  const form = useForm<BillOfMaterialsFormData>({
    resolver: zodResolver(BillOfMaterialsSchema),
    defaultValues: {
      finishedProductId,
      finishedProductName,
      version: 1,
      items: [],
      estimatedLaborHours: 0,
      laborCostPerHour: 0,
      overheadPercentage: 0,
      notes: '',
      ...initialData
    }
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'items'
  });

  // Load raw materials on mount
  useEffect(() => {
    const loadRawMaterials = async () => {
      try {
        const materialsResult = await RawMaterialsService.getAllRawMaterials();
        setRawMaterials(materialsResult.rawMaterials.filter((m: RawMaterial) => m.isActive));
      } catch (error) {
        logger.error('Error loading raw materials:', error as Error);
      } finally {
        setLoadingMaterials(false);
      }
    };

    loadRawMaterials();
  }, []);

  // Watch form values for calculations
  const watchedItems = form.watch('items');
  const watchedLaborHours = form.watch('estimatedLaborHours');
  const watchedLaborCostPerHour = form.watch('laborCostPerHour');
  const watchedOverheadPercentage = form.watch('overheadPercentage');

  // Calculate totals
  const totalMaterialCost = watchedItems?.reduce((sum, item) => {
    const material = rawMaterials.find(m => m.id === item.rawMaterialId);
    const unitCost = material?.unitCost || 0;
    return sum + (item.quantity * unitCost);
  }, 0) || 0;

  const totalLaborCost = (watchedLaborHours || 0) * (watchedLaborCostPerHour || 0);
  const totalOverheadCost = totalMaterialCost * ((watchedOverheadPercentage || 0) / 100);
  const totalCost = totalMaterialCost + totalLaborCost + totalOverheadCost;

  const handleMaterialSelect = (itemIndex: number, materialId: string) => {
    const material = rawMaterials.find(m => m.id === materialId);
    if (material) {
      form.setValue(`items.${itemIndex}.rawMaterialId`, materialId);
      form.setValue(`items.${itemIndex}.rawMaterialName`, material.name);
      form.setValue(`items.${itemIndex}.unitCost`, material.unitCost);
      // Only set unit of measure if it matches the allowed values
      const allowedUnits = ['unidades', 'kg', 'g', 'litros', 'ml', 'm3', 'm2', 'm', 'cm', 'pies'] as const;
      type AllowedUnit = typeof allowedUnits[number];
      if (allowedUnits.includes(material.unitOfMeasure as AllowedUnit)) {
        form.setValue(`items.${itemIndex}.unitOfMeasure`, material.unitOfMeasure as AllowedUnit);
      }
    }
  };

  const onSubmit = async (data: BillOfMaterialsFormData) => {
    try {
      setLoading(true);
      await onSave(data);
    } catch (error) {
      logger.error('Error saving BOM:', error as Error);
    } finally {
      setLoading(false);
    }
  };

  if (loadingMaterials) {
    return (
      <Card>
        <CardContent>
          <div className="space-y-3 py-8">
            <div className="text-center">Cargando materiales...</div>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <BOMHeader finishedProductName={finishedProductName} />
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <BOMBasicInfo control={form.control} />

              <BOMItemsList
                control={form.control}
                fields={fields}
                append={append}
                remove={remove}
                rawMaterials={rawMaterials}
                watchedItems={watchedItems}
                onMaterialSelect={handleMaterialSelect}
              />

              {/* Notes */}
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notas</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Instrucciones especiales, observaciones..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <BOMCostSummary
                totalMaterialCost={totalMaterialCost}
                totalLaborCost={totalLaborCost}
                totalOverheadCost={totalOverheadCost}
                totalCost={totalCost}
              />

              <BOMActions
                onCancel={onCancel}
                loading={loading}
                hasItems={fields.length > 0}
              />
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}