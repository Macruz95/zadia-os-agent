/**
 * ZADIA OS - Material Selector for Quote Calculator
 * Component for selecting materials from inventory with tabs
 */

'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PlusCircle, Package, Hammer, Box, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import type { CalculatorMaterial } from '../../../types/calculator.types';

interface InventoryItem {
  id: string;
  name: string;
  unitPrice: number;
  unit: string;
  availableQuantity?: number;
  type: 'raw' | 'finished';
}

interface MaterialSelectorProps {
  onAddMaterial: (material: Omit<CalculatorMaterial, 'subtotal'>) => void;
  inventoryItems: InventoryItem[];
  isLoading?: boolean;
}

export function MaterialSelector({
  onAddMaterial,
  inventoryItems,
  isLoading = false,
}: MaterialSelectorProps) {
  const [selectedTab, setSelectedTab] = useState<'raw' | 'finished'>('raw');
  const [selectedMaterialId, setSelectedMaterialId] = useState<string>('');
  const [quantity, setQuantity] = useState<string>('');

  const rawMaterials = inventoryItems.filter((item) => item.type === 'raw');
  const finishedProducts = inventoryItems.filter((item) => item.type === 'finished');

  useEffect(() => {
    const items = selectedTab === 'raw' ? rawMaterials : finishedProducts;
    if (items.length > 0) {
      setSelectedMaterialId(items[0].id);
    } else {
      setSelectedMaterialId('');
    }
  }, [selectedTab, rawMaterials, finishedProducts]);

  const handleAdd = () => {
    if (!selectedMaterialId) {
      toast.error('Seleccione un material');
      return;
    }

    const material = inventoryItems.find((m) => m.id === selectedMaterialId);
    if (!material) {
      toast.error('Material no encontrado');
      return;
    }

    const qty = parseFloat(quantity);
    if (!qty || qty <= 0) {
      toast.error('Ingrese una cantidad válida');
      return;
    }

    if (material.availableQuantity !== undefined && qty > material.availableQuantity) {
      toast.error(`Stock insuficiente. Disponible: ${material.availableQuantity} ${material.unit}`);
      return;
    }

    onAddMaterial({
      id: material.id,
      name: material.name,
      unitPrice: material.unitPrice,
      unit: material.unit,
      quantity: qty,
    });

    setQuantity('');
    toast.success(`${material.name} agregado`);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center text-muted-foreground">
            <Package className="w-5 h-5 mr-2 animate-pulse" />
            Cargando inventario...
          </div>
        </CardContent>
      </Card>
    );
  }

  const selectedMaterial = inventoryItems.find((m) => m.id === selectedMaterialId);

  return (
    <Card>
      <CardContent className="p-6 space-y-4">
        <div>
          <h3 className="text-lg font-semibold">Seleccionar Material</h3>
          <p className="text-sm text-muted-foreground">Agregue materiales o productos al presupuesto</p>
        </div>

        <Tabs value={selectedTab} onValueChange={(v) => setSelectedTab(v as 'raw' | 'finished')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="raw" className="flex items-center gap-2">
              <Hammer className="w-4 h-4" />
              Materias Primas
              <Badge variant="secondary">{rawMaterials.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="finished" className="flex items-center gap-2">
              <Box className="w-4 h-4" />
              Productos Terminados
              <Badge variant="secondary">{finishedProducts.length}</Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="raw" className="space-y-4 mt-4">
            {rawMaterials.length === 0 ? (
              <div className="text-center p-8 border-2 border-dashed rounded-lg">
                <Hammer className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                <p className="text-muted-foreground">No hay materias primas disponibles</p>
              </div>
            ) : (
              <MaterialForm
                items={rawMaterials}
                selectedId={selectedMaterialId}
                onSelectId={setSelectedMaterialId}
                quantity={quantity}
                onQuantityChange={setQuantity}
                onAdd={handleAdd}
                selectedMaterial={selectedMaterial}
              />
            )}
          </TabsContent>

          <TabsContent value="finished" className="space-y-4 mt-4">
            {finishedProducts.length === 0 ? (
              <div className="text-center p-8 border-2 border-dashed rounded-lg">
                <Box className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                <p className="text-muted-foreground">No hay productos terminados disponibles</p>
              </div>
            ) : (
              <MaterialForm
                items={finishedProducts}
                selectedId={selectedMaterialId}
                onSelectId={setSelectedMaterialId}
                quantity={quantity}
                onQuantityChange={setQuantity}
                onAdd={handleAdd}
                selectedMaterial={selectedMaterial}
              />
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

function MaterialForm({
  items,
  selectedId,
  onSelectId,
  quantity,
  onQuantityChange,
  onAdd,
  selectedMaterial,
}: {
  items: InventoryItem[];
  selectedId: string;
  onSelectId: (id: string) => void;
  quantity: string;
  onQuantityChange: (q: string) => void;
  onAdd: () => void;
  selectedMaterial?: InventoryItem;
}) {
  const qty = parseFloat(quantity) || 0;
  const subtotal = selectedMaterial ? selectedMaterial.unitPrice * qty : 0;
  const hasLowStock = selectedMaterial?.availableQuantity !== undefined && 
                      selectedMaterial.availableQuantity < 10;

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Material</Label>
        <Select value={selectedId} onValueChange={onSelectId}>
          <SelectTrigger>
            <SelectValue placeholder="Seleccione un material" />
          </SelectTrigger>
          <SelectContent>
            {items.map((item) => (
              <SelectItem key={item.id} value={item.id}>
                <div className="flex items-center justify-between w-full gap-4">
                  <span className="font-medium">{item.name}</span>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>${item.unitPrice.toFixed(2)}/{item.unit}</span>
                    {item.availableQuantity !== undefined && (
                      <Badge variant={item.availableQuantity < 10 ? "destructive" : "outline"} className="text-xs">
                        Stock: {item.availableQuantity}
                      </Badge>
                    )}
                  </div>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="col-span-2 space-y-2">
          <Label>Cantidad</Label>
          <Input
            type="number"
            value={quantity}
            onChange={(e) => onQuantityChange(e.target.value)}
            placeholder="0"
            min="0"
            step="0.01"
            className="text-lg"
          />
        </div>
        <div className="space-y-2">
          <Label>Unidad</Label>
          <div className="h-10 px-3 py-2 border rounded-md bg-muted flex items-center justify-center font-medium">
            {selectedMaterial?.unit || '-'}
          </div>
        </div>
      </div>

      {selectedMaterial && qty > 0 && (
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Precio unitario:</span>
                <span className="font-medium">${selectedMaterial.unitPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Cantidad:</span>
                <span className="font-medium">{qty} {selectedMaterial.unit}</span>
              </div>
              <div className="h-px bg-border my-2" />
              <div className="flex justify-between font-semibold text-lg">
                <span>Subtotal:</span>
                <span className="text-primary">${subtotal.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {hasLowStock && (
        <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 p-3 rounded-lg border border-amber-200">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>Stock bajo: solo {selectedMaterial?.availableQuantity} {selectedMaterial?.unit} disponibles</span>
        </div>
      )}

      <Button 
        onClick={onAdd} 
        className="w-full"
        size="lg"
        disabled={!selectedId || !qty || qty <= 0}
      >
        <PlusCircle className="w-5 h-5 mr-2" />
        Agregar Material
      </Button>
    </div>
  );
}
