/**
 * ZADIA OS - Loans Service
 * 
 * Manages employee loans and advances
 */

import {
    collection,
    addDoc,
    getDocs,
    query,
    where,
    orderBy,
    Timestamp,
    deleteDoc,
    doc,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { logger } from '@/lib/logger';
import type { Loan } from '../types/hr.types';
import { WorkPeriodsService } from './work-periods.service';

const COLLECTION = 'loans';

export class LoansService {
    /**
     * Add a new loan
     */
    static async addLoan(
        employeeId: string,
        workPeriodId: string,
        amount: number,
        reason: string,
        approvedBy: string
    ): Promise<Loan> {
        try {
            const loanData = {
                employeeId,
                workPeriodId,
                amount,
                reason,
                date: Timestamp.now(),
                status: 'pending' as const, // Will be deducted on period close
                approvedBy,
                createdAt: Timestamp.now(),
            };

            const docRef = await addDoc(collection(db, COLLECTION), loanData);

            // Recalculate period totals
            await WorkPeriodsService.recalculateTotals(workPeriodId);

            logger.info('Loan added', { 
                component: 'LoansService',
                metadata: { employeeId, amount } 
            });

            return {
                id: docRef.id,
                ...loanData,
            } as Loan;
        } catch (error) {
            logger.error('Error adding loan', error as Error);
            throw error;
        }
    }

    /**
     * Get loans by period
     */
    static async getLoansByPeriod(workPeriodId: string): Promise<Loan[]> {
        try {
            const q = query(
                collection(db, COLLECTION),
                where('workPeriodId', '==', workPeriodId),
                orderBy('date', 'desc')
            );

            const snapshot = await getDocs(q);

            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            })) as Loan[];
        } catch (error) {
            logger.error('Error getting loans', error as Error);
            return [];
        }
    }

    /**
     * Delete loan (if mistake made)
     */
    static async deleteLoan(loanId: string, workPeriodId: string): Promise<void> {
        try {
            await deleteDoc(doc(db, COLLECTION, loanId));

            // Recalculate period totals
            await WorkPeriodsService.recalculateTotals(workPeriodId);

            logger.info('Loan deleted', { 
                component: 'LoansService',
                metadata: { loanId } 
            });
        } catch (error) {
            logger.error('Error deleting loan', error as Error);
            throw error;
        }
    }
}
