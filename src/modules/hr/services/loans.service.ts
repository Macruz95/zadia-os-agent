/**
 * ZADIA OS - Loans Service
 * 
 * Manages employee loans and advances
 */

import {
    collection,
    addDoc,
    getDocs,
    updateDoc,
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
        approvedBy: string,
        tenantId?: string
    ): Promise<Loan> {
        try {
            const loanData = {
                employeeId,
                workPeriodId,
                amount,
                remainingBalance: amount, // Inicialmente el saldo es igual al monto
                reason,
                date: Timestamp.now(),
                status: 'pending' as const, // Will be deducted on period close
                approvedBy,
                tenantId: tenantId || '',
                createdAt: Timestamp.now(),
            };

            const docRef = await addDoc(collection(db, COLLECTION), loanData);

            // Import dynamically to avoid circular dependency
            const { WorkPeriodsService } = await import('./work-periods.service');
            await WorkPeriodsService.recalculateTotals(workPeriodId, tenantId);

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
    static async getLoansByPeriod(workPeriodId: string, tenantId?: string): Promise<Loan[]> {
        try {
            const constraints = [
                where('workPeriodId', '==', workPeriodId),
                orderBy('date', 'desc')
            ];
            
            if (tenantId) {
                constraints.unshift(where('tenantId', '==', tenantId));
            }
            
            const q = query(collection(db, COLLECTION), ...constraints);

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
     * Get all loans for an employee (across all periods)
     */
    static async getLoansByEmployee(employeeId: string, tenantId?: string): Promise<Loan[]> {
        try {
            const constraints = [
                where('employeeId', '==', employeeId),
                orderBy('date', 'desc')
            ];
            
            if (tenantId) {
                constraints.unshift(where('tenantId', '==', tenantId));
            }
            
            const q = query(collection(db, COLLECTION), ...constraints);

            const snapshot = await getDocs(q);

            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            })) as Loan[];
        } catch (error) {
            logger.error('Error getting employee loans', error as Error);
            return [];
        }
    }

    /**
     * Update loan status
     */
    static async updateLoanStatus(
        loanId: string, 
        status: Loan['status']
    ): Promise<void> {
        try {
            await updateDoc(doc(db, COLLECTION, loanId), { status });

            logger.info('Loan status updated', {
                component: 'LoansService',
                metadata: { loanId, status },
            });
        } catch (error) {
            logger.error('Error updating loan status', error as Error);
            throw error;
        }
    }

    /**
     * Delete loan (if mistake made)
     */
    static async deleteLoan(loanId: string, workPeriodId: string, tenantId?: string): Promise<void> {
        try {
            await deleteDoc(doc(db, COLLECTION, loanId));

            // Import dynamically to avoid circular dependency
            const { WorkPeriodsService } = await import('./work-periods.service');
            await WorkPeriodsService.recalculateTotals(workPeriodId, tenantId);

            logger.info('Loan deleted', { 
                component: 'LoansService',
                metadata: { loanId } 
            });
        } catch (error) {
            logger.error('Error deleting loan', error as Error);
            throw error;
        }
    }

    /**
     * Get pending loans that need to be carried over
     */
    static async getPendingLoans(workPeriodId: string): Promise<Loan[]> {
        try {
            const q = query(
                collection(db, COLLECTION),
                where('workPeriodId', '==', workPeriodId),
                where('status', '==', 'pending')
            );

            const snapshot = await getDocs(q);

            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            })) as Loan[];
        } catch (error) {
            logger.error('Error getting pending loans', error as Error);
            return [];
        }
    }
}
