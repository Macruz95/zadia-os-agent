/**
 * ZADIA OS - Intelligent AI Router
 * 
 * Automatically selects the best AI model based on:
 * - Task type (text, code, image, document, web search, reasoning)
 * - Context requirements (short/long context)
 * - Speed requirements
 * - Available providers and rate limits
 * 
 * Similar to how modern IDEs auto-select models
 */

import { logger } from '@/lib/logger';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export type TaskType = 
  | 'general'           // General chat/questions
  | 'reasoning'         // Complex analysis, step-by-step thinking
  | 'coding'            // Code generation, debugging
  | 'creative'          // Creative writing, roleplay
  | 'data-analysis'     // Analyzing data, generating insights
  | 'document'          // Long document processing
  | 'image-analysis'    // Analyzing images (multimodal)
  | 'image-generation'  // Generating images
  | 'web-search'        // Questions needing current info
  | 'translation'       // Language translation
  | 'summarization'     // Summarizing content
  | 'tool-use'          // Function calling, agent actions
  | 'fast'              // Speed-critical responses
  | 'math';             // Mathematical problems

export type ModelSelection = 'auto' | 'manual';

export interface AIRouterConfig {
  mode: ModelSelection;
  preferredModel?: string;      // For manual mode
  preferredProvider?: AIProvider;
  maxLatencyMs?: number;        // If speed is critical
  contextLength?: 'short' | 'medium' | 'long' | 'ultra-long';
  requiresReasoning?: boolean;
  hasImages?: boolean;
  requiresWebSearch?: boolean;
}

export type AIProvider = 'openrouter' | 'groq' | 'google' | 'huggingface';

export interface ModelConfig {
  id: string;
  name: string;
  model: string;
  provider: AIProvider;
  contextTokens: number;
  capabilities: TaskType[];
  speed: 'ultra-fast' | 'fast' | 'medium' | 'slow';
  quality: 'basic' | 'good' | 'excellent' | 'top-tier';
  supportsReasoning?: boolean;
  supportsImages?: boolean;
  supportsWebSearch?: boolean;
  supportsFunctionCalling?: boolean;
  isFree: boolean;
  priority: number; // Higher = prefer this model
}

export interface RoutingDecision {
  model: string;
  modelId: string;
  modelName: string;
  provider: AIProvider;
  reason: string;
  fallbacks: string[];
  estimatedSpeed: string;
  capabilities: TaskType[];
}

// ═══════════════════════════════════════════════════════════════════════════
// MODEL REGISTRY - All Available Models (Updated Nov 2025)
// ═══════════════════════════════════════════════════════════════════════════

export const MODEL_REGISTRY: Record<string, ModelConfig> = {
  // ═══════════════════════════════════════════════════════════════════════
  // 🏆 TIER S - TOP MODELS (Free on OpenRouter)
  // ═══════════════════════════════════════════════════════════════════════
  
  'grok-4.1-fast': {
    id: 'grok-4.1-fast',
    name: 'Grok 4.1 Fast',
    model: 'x-ai/grok-4.1-fast:free',
    provider: 'openrouter',
    contextTokens: 131072,
    capabilities: ['general', 'reasoning', 'coding', 'data-analysis', 'tool-use', 'fast'],
    speed: 'ultra-fast',
    quality: 'top-tier',
    supportsReasoning: true,
    supportsFunctionCalling: true,
    isFree: true,
    priority: 100, // Highest priority - new default
  },

  'deepseek-r1': {
    id: 'deepseek-r1',
    name: 'DeepSeek R1',
    model: 'deepseek/deepseek-r1:free',
    provider: 'openrouter',
    contextTokens: 163840,
    capabilities: ['reasoning', 'math', 'data-analysis', 'coding'],
    speed: 'slow',
    quality: 'top-tier',
    supportsReasoning: true,
    isFree: true,
    priority: 95,
  },

  'qwen3-coder': {
    id: 'qwen3-coder',
    name: 'Qwen3-Coder 480B',
    model: 'qwen/qwen3-coder:free',
    provider: 'openrouter',
    contextTokens: 262000,
    capabilities: ['coding', 'tool-use', 'reasoning'],
    speed: 'medium',
    quality: 'top-tier',
    supportsFunctionCalling: true,
    isFree: true,
    priority: 90,
  },

  'gemini-2.5-pro': {
    id: 'gemini-2.5-pro',
    name: 'Gemini 2.5 Pro',
    model: 'google/gemini-2.5-pro-exp-03-25:free',
    provider: 'openrouter',
    contextTokens: 1000000,
    capabilities: ['document', 'image-analysis', 'reasoning', 'coding', 'general'],
    speed: 'medium',
    quality: 'top-tier',
    supportsImages: true,
    supportsReasoning: true,
    isFree: true,
    priority: 92,
  },

  'gemini-2.5-flash': {
    id: 'gemini-2.5-flash',
    name: 'Gemini 2.5 Flash',
    model: 'google/gemini-2.5-flash-preview-05-20:free',
    provider: 'openrouter',
    contextTokens: 1000000,
    capabilities: ['general', 'fast', 'image-analysis', 'coding'],
    speed: 'fast',
    quality: 'excellent',
    supportsImages: true,
    isFree: true,
    priority: 88,
  },

  'llama-4-maverick': {
    id: 'llama-4-maverick',
    name: 'Llama 4 Maverick',
    model: 'meta-llama/llama-4-maverick:free',
    provider: 'openrouter',
    contextTokens: 256000,
    capabilities: ['image-analysis', 'general', 'coding'],
    speed: 'medium',
    quality: 'top-tier',
    supportsImages: true,
    isFree: true,
    priority: 85,
  },

  'glm-4.5-thinking': {
    id: 'glm-4.5-thinking',
    name: 'GLM-4.5 Thinking',
    model: 'z-ai/glm-4.5-thinking:free',
    provider: 'openrouter',
    contextTokens: 128000,
    capabilities: ['tool-use', 'reasoning', 'coding'],
    speed: 'medium',
    quality: 'top-tier',
    supportsFunctionCalling: true,
    supportsReasoning: true,
    isFree: true,
    priority: 82,
  },

  // ═══════════════════════════════════════════════════════════════════════
  // 🥈 TIER A - EXCELLENT MODELS
  // ═══════════════════════════════════════════════════════════════════════

  'grok-4.1-mini': {
    id: 'grok-4.1-mini',
    name: 'Grok 4.1 Mini',
    model: 'x-ai/grok-4.1-mini:free',
    provider: 'openrouter',
    contextTokens: 131072,
    capabilities: ['web-search', 'general', 'fast'],
    speed: 'fast',
    quality: 'excellent',
    supportsWebSearch: true,
    isFree: true,
    priority: 78,
  },

  'llama-4-scout': {
    id: 'llama-4-scout',
    name: 'Llama 4 Scout',
    model: 'meta-llama/llama-4-scout:free',
    provider: 'openrouter',
    contextTokens: 512000,
    capabilities: ['document', 'general', 'summarization'],
    speed: 'fast',
    quality: 'excellent',
    isFree: true,
    priority: 75,
  },

  'qwen-2.5-72b': {
    id: 'qwen-2.5-72b',
    name: 'Qwen 2.5 72B',
    model: 'qwen/qwen-2.5-72b-instruct:free',
    provider: 'openrouter',
    contextTokens: 32768,
    capabilities: ['general', 'coding', 'translation'],
    speed: 'medium',
    quality: 'excellent',
    isFree: true,
    priority: 72,
  },

  'deepseek-r1-distill-70b': {
    id: 'deepseek-r1-distill-70b',
    name: 'DeepSeek R1 Distill 70B',
    model: 'deepseek/deepseek-r1-distill-llama-70b:free',
    provider: 'openrouter',
    contextTokens: 131072,
    capabilities: ['reasoning', 'general', 'math'],
    speed: 'medium',
    quality: 'excellent',
    supportsReasoning: true,
    isFree: true,
    priority: 70,
  },

  'llama-3.3-70b': {
    id: 'llama-3.3-70b',
    name: 'Llama 3.3 70B',
    model: 'meta-llama/llama-3.3-70b-instruct:free',
    provider: 'openrouter',
    contextTokens: 131072,
    capabilities: ['general', 'coding', 'reasoning'],
    speed: 'medium',
    quality: 'excellent',
    isFree: true,
    priority: 68,
  },

  // ═══════════════════════════════════════════════════════════════════════
  // ⚡ GROQ - ULTRA-FAST (Separate Provider)
  // ═══════════════════════════════════════════════════════════════════════

  'groq-llama-3.3-70b': {
    id: 'groq-llama-3.3-70b',
    name: 'Groq Llama 3.3 70B',
    model: 'llama-3.3-70b-versatile',
    provider: 'groq',
    contextTokens: 32768,
    capabilities: ['fast', 'general', 'coding'],
    speed: 'ultra-fast',
    quality: 'excellent',
    isFree: true,
    priority: 80,
  },

  'groq-llama-3.1-8b': {
    id: 'groq-llama-3.1-8b',
    name: 'Groq Llama 3.1 8B Instant',
    model: 'llama-3.1-8b-instant',
    provider: 'groq',
    contextTokens: 8192,
    capabilities: ['fast'],
    speed: 'ultra-fast',
    quality: 'good',
    isFree: true,
    priority: 65,
  },

  'groq-deepseek-r1-distill': {
    id: 'groq-deepseek-r1-distill',
    name: 'Groq DeepSeek R1 Distill',
    model: 'deepseek-r1-distill-llama-70b',
    provider: 'groq',
    contextTokens: 32768,
    capabilities: ['reasoning', 'fast'],
    speed: 'ultra-fast',
    quality: 'excellent',
    supportsReasoning: true,
    isFree: true,
    priority: 77,
  },

  // ═══════════════════════════════════════════════════════════════════════
  // 🌈 GOOGLE AI STUDIO
  // ═══════════════════════════════════════════════════════════════════════

  'google-gemini-2.0-flash': {
    id: 'google-gemini-2.0-flash',
    name: 'Gemini 2.0 Flash (Google)',
    model: 'gemini-2.0-flash',
    provider: 'google',
    contextTokens: 1000000,
    capabilities: ['image-analysis', 'fast', 'general', 'document'],
    speed: 'fast',
    quality: 'excellent',
    supportsImages: true,
    isFree: true,
    priority: 73,
  },

  // ═══════════════════════════════════════════════════════════════════════
  // 🎭 SPECIALIZED
  // ═══════════════════════════════════════════════════════════════════════

  'deepseek-prover': {
    id: 'deepseek-prover',
    name: 'DeepSeek Prover V2',
    model: 'deepseek/deepseek-prover-v2:free',
    provider: 'openrouter',
    contextTokens: 163840,
    capabilities: ['math', 'reasoning'],
    speed: 'slow',
    quality: 'top-tier',
    supportsReasoning: true,
    isFree: true,
    priority: 60,
  },

  'perplexity-sonar': {
    id: 'perplexity-sonar',
    name: 'Perplexity Sonar',
    model: 'perplexity/sonar-small-online:free',
    provider: 'openrouter',
    contextTokens: 8192,
    capabilities: ['web-search'],
    speed: 'fast',
    quality: 'good',
    supportsWebSearch: true,
    isFree: true,
    priority: 55,
  },

  'codestral-2501': {
    id: 'codestral-2501',
    name: 'Codestral 2501',
    model: 'mistralai/codestral-2501:free',
    provider: 'openrouter',
    contextTokens: 262144,
    capabilities: ['coding'],
    speed: 'fast',
    quality: 'excellent',
    isFree: true,
    priority: 70,
  },

  'mythomax-13b': {
    id: 'mythomax-13b',
    name: 'MythoMax 13B',
    model: 'gryphe/mythomax-l2-13b:free',
    provider: 'openrouter',
    contextTokens: 4096,
    capabilities: ['creative'],
    speed: 'fast',
    quality: 'good',
    isFree: true,
    priority: 45,
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// TASK DETECTION
// ═══════════════════════════════════════════════════════════════════════════

interface TaskAnalysis {
  primaryTask: TaskType;
  secondaryTasks: TaskType[];
  requiresReasoning: boolean;
  requiresImages: boolean;
  requiresWebSearch: boolean;
  requiresLongContext: boolean;
  requiresSpeed: boolean;
  contextLength: 'short' | 'medium' | 'long' | 'ultra-long';
}

const TASK_PATTERNS: Record<TaskType, RegExp[]> = {
  reasoning: [
    /analiza|analyze|explica por qué|explain why|razona|reason|piensa|think|evalúa|evaluate|compara|compare/i,
    /paso a paso|step by step|desglose|breakdown|lógica|logic/i,
    /por qué|why|cómo funciona|how does|cuál es la razón|what is the reason/i,
  ],
  coding: [
    /código|code|programa|program|función|function|bug|error|debug|typescript|javascript|python|react|css|html/i,
    /implementa|implement|corrige|fix|refactoriza|refactor|optimiza|optimize/i,
    /api|endpoint|backend|frontend|base de datos|database|query|sql/i,
  ],
  'data-analysis': [
    /analiza (los )?datos|analyze data|estadísticas|statistics|tendencia|trend|kpi|métricas|metrics/i,
    /reporte|report|dashboard|gráfico|chart|ventas|sales|ingresos|revenue|gastos|expenses/i,
    /cliente|customer|proyecto|project|inventario|inventory|finanzas|finance/i,
  ],
  document: [
    /documento|document|pdf|archivo|file|contrato|contract|informe|report/i,
    /resume|summarize|extrae|extract|procesa|process/i,
  ],
  'image-analysis': [
    /imagen|image|foto|photo|captura|screenshot|visual|gráfico|chart|diagrama|diagram/i,
    /qué ves|what do you see|describe la imagen|describe the image|analiza esta imagen/i,
  ],
  'image-generation': [
    /genera (una )?imagen|generate image|crea (una )?imagen|create image|dibuja|draw/i,
    /ilustración|illustration|arte|art|diseño|design/i,
  ],
  'web-search': [
    /busca en internet|search the web|información actual|current information|noticias|news/i,
    /precio actual|current price|clima|weather|últimas|latest|hoy|today|2025|2024/i,
  ],
  translation: [
    /traduce|translate|en inglés|in english|en español|in spanish|idioma|language/i,
  ],
  summarization: [
    /resume|summarize|resumen|summary|puntos clave|key points|tldr|breve|brief/i,
  ],
  'tool-use': [
    /crea (una )?tarea|create task|agenda|schedule|registra|register|guarda|save/i,
    /nuevo (gasto|proyecto|cliente|reunión)|new (expense|project|client|meeting)/i,
    /ejecuta|execute|acción|action/i,
  ],
  math: [
    /calcula|calculate|matemática|math|ecuación|equation|fórmula|formula|integral|derivada/i,
    /álgebra|algebra|geometría|geometry|estadística|statistics|probabilidad|probability/i,
  ],
  creative: [
    /historia|story|cuento|tale|poema|poem|canción|song|creativo|creative/i,
    /inventa|invent|imagina|imagine|ficción|fiction/i,
  ],
  fast: [
    /rápido|quick|urgente|urgent|ahora|now|inmediato|immediate/i,
  ],
  general: [], // Default fallback
};

function analyzeTask(message: string, config: AIRouterConfig): TaskAnalysis {
  const messageLower = message.toLowerCase();
  const messageLength = message.length;
  
  // Detect tasks from patterns
  const detectedTasks: TaskType[] = [];
  
  for (const [task, patterns] of Object.entries(TASK_PATTERNS)) {
    for (const pattern of patterns) {
      if (pattern.test(messageLower)) {
        detectedTasks.push(task as TaskType);
        break;
      }
    }
  }
  
  // Determine primary task
  let primaryTask: TaskType = 'general';
  if (detectedTasks.length > 0) {
    // Prioritize certain tasks
    const priority: TaskType[] = ['coding', 'reasoning', 'data-analysis', 'image-analysis', 'web-search', 'tool-use', 'math'];
    for (const p of priority) {
      if (detectedTasks.includes(p)) {
        primaryTask = p;
        break;
      }
    }
    if (primaryTask === 'general' && detectedTasks.length > 0) {
      primaryTask = detectedTasks[0];
    }
  }
  
  // Context length estimation
  let contextLength: 'short' | 'medium' | 'long' | 'ultra-long' = 'short';
  if (messageLength > 10000) contextLength = 'ultra-long';
  else if (messageLength > 3000) contextLength = 'long';
  else if (messageLength > 500) contextLength = 'medium';
  
  return {
    primaryTask,
    secondaryTasks: detectedTasks.filter(t => t !== primaryTask),
    requiresReasoning: detectedTasks.includes('reasoning') || config.requiresReasoning || false,
    requiresImages: config.hasImages || detectedTasks.includes('image-analysis'),
    requiresWebSearch: config.requiresWebSearch || detectedTasks.includes('web-search'),
    requiresLongContext: contextLength === 'long' || contextLength === 'ultra-long' || config.contextLength === 'long' || config.contextLength === 'ultra-long',
    requiresSpeed: detectedTasks.includes('fast') || (config.maxLatencyMs !== undefined && config.maxLatencyMs < 3000),
    contextLength: config.contextLength || contextLength,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// INTELLIGENT ROUTER
// ═══════════════════════════════════════════════════════════════════════════

export class AIRouter {
  private static providerHealth: Map<AIProvider, { healthy: boolean; lastCheck: number; failCount: number }> = new Map();
  
  /**
   * Select the best model for a given message and configuration
   */
  static selectModel(message: string, config: AIRouterConfig = { mode: 'auto' }): RoutingDecision {
    // Manual mode - use specified model
    if (config.mode === 'manual' && config.preferredModel) {
      const model = MODEL_REGISTRY[config.preferredModel];
      if (model) {
        return {
          model: model.model,
          modelId: model.id,
          modelName: model.name,
          provider: model.provider,
          reason: `Manual selection: ${model.name}`,
          fallbacks: this.getFallbacks(model),
          estimatedSpeed: model.speed,
          capabilities: model.capabilities,
        };
      }
    }
    
    // Auto mode - analyze and select
    const analysis = analyzeTask(message, config);
    
    logger.info('AI Router analyzing task', {
      component: 'AIRouter',
      metadata: {
        primaryTask: analysis.primaryTask,
        secondaryTasks: analysis.secondaryTasks,
        contextLength: analysis.contextLength,
        requiresReasoning: analysis.requiresReasoning,
        requiresImages: analysis.requiresImages,
        requiresWebSearch: analysis.requiresWebSearch,
      }
    });
    
    // Filter and score models
    const candidates = Object.values(MODEL_REGISTRY)
      .filter(model => this.isModelSuitable(model, analysis, config))
      .map(model => ({
        model,
        score: this.scoreModel(model, analysis, config),
      }))
      .sort((a, b) => b.score - a.score);
    
    if (candidates.length === 0) {
      // Fallback to default
      const defaultModel = MODEL_REGISTRY['grok-4.1-fast'];
      return {
        model: defaultModel.model,
        modelId: defaultModel.id,
        modelName: defaultModel.name,
        provider: defaultModel.provider,
        reason: 'No suitable model found, using default',
        fallbacks: ['gemini-2.5-flash', 'groq-llama-3.3-70b'],
        estimatedSpeed: defaultModel.speed,
        capabilities: defaultModel.capabilities,
      };
    }
    
    const selected = candidates[0].model;
    const fallbacks = candidates.slice(1, 4).map(c => c.model.id);
    
    return {
      model: selected.model,
      modelId: selected.id,
      modelName: selected.name,
      provider: selected.provider,
      reason: this.buildReason(selected, analysis),
      fallbacks,
      estimatedSpeed: selected.speed,
      capabilities: selected.capabilities,
    };
  }
  
  /**
   * Check if a model is suitable for the task
   */
  private static isModelSuitable(model: ModelConfig, analysis: TaskAnalysis, config: AIRouterConfig): boolean {
    // Check provider preference
    if (config.preferredProvider && model.provider !== config.preferredProvider) {
      return false;
    }
    
    // Check provider health
    const health = this.providerHealth.get(model.provider);
    if (health && !health.healthy && Date.now() - health.lastCheck < 60000) {
      return false;
    }
    
    // Must support images if needed
    if (analysis.requiresImages && !model.supportsImages) {
      return false;
    }
    
    // Must support web search if needed
    if (analysis.requiresWebSearch && !model.supportsWebSearch) {
      // Allow models that don't explicitly support but are general purpose
      if (!model.capabilities.includes('general')) {
        return false;
      }
    }
    
    // Context length check
    if (analysis.requiresLongContext && model.contextTokens < 50000) {
      return false;
    }
    
    // Speed requirement
    if (analysis.requiresSpeed && model.speed === 'slow') {
      return false;
    }
    
    return true;
  }
  
  /**
   * Score a model for the task (higher = better)
   */
  private static scoreModel(model: ModelConfig, analysis: TaskAnalysis, config: AIRouterConfig): number {
    let score = model.priority;
    
    // Capability match bonus
    if (model.capabilities.includes(analysis.primaryTask)) {
      score += 30;
    }
    for (const task of analysis.secondaryTasks) {
      if (model.capabilities.includes(task)) {
        score += 10;
      }
    }
    
    // Reasoning bonus
    if (analysis.requiresReasoning && model.supportsReasoning) {
      score += 25;
    }
    
    // Speed bonus when needed
    if (analysis.requiresSpeed) {
      if (model.speed === 'ultra-fast') score += 30;
      else if (model.speed === 'fast') score += 15;
    }
    
    // Quality bonus for complex tasks
    if (analysis.primaryTask === 'reasoning' || analysis.primaryTask === 'coding') {
      if (model.quality === 'top-tier') score += 20;
      else if (model.quality === 'excellent') score += 10;
    }
    
    // Long context bonus
    if (analysis.requiresLongContext) {
      if (model.contextTokens >= 500000) score += 15;
      else if (model.contextTokens >= 100000) score += 10;
    }
    
    // Tool use bonus for agent tasks
    if (analysis.primaryTask === 'tool-use' && model.supportsFunctionCalling) {
      score += 25;
    }
    
    return score;
  }
  
  /**
   * Build human-readable reason for selection
   */
  private static buildReason(model: ModelConfig, analysis: TaskAnalysis): string {
    const reasons: string[] = [];
    
    if (model.capabilities.includes(analysis.primaryTask)) {
      reasons.push(`optimized for ${analysis.primaryTask}`);
    }
    
    if (analysis.requiresReasoning && model.supportsReasoning) {
      reasons.push('supports advanced reasoning');
    }
    
    if (analysis.requiresSpeed && (model.speed === 'ultra-fast' || model.speed === 'fast')) {
      reasons.push('fast response time');
    }
    
    if (analysis.requiresImages && model.supportsImages) {
      reasons.push('multimodal support');
    }
    
    if (reasons.length === 0) {
      reasons.push('best general purpose option');
    }
    
    return `${model.name}: ${reasons.join(', ')}`;
  }
  
  /**
   * Get fallback models for a given model
   */
  private static getFallbacks(model: ModelConfig): string[] {
    return Object.values(MODEL_REGISTRY)
      .filter(m => m.id !== model.id && m.provider !== model.provider)
      .sort((a, b) => b.priority - a.priority)
      .slice(0, 3)
      .map(m => m.id);
  }
  
  /**
   * Mark a provider as unhealthy (for circuit breaking)
   */
  static markProviderUnhealthy(provider: AIProvider): void {
    const current = this.providerHealth.get(provider) || { healthy: true, lastCheck: 0, failCount: 0 };
    this.providerHealth.set(provider, {
      healthy: false,
      lastCheck: Date.now(),
      failCount: current.failCount + 1,
    });
    
    logger.warn(`AI Provider ${provider} marked unhealthy`, {
      component: 'AIRouter',
      metadata: { failCount: current.failCount + 1 }
    });
  }
  
  /**
   * Mark a provider as healthy again
   */
  static markProviderHealthy(provider: AIProvider): void {
    this.providerHealth.set(provider, {
      healthy: true,
      lastCheck: Date.now(),
      failCount: 0,
    });
  }
  
  /**
   * Get all available models
   */
  static getAllModels(): ModelConfig[] {
    return Object.values(MODEL_REGISTRY).sort((a, b) => b.priority - a.priority);
  }
  
  /**
   * Get models by capability
   */
  static getModelsByCapability(capability: TaskType): ModelConfig[] {
    return Object.values(MODEL_REGISTRY)
      .filter(m => m.capabilities.includes(capability))
      .sort((a, b) => b.priority - a.priority);
  }
  
  /**
   * Get model by ID
   */
  static getModelById(id: string): ModelConfig | null {
    return MODEL_REGISTRY[id] || null;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════

export default AIRouter;
