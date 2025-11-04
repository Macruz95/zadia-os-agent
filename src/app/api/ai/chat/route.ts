/**
 * ZADIA OS - AI Assistant API Route
 * 
 * Server-side API for OpenRouter calls using OpenAI SDK
 * Rule #1: Real API calls (server-side only)
 */

import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { logger } from '@/lib/logger';

// Initialize OpenAI client with OpenRouter configuration
const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    "HTTP-Referer": "https://zadia-os.com",
    "X-Title": "Zadia OS - Business Intelligence",
  },
});

const MODEL = 'google/gemma-3-27b-it:free';

export async function POST(request: NextRequest) {
  try {
    // Validate API key
    if (!process.env.OPENROUTER_API_KEY) {
      logger.error('[AI API] OPENROUTER_API_KEY not configured');
      return NextResponse.json(
        { error: 'AI service not configured' },
        { status: 503 }
      );
    }

    const body = await request.json();
    const { messages, temperature = 0.7 } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Messages array is required' },
        { status: 400 }
      );
    }

    // Log request for debugging
    logger.info(`[AI API] Calling OpenRouter with ${messages.length} messages`);

    // Call OpenRouter using OpenAI SDK
    const completion = await openai.chat.completions.create({
      model: MODEL,
      messages,
      temperature,
      max_tokens: 1000,
    });

    const content = completion.choices[0]?.message?.content || 'No se pudo generar respuesta.';

    return NextResponse.json({ 
      content,
      model: MODEL,
      tokensUsed: completion.usage?.total_tokens || 0,
    });

  } catch (error) {
    logger.error(
      '[AI API] Error processing request',
      error instanceof Error ? error : new Error(String(error))
    );
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
