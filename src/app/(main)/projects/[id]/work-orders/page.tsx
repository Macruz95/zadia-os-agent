// src/app/(main)/projects/[id]/work-orders/page.tsx

'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Plus,
  ArrowLeft,
  Loader2,
  AlertCircle,
  ClipboardList,
  Clock,
  DollarSign,
  CheckCircle2,
} from 'lucide-react';
import { useWorkOrders } from '@/modules/projects/hooks/use-work-orders';
import { useAuth } from '@/contexts/AuthContext';
import { WorkOrdersList } from '@/modules/projects/components/WorkOrdersList';
import { WorkOrderFormDialog } from '@/modules/projects/components/WorkOrderFormDialog';

export default function ProjectWorkOrdersPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const projectId = params.id as string;

  const {
    workOrders,
    isLoading,
    error,
    stats,
    refreshWorkOrders,
    changeStatus,
  } = useWorkOrders(projectId);

  const [isFormOpen, setIsFormOpen] = useState(false);

  const handleStatusChange = async (
    workOrderId: string,
    newStatus: string
  ) => {
    if (!user) return;

    await changeStatus(
      workOrderId,
      newStatus as 'pending' | 'in-progress' | 'paused' | 'completed' | 'cancelled',
      user.uid,
      user.displayName || 'Usuario'
    );
  };

  const handleRecordMaterial = (workOrderId: string) => {
    // TODO: Abrir dialog para registrar material
    void workOrderId;
  };

  const handleRecordHours = (workOrderId: string) => {
    // TODO: Abrir dialog para registrar horas
    void workOrderId;
  };

  const handleViewDetails = (workOrderId: string) => {
    // TODO: Navegar a página de detalles
    void workOrderId;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push(`/projects/${projectId}`)}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Órdenes de Trabajo</h1>
            <p className="text-muted-foreground">
              Gestiona la producción del proyecto
            </p>
          </div>
        </div>

        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nueva Orden
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <ClipboardList className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
              <Clock className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">En Proceso</p>
              <p className="text-2xl font-bold">{stats.inProgress}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Completadas</p>
              <p className="text-2xl font-bold">{stats.completed}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <DollarSign className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Costo Total</p>
              <p className="text-2xl font-bold">
                ${stats.totalCost.toFixed(2)}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Work Orders List */}
      <WorkOrdersList
        workOrders={workOrders}
        onStatusChange={handleStatusChange}
        onRecordMaterial={handleRecordMaterial}
        onRecordHours={handleRecordHours}
        onViewDetails={handleViewDetails}
      />

      {/* Form Dialog */}
      {user && (
        <WorkOrderFormDialog
          projectId={projectId}
          userId={user.uid}
          open={isFormOpen}
          onOpenChange={setIsFormOpen}
          onSuccess={refreshWorkOrders}
        />
      )}
    </div>
  );
}
