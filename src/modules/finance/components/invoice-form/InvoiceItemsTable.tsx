/**
 * ZADIA OS - Invoice Items Table Component
 * Tabla dinámica de items de factura
 * Rule #2: ShadCN UI + Lucide Icons
 * Rule #5: Max 200 lines
 */

'use client';

import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { InvoiceItem } from '../../types/finance.types';

interface InvoiceItemsTableProps {
  items: InvoiceItem[];
  currency: string;
  onItemChange: (index: number, field: keyof InvoiceItem, value: string | number) => void;
  onAddItem: () => void;
  onRemoveItem: (index: number) => void;
}

export function InvoiceItemsTable({
  items,
  currency,
  onItemChange,
  onAddItem,
  onRemoveItem,
}: InvoiceItemsTableProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency,
    }).format(amount);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Ítems de la Factura</CardTitle>
            <CardDescription>{items.length} ítem(s)</CardDescription>
          </div>
          <Button type="button" onClick={onAddItem} size="sm" variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Agregar Ítem
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40%]">Descripción</TableHead>
                <TableHead className="w-[12%]">Cant.</TableHead>
                <TableHead className="w-[10%]">Unidad</TableHead>
                <TableHead className="w-[15%]">Precio</TableHead>
                <TableHead className="w-[13%]">Desc.</TableHead>
                <TableHead className="w-[15%]">Subtotal</TableHead>
                <TableHead className="w-[5%]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Input
                      value={item.description}
                      onChange={(e) =>
                        onItemChange(index, 'description', e.target.value)
                      }
                      placeholder="Producto o servicio"
                      required
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={item.quantity}
                      onChange={(e) =>
                        onItemChange(index, 'quantity', parseFloat(e.target.value))
                      }
                      required
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={item.unitOfMeasure}
                      onChange={(e) =>
                        onItemChange(index, 'unitOfMeasure', e.target.value)
                      }
                      placeholder="pza"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.unitPrice}
                      onChange={(e) =>
                        onItemChange(index, 'unitPrice', parseFloat(e.target.value))
                      }
                      required
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.discount}
                      onChange={(e) =>
                        onItemChange(index, 'discount', parseFloat(e.target.value))
                      }
                    />
                  </TableCell>
                  <TableCell className="font-medium">
                    {formatCurrency(item.subtotal)}
                  </TableCell>
                  <TableCell>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => onRemoveItem(index)}
                      disabled={items.length === 1}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
