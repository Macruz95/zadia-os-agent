/**
 * ZADIA OS - Workflow Card Component
 * Tarjeta de flujo cognitivo
 */

'use client';

import { Play, Pause, Settings, Trash2, Clock, CheckCircle2, Sparkles } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Workflow } from '../types/workflows.types';

interface WorkflowCardProps {
  workflow: Workflow;
  onExecute?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onToggleStatus?: () => void;
}

export function WorkflowCard({ 
  workflow, 
  onExecute, 
  onEdit, 
  onDelete,
  onToggleStatus 
}: WorkflowCardProps) {
  const createdAt = workflow.createdAt instanceof Date 
    ? workflow.createdAt 
    : workflow.createdAt.toDate();

  const lastExecuted = workflow.lastExecutedAt
    ? (workflow.lastExecutedAt instanceof Date 
        ? workflow.lastExecutedAt 
        : workflow.lastExecutedAt.toDate())
    : null;

  const statusColors = {
    active: 'bg-green-500/20 text-green-400 border-green-500/30',
    paused: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    completed: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    archived: 'bg-gray-500/20 text-gray-400 border-gray-500/30'
  };

  const templateColors = {
    'onboarding-client': 'bg-purple-500/20 text-purple-400',
    'invoice-reminder': 'bg-orange-500/20 text-orange-400',
    'project-kickoff': 'bg-cyan-500/20 text-cyan-400',
    'custom': 'bg-gray-500/20 text-gray-400'
  };

  const templateLabels = {
    'onboarding-client': 'Onboarding Cliente',
    'invoice-reminder': 'Recordatorio Facturas',
    'project-kickoff': 'Inicio Proyecto',
    'custom': 'Personalizado'
  };

  return (
    <div className="group relative p-4 rounded-xl border transition-all duration-200 bg-[#161b22] border-gray-800/50 hover:border-cyan-500/30 hover:bg-[#1c2333]">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="h-4 w-4 text-cyan-400 flex-shrink-0" />
            <h3 className="font-semibold text-white truncate group-hover:text-cyan-400 transition-colors">
              {workflow.name}
            </h3>
          </div>
          {workflow.description && (
            <p className="text-sm text-gray-500 line-clamp-2">
              {workflow.description}
            </p>
          )}
        </div>
      </div>

      {/* Metadata */}
      <div className="flex flex-col gap-2 mb-3">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Clock className="h-3.5 w-3.5" />
          <span>Creado: {format(createdAt, "d 'de' MMMM, yyyy", { locale: es })}</span>
        </div>

        {lastExecuted && (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>Última ejecución: {format(lastExecuted, "d 'de' MMMM, yyyy", { locale: es })}</span>
          </div>
        )}

        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span>Pasos: {workflow.steps.length}</span>
          {workflow.executionCount !== undefined && workflow.executionCount > 0 && (
            <>
              <span>•</span>
              <span>Ejecuciones: {workflow.executionCount}</span>
            </>
          )}
        </div>
      </div>

      {/* Badges */}
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <Badge 
          variant="outline" 
          className={cn("text-xs", statusColors[workflow.status])}
        >
          {workflow.status === 'active' ? 'Activo' :
           workflow.status === 'paused' ? 'Pausado' :
           workflow.status === 'completed' ? 'Completado' : 'Archivado'}
        </Badge>
        
        <Badge 
          variant="outline" 
          className={cn("text-xs", templateColors[workflow.template])}
        >
          {templateLabels[workflow.template]}
        </Badge>

        {workflow.triggers.some(t => t.enabled) && (
          <Badge variant="outline" className="text-xs bg-cyan-500/20 text-cyan-400 border-cyan-500/30">
            Auto
          </Badge>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 pt-3 border-t border-gray-800/50">
        {workflow.status === 'active' ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleStatus}
            className="text-gray-400 hover:text-yellow-400"
          >
            <Pause className="h-3.5 w-3.5 mr-1" />
            Pausar
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleStatus}
            className="text-gray-400 hover:text-green-400"
          >
            <Play className="h-3.5 w-3.5 mr-1" />
            Activar
          </Button>
        )}

        <Button
          variant="ghost"
          size="sm"
          onClick={onExecute}
          className="flex-1 text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10"
        >
          <Play className="h-3.5 w-3.5 mr-1" />
          Ejecutar
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={onEdit}
          className="text-gray-400 hover:text-white"
        >
          <Settings className="h-3.5 w-3.5" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={onDelete}
          className="text-gray-400 hover:text-red-400"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}

