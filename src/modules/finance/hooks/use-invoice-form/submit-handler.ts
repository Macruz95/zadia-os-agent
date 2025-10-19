/**
 * ZADIA OS - Invoice Form Submit Handler
 * Manejo de envío del formulario
 * Rule #5: Max 200 lines per file
 */

import { toast } from 'sonner';
import { InvoicesService } from '../../services/invoices.service';
import type { InvoiceFormData } from './types';

/**
 * Validar datos del formulario
 */
function validateFormData(formData: InvoiceFormData): string | null {
  if (!formData.clientId || !formData.clientName) {
    return 'Ingrese los datos del cliente';
  }

  if (formData.items.length === 0) {
    return 'Agregue al menos un ítem';
  }

  const hasInvalidItems = formData.items.some(
    (item) =>
      !item.description ||
      Number(item.quantity) <= 0 ||
      Number(item.unitPrice) <= 0
  );

  if (hasInvalidItems) {
    return 'Verifique que todos los ítems tengan datos válidos';
  }

  return null;
}

/**
 * Manejar submit del formulario
 */
export async function handleInvoiceSubmit(
  formData: InvoiceFormData,
  userId: string
): Promise<string | null> {
  // Validar
  const validationError = validateFormData(formData);
  if (validationError) {
    toast.error(validationError);
    return null;
  }

  try {
    // Generar número
    const number = await InvoicesService.generateInvoiceNumber();

    // Calcular totales
    const subtotal = formData.items.reduce(
      (sum, item) => sum + Number(item.subtotal),
      0
    );
    const taxAmount = (subtotal * 16) / 100;
    const total = subtotal + taxAmount;

    // Crear factura
    await InvoicesService.createInvoice({
      number,
      status: 'draft',
      clientId: formData.clientId,
      clientName: formData.clientName,
      ...(formData.quoteId && { quoteId: formData.quoteId }),
      ...(formData.quoteNumber && { quoteNumber: formData.quoteNumber }),
      ...(formData.projectId && { projectId: formData.projectId }),
      items: formData.items.map((item) => ({
        description: item.description,
        quantity: Number(item.quantity),
        unitPrice: Number(item.unitPrice),
        discount: Number(item.discount),
        subtotal: Number(item.subtotal),
        unitOfMeasure: item.unitOfMeasure,
      })),
      subtotal,
      taxes: { IVA: 16 },
      discounts: 0,
      total,
      currency: formData.currency,
      issueDate: new Date(formData.issueDate),
      dueDate: new Date(formData.dueDate),
      paymentTerms: formData.paymentTerms,
      notes: formData.notes || undefined,
      createdBy: userId,
    });

    toast.success(`Factura ${number} creada exitosamente`);
    return number;
  } catch {
    toast.error('Error al crear la factura');
    return null;
  }
}
