/**
 * ZADIA OS - Order Items Table Component
 * Tabla de productos del pedido
 * Rule #2: ShadCN UI + Lucide Icons
 * Rule #5: Max 200 lines
 */

'use client';

import { Plus, Trash2, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { UseFormRegister } from 'react-hook-form';
import type { UseFieldArrayReturn } from 'react-hook-form';
import type { OrderFormData } from '../../validations/orders.validation';

interface OrderItemsTableProps {
  register: UseFormRegister<OrderFormData>;
  fields: UseFieldArrayReturn<OrderFormData, 'items'>['fields'];
  append: UseFieldArrayReturn<OrderFormData, 'items'>['append'];
  remove: UseFieldArrayReturn<OrderFormData, 'items'>['remove'];
  items: OrderFormData['items'];
  formatCurrency: (amount: number) => string;
}

export function OrderItemsTable({
  register,
  fields,
  append,
  remove,
  items,
  formatCurrency,
}: OrderItemsTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Productos
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Producto</TableHead>
              <TableHead className="w-24">Cantidad</TableHead>
              <TableHead className="w-32">Precio</TableHead>
              <TableHead className="w-24">Desc %</TableHead>
              <TableHead className="w-32">Subtotal</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {fields.map((field, index) => (
              <TableRow key={field.id}>
                <TableCell>
                  <div className="space-y-2">
                    <Input
                      {...register(`items.${index}.productName`)}
                      placeholder="Nombre del producto"
                    />
                    <Input
                      {...register(`items.${index}.description`)}
                      placeholder="Descripción"
                    />
                  </div>
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    {...register(`items.${index}.quantity`, {
                      valueAsNumber: true,
                    })}
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    step="0.01"
                    {...register(`items.${index}.unitPrice`, {
                      valueAsNumber: true,
                    })}
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    {...register(`items.${index}.discount`, {
                      valueAsNumber: true,
                    })}
                  />
                </TableCell>
                <TableCell>
                  <span className="font-medium">
                    {formatCurrency(items[index]?.subtotal || 0)}
                  </span>
                </TableCell>
                <TableCell>
                  {fields.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => remove(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <Button
          type="button"
          variant="outline"
          onClick={() =>
            append({
              productName: '',
              description: '',
              quantity: 1,
              unitPrice: 0,
              discount: 0,
              subtotal: 0,
              unitOfMeasure: 'pza',
            })
          }
          className="mt-4"
        >
          <Plus className="mr-2 h-4 w-4" />
          Agregar Producto
        </Button>
      </CardContent>
    </Card>
  );
}
