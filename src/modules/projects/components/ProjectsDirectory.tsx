'use client';

import { useState } from 'react';
import { useProjects, useProjectsKPIs } from '../hooks/use-projects';
import type { ProjectFilters } from '../hooks/use-projects';
import { ProjectsHeader } from './ProjectsHeader';
import { ProjectsKPICards } from './ProjectsKPICards';
import { ProjectFilters as ProjectFiltersComponent } from './ProjectFilters';
import { ProjectsTable } from './ProjectsTable';
import { ProjectsKanban } from './kanban/ProjectsKanban';
import { ProjectFormDialog } from './forms/ProjectFormDialog';
import { Button } from '@/components/ui/button';
import { LayoutGrid, LayoutList } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ProjectsService } from '../services/projects.service';
import { logger } from '@/lib/logger';

/**
 * ProjectsDirectory - Main component for Projects module
 * Rule #1: Real Firebase data via useProjects hook
 * Rule #2: ShadCN UI + Lucide icons only
 * Rule #4: Modular component architecture
 * Rule #5: ~150 lines (within limit)
 */

type ViewMode = 'table' | 'kanban';

export function ProjectsDirectory() {
  const router = useRouter();
  const [filters, setFilters] = useState<ProjectFilters>({});
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  
  // Real Firebase data with realtime updates
  const { projects, loading, error, totalCount } = useProjects({
    filters,
    pageSize: 100,
    sortBy: 'createdAt',
    sortOrder: 'desc',
    realtime: true,
  });

  // Calculate KPIs from real data
  const kpis = useProjectsKPIs(projects);

  // Handlers
  const handleNewProject = () => setShowCreateDialog(true);
  const handleProjectCreated = (projectId: string) => router.push(`/projects/${projectId}`);
  const handleViewProject = (projectId: string) => router.push(`/projects/${projectId}`);
  const handleEditProject = () => toast.info('Funcionalidad de editar proyecto en desarrollo');
  
  const handleDeleteProject = async (projectId: string) => {
    const confirmed = confirm('¿Estás seguro de eliminar este proyecto? Esta acción no se puede deshacer.');
    if (!confirmed) return;

    try {
      await ProjectsService.deleteProject(projectId);
      toast.success('Proyecto eliminado exitosamente');
    } catch (error) {
      logger.error('Error deleting project from UI', error as Error);
      toast.error('Error al eliminar el proyecto');
    }
  };

  const handleRefresh = () => toast.success('Datos actualizados');
  const handleExport = () => toast.info('Funcionalidad de exportar en desarrollo');
  const handleClearFilters = () => { setFilters({}); toast.success('Filtros limpiados'); };

  // Error state
  if (error) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-red-600">Error al cargar proyectos</h3>
          <p className="text-sm text-muted-foreground mt-2">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <ProjectsHeader
        onNewProject={handleNewProject}
        onRefresh={handleRefresh}
        onExport={handleExport}
        loading={loading}
      />

      {/* KPI Cards */}
      <ProjectsKPICards kpis={kpis} loading={loading} />

      {/* Filters + View Toggle */}
      <div className="flex items-start justify-between gap-4">
        <ProjectFiltersComponent
          filters={filters}
          onFiltersChange={setFilters}
          onClearFilters={handleClearFilters}
        />
        
        {/* View Mode Toggle */}
        <div className="flex gap-1 border rounded-lg p-1">
          <Button
            variant={viewMode === 'table' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('table')}
            className="px-3"
          >
            <LayoutList className="h-4 w-4 mr-2" />
            Tabla
          </Button>
          <Button
            variant={viewMode === 'kanban' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('kanban')}
            className="px-3"
          >
            <LayoutGrid className="h-4 w-4 mr-2" />
            Kanban
          </Button>
        </div>
      </div>

      {/* Results Count */}
      {!loading && (
        <div className="text-sm text-muted-foreground">
          Mostrando {projects.length} de {totalCount} proyectos
        </div>
      )}

      {/* Projects View */}
      {viewMode === 'table' ? (
        <ProjectsTable
          projects={projects}
          loading={loading}
          onViewProject={handleViewProject}
          onEditProject={handleEditProject}
          onDeleteProject={handleDeleteProject}
        />
      ) : (
        <ProjectsKanban
          projects={projects}
          onProjectClick={handleViewProject}
        />
      )}

      {/* Create Project Dialog */}
      <ProjectFormDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSuccess={handleProjectCreated}
      />
    </div>
  );
}
