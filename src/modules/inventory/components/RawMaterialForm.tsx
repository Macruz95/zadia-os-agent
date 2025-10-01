import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Save, X } from 'lucide-react';

import { 
  rawMaterialFormSchema,
  type RawMaterialFormData 
} from '../validations/inventory-forms.schema';
import { BasicFields } from './forms/BasicFields';
import { CategoryFields } from './forms/CategoryFields';
import { StockFields } from './forms/StockFields';

interface RawMaterialFormProps {
  initialData?: RawMaterialFormData;
  onSubmit: (data: RawMaterialFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

/**
 * Raw Material Form Component
 * Handles raw material creation and editing with proper validation
 */
export function RawMaterialForm({ 
  initialData, 
  onSubmit, 
  onCancel, 
  isLoading = false 
}: RawMaterialFormProps) {
  const form = useForm<RawMaterialFormData>({
    resolver: zodResolver(rawMaterialFormSchema),
    defaultValues: initialData || {
      name: '',
      description: '',
      category: 'Otros',
      unitOfMeasure: 'unidades',
      unitCost: 0,
      currentStock: 0,
      minStock: 0,
      maxStock: 0,
      supplier: '',
      status: 'Disponible',
    }
  });

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>
          {initialData ? 'Editar' : 'Crear'} Materia Prima
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Información Básica</h3>
              <BasicFields control={form.control} />
            </div>

            <Separator />

            {/* Category and Classification */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Clasificación</h3>
              <CategoryFields 
                control={form.control} 
                type="rawMaterial"
                showSupplier={true}
              />
            </div>

            <Separator />

            {/* Stock and Pricing */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Stock y Costos</h3>
              <StockFields 
                control={form.control}
                showUnitCost={true}
                showUnitPrice={false}
                showProductionCost={false}
              />
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isLoading}
              >
                <X className="w-4 h-4 mr-2" />
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                <Save className="w-4 h-4 mr-2" />
                {isLoading ? 'Guardando...' : 'Guardar'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}