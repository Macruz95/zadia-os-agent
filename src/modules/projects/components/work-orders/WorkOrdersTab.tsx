/**
 * ZADIA OS - Work Orders Tab Component
 * 
 * Tab integrada para gestionar órdenes de trabajo dentro del proyecto
 * Rule #1: Real Firebase data via useWorkOrders hook
 * Rule #2: ShadCN UI + Lucide icons
 * Rule #5: Max 200 lines
 */

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ClipboardList,
  Plus,
  Clock,
  DollarSign,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import { useWorkOrders } from '../../hooks/use-work-orders';
import { useAuth } from '@/contexts/AuthContext';
import { WorkOrdersList } from '../WorkOrdersList';
import { WorkOrderFormDialog } from '../WorkOrderFormDialog';
import { RecordMaterialDialog } from '../RecordMaterialDialog';
import { RecordHoursDialog } from '../RecordHoursDialog';
import type { WorkOrder } from '../../types/projects.types';

interface WorkOrdersTabProps {
  projectId: string;
}

export function WorkOrdersTab({ projectId }: WorkOrdersTabProps) {
  const { user } = useAuth();
  const userId = user?.uid || '';
  const userName = user?.displayName || user?.email || 'Usuario';

  const {
    workOrders,
    isLoading,
    stats,
    refreshWorkOrders,
    changeStatus,
    recordMaterial,
    recordHours,
  } = useWorkOrders(projectId);

  // Dialog states
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showMaterialDialog, setShowMaterialDialog] = useState(false);
  const [showHoursDialog, setShowHoursDialog] = useState(false);
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<WorkOrder | null>(null);

  const handleStatusChange = async (workOrderId: string, newStatus: string) => {
    await changeStatus(
      workOrderId,
      newStatus as 'pending' | 'in-progress' | 'paused' | 'completed' | 'cancelled',
      userId,
      userName
    );
  };

  const handleRecordMaterial = (workOrderId: string) => {
    const wo = workOrders.find(w => w.id === workOrderId);
    if (wo) {
      setSelectedWorkOrder(wo);
      setShowMaterialDialog(true);
    }
  };

  const handleRecordHours = (workOrderId: string) => {
    const wo = workOrders.find(w => w.id === workOrderId);
    if (wo) {
      setSelectedWorkOrder(wo);
      setShowHoursDialog(true);
    }
  };

  const handleMaterialRecord = async (materialId: string, quantity: number) => {
    if (!selectedWorkOrder) return;
    await recordMaterial(selectedWorkOrder.id, materialId, quantity, userId, userName);
    setShowMaterialDialog(false);
  };

  const handleHoursRecord = async (hours: number, notes?: string) => {
    if (!selectedWorkOrder) return;
    await recordHours(selectedWorkOrder.id, hours, userId, userName, notes);
    setShowHoursDialog(false);
  };

  const handleViewDetails = (workOrderId: string) => {
    const wo = workOrders.find(w => w.id === workOrderId);
    if (wo) setSelectedWorkOrder(wo);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Órdenes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <ClipboardList className="h-4 w-4 text-primary" />
              <span className="text-2xl font-bold">{stats.total}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Completadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span className="text-2xl font-bold">{stats.completed}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Horas Totales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-500" />
              <span className="text-2xl font-bold">{stats.totalHours.toFixed(1)}h</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Costo Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-600" />
              <span className="text-2xl font-bold">${stats.totalCost.toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Órdenes de Trabajo</h3>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nueva Orden
        </Button>
      </div>

      {/* Work Orders List */}
      <WorkOrdersList
        workOrders={workOrders}
        onStatusChange={handleStatusChange}
        onRecordMaterial={handleRecordMaterial}
        onRecordHours={handleRecordHours}
        onViewDetails={handleViewDetails}
      />

      {/* Dialogs */}
      <WorkOrderFormDialog
        projectId={projectId}
        userId={userId}
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSuccess={refreshWorkOrders}
      />

      <RecordMaterialDialog
        workOrder={selectedWorkOrder}
        open={showMaterialDialog}
        onOpenChange={setShowMaterialDialog}
        onRecord={handleMaterialRecord}
      />

      <RecordHoursDialog
        workOrder={selectedWorkOrder}
        open={showHoursDialog}
        onOpenChange={setShowHoursDialog}
        onRecord={handleHoursRecord}
      />
    </div>
  );
}
