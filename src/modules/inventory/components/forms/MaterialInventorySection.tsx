import { Control } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RawMaterialFormData } from '../../validations/inventory.schema';

interface MaterialInventorySectionProps {
  control: Control<RawMaterialFormData>;
}

export function MaterialInventorySection({ control }: MaterialInventorySectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Inventario y Costos</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField
          control={control}
          name="minimumStock"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Stock Mínimo *</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min="0"
                  step="1"
                  placeholder="0"
                  {...field}
                  onChange={(e) => {
                    const value = e.target.value;
                    field.onChange(value === '' ? '' : parseInt(value) || 0);
                  }}
                  onFocus={(e) => {
                    if (e.target.value === '0') {
                      e.target.value = '';
                    }
                  }}
                  onBlur={(e) => {
                    if (e.target.value === '') {
                      field.onChange(0);
                    }
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="unitCost"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Costo Unitario *</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  {...field}
                  onChange={(e) => {
                    const value = e.target.value;
                    field.onChange(value === '' ? '' : parseFloat(value) || 0);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="location.warehouse"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bodega *</FormLabel>
              <FormControl>
                <Input
                  placeholder="Ej: Almacén A"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="location.section"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Sección</FormLabel>
              <FormControl>
                <Input
                  placeholder="Ej: Sección 1"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="location.shelf"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Estante</FormLabel>
              <FormControl>
                <Input
                  placeholder="Ej: Estante 3"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="location.position"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Posición</FormLabel>
              <FormControl>
                <Input
                  placeholder="Ej: B2"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="supplierId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>ID del Proveedor</FormLabel>
              <FormControl>
                <Input
                  placeholder="ID del proveedor principal"
                  {...field}
                  value={field.value || ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="supplierName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre del Proveedor</FormLabel>
              <FormControl>
                <Input
                  placeholder="Nombre del proveedor principal"
                  {...field}
                  value={field.value || ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
}