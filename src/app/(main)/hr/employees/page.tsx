/**
 * ZADIA OS - Employees Page
 * 
 * Main page for employee management
 * REGLA 2: ShadCN UI + Lucide icons
 * REGLA 5: <200 líneas
 */

'use client';

import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmployeesList } from '@/modules/hr/components/employees/EmployeesList';
import { EmployeeFormDialog } from '@/modules/hr/components/employees/EmployeeFormDialog';
import { useEmployees } from '@/modules/hr/hooks/use-employees';
import { useAuth } from '@/contexts/AuthContext';
import { useTenant } from '@/contexts/TenantContext';
import type { Employee } from '@/modules/hr/types/hr.types';
import type { EmployeeFormData } from '@/modules/hr/validations/hr.validation';
import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function EmployeesPage() {
  const {
    employees,
    loading,
    error,
    createEmployee,
    updateEmployee,
    deleteEmployee,
  } = useEmployees();
  
  const { user, firebaseUser } = useAuth();
  const { tenant } = useTenant();
  const [debugInfo, setDebugInfo] = useState<Record<string, unknown>>({});

  const [formOpen, setFormOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [showDebug, setShowDebug] = useState(false);

  // Debug: verificar conexión Firebase y datos
  useEffect(() => {
    async function runDiagnostics() {
      const userId = firebaseUser?.uid || user?.uid;
      
      if (!userId || !tenant?.id) {
        setDebugInfo({
          status: 'waiting',
          userId: userId || 'NO USER',
          firebaseUserUid: firebaseUser?.uid || 'NO FIREBASE USER',
          userProfileUid: user?.uid || 'NO USER PROFILE',
          tenantId: tenant?.id || 'NO TENANT',
        });
        return;
      }

      const info: Record<string, unknown> = {
        userId,
        firebaseUserUid: firebaseUser?.uid,
        userProfileUid: user?.uid,
        tenantId: tenant.id,
        tenantName: tenant.name,
      };

      try {
        // 1. Verificar si existe el documento tenantMember
        const memberDocId = `${tenant.id}_${userId}`;
        const memberRef = doc(db, 'tenantMembers', memberDocId);
        const memberSnap = await getDoc(memberRef);
        info.tenantMemberExists = memberSnap.exists();
        info.tenantMemberDocId = memberDocId;
        if (memberSnap.exists()) {
          info.tenantMemberData = memberSnap.data();
        }

        // 2. Query directa a employees sin filtro (solo para debug)
        const allEmployeesSnap = await getDocs(collection(db, 'employees'));
        info.totalEmployeesInCollection = allEmployeesSnap.size;
        info.allEmployeesTenantIds = allEmployeesSnap.docs.map(d => ({
          id: d.id,
          tenantId: d.data().tenantId,
          firstName: d.data().firstName,
          lastName: d.data().lastName,
        }));

        // 3. Query filtrada por tenantId
        const filteredQuery = query(
          collection(db, 'employees'),
          where('tenantId', '==', tenant.id)
        );
        const filteredSnap = await getDocs(filteredQuery);
        info.employeesForThisTenant = filteredSnap.size;
        info.filteredEmployees = filteredSnap.docs.map(d => ({
          id: d.id,
          ...d.data(),
        }));

        info.status = 'success';
      } catch (err) {
        info.status = 'error';
        info.error = err instanceof Error ? err.message : String(err);
      }

      setDebugInfo(info);
    }

    if (showDebug) {
      runDiagnostics();
    }
  }, [firebaseUser?.uid, user?.uid, tenant?.id, tenant?.name, showDebug]);

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
      // Use authenticated user's ID from firebaseUser
      const userId = firebaseUser?.uid || user?.uid || 'system';
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
      <div className="flex items-center gap-2 justify-end">
        <button
          type="button"
          onClick={() => setShowDebug((s) => !s)}
          className="text-xs text-muted-foreground underline"
        >
          {showDebug ? 'Ocultar debug' : 'Mostrar debug'}
        </button>
      </div>
      <EmployeesList
        employees={employees}
        onDelete={handleDelete}
        onEdit={handleEdit}
      />

      {showDebug && (
        <div className="mt-4 p-4 rounded border bg-muted/10 space-y-4">
          <h3 className="text-sm font-semibold">Diagnóstico Firebase</h3>
          
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <strong>User ID:</strong> {debugInfo.userId as string || 'N/A'}
            </div>
            <div>
              <strong>Tenant ID:</strong> {debugInfo.tenantId as string || 'N/A'}
            </div>
            <div>
              <strong>Tenant Member Exists:</strong>{' '}
              <span className={debugInfo.tenantMemberExists ? 'text-green-500' : 'text-red-500'}>
                {debugInfo.tenantMemberExists ? 'SÍ' : 'NO'}
              </span>
            </div>
            <div>
              <strong>Total Employees (all tenants):</strong> {debugInfo.totalEmployeesInCollection as number ?? 'N/A'}
            </div>
            <div>
              <strong>Employees for THIS tenant:</strong> {debugInfo.employeesForThisTenant as number ?? 'N/A'}
            </div>
            <div>
              <strong>Status:</strong> {debugInfo.status as string || 'N/A'}
            </div>
          </div>

          {debugInfo.error ? (
            <div className="p-2 bg-red-500/10 rounded text-red-500 text-xs">
              <strong>Error:</strong> {String(debugInfo.error)}
            </div>
          ) : null}

          <details className="text-xs">
            <summary className="cursor-pointer font-medium">Ver datos completos</summary>
            <pre className="mt-2 max-h-72 overflow-auto bg-black/20 p-2 rounded">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </details>

          <details className="text-xs">
            <summary className="cursor-pointer font-medium">Empleados del hook useEmployees</summary>
            <pre className="mt-2 max-h-72 overflow-auto bg-black/20 p-2 rounded">
              {JSON.stringify(employees, null, 2)}
            </pre>
          </details>
        </div>
      )}

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
