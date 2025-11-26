/**
 * ZADIA OS - Advanced AI Chat Service
 * 
 * Multi-model AI chat with:
 * - Best-in-class models (DeepSeek R1, Qwen3, Gemini 2.5)
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

// Available AI Models (sorted by capability)
export const AI_MODELS: AIModel[] = [
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
];

// Model ID to OpenRouter model string mapping
const MODEL_MAPPING: Record<string, string> = {
  'deepseek-r1': 'deepseek/deepseek-r1:free',
  'qwen3-coder': 'qwen/qwen3-coder:free',
  'gemini-2.5-pro': 'google/gemini-2.5-pro-exp-03-25:free',
  'glm-4.5-thinking': 'z-ai/glm-4.5-thinking:free',
  'llama-4-maverick': 'meta-llama/llama-4-maverick:free',
};

interface ChatRequest {
  messages: Array<{ role: string; content: string }>;
  modelId?: string;
  temperature?: number;
  enableTools?: boolean;
  enableWebSearch?: boolean;
}

interface ChatResponse {
  content: string;
  model: string;
  tokensUsed?: number;
  toolCalls?: Array<{ name: string; arguments: Record<string, unknown> }>;
  webSearchUsed?: boolean;
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
  return `Eres **ZADIA**, el asistente de inteligencia artificial más avanzado del sistema empresarial ZADIA OS.

## TU IDENTIDAD
- Nombre: ZADIA (Zonal Artificial Digital Intelligence Agent)
- Rol: Agente de IA empresarial de alto rendimiento
- Capacidades: Razonamiento profundo, ejecución de acciones, búsqueda web, análisis de datos

## CONTEXTO DEL NEGOCIO (DATOS EN TIEMPO REAL)
${context}

## TUS CAPACIDADES

### 🧠 RAZONAMIENTO
- Análisis profundo de problemas empresariales
- Recomendaciones basadas en datos reales del sistema
- Predicciones y tendencias

### 🛠️ HERRAMIENTAS DISPONIBLES
Puedes ejecutar las siguientes acciones:
${TOOL_DEFINITIONS.map(t => `- **${t.name}**: ${t.description}`).join('\n')}

### 🔍 BÚSQUEDA WEB
- Puedo buscar información actualizada en internet
- Verificar datos y noticias recientes
- Contrastar información de múltiples fuentes

### 📊 ANÁLISIS DE DATOS
- Acceso a todos los módulos: CRM, Ventas, Proyectos, Inventario, Finanzas
- Métricas y KPIs en tiempo real
- Reportes y comparativas

## CÓMO EJECUTAR ACCIONES

Cuando necesites ejecutar una herramienta, responde con un bloque JSON:

\`\`\`json
{
  "tool": "nombre_herramienta",
  "parameters": { ... },
  "reason": "Por qué esta acción es útil"
}
\`\`\`

Ejemplos:
- Crear tarea: \`{"tool": "create_task", "parameters": {"title": "Revisar propuesta", "priority": "high"}}\`
- Agendar reunión: \`{"tool": "schedule_meeting", "parameters": {"title": "Call con cliente", "startTime": "2025-01-15T10:00:00"}}\`
- Buscar en web: \`{"tool": "search_web", "parameters": {"query": "tendencias ecommerce 2025"}}\`

## INSTRUCCIONES

1. **Sé proactivo**: Sugiere acciones cuando sea apropiado
2. **Usa datos reales**: Basa tus respuestas en el contexto del sistema
3. **Ejecuta herramientas**: Cuando el usuario lo solicite o sea claramente útil
4. **Busca en web**: Para información actualizada o externa al sistema
5. **Sé conciso**: Respuestas claras y actionables
6. **Usa español**: Siempre en español profesional con emojis ocasionales

## MODELO DE RESPUESTA
- Si es una pregunta simple: Responde directamente
- Si requiere acción: Explica brevemente y ejecuta la herramienta
- Si necesitas más info: Pregunta lo necesario
- Si hay error: Explica qué salió mal y cómo resolverlo

¡Estoy listo para potenciar tu negocio! 🚀`;
}

/**
 * Advanced AI Chat Service
 */
export const AdvancedAIService = {
  /**
   * Send message to AI with full capabilities
   */
  async chat(userId: string, request: ChatRequest): Promise<ChatResponse> {
    const { messages, modelId = 'deepseek-r1', temperature = 0.7, enableTools = true } = request;

    // Build system context
    const contextData = await buildSystemContext(userId);
    const systemPrompt = generateSystemPrompt(contextData);

    // Prepare messages array
    const aiMessages = [
      { role: 'system', content: systemPrompt },
      ...messages,
    ];

    // Get model string
    const model = MODEL_MAPPING[modelId] || MODEL_MAPPING['deepseek-r1'];

    // Call API
    const response = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: aiMessages,
        model,
        temperature,
        enableTools,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error en la comunicación con IA');
    }

    const data = await response.json();

    return {
      content: data.content,
      model: data.modelUsed || model,
      tokensUsed: data.tokensUsed,
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

    // Extract tool calls from response
    const toolRegex = /```json\s*([\s\S]*?)```/gi;
    let match;

    while ((match = toolRegex.exec(content)) !== null) {
      try {
        const toolCall = JSON.parse(match[1]);
        
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
      } catch (error) {
        logger.warn('Failed to parse tool call', {
          component: 'AdvancedAIService',
          metadata: { error: String(error), match: match[1] }
        });
      }
    }

    return {
      content: processedContent.trim(),
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
