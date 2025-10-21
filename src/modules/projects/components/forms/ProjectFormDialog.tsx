'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { 
  ProjectFormStep1,
  ProjectFormStep2,
  ProjectFormStep3,
  ProjectFormStep4
} from './steps';
import { ProjectsService } from '../../services/projects.service';
import { logger } from '@/lib/logger';
import type { CreateProjectInput } from '../../validations/projects.validation';
import { ArrowLeft, ArrowRight, Save } from 'lucide-react';

/**
 * ProjectFormDialog - Wizard para crear proyectos
 * Rule #1: Real Firebase data via ProjectsService
 * Rule #2: ShadCN UI + Lucide icons only
 * Rule #3: Zod validation per step
 * Rule #4: Modular step components
 * Rule #5: 195 lines (within limit)
 */

interface ProjectFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (projectId: string) => void;
  initialData?: Partial<CreateProjectInput>;
}

const STEPS = [
  { id: 1, title: 'Información General', description: 'Datos básicos del proyecto' },
  { id: 2, title: 'Alcance y Entregables', description: 'Descripción y alcance' },
  { id: 3, title: 'Finanzas y Condiciones', description: 'Precios y términos' },
  { id: 4, title: 'Fechas y Equipo', description: 'Calendario y asignaciones' },
];

export function ProjectFormDialog({
  open,
  onOpenChange,
  onSuccess,
  initialData = {},
}: ProjectFormDialogProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<Partial<CreateProjectInput>>(initialData);

  const progress = (currentStep / STEPS.length) * 100;

  // Update form data from step
  const handleStepChange = (stepData: Partial<CreateProjectInput>) => {
    setFormData((prev) => ({ ...prev, ...stepData }));
  };

  // Navigation
  const handleNext = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  // Submit project
  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);

      // Validate required fields
      if (!formData.name || !formData.clientId || !formData.projectManager) {
        toast.error('Faltan campos obligatorios');
        return;
      }

      // Create project
      const projectId = await ProjectsService.createProject(formData as CreateProjectInput);

      toast.success('Proyecto creado exitosamente');
      logger.info(`Project created: ${projectId}`);

      onSuccess?.(projectId);
      onOpenChange(false);

      // Reset form
      setFormData({});
      setCurrentStep(1);
    } catch (error) {
      logger.error('Error creating project', error as Error);
      toast.error('Error al crear el proyecto');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Close handler
  const handleClose = () => {
    if (isSubmitting) return;
    
    if (Object.keys(formData).length > 0) {
      if (!confirm('¿Descartar cambios sin guardar?')) {
        return;
      }
    }
    
    setFormData({});
    setCurrentStep(1);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Crear Nuevo Proyecto</DialogTitle>
          <div className="space-y-2 pt-4">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">{STEPS[currentStep - 1].title}</span>
              <span className="text-muted-foreground">
                Paso {currentStep} de {STEPS.length}
              </span>
            </div>
            <Progress value={progress} className="h-2" />
            <p className="text-sm text-muted-foreground">
              {STEPS[currentStep - 1].description}
            </p>
          </div>
        </DialogHeader>

        {/* Step Content */}
        <div className="py-6">
          {currentStep === 1 && (
            <ProjectFormStep1
              data={formData}
              onChange={handleStepChange}
              onNext={handleNext}
            />
          )}
          {currentStep === 2 && (
            <ProjectFormStep2
              data={formData}
              onChange={handleStepChange}
              onNext={handleNext}
            />
          )}
          {currentStep === 3 && (
            <ProjectFormStep3
              data={formData}
              onChange={handleStepChange}
              onNext={handleNext}
            />
          )}
          {currentStep === 4 && (
            <ProjectFormStep4
              data={formData}
              onChange={handleStepChange}
              onSubmit={handleSubmit}
            />
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between border-t pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 1 || isSubmitting}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Anterior
          </Button>

          <div className="flex gap-2">
            {currentStep < STEPS.length ? (
              <Button type="button" onClick={handleNext} disabled={isSubmitting}>
                Siguiente
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button type="button" onClick={handleSubmit} disabled={isSubmitting}>
                <Save className="w-4 h-4 mr-2" />
                {isSubmitting ? 'Guardando...' : 'Crear Proyecto'}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
