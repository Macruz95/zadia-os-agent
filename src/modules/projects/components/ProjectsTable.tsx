'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Clock,
  XCircle,
  Pause,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Project, ProjectStatus, ProjectPriority } from '../types/projects.types';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

// Rule #2: ShadCN UI + Lucide Icons only

interface ProjectsTableProps {
  projects: Project[];
  loading?: boolean;
  onViewProject: (projectId: string) => void;
  onEditProject: (projectId: string) => void;
  onDeleteProject: (projectId: string) => void;
}

// Status badge styles
const statusConfig: Record<
  ProjectStatus,
  { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: React.ElementType }
> = {
  planning: {
    label: 'Planificación',
    variant: 'secondary',
    icon: Clock,
  },
  'in-progress': {
    label: 'En Progreso',
    variant: 'default',
    icon: AlertCircle,
  },
  'on-hold': {
    label: 'En Espera',
    variant: 'outline',
    icon: Pause,
  },
  completed: {
    label: 'Completado',
    variant: 'secondary',
    icon: CheckCircle2,
  },
  cancelled: {
    label: 'Cancelado',
    variant: 'destructive',
    icon: XCircle,
  },
};

// Priority badge styles
const priorityConfig: Record<
  ProjectPriority,
  { label: string; className: string }
> = {
  low: {
    label: 'Baja',
    className: 'bg-gray-100 text-gray-800',
  },
  medium: {
    label: 'Media',
    className: 'bg-blue-100 text-blue-800',
  },
  high: {
    label: 'Alta',
    className: 'bg-orange-100 text-orange-800',
  },
  urgent: {
    label: 'Urgente',
    className: 'bg-red-100 text-red-800',
  },
};

export function ProjectsTable({
  projects,
  loading = false,
  onViewProject,
  onEditProject,
  onDeleteProject,
}: ProjectsTableProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  if (loading) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Proyecto</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Prioridad</TableHead>
              <TableHead>Progreso</TableHead>
              <TableHead>Precio</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[1, 2, 3, 4, 5].map((i) => (
              <TableRow key={i}>
                <TableCell>
                  <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
                </TableCell>
                <TableCell>
                  <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                </TableCell>
                <TableCell>
                  <div className="h-6 w-20 bg-gray-200 rounded animate-pulse" />
                </TableCell>
                <TableCell>
                  <div className="h-6 w-16 bg-gray-200 rounded animate-pulse" />
                </TableCell>
                <TableCell>
                  <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                </TableCell>
                <TableCell>
                  <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
                </TableCell>
                <TableCell />
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="rounded-md border p-8 text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No hay proyectos</h3>
        <p className="text-muted-foreground">
          Comienza creando tu primer proyecto o ajusta los filtros de búsqueda.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Proyecto</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Prioridad</TableHead>
            <TableHead>Progreso</TableHead>
            <TableHead>Precio/Costo</TableHead>
            <TableHead>Actualizado</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {projects.map((project) => {
            const statusInfo = statusConfig[project.status] || statusConfig['planning'];
            const StatusIcon = statusInfo.icon;
            const priorityInfo = priorityConfig[project.priority] || priorityConfig['medium'];

            return (
              <TableRow key={project.id}>
                {/* Project Name */}
                <TableCell className="font-medium">
                  <div className="flex flex-col">
                    <span className="truncate max-w-xs">{project.name}</span>
                    {project.description && (
                      <span className="text-xs text-muted-foreground truncate max-w-xs">
                        {project.description}
                      </span>
                    )}
                  </div>
                </TableCell>

                {/* Client */}
                <TableCell>{project.clientName}</TableCell>

                {/* Status */}
                <TableCell>
                  <Badge variant={statusInfo.variant} className="flex items-center gap-1 w-fit">
                    <StatusIcon className="h-3 w-3" />
                    {statusInfo.label}
                  </Badge>
                </TableCell>

                {/* Priority */}
                <TableCell>
                  <Badge className={priorityInfo.className}>
                    {priorityInfo.label}
                  </Badge>
                </TableCell>

                {/* Progress */}
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Progress value={project.progressPercent} className="w-20" />
                    <span className="text-xs text-muted-foreground">
                      {project.progressPercent}%
                    </span>
                  </div>
                </TableCell>

                {/* Price/Cost */}
                <TableCell>
                  <div className="flex flex-col text-sm">
                    <span className="font-medium">
                      {formatCurrency(project.salesPrice)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Costo: {formatCurrency(project.actualCost)}
                    </span>
                  </div>
                </TableCell>

                {/* Updated At */}
                <TableCell className="text-sm text-muted-foreground">
                  {project.updatedAt &&
                    formatDistanceToNow(project.updatedAt.toDate(), {
                      addSuffix: true,
                      locale: es,
                    })}
                </TableCell>

                {/* Actions */}
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => onViewProject(project.id)}>
                        <Eye className="h-4 w-4 mr-2" />
                        Ver detalles
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onEditProject(project.id)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => onDeleteProject(project.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
