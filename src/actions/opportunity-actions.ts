'use server';

import { adminDb } from '@/lib/firebase-admin';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';

// Schema for validation
const MarkOpportunityAsWonSchema = z.object({
    opportunityId: z.string().min(1, "Opportunity ID is required"),
    projectName: z.string().optional(),
    projectDescription: z.string().optional(),
    startDate: z.string().or(z.date()).transform(val => new Date(val)).optional(),
    estimatedEndDate: z.string().or(z.date()).transform(val => new Date(val)).optional(),
    projectManager: z.string().optional(),
    priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
});

export type MarkOpportunityAsWonState = {
    success?: boolean;
    error?: string;
    message?: string;
    projectId?: string;
};

/**
 * Server Action: Mark Opportunity as Won and Create Project
 * Executes atomically using Firestore Transaction
 */
export async function markOpportunityAsWonAction(
    prevState: MarkOpportunityAsWonState,
    formData: FormData
): Promise<MarkOpportunityAsWonState> {
    try {
        // Parse and validate data
        const rawData = {
            opportunityId: formData.get('opportunityId'),
            projectName: formData.get('projectName') || undefined,
            projectDescription: formData.get('projectDescription') || undefined,
            startDate: formData.get('startDate') || new Date(),
            estimatedEndDate: formData.get('estimatedEndDate') || undefined,
            projectManager: formData.get('projectManager') || undefined,
            priority: formData.get('priority') || 'medium',
        };

        const validated = MarkOpportunityAsWonSchema.safeParse(rawData);

        if (!validated.success) {
            return {
                success: false,
                error: validated.error.issues[0].message,
            };
        }

        const { opportunityId, projectName, projectDescription, startDate, estimatedEndDate, projectManager, priority } = validated.data;

        let createdProjectId: string | null = null;

        // Execute Transaction
        await adminDb.runTransaction(async (transaction) => {
            // 1. Get Opportunity Reference
            const opportunityRef = adminDb.collection('opportunities').doc(opportunityId);
            const opportunityDoc = await transaction.get(opportunityRef);

            if (!opportunityDoc.exists) {
                throw new Error("Opportunity not found");
            }

            const opportunityData = opportunityDoc.data();

            // 2. Validate opportunity can be marked as won
            if (opportunityData?.status === 'won') {
                throw new Error("Opportunity is already marked as won");
            }

            // 3. Create Project Document
            const projectRef = adminDb.collection('projects').doc();
            createdProjectId = projectRef.id;

            const projectData = {
                name: projectName || opportunityData?.name || `Project from ${opportunityId}`,
                description: projectDescription || opportunityData?.notes || '',
                projectType: 'service', // Default type
                status: 'planning',
                priority: priority,

                // Relations
                clientId: opportunityData?.clientId || '',
                clientName: '', // Will be populated by client lookup if needed
                opportunityId: opportunityId,
                quoteId: null,
                quoteNumber: null,

                // Financial
                salesPrice: opportunityData?.estimatedValue || 0,
                estimatedCost: (opportunityData?.estimatedValue || 0) * 0.7, // 70% cost estimate
                actualCost: 0,
                currency: opportunityData?.currency || 'USD',
                paymentTerms: '',

                // Dates
                startDate: startDate ? Timestamp.fromDate(startDate) : FieldValue.serverTimestamp(),
                estimatedEndDate: estimatedEndDate ? Timestamp.fromDate(estimatedEndDate) : null,
                actualStartDate: null,
                actualEndDate: null,

                // Team
                projectManager: projectManager || opportunityData?.assignedTo || 'system',
                teamMembers: [],

                // Progress
                progressPercent: 0,

                // BOM and Materials
                bomId: null,
                materialsCost: 0,
                laborCost: 0,
                overheadCost: 0,

                // Metadata
                tags: ['created-from-opportunity'],
                createdAt: FieldValue.serverTimestamp(),
                updatedAt: FieldValue.serverTimestamp(),
                createdBy: 'system', // TODO: Pass actual user ID
                updatedBy: null,
            };

            transaction.set(projectRef, projectData);

            // 4. Update Opportunity Status
            transaction.update(opportunityRef, {
                status: 'won',
                stage: 'closed-won',
                closedAt: FieldValue.serverTimestamp(),
                projectId: projectRef.id,
                updatedAt: FieldValue.serverTimestamp(),
            });
        });

        // Revalidate cache to update UI immediately
        revalidatePath(`/sales/opportunities/${opportunityId}`);
        revalidatePath('/sales/opportunities');
        revalidatePath('/projects');
        revalidatePath('/dashboard');

        return {
            success: true,
            projectId: createdProjectId!,
            message: 'Oportunidad marcada como ganada y proyecto creado automáticamente.',
        };

    } catch (error) {
        console.error('Error marking opportunity as won:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Error desconocido al procesar oportunidad',
        };
    }
}
