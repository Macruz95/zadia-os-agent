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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
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
import { EmployeesService } from '@/modules/hr/services/employees.service';
import type { Employee } from '@/modules/hr/types/hr.types';
import { STATUS_CONFIG, POSITION_CONFIG, CONTRACT_TYPE_CONFIG } from '@/modules/hr/types/hr.types';
import { toast } from 'sonner';

interface EmployeeDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function EmployeeDetailPage({ params }: EmployeeDetailPageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const data = await EmployeesService.getEmployeeById(resolvedParams.id);
        setEmployee(data);
      } catch {
        toast.error('Error al cargar empleado');
        router.push('/hr/employees');
      } finally {
        setLoading(false);
      }
    };

    fetchEmployee();
  }, [resolvedParams.id, router]);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Cargando empleado...</p>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-destructive">Empleado no encontrado</p>
      </div>
    );
  }

  const statusConfig = STATUS_CONFIG[employee.status];
  const positionConfig = POSITION_CONFIG[employee.position];
  const contractConfig = CONTRACT_TYPE_CONFIG[employee.contractType];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
          >
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
          <Badge variant={statusConfig.variant}>
            {statusConfig.label}
          </Badge>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Edit className="mr-2 h-4 w-4" />
            Editar
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Eliminar
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>¿Eliminar empleado?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta acción marcará al empleado como inactivo.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>
                  Eliminar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Content */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Personal Info */}
        <Card>
          <CardHeader>
            <CardTitle>Información Personal</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span>{employee.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>{employee.phone}</span>
            </div>
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
              <span>{employee.address}</span>
            </div>
            <Separator />
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">DUI</p>
                <p className="font-medium">{employee.nationalId}</p>
              </div>
              {employee.taxId && (
                <div>
                  <p className="text-muted-foreground">NIT</p>
                  <p className="font-medium">{employee.taxId}</p>
                </div>
              )}
              <div>
                <p className="text-muted-foreground">Fecha Nacimiento</p>
                <p className="font-medium">
                  {format(employee.birthDate.toDate(), 'PPP', { locale: es })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Employment Info */}
        <Card>
          <CardHeader>
            <CardTitle>Información Laboral</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-muted-foreground" />
              <span>{positionConfig.label}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>
                Desde {format(employee.hireDate.toDate(), 'PPP', { locale: es })}
              </span>
            </div>
            <Separator />
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Departamento</p>
                <p className="font-medium">{employee.department}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Tipo Contrato</p>
                <p className="font-medium">{contractConfig}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Compensation */}
        <Card>
          <CardHeader>
            <CardTitle>Compensación</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <span className="text-2xl font-bold">
                {employee.currency} {employee.salary.toLocaleString('es-SV', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              {employee.paymentFrequency === 'hourly' && 'Por Hora'}
              {employee.paymentFrequency === 'daily' && 'Diario'}
              {employee.paymentFrequency === 'weekly' && 'Semanal'}
              {employee.paymentFrequency === 'biweekly' && 'Quincenal'}
              {employee.paymentFrequency === 'monthly' && 'Mensual'}
            </p>
          </CardContent>
        </Card>

        {/* Emergency Contact */}
        {employee.emergencyContactName && (
          <Card>
            <CardHeader>
              <CardTitle>Contacto de Emergencia</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <p className="text-muted-foreground text-sm">Nombre</p>
                <p className="font-medium">{employee.emergencyContactName}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Teléfono</p>
                <p className="font-medium">{employee.emergencyContactPhone}</p>
              </div>
              {employee.emergencyContactRelation && (
                <div>
                  <p className="text-muted-foreground text-sm">Relación</p>
                  <p className="font-medium">{employee.emergencyContactRelation}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

    </div>
  );
}
