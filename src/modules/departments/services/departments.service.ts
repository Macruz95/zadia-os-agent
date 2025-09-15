import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  Timestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Department, departmentSchema } from '../types/departments.types';
import { MOCK_DEPARTMENTS } from '../mock-departments';

/**
 * Departments Service
 * Handles department CRUD operations with Firebase Firestore
 */
export class DepartmentsService {

  /**
   * Get all active departments
   */
  static async getDepartments(): Promise<Department[]> {
    try {
      const departmentsRef = collection(db, 'departments');
      const q = query(departmentsRef, where('isActive', '==', true), orderBy('name'));
      const querySnapshot = await getDocs(q);

      const departments: Department[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const department = {
          id: doc.id,
          ...data,
          createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(),
          updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : new Date()
        };

        departments.push(departmentSchema.parse(department));
      });

      // If no departments in Firestore, return mock data
      if (departments.length === 0) {
        return MOCK_DEPARTMENTS;
      }

      return departments;
    } catch (error) {
      console.warn('Error fetching departments from Firestore, using mock data:', error);
      return MOCK_DEPARTMENTS;
    }
  }

  /**
   * Get departments by country ID
   */
  static async getDepartmentsByCountry(countryId: string): Promise<Department[]> {
    try {
      const departmentsRef = collection(db, 'departments');
      const q = query(
        departmentsRef,
        where('countryId', '==', countryId),
        where('isActive', '==', true),
        orderBy('name')
      );
      const querySnapshot = await getDocs(q);

      const departments: Department[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const department = {
          id: doc.id,
          ...data,
          createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(),
          updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : new Date()
        };

        departments.push(departmentSchema.parse(department));
      });

      // If no departments in Firestore, return mock data filtered by country
      if (departments.length === 0) {
        return MOCK_DEPARTMENTS.filter(dept => dept.countryId === countryId);
      }

      return departments;
    } catch (error) {
      console.warn('Error fetching departments from Firestore, using mock data:', error);
      return MOCK_DEPARTMENTS.filter(dept => dept.countryId === countryId);
    }
  }

  /**
   * Get department by ID
   */
  static async getDepartmentById(id: string): Promise<Department | null> {
    try {
      const departmentRef = doc(db, 'departments', id);
      const departmentSnap = await getDoc(departmentRef);

      if (!departmentSnap.exists()) {
        // Try to find in mock data
        const mockDepartment = MOCK_DEPARTMENTS.find(dept => dept.id === id);
        return mockDepartment || null;
      }

      const data = departmentSnap.data();
      const department = {
        id: departmentSnap.id,
        ...data,
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(),
        updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : new Date()
      };

      return departmentSchema.parse(department);
    } catch (error) {
      console.warn('Error fetching department from Firestore, using mock data:', error);
      const mockDepartment = MOCK_DEPARTMENTS.find(dept => dept.id === id);
      return mockDepartment || null;
    }
  }

  /**
   * Create new department
   */
  static async createDepartment(departmentData: Omit<Department, 'id'>): Promise<string> {
    try {
      const validatedData = departmentSchema.omit({ id: true }).parse(departmentData);

      const departmentsRef = collection(db, 'departments');
      const docRef = await addDoc(departmentsRef, {
        ...validatedData,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });

      return docRef.id;
    } catch (error) {
      throw new Error(`Error creating department: ${error}`);
    }
  }

  /**
   * Update department
   */
  static async updateDepartment(id: string, updates: Partial<Omit<Department, 'id'>>): Promise<void> {
    try {
      const departmentRef = doc(db, 'departments', id);
      await updateDoc(departmentRef, {
        ...updates,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      throw new Error(`Error updating department: ${error}`);
    }
  }

  /**
   * Delete department (soft delete)
   */
  static async deleteDepartment(id: string): Promise<void> {
    try {
      const departmentRef = doc(db, 'departments', id);
      await updateDoc(departmentRef, {
        isActive: false,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      throw new Error(`Error deleting department: ${error}`);
    }
  }
}