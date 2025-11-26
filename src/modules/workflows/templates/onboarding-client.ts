/**
 * ZADIA OS - Onboarding Client Workflow Template
 * Flujo cognitivo para onboarding de nuevos clientes
 */

import type { Workflow } from '../types/workflows.types';

export const onboardingClientTemplate: Omit<Workflow, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'createdBy'> = {
  name: 'Onboarding de Cliente',
  description: 'Flujo automatizado para onboarding de nuevos clientes',
  template: 'onboarding-client',
  status: 'active',
  startStepId: 'step-1',
  steps: [
    {
      id: 'step-1',
      type: 'data-fetch',
      name: 'Obtener datos del cliente',
      description: 'Recupera información completa del cliente',
      order: 1,
      config: {
        collection: 'clients',
        field: 'clientId'
      },
      nextStepId: 'step-2'
    },
    {
      id: 'step-2',
      type: 'ai-decision',
      name: 'Análisis de perfil',
      description: 'IA analiza el perfil del cliente para personalizar el onboarding',
      order: 2,
      config: {
        model: 'deepseek-r1',
        prompt: 'Analiza el perfil del cliente y sugiere pasos personalizados de onboarding'
      },
      nextStepId: 'step-3'
    },
    {
      id: 'step-3',
      type: 'action',
      name: 'Crear tareas iniciales',
      description: 'Crea tareas automáticas para el equipo',
      order: 3,
      config: {
        action: 'create-tasks',
        tasks: [
          { title: 'Enviar bienvenida', priority: 'high' },
          { title: 'Programar reunión inicial', priority: 'medium' },
          { title: 'Configurar acceso al portal', priority: 'low' }
        ]
      },
      nextStepId: 'step-4'
    },
    {
      id: 'step-4',
      type: 'notification',
      name: 'Notificar al equipo',
      description: 'Envía notificaciones al equipo de ventas',
      order: 4,
      config: {
        recipients: ['sales-team'],
        message: 'Nuevo cliente requiere onboarding'
      },
      nextStepId: 'step-5'
    },
    {
      id: 'step-5',
      type: 'action',
      name: 'Agendar seguimiento',
      description: 'Crea evento de seguimiento en 7 días',
      order: 5,
      config: {
        action: 'create-event',
        eventType: 'follow-up',
        daysOffset: 7
      }
    }
  ],
  config: {
    autoStart: true,
    retryOnFailure: true,
    maxRetries: 3,
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
        event: 'client.created',
        condition: 'new'
      }
    }
  ]
};

