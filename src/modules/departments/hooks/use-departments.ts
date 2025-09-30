import { useState, useEffect, useCallback } from 'react';
import { DepartmentsService } from '../services/departments.service';
import { Department } from '../types/departments.types';
import { logger } from '@/lib/logger';

export function useDepartments(countryId?: string) {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDepartments = useCallback(async (countryIdParam?: string) => {
    const id = countryIdParam || countryId;
    
    try {
      setLoading(true);
      setError(null);
      
      let data: Department[];
      if (id) {
        data = await DepartmentsService.getDepartmentsByCountry(id);
      } else {
        data = await DepartmentsService.getDepartments();
      }
      
      setDepartments(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      logger.error('Error fetching departments:', err as Error);
    } finally {
      setLoading(false);
    }
  }, [countryId]);

  useEffect(() => {
    fetchDepartments();
  }, [fetchDepartments]);

  const getDepartmentById = (id: string) => {
    return departments.find(department => department.id === id);
  };

  const createDepartment = useCallback(async (departmentData: Omit<Department, 'id'>) => {
    try {
      setError(null);
      const newDepartmentId = await DepartmentsService.createDepartment(departmentData);
      const newDepartment = { ...departmentData, id: newDepartmentId };
      setDepartments(prev => [newDepartment, ...prev]);
      logger.info(`Department created: ${newDepartment.name}`);
      return newDepartment;
    } catch (err) {
      const errorMessage = 'Error al crear departamento';
      setError(errorMessage);
      logger.error('Error creating department:', err as Error);
      throw err;
    }
  }, []);

  const updateDepartment = useCallback(async (id: string, updates: Partial<Omit<Department, 'id'>>) => {
    try {
      setError(null);
      await DepartmentsService.updateDepartment(id, updates);
      setDepartments(prev => prev.map(department => 
        department.id === id ? { ...department, ...updates } : department
      ));
      logger.info(`Department updated: ${id}`);
    } catch (err) {
      const errorMessage = 'Error al actualizar departamento';
      setError(errorMessage);
      logger.error('Error updating department:', err as Error);
      throw err;
    }
  }, []);

  const deleteDepartment = useCallback(async (id: string) => {
    try {
      setError(null);
      await DepartmentsService.deleteDepartment(id);
      setDepartments(prev => prev.map(department => 
        department.id === id ? { ...department, isActive: false } : department
      ));
      logger.info(`Department deleted: ${id}`);
    } catch (err) {
      const errorMessage = 'Error al eliminar departamento';
      setError(errorMessage);
      logger.error('Error deleting department:', err as Error);
      throw err;
    }
  }, []);

  return {
    departments,
    loading,
    error,
    getDepartments: fetchDepartments,
    refetch: fetchDepartments,
    getDepartmentById,
    createDepartment,
    updateDepartment,
    deleteDepartment
  };
}