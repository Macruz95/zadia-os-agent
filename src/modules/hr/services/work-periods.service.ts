/**
 * ZADIA OS - Work Periods Service
 * 
 * Manages temporary work periods for employees
 * Includes debt carryover between periods and bonus tracking
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
import { BonusesService } from './bonuses.service';

const COLLECTION = 'workPeriods';

export class WorkPeriodsService {
    /**
     * Start a new work period
     * Automatically carries over any remaining debt from previous periods
     */
    static async startPeriod(
        employeeId: string,
        dailyRate: number,
        startDate: Date = new Date(),
        userId?: string
    ): Promise<WorkPeriod> {
        try {
            // Check if there's already an active period
            const activePeriod = await this.getActivePeriod(employeeId);
            if (activePeriod) {
                throw new Error('El empleado ya tiene una temporada activa');
            }

            // Check for carried debt from previous periods
            const previousPeriods = await this.getPeriodsByEmployee(employeeId);
            let carriedDebt = 0;
            let previousPeriodId: string | undefined;

            // Find the most recent completed period with remaining debt
            const lastPeriodWithDebt = previousPeriods.find(
                p => p.status === 'completed' && (p.remainingDebt || 0) > 0
            );

            if (lastPeriodWithDebt) {
                carriedDebt = lastPeriodWithDebt.remainingDebt || 0;
                previousPeriodId = lastPeriodWithDebt.id;
                
                // Clear the remaining debt from the previous period (it's now transferred)
                await updateDoc(doc(db, COLLECTION, lastPeriodWithDebt.id), {
                    remainingDebt: 0,
                    updatedAt: Timestamp.now(),
                });

                logger.info('Debt carried over from previous period', {
                    component: 'WorkPeriodsService',
                    metadata: { 
                        previousPeriodId: lastPeriodWithDebt.id, 
                        carriedDebt 
                    },
                });
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
                totalBonuses: 0,
                carriedDebt,
                netPayable: -carriedDebt, // Start negative if there's carried debt
                remainingDebt: 0,
                previousPeriodId,
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now(),
                userId,
            };

            const docRef = await addDoc(collection(db, COLLECTION), periodData);

            logger.info('Work period started', { 
                component: 'WorkPeriodsService',
                employeeId,
                metadata: { periodId: docRef.id, carriedDebt } 
            });

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
     * If netPayable is negative, the debt is stored as remainingDebt for next period
     */
    static async endPeriod(
        periodId: string,
        endDate: Date = new Date(),
        carryDebtToNextPeriod: boolean = true // Option to carry debt
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
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

            const totalSalary = diffDays * period.dailyRate;

            // Get loans
            const loans = await LoansService.getLoansByPeriod(periodId);
            const totalLoans = loans.reduce((sum, loan) => sum + loan.amount, 0);

            // Get bonuses
            const totalBonuses = await BonusesService.calculateTotalBonuses(periodId);

            // Calculate net: Salary + Bonuses - Loans - Carried Debt
            const carriedDebt = period.carriedDebt || 0;
            const grossPayable = totalSalary + totalBonuses;
            const totalDeductions = totalLoans + carriedDebt;
            let netPayable = grossPayable - totalDeductions;

            // Handle negative balance (debt to carry)
            let remainingDebt = 0;
            if (netPayable < 0 && carryDebtToNextPeriod) {
                remainingDebt = Math.abs(netPayable);
                netPayable = 0; // Nothing to pay this period
                
                // Mark unpaid loans as 'carried'
                for (const loan of loans.filter(l => l.status === 'pending')) {
                    await LoansService.updateLoanStatus(loan.id, 'carried');
                }
            }

            const updateData = {
                endDate: Timestamp.fromDate(endDate),
                status: 'completed' as const,
                totalDays: diffDays,
                totalSalary,
                totalLoans,
                totalBonuses,
                netPayable,
                remainingDebt,
                updatedAt: Timestamp.now(),
            };

            await updateDoc(doc(db, COLLECTION, periodId), updateData);

            logger.info('Work period ended', { 
                component: 'WorkPeriodsService',
                metadata: { 
                    periodId, 
                    netPayable, 
                    remainingDebt,
                    totalBonuses,
                } 
            });

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
            // First try with orderBy (requires composite index)
            const q = query(
                collection(db, COLLECTION),
                where('employeeId', '==', employeeId),
                where('status', '==', 'active'),
                orderBy('startDate', 'desc')
            );

            const snapshot = await getDocs(q);

            if (snapshot.empty) {
                logger.info('No active period found for employee', {
                    component: 'WorkPeriodsService',
                    metadata: { employeeId }
                });
                return null;
            }

            const period = {
                id: snapshot.docs[0].id,
                ...snapshot.docs[0].data(),
            } as WorkPeriod;
            
            logger.info('Found active period', {
                component: 'WorkPeriodsService',
                metadata: { employeeId, periodId: period.id, dailyRate: period.dailyRate }
            });

            return period;
        } catch (error) {
            // If index is not ready, try without orderBy
            logger.warn('Falling back to query without orderBy', {
                component: 'WorkPeriodsService',
                metadata: { employeeId, error: String(error) }
            });
            
            try {
                const q = query(
                    collection(db, COLLECTION),
                    where('employeeId', '==', employeeId),
                    where('status', '==', 'active')
                );
                const snapshot = await getDocs(q);
                
                if (snapshot.empty) return null;
                
                // Sort manually by startDate descending
                const docs = snapshot.docs.sort((a, b) => {
                    const aDate = a.data().startDate?.toDate?.() || new Date(0);
                    const bDate = b.data().startDate?.toDate?.() || new Date(0);
                    return bDate.getTime() - aDate.getTime();
                });
                
                return {
                    id: docs[0].id,
                    ...docs[0].data(),
                } as WorkPeriod;
            } catch (fallbackError) {
                logger.error('Error getting active period (fallback)', fallbackError as Error);
                return null;
            }
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
     * Recalculate totals (useful when adding loans or bonuses)
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

            // Get loans
            const loans = await LoansService.getLoansByPeriod(periodId);
            const totalLoans = loans.reduce((sum, loan) => sum + loan.amount, 0);

            // Get bonuses
            const totalBonuses = await BonusesService.calculateTotalBonuses(periodId);

            // Calculate net including carried debt
            const carriedDebt = period.carriedDebt || 0;
            const netPayable = totalSalary + totalBonuses - totalLoans - carriedDebt;

            await updateDoc(doc(db, COLLECTION, periodId), {
                totalDays: diffDays,
                totalSalary,
                totalLoans,
                totalBonuses,
                netPayable,
                updatedAt: Timestamp.now(),
            });
        } catch (error) {
            logger.error('Error recalculating totals', error as Error);
        }
    }

    /**
     * Update daily rate for a period
     * This is useful when the employee's base salary changes
     */
    static async updateDailyRate(periodId: string, newDailyRate: number): Promise<void> {
        try {
            await updateDoc(doc(db, COLLECTION, periodId), {
                dailyRate: newDailyRate,
                updatedAt: Timestamp.now(),
            });

            // Recalculate totals with new rate
            await this.recalculateTotals(periodId);

            logger.info('Daily rate updated', {
                component: 'WorkPeriodsService',
                metadata: { periodId, newDailyRate },
            });
        } catch (error) {
            logger.error('Error updating daily rate', error as Error);
            throw error;
        }
    }

    /**
     * Get total carried debt for an employee across all periods
     */
    static async getTotalCarriedDebt(employeeId: string): Promise<number> {
        try {
            const periods = await this.getPeriodsByEmployee(employeeId);
            return periods.reduce((sum, p) => sum + (p.remainingDebt || 0), 0);
        } catch (error) {
            logger.error('Error getting total carried debt', error as Error);
            return 0;
        }
    }

    /**
     * Update an existing work period
     * Allows editing dates, daily rate, and notes
     */
    static async updatePeriod(
        periodId: string,
        data: {
            startDate?: Date;
            endDate?: Date | null;
            dailyRate?: number;
            notes?: string;
        }
    ): Promise<void> {
        try {
            const updateData: Record<string, unknown> = {
                updatedAt: Timestamp.now(),
            };

            if (data.startDate !== undefined) {
                updateData.startDate = Timestamp.fromDate(data.startDate);
            }
            if (data.endDate !== undefined) {
                updateData.endDate = data.endDate ? Timestamp.fromDate(data.endDate) : null;
            }
            if (data.dailyRate !== undefined) {
                updateData.dailyRate = data.dailyRate;
            }
            if (data.notes !== undefined) {
                updateData.notes = data.notes;
            }

            await updateDoc(doc(db, COLLECTION, periodId), updateData);

            // Recalculate totals if dates or rate changed
            if (data.startDate !== undefined || data.endDate !== undefined || data.dailyRate !== undefined) {
                await this.recalculateTotals(periodId);
            }

            logger.info('Work period updated', {
                component: 'WorkPeriodsService',
                metadata: { periodId, updates: Object.keys(data) },
            });
        } catch (error) {
            logger.error('Error updating work period', error as Error);
            throw error;
        }
    }
}
