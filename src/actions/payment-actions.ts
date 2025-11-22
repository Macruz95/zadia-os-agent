'use server';

import { adminDb } from '@/lib/firebase-admin';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { FieldValue } from 'firebase-admin/firestore';
import { logger } from '@/lib/logger';

// Schema for validation
const RecordPaymentSchema = z.object({
    invoiceId: z.string().min(1, "Invoice ID is required"),
    amount: z.number().positive("Amount must be positive"),
    method: z.enum(['cash', 'bank-transfer', 'credit-card', 'debit-card', 'check', 'other']),
    reference: z.string().optional(),
    notes: z.string().optional(),
    paymentDate: z.string().or(z.date()).transform(val => new Date(val)).optional(),
    recordedBy: z.string().optional(),
    recordedByName: z.string().optional(),
});

export type RecordPaymentState = {
    success?: boolean;
    error?: string;
    message?: string;
    paymentId?: string;
    invoiceFullyPaid?: boolean;
};

/**
 * Server Action: Record Payment and Update Invoice/Project
 * Executes atomically using Firestore Transaction
 */
export async function recordPaymentAction(
    prevState: RecordPaymentState,
    formData: FormData
): Promise<RecordPaymentState> {
    try {
        // Parse and validate data
        const rawData = {
            invoiceId: formData.get('invoiceId'),
            amount: Number(formData.get('amount')),
            method: formData.get('method'),
            reference: formData.get('reference') || undefined,
            notes: formData.get('notes') || undefined,
            paymentDate: formData.get('paymentDate') || new Date(),
            recordedBy: formData.get('recordedBy') || 'system',
            recordedByName: formData.get('recordedByName') || 'System',
        };

        const validated = RecordPaymentSchema.safeParse(rawData);

        if (!validated.success) {
            return {
                success: false,
                error: validated.error.issues[0].message,
            };
        }

        const { invoiceId, amount, method, reference, notes, paymentDate, recordedBy, recordedByName } = validated.data;

        let createdPaymentId: string | null = null;
        let isInvoiceFullyPaid = false;

        // Execute Transaction
        await adminDb.runTransaction(async (transaction) => {
            // 1. Get Invoice Reference
            const invoiceRef = adminDb.collection('invoices').doc(invoiceId);
            const invoiceDoc = await transaction.get(invoiceRef);

            if (!invoiceDoc.exists) {
                throw new Error("Invoice not found");
            }

            const invoiceData = invoiceDoc.data();
            const currentAmountPaid = invoiceData?.amountPaid || 0;
            const totalAmount = invoiceData?.total || 0;
            const newAmountPaid = currentAmountPaid + amount;
            const newAmountDue = totalAmount - newAmountPaid;

            // Validate payment doesn't exceed total
            if (newAmountPaid > totalAmount) {
                throw new Error(`Payment amount exceeds invoice total. Maximum allowed: ${totalAmount - currentAmountPaid}`);
            }

            // 2. Create Payment Document
            const paymentRef = adminDb.collection('payments').doc();
            createdPaymentId = paymentRef.id;

            const paymentData = {
                invoiceId: invoiceId,
                invoiceNumber: invoiceData?.number || '',
                clientId: invoiceData?.clientId || '',
                clientName: invoiceData?.clientName || '',
                amount: amount,
                currency: invoiceData?.currency || 'USD',
                method: method,
                status: 'completed',
                reference: reference || null,
                notes: notes || null,
                paymentDate: paymentDate ? FieldValue.serverTimestamp() : FieldValue.serverTimestamp(),
                createdAt: FieldValue.serverTimestamp(),
                updatedAt: FieldValue.serverTimestamp(),
                recordedBy: recordedBy,
                recordedByName: recordedByName,
            };

            transaction.set(paymentRef, paymentData);

            // 3. Update Invoice
            const invoiceUpdates: {
                amountPaid: number;
                amountDue: number;
                updatedAt: FieldValue;
                status?: string;
                paidDate?: FieldValue;
            } = {
                amountPaid: newAmountPaid,
                amountDue: newAmountDue,
                updatedAt: FieldValue.serverTimestamp(),
            };

            // Determine new invoice status
            if (newAmountDue === 0) {
                invoiceUpdates.status = 'paid';
                invoiceUpdates.paidDate = FieldValue.serverTimestamp();
                isInvoiceFullyPaid = true;
            } else if (newAmountPaid > 0 && newAmountPaid < totalAmount) {
                invoiceUpdates.status = 'partially-paid';
            }

            transaction.update(invoiceRef, invoiceUpdates);

            // 4. Update Project if invoice is fully paid
            if (isInvoiceFullyPaid && invoiceData?.projectId) {
                const projectRef = adminDb.collection('projects').doc(invoiceData.projectId);
                const projectDoc = await transaction.get(projectRef);

                if (projectDoc.exists) {
                    transaction.update(projectRef, {
                        fullyPaid: true,
                        paidAt: FieldValue.serverTimestamp(),
                        updatedAt: FieldValue.serverTimestamp(),
                    });
                }
            }
        });

        // Revalidate cache to update UI immediately
        revalidatePath(`/finance/invoices/${invoiceId}`);
        revalidatePath('/finance/invoices');
        revalidatePath('/finance/payments');
        revalidatePath('/dashboard');

        return {
            success: true,
            paymentId: createdPaymentId!,
            invoiceFullyPaid: isInvoiceFullyPaid,
            message: isInvoiceFullyPaid
                ? 'Pago registrado. Factura marcada como pagada y proyecto actualizado.'
                : 'Pago registrado correctamente.',
        };

    } catch (error) {
        logger.error('Error recording payment', error as Error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Error desconocido al registrar pago',
        };
    }
}
