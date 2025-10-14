/**
 * ZADIA OS - Quote Form Review Step
 * 
 * Final step: Review quote data before creation
 * Following ZADIA Rule 2: ShadCN UI + Lucide Icons
 */

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { CheckCircle, FileText, Calendar, DollarSign } from 'lucide-react';
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
  const calculation = useQuoteCalculator({
    items: formData.items,
    taxes: formData.taxes,
    additionalDiscounts: formData.additionalDiscounts,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<QuoteAcceptanceInput>({
    resolver: zodResolver(quoteAcceptanceSchema),
    defaultValues: {
      quoteId: quote.id,
      acceptedBy: user?.uid || '',
    },
  });

  const onSubmit = (data: QuoteAcceptanceInput) => {
    onAcceptanceData(data);
    onNext();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Alert>
        <FileText className="h-4 w-4" />
        <AlertDescription>
          Revise los detalles de la cotización antes de convertirla a proyecto.
        </AlertDescription>
      </Alert>

      {/* Quote Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Detalles de la Cotización
          </CardTitle>
          <CardDescription>Cotización #{quote.number}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <DollarSign className="h-4 w-4" />
                <span>Valor Total</span>
              </div>
              <p className="text-lg font-semibold">
                ${quote.total.toLocaleString()} {quote.currency}
              </p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Válida Hasta</span>
              </div>
              <p className="text-lg font-semibold">
                {format(quote.validUntil.toDate(), 'dd MMM yyyy', { locale: es })}
              </p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="h-4 w-4" />
                <span>Cliente</span>
              </div>
              <p className="text-lg font-semibold">{quote.clientId}</p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Building2 className="h-4 w-4" />
                <span>Estado</span>
              </div>
              <p className="text-lg font-semibold capitalize">{quote.status}</p>
            </div>
          </div>

          {/* Items Summary */}
          <div className="border-t pt-4">
            <h4 className="font-semibold mb-2">Productos/Servicios ({quote.items.length})</h4>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {quote.items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
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
              <span className="font-semibold">${quote.subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Impuestos:</span>
              <span className="font-semibold">${quote.totalTaxes.toLocaleString()}</span>
            </div>
            {quote.discounts > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Descuentos:</span>
                <span className="font-semibold">-${quote.discounts.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold border-t pt-2">
              <span>Total:</span>
              <span>${quote.total.toLocaleString()} {quote.currency}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Acceptance Data */}
      <Card>
        <CardHeader>
          <CardTitle>Datos de Aceptación</CardTitle>
          <CardDescription>Información adicional sobre la aceptación</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="customerPO">Orden de Compra del Cliente (Opcional)</Label>
            <Input
              id="customerPO"
              {...register('customerPO')}
              placeholder="PO-2025-001"
            />
            {errors.customerPO && (
              <p className="text-sm text-destructive">{errors.customerPO.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="acceptanceNotes">Notas de Aceptación (Opcional)</Label>
            <Textarea
              id="acceptanceNotes"
              {...register('acceptanceNotes')}
              placeholder="Condiciones especiales, acuerdos adicionales, etc."
              rows={4}
            />
            {errors.acceptanceNotes && (
              <p className="text-sm text-destructive">{errors.acceptanceNotes.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end">
        <Button type="submit" size="lg">
          Continuar
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </form>
  );
}
