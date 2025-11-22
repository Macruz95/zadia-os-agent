/**
 * ZADIA OS - Work Periods Service
 * 
 * Manages temporary work periods for employees
 */

import {
    collection,
    doc,
    getDocs,
    addDoc,
    updateDoc,
    query,
    where,
    orderBy,
    Timestamp,
    getDoc,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { logger } from '@/lib/logger';
import type { WorkPeriod } from '../types/hr.types';
import { LoansService } from './loans.service';

const COLLECTION = 'workPeriods';

export class WorkPeriodsService {
    /**
     * Start a new work period
     */
    static async startPeriod(
        employeeId: string,
        dailyRate: number,
        startDate: Date = new Date()
    ): Promise<WorkPeriod> {
        try {
            // Check if there's already an active period
            const activePeriod = await this.getActivePeriod(employeeId);
            if (activePeriod) {
                throw new Error('El empleado ya tiene una temporada activa');
            }

            const periodData = {
                employeeId,
                startDate: Timestamp.fromDate(startDate),
                status: 'active' as const,
                dailyRate,
                currency: 'USD',
                totalDays: 0,
                totalSalary: 0,
                totalLoans: 0,
                netPayable: 0,
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now(),
            };

            const docRef = await addDoc(collection(db, COLLECTION), periodData);

            logger.info('Work period started', { employeeId, periodId: docRef.id });

            return {
                id: docRef.id,
                ...periodData,
            } as WorkPeriod;
        } catch (error) {
            logger.error('Error starting work period', error as Error);
            throw error;
        }
    }

    /**
     * End a work period (Calculate totals)
     */
    static async endPeriod(
        periodId: string,
        endDate: Date = new Date()
    ): Promise<WorkPeriod> {
        try {
            const period = await this.getPeriodById(periodId);
            if (!period) throw new Error('Periodo no encontrado');

            if (period.status === 'completed') {
                throw new Error('El periodo ya está finalizado');
            }

            // Calculate totals
            const start = period.startDate.toDate();
            const end = endDate;

            // Calculate days difference (inclusive)
            const diffTime = Math.abs(end.getTime() - start.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include start day

            const totalSalary = diffDays * period.dailyRate;

            // Get loans
            const loans = await LoansService.getLoansByPeriod(periodId);
            const totalLoans = loans.reduce((sum, loan) => sum + loan.amount, 0);

            const netPayable = totalSalary - totalLoans;

            const updateData = {
                endDate: Timestamp.fromDate(endDate),
                status: 'completed' as const,
                totalDays: diffDays,
                totalSalary,
                totalLoans,
                netPayable,
                updatedAt: Timestamp.now(),
            };

            await updateDoc(doc(db, COLLECTION, periodId), updateData);

            logger.info('Work period ended', { periodId, netPayable });

            return {
                ...period,
                ...updateData,
            };
        } catch (error) {
            logger.error('Error ending work period', error as Error);
            throw error;
        }
    }

    /**
     * Get active period for employee
     */
    static async getActivePeriod(employeeId: string): Promise<WorkPeriod | null> {
        try {
            const q = query(
                collection(db, COLLECTION),
                where('employeeId', '==', employeeId),
                where('status', '==', 'active'),
                orderBy('startDate', 'desc')
            );

            const snapshot = await getDocs(q);

            if (snapshot.empty) return null;

            return {
                id: snapshot.docs[0].id,
                ...snapshot.docs[0].data(),
            } as WorkPeriod;
        } catch (error) {
            logger.error('Error getting active period', error as Error);
            return null;
        }
    }

    /**
     * Get all periods for employee
     */
    static async getPeriodsByEmployee(employeeId: string): Promise<WorkPeriod[]> {
        try {
            const q = query(
                collection(db, COLLECTION),
                where('employeeId', '==', employeeId),
                orderBy('startDate', 'desc')
            );

            const snapshot = await getDocs(q);

            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            })) as WorkPeriod[];
        } catch (error) {
            logger.error('Error getting employee periods', error as Error);
            return [];
        }
    }

    /**
     * Get period by ID
     */
    static async getPeriodById(id: string): Promise<WorkPeriod | null> {
        try {
            const docSnap = await getDoc(doc(db, COLLECTION, id));
            if (!docSnap.exists()) return null;

            return {
                id: docSnap.id,
                ...docSnap.data(),
            } as WorkPeriod;
        } catch (error) {
            logger.error('Error getting period by id', error as Error);
            return null;
        }
    }

    /**
     * Recalculate totals (useful when adding loans)
     */
    static async recalculateTotals(periodId: string): Promise<void> {
        try {
            const period = await this.getPeriodById(periodId);
            if (!period) return;

            // Calculate days so far
            const start = period.startDate.toDate();
            const end = period.endDate ? period.endDate.toDate() : new Date();

            const diffTime = Math.abs(end.getTime() - start.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

            const totalSalary = diffDays * period.dailyRate;

            const loans = await LoansService.getLoansByPeriod(periodId);
            const totalLoans = loans.reduce((sum, loan) => sum + loan.amount, 0);

            const netPayable = totalSalary - totalLoans;

            await updateDoc(doc(db, COLLECTION, periodId), {
                totalDays: diffDays,
                totalSalary,
                totalLoans,
                netPayable,
                updatedAt: Timestamp.now(),
            });
        } catch (error) {
            logger.error('Error recalculating totals', error as Error);
        }
    }
}
