'use client';

import { Button } from '@/components/ui/button';
import { Plus, Download, RefreshCw } from 'lucide-react';

// Rule #2: ShadCN UI + Lucide Icons only

interface ProjectsHeaderProps {
  onNewProject: () => void;
  onRefresh?: () => void;
  onExport?: () => void;
  loading?: boolean;
}

export function ProjectsHeader({
  onNewProject,
  onRefresh,
  onExport,
  loading = false,
}: ProjectsHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Proyectos</h1>
        <p className="text-muted-foreground">
          Gestiona y da seguimiento a tus proyectos
        </p>
      </div>

      <div className="flex items-center gap-2">
        {onRefresh && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
        )}

        {onExport && (
          <Button variant="outline" size="sm" onClick={onExport}>
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        )}

        <Button onClick={onNewProject}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Proyecto
        </Button>
      </div>
    </div>
  );
}
