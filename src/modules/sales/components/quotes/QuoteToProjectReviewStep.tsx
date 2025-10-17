/**
 * ZADIA OS - Quote Form Review Step
 * 
 * Final step: Review quote data before creation
 * Following ZADIA Rule 2: ShadCN UI + Lucide Icons
 */

'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FileText, Calendar, DollarSign, User, Building2 } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useQuoteCalculator } from '../../hooks/use-quote-calculator';
import type { QuoteItem } from '../../types/sales.types';

interface QuoteFormData {
  opportunityName?: string;
  clientName?: string;
  contactName?: string;
  currency: string;
  validUntil: Date;
  paymentTerms: string;
  items: Omit<QuoteItem, 'id'>[];
  taxes: Record<string, number>;
  additionalDiscounts: number;
  notes?: string;
  internalNotes?: string;
}

interface QuoteReviewStepProps {
  formData: QuoteFormData;
}

export function QuoteReviewStep({ formData }: QuoteReviewStepProps) {
  const { subtotal, totalTaxes, discounts, total } = useQuoteCalculator({
    items: formData.items,
    taxes: formData.taxes,
    additionalDiscounts: formData.additionalDiscounts,
  });

  return (
    <div className="space-y-6">
      <Alert>
        <FileText className="h-4 w-4" />
        <AlertDescription>
          Revise los detalles de la cotización antes de crearla.
        </AlertDescription>
      </Alert>

      {/* Quote Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Detalles de la Cotización
          </CardTitle>
          <CardDescription>Resumen de la información ingresada</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <DollarSign className="h-4 w-4" />
                <span>Valor Total</span>
              </div>
              <p className="text-lg font-semibold">
                ${total.toLocaleString()} {formData.currency}
              </p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Válida Hasta</span>
              </div>
              <p className="text-lg font-semibold">
                {format(formData.validUntil, 'dd MMM yyyy', { locale: es })}
              </p>
            </div>

            {formData.clientName && (
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="h-4 w-4" />
                  <span>Cliente</span>
                </div>
                <p className="text-lg font-semibold">{formData.clientName}</p>
              </div>
            )}

            {formData.opportunityName && (
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Building2 className="h-4 w-4" />
                  <span>Oportunidad</span>
                </div>
                <p className="text-lg font-semibold">{formData.opportunityName}</p>
              </div>
            )}
          </div>

          {/* Items Summary */}
          <div className="border-t pt-4">
            <h4 className="font-semibold mb-2">Productos/Servicios ({formData.items.length})</h4>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {formData.items.map((item, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {item.quantity} {item.unitOfMeasure} - {item.description}
                  </span>
                  <span className="font-semibold">
                    ${item.subtotal.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="border-t pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span>Subtotal:</span>
              <span className="font-semibold">${subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Impuestos:</span>
              <span className="font-semibold">${totalTaxes.toLocaleString()}</span>
            </div>
            {discounts > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Descuentos:</span>
                <span className="font-semibold">-${discounts.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold border-t pt-2">
              <span>Total:</span>
              <span>${total.toLocaleString()} {formData.currency}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Terms */}
      {formData.paymentTerms && (
        <Card>
          <CardHeader>
            <CardTitle>Términos de Pago</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{formData.paymentTerms}</p>
          </CardContent>
        </Card>
      )}

      {/* Notes */}
      {formData.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Notas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground whitespace-pre-line">{formData.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
