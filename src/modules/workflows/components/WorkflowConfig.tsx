/**
 * ZADIA OS - Workflow Config Component
 * Configuración de flujo cognitivo
 */

'use client';

import { useState } from 'react';
import { Settings, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import type { Workflow } from '../types/workflows.types';

interface WorkflowConfigProps {
  workflow: Workflow;
  onSave: (updates: Partial<Workflow>) => Promise<void>;
  trigger?: React.ReactNode;
}

export function WorkflowConfig({ workflow, onSave, trigger }: WorkflowConfigProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(workflow.name);
  const [description, setDescription] = useState(workflow.description || '');
  const [autoStart, setAutoStart] = useState(workflow.config.autoStart || false);
  const [retryOnFailure, setRetryOnFailure] = useState(workflow.config.retryOnFailure || false);
  const [maxRetries, setMaxRetries] = useState(workflow.config.maxRetries || 3);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    try {
      setLoading(true);
      await onSave({
        name,
        description,
        config: {
          ...workflow.config,
          autoStart,
          retryOnFailure,
          maxRetries
        }
      });
      setOpen(false);
    } catch {
      // Error handled silently
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="bg-[#161b22] border-gray-800/50">
            <Settings className="h-4 w-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="bg-[#161b22] border-gray-800/50 text-white max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-cyan-400" />
            Configurar Flujo
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Personaliza la configuración del flujo cognitivo
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Nombre */}
          <div className="space-y-2">
            <Label htmlFor="name">Nombre</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-[#0d1117] border-gray-800/50"
              required
            />
          </div>

          {/* Descripción */}
          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="bg-[#0d1117] border-gray-800/50 min-h-[80px]"
            />
          </div>

          {/* Configuración */}
          <div className="space-y-4 pt-4 border-t border-gray-800/50">
            <h3 className="font-semibold text-white">Configuración</h3>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="autoStart">Inicio automático</Label>
                <p className="text-sm text-gray-400">
                  Ejecutar automáticamente cuando se cumplan los triggers
                </p>
              </div>
              <Switch
                id="autoStart"
                checked={autoStart}
                onCheckedChange={setAutoStart}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="retryOnFailure">Reintentar en caso de fallo</Label>
                <p className="text-sm text-gray-400">
                  Reintentar automáticamente si la ejecución falla
                </p>
              </div>
              <Switch
                id="retryOnFailure"
                checked={retryOnFailure}
                onCheckedChange={setRetryOnFailure}
              />
            </div>

            {retryOnFailure && (
              <div className="space-y-2">
                <Label htmlFor="maxRetries">Máximo de reintentos</Label>
                <Input
                  id="maxRetries"
                  type="number"
                  min="1"
                  max="10"
                  value={maxRetries}
                  onChange={(e) => setMaxRetries(parseInt(e.target.value) || 3)}
                  className="bg-[#0d1117] border-gray-800/50 w-32"
                />
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              className="bg-[#0d1117] border-gray-800/50"
            >
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={loading || !name}
              className="bg-cyan-600 hover:bg-cyan-700"
            >
              <Save className="h-4 w-4 mr-2" />
              {loading ? 'Guardando...' : 'Guardar'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

