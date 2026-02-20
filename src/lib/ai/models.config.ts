/**
 * ZADIA OS - MEGA AI Models Configuration (100% FREE)
 * 
 * 🔥 TODOS los modelos 100% GRATIS disponibles:
 * - OpenRouter (50+ modelos :free)
 * - Groq (ultra-rápido, ilimitado)
 * - Google AI Studio (multimodal)
 * - Hugging Face (900K+ modelos)
 * 
 * Última actualización: Noviembre 2025
 */

export type AIModelType =
  | 'reasoning'      // Razonamiento profundo
  | 'agentic'        // Agentes complejos
  | 'tool-use'       // Function calling
  | 'multimodal'     // Visión + texto
  | 'long-context'   // Contextos ultra largos
  | 'coding'         // Programación
  | 'fast'           // Ultra-rápido
  | 'roleplay'       // Creatividad/Roleplay
  | 'math'           // Matemáticas
  | 'research'       // Investigación web
  | 'default';       // Chat básico

export type AIProvider = 'openrouter' | 'groq' | 'google' | 'huggingface';

export interface AIModelConfig {
  id: string;
  name: string;
  model: string;
  provider: AIProvider;
  description: string;
  contextTokens: number;
  specialties: string[];
  useCase: AIModelType[];
  speed?: 'slow' | 'medium' | 'fast' | 'ultra-fast';
  quality?: 'basic' | 'good' | 'excellent' | 'top-tier';
}

// ═══════════════════════════════════════════════════════════════════════════
// 🏆 OPENROUTER - MODELOS 100% GRATIS (sufijo :free)
// ═══════════════════════════════════════════════════════════════════════════

export const OPENROUTER_FREE_MODELS: Record<string, AIModelConfig> = {
  // ═══════════════════════════════════════════════════════════════════════
  // 🥇 TIER S - LOS MEJORES MODELOS GRATIS (Early 2026)
  // ═══════════════════════════════════════════════════════════════════════

  'gpt-oss-120b': {
    id: 'gpt-oss-120b',
    name: 'OpenAI GPT-OSS-120B',
    model: 'openai/gpt-oss-120b:free',
    provider: 'openrouter',
    description: '117B MoE open-weights. Nivel de razonamiento profundo y agentes autónomos.',
    contextTokens: 131072,
    specialties: ['reasoning', 'coding', 'function-calling', 'agents', 'tool-use'],
    useCase: ['reasoning', 'agentic', 'tool-use', 'coding'],
    speed: 'fast',
    quality: 'top-tier'
  },

  'qwen3-vl-30b': {
    id: 'qwen3-vl-30b',
    name: 'Qwen3-VL 30B Thinking',
    model: 'qwen/qwen3-vl-30b-a3b-thinking:free',
    provider: 'openrouter',
    description: 'Multimodal nativo Top 1. Excelente entendimiento de imagen/video y razonamiento lógico.',
    contextTokens: 32768,
    specialties: ['multimodal', 'vision', 'reasoning', 'documents', 'ocr'],
    useCase: ['multimodal', 'reasoning'],
    speed: 'medium',
    quality: 'top-tier'
  },

  'solar-pro-3': {
    id: 'solar-pro-3',
    name: 'Upstage Solar Pro 3',
    model: 'upstage/solar-pro-3:free',
    provider: 'openrouter',
    description: 'MoE masivo de 102B. Altamente cualificado para lógica, matemáticas e idiomas.',
    contextTokens: 128000,
    specialties: ['reasoning', 'general', 'fast', 'multilingual'],
    useCase: ['reasoning', 'default'],
    speed: 'fast',
    quality: 'top-tier'
  },

  'deepseek-r1': {
    id: 'deepseek-r1',
    name: 'DeepSeek R1',
    model: 'deepseek/deepseek-r1:free',
    provider: 'openrouter',
    description: '671B params, razonamiento nivel OpenAI o1, chain-of-thought',
    contextTokens: 163840,
    specialties: ['reasoning', 'chain-of-thought', 'analysis', 'problem-solving', 'math'],
    useCase: ['reasoning', 'agentic', 'math'],
    speed: 'slow',
    quality: 'top-tier'
  },

  'gemini-2.5-pro': {
    id: 'gemini-2.5-pro',
    name: 'Gemini 2.5 Pro Experimental',
    model: 'google/gemini-2.5-pro-exp-03-25:free',
    provider: 'openrouter',
    description: '1M tokens contexto, #1 en benchmarks, multimodal completo',
    contextTokens: 1000000,
    specialties: ['long-context', 'multimodal', 'reasoning', 'code', 'vision'],
    useCase: ['long-context', 'multimodal', 'reasoning'],
    speed: 'medium',
    quality: 'top-tier'
  },

  'gemini-2.5-flash': {
    id: 'gemini-2.5-flash',
    name: 'Gemini 2.5 Flash Preview',
    model: 'google/gemini-2.5-flash-preview-05-20:free',
    provider: 'openrouter',
    description: 'Versión rápida de Gemini 2.5, excelente balance',
    contextTokens: 1000000,
    specialties: ['fast', 'multimodal', 'general'],
    useCase: ['fast', 'multimodal', 'default'],
    speed: 'fast',
    quality: 'excellent'
  },


  // ═══════════════════════════════════════════════════════════════════════
  // 🥈 TIER A - MODELOS EXCELENTES
  // ═══════════════════════════════════════════════════════════════════════

  'llama-4-maverick': {
    id: 'llama-4-maverick',
    name: 'Llama 4 Maverick',
    model: 'meta-llama/llama-4-maverick:free',
    provider: 'openrouter',
    description: '400B params, multimodal, visual reasoning',
    contextTokens: 256000,
    specialties: ['multimodal', 'vision', 'visual-reasoning', 'images'],
    useCase: ['multimodal', 'long-context'],
    speed: 'medium',
    quality: 'top-tier'
  },

  'llama-4-scout': {
    id: 'llama-4-scout',
    name: 'Llama 4 Scout',
    model: 'meta-llama/llama-4-scout:free',
    provider: 'openrouter',
    description: '109B params, 512K tokens, ultra eficiente',
    contextTokens: 512000,
    specialties: ['long-context', 'documentation', 'knowledge-base'],
    useCase: ['long-context'],
    speed: 'fast',
    quality: 'excellent'
  },

  'glm-4.5-thinking': {
    id: 'glm-4.5-thinking',
    name: 'GLM-4.5 Thinking',
    model: 'z-ai/glm-4.5-thinking:free',
    provider: 'openrouter',
    description: '355B params, agentes nativos, function calling, thinking mode',
    contextTokens: 128000,
    specialties: ['function-calling', 'tool-use', 'workflows', 'thinking-mode'],
    useCase: ['tool-use', 'agentic'],
    speed: 'medium',
    quality: 'top-tier'
  },

  'glm-4.5-air': {
    id: 'glm-4.5-air',
    name: 'GLM-4.5 Air',
    model: 'z-ai/glm-4.5-air:free',
    provider: 'openrouter',
    description: '106B params, versión ligera con tool-use',
    contextTokens: 128000,
    specialties: ['function-calling', 'tool-use', 'fast'],
    useCase: ['tool-use', 'default', 'fast'],
    speed: 'fast',
    quality: 'excellent'
  },

  'qwen-2.5-72b': {
    id: 'qwen-2.5-72b',
    name: 'Qwen 2.5 72B',
    model: 'qwen/qwen-2.5-72b-instruct:free',
    provider: 'openrouter',
    description: '72B params, excelente para código y general',
    contextTokens: 32768,
    specialties: ['coding', 'general', 'multilingual'],
    useCase: ['default', 'agentic', 'coding'],
    speed: 'medium',
    quality: 'excellent'
  },

  'qwen-2.5-coder-32b': {
    id: 'qwen-2.5-coder-32b',
    name: 'Qwen 2.5 Coder 32B',
    model: 'qwen/qwen-2.5-coder-32b-instruct:free',
    provider: 'openrouter',
    description: '32B params, especializado en código',
    contextTokens: 32768,
    specialties: ['coding', 'debugging', 'code-review'],
    useCase: ['coding'],
    speed: 'fast',
    quality: 'excellent'
  },

  'qwen3-235b': {
    id: 'qwen3-235b',
    name: 'Qwen 3 235B',
    model: 'qwen/qwen-3-235b-a22b:free',
    provider: 'openrouter',
    description: '235B params MoE, multilingüe, muy capaz',
    contextTokens: 40960,
    specialties: ['multilingual', 'general', 'reasoning'],
    useCase: ['default', 'reasoning'],
    speed: 'medium',
    quality: 'top-tier'
  },

  'qwen3-32b': {
    id: 'qwen3-32b',
    name: 'Qwen 3 32B',
    model: 'qwen/qwen3-32b:free',
    provider: 'openrouter',
    description: '32B params, balance velocidad/calidad',
    contextTokens: 40960,
    specialties: ['general', 'fast', 'multilingual'],
    useCase: ['default', 'fast'],
    speed: 'fast',
    quality: 'excellent'
  },

  // ═══════════════════════════════════════════════════════════════════════
  // 🥉 TIER B - MODELOS MUY BUENOS
  // ═══════════════════════════════════════════════════════════════════════

  'mistral-3.1-24b': {
    id: 'mistral-3.1-24b',
    name: 'Mistral Small 3.1 24B',
    model: 'mistralai/mistral-small-3.1-24b-instruct:free',
    provider: 'openrouter',
    description: 'Rápido, buena calidad, function calling',
    contextTokens: 96000,
    specialties: ['function-calling', 'json-outputs', 'tool-use', 'fast'],
    useCase: ['tool-use', 'default', 'fast'],
    speed: 'fast',
    quality: 'excellent'
  },

  'phi-4': {
    id: 'phi-4',
    name: 'Microsoft Phi-4',
    model: 'microsoft/phi-4:free',
    provider: 'openrouter',
    description: '14B params, muy eficiente, razonamiento',
    contextTokens: 16384,
    specialties: ['reasoning', 'math', 'efficient'],
    useCase: ['reasoning', 'math', 'fast'],
    speed: 'ultra-fast',
    quality: 'good'
  },

  'phi-4-reasoning-plus': {
    id: 'phi-4-reasoning-plus',
    name: 'Phi-4 Reasoning Plus',
    model: 'microsoft/phi-4-reasoning-plus:free',
    provider: 'openrouter',
    description: 'Phi-4 optimizado para razonamiento',
    contextTokens: 16384,
    specialties: ['reasoning', 'math', 'logic'],
    useCase: ['reasoning', 'math'],
    speed: 'fast',
    quality: 'excellent'
  },

  'deepseek-chat': {
    id: 'deepseek-chat',
    name: 'DeepSeek V3',
    model: 'deepseek/deepseek-chat-v3-0324:free',
    provider: 'openrouter',
    description: '671B MoE, chat general excelente',
    contextTokens: 65536,
    specialties: ['chat', 'general', 'coding'],
    useCase: ['default', 'coding'],
    speed: 'medium',
    quality: 'top-tier'
  },

  'deepseek-prover': {
    id: 'deepseek-prover',
    name: 'DeepSeek Prover V2',
    model: 'deepseek/deepseek-prover-v2:free',
    provider: 'openrouter',
    description: 'Especializado en matemáticas y pruebas',
    contextTokens: 163840,
    specialties: ['math', 'proofs', 'formal-verification'],
    useCase: ['math', 'reasoning'],
    speed: 'slow',
    quality: 'top-tier'
  },

  'kimi-vl-a3b': {
    id: 'kimi-vl-a3b',
    name: 'Kimi KVL-A3B Thinking',
    model: 'moonshotai/kimi-vl-a3b-thinking:free',
    provider: 'openrouter',
    description: '16B params, razonamiento visual, multimodal ligero',
    contextTokens: 131072,
    specialties: ['multimodal', 'vision', 'reasoning', 'lightweight'],
    useCase: ['multimodal', 'reasoning'],
    speed: 'fast',
    quality: 'good'
  },

  // ═══════════════════════════════════════════════════════════════════════
  // 🆕 TIER B+ - NUEVOS MODELOS DICIEMBRE 2025
  // ═══════════════════════════════════════════════════════════════════════

  'mimo-v2-flash': {
    id: 'mimo-v2-flash',
    name: 'Xiaomi MiMo-V2-Flash',
    model: 'xiaomi/mimo-v2-flash:free',
    provider: 'openrouter',
    description: '309B MoE (15B activos), #1 en trivia/marketing/academia, 256K contexto',
    contextTokens: 262144,
    specialties: ['reasoning', 'coding', 'agents', 'swe-bench'],
    useCase: ['reasoning', 'agentic', 'coding'],
    speed: 'fast',
    quality: 'top-tier'
  },

  'devstral-2': {
    id: 'devstral-2',
    name: 'Mistral Devstral 2 2512',
    model: 'mistralai/devstral-2-2512:free',
    provider: 'openrouter',
    description: '123B params, #1 legal/#3 academia/#7 código, 256K contexto',
    contextTokens: 262144,
    specialties: ['coding', 'agentic', 'legal', 'multi-file'],
    useCase: ['agentic', 'coding', 'long-context'],
    speed: 'medium',
    quality: 'top-tier'
  },

  'kat-coder-pro': {
    id: 'kat-coder-pro',
    name: 'Kwaipilot KAT-Coder-Pro V1',
    model: 'kwaipilot/kat-coder-pro-v1:free',
    provider: 'openrouter',
    description: '73.4% SWE-Bench, optimizado para uso de herramientas e interacción multi-turno',
    contextTokens: 262144,
    specialties: ['coding', 'tool-use', 'agentic', 'swe-bench'],
    useCase: ['agentic', 'tool-use', 'coding'],
    speed: 'medium',
    quality: 'top-tier'
  },

  'deepseek-r1t2-chimera': {
    id: 'deepseek-r1t2-chimera',
    name: 'TNG DeepSeek R1T2 Chimera',
    model: 'tngtech/deepseek-r1t2-chimera:free',
    provider: 'openrouter',
    description: '671B MoE, fusión R1-0528+R1+V3-0324, 20% más rápido que R1',
    contextTokens: 163840,
    specialties: ['reasoning', 'roleplay', 'seo', 'long-context'],
    useCase: ['reasoning', 'roleplay'],
    speed: 'medium',
    quality: 'top-tier'
  },

  'deepseek-r1t-chimera': {
    id: 'deepseek-r1t-chimera',
    name: 'TNG DeepSeek R1T Chimera',
    model: 'tngtech/deepseek-r1t-chimera:free',
    provider: 'openrouter',
    description: 'Fusión DeepSeek-R1 + V3-0324, balance razonamiento/eficiencia',
    contextTokens: 163840,
    specialties: ['reasoning', 'general', 'efficiency'],
    useCase: ['reasoning', 'default'],
    speed: 'fast',
    quality: 'excellent'
  },

  'r1t-chimera': {
    id: 'r1t-chimera',
    name: 'TNG R1T Chimera',
    model: 'tngtech/r1t-chimera:free',
    provider: 'openrouter',
    description: 'Derivado creativo de R1T-Chimera, EQ-Bench3 ~1305, mejor tool-calling',
    contextTokens: 163840,
    specialties: ['roleplay', 'creative', 'tool-use', 'personality'],
    useCase: ['roleplay', 'tool-use'],
    speed: 'medium',
    quality: 'excellent'
  },

  'deepseek-v31-nex-n1': {
    id: 'deepseek-v31-nex-n1',
    name: 'Nex AGI DeepSeek V3.1 Nex N1',
    model: 'nex-agi/deepseek-v31-nex-n1:free',
    provider: 'openrouter',
    description: 'Post-entrenado para autonomía de agentes, uso de herramientas y productividad',
    contextTokens: 131072,
    specialties: ['agentic', 'tool-use', 'coding', 'html-generation'],
    useCase: ['agentic', 'tool-use', 'coding'],
    speed: 'medium',
    quality: 'excellent'
  },

  'nemotron-nano-12b-vl': {
    id: 'nemotron-nano-12b-vl',
    name: 'NVIDIA Nemotron Nano 12B 2 VL',
    model: 'nvidia/nemotron-nano-12b-2-vl:free',
    provider: 'openrouter',
    description: '12B params, multimodal (video/docs), arquitectura Transformer-Mamba',
    contextTokens: 131072,
    specialties: ['multimodal', 'vision', 'ocr', 'documents', 'video'],
    useCase: ['multimodal'],
    speed: 'fast',
    quality: 'excellent'
  },

  'nemotron-3-nano-30b': {
    id: 'nemotron-3-nano-30b',
    name: 'NVIDIA Nemotron 3 Nano 30B A3B',
    model: 'nvidia/nemotron-3-nano-30b-a3b:free',
    provider: 'openrouter',
    description: '30B MoE, máxima eficiencia computacional, ideal para agentes especializados',
    contextTokens: 262144,
    specialties: ['agentic', 'translation', 'efficient'],
    useCase: ['agentic', 'fast', 'default'],
    speed: 'fast',
    quality: 'excellent'
  },

  'olmo-31-32b-think': {
    id: 'olmo-31-32b-think',
    name: 'AllenAI Olmo 3.1 32B Think',
    model: 'allenai/olmo-31-32b-think:free',
    provider: 'openrouter',
    description: '32B params, razonamiento profundo, lógica multi-paso, Apache 2.0',
    contextTokens: 66000,
    specialties: ['reasoning', 'logic', 'instruction-following'],
    useCase: ['reasoning'],
    speed: 'medium',
    quality: 'excellent'
  },

  'gpt-oss-20b': {
    id: 'gpt-oss-20b',
    name: 'OpenAI gpt-oss-20b',
    model: 'openai/gpt-oss-20b:free',
    provider: 'openrouter',
    description: '21B MoE (3.6B activos), peso abierto Apache 2.0, function calling nativo',
    contextTokens: 131072,
    specialties: ['function-calling', 'tool-use', 'agentic', 'finetuning'],
    useCase: ['tool-use', 'agentic', 'fast'],
    speed: 'ultra-fast',
    quality: 'good'
  },

  'kimi-k2': {
    id: 'kimi-k2',
    name: 'MoonshotAI Kimi K2 0711',
    model: 'moonshotai/kimi-k2-0711:free',
    provider: 'openrouter',
    description: '1T params (32B activos), #1 LiveCodeBench/SWE-bench, uso avanzado de herramientas',
    contextTokens: 131072,
    specialties: ['coding', 'reasoning', 'tool-use', 'swe-bench'],
    useCase: ['agentic', 'tool-use', 'coding', 'reasoning'],
    speed: 'medium',
    quality: 'top-tier'
  },

  'qwen3-4b': {
    id: 'qwen3-4b',
    name: 'Qwen3 4B',
    model: 'qwen/qwen3-4b:free',
    provider: 'openrouter',
    description: '4B params, modo dual (thinking/no-thinking), chat multiturno eficiente',
    contextTokens: 40960,
    specialties: ['chat', 'fast', 'efficient', 'reasoning'],
    useCase: ['fast', 'default'],
    speed: 'ultra-fast',
    quality: 'good'
  },

  'gemma-3n-4b': {
    id: 'gemma-3n-4b',
    name: 'Google Gemma 3n 4B',
    model: 'google/gemma-3n-e4b-it:free',
    provider: 'openrouter',
    description: '4B efectivo, multimodal (texto/imagen/audio), optimizado para móviles',
    contextTokens: 32768,
    specialties: ['multimodal', 'mobile', 'efficient', 'audio'],
    useCase: ['multimodal', 'fast'],
    speed: 'ultra-fast',
    quality: 'good'
  },

  'gemma-3n-2b': {
    id: 'gemma-3n-2b',
    name: 'Google Gemma 3n 2B',
    model: 'google/gemma-3n-e2b-it:free',
    provider: 'openrouter',
    description: '2B efectivo (arch 6B), ultra-ligero, multimodal, offline-capable',
    contextTokens: 32768,
    specialties: ['multimodal', 'mobile', 'offline', 'lightweight'],
    useCase: ['fast'],
    speed: 'ultra-fast',
    quality: 'basic'
  },

  'deepseek-r1-0528': {
    id: 'deepseek-r1-0528',
    name: 'DeepSeek R1 0528',
    model: 'deepseek/deepseek-r1-0528:free',
    provider: 'openrouter',
    description: '671B params (37B activos), actualización mayo 2025, similar a OpenAI o1',
    contextTokens: 163840,
    specialties: ['reasoning', 'chain-of-thought', 'open-source'],
    useCase: ['reasoning'],
    speed: 'slow',
    quality: 'top-tier'
  },

  // ═══════════════════════════════════════════════════════════════════════
  // 📝 TIER C - MODELOS ESPECIALIZADOS
  // ═══════════════════════════════════════════════════════════════════════

  'gemma-3-27b': {
    id: 'gemma-3-27b',
    name: 'Gemma 3 27B',
    model: 'google/gemma-3-27b-it:free',
    provider: 'openrouter',
    description: 'Google, bueno para chat general',
    contextTokens: 8192,
    specialties: ['chat', 'general', 'safe'],
    useCase: ['default'],
    speed: 'fast',
    quality: 'good'
  },

  'gemma-3-12b': {
    id: 'gemma-3-12b',
    name: 'Gemma 3 12B',
    model: 'google/gemma-3-12b-it:free',
    provider: 'openrouter',
    description: 'Versión ligera de Gemma 3',
    contextTokens: 8192,
    specialties: ['chat', 'fast', 'lightweight'],
    useCase: ['fast', 'default'],
    speed: 'ultra-fast',
    quality: 'good'
  },

  'gemma-3-4b': {
    id: 'gemma-3-4b',
    name: 'Gemma 3 4B',
    model: 'google/gemma-3-4b-it:free',
    provider: 'openrouter',
    description: 'Ultra-ligero, muy rápido',
    contextTokens: 8192,
    specialties: ['chat', 'ultra-fast', 'lightweight'],
    useCase: ['fast'],
    speed: 'ultra-fast',
    quality: 'basic'
  },

  'llama-3.3-70b': {
    id: 'llama-3.3-70b',
    name: 'Llama 3.3 70B',
    model: 'meta-llama/llama-3.3-70b-instruct:free',
    provider: 'openrouter',
    description: '70B params, muy capaz, open-source',
    contextTokens: 131072,
    specialties: ['general', 'coding', 'reasoning'],
    useCase: ['default', 'coding'],
    speed: 'medium',
    quality: 'excellent'
  },

  'llama-3.1-8b': {
    id: 'llama-3.1-8b',
    name: 'Llama 3.1 8B',
    model: 'meta-llama/llama-3.1-8b-instruct:free',
    provider: 'openrouter',
    description: '8B params, ligero y rápido',
    contextTokens: 131072,
    specialties: ['fast', 'lightweight', 'general'],
    useCase: ['fast', 'default'],
    speed: 'ultra-fast',
    quality: 'good'
  },

  'llama-3.2-3b': {
    id: 'llama-3.2-3b',
    name: 'Llama 3.2 3B',
    model: 'meta-llama/llama-3.2-3b-instruct:free',
    provider: 'openrouter',
    description: '3B params, ultra-ligero',
    contextTokens: 131072,
    specialties: ['ultra-fast', 'lightweight'],
    useCase: ['fast'],
    speed: 'ultra-fast',
    quality: 'basic'
  },

  'llama-3.2-1b': {
    id: 'llama-3.2-1b',
    name: 'Llama 3.2 1B',
    model: 'meta-llama/llama-3.2-1b-instruct:free',
    provider: 'openrouter',
    description: '1B params, el más pequeño',
    contextTokens: 131072,
    specialties: ['ultra-fast', 'edge', 'mobile'],
    useCase: ['fast'],
    speed: 'ultra-fast',
    quality: 'basic'
  },

  'llama-3.2-11b-vision': {
    id: 'llama-3.2-11b-vision',
    name: 'Llama 3.2 11B Vision',
    model: 'meta-llama/llama-3.2-11b-vision-instruct:free',
    provider: 'openrouter',
    description: '11B params, visión incluida',
    contextTokens: 131072,
    specialties: ['vision', 'multimodal', 'images'],
    useCase: ['multimodal'],
    speed: 'fast',
    quality: 'good'
  },

  'llama-3.2-90b-vision': {
    id: 'llama-3.2-90b-vision',
    name: 'Llama 3.2 90B Vision',
    model: 'meta-llama/llama-3.2-90b-vision-instruct:free',
    provider: 'openrouter',
    description: '90B params, visión avanzada',
    contextTokens: 131072,
    specialties: ['vision', 'multimodal', 'detailed-analysis'],
    useCase: ['multimodal'],
    speed: 'medium',
    quality: 'excellent'
  },

  // ═══════════════════════════════════════════════════════════════════════
  // 🎭 TIER D - ROLEPLAY / CREATIVOS
  // ═══════════════════════════════════════════════════════════════════════

  'mythomax-l2-13b': {
    id: 'mythomax-l2-13b',
    name: 'MythoMax L2 13B',
    model: 'gryphe/mythomax-l2-13b:free',
    provider: 'openrouter',
    description: 'Excelente para roleplay y creatividad',
    contextTokens: 4096,
    specialties: ['roleplay', 'creative', 'storytelling'],
    useCase: ['roleplay'],
    speed: 'fast',
    quality: 'good'
  },

  'toppy-m-7b': {
    id: 'toppy-m-7b',
    name: 'Toppy M 7B',
    model: 'undi95/toppy-m-7b:free',
    provider: 'openrouter',
    description: 'Roleplay, sin censura',
    contextTokens: 32768,
    specialties: ['roleplay', 'uncensored', 'creative'],
    useCase: ['roleplay'],
    speed: 'ultra-fast',
    quality: 'good'
  },

  'zephyr-7b': {
    id: 'zephyr-7b',
    name: 'Zephyr 7B',
    model: 'huggingfaceh4/zephyr-7b-beta:free',
    provider: 'openrouter',
    description: 'Chat amigable, asistente',
    contextTokens: 4096,
    specialties: ['chat', 'helpful', 'assistant'],
    useCase: ['default'],
    speed: 'ultra-fast',
    quality: 'good'
  },

  'openchat-7b': {
    id: 'openchat-7b',
    name: 'OpenChat 3.5 7B',
    model: 'openchat/openchat-7b:free',
    provider: 'openrouter',
    description: 'Chat general, open-source',
    contextTokens: 8192,
    specialties: ['chat', 'general'],
    useCase: ['default'],
    speed: 'ultra-fast',
    quality: 'good'
  },

  'nous-hermes-2-mixtral': {
    id: 'nous-hermes-2-mixtral',
    name: 'Nous Hermes 2 Mixtral 8x7B',
    model: 'nousresearch/nous-hermes-2-mixtral-8x7b-dpo:free',
    provider: 'openrouter',
    description: 'MoE, versátil, DPO tuned',
    contextTokens: 32768,
    specialties: ['general', 'reasoning', 'instruction-following'],
    useCase: ['default', 'reasoning'],
    speed: 'fast',
    quality: 'good'
  },

  // ═══════════════════════════════════════════════════════════════════════
  // 🔬 TIER E - MODELOS DE INVESTIGACIÓN / ESPECIALES
  // ═══════════════════════════════════════════════════════════════════════

  'internlm-3-8b': {
    id: 'internlm-3-8b',
    name: 'InternLM 3 8B',
    model: 'internlm/internlm3-8b-instruct:free',
    provider: 'openrouter',
    description: 'Shanghai AI Lab, multilingüe',
    contextTokens: 32768,
    specialties: ['multilingual', 'chinese', 'general'],
    useCase: ['default'],
    speed: 'fast',
    quality: 'good'
  },

  'yi-lightning': {
    id: 'yi-lightning',
    name: 'Yi Lightning',
    model: '01-ai/yi-lightning:free',
    provider: 'openrouter',
    description: 'Yi, ultra-rápido',
    contextTokens: 16384,
    specialties: ['fast', 'chinese', 'general'],
    useCase: ['fast', 'default'],
    speed: 'ultra-fast',
    quality: 'good'
  },

  'moonshotai-moonlight': {
    id: 'moonshotai-moonlight',
    name: 'Moonlight 16B',
    model: 'moonshotai/moonlight-16b-a3b-instruct:free',
    provider: 'openrouter',
    description: 'MoE 16B activo, eficiente',
    contextTokens: 8192,
    specialties: ['efficient', 'general'],
    useCase: ['default', 'fast'],
    speed: 'fast',
    quality: 'good'
  },

  'nvidia-llama-nemotron': {
    id: 'nvidia-llama-nemotron',
    name: 'NVIDIA Llama 3.1 Nemotron 70B',
    model: 'nvidia/llama-3.1-nemotron-70b-instruct:free',
    provider: 'openrouter',
    description: 'NVIDIA optimizado, muy capaz',
    contextTokens: 131072,
    specialties: ['general', 'coding', 'reasoning'],
    useCase: ['default', 'coding', 'reasoning'],
    speed: 'medium',
    quality: 'excellent'
  },

  'qwq-32b': {
    id: 'qwq-32b',
    name: 'QwQ 32B',
    model: 'qwen/qwq-32b:free',
    provider: 'openrouter',
    description: 'Qwen para razonamiento, thinking',
    contextTokens: 40960,
    specialties: ['reasoning', 'thinking', 'chain-of-thought'],
    useCase: ['reasoning'],
    speed: 'medium',
    quality: 'excellent'
  },

  'olympiccoder-32b': {
    id: 'olympiccoder-32b',
    name: 'OlympicCoder 32B',
    model: 'open-r1/olympiccoder-32b:free',
    provider: 'openrouter',
    description: 'Especializado en competencias de código',
    contextTokens: 131072,
    specialties: ['coding', 'competitive-programming', 'algorithms'],
    useCase: ['coding'],
    speed: 'medium',
    quality: 'excellent'
  },

  'codestral-2501': {
    id: 'codestral-2501',
    name: 'Codestral 2501',
    model: 'mistralai/codestral-2501:free',
    provider: 'openrouter',
    description: 'Mistral para código, FIM support',
    contextTokens: 262144,
    specialties: ['coding', 'fill-in-middle', 'code-completion'],
    useCase: ['coding'],
    speed: 'fast',
    quality: 'excellent'
  },

  // ═══════════════════════════════════════════════════════════════════════
  // 🌐 TIER F - MODELOS CON WEB SEARCH
  // ═══════════════════════════════════════════════════════════════════════

  'grok-4.1-fast': {
    id: 'grok-4.1-fast',
    name: 'Grok 4.1 Fast',
    model: 'x-ai/grok-4.1-fast:free',
    provider: 'openrouter',
    description: '#1 OpenRouter, xAI Grok ultra-rápido, agente general',
    contextTokens: 131072,
    specialties: ['ultra-fast', 'general', 'reasoning', 'chat', 'research'],
    useCase: ['fast', 'default', 'research'],
    speed: 'ultra-fast',
    quality: 'top-tier'
  },

  'grok-4.1-mini': {
    id: 'grok-4.1-mini',
    name: 'Grok 4.1 Mini',
    model: 'x-ai/grok-4.1-mini:free',
    provider: 'openrouter',
    description: 'xAI Grok, web search integrado',
    contextTokens: 131072,
    specialties: ['web-search', 'current-events', 'research'],
    useCase: ['research', 'default'],
    speed: 'fast',
    quality: 'excellent'
  },

  'perplexity-sonar-small': {
    id: 'perplexity-sonar-small',
    name: 'Perplexity Sonar Small Online',
    model: 'perplexity/sonar-small-online:free',
    provider: 'openrouter',
    description: 'Perplexity, búsqueda web en tiempo real',
    contextTokens: 8192,
    specialties: ['web-search', 'current-events', 'citations'],
    useCase: ['research'],
    speed: 'fast',
    quality: 'good'
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// ⚡ GROQ - MODELOS ULTRA-RÁPIDOS (100% GRATIS, ILIMITADO)
// ═══════════════════════════════════════════════════════════════════════════

export const GROQ_FREE_MODELS: Record<string, AIModelConfig> = {
  'groq-llama-3.3-70b': {
    id: 'groq-llama-3.3-70b',
    name: 'Groq Llama 3.3 70B',
    model: 'llama-3.3-70b-versatile',
    provider: 'groq',
    description: '300+ tokens/seg, ultra-rápido, ilimitado',
    contextTokens: 32768,
    specialties: ['ultra-fast', 'general', 'coding', 'reasoning'],
    useCase: ['fast', 'default', 'coding'],
    speed: 'ultra-fast',
    quality: 'excellent'
  },

  'groq-llama-3.1-70b': {
    id: 'groq-llama-3.1-70b',
    name: 'Groq Llama 3.1 70B',
    model: 'llama-3.1-70b-versatile',
    provider: 'groq',
    description: 'Llama 3.1 en Groq, ultra-rápido',
    contextTokens: 32768,
    specialties: ['ultra-fast', 'general', 'versatile'],
    useCase: ['fast', 'default'],
    speed: 'ultra-fast',
    quality: 'excellent'
  },

  'groq-llama-3.1-8b': {
    id: 'groq-llama-3.1-8b',
    name: 'Groq Llama 3.1 8B Instant',
    model: 'llama-3.1-8b-instant',
    provider: 'groq',
    description: 'El más rápido, <50ms latencia',
    contextTokens: 8192,
    specialties: ['instant', 'ultra-fast', 'lightweight'],
    useCase: ['fast'],
    speed: 'ultra-fast',
    quality: 'good'
  },

  'groq-llama-guard-3-8b': {
    id: 'groq-llama-guard-3-8b',
    name: 'Groq Llama Guard 3 8B',
    model: 'llama-guard-3-8b',
    provider: 'groq',
    description: 'Moderación de contenido, safety',
    contextTokens: 8192,
    specialties: ['moderation', 'safety', 'content-filter'],
    useCase: ['default'],
    speed: 'ultra-fast',
    quality: 'good'
  },

  'groq-mixtral-8x7b': {
    id: 'groq-mixtral-8x7b',
    name: 'Groq Mixtral 8x7B',
    model: 'mixtral-8x7b-32768',
    provider: 'groq',
    description: 'MoE, 32K contexto, rápido',
    contextTokens: 32768,
    specialties: ['moe', 'general', 'fast'],
    useCase: ['default', 'fast'],
    speed: 'ultra-fast',
    quality: 'excellent'
  },

  'groq-gemma-2-9b': {
    id: 'groq-gemma-2-9b',
    name: 'Groq Gemma 2 9B',
    model: 'gemma2-9b-it',
    provider: 'groq',
    description: 'Google Gemma 2, rápido y eficiente',
    contextTokens: 8192,
    specialties: ['fast', 'efficient', 'chat'],
    useCase: ['fast', 'default'],
    speed: 'ultra-fast',
    quality: 'good'
  },

  'groq-deepseek-r1-distill': {
    id: 'groq-deepseek-r1-distill',
    name: 'Groq DeepSeek R1 Distill Llama 70B',
    model: 'deepseek-r1-distill-llama-70b',
    provider: 'groq',
    description: 'Razonamiento rápido en Groq',
    contextTokens: 32768,
    specialties: ['reasoning', 'ultra-fast', 'chain-of-thought'],
    useCase: ['reasoning', 'fast'],
    speed: 'ultra-fast',
    quality: 'excellent'
  },

  'groq-qwen-2.5-coder-32b': {
    id: 'groq-qwen-2.5-coder-32b',
    name: 'Groq Qwen 2.5 Coder 32B',
    model: 'qwen-2.5-coder-32b',
    provider: 'groq',
    description: 'Código ultra-rápido en Groq',
    contextTokens: 32768,
    specialties: ['coding', 'ultra-fast', 'debugging'],
    useCase: ['coding', 'fast'],
    speed: 'ultra-fast',
    quality: 'excellent'
  },

  'groq-qwen-2.5-32b': {
    id: 'groq-qwen-2.5-32b',
    name: 'Groq Qwen 2.5 32B',
    model: 'qwen-2.5-32b',
    provider: 'groq',
    description: 'Qwen general en Groq',
    contextTokens: 32768,
    specialties: ['general', 'ultra-fast', 'multilingual'],
    useCase: ['default', 'fast'],
    speed: 'ultra-fast',
    quality: 'excellent'
  },

  'groq-llama-3.3-70b-speculative': {
    id: 'groq-llama-3.3-70b-speculative',
    name: 'Groq Llama 3.3 70B Speculative',
    model: 'llama-3.3-70b-specdec',
    provider: 'groq',
    description: 'Decoding especulativo, aún más rápido',
    contextTokens: 8192,
    specialties: ['ultra-fast', 'speculative-decoding'],
    useCase: ['fast'],
    speed: 'ultra-fast',
    quality: 'excellent'
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// 🌈 GOOGLE AI STUDIO - MODELOS GRATUITOS
// ═══════════════════════════════════════════════════════════════════════════

export const GOOGLE_FREE_MODELS: Record<string, AIModelConfig> = {
  'google-gemini-2.0-flash': {
    id: 'google-gemini-2.0-flash',
    name: 'Gemini 2.0 Flash',
    model: 'gemini-2.0-flash',
    provider: 'google',
    description: 'Multimodal, rápido, 1M tokens',
    contextTokens: 1000000,
    specialties: ['multimodal', 'vision', 'fast', 'long-context'],
    useCase: ['multimodal', 'fast', 'long-context'],
    speed: 'fast',
    quality: 'excellent'
  },

  'google-gemini-2.0-flash-lite': {
    id: 'google-gemini-2.0-flash-lite',
    name: 'Gemini 2.0 Flash Lite',
    model: 'gemini-2.0-flash-lite',
    provider: 'google',
    description: 'Versión ligera, ultra-rápido',
    contextTokens: 1000000,
    specialties: ['ultra-fast', 'lightweight', 'multimodal'],
    useCase: ['fast'],
    speed: 'ultra-fast',
    quality: 'good'
  },

  'google-gemini-1.5-flash': {
    id: 'google-gemini-1.5-flash',
    name: 'Gemini 1.5 Flash',
    model: 'gemini-1.5-flash',
    provider: 'google',
    description: '1M tokens, multimodal estable',
    contextTokens: 1000000,
    specialties: ['long-context', 'multimodal', 'stable'],
    useCase: ['long-context', 'multimodal'],
    speed: 'fast',
    quality: 'excellent'
  },

  'google-gemini-1.5-flash-8b': {
    id: 'google-gemini-1.5-flash-8b',
    name: 'Gemini 1.5 Flash 8B',
    model: 'gemini-1.5-flash-8b',
    provider: 'google',
    description: 'Versión 8B, muy rápida',
    contextTokens: 1000000,
    specialties: ['fast', 'efficient', 'multimodal'],
    useCase: ['fast'],
    speed: 'ultra-fast',
    quality: 'good'
  },

  'google-gemini-1.5-pro': {
    id: 'google-gemini-1.5-pro',
    name: 'Gemini 1.5 Pro',
    model: 'gemini-1.5-pro',
    provider: 'google',
    description: 'El más capaz de Google AI Studio',
    contextTokens: 2000000,
    specialties: ['reasoning', 'multimodal', 'long-context', 'code'],
    useCase: ['reasoning', 'long-context', 'multimodal'],
    speed: 'medium',
    quality: 'top-tier'
  },

  'google-gemma-2-2b': {
    id: 'google-gemma-2-2b',
    name: 'Gemma 2 2B',
    model: 'gemma-2-2b-it',
    provider: 'google',
    description: 'Ultra-ligero, edge deployment',
    contextTokens: 8192,
    specialties: ['lightweight', 'edge', 'fast'],
    useCase: ['fast'],
    speed: 'ultra-fast',
    quality: 'basic'
  },

  'google-gemma-2-9b': {
    id: 'google-gemma-2-9b',
    name: 'Gemma 2 9B',
    model: 'gemma-2-9b-it',
    provider: 'google',
    description: 'Balance entre velocidad y calidad',
    contextTokens: 8192,
    specialties: ['balanced', 'general', 'efficient'],
    useCase: ['default', 'fast'],
    speed: 'fast',
    quality: 'good'
  },

  'google-gemma-2-27b': {
    id: 'google-gemma-2-27b',
    name: 'Gemma 2 27B',
    model: 'gemma-2-27b-it',
    provider: 'google',
    description: 'El más capaz de Gemma 2',
    contextTokens: 8192,
    specialties: ['general', 'reasoning', 'chat'],
    useCase: ['default', 'reasoning'],
    speed: 'medium',
    quality: 'excellent'
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// 🤗 HUGGING FACE - MODELOS INFERENCE API (GRATIS)
// ═══════════════════════════════════════════════════════════════════════════

export const HUGGINGFACE_FREE_MODELS: Record<string, AIModelConfig> = {
  'hf-meta-llama-3.1-70b': {
    id: 'hf-meta-llama-3.1-70b',
    name: 'HF Meta Llama 3.1 70B',
    model: 'meta-llama/Meta-Llama-3.1-70B-Instruct',
    provider: 'huggingface',
    description: 'Llama 3.1 70B en HuggingFace',
    contextTokens: 8192,
    specialties: ['general', 'coding', 'reasoning'],
    useCase: ['default', 'coding'],
    speed: 'medium',
    quality: 'excellent'
  },

  'hf-meta-llama-3.1-8b': {
    id: 'hf-meta-llama-3.1-8b',
    name: 'HF Meta Llama 3.1 8B',
    model: 'meta-llama/Meta-Llama-3.1-8B-Instruct',
    provider: 'huggingface',
    description: 'Llama 3.1 8B, ligero',
    contextTokens: 8192,
    specialties: ['fast', 'general', 'lightweight'],
    useCase: ['fast', 'default'],
    speed: 'fast',
    quality: 'good'
  },

  'hf-mistral-7b': {
    id: 'hf-mistral-7b',
    name: 'HF Mistral 7B v0.3',
    model: 'mistralai/Mistral-7B-Instruct-v0.3',
    provider: 'huggingface',
    description: 'Mistral 7B en HuggingFace',
    contextTokens: 32768,
    specialties: ['fast', 'general', 'efficient'],
    useCase: ['fast', 'default'],
    speed: 'fast',
    quality: 'good'
  },

  'hf-mixtral-8x7b': {
    id: 'hf-mixtral-8x7b',
    name: 'HF Mixtral 8x7B',
    model: 'mistralai/Mixtral-8x7B-Instruct-v0.1',
    provider: 'huggingface',
    description: 'MoE, muy capaz',
    contextTokens: 32768,
    specialties: ['moe', 'general', 'reasoning'],
    useCase: ['default', 'reasoning'],
    speed: 'medium',
    quality: 'excellent'
  },

  'hf-qwen-2.5-72b': {
    id: 'hf-qwen-2.5-72b',
    name: 'HF Qwen 2.5 72B',
    model: 'Qwen/Qwen2.5-72B-Instruct',
    provider: 'huggingface',
    description: 'Qwen 2.5 72B en HuggingFace',
    contextTokens: 32768,
    specialties: ['coding', 'multilingual', 'general'],
    useCase: ['default', 'coding'],
    speed: 'medium',
    quality: 'excellent'
  },

  'hf-qwen-2.5-coder-32b': {
    id: 'hf-qwen-2.5-coder-32b',
    name: 'HF Qwen 2.5 Coder 32B',
    model: 'Qwen/Qwen2.5-Coder-32B-Instruct',
    provider: 'huggingface',
    description: 'Especializado en código',
    contextTokens: 32768,
    specialties: ['coding', 'debugging', 'code-review'],
    useCase: ['coding'],
    speed: 'medium',
    quality: 'excellent'
  },

  'hf-codellama-34b': {
    id: 'hf-codellama-34b',
    name: 'HF Code Llama 34B',
    model: 'codellama/CodeLlama-34b-Instruct-hf',
    provider: 'huggingface',
    description: 'Meta Code Llama 34B',
    contextTokens: 16384,
    specialties: ['coding', 'code-generation', 'debugging'],
    useCase: ['coding'],
    speed: 'medium',
    quality: 'excellent'
  },

  'hf-starcoder2-15b': {
    id: 'hf-starcoder2-15b',
    name: 'HF StarCoder2 15B',
    model: 'bigcode/starcoder2-15b-instruct-v0.1',
    provider: 'huggingface',
    description: 'BigCode StarCoder2, 600+ lenguajes',
    contextTokens: 16384,
    specialties: ['coding', 'multi-language', 'code-completion'],
    useCase: ['coding'],
    speed: 'fast',
    quality: 'excellent'
  },

  'hf-phi-3-mini': {
    id: 'hf-phi-3-mini',
    name: 'HF Phi-3 Mini 4K',
    model: 'microsoft/Phi-3-mini-4k-instruct',
    provider: 'huggingface',
    description: 'Microsoft Phi-3, muy eficiente',
    contextTokens: 4096,
    specialties: ['efficient', 'reasoning', 'math'],
    useCase: ['reasoning', 'fast'],
    speed: 'ultra-fast',
    quality: 'good'
  },

  'hf-zephyr-7b': {
    id: 'hf-zephyr-7b',
    name: 'HF Zephyr 7B Beta',
    model: 'HuggingFaceH4/zephyr-7b-beta',
    provider: 'huggingface',
    description: 'Chat amigable, asistente',
    contextTokens: 4096,
    specialties: ['chat', 'helpful', 'assistant'],
    useCase: ['default'],
    speed: 'fast',
    quality: 'good'
  },

  // Modelos de imagen (Text-to-Image)
  'hf-stable-diffusion-3': {
    id: 'hf-stable-diffusion-3',
    name: 'HF Stable Diffusion 3',
    model: 'stabilityai/stable-diffusion-3-medium-diffusers',
    provider: 'huggingface',
    description: 'Generación de imágenes, alta calidad',
    contextTokens: 0,
    specialties: ['image-generation', 'text-to-image', 'art'],
    useCase: ['multimodal'],
    speed: 'slow',
    quality: 'top-tier'
  },

  'hf-flux-schnell': {
    id: 'hf-flux-schnell',
    name: 'HF FLUX.1 Schnell',
    model: 'black-forest-labs/FLUX.1-schnell',
    provider: 'huggingface',
    description: 'FLUX rápido, imágenes excelentes',
    contextTokens: 0,
    specialties: ['image-generation', 'text-to-image', 'fast'],
    useCase: ['multimodal'],
    speed: 'medium',
    quality: 'excellent'
  },

  // Modelos de audio (Speech-to-Text)
  'hf-whisper-large-v3': {
    id: 'hf-whisper-large-v3',
    name: 'HF Whisper Large V3',
    model: 'openai/whisper-large-v3',
    provider: 'huggingface',
    description: 'Transcripción de audio, 99+ idiomas',
    contextTokens: 0,
    specialties: ['speech-to-text', 'transcription', 'multilingual'],
    useCase: ['multimodal'],
    speed: 'medium',
    quality: 'top-tier'
  },

  'hf-whisper-large-v3-turbo': {
    id: 'hf-whisper-large-v3-turbo',
    name: 'HF Whisper Large V3 Turbo',
    model: 'openai/whisper-large-v3-turbo',
    provider: 'huggingface',
    description: 'Whisper rápido, misma calidad',
    contextTokens: 0,
    specialties: ['speech-to-text', 'transcription', 'fast'],
    useCase: ['multimodal'],
    speed: 'fast',
    quality: 'excellent'
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// 🎯 COMBINACIÓN DE TODOS LOS MODELOS GRATIS
// ═══════════════════════════════════════════════════════════════════════════

export const FREE_MODELS: Record<string, AIModelConfig> = {
  ...OPENROUTER_FREE_MODELS,
  ...GROQ_FREE_MODELS,
  ...GOOGLE_FREE_MODELS,
  ...HUGGINGFACE_FREE_MODELS
};

// ═══════════════════════════════════════════════════════════════════════════
// 🛠️ FUNCIONES HELPER
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Selecciona el mejor modelo según el caso de uso
 */
export function getModelForUseCase(useCase: AIModelType): AIModelConfig {
  switch (useCase) {
    case 'reasoning':
      return OPENROUTER_FREE_MODELS['deepseek-r1'];

    case 'agentic':
      return OPENROUTER_FREE_MODELS['qwen3-coder'];

    case 'tool-use':
      return OPENROUTER_FREE_MODELS['glm-4.5-thinking'];

    case 'multimodal':
      return OPENROUTER_FREE_MODELS['llama-4-maverick'];

    case 'long-context':
      return OPENROUTER_FREE_MODELS['gemini-2.5-pro'];

    case 'coding':
      return OPENROUTER_FREE_MODELS['qwen3-coder'];

    case 'fast':
      return OPENROUTER_FREE_MODELS['grok-4.1-fast']; // #1 OpenRouter

    case 'roleplay':
      return OPENROUTER_FREE_MODELS['mythomax-l2-13b'];

    case 'math':
      return OPENROUTER_FREE_MODELS['deepseek-prover'];

    case 'research':
      return OPENROUTER_FREE_MODELS['grok-4.1-mini'];

    default:
      return OPENROUTER_FREE_MODELS['grok-4.1-fast']; // #1 OpenRouter como default
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
 * Obtiene modelos por proveedor
 */
export function getModelsByProvider(provider: AIProvider): AIModelConfig[] {
  return Object.values(FREE_MODELS).filter(m => m.provider === provider);
}

/**
 * Obtiene modelos por caso de uso
 */
export function getModelsByUseCase(useCase: AIModelType): AIModelConfig[] {
  return Object.values(FREE_MODELS).filter(m => m.useCase.includes(useCase));
}

/**
 * Obtiene modelos por velocidad
 */
export function getFastModels(): AIModelConfig[] {
  return Object.values(FREE_MODELS).filter(m => m.speed === 'ultra-fast' || m.speed === 'fast');
}

/**
 * Obtiene modelos de alta calidad
 */
export function getTopTierModels(): AIModelConfig[] {
  return Object.values(FREE_MODELS).filter(m => m.quality === 'top-tier');
}

/**
 * Modelos recomendados para Fase 4
 */
export const PHASE_4_MODELS = {
  // Agenda Cognitiva: razonamiento sobre conflictos, optimización
  cognitiveCalendar: OPENROUTER_FREE_MODELS['deepseek-r1'],

  // Gestor de Tareas RICE-Z: análisis de prioridades, dependencias
  taskManager: OPENROUTER_FREE_MODELS['deepseek-r1'],

  // Flujos Cognitivos: agentes complejos, workflows
  workflows: OPENROUTER_FREE_MODELS['qwen3-coder'],

  // Function calling nativo
  toolUse: OPENROUTER_FREE_MODELS['glm-4.5-thinking'],

  // Contexto largo (documentos, historial)
  longContext: OPENROUTER_FREE_MODELS['gemini-2.5-pro'],

  // Ultra-rápido para respuestas inmediatas (#1 OpenRouter)
  instant: OPENROUTER_FREE_MODELS['grok-4.1-fast'],

  // Agente general rápido (alternativa a Claude/Gemini)
  generalAgent: OPENROUTER_FREE_MODELS['grok-4.1-fast'],

  // Código y debugging
  coding: OPENROUTER_FREE_MODELS['qwen3-coder'],

  // Investigación con búsqueda web
  research: OPENROUTER_FREE_MODELS['grok-4.1-mini'],

  // Multimodal completo
  multimodal: GOOGLE_FREE_MODELS['google-gemini-2.0-flash']
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

/**
 * Selecciona el mejor modelo automáticamente según el contexto
 */
export function autoSelectModel(options: {
  needsSpeed?: boolean;
  needsReasoning?: boolean;
  needsCoding?: boolean;
  needsMultimodal?: boolean;
  needsLongContext?: boolean;
  needsWebSearch?: boolean;
}): AIModelConfig {
  // Prioridad: velocidad > específico
  if (options.needsSpeed) {
    return OPENROUTER_FREE_MODELS['grok-4.1-fast']; // #1 OpenRouter
  }

  if (options.needsWebSearch) {
    return OPENROUTER_FREE_MODELS['grok-4.1-mini'];
  }

  if (options.needsReasoning) {
    return OPENROUTER_FREE_MODELS['deepseek-r1'];
  }

  if (options.needsCoding) {
    return OPENROUTER_FREE_MODELS['qwen3-coder'];
  }

  if (options.needsMultimodal) {
    return GOOGLE_FREE_MODELS['google-gemini-2.0-flash'];
  }

  if (options.needsLongContext) {
    return OPENROUTER_FREE_MODELS['gemini-2.5-pro'];
  }

  // Default: Grok 4.1 Fast - #1 en OpenRouter, balance velocidad/calidad
  return OPENROUTER_FREE_MODELS['grok-4.1-fast'];
}

/**
 * Obtiene estadísticas de los modelos
 */
export function getModelsStats() {
  const all = Object.values(FREE_MODELS);
  return {
    total: all.length,
    byProvider: {
      openrouter: all.filter(m => m.provider === 'openrouter').length,
      groq: all.filter(m => m.provider === 'groq').length,
      google: all.filter(m => m.provider === 'google').length,
      huggingface: all.filter(m => m.provider === 'huggingface').length
    },
    byQuality: {
      topTier: all.filter(m => m.quality === 'top-tier').length,
      excellent: all.filter(m => m.quality === 'excellent').length,
      good: all.filter(m => m.quality === 'good').length,
      basic: all.filter(m => m.quality === 'basic').length
    },
    bySpeed: {
      ultraFast: all.filter(m => m.speed === 'ultra-fast').length,
      fast: all.filter(m => m.speed === 'fast').length,
      medium: all.filter(m => m.speed === 'medium').length,
      slow: all.filter(m => m.speed === 'slow').length
    }
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// 📋 RESUMEN DE MODELOS DISPONIBLES
// ═══════════════════════════════════════════════════════════════════════════
//
// TOTAL: 70+ modelos 100% GRATIS
//
// 🏆 OPENROUTER (40+ modelos :free):
//   - DeepSeek R1 (671B) - Razonamiento nivel OpenAI o1
//   - Qwen3-Coder (480B) - #1 en código
//   - Gemini 2.5 Pro (1M tokens) - Contexto más largo
//   - Llama 4 Maverick (400B) - Multimodal avanzado
//   - GLM-4.5 Thinking - Tool-use nativo
//   - + 35 más...
//
// ⚡ GROQ (10 modelos ultra-rápidos):
//   - Llama 3.3 70B - 300+ tokens/seg
//   - DeepSeek R1 Distill - Razonamiento rápido
//   - Qwen 2.5 Coder 32B - Código ultra-rápido
//   - + 7 más...
//
// 🌈 GOOGLE AI STUDIO (8 modelos):
//   - Gemini 2.0 Flash - Multimodal rápido
//   - Gemini 1.5 Pro - 2M tokens contexto
//   - Gemma 2 familia - Modelos eficientes
//
// 🤗 HUGGING FACE (14+ modelos):
//   - Chat: Llama, Mistral, Qwen
//   - Código: CodeLlama, StarCoder2
//   - Imagen: Stable Diffusion 3, FLUX.1
//   - Audio: Whisper Large V3
//
// ═══════════════════════════════════════════════════════════════════════════

