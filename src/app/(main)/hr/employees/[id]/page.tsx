/**
 * ZADIA OS - Employee Detail Page
 * 
 * View employee information and related data
 * REGLA 2: ShadCN UI + Lucide icons
 * REGLA 5: <300 líneas
 */

'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  DollarSign,
  Calendar,
  Edit,
  Trash2,
  Plus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

import { EmployeesService } from '@/modules/hr/services/employees.service';
import { WorkPeriodsService } from '@/modules/hr/services/work-periods.service';
import { LoansService } from '@/modules/hr/services/loans.service';
import type { Employee, WorkPeriod, Loan } from '@/modules/hr/types/hr.types';
import type { EmployeeFormData } from '@/modules/hr/validations/hr.validation';
import { STATUS_CONFIG, POSITION_CONFIG } from '@/modules/hr/types/hr.types';
import { ActivePeriodCard } from '@/modules/hr/components/periods/ActivePeriodCard';
import { PeriodsHistory } from '@/modules/hr/components/periods/PeriodsHistory';
import { StartPeriodDialog } from '@/modules/hr/components/periods/StartPeriodDialog';
import { EmployeeFormDialog } from '@/modules/hr/components/employees/EmployeeFormDialog';
import { useAuth } from '@/contexts/AuthContext';

interface EmployeeDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function EmployeeDetailPage({ params }: EmployeeDetailPageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  useAuth(); // Auth check
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEditDialog, setShowEditDialog] = useState(false);

  // Work Periods State
  const [periods, setPeriods] = useState<WorkPeriod[]>([]);
  const [activePeriod, setActivePeriod] = useState<WorkPeriod | null>(null);
  const [activeLoans, setActiveLoans] = useState<Loan[]>([]);
  const [showStartPeriod, setShowStartPeriod] = useState(false);

  const fetchData = async () => {
    try {
      const empData = await EmployeesService.getEmployeeById(resolvedParams.id);
      setEmployee(empData);

      // Load periods
      const periodsData = await WorkPeriodsService.getPeriodsByEmployee(resolvedParams.id);
      setPeriods(periodsData);

      const active = periodsData.find(p => p.status === 'active') || null;
      setActivePeriod(active);

      if (active) {
        const loansData = await LoansService.getLoansByPeriod(active.id);
        setActiveLoans(loansData);
      }
    } catch {
      toast.error('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [resolvedParams.id]);

  const handleDelete = async () => {
    if (!employee) return;
    try {
      await EmployeesService.deleteEmployee(employee.id);
      toast.success('Empleado eliminado');
      router.push('/hr/employees');
    } catch {
      toast.error('Error al eliminar empleado');
    }
  };

  const handleEditSubmit = async (data: EmployeeFormData) => {
    if (!employee) return;
    try {
      await EmployeesService.updateEmployee(employee.id, data);
      toast.success('Empleado actualizado');
      setShowEditDialog(false);
      await fetchData(); // Refresh data
    } catch {
      toast.error('Error al actualizar empleado');
    }
  };

  if (loading) return <div className="p-8 text-center">Cargando...</div>;
  if (!employee) return <div className="p-8 text-center text-red-500">No encontrado</div>;

  const statusConfig = STATUS_CONFIG[employee.status];
  const positionConfig = POSITION_CONFIG[employee.position];

  return (
    <div className="p-6 space-y-6">
      {/* Header (Mismo de antes) */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {employee.firstName} {employee.lastName}
            </h1>
            <p className="text-muted-foreground">
              {positionConfig.label} • {employee.department}
            </p>
          </div>
          <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
        </div>
        {/* Botones de acción (Editar/Eliminar) */}
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowEditDialog(true)}>
            <Edit className="mr-2 h-4 w-4" /> Editar
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="mr-2 h-4 w-4" /> Eliminar
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              {/* ... Dialog Content ... */}
              <AlertDialogHeader>
                <AlertDialogTitle>¿Eliminar empleado?</AlertDialogTitle>
                <AlertDialogDescription>Esta acción marcará al empleado como inactivo.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>Eliminar</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <Tabs defaultValue="info" className="space-y-4">
        <TabsList>
          <TabsTrigger value="info">Información General</TabsTrigger>
          <TabsTrigger value="periods">Temporadas y Pagos</TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Cards de Info Personal, Laboral, Compensación (Mismos de antes) */}
            <Card>
              <CardHeader><CardTitle>Información Personal</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2"><Mail className="h-4 w-4 text-muted-foreground" /><span>{employee.email || 'N/A'}</span></div>
                <div className="flex items-center gap-2"><Phone className="h-4 w-4 text-muted-foreground" /><span>{employee.phone}</span></div>
                <div className="flex items-start gap-2"><MapPin className="h-4 w-4 text-muted-foreground mt-1" /><span>{employee.address}</span></div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Información Laboral</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2"><Briefcase className="h-4 w-4 text-muted-foreground" /><span>{positionConfig.label}</span></div>
                <div className="flex items-center gap-2"><Calendar className="h-4 w-4 text-muted-foreground" /><span>Desde {format(employee.hireDate.toDate(), 'PPP', { locale: es })}</span></div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Compensación Base</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span className="text-2xl font-bold">{employee.currency} {employee.salary.toLocaleString('es-SV', { minimumFractionDigits: 2 })}</span>
                </div>
                <p className="text-sm text-muted-foreground">Pago {employee.paymentFrequency}</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="periods" className="space-y-6">
          {/* Active Period Section */}
          {activePeriod ? (
            <ActivePeriodCard
              period={activePeriod}
              loans={activeLoans}
              onLoanAdded={fetchData}
              onPeriodEnded={fetchData}
            />
          ) : (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-10 space-y-4">
                <div className="p-4 bg-muted rounded-full">
                  <Calendar className="h-8 w-8 text-muted-foreground" />
                </div>
                <div className="text-center">
                  <h3 className="font-semibold text-lg">No hay temporada activa</h3>
                  <p className="text-muted-foreground text-sm max-w-sm">
                    Inicia una nueva temporada cuando el empleado llegue al país para comenzar a registrar sus días y préstamos.
                  </p>
                </div>
                <Button onClick={() => setShowStartPeriod(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Iniciar Temporada
                </Button>
              </CardContent>
            </Card>
          )}

          {/* History Section */}
          <PeriodsHistory periods={periods} />
        </TabsContent>
      </Tabs>

      <StartPeriodDialog
        open={showStartPeriod}
        onOpenChange={setShowStartPeriod}
        employeeId={employee.id}
        defaultRate={employee.salary} // Use base salary as default daily rate
        onSuccess={fetchData}
      />

      {/* Edit Employee Dialog */}
      <EmployeeFormDialog
        open={showEditDialog}
        onClose={() => setShowEditDialog(false)}
        onSubmit={handleEditSubmit}
        employee={employee}
      />
    </div>
  );
}
