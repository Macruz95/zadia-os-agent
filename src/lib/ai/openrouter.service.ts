/**
 * ZADIA OS - OpenRouter AI Service
 * 
 * Integration with OpenRouter API - Advanced Models (100% FREE)
 * Supports: DeepSeek R1, Qwen3-Coder, GLM-4.5, Gemini 2.5 Pro, and more
 * Rule #1: TypeScript strict mode
 * Rule #3: Real data, no mocks
 * Rule #4: Clean code with error handling
 */

import { logger } from '@/lib/logger';
import { getModelForUseCase, getModelById, type AIModelType } from './models.config';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || '';
const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';
const DEFAULT_MODEL = 'google/gemma-3-27b-it:free';

export interface AIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface AICompletionRequest {
  model?: string; // Modelo directo (ej: 'deepseek/deepseek-r1:free')
  modelId?: string; // ID del modelo (ej: 'deepseek-r1')
  modelType?: AIModelType; // Tipo de caso de uso (ej: 'reasoning')
  messages: AIMessage[];
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
  tools?: Array<{
    type: 'function';
    function: {
      name: string;
      description: string;
      parameters: Record<string, unknown>;
    };
  }>;
}

export interface AICompletionResponse {
  id: string;
  model: string;
  choices: Array<{
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export class OpenRouterService {
  /**
   * Send chat completion request to OpenRouter
   * Soporta modelos avanzados 100% gratis
   */
  static async chatCompletion(
    request: AICompletionRequest
  ): Promise<string> {
    try {
      // Seleccionar modelo: explícito > por ID > por tipo > default
      let selectedModel: string;
      let modelInfo: string | null = null;

      if (request.model) {
        selectedModel = request.model;
        modelInfo = `direct: ${request.model}`;
      } else if (request.modelId) {
        const modelConfig = getModelById(request.modelId);
        if (modelConfig) {
          selectedModel = modelConfig.model;
          modelInfo = `${modelConfig.name} (${request.modelId})`;
        } else {
          selectedModel = DEFAULT_MODEL;
          logger.warn(`[OpenRouter] Model ID '${request.modelId}' not found, using default`);
        }
      } else if (request.modelType) {
        const modelConfig = getModelForUseCase(request.modelType);
        selectedModel = modelConfig.model;
        modelInfo = `${modelConfig.name} for ${request.modelType}`;
      } else {
        selectedModel = DEFAULT_MODEL;
      }

      logger.info('Sending AI completion request', {
        component: 'OpenRouterService',
        metadata: {
          model: selectedModel,
          modelInfo,
          messageCount: request.messages.length,
          hasTools: !!request.tools?.length
        }
      });

      const requestBody: Record<string, unknown> = {
        model: selectedModel,
        messages: request.messages,
        temperature: request.temperature ?? 0.7,
        max_tokens: request.max_tokens ?? 2000,
        stream: false
      };

      // Agregar tools si están disponibles (para modelos con function calling)
      if (request.tools && request.tools.length > 0) {
        requestBody.tools = request.tools;
        requestBody.tool_choice = 'auto';
      }

      const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'https://zadia-os.vercel.app',
          'X-Title': 'ZADIA OS - Agentic Enterprise Platform',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OpenRouter API error: ${response.status} - ${errorText}`);
      }

      const data: AICompletionResponse = await response.json();

      if (!data.choices || data.choices.length === 0) {
        throw new Error('No completion choices returned from OpenRouter');
      }

      const completion = data.choices[0].message.content;

      logger.info('AI completion successful', {
        component: 'OpenRouterService',
        metadata: {
          tokensUsed: data.usage?.total_tokens || 0,
          responseLength: completion.length
        }
      });

      return completion;

    } catch (error) {
      logger.error('OpenRouter API error', error as Error, {
        component: 'OpenRouterService'
      });
      throw error;
    }
  }

  /**
   * Helper: Create a simple prompt and get response
   */
  static async ask(prompt: string, systemPrompt?: string): Promise<string> {
    const messages: AIMessage[] = [];

    if (systemPrompt) {
      messages.push({
        role: 'system',
        content: systemPrompt
      });
    }

    messages.push({
      role: 'user',
      content: prompt
    });

    return this.chatCompletion({ messages });
  }

  /**
   * Helper: Analyze data and get insights
   * Usa modelo de razonamiento para análisis profundo
   */
  static async analyzeData(
    data: Record<string, unknown>,
    analysisType: string
  ): Promise<string> {
    const systemPrompt = `Eres un analista de negocios experto de ZADIA OS. 
Tu trabajo es analizar datos empresariales y proporcionar insights accionables, concisos y en español.
Enfócate en identificar: tendencias, riesgos, oportunidades y recomendaciones estratégicas.
Usa razonamiento paso a paso para llegar a conclusiones sólidas.`;

    const userPrompt = `Analiza los siguientes datos de ${analysisType}:

${JSON.stringify(data, null, 2)}

Proporciona un análisis ejecutivo de máximo 3 puntos clave. Sé conciso y específico.`;

    return this.chatCompletion({ 
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      modelType: 'reasoning', // Usa DeepSeek R1 para razonamiento
      temperature: 0.3
    });
  }

  /**
   * Helper para Fase 4: Razonamiento profundo (Agenda Cognitiva, RICE-Z)
   * Usa DeepSeek R1
   */
  static async reason(
    prompt: string,
    systemPrompt?: string,
    context?: Record<string, unknown>
  ): Promise<string> {
    const messages: AIMessage[] = [];

    if (systemPrompt) {
      messages.push({ role: 'system', content: systemPrompt });
    }

    let userPrompt = prompt;
    if (context) {
      userPrompt = `${prompt}\n\nContexto:\n${JSON.stringify(context, null, 2)}`;
    }

    messages.push({ role: 'user', content: userPrompt });

    return this.chatCompletion({ 
      messages,
      modelType: 'reasoning', // DeepSeek R1
      temperature: 0.3,
      max_tokens: 4000
    });
  }

  /**
   * Helper para Fase 4: Agentes complejos (Flujos Cognitivos)
   * Usa Qwen3-Coder
   */
  static async agenticTask(
    task: string,
    systemPrompt?: string,
    tools?: AICompletionRequest['tools']
  ): Promise<string> {
    const messages: AIMessage[] = [];

    if (systemPrompt) {
      messages.push({ role: 'system', content: systemPrompt });
    }

    messages.push({ role: 'user', content: task });

    return this.chatCompletion({ 
      messages,
      modelType: 'agentic', // Qwen3-Coder
      tools,
      temperature: 0.7,
      max_tokens: 4000
    });
  }

  /**
   * Helper para tool-use nativo
   * Usa GLM-4.5 Thinking
   */
  static async toolUse(
    prompt: string,
    tools: AICompletionRequest['tools'],
    systemPrompt?: string
  ): Promise<string> {
    const messages: AIMessage[] = [];

    if (systemPrompt) {
      messages.push({ role: 'system', content: systemPrompt });
    }

    messages.push({ role: 'user', content: prompt });

    return this.chatCompletion({ 
      messages,
      modelType: 'tool-use', // GLM-4.5 Thinking
      tools,
      temperature: 0.7,
      max_tokens: 4000
    });
  }

  /**
   * Helper para contexto largo
   * Usa Gemini 2.5 Pro (1M tokens)
   */
  static async longContext(
    prompt: string,
    systemPrompt?: string,
    maxTokens?: number
  ): Promise<string> {
    const messages: AIMessage[] = [];

    if (systemPrompt) {
      messages.push({ role: 'system', content: systemPrompt });
    }

    messages.push({ role: 'user', content: prompt });

    return this.chatCompletion({ 
      messages,
      modelType: 'long-context', // Gemini 2.5 Pro
      temperature: 0.7,
      max_tokens: maxTokens || 8000
    });
  }
}
