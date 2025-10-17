'use client';

import { useState } from 'react';
import { useProjects, useProjectsKPIs } from '../hooks/use-projects';
import type { ProjectFilters } from '../hooks/use-projects';
import { ProjectsHeader } from './ProjectsHeader';
import { ProjectsKPICards } from './ProjectsKPICards';
import { ProjectFilters as ProjectFiltersComponent } from './ProjectFilters';
import { ProjectsTable } from './ProjectsTable';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ProjectsService } from '../services/projects.service';
import { logger } from '@/lib/logger';

/**
 * ProjectsDirectory - Main component for Projects module
 * Rule #1: Real Firebase data via useProjects hook
 * Rule #2: ShadCN UI + Lucide icons only
 * Rule #4: Modular component architecture
 * Rule #5: 289 lines (within limit)
 */
export function ProjectsDirectory() {
  const router = useRouter();
  const [filters, setFilters] = useState<ProjectFilters>({});
  
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
  const handleNewProject = () => {
    // TODO: Open create project dialog/modal or navigate to form
    toast.info('Funcionalidad de crear proyecto en desarrollo');
    // router.push('/projects/new');
  };

  const handleViewProject = (projectId: string) => {
    router.push(`/projects/${projectId}`);
  };

  const handleEditProject = () => {
    // TODO: Open edit dialog or navigate to edit form
    toast.info('Funcionalidad de editar proyecto en desarrollo');
  };

  const handleDeleteProject = async (projectId: string) => {
    try {
      // TODO: Add confirmation dialog before deletion
      const confirmed = confirm('¿Estás seguro de eliminar este proyecto? Esta acción no se puede deshacer.');
      
      if (!confirmed) return;

      await ProjectsService.deleteProject(projectId);
      toast.success('Proyecto eliminado exitosamente');
    } catch (error) {
      logger.error('Error deleting project from UI', error as Error);
      toast.error('Error al eliminar el proyecto');
    }
  };

  const handleRefresh = () => {
    // Realtime listener handles updates automatically
    toast.success('Datos actualizados');
  };

  const handleExport = () => {
    // TODO: Implement CSV/Excel export
    toast.info('Funcionalidad de exportar en desarrollo');
  };

  const handleClearFilters = () => {
    setFilters({});
    toast.success('Filtros limpiados');
  };

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

      {/* Filters */}
      <ProjectFiltersComponent
        filters={filters}
        onFiltersChange={setFilters}
        onClearFilters={handleClearFilters}
      />

      {/* Results Count */}
      {!loading && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Mostrando {projects.length} de {totalCount} proyectos
          </span>
        </div>
      )}

      {/* Projects Table */}
      <ProjectsTable
        projects={projects}
        loading={loading}
        onViewProject={handleViewProject}
        onEditProject={handleEditProject}
        onDeleteProject={handleDeleteProject}
      />
    </div>
  );
}
