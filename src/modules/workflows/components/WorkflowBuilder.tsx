/**
 * ZADIA OS - Visual Workflow Builder
 * Drag and Drop Workflow Designer
 * Uses native HTML5 drag-and-drop for maximum compatibility
 */

'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { 
  Play, 
  Plus, 
  Trash2, 
  Settings, 
  Save, 
  Zap,
  GitBranch,
  Clock,
  Bell,
  Database,
  Brain,
  GripVertical,
  X,
  Check
} from 'lucide-react';
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
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import type { WorkflowStep, StepType } from '../types/workflows.types';

// ============================================
// Types
// ============================================

interface Position {
  x: number;
  y: number;
}

interface VisualStep extends WorkflowStep {
  position: Position;
}

interface Connection {
  from: string;
  to: string;
  type: 'success' | 'failure' | 'default';
}

interface WorkflowBuilderProps {
  initialSteps?: VisualStep[];
  initialConnections?: Connection[];
  onSave?: (steps: VisualStep[], connections: Connection[]) => Promise<void>;
  readOnly?: boolean;
}

// ============================================
// Step Templates
// ============================================

const stepTemplates: Record<StepType, { 
  icon: typeof Zap; 
  label: string; 
  color: string;
  description: string;
}> = {
  'action': {
    icon: Zap,
    label: 'Acción',
    color: 'bg-blue-500',
    description: 'Ejecutar una acción específica'
  },
  'condition': {
    icon: GitBranch,
    label: 'Condición',
    color: 'bg-yellow-500',
    description: 'Evaluar una condición y ramificar'
  },
  'delay': {
    icon: Clock,
    label: 'Esperar',
    color: 'bg-purple-500',
    description: 'Pausar el flujo por un tiempo'
  },
  'notification': {
    icon: Bell,
    label: 'Notificación',
    color: 'bg-green-500',
    description: 'Enviar notificación o alerta'
  },
  'data-fetch': {
    icon: Database,
    label: 'Obtener Datos',
    color: 'bg-orange-500',
    description: 'Consultar datos del sistema'
  },
  'ai-decision': {
    icon: Brain,
    label: 'Decisión IA',
    color: 'bg-cyan-500',
    description: 'Usar IA para tomar decisiones'
  }
};

// ============================================
// Step Node Component
// ============================================

interface StepNodeProps {
  step: VisualStep;
  isSelected: boolean;
  onSelect: () => void;
  onDragStart: (e: React.DragEvent) => void;
  onDelete: () => void;
  onEdit: () => void;
  readOnly?: boolean;
}

function StepNode({ 
  step, 
  isSelected, 
  onSelect, 
  onDragStart,
  onDelete,
  onEdit,
  readOnly 
}: StepNodeProps) {
  const template = stepTemplates[step.type];
  const Icon = template.icon;

  return (
    <div
      className={cn(
        "absolute w-48 bg-[#161b22] border rounded-lg p-3 cursor-pointer transition-all",
        "hover:border-cyan-500/50 hover:shadow-lg hover:shadow-cyan-500/10",
        isSelected ? "border-cyan-500 shadow-lg shadow-cyan-500/20" : "border-gray-800/50"
      )}
      style={{
        left: step.position.x,
        top: step.position.y,
      }}
      draggable={!readOnly}
      onDragStart={onDragStart}
      onClick={onSelect}
    >
      {/* Drag Handle */}
      {!readOnly && (
        <div className="absolute -left-2 top-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing">
          <GripVertical className="w-4 h-4 text-gray-500" />
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <div className={cn("p-1.5 rounded", template.color)}>
          <Icon className="w-4 h-4 text-white" />
        </div>
        <span className="text-sm font-medium text-white truncate flex-1">
          {step.name}
        </span>
      </div>

      {/* Description */}
      {step.description && (
        <p className="text-xs text-gray-400 truncate">
          {step.description}
        </p>
      )}

      {/* Actions */}
      {isSelected && !readOnly && (
        <div className="absolute -top-2 -right-2 flex gap-1">
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(); }}
            className="p-1 bg-blue-600 rounded-full hover:bg-blue-700 transition-colors"
          >
            <Settings className="w-3 h-3 text-white" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="p-1 bg-red-600 rounded-full hover:bg-red-700 transition-colors"
          >
            <Trash2 className="w-3 h-3 text-white" />
          </button>
        </div>
      )}

      {/* Connection Points */}
      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-gray-700 border-2 border-cyan-500 rounded-full" />
      <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-gray-700 border-2 border-cyan-500 rounded-full" />
    </div>
  );
}

// ============================================
// Toolbox Component
// ============================================

interface ToolboxProps {
  onAddStep: (type: StepType) => void;
}

function Toolbox({ onAddStep }: ToolboxProps) {
  return (
    <div className="w-64 bg-[#0d1117] border-r border-gray-800/50 p-4 overflow-y-auto">
      <h3 className="text-sm font-semibold text-white mb-4">Componentes</h3>
      <div className="space-y-2">
        {(Object.entries(stepTemplates) as [StepType, typeof stepTemplates[StepType]][]).map(([type, template]) => {
          const Icon = template.icon;
          return (
            <button
              key={type}
              onClick={() => onAddStep(type)}
              className={cn(
                "w-full flex items-center gap-3 p-3 rounded-lg transition-all",
                "bg-[#161b22] border border-gray-800/50 hover:border-cyan-500/50",
                "hover:shadow-lg hover:shadow-cyan-500/10"
              )}
            >
              <div className={cn("p-2 rounded", template.color)}>
                <Icon className="w-4 h-4 text-white" />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-white">{template.label}</p>
                <p className="text-xs text-gray-400">{template.description}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ============================================
// Step Editor Dialog
// ============================================

interface StepEditorProps {
  step: VisualStep | null;
  open: boolean;
  onClose: () => void;
  onSave: (step: VisualStep) => void;
}

function StepEditor({ step, open, onClose, onSave }: StepEditorProps) {
  const [name, setName] = useState(step?.name || '');
  const [description, setDescription] = useState(step?.description || '');
  const [config, setConfig] = useState<Record<string, unknown>>(step?.config || {});

  useEffect(() => {
    if (step) {
      setName(step.name);
      setDescription(step.description || '');
      setConfig(step.config);
    }
  }, [step]);

  const handleSave = () => {
    if (step) {
      onSave({
        ...step,
        name,
        description,
        config
      });
    }
    onClose();
  };

  if (!step) return null;

  const template = stepTemplates[step.type];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-[#161b22] border-gray-800/50 text-white max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className={cn("p-2 rounded", template.color)}>
              <template.icon className="w-4 h-4 text-white" />
            </div>
            Configurar {template.label}
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Personaliza el comportamiento de este paso
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="step-name">Nombre</Label>
            <Input
              id="step-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-[#0d1117] border-gray-800/50"
              placeholder="Nombre del paso"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="step-description">Descripción</Label>
            <Textarea
              id="step-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="bg-[#0d1117] border-gray-800/50"
              placeholder="Descripción opcional"
            />
          </div>

          {/* Configuración específica por tipo */}
          {step.type === 'delay' && (
            <div className="space-y-2">
              <Label>Duración</Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  value={(config.duration as number) || 1}
                  onChange={(e) => setConfig({ ...config, duration: parseInt(e.target.value) })}
                  className="bg-[#0d1117] border-gray-800/50 w-24"
                  min={1}
                />
                <Select
                  value={(config.unit as string) || 'minutes'}
                  onValueChange={(value) => setConfig({ ...config, unit: value })}
                >
                  <SelectTrigger className="bg-[#0d1117] border-gray-800/50 flex-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#161b22] border-gray-800/50">
                    <SelectItem value="seconds">Segundos</SelectItem>
                    <SelectItem value="minutes">Minutos</SelectItem>
                    <SelectItem value="hours">Horas</SelectItem>
                    <SelectItem value="days">Días</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {step.type === 'notification' && (
            <>
              <div className="space-y-2">
                <Label>Tipo de notificación</Label>
                <Select
                  value={(config.notificationType as string) || 'email'}
                  onValueChange={(value) => setConfig({ ...config, notificationType: value })}
                >
                  <SelectTrigger className="bg-[#0d1117] border-gray-800/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#161b22] border-gray-800/50">
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="push">Push</SelectItem>
                    <SelectItem value="sms">SMS</SelectItem>
                    <SelectItem value="in-app">In-App</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Mensaje</Label>
                <Textarea
                  value={(config.message as string) || ''}
                  onChange={(e) => setConfig({ ...config, message: e.target.value })}
                  className="bg-[#0d1117] border-gray-800/50"
                  placeholder="Contenido del mensaje"
                />
              </div>
            </>
          )}

          {step.type === 'condition' && (
            <>
              <div className="space-y-2">
                <Label>Campo a evaluar</Label>
                <Input
                  value={(config.field as string) || ''}
                  onChange={(e) => setConfig({ ...config, field: e.target.value })}
                  className="bg-[#0d1117] border-gray-800/50"
                  placeholder="ej: client.status"
                />
              </div>
              <div className="space-y-2">
                <Label>Operador</Label>
                <Select
                  value={(config.operator as string) || 'equals'}
                  onValueChange={(value) => setConfig({ ...config, operator: value })}
                >
                  <SelectTrigger className="bg-[#0d1117] border-gray-800/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#161b22] border-gray-800/50">
                    <SelectItem value="equals">Igual a</SelectItem>
                    <SelectItem value="not-equals">No igual a</SelectItem>
                    <SelectItem value="greater-than">Mayor que</SelectItem>
                    <SelectItem value="less-than">Menor que</SelectItem>
                    <SelectItem value="contains">Contiene</SelectItem>
                    <SelectItem value="exists">Existe</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Valor</Label>
                <Input
                  value={(config.value as string) || ''}
                  onChange={(e) => setConfig({ ...config, value: e.target.value })}
                  className="bg-[#0d1117] border-gray-800/50"
                  placeholder="Valor a comparar"
                />
              </div>
            </>
          )}

          {step.type === 'action' && (
            <div className="space-y-2">
              <Label>Tipo de acción</Label>
              <Select
                value={(config.actionType as string) || 'update-record'}
                onValueChange={(value) => setConfig({ ...config, actionType: value })}
              >
                <SelectTrigger className="bg-[#0d1117] border-gray-800/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#161b22] border-gray-800/50">
                  <SelectItem value="update-record">Actualizar registro</SelectItem>
                  <SelectItem value="create-record">Crear registro</SelectItem>
                  <SelectItem value="delete-record">Eliminar registro</SelectItem>
                  <SelectItem value="send-email">Enviar email</SelectItem>
                  <SelectItem value="call-api">Llamar API externa</SelectItem>
                  <SelectItem value="generate-pdf">Generar PDF</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {step.type === 'ai-decision' && (
            <div className="space-y-2">
              <Label>Prompt para IA</Label>
              <Textarea
                value={(config.prompt as string) || ''}
                onChange={(e) => setConfig({ ...config, prompt: e.target.value })}
                className="bg-[#0d1117] border-gray-800/50 min-h-[100px]"
                placeholder="Describe qué decisión debe tomar la IA..."
              />
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={onClose} className="bg-[#0d1117] border-gray-800/50">
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            <Button onClick={handleSave} className="bg-cyan-600 hover:bg-cyan-700">
              <Check className="w-4 h-4 mr-2" />
              Guardar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ============================================
// Main Workflow Builder Component
// ============================================

export function WorkflowBuilder({ 
  initialSteps = [], 
  initialConnections = [],
  onSave,
  readOnly = false
}: WorkflowBuilderProps) {
  const [steps, setSteps] = useState<VisualStep[]>(initialSteps);
  const [connections, setConnections] = useState<Connection[]>(initialConnections);
  const [selectedStep, setSelectedStep] = useState<string | null>(null);
  const [editingStep, setEditingStep] = useState<VisualStep | null>(null);
  const [saving, setSaving] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);
  const [draggedStep, setDraggedStep] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<Position>({ x: 0, y: 0 });

  // Generate unique ID
  const generateId = () => `step-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // Add new step
  const handleAddStep = useCallback((type: StepType) => {
    const template = stepTemplates[type];
    const newStep: VisualStep = {
      id: generateId(),
      type,
      name: template.label,
      description: template.description,
      order: steps.length,
      config: {},
      position: {
        x: 100 + (steps.length % 3) * 200,
        y: 100 + Math.floor(steps.length / 3) * 150
      }
    };
    setSteps([...steps, newStep]);
  }, [steps]);

  // Delete step
  const handleDeleteStep = useCallback((stepId: string) => {
    setSteps(steps.filter(s => s.id !== stepId));
    setConnections(connections.filter(c => c.from !== stepId && c.to !== stepId));
    if (selectedStep === stepId) {
      setSelectedStep(null);
    }
  }, [steps, connections, selectedStep]);

  // Handle drag start
  const handleDragStart = useCallback((e: React.DragEvent, stepId: string) => {
    const step = steps.find(s => s.id === stepId);
    if (step) {
      const rect = (e.target as HTMLElement).getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
      setDraggedStep(stepId);
    }
  }, [steps]);

  // Handle drag over canvas
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  // Handle drop on canvas
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (draggedStep && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const newPosition = {
        x: e.clientX - rect.left - dragOffset.x,
        y: e.clientY - rect.top - dragOffset.y
      };
      
      setSteps(steps.map(s => 
        s.id === draggedStep 
          ? { ...s, position: newPosition }
          : s
      ));
    }
    setDraggedStep(null);
  }, [draggedStep, dragOffset, steps]);

  // Save workflow
  const handleSave = async () => {
    if (onSave) {
      try {
        setSaving(true);
        await onSave(steps, connections);
      } finally {
        setSaving(false);
      }
    }
  };

  // Render connections as SVG lines
  const renderConnections = () => {
    return (
      <svg className="absolute inset-0 pointer-events-none" style={{ zIndex: 0 }}>
        <defs>
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="7"
            refX="9"
            refY="3.5"
            orient="auto"
          >
            <polygon points="0 0, 10 3.5, 0 7" fill="#06b6d4" />
          </marker>
        </defs>
        {connections.map((conn, idx) => {
          const fromStep = steps.find(s => s.id === conn.from);
          const toStep = steps.find(s => s.id === conn.to);
          if (!fromStep || !toStep) return null;

          const x1 = fromStep.position.x + 96; // center of 192px width
          const y1 = fromStep.position.y + 80; // bottom of step
          const x2 = toStep.position.x + 96;
          const y2 = toStep.position.y; // top of step

          return (
            <line
              key={idx}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="#06b6d4"
              strokeWidth="2"
              markerEnd="url(#arrowhead)"
            />
          );
        })}
      </svg>
    );
  };

  return (
    <div className="flex h-[calc(100vh-200px)] bg-[#0d1117] rounded-lg border border-gray-800/50 overflow-hidden">
      {/* Toolbox */}
      {!readOnly && <Toolbox onAddStep={handleAddStep} />}

      {/* Canvas */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800/50">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-white">Constructor de Flujos</h3>
            <span className="text-sm text-gray-400">
              {steps.length} paso{steps.length !== 1 ? 's' : ''}
            </span>
          </div>
          {!readOnly && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="bg-[#161b22] border-gray-800/50"
                onClick={() => {/* Preview logic */}}
              >
                <Play className="w-4 h-4 mr-2" />
                Probar
              </Button>
              <Button
                size="sm"
                className="bg-cyan-600 hover:bg-cyan-700"
                onClick={handleSave}
                disabled={saving}
              >
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Guardando...' : 'Guardar'}
              </Button>
            </div>
          )}
        </div>

        {/* Canvas Area */}
        <div
          ref={canvasRef}
          className="flex-1 relative overflow-auto bg-[#0d1117]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
            `,
            backgroundSize: '20px 20px'
          }}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          {/* Connections */}
          {renderConnections()}

          {/* Steps */}
          {steps.map((step) => (
            <StepNode
              key={step.id}
              step={step}
              isSelected={selectedStep === step.id}
              onSelect={() => setSelectedStep(step.id)}
              onDragStart={(e) => handleDragStart(e, step.id)}
              onDelete={() => handleDeleteStep(step.id)}
              onEdit={() => setEditingStep(step)}
              readOnly={readOnly}
            />
          ))}

          {/* Empty state */}
          {steps.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-800/50 flex items-center justify-center">
                  <Plus className="w-8 h-8 text-gray-500" />
                </div>
                <h3 className="text-lg font-medium text-white mb-2">
                  Comienza a diseñar tu flujo
                </h3>
                <p className="text-gray-400 max-w-sm">
                  Arrastra componentes desde el panel izquierdo o haz clic en ellos para agregar pasos a tu flujo de trabajo
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Step Editor Dialog */}
      <StepEditor
        step={editingStep}
        open={!!editingStep}
        onClose={() => setEditingStep(null)}
        onSave={(updatedStep) => {
          setSteps(steps.map(s => s.id === updatedStep.id ? updatedStep : s));
          setEditingStep(null);
        }}
      />
    </div>
  );
}

export default WorkflowBuilder;
