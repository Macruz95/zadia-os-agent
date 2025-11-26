/**
 * ZADIA OS - Workflow Gallery Component
 * Galería principal de flujos cognitivos
 */

'use client';

import { useState } from 'react';
import { Sparkles, Plus, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useWorkflows } from '../hooks/use-workflows';

import { WorkflowCard } from './WorkflowCard';
import { WorkflowHistory } from './WorkflowHistory';
import { WorkflowConfig } from './WorkflowConfig';
import type { Workflow, WorkflowTemplate } from '../types/workflows.types';

export function WorkflowGallery() {
  const { 
    workflows, 
    loading, 
    createFromTemplate, 
    updateWorkflow, 
    deleteWorkflow, 
    executeWorkflow 
  } = useWorkflows();
  
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);
  const [statusFilter, setStatusFilter] = useState<Workflow['status'] | 'all'>('all');
  const [templateFilter, setTemplateFilter] = useState<WorkflowTemplate | 'all'>('all');

  // Filtrar flujos
  const filteredWorkflows = workflows.filter(workflow => {
    if (statusFilter !== 'all' && workflow.status !== statusFilter) {
      return false;
    }
    if (templateFilter !== 'all' && workflow.template !== templateFilter) {
      return false;
    }
    return true;
  });

  const handleCreateFromTemplate = async (template: WorkflowTemplate) => {
    try {
      await createFromTemplate(template);
    } catch {
      // Error handled silently
    }
  };

  const handleToggleStatus = async (workflow: Workflow) => {
    try {
      const newStatus = workflow.status === 'active' ? 'paused' : 'active';
      await updateWorkflow(workflow.id, { status: newStatus });
    } catch {
      // Error handled silently
    }
  };

  const handleExecute = async (workflow: Workflow) => {
    try {
      await executeWorkflow(workflow.id, {});
    } catch {
      // Error handled silently
    }
  };

  const handleDelete = async (workflow: Workflow) => {
    if (!confirm(`¿Estás seguro de eliminar el flujo "${workflow.name}"?`)) {
      return;
    }
    try {
      await deleteWorkflow(workflow.id);
    } catch {
      // Error handled silently
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-500">Cargando flujos...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-cyan-400" />
            Biblioteca de Flujos Cognitivos
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Automatiza procesos empresariales con flujos inteligentes
          </p>
        </div>
        
        {/* Crear desde template */}
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-cyan-600 hover:bg-cyan-700">
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Flujo
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[#161b22] border-gray-800/50 text-white">
            <DialogHeader>
              <DialogTitle>Crear Flujo desde Template</DialogTitle>
              <DialogDescription className="text-gray-400">
                Selecciona un template para crear un nuevo flujo
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start bg-[#0d1117] border-gray-800/50 hover:border-purple-500/30"
                onClick={() => handleCreateFromTemplate('onboarding-client')}
              >
                <Play className="h-4 w-4 mr-2" />
                Onboarding de Cliente
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start bg-[#0d1117] border-gray-800/50 hover:border-orange-500/30"
                onClick={() => handleCreateFromTemplate('invoice-reminder')}
              >
                <Play className="h-4 w-4 mr-2" />
                Recordatorio de Facturas
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start bg-[#0d1117] border-gray-800/50 hover:border-cyan-500/30"
                onClick={() => handleCreateFromTemplate('project-kickoff')}
              >
                <Play className="h-4 w-4 mr-2" />
                Inicio de Proyecto
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filtros */}
      <Card className="bg-[#161b22] border-gray-800/50">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as Workflow['status'] | 'all')}>
              <SelectTrigger className="w-full md:w-[180px] bg-[#0d1117] border-gray-800/50 text-white">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent className="bg-[#161b22] border-gray-800/50">
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="active">Activo</SelectItem>
                <SelectItem value="paused">Pausado</SelectItem>
                <SelectItem value="completed">Completado</SelectItem>
                <SelectItem value="archived">Archivado</SelectItem>
              </SelectContent>
            </Select>
            <Select value={templateFilter} onValueChange={(v) => setTemplateFilter(v as WorkflowTemplate | 'all')}>
              <SelectTrigger className="w-full md:w-[180px] bg-[#0d1117] border-gray-800/50 text-white">
                <SelectValue placeholder="Template" />
              </SelectTrigger>
              <SelectContent className="bg-[#161b22] border-gray-800/50">
                <SelectItem value="all">Todos los templates</SelectItem>
                <SelectItem value="onboarding-client">Onboarding Cliente</SelectItem>
                <SelectItem value="invoice-reminder">Recordatorio Facturas</SelectItem>
                <SelectItem value="project-kickoff">Inicio Proyecto</SelectItem>
                <SelectItem value="custom">Personalizado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Vista principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Galería de flujos */}
        <div className="lg:col-span-2">
          {filteredWorkflows.length === 0 ? (
            <Card className="bg-[#161b22] border-gray-800/50">
              <CardContent className="p-12 text-center">
                <Sparkles className="h-12 w-12 mx-auto mb-4 text-gray-400 opacity-50" />
                <p className="text-gray-400 mb-4">No hay flujos que coincidan con los filtros</p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setStatusFilter('all');
                    setTemplateFilter('all');
                  }}
                  className="bg-[#0d1117] border-gray-800/50"
                >
                  Limpiar filtros
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredWorkflows.map(workflow => (
                <WorkflowCard
                  key={workflow.id}
                  workflow={workflow}
                  onExecute={() => handleExecute(workflow)}
                  onEdit={() => setSelectedWorkflow(workflow)}
                  onDelete={() => handleDelete(workflow)}
                  onToggleStatus={() => handleToggleStatus(workflow)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Panel lateral */}
        <div className="space-y-6">
          {/* Configuración del flujo seleccionado */}
          {selectedWorkflow && (
            <WorkflowConfig
              workflow={selectedWorkflow}
              onSave={async (updates) => {
                await updateWorkflow(selectedWorkflow.id, updates);
                setSelectedWorkflow(null);
              }}
            />
          )}

          {/* Historial */}
          <WorkflowHistory workflowId={selectedWorkflow?.id} />
        </div>
      </div>
    </div>
  );
}

