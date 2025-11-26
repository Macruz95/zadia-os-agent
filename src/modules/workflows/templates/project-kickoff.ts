/**
 * ZADIA OS - Project Kickoff Workflow Template
 * Flujo cognitivo para inicio de proyectos
 */

import type { Workflow } from '../types/workflows.types';

export const projectKickoffTemplate: Omit<Workflow, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'createdBy'> = {
  name: 'Inicio de Proyecto',
  description: 'Flujo automatizado para kickoff de nuevos proyectos',
  template: 'project-kickoff',
  status: 'active',
  startStepId: 'step-1',
  steps: [
    {
      id: 'step-1',
      type: 'data-fetch',
      name: 'Obtener datos del proyecto',
      description: 'Recupera información del proyecto y cliente',
      order: 1,
      config: {
        collection: 'projects',
        field: 'projectId',
        include: ['client', 'quote']
      },
      nextStepId: 'step-2'
    },
    {
      id: 'step-2',
      type: 'ai-decision',
      name: 'Generar plan de proyecto',
      description: 'IA genera plan inicial basado en el alcance',
      order: 2,
      config: {
        model: 'qwen3-coder',
        prompt: 'Genera un plan de proyecto estructurado con fases, tareas y estimaciones'
      },
      nextStepId: 'step-3'
    },
    {
      id: 'step-3',
      type: 'action',
      name: 'Crear órdenes de trabajo',
      description: 'Crea work orders iniciales del proyecto',
      order: 3,
      config: {
        action: 'create-work-orders',
        fromPlan: true
      },
      nextStepId: 'step-4'
    },
    {
      id: 'step-4',
      type: 'action',
      name: 'Asignar equipo',
      description: 'Asigna equipo según disponibilidad y habilidades',
      order: 4,
      config: {
        action: 'assign-team',
        criteria: ['skills', 'availability']
      },
      nextStepId: 'step-5'
    },
    {
      id: 'step-5',
      type: 'notification',
      name: 'Notificar al equipo',
      description: 'Notifica al equipo asignado',
      order: 5,
      config: {
        recipients: ['assigned-team'],
        message: 'Nuevo proyecto asignado'
      },
      nextStepId: 'step-6'
    },
    {
      id: 'step-6',
      type: 'action',
      name: 'Agendar reunión de kickoff',
      description: 'Crea evento de reunión de inicio',
      order: 6,
      config: {
        action: 'create-event',
        eventType: 'meeting',
        title: 'Reunión de Kickoff',
        participants: ['team', 'client']
      },
      nextStepId: 'step-7'
    },
    {
      id: 'step-7',
      type: 'action',
      name: 'Reservar materiales',
      description: 'Reserva materiales necesarios del inventario',
      order: 7,
      config: {
        action: 'reserve-inventory',
        fromBOM: true
      }
    }
  ],
  config: {
    autoStart: true,
    retryOnFailure: true,
    maxRetries: 3,
    timeout: 300,
    notifications: {
      onStart: true,
      onComplete: true,
      onFailure: true
    }
  },
  triggers: [
    {
      type: 'event',
      enabled: true,
      config: {
        event: 'project.created',
        condition: 'status == active'
      }
    }
  ]
};

