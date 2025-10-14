/**
 * ZADIA OS - Inventory Reservation Step
 * 
 * Third step: Configure inventory reservations
 * Following ZADIA Rule 2: ShadCN UI + Lucide Icons
 * Following ZADIA Rule 5: Max 200 lines
 */

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { ChevronLeft, ChevronRight, Package, AlertCircle } from 'lucide-react';
import { Quote } from '../../types/sales.types';
import { InventoryReservationInput } from '../../validations/quote-project-conversion.schema';

interface InventoryReservationStepProps {
  quote: Quote;
  onNext: () => void;
  onBack: () => void;
  onReservations: (data: InventoryReservationInput[]) => void;
}

export function InventoryReservationStep({ 
  quote, 
  onNext, 
  onBack, 
  onReservations 
}: InventoryReservationStepProps) {
  const [selectedItems, setSelectedItems] = useState<string[]>(
    quote.items.filter(item => item.productId).map(item => item.id)
  );

  const handleToggleItem = (itemId: string) => {
    setSelectedItems(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleContinue = () => {
    const reservations: InventoryReservationInput[] = quote.items
      .filter(item => selectedItems.includes(item.id) && item.productId)
      .map(item => ({
        productId: item.productId!,
        productName: item.description,
        quantity: item.quantity,
        unitOfMeasure: item.unitOfMeasure,
        reservedFrom: 'warehouse' as const,
      }));

    onReservations(reservations);
    onNext();
  };

  const hasItems = quote.items.some(item => item.productId);

  return (
    <div className="space-y-6">
      <Alert>
        <Package className="h-4 w-4" />
        <AlertDescription>
          Seleccione los productos que requieren reservación de inventario.
        </AlertDescription>
      </Alert>

      {!hasItems && (
        <Alert variant="default">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Esta cotización no contiene productos con ID de inventario.
            Puede continuar sin crear reservaciones.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Productos de la Cotización
          </CardTitle>
          <CardDescription>
            {quote.items.length} producto(s) - Seleccione los que requieren reservación
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {quote.items.map((item) => {
            const hasProductId = !!item.productId;
            const isSelected = selectedItems.includes(item.id);

            return (
              <div
                key={item.id}
                className={`flex items-start gap-3 p-4 border rounded-lg ${
                  !hasProductId ? 'opacity-50 bg-muted' : ''
                }`}
              >
                {hasProductId && (
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => handleToggleItem(item.id)}
                    className="mt-1"
                  />
                )}

                <div className="flex-1 space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold">{item.description}</p>
                      {item.productId && (
                        <p className="text-sm text-muted-foreground">
                          Producto ID: {item.productId}
                        </p>
                      )}
                      {!item.productId && (
                        <p className="text-sm text-muted-foreground">
                          (Servicio o producto sin ID de inventario)
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">
                        ${item.subtotal.toLocaleString()}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        ${item.unitPrice.toLocaleString()}/{item.unitOfMeasure}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4 text-sm">
                    <span className="text-muted-foreground">
                      Cantidad: <span className="font-semibold text-foreground">
                        {item.quantity} {item.unitOfMeasure}
                      </span>
                    </span>
                    {item.discount > 0 && (
                      <span className="text-green-600">
                        Descuento: {item.discount}%
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {selectedItems.length > 0 && (
        <Alert>
          <Package className="h-4 w-4" />
          <AlertDescription>
            Se crearán {selectedItems.length} reservación(es) de inventario.
            Las reservaciones se marcarán como "Reservado" y se vincularán al proyecto.
          </AlertDescription>
        </Alert>
      )}

      {/* Actions */}
      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={onBack}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          Atrás
        </Button>
        <Button onClick={handleContinue}>
          {selectedItems.length > 0 
            ? `Continuar (${selectedItems.length} seleccionados)`
            : 'Continuar sin reservaciones'
          }
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
