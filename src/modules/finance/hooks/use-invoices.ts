// src/modules/finance/hooks/use-invoices.ts

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useTenantId } from '@/contexts/TenantContext';
import { InvoicesService } from '../services/invoices.service';
import type {
  Invoice,
  InvoiceFilters,
  InvoiceStats,
} from '../types/finance.types';
import type {
  CreateInvoiceInput,
  UpdateInvoiceInput,
} from '../validations/finance.validation';

/**
 * Hook para gestionar facturas
 * Proporciona métodos para crear, buscar y actualizar facturas
 */
export function useInvoices(filters: InvoiceFilters = {}) {
  const tenantId = useTenantId();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [stats, setStats] = useState<InvoiceStats | null>(null);
  const [loading, setLoading] = useState(true);

  // Cargar facturas al montar o cambiar filtros o tenant
  useEffect(() => {
    if (tenantId) {
      fetchInvoices();
    }
  }, [JSON.stringify(filters), tenantId]);

  // Cargar estadísticas
  useEffect(() => {
    if (tenantId) {
      fetchStats();
    }
  }, [filters.clientId, tenantId]);

  const fetchInvoices = async () => {
    if (!tenantId) return;
    
    try {
      setLoading(true);
      const data = await InvoicesService.searchInvoices({ ...filters, tenantId }, tenantId);
      setInvoices(data);
    } catch {
      toast.error('Error al cargar las facturas');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    if (!tenantId) return;
    
    try {
      const data = await InvoicesService.getInvoiceStats(filters.clientId, tenantId);
      setStats(data);
    } catch {
      // Silently fail for stats
    }
  };

  const createInvoice = async (data: CreateInvoiceInput) => {
    if (!tenantId) throw new Error('No tenant ID');
    
    try {
      const id = await InvoicesService.createInvoice(data, tenantId);

      toast.success(`Factura ${data.number} creada exitosamente`);

      fetchInvoices();
      fetchStats();

      return id;
    } catch {
      toast.error('Error al crear la factura');
      throw new Error('Error al crear la factura');
    }
  };

  const updateInvoice = async (
    invoiceId: string,
    updates: UpdateInvoiceInput
  ) => {
    try {
      await InvoicesService.updateInvoice(invoiceId, updates);

      toast.success('Factura actualizada correctamente');

      fetchInvoices();
      fetchStats();
    } catch {
      toast.error('Error al actualizar la factura');
      throw new Error('Error al actualizar la factura');
    }
  };

  const applyPayment = async (invoiceId: string, amount: number) => {
    try {
      await InvoicesService.applyPayment(invoiceId, amount);

      toast.success('Pago registrado correctamente');

      fetchInvoices();
      fetchStats();
    } catch {
      toast.error('Error al aplicar el pago');
      throw new Error('Error al aplicar el pago');
    }
  };

  return {
    invoices,
    stats,
    loading,
    fetchInvoices,
    createInvoice,
    updateInvoice,
    applyPayment,
  };
}
