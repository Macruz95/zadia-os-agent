/**
 * ZADIA OS - Invoice Reminder Workflow Template
 * Flujo cognitivo para recordatorios de facturas pendientes
 */

import type { Workflow } from '../types/workflows.types';

export const invoiceReminderTemplate: Omit<Workflow, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'createdBy'> = {
  name: 'Recordatorio de Facturas',
  description: 'Flujo automatizado para recordar facturas pendientes',
  template: 'invoice-reminder',
  status: 'active',
  startStepId: 'step-1',
  steps: [
    {
      id: 'step-1',
      type: 'data-fetch',
      name: 'Buscar facturas vencidas',
      description: 'Obtiene facturas con más de 30 días de vencimiento',
      order: 1,
      config: {
        collection: 'invoices',
        query: {
          status: 'pending',
          daysOverdue: { $gte: 30 }
        }
      },
      nextStepId: 'step-2'
    },
    {
      id: 'step-2',
      type: 'condition',
      name: 'Verificar facturas',
      description: 'Verifica si hay facturas pendientes',
      order: 2,
      config: {},
      conditions: [
        {
          field: 'invoices.length',
          operator: 'greater-than',
          value: 0
        }
      ],
      onSuccessStepId: 'step-3',
      onFailureStepId: 'step-end'
    },
    {
      id: 'step-3',
      type: 'ai-decision',
      name: 'Generar recordatorio personalizado',
      description: 'IA genera mensaje personalizado según historial del cliente',
      order: 3,
      config: {
        model: 'deepseek-r1',
        prompt: 'Genera un recordatorio profesional y personalizado para el cliente sobre su factura pendiente'
      },
      nextStepId: 'step-4'
    },
    {
      id: 'step-4',
      type: 'notification',
      name: 'Enviar recordatorio',
      description: 'Envía recordatorio al cliente',
      order: 4,
      config: {
        recipients: ['client'],
        channel: 'email',
        template: 'invoice-reminder'
      },
      nextStepId: 'step-5'
    },
    {
      id: 'step-5',
      type: 'action',
      name: 'Registrar intento',
      description: 'Registra el intento de cobro',
      order: 5,
      config: {
        action: 'log-payment-attempt',
        type: 'reminder'
      },
      nextStepId: 'step-6'
    },
    {
      id: 'step-6',
      type: 'delay',
      name: 'Esperar 7 días',
      description: 'Espera 7 días antes del siguiente recordatorio',
      order: 6,
      config: {
        duration: 7,
        unit: 'days'
      },
      nextStepId: 'step-1' // Loop back
    },
    {
      id: 'step-end',
      type: 'action',
      name: 'Finalizar',
      description: 'No hay facturas pendientes',
      order: 99,
      config: {
        action: 'complete'
      }
    }
  ],
  config: {
    autoStart: false,
    retryOnFailure: true,
    maxRetries: 2,
    notifications: {
      onStart: false,
      onComplete: true,
      onFailure: true
    }
  },
  triggers: [
    {
      type: 'scheduled',
      enabled: true,
      config: {
        schedule: 'daily',
        time: '09:00'
      }
    }
  ]
};

