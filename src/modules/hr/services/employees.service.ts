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
   */
  static async getAllEmployees(): Promise<Employee[]> {
    try {
      const q = query(
        collection(db, COLLECTION),
        orderBy('lastName', 'asc')
      );
      
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Employee[];
    } catch (error) {
      logger.error('Error fetching employees');
      throw error;
    }
  }

  /**
   * Get employees by status
   */
  static async getEmployeesByStatus(
    status: EmployeeStatus
  ): Promise<Employee[]> {
    try {
      const q = query(
        collection(db, COLLECTION),
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
