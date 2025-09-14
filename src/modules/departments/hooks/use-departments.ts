import { useState, useEffect, useCallback } from 'react';
import { DepartmentsService } from '../services/departments.service';
import { Department } from '../types/departments.types';

export function useDepartments(countryId?: string) {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchDepartments = useCallback(async (countryIdParam?: string) => {
    const id = countryIdParam || countryId;
    if (!id) {
      setDepartments([]);
      return;
    }

    try {
      setLoading(true);
      const data = await DepartmentsService.getDepartmentsByCountry(id);
      setDepartments(data);
    } catch (err) {
      console.error('Error fetching departments:', err);
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

  return {
    departments,
    loading,
    refetch: fetchDepartments,
    getDepartmentById
  };
}