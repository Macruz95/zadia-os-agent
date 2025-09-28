/**
 * ZADIA OS - BOM Items List Component
 * 
 * Manages the list of materials in the BOM with add/remove functionality
 */

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, Trash2, Package, AlertTriangle } from 'lucide-react';
import { Control, FieldArrayWithId, UseFieldArrayAppend, UseFieldArrayRemove } from 'react-hook-form';
import { BillOfMaterialsFormData } from '../../validations/inventory.schema';
import { RawMaterial } from '../../types/inventory.types';

interface BOMItemsListProps {
  control: Control<BillOfMaterialsFormData>;
  fields: FieldArrayWithId<BillOfMaterialsFormData, "items", "id">[];
  append: UseFieldArrayAppend<BillOfMaterialsFormData, "items">;
  remove: UseFieldArrayRemove;
  rawMaterials: RawMaterial[];
  watchedItems: BillOfMaterialsFormData['items'];
  onMaterialSelect: (itemIndex: number, materialId: string) => void;
}

export function BOMItemsList({
  control,
  fields,
  append,
  remove,
  rawMaterials,
  watchedItems,
  onMaterialSelect
}: BOMItemsListProps) {
  
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

  return (
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
                        control={control}
                        name={`items.${index}.rawMaterialId`}
                        render={({ field }) => (
                          <FormItem className="col-span-2">
                            <FormLabel>Material *</FormLabel>
                            <Select
                              onValueChange={(value) => onMaterialSelect(index, value)}
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
                        control={control}
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
  );
}