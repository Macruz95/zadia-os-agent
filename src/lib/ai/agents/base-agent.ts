/**
 * ZADIA OS - Base Agent Interface
 * 
 * Abstract base class for all AI agents in the Agentic Layer
 * Rule #5: Keep focused on single responsibility
 */

import { logger } from '@/lib/logger';
import { OpenRouterService, AIMessage } from '../openrouter.service';

export interface AgentContext {
  userId?: string;
  organizationId?: string;
  metadata?: Record<string, unknown>;
}

export interface AgentExecutionResult {
  success: boolean;
  data?: unknown;
  insights?: string[];
  actions?: AgentAction[];
  error?: string;
}

export interface AgentAction {
  type: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  automated?: boolean;
  payload?: Record<string, unknown>;
}

/**
 * Base abstract class for all AI Agents
 */
export abstract class BaseAgent {
  protected name: string;
  protected systemPrompt: string;

  constructor(name: string, systemPrompt: string) {
    this.name = name;
    this.systemPrompt = systemPrompt;
  }

  /**
   * Main entry point - analyze data and return insights
   */
  abstract analyze(
    data: Record<string, unknown>,
    context?: AgentContext
  ): Promise<AgentExecutionResult>;

  /**
   * Execute autonomous actions based on analysis
   */
  async execute(
    data: Record<string, unknown>,
    context?: AgentContext
  ): Promise<AgentExecutionResult> {
    logger.info(`Agent ${this.name} executing`, {
      component: 'BaseAgent',
      metadata: { agent: this.name }
    });

    // First, analyze
    const analysisResult = await this.analyze(data, context);

    // Then, execute suggested actions if any
    if (analysisResult.actions && analysisResult.actions.length > 0) {
      logger.info(`Agent ${this.name} has ${analysisResult.actions.length} suggested actions`, {
        component: 'BaseAgent',
        metadata: { agent: this.name, actionCount: analysisResult.actions.length }
      });
    }

    return analysisResult;
  }

  /**
   * Helper: Send prompt to AI
   */
  protected async askAI(
    userPrompt: string,
    conversationHistory?: AIMessage[]
  ): Promise<string> {
    const messages: AIMessage[] = [
      {
        role: 'system',
        content: this.systemPrompt
      }
    ];

    if (conversationHistory) {
      messages.push(...conversationHistory);
    }

    messages.push({
      role: 'user',
      content: userPrompt
    });

    return OpenRouterService.chatCompletion({ messages });
  }

  /**
   * Helper: Parse AI response into structured insights
   */
  protected parseInsights(aiResponse: string): string[] {
    // Split by numbered points or bullet points
    const insights = aiResponse
      .split(/\n/)
      .map(line => line.trim())
      .filter(line => line.length > 10) // Minimum insight length
      .filter(line => /^[\d\-\*•]/.test(line)) // Starts with number, dash, or bullet
      .map(line => line.replace(/^[\d\-\*•]\s*/, '')); // Remove prefix

    return insights.length > 0 ? insights : [aiResponse];
  }

  /**
   * Helper: Extract actions from AI response
   */
  protected extractActions(aiResponse: string): AgentAction[] {
    const actions: AgentAction[] = [];
    
    // Look for action keywords
    const actionKeywords = [
      'recomienda',
      'deberías',
      'sugiero',
      'es necesario',
      'debe',
      'acción:'
    ];

    const lines = aiResponse.split('\n');
    
    for (const line of lines) {
      const lowerLine = line.toLowerCase();
      
      if (actionKeywords.some(keyword => lowerLine.includes(keyword))) {
        actions.push({
          type: 'recommendation',
          description: line.trim(),
          priority: this.detectPriority(lowerLine),
          automated: false
        });
      }
    }

    return actions;
  }

  /**
   * Helper: Detect priority from text
   */
  private detectPriority(text: string): 'low' | 'medium' | 'high' | 'critical' {
    if (/urgente|crítico|inmediato/i.test(text)) return 'critical';
    if (/importante|alto|prioridad/i.test(text)) return 'high';
    if (/medio|moderado/i.test(text)) return 'medium';
    return 'low';
  }
}
