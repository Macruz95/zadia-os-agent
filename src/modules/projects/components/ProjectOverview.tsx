'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  User,
  Calendar,
  DollarSign,
  TrendingUp,
  AlertCircle,
  Users,
  FileText,
} from 'lucide-react';
import type { Project } from '../types/projects.types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

// Rule #2: ShadCN UI + Lucide Icons only

interface ProjectOverviewProps {
  project: Project;
}

export function ProjectOverview({ project }: ProjectOverviewProps) {
  // Helper to safely convert Firestore Timestamp to Date
  const toDate = (timestamp: any): Date | null => {
    if (!timestamp) return null;
    if (timestamp instanceof Date) return timestamp;
    if (typeof timestamp.toDate === 'function') return timestamp.toDate();
    return null;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const profitMargin = project.salesPrice > 0
    ? ((project.salesPrice - project.actualCost) / project.salesPrice) * 100
    : 0;

  const estimatedProfit = project.salesPrice - project.estimatedCost;
  const actualProfit = project.salesPrice - project.actualCost;

  const startDate = toDate(project.startDate);
  const estimatedEndDate = toDate(project.estimatedEndDate);

  return (
    <div className="space-y-6">
      {/* Project Info Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Client Info */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cliente</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{project.clientName}</div>
            {project.quoteNumber && (
              <p className="text-xs text-muted-foreground mt-1">
                Cotización: {project.quoteNumber}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Project Manager */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Responsable</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Project Manager</div>
            <p className="text-xs text-muted-foreground mt-1">
              {project.teamMembers.length} miembros del equipo
            </p>
          </CardContent>
        </Card>

        {/* Dates */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fechas</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {startDate && (
              <div className="text-sm">
                <span className="text-muted-foreground">Inicio: </span>
                <span className="font-medium">
                  {format(startDate, 'dd MMM yyyy', { locale: es })}
                </span>
              </div>
            )}
            {estimatedEndDate && (
              <div className="text-sm mt-1">
                <span className="text-muted-foreground">Fin estimado: </span>
                <span className="font-medium">
                  {format(estimatedEndDate, 'dd MMM yyyy', { locale: es })}
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Progress Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Progreso del Proyecto
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Avance General</span>
                <span className="text-2xl font-bold">{project.progressPercent}%</span>
              </div>
              <Progress value={project.progressPercent} className="h-3" />
            </div>

            {project.description && (
              <div className="pt-4 border-t">
                <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Descripción
                </h4>
                <p className="text-sm text-muted-foreground">{project.description}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Financial Summary */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Revenue & Costs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Resumen Financiero
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Precio de Venta</span>
              <span className="text-lg font-bold">{formatCurrency(project.salesPrice)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Costo Estimado</span>
              <span className="text-sm">{formatCurrency(project.estimatedCost)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Costo Actual</span>
              <span className="text-sm">{formatCurrency(project.actualCost)}</span>
            </div>
            <div className="pt-3 border-t flex justify-between items-center">
              <span className="text-sm font-medium">Utilidad Estimada</span>
              <span className={`text-lg font-bold ${estimatedProfit > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(estimatedProfit)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Utilidad Actual</span>
              <span className={`text-lg font-bold ${actualProfit > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(actualProfit)}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Cost Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Desglose de Costos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Materiales</span>
              <span className="text-sm font-medium">{formatCurrency(project.materialsCost || 0)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Mano de Obra</span>
              <span className="text-sm font-medium">{formatCurrency(project.laborCost || 0)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Gastos Generales</span>
              <span className="text-sm font-medium">{formatCurrency(project.overheadCost || 0)}</span>
            </div>
            <div className="pt-3 border-t">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Margen de Utilidad</span>
                <span className={`text-2xl font-bold ${profitMargin > 20 ? 'text-green-600' :
                  profitMargin > 10 ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                  {profitMargin.toFixed(1)}%
                </span>
              </div>
              <Progress
                value={Math.min(profitMargin, 100)}
                className="h-2"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Info */}
      <Card>
        <CardHeader>
          <CardTitle>Información Adicional</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <span className="text-sm text-muted-foreground">Tipo de Proyecto</span>
              <p className="text-sm font-medium mt-1 capitalize">{project.projectType}</p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Prioridad</span>
              <div className="mt-1">
                <Badge variant={
                  project.priority === 'urgent' ? 'destructive' :
                    project.priority === 'high' ? 'default' : 'secondary'
                }>
                  {project.priority === 'urgent' ? 'Urgente' :
                    project.priority === 'high' ? 'Alta' :
                      project.priority === 'medium' ? 'Media' : 'Baja'}
                </Badge>
              </div>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Moneda</span>
              <p className="text-sm font-medium mt-1">{project.currency || 'MXN'}</p>
            </div>
            {project.paymentTerms && (
              <div>
                <span className="text-sm text-muted-foreground">Términos de Pago</span>
                <p className="text-sm font-medium mt-1">{project.paymentTerms}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
