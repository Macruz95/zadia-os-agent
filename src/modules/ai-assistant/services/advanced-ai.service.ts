/**
 * ZADIA OS - Advanced AI Chat Service
 * 
 * Multi-model AI chat with:
 * - Best-in-class FREE models (Qwen3, Gemini, Llama, DeepSeek)
 * - Function calling / Tool use
 * - Web search integration
 * - Multimodal support
 * - Full system context
 * 
 * Updated: December 2025 - Verified free models on OpenRouter
 */

import {
  collection, getDocs, addDoc,
  query, where, orderBy, limit, Timestamp, serverTimestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { logger } from '@/lib/logger';
import { TOOL_DEFINITIONS, AgentToolsExecutor } from './agent-tools.service';
import type { Conversation, AIModel } from '../types';

// Available AI Models (sorted by priority - VERIFIED FREE Early 2026)
export const AI_MODELS: AIModel[] = [
  {
    id: 'gpt-oss-120b',
    name: 'OpenAI GPT-OSS-120B',
    provider: 'openrouter',
    description: '🥇 El primer modelo abierto de OpenAI (MoE 117B). Nivel de razonamiento profundo y agentes autónomos.',
    capabilities: ['reasoning', 'coding', 'function-calling', 'agents', 'tool-use'],
    contextWindow: 131072,
    isFree: true,
    speed: 'fast',
    quality: 'excellent',
  },
  {
    id: 'qwen3-vl-30b',
    name: 'Qwen3-VL 30B Thinking',
    provider: 'openrouter',
    description: '👁️ Multimodal nativo Top 1. Excelente entendimiento de imagen/video y razonamiento STEM/lógico.',
    capabilities: ['multimodal', 'vision', 'reasoning', 'documents', 'ocr'],
    contextWindow: 32768,
    isFree: true,
    speed: 'medium',
    quality: 'excellent',
  },
  {
    id: 'solar-pro-3',
    name: 'Upstage Solar Pro 3',
    provider: 'openrouter',
    description: '🧠 MoE masivo de 102B. Altamente cualificado para lógica, matemáticas e idiomas (temporalmente gratis).',
    capabilities: ['reasoning', 'general', 'fast'],
    contextWindow: 128000,
    isFree: true,
    speed: 'fast',
    quality: 'excellent',
  },
  {
    id: 'devstral-2',
    name: 'Mistral Devstral 2',
    provider: 'openrouter',
    description: '💻 #1 en programación (SWE-Bench) open-source. Maneja proyectos multiarchivo masivos.',
    capabilities: ['coding', 'agents', 'tool-use', 'general'],
    contextWindow: 262000,
    isFree: true,
    speed: 'medium',
    quality: 'excellent',
  },
  {
    id: 'gemini-2.5-pro',
    name: 'Gemini 2.5 Pro',
    provider: 'openrouter',
    description: '📚 Contexto colosal (1 Millón de tokens). Ideal para analizar docenas de PDFs o historiales inmensos.',
    capabilities: ['long-context', 'multimodal', 'research', 'general', 'vision'],
    contextWindow: 1000000,
    isFree: true,
    speed: 'fast',
    quality: 'excellent',
  },
  {
    id: 'groq-llama-3.3-70b',
    name: 'Groq Llama 3.3 70B',
    provider: 'groq',
    description: '⚡ Velocidad LPU instantánea. Ideal para respuestas de chat generales e inmediatas.',
    capabilities: ['fast', 'general', 'coding'],
    contextWindow: 32768,
    isFree: true,
    speed: 'fast',
    quality: 'excellent',
  },
  {
    id: 'tng-r1t-chimera',
    name: 'TNG R1T Chimera',
    provider: 'openrouter',
    description: '🎭 Fusión DeepSeek R1 creativa. Destaca en personalidad y chain-of-thought equilibrado.',
    capabilities: ['reasoning', 'creative', 'roleplay', 'tool-use'],
    contextWindow: 164000,
    isFree: true,
    speed: 'medium',
    quality: 'excellent',
  },
  {
    id: 'nemotron-3-nano-30b',
    name: 'Nemotron Nano 30B',
    provider: 'openrouter',
    description: '🤖 Optimizado por NVIDIA. Altísima eficiencia para sistemas de agentes y herramientas rápidas.',
    capabilities: ['agents', 'tool-use', 'fast', 'logic'],
    contextWindow: 262144,
    isFree: true,
    speed: 'fast',
    quality: 'good',
  }
];

// Model ID to OpenRouter/Groq model string mapping (VERIFIED FREE Early 2026)
const MODEL_MAPPING: Record<string, string> = {
  'gpt-oss-120b': 'openai/gpt-oss-120b:free', // OpenAI MoE open-weights model
  'qwen3-vl-30b': 'qwen/qwen3-vl-30b-a3b-thinking:free', // Multimodal reasoning
  'solar-pro-3': 'upstage/solar-pro-3:free', // Upstage MoE
  'devstral-2': 'mistralai/devstral-2-2512:free', // Best for coding
  'gemini-2.5-pro': 'google/gemini-2.5-pro-exp-03-25:free', // 1M context multimodal
  'groq-llama-3.3-70b': 'llama-3.3-70b-versatile', // Groq uses different format
  'tng-r1t-chimera': 'tngtech/tng-r1t-chimera:free', // Deepseek R1 fusion
  'nemotron-3-nano-30b': 'nvidia/nemotron-3-nano-30b-a3b:free', // Efficient agentic
};

interface ChatRequest {
  messages: Array<{ role: string; content: string }>;
  modelId?: string;
  temperature?: number;
  enableTools?: boolean;
  enableWebSearch?: boolean;
  mode?: 'auto' | 'manual';
}

interface ChatResponse {
  content: string;
  model: string;
  modelId?: string;
  modelName?: string;
  provider?: string;
  tokensUsed?: number;
  toolCalls?: Array<{ name: string; arguments: Record<string, unknown> }>;
  webSearchUsed?: boolean;
  routingReason?: string;
}

/**
 * Build comprehensive system context from all ZADIA modules
 * Uses tenantId for data isolation between accounts
 */
async function buildSystemContext(tenantId: string): Promise<string> {
  const context: Record<string, unknown> = {};

  try {
    // Get client stats
    const clientsQ = query(collection(db, 'clients'), where('tenantId', '==', tenantId), limit(100));
    const clientsSnap = await getDocs(clientsQ);
    context.totalClients = clientsSnap.size;

    // Get recent clients
    const recentClientsQ = query(
      collection(db, 'clients'),
      where('tenantId', '==', tenantId),
      orderBy('createdAt', 'desc'),
      limit(5)
    );
    const recentClientsSnap = await getDocs(recentClientsQ);
    context.recentClients = recentClientsSnap.docs.map(d => ({
      id: d.id,
      name: d.data().name || d.data().companyName,
    }));

    // Get project stats
    const projectsQ = query(collection(db, 'projects'), where('tenantId', '==', tenantId), limit(100));
    const projectsSnap = await getDocs(projectsQ);
    interface ProjectData { id: string; name?: string; status?: string; }
    const projects: ProjectData[] = projectsSnap.docs.map(d => ({ id: d.id, ...d.data() as Omit<ProjectData, 'id'> }));
    context.totalProjects = projects.length;
    context.activeProjects = projects.filter(p => p.status === 'in_progress' || p.status === 'active').length;
    context.recentProjects = projects.slice(0, 5).map(p => ({
      id: p.id,
      name: p.name,
      status: p.status,
    }));

    // Get task stats
    const tasksQ = query(collection(db, 'tasks'), where('tenantId', '==', tenantId), limit(100));
    const tasksSnap = await getDocs(tasksQ);
    const tasks = tasksSnap.docs.map(d => d.data());
    context.totalTasks = tasks.length;
    context.pendingTasks = tasks.filter(t => t.status === 'pending').length;
    context.overdueTasks = tasks.filter(t => {
      if (!t.dueDate) return false;
      return t.dueDate.toDate() < new Date() && t.status !== 'completed';
    }).length;

    // Get invoice stats
    const invoicesQ = query(
      collection(db, 'invoices'),
      where('tenantId', '==', tenantId),
      orderBy('createdAt', 'desc'),
      limit(50)
    );
    const invoicesSnap = await getDocs(invoicesQ);
    const invoices = invoicesSnap.docs.map(d => d.data());
    context.totalInvoices = invoices.length;
    context.totalRevenue = invoices.reduce((sum, inv) => sum + (inv.total || 0), 0);
    context.pendingInvoices = invoices.filter(i => i.status === 'pending' || i.status === 'sent').length;

    // Get expense stats
    const expensesQ = query(collection(db, 'expenses'), where('tenantId', '==', tenantId), limit(100));
    const expensesSnap = await getDocs(expensesQ);
    const expenses = expensesSnap.docs.map(d => d.data());
    context.totalExpenses = expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);

    // Get inventory stats
    const productsQ = query(collection(db, 'products'), where('tenantId', '==', tenantId), limit(100));
    const productsSnap = await getDocs(productsQ);
    const products = productsSnap.docs.map(d => d.data());
    context.totalProducts = products.length;
    context.lowStockProducts = products.filter(p => (p.stock || 0) < (p.minStock || 10)).length;

  } catch (error) {
    logger.warn('Error building system context', {
      component: 'AdvancedAIService',
      metadata: { error: String(error) }
    });
  }

  return JSON.stringify(context, null, 2);
}

/**
 * Generate the master system prompt
 */
function generateSystemPrompt(context: string): string {
  return `Eres ZADIA, el asistente de inteligencia artificial del sistema empresarial ZADIA OS.

TU IDENTIDAD
• Nombre: ZADIA (Zonal Artificial Digital Intelligence Agent)
• Rol: Agente de IA empresarial de alto rendimiento
• Capacidades: Razonamiento profundo, ejecución de acciones, búsqueda web, análisis de datos

CONTEXTO DEL NEGOCIO (DATOS EN TIEMPO REAL)
${context}

TUS CAPACIDADES

🧠 RAZONAMIENTO
• Análisis profundo de problemas empresariales
• Recomendaciones basadas en datos reales del sistema
• Predicciones y tendencias

🛠️ HERRAMIENTAS DISPONIBLES
Puedes ejecutar las siguientes acciones:
${TOOL_DEFINITIONS.map(t => `• ${t.name}: ${t.description}`).join('\n')}

📊 ANÁLISIS DE DATOS (analyze_data)
Para analizar datos, usa EXACTAMENTE estos valores:
• dataType: "sales" | "expenses" | "projects" | "clients" | "inventory"
• period: "today" | "week" | "month" | "quarter" | "year"

Ejemplo correcto:
{"tool": "analyze_data", "parameters": {"dataType": "sales", "period": "month"}}

🔍 BÚSQUEDA WEB
• Puedo buscar información actualizada en internet
• Verificar datos y noticias recientes
• Contrastar información de múltiples fuentes

CÓMO EJECUTAR ACCIONES

Cuando necesites ejecutar una herramienta:
1. Simplemente incluye el JSON de la herramienta
2. El sistema lo ejecutará automáticamente
3. NO expliques el JSON al usuario, solo ejecútalo
4. DESPUÉS de ejecutar, da una respuesta natural con los resultados

Formato para ejecutar herramientas (INTERNO - no mostrar al usuario):
\`\`\`json
{"tool": "nombre_herramienta", "parameters": {...}}
\`\`\`

IMPORTANTE: Cuando ejecutes una herramienta, NO digas "voy a ejecutar..." ni muestres el JSON. 
Solo ejecuta y luego responde naturalmente con los resultados.

INSTRUCCIONES DE FORMATO (MUY IMPORTANTE)

1. NUNCA uses asteriscos (*) para negritas ni cursivas
2. NUNCA uses markdown como ** o __ o # 
3. Usa bullets con • en lugar de - o *
4. Para énfasis usa MAYÚSCULAS o emojis
5. Formatea datos en líneas limpias sin decoración markdown
6. Sé profesional y directo

EJEMPLO DE RESPUESTA CORRECTA:
📊 Análisis de Ventas (período: mes)

Total Facturado: $45,000
Facturas Pagadas: 12
Facturas Pendientes: 3
Monto Pendiente: $8,500

Top 5 Clientes:
1. Empresa ABC → $15,000
2. Cliente XYZ → $12,000
3. Negocio 123 → $8,000

EJEMPLO INCORRECTO (NO HAGAS ESTO):
"**Análisis de Ventas** (período: mes)
- **Total Facturado**: $45,000"

Eso está MAL porque usa asteriscos.

INSTRUCCIONES GENERALES
1. Sé proactivo: Sugiere acciones cuando sea apropiado
2. Usa datos reales: Basa tus respuestas en el contexto del sistema
3. Ejecuta herramientas: Cuando el usuario lo solicite o sea claramente útil
4. Busca en web: Para información actualizada o externa al sistema
5. Sé conciso: Respuestas claras y actionables
6. Usa español: Siempre en español profesional con emojis ocasionales

MODELO DE RESPUESTA
• Si es una pregunta simple: Responde directamente
• Si requiere acción: Explica brevemente y ejecuta la herramienta
• Si necesitas más info: Pregunta lo necesario
• Si hay error: Explica qué salió mal y cómo resolverlo

¡Estoy listo para potenciar tu negocio! 🚀`;
}

/**
 * Advanced AI Chat Service
 */
export const AdvancedAIService = {
  /**
   * Send message to AI with full capabilities
   * Supports auto (intelligent) and manual model selection
   * @param tenantId - Tenant ID for data isolation
   */
  async chat(tenantId: string, request: ChatRequest): Promise<ChatResponse> {
    const {
      messages,
      modelId = 'deepseek-r1',
      temperature = 0.7,
      enableTools = true,
      mode = 'auto',
    } = request;

    // Build system context with tenant isolation
    const contextData = await buildSystemContext(tenantId);
    const systemPrompt = generateSystemPrompt(contextData);

    // Prepare messages array
    const aiMessages = [
      { role: 'system', content: systemPrompt },
      ...messages,
    ];

    // Get model string for manual mode
    const manualModel = MODEL_MAPPING[modelId] || MODEL_MAPPING['deepseek-r1'];

    // Call API with mode parameter
    const response = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: aiMessages,
        model: manualModel,
        modelId: mode === 'manual' ? modelId : undefined,
        temperature,
        enableTools,
        mode, // Pass mode to API route for intelligent routing
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error en la comunicación con IA');
    }

    const data = await response.json();

    return {
      content: data.content,
      model: data.modelUsed || manualModel,
      modelId: data.modelId,
      modelName: data.modelName,
      provider: data.provider,
      tokensUsed: data.tokensUsed,
      routingReason: data.routingReason,
    };
  },

  /**
   * Process AI response and execute any tools
   * @param tenantId - Tenant ID for data isolation
   */
  async processResponse(tenantId: string, content: string): Promise<{
    content: string;
    toolResults: Array<{ tool: string; result: unknown }>;
  }> {
    const toolResults: Array<{ tool: string; result: unknown }> = [];
    let processedContent = content;

    // Method 1: Extract tool calls from code blocks ```json ... ```
    const codeBlockRegex = /```(?:json)?\s*([\s\S]*?)```/gi;
    let match;

    while ((match = codeBlockRegex.exec(content)) !== null) {
      try {
        const toolCall = JSON.parse(match[1].trim());

        if (toolCall.tool && typeof toolCall.tool === 'string') {
          const executor = new AgentToolsExecutor(tenantId);
          const result = await executor.execute(toolCall.tool, toolCall.parameters || {});

          toolResults.push({
            tool: toolCall.tool,
            result,
          });

          // Replace the JSON block with the result message
          if (result.success) {
            processedContent = processedContent.replace(match[0], result.message);
          } else {
            processedContent = processedContent.replace(match[0], `⚠️ ${result.message}`);
          }
        }
      } catch {
        // Not a valid tool call JSON, ignore
      }
    }

    // Method 2: Try to parse the entire content as JSON (for direct JSON responses)
    if (toolResults.length === 0) {
      try {
        // Check if content looks like a JSON object with tool property
        const trimmedContent = content.trim();
        if (trimmedContent.startsWith('{') && trimmedContent.includes('"tool"')) {
          const toolCall = JSON.parse(trimmedContent);

          if (toolCall.tool && typeof toolCall.tool === 'string') {
            const executor = new AgentToolsExecutor(tenantId);
            const result = await executor.execute(toolCall.tool, toolCall.parameters || {});

            toolResults.push({
              tool: toolCall.tool,
              result,
            });

            // Replace entire content with the result
            if (result.success) {
              processedContent = result.message;
            } else {
              processedContent = `⚠️ ${result.message}`;
            }
          }
        }
      } catch {
        // Not a valid JSON, keep original content
      }
    }

    // Method 3: Look for inline JSON objects with tool property
    if (toolResults.length === 0) {
      const inlineJsonRegex = /\{[^{}]*"tool"\s*:\s*"[^"]+"\s*[^{}]*(?:\{[^{}]*\}[^{}]*)?\}/g;
      let inlineMatch;

      while ((inlineMatch = inlineJsonRegex.exec(content)) !== null) {
        try {
          const toolCall = JSON.parse(inlineMatch[0]);

          if (toolCall.tool && typeof toolCall.tool === 'string') {
            const executor = new AgentToolsExecutor(tenantId);
            const result = await executor.execute(toolCall.tool, toolCall.parameters || {});

            toolResults.push({
              tool: toolCall.tool,
              result,
            });

            if (result.success) {
              processedContent = processedContent.replace(inlineMatch[0], result.message);
            } else {
              processedContent = processedContent.replace(inlineMatch[0], `⚠️ ${result.message}`);
            }
          }
        } catch {
          // Not a valid tool call JSON
        }
      }
    }

    // Clean up: remove any remaining raw JSON artifacts
    processedContent = processedContent
      .replace(/^\s*```json\s*/gm, '')
      .replace(/^\s*```\s*/gm, '')
      .trim();

    return {
      content: processedContent,
      toolResults,
    };
  },

  /**
   * Save conversation to Firestore
   */
  async saveConversation(conversation: Omit<Conversation, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const docData = {
      ...conversation,
      messages: conversation.messages.map(m => ({
        ...m,
        timestamp: Timestamp.fromDate(m.timestamp),
      })),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, 'ai-conversations'), docData);
    return docRef.id;
  },

  /**
   * Get available models
   */
  getAvailableModels(): AIModel[] {
    return AI_MODELS;
  },

  /**
   * Get model by ID
   */
  getModelById(id: string): AIModel | undefined {
    return AI_MODELS.find(m => m.id === id);
  },
};
