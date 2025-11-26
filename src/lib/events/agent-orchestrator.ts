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
      {
        id: 'finance-agent',
        name: 'Agente Financiero',
        description: 'Monitorea cash flow, facturas y pagos',
        model: 'google/gemini-2.5-pro-exp-03-25:free',
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
      {
        id: 'inventory-agent',
        name: 'Agente de Inventario',
        description: 'Optimiza stock y predice necesidades',
        model: 'qwen/qwen3-coder:free',
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
      {
        id: 'project-agent',
        name: 'Agente de Proyectos',
        description: 'Monitorea salud de proyectos y tareas',
        model: 'deepseek/deepseek-r1:free',
        triggerEvents: [
          'project:created', 'project:started', 'project:completed', 'project:delayed',
          'task:created', 'task:completed', 'task:overdue'
        ],
        systemPrompt: `Eres el PM Virtual de ZADIA OS. Tu función es:
1. Evaluar salud de proyectos en cada actualización
2. Detectar riesgos de retraso tempranamente
3. Optimizar asignación de recursos
4. Sugerir ajustes de cronograma
Responde en JSON con: analysis, suggestedActions[], insights[]`,
        enabled: true
      },
      {
        id: 'client-agent',
        name: 'Agente de Clientes',
        description: 'Analiza relaciones y satisfacción',
        model: 'google/gemini-2.5-pro-exp-03-25:free',
        triggerEvents: [
          'client:created', 'client:updated',
          'invoice:paid', 'invoice:overdue',
          'project:completed'
        ],
        systemPrompt: `Eres el Agente de Éxito del Cliente de ZADIA OS. Tu función es:
1. Evaluar salud de la relación con cada cliente
2. Identificar clientes en riesgo de churn
3. Detectar oportunidades de upsell/cross-sell
4. Medir satisfacción implícita
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
        logger.error(`Agent ${agent.id} failed`, {
          component: 'AgentOrchestrator',
          error: error instanceof Error ? error : new Error(String(error))
        });
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
      logger.error(`AI call failed for agent ${agent.id}`, {
        component: 'AgentOrchestrator',
        error: error instanceof Error ? error : new Error(String(error))
      });
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
