/**
 * ZADIA OS - useEmployees Hook
 * 
 * Custom hook for employee management
 * REGLA 4: Modular
 * REGLA 5: <200 líneas
 */

import { useState, useEffect, useCallback } from 'react';
import { EmployeesService } from '../services/employees.service';
import type { Employee, EmployeeStatus } from '../types/hr.types';
import type { EmployeeFormData } from '../validations/hr.validation';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

export function useEmployees(statusFilter?: EmployeeStatus) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  /**
   * Fetch employees
   */
  const fetchEmployees = useCallback(async () => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const data = statusFilter
        ? await EmployeesService.getEmployeesByStatus(statusFilter, user.uid)
        : await EmployeesService.getAllEmployees(user.uid);

      setEmployees(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar empleados';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, user?.uid]);

  /**
   * Create employee
   */
  const createEmployee = async (
    data: EmployeeFormData,
    userId: string
  ): Promise<boolean> => {
    try {
      await EmployeesService.createEmployee(data, userId);
      toast.success('Empleado creado correctamente');
      await fetchEmployees();
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al crear empleado';
      toast.error(message);
      return false;
    }
  };

  /**
   * Update employee
   */
  const updateEmployee = async (
    id: string,
    data: Partial<EmployeeFormData>
  ): Promise<boolean> => {
    try {
      await EmployeesService.updateEmployee(id, data);
      toast.success('Empleado actualizado correctamente');
      await fetchEmployees();
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al actualizar empleado';
      toast.error(message);
      return false;
    }
  };

  /**
   * Delete employee (soft)
   */
  const deleteEmployee = async (id: string): Promise<boolean> => {
    try {
      await EmployeesService.deleteEmployee(id);
      toast.success('Empleado desactivado correctamente');
      await fetchEmployees();
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al desactivar empleado';
      toast.error(message);
      return false;
    }
  };

  /**
   * Change employee status
   */
  const changeStatus = async (
    id: string,
    status: EmployeeStatus
  ): Promise<boolean> => {
    try {
      await EmployeesService.changeStatus(id, status);
      toast.success('Estado actualizado correctamente');
      await fetchEmployees();
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cambiar estado';
      toast.error(message);
      return false;
    }
  };

  /**
   * Get employee by ID
   */
  const getEmployee = async (id: string): Promise<Employee | null> => {
    try {
      return await EmployeesService.getEmployeeById(id);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar empleado';
      toast.error(message);
      return null;
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  return {
    employees,
    loading,
    error,
    fetchEmployees,
    createEmployee,
    updateEmployee,
    deleteEmployee,
    changeStatus,
    getEmployee,
  };
}
