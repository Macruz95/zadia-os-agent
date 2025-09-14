import { Department } from '../types/departments.types';

/**
 * Search departments by name or code
 */
export function searchDepartments(departments: Department[], query: string): Department[] {
  if (!query.trim()) return departments;

  const lowerQuery = query.toLowerCase();
  return departments.filter(department =>
    department.name.toLowerCase().includes(lowerQuery) ||
    (department.code && department.code.toLowerCase().includes(lowerQuery))
  );
}

/**
 * Get department display name with code
 */
export function getDepartmentDisplayName(department: Department): string {
  if (department.code) {
    return `${department.name} (${department.code})`;
  }
  return department.name;
}