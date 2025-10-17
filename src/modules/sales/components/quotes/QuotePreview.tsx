/**
 * ZADIA OS - Quote Preview Component
 * 
 * PDF-like preview of quote
 * REGLA 2: ShadCN UI + Lucide Icons
 * REGLA 4: Modular
 * REGLA 5: <200 líneas
 */

'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Quote } from '@/modules/sales/types/sales.types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface QuotePreviewProps {
  quote: Quote;
  clientName?: string;
  opportunityName?: string;
}

export function QuotePreview({ quote, clientName, opportunityName }: QuotePreviewProps) {
  return (
    <Card className="print:shadow-none print:border-0">
      <CardContent className="p-8 print:p-12">
        {/* Header */}
        <div className="mb-8 pb-4 border-b-2 border-primary print:border-gray-800">
          <h2 className="text-3xl font-bold text-primary print:text-gray-900">ZADIA OS</h2>
          <p className="text-sm text-muted-foreground print:text-gray-600">Sistema de Gestión Empresarial</p>
        </div>

        {/* Quote Info */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="font-semibold mb-2">Información de la Cotización</h3>
            <div className="space-y-1 text-sm">
              <p><span className="text-muted-foreground">Número:</span> {quote.number}</p>
              <p><span className="text-muted-foreground">Fecha:</span> {format(quote.createdAt.toDate(), 'dd MMM yyyy', { locale: es })}</p>
              <p><span className="text-muted-foreground">Válida hasta:</span> {format(quote.validUntil.toDate(), 'dd MMM yyyy', { locale: es })}</p>
            </div>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Cliente</h3>
            <div className="space-y-1 text-sm">
              <p className="font-medium">{clientName || quote.clientId}</p>
              {opportunityName && (
                <p><span className="text-muted-foreground">Oportunidad:</span> {opportunityName}</p>
              )}
            </div>
          </div>
        </div>

        <Separator className="my-6" />

        {/* Items Table */}
        <div className="mb-8">
          <h3 className="font-semibold mb-4">Detalles</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50%]">Descripción</TableHead>
                <TableHead className="text-right">Cant.</TableHead>
                <TableHead className="text-right">Precio Unit.</TableHead>
                <TableHead className="text-right">Descuento</TableHead>
                <TableHead className="text-right">Subtotal</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {quote.items.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{item.description}</p>
                      <p className="text-xs text-muted-foreground">Unidad: {item.unitOfMeasure}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">{item.quantity}</TableCell>
                  <TableCell className="text-right">
                    ${item.unitPrice.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell className="text-right">
                    ${item.discount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    ${item.subtotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <Separator className="my-6" />

        {/* Totals */}
        <div className="flex justify-end">
          <div className="w-72 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal:</span>
              <span>${quote.subtotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
            </div>
            
            {Object.entries(quote.taxes).map(([name, rate]) => {
              const amount = (quote.subtotal * rate) / 100;
              return (
                <div key={name} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{name} ({rate}%):</span>
                  <span>${amount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                </div>
              );
            })}

            {quote.discounts > 0 && (
              <div className="flex justify-between text-sm text-destructive">
                <span>Descuento adicional:</span>
                <span>-${quote.discounts.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
              </div>
            )}

            <Separator />
            
            <div className="flex justify-between text-lg font-bold">
              <span>Total:</span>
              <span>${quote.total.toLocaleString('es-MX', { minimumFractionDigits: 2 })} {quote.currency}</span>
            </div>
          </div>
        </div>

        {/* Terms */}
        {quote.paymentTerms && (
          <div className="mt-8">
            <h3 className="font-semibold mb-2">Términos de Pago</h3>
            <p className="text-sm text-muted-foreground">{quote.paymentTerms}</p>
          </div>
        )}

        {/* Notes */}
        {quote.notes && (
          <div className="mt-6">
            <h3 className="font-semibold mb-2">Notas</h3>
            <p className="text-sm text-muted-foreground">{quote.notes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
