import React from 'react';
import { Invoice } from '@/modules/finance/types/finance.types';
import { formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Timestamp } from 'firebase/firestore';

interface InvoicePDFProps {
  invoice: Invoice;
}

const toDate = (timestamp: Date | Timestamp): Date => {
  if (timestamp instanceof Timestamp) {
    return timestamp.toDate();
  }
  return timestamp;
};

export const InvoicePDF = React.forwardRef<HTMLDivElement, InvoicePDFProps>(
  ({ invoice }, ref) => {
    return (
      <div ref={ref} className="p-8 bg-white text-black" style={{ width: '210mm', minHeight: '297mm' }}>
        {/* Header */}
        <div className="flex justify-between items-start mb-8 border-b pb-6">
          <div>
            <h1 className="text-3xl font-bold text-primary mb-2">ZADIA OS</h1>
            <p className="text-sm text-gray-600">Sistema de Gestión Empresarial</p>
            <p className="text-sm text-gray-600 mt-2">RFC: XXX-XXXXXX-XXX</p>
            <p className="text-sm text-gray-600">Dirección Fiscal</p>
          </div>
          <div className="text-right">
            <h2 className="text-2xl font-bold mb-2">FACTURA</h2>
            <p className="text-lg font-semibold text-primary">{invoice.number}</p>
            <div className="mt-4 text-sm">
              <p className="text-gray-600">Fecha de Emisión:</p>
              <p className="font-semibold">
                {format(toDate(invoice.issueDate), 'dd/MM/yyyy', { locale: es })}
              </p>
              <p className="text-gray-600 mt-2">Fecha de Vencimiento:</p>
              <p className="font-semibold">
                {format(toDate(invoice.dueDate), 'dd/MM/yyyy', { locale: es })}
              </p>
            </div>
          </div>
        </div>

        {/* Client Info */}
        <div className="mb-8 p-4 bg-gray-50 rounded">
          <h3 className="text-sm font-semibold text-gray-600 mb-2">FACTURADO A:</h3>
          <p className="font-bold text-lg">{invoice.clientName}</p>
          <p className="text-sm text-gray-600">Cliente ID: {invoice.clientId}</p>
          {invoice.quoteNumber && (
            <p className="text-sm text-gray-600 mt-1">
              Cotización: {invoice.quoteNumber}
            </p>
          )}
          {invoice.projectId && (
            <p className="text-sm text-gray-600">Proyecto ID: {invoice.projectId}</p>
          )}
        </div>

        {/* Items Table */}
        <div className="mb-8">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-primary text-primary-foreground">
                <th className="border border-gray-300 p-3 text-left text-sm font-semibold">
                  Descripción
                </th>
                <th className="border border-gray-300 p-3 text-center text-sm font-semibold w-20">
                  Cant.
                </th>
                <th className="border border-gray-300 p-3 text-center text-sm font-semibold w-20">
                  Unidad
                </th>
                <th className="border border-gray-300 p-3 text-right text-sm font-semibold w-28">
                  P. Unitario
                </th>
                <th className="border border-gray-300 p-3 text-right text-sm font-semibold w-28">
                  Descuento
                </th>
                <th className="border border-gray-300 p-3 text-right text-sm font-semibold w-32">
                  Subtotal
                </th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((item, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="border border-gray-300 p-3 text-sm">
                    {item.description}
                  </td>
                  <td className="border border-gray-300 p-3 text-center text-sm">
                    {item.quantity}
                  </td>
                  <td className="border border-gray-300 p-3 text-center text-sm">
                    {item.unitOfMeasure || 'pza'}
                  </td>
                  <td className="border border-gray-300 p-3 text-right text-sm">
                    {formatCurrency(item.unitPrice, invoice.currency)}
                  </td>
                  <td className="border border-gray-300 p-3 text-right text-sm">
                    {formatCurrency(item.discount || 0, invoice.currency)}
                  </td>
                  <td className="border border-gray-300 p-3 text-right text-sm font-semibold">
                    {formatCurrency(item.subtotal, invoice.currency)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="flex justify-end mb-8">
          <div className="w-80">
            <div className="flex justify-between py-2 border-b">
              <span className="text-sm font-medium">Subtotal:</span>
              <span className="text-sm font-semibold">
                {formatCurrency(invoice.subtotal, invoice.currency)}
              </span>
            </div>
            {Object.entries(invoice.taxes).map(([taxName, rate]) => (
              <div key={taxName} className="flex justify-between py-2 border-b">
                <span className="text-sm font-medium">
                  {taxName} ({rate}%):
                </span>
                <span className="text-sm font-semibold">
                  {formatCurrency((invoice.subtotal * rate) / 100, invoice.currency)}
                </span>
              </div>
            ))}
            {invoice.discounts > 0 && (
              <div className="flex justify-between py-2 border-b">
                <span className="text-sm font-medium">Descuentos:</span>
                <span className="text-sm font-semibold text-red-600">
                  -{formatCurrency(invoice.discounts, invoice.currency)}
                </span>
              </div>
            )}
            <div className="flex justify-between py-3 bg-primary text-primary-foreground px-3 rounded mt-2">
              <span className="font-bold text-lg">TOTAL:</span>
              <span className="font-bold text-lg">
                {formatCurrency(invoice.total, invoice.currency)}
              </span>
            </div>
            {invoice.amountPaid > 0 && (
              <>
                <div className="flex justify-between py-2 border-b mt-2">
                  <span className="text-sm font-medium">Pagado:</span>
                  <span className="text-sm font-semibold text-green-600">
                    {formatCurrency(invoice.amountPaid, invoice.currency)}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-sm font-medium">Pendiente:</span>
                  <span className="text-sm font-semibold text-orange-600">
                    {formatCurrency(invoice.amountDue, invoice.currency)}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Payment Info */}
        <div className="mb-8 p-4 bg-gray-50 rounded">
          <h3 className="text-sm font-semibold text-gray-600 mb-2">
            CONDICIONES DE PAGO:
          </h3>
          <p className="text-sm">{invoice.paymentTerms}</p>
        </div>

        {/* Notes */}
        {invoice.notes && (
          <div className="mb-8 p-4 border border-gray-300 rounded">
            <h3 className="text-sm font-semibold text-gray-600 mb-2">NOTAS:</h3>
            <p className="text-sm whitespace-pre-wrap">{invoice.notes}</p>
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 pt-6 border-t text-center text-sm text-gray-600">
          <p>Este documento es una representación impresa de una factura electrónica</p>
          <p className="mt-1">Generado el {format(new Date(), 'dd/MM/yyyy HH:mm', { locale: es })}</p>
          <p className="mt-4 text-xs">ZADIA OS - Sistema de Gestión Empresarial</p>
        </div>
      </div>
    );
  }
);

InvoicePDF.displayName = 'InvoicePDF';
