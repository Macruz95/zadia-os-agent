/**
 * ZADIA OS - Employees Service
 * 
 * CRUD operations for employees
 * REGLA 1: Firebase real
 * REGLA 4: Modular
 * REGLA 5: <250 líneas
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { FirebaseError } from 'firebase/app';
import { db } from '@/lib/firebase';
import { logger } from '@/lib/logger';
import type { Employee, EmployeeStatus } from '../types/hr.types';
import type { EmployeeFormData } from '../validations/hr.validation';

const COLLECTION = 'employees';

export class EmployeesService {
  /**
   * Create new employee
   */
  static async createEmployee(
    data: EmployeeFormData,
    userId: string
  ): Promise<Employee> {
    try {
      const employeeData = {
        ...data,
        userId, // Add userId for data isolation
        birthDate: Timestamp.fromDate(data.birthDate),
        hireDate: Timestamp.fromDate(data.hireDate),
        terminationDate: data.terminationDate
          ? Timestamp.fromDate(data.terminationDate)
          : null,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        createdBy: userId,
      };

      const docRef = await addDoc(collection(db, COLLECTION), employeeData);

      logger.info('Employee created', {
        metadata: { employeeId: docRef.id },
      });

      return {
        id: docRef.id,
        ...employeeData,
      } as Employee;
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Error creating employee');
      logger.error('Error creating employee', err);
      throw err;
    }
  }

  /**
   * Get employee by ID
   */
  static async getEmployeeById(id: string): Promise<Employee> {
    try {
      const docRef = doc(db, COLLECTION, id);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        throw new Error('Empleado no encontrado');
      }

      return {
        id: docSnap.id,
        ...docSnap.data(),
      } as Employee;
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Error fetching employee');
      logger.error('Error fetching employee', err, { employeeId: id });
      throw err;
    }
  }

  /**
   * Get all employees
   * Includes both user-owned employees and legacy employees without userId
   */
  static async getAllEmployees(userId: string): Promise<Employee[]> {
    try {
      // First, try to get employees with userId filter
      const q = query(
        collection(db, COLLECTION),
        where('userId', '==', userId),
        orderBy('lastName', 'asc')
      );

      const snapshot = await getDocs(q);
      let employees = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Employee[];

      // Also try to get legacy employees without userId field
      // This handles employees created before userId was required
      try {
        const allDocsSnapshot = await getDocs(collection(db, COLLECTION));
        const legacyEmployees = allDocsSnapshot.docs
          .filter(doc => !doc.data().userId) // Only those without userId
          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as Employee[];
        
        // Merge and deduplicate
        const existingIds = new Set(employees.map(e => e.id));
        for (const legacy of legacyEmployees) {
          if (!existingIds.has(legacy.id)) {
            employees.push(legacy);
          }
        }
      } catch (legacyError) {
        // If we can't get legacy employees, that's ok - just use the filtered ones
        logger.warn('Could not fetch legacy employees', {
          component: 'EmployeesService',
          metadata: { error: String(legacyError) }
        });
      }

      // Sort by lastName
      employees.sort((a, b) => (a.lastName || '').localeCompare(b.lastName || ''));

      if (employees.length === 0) {
        logger.info('No employees found in database', {
          component: 'EmployeesService',
        });
      }

      return employees;
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Unknown error');

      // Only retry for Firestore index errors (failed-precondition)
      if (
        error instanceof FirebaseError &&
        (error.code === 'failed-precondition' || err.message?.includes('index'))
      ) {
        logger.warn('Index missing, retrying without orderBy', {
          component: 'EmployeesService',
          metadata: { errorMessage: err.message }
        });

        try {
          // Fallback: get all employees and filter/sort manually
          const snapshot = await getDocs(collection(db, COLLECTION));
          const employees = snapshot.docs
            .map((doc) => ({
              id: doc.id,
              ...doc.data(),
            })) as Employee[];
          
          // Filter: only show user's employees OR legacy employees without userId
          const filtered = employees.filter(e => !e.userId || e.userId === userId);
          
          // Sort manually by lastName
          return filtered.sort((a, b) => 
            (a.lastName || '').localeCompare(b.lastName || '')
          );
        } catch (retryError) {
          logger.error(
            'Retry without orderBy failed',
            retryError instanceof Error ? retryError : new Error('Unknown retry error'),
            { component: 'EmployeesService' }
          );
          throw retryError;
        }
      }

      // For other errors (permissions, network, etc), don't retry
      logger.error('Error fetching employees', err, { component: 'EmployeesService' });
      throw err;
    }
  }

  /**
   * Get employees by status
   */
  static async getEmployeesByStatus(
    status: EmployeeStatus,
    userId: string
  ): Promise<Employee[]> {
    try {
      const q = query(
        collection(db, COLLECTION),
        where('userId', '==', userId),
        where('status', '==', status),
        orderBy('lastName', 'asc')
      );

      const snapshot = await getDocs(q);

      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Employee[];
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Error fetching employees by status');
      logger.error('Error fetching employees by status', err, { status });
      throw err;
    }
  }

  /**
   * Update employee
   * If salary changes and there's an active period, also update the period's daily rate
   */
  static async updateEmployee(
    id: string,
    data: Partial<EmployeeFormData>
  ): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION, id);

      const updateData: Record<string, unknown> = {
        ...data,
        updatedAt: Timestamp.now(),
      };

      // Convert dates if present
      if (data.birthDate) {
        updateData.birthDate = Timestamp.fromDate(data.birthDate);
      }
      if (data.hireDate) {
        updateData.hireDate = Timestamp.fromDate(data.hireDate);
      }
      if (data.terminationDate) {
        updateData.terminationDate = Timestamp.fromDate(data.terminationDate);
      }

      await updateDoc(docRef, updateData);
      
      logger.info('Employee update data received', {
        component: 'EmployeesService',
        metadata: { 
          employeeId: id, 
          hasSalary: data.salary !== undefined,
          salaryValue: data.salary,
          salaryType: typeof data.salary
        }
      });

      // If salary was updated, sync with active work period
      // Check for salary being a valid number (not undefined, not null, not NaN)
      if (typeof data.salary === 'number' && !isNaN(data.salary)) {
        try {
          // Import dynamically to avoid circular dependency
          const { WorkPeriodsService } = await import('./work-periods.service');
          const activePeriod = await WorkPeriodsService.getActivePeriod(id);
          
          logger.info('Checking for active period to sync salary', {
            component: 'EmployeesService',
            metadata: { 
              employeeId: id, 
              hasActivePeriod: !!activePeriod,
              activePeriodId: activePeriod?.id,
              newSalary: data.salary
            }
          });
          
          if (activePeriod) {
            await WorkPeriodsService.updateDailyRate(activePeriod.id, data.salary);
            logger.info('Active period daily rate synced with employee salary', {
              employeeId: id,
              metadata: { periodId: activePeriod.id, newRate: data.salary }
            });
          }
        } catch (syncError) {
          // Log but don't fail the main update
          logger.error('Could not sync salary with active period', syncError as Error, {
            component: 'EmployeesService',
            metadata: { employeeId: id, salary: data.salary }
          });
        }
      }

      logger.info('Employee updated', { employeeId: id });
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Error updating employee');
      logger.error('Error updating employee', err, { employeeId: id });
      throw err;
    }
  }

  /**
   * Delete employee (soft delete by changing status)
   */
  static async deleteEmployee(id: string): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION, id);

      await updateDoc(docRef, {
        status: 'inactive',
        terminationDate: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });

      logger.info('Employee deactivated', { employeeId: id });
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Error deactivating employee');
      logger.error('Error deactivating employee', err, { employeeId: id });
      throw err;
    }
  }

  /**
   * Hard delete employee (permanent)
   */
  static async hardDeleteEmployee(id: string): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION, id);
      await deleteDoc(docRef);

      logger.info('Employee permanently deleted', { employeeId: id });
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Error deleting employee');
      logger.error('Error deleting employee', err, { employeeId: id });
      throw err;
    }
  }

  /**
   * Change employee status
   */
  static async changeStatus(
    id: string,
    status: EmployeeStatus
  ): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION, id);

      await updateDoc(docRef, {
        status,
        updatedAt: Timestamp.now(),
      });

      logger.info('Employee status changed', { employeeId: id, status });
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Error changing employee status');
      logger.error('Error changing employee status', err, { employeeId: id, status });
      throw err;
    }
  }
}
