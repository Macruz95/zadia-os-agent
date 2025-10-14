/**
 * ZADIA OS - Project Conversion Summary
 * 
 * Fifth step: Confirmation and execution
 * Following ZADIA Rule 2: ShadCN UI + Lucide Icons
 * Following ZADIA Rule 5: Max 200 lines
 */

'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, ChevronLeft, Rocket, FileText, Settings, Package, Wrench, CheckCircle2 } from 'lucide-react';
import { Quote } from '../../types/sales.types';
import { 
  QuoteAcceptanceInput, 
  ProjectConfigInput, 
  InventoryReservationInput, 
  WorkOrderInput 
} from '../../validations/quote-project-conversion.schema';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface ProjectConversionSummaryProps {
  quote: Quote;
  acceptanceData: QuoteAcceptanceInput | null;
  projectConfig: ProjectConfigInput | null;
  inventoryReservations: InventoryReservationInput[];
  workOrders: WorkOrderInput[];
  isConverting: boolean;
  onBack: () => void;
  onConfirm: () => void;
}

export function ProjectConversionSummary({
  quote,
  acceptanceData,
  projectConfig,
  inventoryReservations,
  workOrders,
  isConverting,
  onBack,
  onConfirm,
}: ProjectConversionSummaryProps) {
  if (!acceptanceData || !projectConfig) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Faltan datos para completar la conversión. Por favor regrese y complete todos los pasos.
        </AlertDescription>
      </Alert>
    );
  }

  if (isConverting) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
        <h3 className="text-xl font-semibold">Creando Proyecto...</h3>
        <p className="text-muted-foreground text-center">
          Procesando conversión de cotización a proyecto.<br />
          Esto puede tomar unos momentos.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Alert>
        <Rocket className="h-4 w-4" />
        <AlertDescription>
          Revise el resumen de la conversión. Una vez confirmado, se creará el proyecto y se actualizará la cotización.
        </AlertDescription>
      </Alert>

      {/* Quote Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Cotización
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Número:</span>
            <span className="font-semibold">{quote.number}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Cliente:</span>
            <span className="font-semibold">{quote.clientId}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Valor Total:</span>
            <span className="font-semibold text-lg">
              ${quote.total.toLocaleString()} {quote.currency}
            </span>
          </div>
          {acceptanceData.customerPO && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">PO Cliente:</span>
              <span className="font-semibold">{acceptanceData.customerPO}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Project Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Proyecto
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Nombre:</span>
            <span className="font-semibold">{projectConfig.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Inicio:</span>
            <span className="font-semibold">
              {format(projectConfig.startDate, 'dd MMM yyyy', { locale: es })}
            </span>
          </div>
          {projectConfig.estimatedEndDate && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Fin Estimado:</span>
              <span className="font-semibold">
                {format(projectConfig.estimatedEndDate, 'dd MMM yyyy', { locale: es })}
              </span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-muted-foreground">Prioridad:</span>
            <span className="font-semibold capitalize">{projectConfig.priority}</span>
          </div>
          {projectConfig.budget && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Presupuesto:</span>
              <span className="font-semibold">
                ${projectConfig.budget.toLocaleString()} {quote.currency}
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Inventory Reservations */}
      {inventoryReservations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Reservaciones de Inventario
            </CardTitle>
            <CardDescription>
              {inventoryReservations.length} producto(s) a reservar
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {inventoryReservations.map((reservation, index) => (
              <div key={index} className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {reservation.quantity} {reservation.unitOfMeasure} - {reservation.productName}
                </span>
                <span className="font-semibold">
                  {reservation.reservedFrom === 'warehouse' ? 'Bodega' :
                   reservation.reservedFrom === 'supplier' ? 'Proveedor' : 'Producción'}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Work Orders */}
      {workOrders.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wrench className="h-5 w-5" />
              Órdenes de Trabajo
            </CardTitle>
            <CardDescription>
              {workOrders.length} orden(es) a crear
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {workOrders.map((order, index) => (
              <div key={index} className="flex justify-between text-sm">
                <span className="text-muted-foreground">{order.title}</span>
                <span className="font-semibold capitalize">{order.type}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Confirmation Alert */}
      <Alert>
        <CheckCircle2 className="h-4 w-4" />
        <AlertDescription>
          Al confirmar, se realizarán las siguientes acciones:
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Se creará el proyecto en estado "Planificación"</li>
            <li>La cotización se marcará como "Convertida a Proyecto"</li>
            <li>La oportunidad se marcará como "Ganada" (si aplica)</li>
            {inventoryReservations.length > 0 && (
              <li>Se crearán {inventoryReservations.length} reservación(es) de inventario</li>
            )}
            {workOrders.length > 0 && (
              <li>Se crearán {workOrders.length} orden(es) de trabajo</li>
            )}
          </ul>
        </AlertDescription>
      </Alert>

      {/* Actions */}
      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={onBack} disabled={isConverting}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          Atrás
        </Button>
        <Button onClick={onConfirm} disabled={isConverting} size="lg">
          <Rocket className="mr-2 h-4 w-4" />
          Confirmar y Crear Proyecto
        </Button>
      </div>
    </div>
  );
}
