/**
 * ZADIA OS - Advanced AI Models Configuration (100% FREE)
 * 
 * Todos los modelos avanzados disponibles en OpenRouter - 100% Gratis
 * Optimizado para Fase 4: Productividad Avanzada
 */

export type AIModelType = 
  | 'reasoning'      // Razonamiento profundo
  | 'agentic'        // Agentes complejos
  | 'tool-use'       // Function calling
  | 'multimodal'     // Visión + texto
  | 'long-context'   // Contextos ultra largos
  | 'default';       // Chat básico

export interface AIModelConfig {
  id: string;
  name: string;
  model: string;
  description: string;
  contextTokens: number;
  specialties: string[];
  useCase: AIModelType[];
}

/**
 * 🏆 TOP MODELOS 100% GRATIS EN OPENROUTER
 */
export const FREE_MODELS: Record<string, AIModelConfig> = {
  // 🥇 TOP 1: Mejor para razonamiento profundo y agentes
  'deepseek-r1': {
    id: 'deepseek-r1',
    name: 'DeepSeek R1',
    model: 'deepseek/deepseek-r1:free',
    description: '671B params, razonamiento avanzado, matching OpenAI o1',
    contextTokens: 163840,
    specialties: ['reasoning', 'chain-of-thought', 'analysis', 'problem-solving'],
    useCase: ['reasoning', 'agentic']
  },

  // 🥇 TOP 2: Mejor para agentes de código y function calling
  'qwen3-coder': {
    id: 'qwen3-coder',
    name: 'Qwen3-Coder 480B',
    model: 'qwen/qwen3-coder:free',
    description: '480B params, supera Claude 4 en SWE-Bench, function calling',
    contextTokens: 262000,
    specialties: ['coding', 'function-calling', 'tool-use', 'debugging', 'agents'],
    useCase: ['agentic', 'tool-use']
  },

  // 🥇 TOP 3: Mejor para tool-use nativo
  'glm-4.5-thinking': {
    id: 'glm-4.5-thinking',
    name: 'GLM-4.5 Thinking',
    model: 'z-ai/glm-4.5-thinking:free',
    description: '355B params, agentes nativos con function calling, thinking mode',
    contextTokens: 128000,
    specialties: ['function-calling', 'tool-use', 'workflows', 'thinking-mode'],
    useCase: ['tool-use', 'agentic']
  },

  // 🥇 TOP 4: Contexto ultra largo (1M tokens)
  'gemini-2.5-pro': {
    id: 'gemini-2.5-pro',
    name: 'Gemini 2.5 Pro Experimental',
    model: 'google/gemini-2.5-pro-exp-03-25:free',
    description: '1M tokens, #1 en benchmarks, multimodal',
    contextTokens: 1000000,
    specialties: ['long-context', 'multimodal', 'reasoning', 'code'],
    useCase: ['long-context', 'multimodal', 'reasoning']
  },

  // Multimodal y visión
  'llama-4-maverick': {
    id: 'llama-4-maverick',
    name: 'Llama 4 Maverick',
    model: 'meta-llama/llama-4-maverick:free',
    description: '400B params, multimodal, visual reasoning',
    contextTokens: 256000,
    specialties: ['multimodal', 'vision', 'visual-reasoning', 'images'],
    useCase: ['multimodal', 'long-context']
  },

  // Contexto muy largo (512K)
  'llama-4-scout': {
    id: 'llama-4-scout',
    name: 'Llama 4 Scout',
    model: 'meta-llama/llama-4-scout:free',
    description: '109B params, 512K tokens, ultra eficiente',
    contextTokens: 512000,
    specialties: ['long-context', 'documentation', 'knowledge-base'],
    useCase: ['long-context']
  },

  // Balance velocidad/poder
  'mistral-3.1-24b': {
    id: 'mistral-3.1-24b',
    name: 'Mistral Small 3.1 24B',
    model: 'mistralai/mistral-small-3.1-24b-instruct:free',
    description: 'Rápido, buena calidad, function calling',
    contextTokens: 96000,
    specialties: ['function-calling', 'json-outputs', 'tool-use', 'fast'],
    useCase: ['tool-use', 'default']
  },

  // GLM-4.5 Air (versión ligera)
  'glm-4.5-air': {
    id: 'glm-4.5-air',
    name: 'GLM-4.5 Air',
    model: 'z-ai/glm-4.5-air:free',
    description: '106B params, versión ligera con tool-use',
    contextTokens: 128000,
    specialties: ['function-calling', 'tool-use', 'fast'],
    useCase: ['tool-use', 'default']
  },

  // Qwen 2.5 72B (balance)
  'qwen-2.5-72b': {
    id: 'qwen-2.5-72b',
    name: 'Qwen 2.5 72B',
    model: 'qwen/qwen-2.5-72b-instruct:free',
    description: '72B params, muy bueno para código, gratis',
    contextTokens: 32768,
    specialties: ['coding', 'general', 'fast'],
    useCase: ['default', 'agentic']
  },

  // Kimi KVL-A3B Thinking (multimodal ligero)
  'kimi-vl-a3b': {
    id: 'kimi-vl-a3b',
    name: 'Kimi KVL-A3B Thinking',
    model: 'moonshotai/kimi-vl-a3b-thinking:free',
    description: '16B params, razonamiento visual, multimodal ligero',
    contextTokens: 131072,
    specialties: ['multimodal', 'vision', 'reasoning', 'lightweight'],
    useCase: ['multimodal', 'reasoning']
  },

  // Default (fallback)
  'gemma-3': {
    id: 'gemma-3',
    name: 'Gemma 3 27B',
    model: 'google/gemma-3-27b-it:free',
    description: 'Modelo básico para chat general',
    contextTokens: 8192,
    specialties: ['chat', 'general'],
    useCase: ['default']
  }
};

/**
 * Selecciona el mejor modelo según el caso de uso
 */
export function getModelForUseCase(useCase: AIModelType): AIModelConfig {
  switch (useCase) {
    case 'reasoning':
      return FREE_MODELS['deepseek-r1'];
    
    case 'agentic':
      return FREE_MODELS['qwen3-coder'];
    
    case 'tool-use':
      return FREE_MODELS['glm-4.5-thinking'];
    
    case 'multimodal':
      return FREE_MODELS['llama-4-maverick'];
    
    case 'long-context':
      return FREE_MODELS['gemini-2.5-pro'];
    
    default:
      return FREE_MODELS['gemma-3'];
  }
}

/**
 * Obtiene un modelo por ID
 */
export function getModelById(id: string): AIModelConfig | null {
  return FREE_MODELS[id] || null;
}

/**
 * Lista todos los modelos disponibles
 */
export function getAllModels(): AIModelConfig[] {
  return Object.values(FREE_MODELS);
}

/**
 * Modelos recomendados para Fase 4
 */
export const PHASE_4_MODELS = {
  // Agenda Cognitiva: razonamiento sobre conflictos, optimización
  cognitiveCalendar: FREE_MODELS['deepseek-r1'],
  
  // Gestor de Tareas RICE-Z: análisis de prioridades, dependencias
  taskManager: FREE_MODELS['deepseek-r1'],
  
  // Flujos Cognitivos: agentes complejos, workflows
  workflows: FREE_MODELS['qwen3-coder'],
  
  // Function calling nativo
  toolUse: FREE_MODELS['glm-4.5-thinking'],
  
  // Contexto largo (documentos, historial)
  longContext: FREE_MODELS['gemini-2.5-pro']
};

/**
 * Helper: Obtener modelo por nombre o ID
 */
export function getModelByNameOrId(identifier: string): AIModelConfig | null {
  // Buscar por ID exacto
  if (FREE_MODELS[identifier]) {
    return FREE_MODELS[identifier];
  }
  
  // Buscar por nombre (case insensitive)
  const found = Object.values(FREE_MODELS).find(
    model => model.name.toLowerCase().includes(identifier.toLowerCase())
  );
  
  return found || null;
}

