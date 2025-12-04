/**
 * ZADIA OS - Agent Orchestrator
 * 
 * Orquesta agentes de IA especializados basado en eventos del sistema
 * Cada evento puede activar múltiples agentes para análisis y acción
 * 
 * Rule #1: TypeScript strict
 * Rule #5: Single responsibility
 */

import { EventBus, ZadiaEvent, ZadiaEventType } from './event-bus';
import { logger } from '@/lib/logger';
import { OpenRouterService } from '@/lib/ai/openrouter.service';

export interface AgentDefinition {
  id: string;
  name: string;
  description: string;
  model: string;
  triggerEvents: ZadiaEventType[];
  systemPrompt: string;
  enabled: boolean;
}

export interface AgentResponse {
  agentId: string;
  analysis: string;
  suggestedActions: Array<{
    type: string;
    description: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    autoExecute: boolean;
  }>;
  insights: string[];
}

/**
 * Agent Orchestrator - Cerebro del sistema A-OS
 */
class AgentOrchestratorClass {
  private static instance: AgentOrchestratorClass;
  private agents: AgentDefinition[] = [];
  private responseHistory: Array<{
    eventId: string;
    responses: AgentResponse[];
    timestamp: Date;
  }> = [];

  private constructor() {
    this.initializeAgents();
    this.subscribeToEvents();
    logger.info('🤖 Agent Orchestrator initialized', { component: 'AgentOrchestrator' });
  }

  static getInstance(): AgentOrchestratorClass {
    if (!AgentOrchestratorClass.instance) {
      AgentOrchestratorClass.instance = new AgentOrchestratorClass();
    }
    return AgentOrchestratorClass.instance;
  }

  /**
   * Initialize all specialized agents
   */
  private initializeAgents(): void {
    this.agents = [
      // ═══════════════════════════════════════════════════════════════════════
      // AGENTE DE VENTAS
      // ═══════════════════════════════════════════════════════════════════════
      {
        id: 'sales-agent',
        name: 'Agente de Ventas',
        description: 'Analiza oportunidades, leads y cotizaciones',
        model: 'deepseek/deepseek-r1:free',
        triggerEvents: [
          'lead:created', 'lead:updated', 'lead:converted',
          'opportunity:created', 'opportunity:updated', 'opportunity:won', 'opportunity:lost',
          'quote:created', 'quote:sent', 'quote:approved', 'quote:rejected'
        ],
        systemPrompt: `Eres el Agente de Ventas de ZADIA OS. Tu función es:
1. Analizar cada evento de ventas y su impacto en el pipeline
2. Identificar riesgos en oportunidades estancadas
3. Sugerir próximos pasos para cerrar ventas
4. Detectar patrones de conversión
Responde en JSON con: analysis, suggestedActions[], insights[]`,
        enabled: true
      },
      
      // ═══════════════════════════════════════════════════════════════════════
      // AGENTE FINANCIERO
      // ═══════════════════════════════════════════════════════════════════════
      {
        id: 'finance-agent',
        name: 'Agente Financiero',
        description: 'Monitorea cash flow, facturas y pagos',
        model: 'google/gemini-2.0-flash-exp:free',
        triggerEvents: [
          'invoice:created', 'invoice:sent', 'invoice:paid', 'invoice:overdue',
          'expense:created', 'expense:approved',
          'payment:received', 'payment:pending'
        ],
        systemPrompt: `Eres el CFO Virtual de ZADIA OS. Tu función es:
1. Analizar impacto de cada transacción en el flujo de caja
2. Alertar sobre facturas vencidas y riesgos de liquidez
3. Optimizar timing de cobros y pagos
4. Proyectar cash flow
Responde en JSON con: analysis, suggestedActions[], insights[]`,
        enabled: true
      },
      
      // ═══════════════════════════════════════════════════════════════════════
      // AGENTE DE INVENTARIO
      // ═══════════════════════════════════════════════════════════════════════
      {
        id: 'inventory-agent',
        name: 'Agente de Inventario',
        description: 'Optimiza stock y predice necesidades',
        model: 'kwaipilot/kat-coder-pro:free',
        triggerEvents: [
          'product:created', 'product:updated', 'product:low_stock',
          'movement:in', 'movement:out', 'movement:transfer'
        ],
        systemPrompt: `Eres el Agente de Inventario de ZADIA OS. Tu función es:
1. Monitorear niveles de stock en tiempo real
2. Predecir necesidades de reabastecimiento
3. Optimizar rotación de inventario
4. Alertar sobre productos de lento movimiento
Responde en JSON con: analysis, suggestedActions[], insights[]`,
        enabled: true
      },
      
      // ═══════════════════════════════════════════════════════════════════════
      // AGENTE DE PROYECTOS
      // ═══════════════════════════════════════════════════════════════════════
      {
        id: 'project-agent',
        name: 'Agente de Proyectos',
        description: 'Monitorea salud de proyectos y tareas',
        model: 'deepseek/deepseek-r1:free',
        triggerEvents: [
          'project:created', 'project:updated', 'project:started', 'project:paused',
          'project:completed', 'project:cancelled', 'project:delayed', 'project:budget_overrun',
          'project:progress_updated', 'project:task_added', 'project:task_completed',
          'project:milestone_added', 'project:milestone_completed',
          'task:created', 'task:completed', 'task:overdue'
        ],
        systemPrompt: `Eres el PM Virtual de ZADIA OS. Tu función es:
1. Evaluar salud de proyectos en cada actualización
2. Detectar riesgos de retraso tempranamente
3. Monitorear presupuesto y alertar sobre sobrecostos
4. Optimizar asignación de recursos
5. Sugerir ajustes de cronograma
Responde en JSON con: analysis, suggestedActions[], insights[]`,
        enabled: true
      },
      
      // ═══════════════════════════════════════════════════════════════════════
      // AGENTE DE CLIENTES
      // ═══════════════════════════════════════════════════════════════════════
      {
        id: 'client-agent',
        name: 'Agente de Clientes',
        description: 'Analiza relaciones y satisfacción',
        model: 'google/gemini-2.0-flash-exp:free',
        triggerEvents: [
          'client:created', 'client:updated', 'client:activated', 'client:deactivated',
          'client:interaction', 'client:vip_marked', 'client:segment_changed', 'client:flagged',
          'invoice:paid', 'invoice:overdue',
          'project:completed', 'order:delivered'
        ],
        systemPrompt: `Eres el Agente de Éxito del Cliente de ZADIA OS. Tu función es:
1. Evaluar salud de la relación con cada cliente
2. Identificar clientes en riesgo de churn
3. Detectar oportunidades de upsell/cross-sell
4. Medir satisfacción implícita por interacciones
5. Priorizar clientes VIP
Responde en JSON con: analysis, suggestedActions[], insights[]`,
        enabled: true
      },
      
      // ═══════════════════════════════════════════════════════════════════════
      // AGENTE DE PEDIDOS
      // ═══════════════════════════════════════════════════════════════════════
      {
        id: 'orders-agent',
        name: 'Agente de Pedidos',
        description: 'Monitorea flujo de pedidos y entregas',
        model: 'meituan/longcat-flash-chat:free',
        triggerEvents: [
          'order:created', 'order:confirmed', 'order:production_started',
          'order:ready', 'order:delivered', 'order:cancelled',
          'order:priority_changed', 'order:delivery_date_changed',
          'order:note_added', 'order:issue_reported'
        ],
        systemPrompt: `Eres el Agente de Operaciones de ZADIA OS. Tu función es:
1. Monitorear el flujo de pedidos en tiempo real
2. Detectar cuellos de botella en producción
3. Alertar sobre pedidos urgentes o atrasados
4. Optimizar secuencia de producción
5. Coordinar entregas y notificar clientes
Responde en JSON con: analysis, suggestedActions[], insights[]`,
        enabled: true
      },
      
      // ═══════════════════════════════════════════════════════════════════════
      // AGENTE DE RRHH
      // ═══════════════════════════════════════════════════════════════════════
      {
        id: 'hr-agent',
        name: 'Agente de RRHH',
        description: 'Gestiona talento y bienestar',
        model: 'amazon/nova-2-lite-v1:free',
        triggerEvents: [
          'employee:created', 'employee:updated', 'employee:promoted', 'employee:transferred',
          'employee:timeoff_requested', 'employee:timeoff_approved', 'employee:timeoff_rejected',
          'employee:performance_reviewed', 'employee:terminated',
          'employee:onboarding_started', 'employee:onboarding_completed'
        ],
        systemPrompt: `Eres el Agente de Recursos Humanos de ZADIA OS. Tu función es:
1. Monitorear bienestar y satisfacción del equipo
2. Optimizar procesos de onboarding
3. Detectar riesgos de rotación
4. Analizar patrones de ausencias
5. Sugerir desarrollo de carrera
Responde en JSON con: analysis, suggestedActions[], insights[]`,
        enabled: true
      },
      
      // ═══════════════════════════════════════════════════════════════════════
      // AGENTE DE CALENDARIO
      // ═══════════════════════════════════════════════════════════════════════
      {
        id: 'calendar-agent',
        name: 'Agente de Calendario',
        description: 'Optimiza agenda y evita conflictos',
        model: 'alibaba/tongyi-deepresearch-30b-a3b:free',
        triggerEvents: [
          'calendar:event_created', 'calendar:event_updated', 'calendar:event_cancelled',
          'calendar:event_rescheduled', 'calendar:attendance_confirmed', 'calendar:event_completed',
          'calendar:reminder_created', 'calendar:deadline_created',
          'calendar:client_meeting_scheduled', 'calendar:conflict_detected'
        ],
        systemPrompt: `Eres el Agente de Calendario de ZADIA OS. Tu función es:
1. Detectar y resolver conflictos de agenda
2. Optimizar distribución de reuniones
3. Alertar sobre deadlines próximos
4. Sugerir mejores horarios para reuniones
5. Proteger tiempo de trabajo profundo
Responde en JSON con: analysis, suggestedActions[], insights[]`,
        enabled: true
      },
      
      // ═══════════════════════════════════════════════════════════════════════
      // AGENTE ESTRATÉGICO (SUPERVISA TODO)
      // ═══════════════════════════════════════════════════════════════════════
      {
        id: 'strategic-agent',
        name: 'Agente Estratégico',
        description: 'Visión holística del negocio',
        model: 'allenai/olmo-3-32b-think:free',
        triggerEvents: [
          // Eventos críticos de alto impacto
          'opportunity:won', 'opportunity:lost',
          'project:completed', 'project:delayed', 'project:budget_overrun',
          'invoice:overdue',
          'client:flagged', 'client:vip_marked',
          'employee:terminated',
          'order:issue_reported'
        ],
        systemPrompt: `Eres el CEO Virtual de ZADIA OS. Tu función es:
1. Tener visión holística de todas las operaciones
2. Identificar patrones cross-funcionales
3. Detectar riesgos sistémicos
4. Proponer optimizaciones estratégicas
5. Alertar sobre eventos de alto impacto
Responde en JSON con: analysis, suggestedActions[], insights[]`,
        enabled: true
      }
    ];
  }

  /**
   * Subscribe to all events
   */
  private subscribeToEvents(): void {
    EventBus.subscribe('*', async (event) => {
      await this.processEvent(event);
    }, 50); // Medium priority (after propagation)
  }

  /**
   * Process event and activate relevant agents
   */
  private async processEvent(event: ZadiaEvent): Promise<void> {
    const relevantAgents = this.agents.filter(
      agent => agent.enabled && agent.triggerEvents.includes(event.type)
    );

    if (relevantAgents.length === 0) return;

    logger.info(`🤖 Activating ${relevantAgents.length} agents for ${event.type}`, {
      component: 'AgentOrchestrator',
      metadata: { agents: relevantAgents.map(a => a.id) }
    });

    const responses: AgentResponse[] = [];

    for (const agent of relevantAgents) {
      try {
        const response = await this.runAgent(agent, event);
        if (response) {
          responses.push(response);
        }
      } catch (error) {
        logger.error(
          `Agent ${agent.id} failed`,
          error instanceof Error ? error : new Error(String(error)),
          { component: 'AgentOrchestrator' }
        );
      }
    }

    if (responses.length > 0) {
      this.responseHistory.unshift({
        eventId: event.id,
        responses,
        timestamp: new Date()
      });

      // Keep history limited
      if (this.responseHistory.length > 50) {
        this.responseHistory = this.responseHistory.slice(0, 50);
      }
    }
  }

  /**
   * Run individual agent
   */
  private async runAgent(
    agent: AgentDefinition,
    event: ZadiaEvent
  ): Promise<AgentResponse | null> {
    const prompt = `Evento: ${event.type}
Datos: ${JSON.stringify(event.data, null, 2)}
Timestamp: ${event.timestamp}
Source: ${event.source}

Analiza este evento y responde con tu evaluación.`;

    try {
      const aiResponse = await OpenRouterService.chatCompletion({
        model: agent.model,
        messages: [
          { role: 'system', content: agent.systemPrompt },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3
      });

      // Try to parse JSON response
      try {
        const parsed = JSON.parse(aiResponse);
        return {
          agentId: agent.id,
          analysis: parsed.analysis || aiResponse,
          suggestedActions: parsed.suggestedActions || [],
          insights: parsed.insights || []
        };
      } catch {
        // If not JSON, return raw analysis
        return {
          agentId: agent.id,
          analysis: aiResponse,
          suggestedActions: [],
          insights: []
        };
      }
    } catch (error) {
      logger.error(
        `AI call failed for agent ${agent.id}`,
        error instanceof Error ? error : new Error(String(error)),
        { component: 'AgentOrchestrator' }
      );
      return null;
    }
  }

  // ============ PUBLIC API ============

  getAgents(): AgentDefinition[] {
    return this.agents;
  }

  getRecentResponses(limit = 20) {
    return this.responseHistory.slice(0, limit);
  }

  enableAgent(agentId: string): void {
    const agent = this.agents.find(a => a.id === agentId);
    if (agent) agent.enabled = true;
  }

  disableAgent(agentId: string): void {
    const agent = this.agents.find(a => a.id === agentId);
    if (agent) agent.enabled = false;
  }
}

export const AgentOrchestrator = AgentOrchestratorClass.getInstance();
