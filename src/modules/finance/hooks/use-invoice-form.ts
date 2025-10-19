/**
 * ZADIA OS - Invoice Form Hook (Facade)
 * Hook para manejar la lógica de estado del formulario de facturas
 * Rule #5: Modular architecture - Main facade
 */

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import type { UseInvoiceFormReturn } from './use-invoice-form/types';
import { initialFormData } from './use-invoice-form/initial-data';
import { loadQuoteData, loadOrderData } from './use-invoice-form/data-loaders';
import { handleInvoiceSubmit } from './use-invoice-form/submit-handler';

export type { InvoiceFormData, UseInvoiceFormReturn } from './use-invoice-form/types';

export function useInvoiceForm(userId?: string): UseInvoiceFormReturn {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [loadingQuote, setLoadingQuote] = useState(false);
  const [loadingOrder, setLoadingOrder] = useState(false);
  const [formData, setFormData] = useState(initialFormData);

  // Cargar cotización o pedido si viene en URL
  useEffect(() => {
    const quoteId = searchParams.get('quoteId');
    const orderId = searchParams.get('orderId');

    if (quoteId) {
      setLoadingQuote(true);
      loadQuoteData(quoteId).then((data) => {
        if (data) setFormData(data);
        setLoadingQuote(false);
      });
    } else if (orderId) {
      setLoadingOrder(true);
      loadOrderData(orderId).then((data) => {
        if (data) setFormData(data);
        setLoadingOrder(false);
      });
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userId) {
      toast.error('Usuario no autenticado');
      return;
    }

    setLoading(true);
    const invoiceNumber = await handleInvoiceSubmit(formData, userId);
    setLoading(false);

    if (invoiceNumber) {
      router.push('/finance/invoices');
    }
  };

  return {
    formData,
    setFormData,
    loading,
    loadingQuote,
    loadingOrder,
    handleSubmit,
  };
}
