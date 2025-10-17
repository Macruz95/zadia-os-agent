// src/modules/projects/components/WorkOrdersList.tsx

'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  ClipboardList,
  Clock,
  DollarSign,
  Package,
  Play,
  Pause,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import type { WorkOrder } from '../types/projects.types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface WorkOrdersListProps {
  workOrders: WorkOrder[];
  onStatusChange: (workOrderId: string, newStatus: string) => void;
  onRecordMaterial: (workOrderId: string) => void;
  onRecordHours: (workOrderId: string) => void;
  onViewDetails: (workOrderId: string) => void;
}

const STATUS_CONFIG = {
  pending: { label: 'Pendiente', color: 'bg-gray-500', icon: ClipboardList },
  'in-progress': { label: 'En Proceso', color: 'bg-blue-500', icon: Play },
  paused: { label: 'Pausado', color: 'bg-yellow-500', icon: Pause },
  completed: { label: 'Completado', color: 'bg-green-500', icon: CheckCircle2 },
  cancelled: { label: 'Cancelado', color: 'bg-red-500', icon: AlertCircle },
};

export function WorkOrdersList({
  workOrders,
  onStatusChange,
  onRecordMaterial,
  onRecordHours,
  onViewDetails,
}: WorkOrdersListProps) {
  if (workOrders.length === 0) {
    return (
      <Card className="p-8 text-center">
        <ClipboardList className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="font-semibold text-lg mb-2">No hay órdenes de trabajo</h3>
        <p className="text-sm text-muted-foreground">
          Crea la primera orden para comenzar la producción
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {workOrders.map((workOrder) => {
        const statusConfig = STATUS_CONFIG[workOrder.status];
        const StatusIcon = statusConfig.icon;

        return (
          <Card key={workOrder.id} className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-semibold text-lg">{workOrder.name}</h3>
                  <Badge className={statusConfig.color}>
                    <StatusIcon className="h-3 w-3 mr-1" />
                    {statusConfig.label}
                  </Badge>
                </div>
                
                <p className="text-sm text-muted-foreground mb-2">
                  Fase: <span className="font-medium">{workOrder.phase}</span>
                </p>

                {workOrder.description && (
                  <p className="text-sm text-muted-foreground">
                    {workOrder.description}
                  </p>
                )}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => onViewDetails(workOrder.id)}
              >
                Ver Detalles
              </Button>
            </div>

            {/* Progreso */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Progreso</span>
                <span className="text-sm text-muted-foreground">
                  {workOrder.progressPercent}%
                </span>
              </div>
              <Progress value={workOrder.progressPercent} />
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Materiales</p>
                  <p className="text-sm font-medium">
                    {workOrder.materials.length}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Horas</p>
                  <p className="text-sm font-medium">
                    {workOrder.laborHours.toFixed(1)}h
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Costo</p>
                  <p className="text-sm font-medium">
                    ${workOrder.actualCost.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            {/* Fechas */}
            {workOrder.actualStartDate && (
              <div className="text-xs text-muted-foreground mb-4">
                Iniciado:{' '}
                {format(workOrder.actualStartDate.toDate(), 'dd/MM/yyyy', {
                  locale: es,
                })}
              </div>
            )}

            {/* Acciones */}
            <div className="flex gap-2">
              {workOrder.status === 'pending' && (
                <Button
                  size="sm"
                  onClick={() => onStatusChange(workOrder.id, 'in-progress')}
                >
                  <Play className="h-4 w-4 mr-2" />
                  Iniciar
                </Button>
              )}

              {workOrder.status === 'in-progress' && (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onRecordMaterial(workOrder.id)}
                  >
                    <Package className="h-4 w-4 mr-2" />
                    Registrar Material
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onRecordHours(workOrder.id)}
                  >
                    <Clock className="h-4 w-4 mr-2" />
                    Registrar Horas
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onStatusChange(workOrder.id, 'paused')}
                  >
                    <Pause className="h-4 w-4 mr-2" />
                    Pausar
                  </Button>

                  <Button
                    size="sm"
                    onClick={() => onStatusChange(workOrder.id, 'completed')}
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Completar
                  </Button>
                </>
              )}

              {workOrder.status === 'paused' && (
                <Button
                  size="sm"
                  onClick={() => onStatusChange(workOrder.id, 'in-progress')}
                >
                  <Play className="h-4 w-4 mr-2" />
                  Reanudar
                </Button>
              )}
            </div>
          </Card>
        );
      })}
    </div>
  );
}
