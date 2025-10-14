/**
 * ZADIA OS - Quote Items Table Component
 * 
 * Editable table for managing quote line items with automatic calculations
 * 
 * @component
 */

'use client';

import { useState } from 'react';
import { Trash2, Edit2, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { QuoteItem } from '@/modules/sales/types/sales.types';

interface QuoteItemsTableProps {
  items: Omit<QuoteItem, 'id'>[];
  onItemsChange: (items: Omit<QuoteItem, 'id'>[]) => void;
  editable?: boolean;
}

interface EditingItem {
  index: number;
  quantity: number;
  unitPrice: number;
  discount: number;
}

export function QuoteItemsTable({
  items,
  onItemsChange,
  editable = true,
}: QuoteItemsTableProps) {
  const [editingItem, setEditingItem] = useState<EditingItem | null>(null);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-PY', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(value);
  };

  const calculateSubtotal = (quantity: number, unitPrice: number, discount: number) => {
    const baseAmount = quantity * unitPrice;
    const discountAmount = (baseAmount * discount) / 100;
    return baseAmount - discountAmount;
  };

  const handleStartEdit = (index: number) => {
    const item = items[index];
    setEditingItem({
      index,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      discount: item.discount,
    });
  };

  const handleSaveEdit = () => {
    if (!editingItem) return;

    const updatedItems = [...items];
    const subtotal = calculateSubtotal(
      editingItem.quantity,
      editingItem.unitPrice,
      editingItem.discount
    );

    updatedItems[editingItem.index] = {
      ...updatedItems[editingItem.index],
      quantity: editingItem.quantity,
      unitPrice: editingItem.unitPrice,
      discount: editingItem.discount,
      subtotal,
    };

    onItemsChange(updatedItems);
    setEditingItem(null);
  };

  const handleCancelEdit = () => {
    setEditingItem(null);
  };

  const handleDeleteItem = (index: number) => {
    const updatedItems = items.filter((_, i) => i !== index);
    onItemsChange(updatedItems);
  };

  const totals = {
    subtotal: items.reduce((sum, item) => sum + item.subtotal, 0),
    itemsCount: items.length,
  };

  if (items.length === 0) {
    return (
      <Alert>
        <AlertDescription>
          No hay items en esta cotización. Usa el selector de productos arriba para agregar items.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[40%]">Descripción</TableHead>
            <TableHead className="w-[10%]">Cantidad</TableHead>
            <TableHead className="w-[12%]">Unidad</TableHead>
            <TableHead className="w-[13%]">Precio Unit.</TableHead>
            <TableHead className="w-[10%]">Desc. %</TableHead>
            <TableHead className="w-[13%] text-right">Subtotal</TableHead>
            {editable && <TableHead className="w-[100px]">Acciones</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item, index) => {
            const isEditing = editingItem?.index === index;

            return (
              <TableRow key={index}>
                <TableCell>
                  <div>
                    <p className="font-medium">{item.description}</p>
                    {item.productId && (
                      <Badge variant="outline" className="mt-1">
                        ID: {item.productId}
                      </Badge>
                    )}
                  </div>
                </TableCell>

                {/* Quantity */}
                <TableCell>
                  {isEditing ? (
                    <Input
                      type="number"
                      min="1"
                      step="1"
                      value={editingItem.quantity}
                      onChange={(e) =>
                        setEditingItem({
                          ...editingItem,
                          quantity: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-20"
                    />
                  ) : (
                    <span>{item.quantity}</span>
                  )}
                </TableCell>

                {/* Unit of Measure */}
                <TableCell>{item.unitOfMeasure}</TableCell>

                {/* Unit Price */}
                <TableCell>
                  {isEditing ? (
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={editingItem.unitPrice}
                      onChange={(e) =>
                        setEditingItem({
                          ...editingItem,
                          unitPrice: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-28"
                    />
                  ) : (
                    <span>{formatCurrency(item.unitPrice)}</span>
                  )}
                </TableCell>

                {/* Discount */}
                <TableCell>
                  {isEditing ? (
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={editingItem.discount}
                      onChange={(e) =>
                        setEditingItem({
                          ...editingItem,
                          discount: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-20"
                    />
                  ) : (
                    <span>{item.discount}%</span>
                  )}
                </TableCell>

                {/* Subtotal */}
                <TableCell className="text-right font-medium">
                  {isEditing
                    ? formatCurrency(
                        calculateSubtotal(
                          editingItem.quantity,
                          editingItem.unitPrice,
                          editingItem.discount
                        )
                      )
                    : formatCurrency(item.subtotal)}
                </TableCell>

                {/* Actions */}
                {editable && (
                  <TableCell>
                    {isEditing ? (
                      <div className="flex gap-1">
                        <Button size="icon" variant="ghost" onClick={handleSaveEdit}>
                          <Check className="h-4 w-4 text-green-600" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={handleCancelEdit}>
                          <X className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleStartEdit(index)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleDeleteItem(index)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    )}
                  </TableCell>
                )}
              </TableRow>
            );
          })}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={editable ? 5 : 4} className="text-right font-semibold">
              Subtotal ({totals.itemsCount} items):
            </TableCell>
            <TableCell className="text-right font-bold text-lg">
              {formatCurrency(totals.subtotal)}
            </TableCell>
            {editable && <TableCell />}
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  );
}
