/**
 * ZADIA OS - AI Assistant API Route
 * 
 * Server-side API with multi-provider support:
 * - OpenRouter (DeepSeek R1, Qwen3-Coder, GLM-4.5, Gemini) - FREE
 * - Groq (Llama, Mixtral) - FAST
 * - Google AI Studio (Gemini) - FREE
 * Rule #1: Real API calls (server-side only)
 */

import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { getModelForUseCase, getModelById, type AIModelType } from '@/lib/ai/models.config';

// Provider configurations
const PROVIDERS = {
  openrouter: {
    url: 'https://openrouter.ai/api/v1/chat/completions',
    keyEnv: 'OPENROUTER_API_KEY',
    defaultModel: 'google/gemini-2.5-flash-preview-05-20:free',
  },
  groq: {
    url: 'https://api.groq.com/openai/v1/chat/completions',
    keyEnv: 'GROQ_API_KEY',
    defaultModel: 'llama-3.3-70b-versatile',
  },
  google: {
    url: 'https://generativelanguage.googleapis.com/v1beta/models',
    keyEnv: 'GOOGLE_AI_API_KEY',
    defaultModel: 'gemini-2.0-flash',
  }
};

type Provider = keyof typeof PROVIDERS;

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface OpenRouterResponse {
  id: string;
  model: string;
  choices: Array<{
    message: { role: string; content: string; };
    finish_reason: string;
  }>;
  usage?: { prompt_tokens: number; completion_tokens: number; total_tokens: number; };
}

async function callOpenRouter(messages: ChatMessage[], model: string, temperature: number, apiKey: string) {
  const response = await fetch(PROVIDERS.openrouter.url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'HTTP-Referer': 'https://zadia-os.com',
      'X-Title': 'Zadia OS - Business Intelligence',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ model, messages, temperature, max_tokens: 4000 }),
  });
  if (!response.ok) throw new Error(`OpenRouter: ${response.status}`);
  const data: OpenRouterResponse = await response.json();
  return { content: data.choices[0]?.message?.content || '', model: data.model, tokens: data.usage?.total_tokens };
}

async function callGroq(messages: ChatMessage[], model: string, temperature: number, apiKey: string) {
  const response = await fetch(PROVIDERS.groq.url, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model, messages, temperature, max_tokens: 4000 }),
  });
  if (!response.ok) throw new Error(`Groq: ${response.status}`);
  const data: OpenRouterResponse = await response.json();
  return { content: data.choices[0]?.message?.content || '', model: data.model, tokens: data.usage?.total_tokens };
}

async function callGoogleAI(messages: ChatMessage[], model: string, apiKey: string) {
  // Convert chat format to Google AI format
  const contents = messages.filter(m => m.role !== 'system').map(m => ({
    role: m.role === 'user' ? 'user' : 'model',
    parts: [{ text: m.content }]
  }));
  const systemInstruction = messages.find(m => m.role === 'system')?.content;
  
  const url = `${PROVIDERS.google.url}/${model}:generateContent?key=${apiKey}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents,
      systemInstruction: systemInstruction ? { parts: [{ text: systemInstruction }] } : undefined,
      generationConfig: { temperature: 0.7, maxOutputTokens: 4000 }
    }),
  });
  if (!response.ok) throw new Error(`Google AI: ${response.status}`);
  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  return { content: text, model, tokens: data.usageMetadata?.totalTokenCount };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages, temperature = 0.7, model, modelId, modelType, provider: requestedProvider } = body as { 
      messages: ChatMessage[]; temperature?: number; model?: string;
      modelId?: string; modelType?: AIModelType; provider?: Provider;
    };

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Messages array is required' }, { status: 400 });
    }

    // Determine provider and model
    const provider: Provider = requestedProvider || 'openrouter';
    let selectedModel: string;
    let modelInfo: string | null = null;

    if (model) {
      selectedModel = model;
      modelInfo = `direct: ${model}`;
    } else if (modelId) {
      const modelConfig = getModelById(modelId);
      if (modelConfig) {
        selectedModel = modelConfig.model;
        modelInfo = `${modelConfig.name} (${modelId})`;
      } else {
        selectedModel = PROVIDERS[provider].defaultModel;
      }
    } else if (modelType) {
      const modelConfig = getModelForUseCase(modelType);
      selectedModel = modelConfig.model;
      modelInfo = `${modelConfig.name} for ${modelType}`;
    } else {
      selectedModel = PROVIDERS[provider].defaultModel;
    }

    // Try providers with fallback
    const providersToTry: Provider[] = [provider];
    if (provider !== 'openrouter') providersToTry.push('openrouter');
    if (provider !== 'groq') providersToTry.push('groq');

    let lastError: Error | null = null;
    for (const tryProvider of providersToTry) {
      const apiKey = process.env[PROVIDERS[tryProvider].keyEnv];
      if (!apiKey) continue;

      try {
        logger.info(`[AI API] Trying ${tryProvider} with model ${selectedModel}`, {
          component: 'AI-API', metadata: { provider: tryProvider, model: selectedModel }
        });

        let result;
        if (tryProvider === 'openrouter') {
          result = await callOpenRouter(messages, selectedModel, temperature, apiKey);
        } else if (tryProvider === 'groq') {
          result = await callGroq(messages, PROVIDERS.groq.defaultModel, temperature, apiKey);
        } else if (tryProvider === 'google') {
          result = await callGoogleAI(messages, PROVIDERS.google.defaultModel, apiKey);
        }

        if (result?.content) {
          return NextResponse.json({
            content: result.content,
            model: selectedModel,
            modelUsed: result.model || selectedModel,
            provider: tryProvider,
            modelInfo,
            tokensUsed: result.tokens || 0,
          });
        }
      } catch (err) {
        lastError = err as Error;
        logger.warn(`[AI API] ${tryProvider} failed, trying next...`, {
          component: 'AI-API', metadata: { error: (err as Error).message }
        });
      }
    }

    throw lastError || new Error('All AI providers failed');
  } catch (error) {
    logger.error('[AI API] Error', error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal error' }, { status: 500 });
  }
}
