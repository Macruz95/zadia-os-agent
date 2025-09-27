'use client';

import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, Trash2, Calculator, Package, AlertTriangle } from 'lucide-react';
import { BillOfMaterialsSchema, BillOfMaterialsFormData } from '../../validations/inventory.schema';
import { RawMaterial } from '../../types/inventory.types';
import { getAllRawMaterials } from '../../services/inventory.service';
import { logger } from '@/lib/logger';

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
        const materialsResult = await getAllRawMaterials();
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

  const handleAddItem = () => {
    append({
      rawMaterialId: '',
      rawMaterialName: '',
      quantity: 0,
      unitOfMeasure: 'unidades',
      unitCost: 0
    });
  };

  const handleRemoveItem = (index: number) => {
    remove(index);
  };

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

  const getItemCost = (item: { rawMaterialId?: string; quantity?: number }) => {
    const material = rawMaterials.find(m => m.id === item.rawMaterialId);
    return material && item.quantity ? item.quantity * material.unitCost : 0;
  };

  const getMaterialStock = (materialId: string) => {
    const material = rawMaterials.find(m => m.id === materialId);
    return material?.currentStock || 0;
  };

  const isStockSufficient = (materialId: string, requiredQuantity: number) => {
    return getMaterialStock(materialId) >= requiredQuantity;
  };

  if (loadingMaterials) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Cargando materiales...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
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
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Lista de Materiales (BOM)
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Producto: {finishedProductName}
          </p>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="version"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Versión *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          step="1"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="estimatedLaborHours"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Horas de Trabajo Estimadas *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          step="0.5"
                          placeholder="0"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="laborCostPerHour"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Costo por Hora de Trabajo *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="0.00"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="overheadPercentage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gastos Indirectos (%) *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          step="0.01"
                          placeholder="0"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Materials List */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-medium">Materiales Requeridos</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddItem}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar Material
                  </Button>
                </div>

                {fields.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No hay materiales agregados</p>
                    <p className="text-sm">Haz clic en &quot;Agregar Material&quot; para comenzar</p>
                  </div>
                ) : (
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-3">
                      {fields.map((field, index) => {
                        const item = watchedItems?.[index];
                        const material = rawMaterials.find(m => m.id === item?.rawMaterialId);
                        const itemCost = getItemCost(item);
                        const stockSufficient = item?.rawMaterialId ? 
                          isStockSufficient(item.rawMaterialId, item.quantity) : true;

                        return (
                          <Card key={field.id} className="p-4">
                            <div className="space-y-4">
                              <div className="flex items-center justify-between">
                                <h4 className="font-medium">Material {index + 1}</h4>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleRemoveItem(index)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>

                              <div className="grid grid-cols-3 gap-4">
                                <FormField
                                  control={form.control}
                                  name={`items.${index}.rawMaterialId`}
                                  render={({ field }) => (
                                    <FormItem className="col-span-2">
                                      <FormLabel>Material *</FormLabel>
                                      <Select
                                        onValueChange={(value) => handleMaterialSelect(index, value)}
                                        value={field.value}
                                      >
                                        <FormControl>
                                          <SelectTrigger>
                                            <SelectValue placeholder="Seleccionar material" />
                                          </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                          {rawMaterials.map((material) => (
                                            <SelectItem key={material.id} value={material.id}>
                                              <div className="flex items-center justify-between w-full">
                                                <span>{material.name}</span>
                                                <Badge variant="outline" className="ml-2">
                                                  {material.currentStock} {material.unitOfMeasure}
                                                </Badge>
                                              </div>
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />

                                <FormField
                                  control={form.control}
                                  name={`items.${index}.quantity`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Cantidad *</FormLabel>
                                      <FormControl>
                                        <Input
                                          type="number"
                                          min="0"
                                          step="0.01"
                                          placeholder="0"
                                          {...field}
                                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>

                              {material && (
                                <div className="flex items-center justify-between text-sm bg-gray-50 p-3 rounded">
                                  <div className="space-y-1">
                                    <p><strong>Unidad:</strong> {material.unitOfMeasure}</p>
                                    <p><strong>Costo unitario:</strong> ${material.unitCost.toFixed(2)}</p>
                                    <p><strong>Stock disponible:</strong> {material.currentStock}</p>
                                  </div>
                                  <div className="text-right space-y-1">
                                    <Badge variant="secondary">
                                      Costo: ${itemCost.toFixed(2)}
                                    </Badge>
                                    {!stockSufficient && (
                                      <div className="flex items-center gap-1 text-red-600">
                                        <AlertTriangle className="h-4 w-4" />
                                        <span className="text-xs">Stock insuficiente</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          </Card>
                        );
                      })}
                    </div>
                  </ScrollArea>
                )}
              </div>

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

              {/* Cost Summary */}
              <Card className="bg-blue-50 border-blue-200">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Calculator className="h-5 w-5" />
                    Resumen de Costos
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span>Costo de Materiales:</span>
                    <Badge variant="outline">${totalMaterialCost.toFixed(2)}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Costo de Mano de Obra:</span>
                    <Badge variant="outline">${totalLaborCost.toFixed(2)}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Gastos Indirectos:</span>
                    <Badge variant="outline">${totalOverheadCost.toFixed(2)}</Badge>
                  </div>
                  <hr className="my-2" />
                  <div className="flex justify-between font-medium text-lg">
                    <span>Costo Total:</span>
                    <Badge className="text-lg px-3 py-1">
                      ${totalCost.toFixed(2)}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <div className="flex gap-4 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  disabled={loading}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={loading || fields.length === 0}>
                  {loading ? 'Guardando...' : 'Guardar BOM'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}