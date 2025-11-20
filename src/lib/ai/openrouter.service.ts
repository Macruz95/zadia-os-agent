/**
 * ZADIA OS - OpenRouter AI Service
 * 
 * Integration with OpenRouter API for Gemma 3 (free)
 * Rule #1: TypeScript strict mode
 * Rule #3: Real data, no mocks
 * Rule #4: Clean code with error handling
 */

import { logger } from '@/lib/logger';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || '';
const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';
const DEFAULT_MODEL = 'google/gemma-3-27b-it:free';

export interface AIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface AICompletionRequest {
  model?: string;
  messages: AIMessage[];
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
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
   */
  static async chatCompletion(
    request: AICompletionRequest
  ): Promise<string> {
    try {
      logger.info('Sending AI completion request', {
        component: 'OpenRouterService',
        metadata: {
          model: request.model || DEFAULT_MODEL,
          messageCount: request.messages.length
        }
      });

      const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'https://zadia-os.vercel.app',
          'X-Title': 'ZADIA OS - Agentic Enterprise Platform',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: request.model || DEFAULT_MODEL,
          messages: request.messages,
          temperature: request.temperature ?? 0.7,
          max_tokens: request.max_tokens ?? 1000,
          stream: false
        })
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
   */
  static async analyzeData(
    data: Record<string, unknown>,
    analysisType: string
  ): Promise<string> {
    const systemPrompt = `Eres un analista de negocios experto de ZADIA OS. 
Tu trabajo es analizar datos empresariales y proporcionar insights accionables, concisos y en español.
Enfócate en identificar: tendencias, riesgos, oportunidades y recomendaciones estratégicas.`;

    const userPrompt = `Analiza los siguientes datos de ${analysisType}:

${JSON.stringify(data, null, 2)}

Proporciona un análisis ejecutivo de máximo 3 puntos clave. Sé conciso y específico.`;

    return this.ask(userPrompt, systemPrompt);
  }
}
