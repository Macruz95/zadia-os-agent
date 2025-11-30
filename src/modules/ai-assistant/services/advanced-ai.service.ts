/**
 * ZADIA OS - Advanced AI Chat Service
 * 
 * Multi-model AI chat with:
 * - Best-in-class models (Grok 4.1, DeepSeek R1, Qwen3, Gemini 2.5)
 * - Function calling / Tool use
 * - Web search integration
 * - Multimodal support
 * - Full system context
 */

import {
  collection, getDocs, addDoc,
  query, where, orderBy, limit, Timestamp, serverTimestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { logger } from '@/lib/logger';
import { TOOL_DEFINITIONS, AgentToolsExecutor } from './agent-tools.service';
import type { Conversation, AIModel } from '../types';

// Available AI Models (sorted by priority - Grok 4.1 Fast first)
export const AI_MODELS: AIModel[] = [
  {
    id: 'grok-4.1-fast',
    name: 'Grok 4.1 Fast',
    provider: 'openrouter',
    description: '#1 OpenRouter. Ultra-rápido. Mejor balance velocidad/calidad.',
    capabilities: ['general', 'reasoning', 'coding', 'tool-use', 'fast'],
    contextWindow: 131072,
    isFree: true,
    speed: 'fast',
    quality: 'excellent',
  },
  {
    id: 'deepseek-r1',
    name: 'DeepSeek R1',
    provider: 'openrouter',
    description: 'Mejor razonamiento. Equivalente a OpenAI o1. 671B params.',
    capabilities: ['reasoning', 'analysis', 'chain-of-thought', 'problem-solving'],
    contextWindow: 163840,
    isFree: true,
    speed: 'medium',
    quality: 'excellent',
  },
  {
    id: 'qwen3-coder',
    name: 'Qwen3-Coder 480B',
    provider: 'openrouter',
    description: 'Mejor para agentes y código. Supera Claude 4 en SWE-Bench.',
    capabilities: ['coding', 'function-calling', 'tool-use', 'agents'],
    contextWindow: 262000,
    isFree: true,
    speed: 'medium',
    quality: 'excellent',
  },
  {
    id: 'gemini-2.5-pro',
    name: 'Gemini 2.5 Pro',
    provider: 'openrouter',
    description: 'Contexto de 1M tokens. #1 en benchmarks. Multimodal.',
    capabilities: ['long-context', 'multimodal', 'reasoning', 'vision'],
    contextWindow: 1000000,
    isFree: true,
    speed: 'medium',
    quality: 'excellent',
  },
  {
    id: 'gemini-2.5-flash',
    name: 'Gemini 2.5 Flash',
    provider: 'openrouter',
    description: 'Ultra rápido. 1M tokens contexto. Multimodal.',
    capabilities: ['fast', 'multimodal', 'general', 'vision'],
    contextWindow: 1000000,
    isFree: true,
    speed: 'fast',
    quality: 'excellent',
  },
  {
    id: 'glm-4.5-thinking',
    name: 'GLM-4.5 Thinking',
    provider: 'openrouter',
    description: 'Mejor function calling nativo. 355B params.',
    capabilities: ['function-calling', 'tool-use', 'workflows'],
    contextWindow: 128000,
    isFree: true,
    speed: 'fast',
    quality: 'excellent',
  },
  {
    id: 'llama-4-maverick',
    name: 'Llama 4 Maverick',
    provider: 'openrouter',
    description: 'Multimodal avanzado. 400B params. Visual reasoning.',
    capabilities: ['multimodal', 'vision', 'visual-reasoning'],
    contextWindow: 256000,
    isFree: true,
    speed: 'medium',
    quality: 'excellent',
  },
  {
    id: 'llama-4-scout',
    name: 'Llama 4 Scout',
    provider: 'openrouter',
    description: '512K tokens contexto. Ultra eficiente.',
    capabilities: ['long-context', 'general', 'summarization'],
    contextWindow: 512000,
    isFree: true,
    speed: 'fast',
    quality: 'excellent',
  },
  {
    id: 'grok-4.1-mini',
    name: 'Grok 4.1 Mini',
    provider: 'openrouter',
    description: 'Con búsqueda web integrada.',
    capabilities: ['web-search', 'general', 'fast'],
    contextWindow: 131072,
    isFree: true,
    speed: 'fast',
    quality: 'excellent',
  },
];

// Model ID to OpenRouter model string mapping
const MODEL_MAPPING: Record<string, string> = {
  'grok-4.1-fast': 'x-ai/grok-4.1-fast:free',
  'grok-4.1-mini': 'x-ai/grok-4.1-mini:free',
  'deepseek-r1': 'deepseek/deepseek-r1:free',
  'qwen3-coder': 'qwen/qwen3-coder:free',
  'gemini-2.5-pro': 'google/gemini-2.5-pro-exp-03-25:free',
  'gemini-2.5-flash': 'google/gemini-2.5-flash-preview-05-20:free',
  'glm-4.5-thinking': 'z-ai/glm-4.5-thinking:free',
  'llama-4-maverick': 'meta-llama/llama-4-maverick:free',
  'llama-4-scout': 'meta-llama/llama-4-scout:free',
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
 */
async function buildSystemContext(userId: string): Promise<string> {
  const context: Record<string, unknown> = {};

  try {
    // Get client stats
    const clientsQ = query(collection(db, 'clients'), where('userId', '==', userId), limit(100));
    const clientsSnap = await getDocs(clientsQ);
    context.totalClients = clientsSnap.size;

    // Get recent clients
    const recentClientsQ = query(
      collection(db, 'clients'), 
      where('userId', '==', userId), 
      orderBy('createdAt', 'desc'), 
      limit(5)
    );
    const recentClientsSnap = await getDocs(recentClientsQ);
    context.recentClients = recentClientsSnap.docs.map(d => ({
      id: d.id,
      name: d.data().name || d.data().companyName,
    }));

    // Get project stats
    const projectsQ = query(collection(db, 'projects'), where('userId', '==', userId), limit(100));
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
    const tasksQ = query(collection(db, 'tasks'), where('userId', '==', userId), limit(100));
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
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(50)
    );
    const invoicesSnap = await getDocs(invoicesQ);
    const invoices = invoicesSnap.docs.map(d => d.data());
    context.totalInvoices = invoices.length;
    context.totalRevenue = invoices.reduce((sum, inv) => sum + (inv.total || 0), 0);
    context.pendingInvoices = invoices.filter(i => i.status === 'pending' || i.status === 'sent').length;

    // Get expense stats
    const expensesQ = query(collection(db, 'expenses'), where('userId', '==', userId), limit(100));
    const expensesSnap = await getDocs(expensesQ);
    const expenses = expensesSnap.docs.map(d => d.data());
    context.totalExpenses = expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);

    // Get inventory stats
    const productsQ = query(collection(db, 'products'), where('userId', '==', userId), limit(100));
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
   */
  async chat(userId: string, request: ChatRequest): Promise<ChatResponse> {
    const { 
      messages, 
      modelId = 'deepseek-r1', 
      temperature = 0.7, 
      enableTools = true,
      mode = 'auto',
    } = request;

    // Build system context
    const contextData = await buildSystemContext(userId);
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
   */
  async processResponse(userId: string, content: string): Promise<{
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
          const executor = new AgentToolsExecutor(userId);
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
            const executor = new AgentToolsExecutor(userId);
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
            const executor = new AgentToolsExecutor(userId);
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
