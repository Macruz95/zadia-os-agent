'use client';

import { useParams, useRouter } from 'next/navigation';
import { useProject } from '@/modules/projects/hooks/use-projects';
import { useProjectTasks } from '@/modules/projects/hooks/use-project-tasks';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ArrowLeft,
  Edit,
  Trash2,
  MoreHorizontal,
  CheckCircle2,
  Clock,
  Pause,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ProjectOverview } from '@/modules/projects/components/ProjectOverview';
import { ProjectTimeline } from '@/modules/projects/components/ProjectTimeline';
import { WorkSessionsTab } from '@/modules/projects/components/WorkSessionsTab';
import { ProjectTasksTab } from '@/modules/projects/components/ProjectTasksTab';
import { ProjectExpensesTab } from '@/modules/projects/components/ProjectExpensesTab';
import { ProjectDocumentsTab } from '@/modules/projects/components/ProjectDocumentsTab';
import type { ProjectStatus, ProjectTask } from '@/modules/projects/types/projects.types';
import { toast } from 'sonner';
import { ProjectsService } from '@/modules/projects/services/projects.service';
import { ProjectTasksService } from '@/modules/projects/services/project-tasks.service';
import { logger } from '@/lib/logger';

/**
 * Project Detail Page with Tabs
 * Route: /projects/[id]
 * 
 * Rule #1: Real Firebase data via useProject hook
 * Rule #2: ShadCN UI Tabs component + Lucide icons
 * Rule #4: Modular with separate tab components
 */

const statusConfig = {
  planning: {
    label: 'Planificación',
    variant: 'secondary' as const,
    icon: Clock,
  },
  'in-progress': {
    label: 'En Progreso',
    variant: 'default' as const,
    icon: AlertCircle,
  },
  'on-hold': {
    label: 'En Espera',
    variant: 'outline' as const,
    icon: Pause,
  },
  completed: {
    label: 'Completado',
    variant: 'secondary' as const,
    icon: CheckCircle2,
  },
  cancelled: {
    label: 'Cancelado',
    variant: 'destructive' as const,
    icon: XCircle,
  },
};

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;
  const { user } = useAuth();

  // Real Firebase data with realtime updates
  const { project, loading, error } = useProject(projectId);
  const { tasks, loading: tasksLoading } = useProjectTasks({ projectId });

  // User data with defaults
  const userId = user?.uid || 'guest';
  const userName = user?.displayName || user?.email || 'Usuario';
  const userRole = 'admin'; // TODO: Get from user profile

  const handleEdit = () => {
    toast.info('Funcionalidad de editar proyecto en desarrollo');
  };

  const handleDelete = async () => {
    try {
      const confirmed = confirm('¿Estás seguro de eliminar este proyecto? Esta acción no se puede deshacer.');
      
      if (!confirmed) return;

      await ProjectsService.deleteProject(projectId);
      toast.success('Proyecto eliminado exitosamente');
      router.push('/projects');
    } catch (err) {
      logger.error('Error deleting project from detail page', err as Error);
      toast.error('Error al eliminar el proyecto');
    }
  };

  const handleStatusChange = async (newStatus: ProjectStatus) => {
    try {
      await ProjectsService.updateProjectStatus(
        projectId,
        newStatus,
        'Sistema',
        'cambio-manual'
      );
      toast.success('Estado actualizado exitosamente');
    } catch (err) {
      logger.error('Error updating project status', err as Error);
      toast.error('Error al actualizar el estado');
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">Cargando proyecto...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !project) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-center">
          <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-600 mb-2">
            {error || 'Proyecto no encontrado'}
          </h3>
          <Button variant="outline" onClick={() => router.push('/projects')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a Proyectos
          </Button>
        </div>
      </div>
    );
  }

  const StatusIcon = statusConfig[project.status].icon;

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/projects')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>

          <div>
            <h1 className="text-3xl font-bold tracking-tight">{project.name}</h1>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant={statusConfig[project.status].variant} className="flex items-center gap-1">
                <StatusIcon className="h-3 w-3" />
                {statusConfig[project.status].label}
              </Badge>
              <Badge variant="outline" className="capitalize">
                {project.projectType === 'production' ? 'Producción' : 
                 project.projectType === 'service' ? 'Servicio' : 'Interno'}
              </Badge>
              <span className="text-sm text-muted-foreground">
                Cliente: {project.clientName}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleEdit}>
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Cambiar Estado</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleStatusChange('planning')}>
                <Clock className="h-4 w-4 mr-2" />
                Planificación
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleStatusChange('in-progress')}>
                <AlertCircle className="h-4 w-4 mr-2" />
                En Progreso
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleStatusChange('on-hold')}>
                <Pause className="h-4 w-4 mr-2" />
                En Espera
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleStatusChange('completed')}>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Completado
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleDelete} className="text-red-600">
                <Trash2 className="h-4 w-4 mr-2" />
                Eliminar Proyecto
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="overview">Vista General</TabsTrigger>
          <TabsTrigger value="work-orders">Órdenes</TabsTrigger>
          <TabsTrigger value="tasks">Tareas</TabsTrigger>
          <TabsTrigger value="sessions">Sesiones</TabsTrigger>
          <TabsTrigger value="expenses">Gastos</TabsTrigger>
          <TabsTrigger value="documents">Documentos</TabsTrigger>
          <TabsTrigger value="timeline">Historial</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 mt-6">
          <ProjectOverview project={project} />
        </TabsContent>

        <TabsContent value="work-orders" className="space-y-4 mt-6">
          <div className="text-center py-12">
            <CheckCircle2 className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Órdenes de Trabajo</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Gestiona las fases de producción del proyecto
            </p>
            <Button onClick={() => router.push(`/projects/${projectId}/work-orders`)}>
              Ver Órdenes de Trabajo
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="tasks" className="space-y-4 mt-6">
          <ProjectTasksTab
            projectId={projectId}
            tasks={tasks}
            loading={tasksLoading}
            onAddTask={async (taskData) => {
              try {
                await ProjectTasksService.createTask({
                  ...taskData,
                  projectId,
                  createdBy: userId,
                } as ProjectTask);
                toast.success('Tarea creada exitosamente');
              } catch (err) {
                logger.error('Error creating task', err as Error);
                toast.error('Error al crear tarea');
              }
            }}
            onUpdateTask={async (taskId, updates) => {
              try {
                await ProjectTasksService.updateTask(taskId, updates);
                toast.success('Tarea actualizada');
              } catch (err) {
                logger.error('Error updating task', err as Error);
                toast.error('Error al actualizar tarea');
              }
            }}
            onDeleteTask={async (taskId) => {
              try {
                await ProjectTasksService.deleteTask(taskId);
                toast.success('Tarea eliminada');
              } catch (err) {
                logger.error('Error deleting task', err as Error);
                toast.error('Error al eliminar tarea');
              }
            }}
          />
        </TabsContent>

        <TabsContent value="sessions" className="space-y-4 mt-6">
          <WorkSessionsTab
            projectId={projectId}
            userId={userId}
            userName={userName}
            hourlyRate={50}
          />
        </TabsContent>

        <TabsContent value="expenses" className="space-y-4 mt-6">
          <ProjectExpensesTab
            projectId={projectId}
            userId={userId}
            userRole={userRole}
          />
        </TabsContent>

        <TabsContent value="documents" className="space-y-4 mt-6">
          <ProjectDocumentsTab
            projectId={projectId}
            userId={userId}
            userName={userName}
          />
        </TabsContent>

        <TabsContent value="timeline" className="space-y-4 mt-6">
          <ProjectTimeline projectId={projectId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
