// src/modules/finance/hooks/use-payments.ts

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { PaymentsService } from '../services/payments.service';
import type { Payment } from '../types/finance.types';
import type { CreatePaymentInput } from '../validations/finance.validation';

/**
 * Hook para gestionar pagos
 */
export function usePayments(invoiceId?: string) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (invoiceId) {
      fetchPaymentsByInvoice(invoiceId);
    }
  }, [invoiceId]);

  const fetchPaymentsByInvoice = async (invId: string) => {
    try {
      setLoading(true);
      const data = await PaymentsService.getPaymentsByInvoice(invId);
      setPayments(data);
    } catch {
      toast.error('Error al cargar los pagos');
    } finally {
      setLoading(false);
    }
  };

  const createPayment = async (data: CreatePaymentInput) => {
    try {
      const id = await PaymentsService.createPayment(data);

      toast.success('Pago registrado exitosamente');

      if (invoiceId) {
        fetchPaymentsByInvoice(invoiceId);
      }

      return id;
    } catch {
      toast.error('Error al registrar el pago');
      throw new Error('Error al registrar el pago');
    }
  };

  const cancelPayment = async (paymentId: string) => {
    try {
      await PaymentsService.cancelPayment(paymentId);

      toast.success('Pago cancelado correctamente');

      if (invoiceId) {
        fetchPaymentsByInvoice(invoiceId);
      }
    } catch {
      toast.error('Error al cancelar el pago');
      throw new Error('Error al cancelar el pago');
    }
  };

  return {
    payments,
    loading,
    createPayment,
    cancelPayment,
    fetchPaymentsByInvoice,
  };
}
