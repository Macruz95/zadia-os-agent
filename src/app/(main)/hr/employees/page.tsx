/**
 * ZADIA OS - Employees Page
 * 
 * Main page for employee management
 * REGLA 2: ShadCN UI + Lucide icons
 * REGLA 5: <200 líneas
 */

'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmployeesList } from '@/modules/hr/components/employees/EmployeesList';
import { EmployeeFormDialog } from '@/modules/hr/components/employees/EmployeeFormDialog';
import { useEmployees } from '@/modules/hr/hooks/use-employees';
import type { Employee } from '@/modules/hr/types/hr.types';
import type { EmployeeFormData } from '@/modules/hr/validations/hr.validation';

export default function EmployeesPage() {
  const {
    employees,
    loading,
    error,
    createEmployee,
    updateEmployee,
    deleteEmployee,
  } = useEmployees();

  const [formOpen, setFormOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  const handleDelete = async (id: string) => {
    await deleteEmployee(id);
  };

  const handleEdit = (employee: Employee) => {
    setSelectedEmployee(employee);
    setFormOpen(true);
  };

  const handleCreate = () => {
    setSelectedEmployee(null);
    setFormOpen(true);
  };

  const handleFormSubmit = async (data: EmployeeFormData) => {
    if (selectedEmployee) {
      await updateEmployee(selectedEmployee.id, data);
    } else {
      // Get userId from localStorage or context
      const userId = localStorage.getItem('userId') || 'system';
      await createEmployee(data, userId);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Cargando empleados...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-destructive">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Empleados</h1>
          <p className="text-muted-foreground">
            Gestiona el personal de tu organización
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Empleado
        </Button>
      </div>

      {/* List */}
      <EmployeesList
        employees={employees}
        onDelete={handleDelete}
        onEdit={handleEdit}
      />

      {/* Form Dialog */}
      <EmployeeFormDialog
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setSelectedEmployee(null);
        }}
        onSubmit={handleFormSubmit}
        employee={selectedEmployee || undefined}
      />
    </div>
  );
}
