// src/app/(main)/finance/invoices/new/page.tsx

'use client';

import { ArrowLeft, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useInvoiceForm } from '@/modules/finance/hooks/use-invoice-form';
import { calculateInvoiceTotals, calculateItemSubtotal } from '@/modules/finance/utils/invoice-calculations';
import type { InvoiceItem } from '@/modules/finance/types/finance.types';
import {
  InvoiceClientInfo,
  InvoiceItemsTable,
  InvoiceAdditionalInfo,
  InvoiceDates,
  InvoiceSummary,
} from '@/modules/finance/components/invoice-form';
import { toast } from 'sonner';

/**
 * Página de creación de facturas
 * Soporta pre-llenado desde cotizaciones con ?quoteId=xxx o ?orderId=xxx
 * Rule #5: Max 200 lines per file
 */
export default function NewInvoicePage() {
  const { user } = useAuth();
  const {
    formData,
    setFormData,
    loading,
    loadingQuote,
    loadingOrder,
    handleSubmit,
  } = useInvoiceForm(user?.uid);

  const handleAddItem = () => {
    setFormData({
      ...formData,
      items: [
        ...formData.items,
        {
          description: '',
          quantity: 1,
          unitPrice: 0,
          discount: 0,
          subtotal: 0,
          unitOfMeasure: 'pza',
        },
      ],
    });
  };

  const handleRemoveItem = (index: number) => {
    if (formData.items.length === 1) {
      toast.error('Debe haber al menos un ítem');
      return;
    }

    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: newItems });
  };

  const handleItemChange = (
    index: number,
    field: keyof InvoiceItem,
    value: string | number
  ) => {
    const newItems = [...formData.items];
    newItems[index] = {
      ...newItems[index],
      [field]: value,
    };

    // Recalcular subtotal
    if (field === 'quantity' || field === 'unitPrice' || field === 'discount') {
      const item = newItems[index];
      item.subtotal = calculateItemSubtotal(
        Number(item.quantity),
        Number(item.unitPrice),
        Number(item.discount)
      );
    }

    setFormData({ ...formData, items: newItems });
  };

  const { subtotal, total } = calculateInvoiceTotals(formData.items, { IVA: 16 });

  if (loadingQuote || loadingOrder) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">
            {loadingQuote ? 'Cargando cotización...' : 'Cargando pedido...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Nueva Factura</h1>
            <p className="text-muted-foreground">
              {formData.orderId
                ? `Desde pedido ${formData.orderNumber}`
                : formData.quoteId
                  ? `Desde cotización ${formData.quoteNumber}`
                  : 'Crear factura manualmente'}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            <InvoiceClientInfo
              clientId={formData.clientId}
              clientName={formData.clientName}
              onClientIdChange={(value) =>
                setFormData({ ...formData, clientId: value })
              }
              onClientNameChange={(value) =>
                setFormData({ ...formData, clientName: value })
              }
            />

            <InvoiceItemsTable
              items={formData.items}
              currency={formData.currency}
              onItemChange={handleItemChange}
              onAddItem={handleAddItem}
              onRemoveItem={handleRemoveItem}
            />

            <InvoiceAdditionalInfo
              paymentTerms={formData.paymentTerms}
              notes={formData.notes}
              onPaymentTermsChange={(value) =>
                setFormData({ ...formData, paymentTerms: value })
              }
              onNotesChange={(value) =>
                setFormData({ ...formData, notes: value })
              }
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <InvoiceDates
              issueDate={formData.issueDate}
              dueDate={formData.dueDate}
              onIssueDateChange={(value) =>
                setFormData({ ...formData, issueDate: value })
              }
              onDueDateChange={(value) =>
                setFormData({ ...formData, dueDate: value })
              }
            />

            <InvoiceSummary
              subtotal={subtotal}
              taxes={{ IVA: 16 }}
              total={total}
              currency={formData.currency}
            />

            {/* Actions */}
            <div className="space-y-2">
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  'Creando...'
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Crear Factura
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => window.history.back()}
                disabled={loading}
              >
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
