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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-PY', {
      style: 'currency',
      currency: formData.currency,
      minimumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <Alert>
        <CheckCircle className="h-4 w-4" />
        <AlertDescription>
          Revise la información de la cotización antes de crearla. 
          Puede volver atrás para hacer cambios si es necesario.
        </AlertDescription>
      </Alert>

      {/* Información básica */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <FileText className="w-4 h-4" />
            Información General
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Oportunidad</p>
              <p className="font-medium">{formData.opportunityName || 'No especificada'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Cliente</p>
              <p className="font-medium">{formData.clientName || 'No especificado'}</p>
            </div>
            {formData.contactName && (
              <div>
                <p className="text-sm text-muted-foreground">Contacto</p>
                <p className="font-medium">{formData.contactName}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-muted-foreground">Moneda</p>
              <Badge variant="outline">{formData.currency}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Términos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Calendar className="w-4 h-4" />
            Términos y Condiciones
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <p className="text-sm text-muted-foreground">Válido hasta</p>
            <p className="font-medium">
              {format(formData.validUntil, 'PPP', { locale: es })}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Términos de Pago</p>
            <p className="font-medium whitespace-pre-wrap">{formData.paymentTerms}</p>
          </div>
        </CardContent>
      </Card>

      {/* Items */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <DollarSign className="w-4 h-4" />
            Items ({formData.items.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Descripción</TableHead>
                <TableHead className="text-right">Cantidad</TableHead>
                <TableHead className="text-right">Precio Unit.</TableHead>
                <TableHead className="text-right">Desc. %</TableHead>
                <TableHead className="text-right">Subtotal</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {formData.items.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{item.description}</div>
                      <div className="text-xs text-muted-foreground">{item.unitOfMeasure}</div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">{item.quantity}</TableCell>
                  <TableCell className="text-right">{formatCurrency(item.unitPrice)}</TableCell>
                  <TableCell className="text-right">{item.discount}%</TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(item.subtotal)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Resumen de cálculos */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Totales</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-medium">{formatCurrency(calculation.subtotal)}</span>
          </div>

          {Object.keys(formData.taxes).length > 0 && (
            <>
              <Separator />
              <div className="space-y-2">
                <p className="text-sm font-medium">Impuestos:</p>
                {Object.entries(calculation.taxesBreakdown).map(([name, amount]) => (
                  <div key={name} className="flex justify-between text-sm pl-4">
                    <span className="text-muted-foreground">
                      {name} ({formData.taxes[name]}%)
                    </span>
                    <span>{formatCurrency(amount)}</span>
                  </div>
                ))}
                <div className="flex justify-between font-medium">
                  <span>Total Impuestos</span>
                  <span>{formatCurrency(calculation.totalTaxes)}</span>
                </div>
              </div>
            </>
          )}

          {formData.additionalDiscounts > 0 && (
            <>
              <Separator />
              <div className="flex justify-between text-orange-600">
                <span>Descuentos Adicionales</span>
                <span>-{formatCurrency(formData.additionalDiscounts)}</span>
              </div>
            </>
          )}

          <Separator />
          <div className="flex justify-between text-lg font-bold">
            <span>TOTAL</span>
            <span>{formatCurrency(calculation.total)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Notas */}
      {(formData.notes || formData.internalNotes) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Notas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {formData.notes && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Notas para el cliente</p>
                <p className="mt-1 whitespace-pre-wrap text-sm">{formData.notes}</p>
              </div>
            )}
            {formData.internalNotes && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Notas internas</p>
                <p className="mt-1 whitespace-pre-wrap text-sm bg-muted p-3 rounded-md">
                  {formData.internalNotes}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
