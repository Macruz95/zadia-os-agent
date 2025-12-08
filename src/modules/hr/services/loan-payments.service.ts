/**
 * ZADIA OS - Loan Payments Service
 * 
 * Manages loan payment records (abonos a préstamos)
 */

import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp,
  doc,
  runTransaction,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { logger } from '@/lib/logger';
import type { LoanPayment, Loan } from '../types/hr.types';

const COLLECTION = 'loanPayments';
const LOANS_COLLECTION = 'loans';

export class LoanPaymentsService {
  /**
   * Add a payment to a loan
   * Updates both the payment record and the loan's remaining balance
   */
  static async addPayment(
    loanId: string,
    employeeId: string,
    workPeriodId: string,
    amount: number,
    paymentType: LoanPayment['paymentType'],
    processedBy: string,
    notes?: string,
    tenantId?: string
  ): Promise<LoanPayment> {
    try {
      return await runTransaction(db, async (transaction) => {
        // Get the loan first
        const loanRef = doc(db, LOANS_COLLECTION, loanId);
        const loanSnap = await transaction.get(loanRef);
        
        if (!loanSnap.exists()) {
          throw new Error('Préstamo no encontrado');
        }
        
        const loan = { id: loanSnap.id, ...loanSnap.data() } as Loan;
        const balanceBefore = loan.remainingBalance ?? loan.amount;
        
        if (amount > balanceBefore) {
          throw new Error(`El abono ($${amount}) no puede ser mayor al saldo pendiente ($${balanceBefore})`);
        }
        
        const balanceAfter = balanceBefore - amount;
        
        // Create payment record
        const paymentData = {
          loanId,
          employeeId,
          workPeriodId,
          amount,
          paymentType,
          balanceBefore,
          balanceAfter,
          notes: notes || '',
          processedBy,
          tenantId: tenantId || '',
          createdAt: Timestamp.now(),
        };
        
        // Add payment document
        const paymentRef = doc(collection(db, COLLECTION));
        transaction.set(paymentRef, paymentData);
        
        // Update loan remaining balance and status
        const newStatus: Loan['status'] = balanceAfter === 0 ? 'paid' : 'partial';
        transaction.update(loanRef, {
          remainingBalance: balanceAfter,
          status: newStatus,
        });
        
        logger.info('Loan payment added', {
          component: 'LoanPaymentsService',
          metadata: { loanId, amount, balanceAfter, newStatus },
        });
        
        return {
          id: paymentRef.id,
          ...paymentData,
        } as LoanPayment;
      });
    } catch (error) {
      logger.error('Error adding loan payment', error as Error);
      throw error;
    }
  }

  /**
   * Get all payments for a specific loan
   */
  static async getPaymentsByLoan(loanId: string): Promise<LoanPayment[]> {
    try {
      const q = query(
        collection(db, COLLECTION),
        where('loanId', '==', loanId),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(q);

      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as LoanPayment[];
    } catch (error) {
      logger.error('Error getting loan payments', error as Error);
      return [];
    }
  }

  /**
   * Get all payments for an employee
   */
  static async getPaymentsByEmployee(employeeId: string): Promise<LoanPayment[]> {
    try {
      const q = query(
        collection(db, COLLECTION),
        where('employeeId', '==', employeeId),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(q);

      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as LoanPayment[];
    } catch (error) {
      logger.error('Error getting employee payments', error as Error);
      return [];
    }
  }

  /**
   * Get payments by work period
   */
  static async getPaymentsByPeriod(workPeriodId: string): Promise<LoanPayment[]> {
    try {
      const q = query(
        collection(db, COLLECTION),
        where('workPeriodId', '==', workPeriodId),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(q);

      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as LoanPayment[];
    } catch (error) {
      logger.error('Error getting period payments', error as Error);
      return [];
    }
  }

  /**
   * Process automatic deduction for a loan in a period
   * Used when closing a work period
   */
  static async processAutomaticDeduction(
    loan: Loan,
    deductionAmount: number,
    workPeriodId: string,
    processedBy: string,
    tenantId?: string
  ): Promise<LoanPayment | null> {
    if (loan.status === 'paid' || (loan.remainingBalance ?? loan.amount) <= 0) {
      return null; // Already paid
    }

    const actualDeduction = Math.min(deductionAmount, loan.remainingBalance ?? loan.amount);

    return this.addPayment(
      loan.id,
      loan.employeeId,
      workPeriodId,
      actualDeduction,
      'deduction',
      processedBy,
      'Descuento automático de nómina',
      tenantId
    );
  }
}
