'use server';

import { adminDb } from '@/lib/firebase-admin';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { FieldValue } from 'firebase-admin/firestore';

// Schema for validation
const CreateExpenseSchema = z.object({
    projectId: z.string().min(1, "Project ID is required"),
    amount: z.number().positive("Amount must be positive"),
    description: z.string().min(1, "Description is required"),
    category: z.string().default('general'),
    date: z.string().or(z.date()).transform(val => new Date(val)),
    createdBy: z.string().optional(),
    createdByName: z.string().optional(),
});

export type CreateExpenseState = {
    success?: boolean;
    error?: string;
    message?: string;
};

/**
 * Server Action: Create Expense and Update Project Budget
 * Executes atomically using Firestore Transaction
 */
export async function createExpenseAction(prevState: CreateExpenseState, formData: FormData): Promise<CreateExpenseState> {
    try {
        // Parse and validate data
        const rawData = {
            projectId: formData.get('projectId'),
            amount: Number(formData.get('amount')),
            description: formData.get('description'),
            category: formData.get('category'),
            date: formData.get('date') || new Date(),
            createdBy: formData.get('createdBy'),
            createdByName: formData.get('createdByName'),
        };

        const validated = CreateExpenseSchema.safeParse(rawData);

        if (!validated.success) {
            return {
                success: false,
                error: validated.error.issues[0].message,
            };
        }

        const { projectId, amount, description, category, date, createdBy, createdByName } = validated.data;

        // Execute Transaction
        await adminDb.runTransaction(async (transaction) => {
            // 1. Get Project Reference
            const projectRef = adminDb.collection('projects').doc(projectId);
            const projectDoc = await transaction.get(projectRef);

            if (!projectDoc.exists) {
                throw new Error("Project not found");
            }

            // 2. Create Expense Document
            const expenseRef = adminDb.collection('expenses').doc();
            const expenseData = {
                projectId,
                amount,
                description,
                category,
                date: FieldValue.serverTimestamp(), // Use server timestamp for consistency
                createdAt: FieldValue.serverTimestamp(),
                createdBy: createdBy || 'system',
                createdByName: createdByName || 'System',
            };

            transaction.set(expenseRef, expenseData);

            // 3. Update Project Budget
            // We increment budgetSpent and decrement remainingBudget atomically
            transaction.update(projectRef, {
                budgetSpent: FieldValue.increment(amount),
                remainingBudget: FieldValue.increment(-amount),
                updatedAt: FieldValue.serverTimestamp(),
            });
        });

        // Revalidate cache to update UI immediately
        revalidatePath(`/projects/${projectId}`);
        revalidatePath('/dashboard');

        return {
            success: true,
            message: 'Gasto registrado y presupuesto actualizado correctamente.',
        };

    } catch (error) {
        console.error('Error creating expense:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Error desconocido al registrar gasto',
        };
    }
}
