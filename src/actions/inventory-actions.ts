'use server';

import { adminDb } from '@/lib/firebase-admin';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { FieldValue } from 'firebase-admin/firestore';

// Schema for validation
const CreateInventoryReservationSchema = z.object({
    itemId: z.string().min(1, "Item ID is required"),
    itemType: z.enum(['raw-material', 'finished-product']),
    quantity: z.number().positive("Quantity must be positive"),
    projectId: z.string().optional(),
    quoteId: z.string().optional(),
    reservedBy: z.string().optional(),
    notes: z.string().optional(),
    expectedDeliveryDate: z.string().or(z.date()).transform(val => new Date(val)).optional(),
});

export type CreateInventoryReservationState = {
    success?: boolean;
    error?: string;
    message?: string;
    reservationId?: string;
    availableStock?: number;
};

/**
 * Server Action: Create Inventory Reservation and Reduce Stock
 * Executes atomically using Firestore Transaction
 */
export async function createInventoryReservationAction(
    prevState: CreateInventoryReservationState,
    formData: FormData
): Promise<CreateInventoryReservationState> {
    try {
        // Parse and validate data
        const rawData = {
            itemId: formData.get('itemId'),
            itemType: formData.get('itemType'),
            quantity: Number(formData.get('quantity')),
            projectId: formData.get('projectId') || undefined,
            quoteId: formData.get('quoteId') || undefined,
            reservedBy: formData.get('reservedBy') || 'system',
            notes: formData.get('notes') || undefined,
            expectedDeliveryDate: formData.get('expectedDeliveryDate') || undefined,
        };

        const validated = CreateInventoryReservationSchema.safeParse(rawData);

        if (!validated.success) {
            return {
                success: false,
                error: validated.error.issues[0].message,
            };
        }

        const { itemId, itemType, quantity, projectId, quoteId, reservedBy, notes, expectedDeliveryDate } = validated.data;

        let createdReservationId: string | null = null;
        let finalAvailableStock = 0;

        // Execute Transaction
        await adminDb.runTransaction(async (transaction) => {
            // 1. Get Item Reference (either raw material or finished product)
            const collectionName = itemType === 'raw-material' ? 'rawMaterials' : 'finishedProducts';
            const itemRef = adminDb.collection(collectionName).doc(itemId);
            const itemDoc = await transaction.get(itemRef);

            if (!itemDoc.exists) {
                throw new Error(`${itemType === 'raw-material' ? 'Material' : 'Producto'} no encontrado`);
            }

            const itemData = itemDoc.data();
            const currentStock = itemData?.currentStock || 0;
            const itemName = itemData?.name || 'Unknown';
            const itemSku = itemData?.sku || '';
            const unitCost = itemData?.unitCost || itemData?.totalCost || 0;

            // 2. Validate sufficient stock
            if (currentStock < quantity) {
                throw new Error(
                    `Stock insuficiente. Disponible: ${currentStock}, Solicitado: ${quantity}`
                );
            }

            const newStock = currentStock - quantity;
            finalAvailableStock = newStock;

            // 3. Create Reservation Document
            const reservationRef = adminDb.collection('inventoryReservations').doc();
            createdReservationId = reservationRef.id;

            const reservationData = {
                itemId: itemId,
                itemType: itemType,
                itemName: itemName,
                itemSku: itemSku,
                quantity: quantity,
                unitCost: unitCost,
                totalCost: unitCost * quantity,
                projectId: projectId || null,
                quoteId: quoteId || null,
                status: 'reserved',
                reservedAt: FieldValue.serverTimestamp(),
                reservedBy: reservedBy,
                expectedDeliveryDate: expectedDeliveryDate ? FieldValue.serverTimestamp() : null,
                notes: notes || null,
                createdAt: FieldValue.serverTimestamp(),
                updatedAt: FieldValue.serverTimestamp(),
            };

            transaction.set(reservationRef, reservationData);

            // 4. Update Item Stock
            transaction.update(itemRef, {
                currentStock: newStock,
                lastMovementDate: FieldValue.serverTimestamp(),
                updatedAt: FieldValue.serverTimestamp(),
            });

            // 5. Create Inventory Movement Record
            const movementRef = adminDb.collection('inventoryMovements').doc();
            const movementData = {
                itemId: itemId,
                itemType: itemType,
                itemName: itemName,
                itemSku: itemSku,
                movementType: 'Salida',
                quantity: quantity,
                unitCost: unitCost,
                totalCost: unitCost * quantity,
                previousStock: currentStock,
                newStock: newStock,
                reason: 'Reserva de inventario',
                referenceDocument: 'Reservation',
                referenceId: reservationRef.id,
                location: itemData?.location || { warehouse: 'default' },
                performedBy: reservedBy,
                performedAt: FieldValue.serverTimestamp(),
                notes: notes || `Reserva para ${projectId ? `proyecto ${projectId}` : quoteId ? `cotización ${quoteId}` : 'uso general'}`,
            };

            transaction.set(movementRef, movementData);

            // 6. Check if stock is below minimum and create alert if needed
            const minimumStock = itemData?.minimumStock || 0;
            if (newStock < minimumStock) {
                const alertRef = adminDb.collection('inventoryAlerts').doc();
                const alertData = {
                    itemId: itemId,
                    itemType: itemType,
                    itemName: itemName,
                    itemSku: itemSku,
                    alertType: 'low-stock',
                    currentStock: newStock,
                    minimumStock: minimumStock,
                    severity: newStock === 0 ? 'critical' : 'warning',
                    message: newStock === 0
                        ? `¡CRÍTICO! ${itemName} sin stock disponible`
                        : `Stock bajo: ${itemName} (${newStock} unidades, mínimo: ${minimumStock})`,
                    isResolved: false,
                    createdAt: FieldValue.serverTimestamp(),
                };
                transaction.set(alertRef, alertData);
            }
        });

        // Revalidate cache to update UI immediately
        revalidatePath('/inventory');
        revalidatePath('/inventory/reservations');
        if (projectId) {
            revalidatePath(`/projects/${projectId}`);
        }

        return {
            success: true,
            reservationId: createdReservationId!,
            availableStock: finalAvailableStock,
            message: finalAvailableStock === 0
                ? 'Reserva creada. ⚠️ Stock agotado.'
                : `Reserva creada. Stock disponible: ${finalAvailableStock}`,
        };

    } catch (error) {
        console.error('Error creating inventory reservation:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Error desconocido al crear reserva',
        };
    }
}

/**
 * Server Action: Cancel Inventory Reservation and Restore Stock
 */
export async function cancelInventoryReservationAction(
    reservationId: string
): Promise<CreateInventoryReservationState> {
    try {
        await adminDb.runTransaction(async (transaction) => {
            // 1. Get Reservation
            const reservationRef = adminDb.collection('inventoryReservations').doc(reservationId);
            const reservationDoc = await transaction.get(reservationRef);

            if (!reservationDoc.exists) {
                throw new Error("Reserva no encontrada");
            }

            const reservationData = reservationDoc.data();

            if (reservationData?.status === 'cancelled') {
                throw new Error("La reserva ya fue cancelada");
            }

            // 2. Get Item and restore stock
            const collectionName = reservationData?.itemType === 'raw-material' ? 'rawMaterials' : 'finishedProducts';
            const itemRef = adminDb.collection(collectionName).doc(reservationData?.itemId);
            const itemDoc = await transaction.get(itemRef);

            if (itemDoc.exists) {
                const currentStock = itemDoc.data()?.currentStock || 0;
                const restoredStock = currentStock + (reservationData?.quantity || 0);

                transaction.update(itemRef, {
                    currentStock: restoredStock,
                    lastMovementDate: FieldValue.serverTimestamp(),
                    updatedAt: FieldValue.serverTimestamp(),
                });

                // 3. Create movement record
                const movementRef = adminDb.collection('inventoryMovements').doc();
                transaction.set(movementRef, {
                    itemId: reservationData?.itemId,
                    itemType: reservationData?.itemType,
                    itemName: reservationData?.itemName,
                    itemSku: reservationData?.itemSku,
                    movementType: 'Devolucion',
                    quantity: reservationData?.quantity,
                    unitCost: reservationData?.unitCost || 0,
                    totalCost: (reservationData?.unitCost || 0) * (reservationData?.quantity || 0),
                    previousStock: currentStock,
                    newStock: restoredStock,
                    reason: 'Cancelación de reserva',
                    referenceDocument: 'Reservation',
                    referenceId: reservationId,
                    location: itemDoc.data()?.location || { warehouse: 'default' },
                    performedBy: 'system',
                    performedAt: FieldValue.serverTimestamp(),
                    notes: 'Stock restaurado por cancelación de reserva',
                });
            }

            // 4. Update reservation status
            transaction.update(reservationRef, {
                status: 'cancelled',
                cancelledAt: FieldValue.serverTimestamp(),
                updatedAt: FieldValue.serverTimestamp(),
            });
        });

        revalidatePath('/inventory');
        revalidatePath('/inventory/reservations');

        return {
            success: true,
            message: 'Reserva cancelada y stock restaurado',
        };

    } catch (error) {
        console.error('Error cancelling reservation:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Error desconocido al cancelar reserva',
        };
    }
}
