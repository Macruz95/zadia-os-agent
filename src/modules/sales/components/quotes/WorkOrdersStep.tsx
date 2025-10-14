/**
 * ZADIA OS - Work Orders Step
 * 
 * Fourth step: Create work orders
 * Following ZADIA Rule 2: ShadCN UI + Lucide Icons
 * Following ZADIA Rule 5: Max 200 lines
 */

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Wrench, Plus, X } from 'lucide-react';
import { Quote } from '../../types/sales.types';
import { WorkOrderInput } from '../../validations/quote-project-conversion.schema';

interface WorkOrdersStepProps {
  quote: Quote;
  onNext: () => void;
  onBack: () => void;
  onWorkOrders: (data: WorkOrderInput[]) => void;
}

export function WorkOrdersStep({ quote, onNext, onBack, onWorkOrders }: WorkOrdersStepProps) {
  const [orders, setOrders] = useState<WorkOrderInput[]>([]);

  const handleAddOrder = (type: WorkOrderInput['type']) => {
    const newOrder: WorkOrderInput = {
      title: `${getTypeLabel(type)} - ${quote.number}`,
      type,
      priority: 'medium',
      materials: [],
    };
    setOrders([...orders, newOrder]);
  };

  const handleRemoveOrder = (index: number) => {
    setOrders(orders.filter((_, i) => i !== index));
  };

  const handleContinue = () => {
    onWorkOrders(orders);
    onNext();
  };

  const getTypeLabel = (type: WorkOrderInput['type']): string => {
    const labels = {
      installation: 'Instalación',
      delivery: 'Entrega',
      service: 'Servicio',
      maintenance: 'Mantenimiento',
      other: 'Otro',
    };
    return labels[type];
  };

  const getTypeBadgeVariant = (type: WorkOrderInput['type']) => {
    const variants = {
      installation: 'default',
      delivery: 'secondary',
      service: 'outline',
      maintenance: 'secondary',
      other: 'outline',
    };
    return variants[type] as 'default' | 'secondary' | 'outline';
  };

  return (
    <div className="space-y-6">
      <Alert>
        <Wrench className="h-4 w-4" />
        <AlertDescription>
          Cree órdenes de trabajo para instalación, entrega o servicios relacionados con el proyecto.
          Estas son opcionales y pueden agregarse más tarde.
        </AlertDescription>
      </Alert>

      {/* Quick Add Buttons */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wrench className="h-5 w-5" />
            Tipos de Órdenes de Trabajo
          </CardTitle>
          <CardDescription>
            Seleccione el tipo de orden que desea crear
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleAddOrder('installation')}
              className="h-20 flex flex-col gap-2"
            >
              <Wrench className="h-5 w-5" />
              <span className="text-xs">Instalación</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleAddOrder('delivery')}
              className="h-20 flex flex-col gap-2"
            >
              <Package className="h-5 w-5" />
              <span className="text-xs">Entrega</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleAddOrder('service')}
              className="h-20 flex flex-col gap-2"
            >
              <Settings className="h-5 w-5" />
              <span className="text-xs">Servicio</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleAddOrder('maintenance')}
              className="h-20 flex flex-col gap-2"
            >
              <Hammer className="h-5 w-5" />
              <span className="text-xs">Mantenimiento</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleAddOrder('other')}
              className="h-20 flex flex-col gap-2"
            >
              <Plus className="h-5 w-5" />
              <span className="text-xs">Otro</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Created Work Orders */}
      {orders.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Órdenes Creadas ({orders.length})</CardTitle>
            <CardDescription>
              Estas órdenes se crearán cuando confirme la conversión
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {orders.map((order, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <Wrench className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-semibold">{order.title}</p>
                    <div className="flex gap-2 mt-1">
                      <Badge variant={getTypeBadgeVariant(order.type)}>
                        {getTypeLabel(order.type)}
                      </Badge>
                      <Badge variant="outline">
                        {order.priority === 'urgent' ? 'Urgente' :
                         order.priority === 'high' ? 'Alta' :
                         order.priority === 'medium' ? 'Media' : 'Baja'}
                      </Badge>
                    </div>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveOrder(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {orders.length === 0 && (
        <Alert>
          <Wrench className="h-4 w-4" />
          <AlertDescription>
            No se han creado órdenes de trabajo. Puede continuar sin ellas o agregar algunas usando los botones arriba.
          </AlertDescription>
        </Alert>
      )}

      {/* Actions */}
      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={onBack}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          Atrás
        </Button>
        <Button onClick={handleContinue}>
          {orders.length > 0
            ? `Continuar (${orders.length} órdenes)`
            : 'Continuar sin órdenes'
          }
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

// Missing imports
import { Package, Settings, Hammer } from 'lucide-react';
