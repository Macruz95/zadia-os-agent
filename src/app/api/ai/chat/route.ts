/**
 * ZADIA OS - AI Chat API Route v2
 * 
 * Intelligent multi-provider AI API with:
 * - Automatic model selection based on task type
 * - Manual model override option
 * - Reasoning tokens support (Grok 4.1)
 * - Provider fallback with circuit breaking
 * - Learning integration
 * 
 * Default: Grok 4.1 Fast (free on OpenRouter)
 */

import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { AIRouter, type AIRouterConfig, type ModelSelection, type TaskType, type AIProvider } from '@/lib/ai/ai-router';

// ═══════════════════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

const PROVIDERS = {
  openrouter: {
    url: 'https://openrouter.ai/api/v1/chat/completions',
    keyEnv: 'OPENROUTER_API_KEY',
  },
  groq: {
    url: 'https://api.groq.com/openai/v1/chat/completions',
    keyEnv: 'GROQ_API_KEY',
  },
  google: {
    url: 'https://generativelanguage.googleapis.com/v1beta/models',
    keyEnv: 'GOOGLE_AI_API_KEY',
  },
  huggingface: {
    url: 'https://api-inference.huggingface.co/models',
    keyEnv: 'HUGGINGFACE_API_KEY',
  }
} as const;

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  reasoning_content?: string; // For Grok reasoning tokens
}

interface ChatRequest {
  messages: ChatMessage[];
  temperature?: number;
  maxTokens?: number;
  // Model selection
  mode?: ModelSelection;           // 'auto' | 'manual'
  model?: string;                  // For manual mode: full model path
  modelId?: string;               // For manual mode: model ID from registry
  provider?: AIProvider;          // Force specific provider
  // Task hints for auto mode
  taskType?: TaskType;            // Explicit task type hint
  hasImages?: boolean;            // Message contains images
  requiresWebSearch?: boolean;    // Needs current information
  requiresReasoning?: boolean;    // Needs step-by-step thinking
  // Reasoning
  reasoningEffort?: 'low' | 'medium' | 'high';
}

interface OpenRouterResponse {
  id: string;
  model: string;
  choices: Array<{
    message: { 
      role: string; 
      content: string;
      reasoning_content?: string;
    };
    finish_reason: string;
    reasoning_details?: string;
  }>;
  usage?: { 
    prompt_tokens: number; 
    completion_tokens: number; 
    total_tokens: number;
    reasoning_tokens?: number;
  };
}

interface AICallResult {
  content: string;
  model: string;
  tokens: number;
  reasoning?: string;
  provider: AIProvider;
}

// ═══════════════════════════════════════════════════════════════════════════
// PROVIDER CALLERS
// ═══════════════════════════════════════════════════════════════════════════

async function callOpenRouter(
  messages: ChatMessage[], 
  model: string, 
  temperature: number,
  maxTokens: number,
  apiKey: string,
  reasoningEffort?: 'low' | 'medium' | 'high'
): Promise<AICallResult> {
  const requestBody: Record<string, unknown> = {
    model,
    messages: messages.map(m => ({
      role: m.role,
      content: m.content,
      ...(m.reasoning_content ? { reasoning_content: m.reasoning_content } : {}),
    })),
    temperature,
    max_tokens: maxTokens,
  };

  // Add reasoning parameter for Grok 4.1 and other reasoning models
  if (reasoningEffort && (model.includes('grok') || model.includes('deepseek-r1'))) {
    requestBody.reasoning = { effort: reasoningEffort };
  }

  const response = await fetch(PROVIDERS.openrouter.url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'https://zadia-os.vercel.app',
      'X-Title': 'ZADIA OS - Agentic Business Platform',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenRouter ${response.status}: ${errorText}`);
  }
  
  const data: OpenRouterResponse = await response.json();
  const choice = data.choices[0];
  
  return { 
    content: choice?.message?.content || '', 
    model: data.model,
    tokens: data.usage?.total_tokens || 0,
    reasoning: choice?.reasoning_details || choice?.message?.reasoning_content,
    provider: 'openrouter',
  };
}

async function callGroq(
  messages: ChatMessage[], 
  model: string, 
  temperature: number,
  maxTokens: number,
  apiKey: string
): Promise<AICallResult> {
  const response = await fetch(PROVIDERS.groq.url, {
    method: 'POST',
    headers: { 
      'Authorization': `Bearer ${apiKey}`, 
      'Content-Type': 'application/json' 
    },
    body: JSON.stringify({ 
      model, 
      messages: messages.map(m => ({ role: m.role, content: m.content })),
      temperature, 
      max_tokens: maxTokens 
    }),
  });
  
  if (!response.ok) {
    throw new Error(`Groq ${response.status}`);
  }
  
  const data: OpenRouterResponse = await response.json();
  return { 
    content: data.choices[0]?.message?.content || '', 
    model: data.model,
    tokens: data.usage?.total_tokens || 0,
    provider: 'groq',
  };
}

async function callGoogleAI(
  messages: ChatMessage[], 
  model: string, 
  temperature: number,
  maxTokens: number,
  apiKey: string
): Promise<AICallResult> {
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
      generationConfig: { temperature, maxOutputTokens: maxTokens }
    }),
  });
  
  if (!response.ok) {
    throw new Error(`Google AI ${response.status}`);
  }
  
  const data = await response.json();
  return { 
    content: data.candidates?.[0]?.content?.parts?.[0]?.text || '',
    model,
    tokens: data.usageMetadata?.totalTokenCount || 0,
    provider: 'google',
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN HANDLER
// ═══════════════════════════════════════════════════════════════════════════

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const body: ChatRequest = await request.json();
    const { 
      messages, 
      temperature = 0.7, 
      maxTokens = 4000,
      mode = 'auto',
      model: manualModel,
      modelId,
      provider: preferredProvider,
      taskType,
      hasImages,
      requiresWebSearch,
      requiresReasoning,
      reasoningEffort = 'medium',
    } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'Messages array is required' }, { status: 400 });
    }

    // Get the last user message for task analysis
    const lastUserMessage = messages.filter(m => m.role === 'user').pop()?.content || '';

    // Build router config
    const routerConfig: AIRouterConfig = {
      mode,
      preferredModel: manualModel || modelId,
      preferredProvider,
      hasImages,
      requiresWebSearch,
      requiresReasoning: requiresReasoning || taskType === 'reasoning',
    };

    // Select model using AI Router
    const routing = AIRouter.selectModel(lastUserMessage, routerConfig);
    
    logger.info('AI Router decision', {
      component: 'AI-API',
      metadata: {
        mode,
        selectedModel: routing.modelId,
        reason: routing.reason,
        provider: routing.provider,
        fallbacks: routing.fallbacks,
      }
    });

    // Try selected model, then fallbacks
    const modelsToTry = [
      { model: routing.model, provider: routing.provider, modelId: routing.modelId },
      ...routing.fallbacks.map(id => {
        const m = AIRouter.getModelById(id);
        return m ? { model: m.model, provider: m.provider, modelId: m.id } : null;
      }).filter(Boolean) as { model: string; provider: AIProvider; modelId: string }[],
    ];

    let lastError: Error | null = null;
    let result: AICallResult | null = null;

    for (const attempt of modelsToTry) {
      const apiKey = process.env[PROVIDERS[attempt.provider].keyEnv];
      if (!apiKey) {
        logger.warn(`No API key for ${attempt.provider}`, { component: 'AI-API' });
        continue;
      }

      try {
        logger.info(`Trying ${attempt.provider}/${attempt.modelId}`, {
          component: 'AI-API',
        });

        switch (attempt.provider) {
          case 'openrouter':
            result = await callOpenRouter(messages, attempt.model, temperature, maxTokens, apiKey, reasoningEffort);
            break;
          case 'groq':
            result = await callGroq(messages, attempt.model, temperature, maxTokens, apiKey);
            break;
          case 'google':
            result = await callGoogleAI(messages, attempt.model, temperature, maxTokens, apiKey);
            break;
          default:
            continue;
        }

        if (result?.content) {
          AIRouter.markProviderHealthy(attempt.provider);
          break;
        }
      } catch (err) {
        lastError = err as Error;
        AIRouter.markProviderUnhealthy(attempt.provider);
        logger.warn(`${attempt.provider} failed: ${(err as Error).message}`, {
          component: 'AI-API',
        });
      }
    }

    if (!result?.content) {
      throw lastError || new Error('All AI providers failed');
    }

    const latency = Date.now() - startTime;

    logger.info('AI request completed', {
      component: 'AI-API',
      metadata: {
        model: result.model,
        provider: result.provider,
        tokens: result.tokens,
        latencyMs: latency,
        hasReasoning: !!result.reasoning,
      }
    });

    return NextResponse.json({
      content: result.content,
      // Model info
      model: routing.model,
      modelId: routing.modelId,
      modelName: routing.modelName,
      modelUsed: result.model,
      provider: result.provider,
      // Routing info
      routingReason: routing.reason,
      routingMode: mode,
      capabilities: routing.capabilities,
      // Usage
      tokensUsed: result.tokens,
      latencyMs: latency,
      // Reasoning (for Grok 4.1, DeepSeek R1)
      reasoning: result.reasoning,
    });

  } catch (error) {
    const latency = Date.now() - startTime;
    logger.error('AI API error', error instanceof Error ? error : new Error(String(error)), {
      component: 'AI-API',
      metadata: { latencyMs: latency }
    });
    
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Internal error',
      latencyMs: latency,
    }, { status: 500 });
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// GET - List available models
// ═══════════════════════════════════════════════════════════════════════════

export async function GET() {
  const models = AIRouter.getAllModels();
  
  return NextResponse.json({
    models: models.map(m => ({
      id: m.id,
      name: m.name,
      provider: m.provider,
      capabilities: m.capabilities,
      speed: m.speed,
      quality: m.quality,
      isFree: m.isFree,
      supportsReasoning: m.supportsReasoning,
      supportsImages: m.supportsImages,
      supportsWebSearch: m.supportsWebSearch,
      contextTokens: m.contextTokens,
    })),
    defaultModel: 'grok-4.1-fast',
    totalModels: models.length,
  });
}
