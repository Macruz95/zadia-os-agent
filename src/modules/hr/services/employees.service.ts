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
   * @param data - Employee form data
   * @param userId - User creating the employee
   * @param tenantId - Required tenant ID for data isolation
   */
  static async createEmployee(
    data: EmployeeFormData,
    userId: string,
    tenantId?: string
  ): Promise<Employee> {
    if (!tenantId) {
      throw new Error('tenantId is required for data isolation');
    }
    
    try {
      const employeeData = {
        ...data,
        tenantId, // CRITICAL: Add tenant isolation
        userId,
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
        metadata: { employeeId: docRef.id, tenantId },
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
   * Get all employees for a tenant
   * @param tenantId - Required tenant ID for data isolation
   * @param userId - Optional user ID for additional filtering
   */
  static async getAllEmployees(tenantId: string, userId?: string): Promise<Employee[]> {
    if (!tenantId) {
      logger.warn('getAllEmployees called without tenantId', { component: 'EmployeesService' });
      return [];
    }
    
    try {
      // Filter by tenantId for data isolation
      const q = query(
        collection(db, COLLECTION),
        where('tenantId', '==', tenantId),
        orderBy('lastName', 'asc')
      );

      const snapshot = await getDocs(q);
      const employeesResult: Employee[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Employee[];

      // Sort by lastName
      employeesResult.sort((a, b) => (a.lastName || '').localeCompare(b.lastName || ''));

      logger.info('getAllEmployees: query returned', {
        component: 'EmployeesService',
        tenantId,
        count: employeesResult.length,
      });

      if (employeesResult.length === 0) {
        logger.info('No employees found for tenant', {
          component: 'EmployeesService',
          metadata: { tenantId }
        });
      }

      return employeesResult;
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
          // Fallback: get all employees for tenant and sort manually
          const fallbackQ = query(
            collection(db, COLLECTION),
            where('tenantId', '==', tenantId)
          );
          const snapshot = await getDocs(fallbackQ);
          const employees = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as Employee[];
          
          // Sort manually by lastName
          const sorted = employees.sort((a, b) =>
            (a.lastName || '').localeCompare(b.lastName || '')
          );

          logger.info('getAllEmployees (fallback): returned', {
            component: 'EmployeesService',
            tenantId,
            count: sorted.length,
          });

          return sorted;
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
   * Get employees by status for a tenant
   */
  static async getEmployeesByStatus(
    status: EmployeeStatus,
    tenantId: string
  ): Promise<Employee[]> {
    if (!tenantId) {
      return [];
    }
    
    try {
      const q = query(
        collection(db, COLLECTION),
        where('tenantId', '==', tenantId),
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
      logger.error('Error fetching employees by status', err, { status, tenantId });
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
