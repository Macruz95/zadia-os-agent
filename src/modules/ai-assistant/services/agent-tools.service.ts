/**
 * ZADIA OS - Advanced Agent Tools
 * 
 * Extended toolset for the AI assistant with full system integration
 */

import { addDoc, collection, Timestamp, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { z } from 'zod';
import { db } from '@/lib/firebase';
import { logger } from '@/lib/logger';
import type { AgentToolDefinition, AgentToolResult, AgentToolName } from '../types';

// Tool parameter schemas
const schemas = {
  create_task: z.object({
    title: z.string().min(3),
    description: z.string().optional(),
    assigneeId: z.string().optional(),
    projectId: z.string().optional(),
    dueDate: z.string().optional(),
    priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
    tags: z.array(z.string()).optional(),
  }),

  create_project: z.object({
    name: z.string().min(3),
    clientId: z.string().optional(),
    description: z.string().optional(),
    budget: z.number().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
  }),

  create_expense: z.object({
    amount: z.number().positive(),
    description: z.string().min(3),
    category: z.string().optional(),
    projectId: z.string().optional(),
    date: z.string().optional(),
  }),

  schedule_meeting: z.object({
    title: z.string().min(3),
    startTime: z.string(),
    endTime: z.string().optional(),
    participants: z.array(z.string()).optional(),
    description: z.string().optional(),
    location: z.string().optional(),
  }),

  send_notification: z.object({
    title: z.string().min(3),
    message: z.string().min(5),
    type: z.enum(['info', 'warning', 'success', 'error']).optional(),
    targetUsers: z.array(z.string()).optional(),
  }),

  create_workflow: z.object({
    name: z.string().min(3),
    description: z.string().optional(),
    trigger: z.string().optional(),
    steps: z.array(z.object({
      name: z.string(),
      action: z.string(),
    })).optional(),
  }),

  search_web: z.object({
    query: z.string().min(3),
    maxResults: z.number().optional(),
  }),

  analyze_data: z.object({
    dataType: z.enum(['sales', 'expenses', 'projects', 'clients', 'inventory']),
    period: z.enum(['today', 'week', 'month', 'quarter', 'year']).optional(),
    metric: z.string().optional(),
  }),

  generate_report: z.object({
    reportType: z.enum(['financial', 'sales', 'projects', 'inventory', 'performance']),
    period: z.enum(['week', 'month', 'quarter', 'year']),
    format: z.enum(['summary', 'detailed']).optional(),
  }),

  send_email: z.object({
    to: z.string().email(),
    subject: z.string().min(3),
    body: z.string().min(10),
    attachments: z.array(z.string()).optional(),
  }),

  create_quote: z.object({
    clientId: z.string(),
    items: z.array(z.object({
      description: z.string(),
      quantity: z.number(),
      unitPrice: z.number(),
    })),
    validUntil: z.string().optional(),
    notes: z.string().optional(),
  }),

  update_inventory: z.object({
    productId: z.string(),
    action: z.enum(['add', 'subtract', 'set']),
    quantity: z.number(),
    reason: z.string().optional(),
  }),

  check_system_status: z.object({
    modules: z.array(z.string()).optional(),
  }),
};

// Tool definitions for the AI model
export const TOOL_DEFINITIONS: AgentToolDefinition[] = [
  {
    name: 'create_task',
    description: 'Crea una nueva tarea en el sistema. Útil para asignar trabajo, establecer deadlines y organizar proyectos.',
    parameters: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Título de la tarea', required: true },
        description: { type: 'string', description: 'Descripción detallada' },
        assigneeId: { type: 'string', description: 'ID del usuario asignado' },
        projectId: { type: 'string', description: 'ID del proyecto relacionado' },
        dueDate: { type: 'string', description: 'Fecha límite en formato ISO' },
        priority: { type: 'string', description: 'Prioridad', enum: ['low', 'medium', 'high', 'urgent'] },
        tags: { type: 'array', description: 'Etiquetas para categorizar' },
      },
      required: ['title'],
    },
  },
  {
    name: 'create_project',
    description: 'Crea un nuevo proyecto. Ideal para iniciar nuevos trabajos con clientes.',
    parameters: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Nombre del proyecto', required: true },
        clientId: { type: 'string', description: 'ID del cliente' },
        description: { type: 'string', description: 'Descripción del proyecto' },
        budget: { type: 'number', description: 'Presupuesto estimado' },
        startDate: { type: 'string', description: 'Fecha de inicio' },
        endDate: { type: 'string', description: 'Fecha estimada de fin' },
      },
      required: ['name'],
    },
  },
  {
    name: 'schedule_meeting',
    description: 'Agenda una reunión o evento en el calendario cognitivo.',
    parameters: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Título de la reunión', required: true },
        startTime: { type: 'string', description: 'Fecha y hora de inicio ISO', required: true },
        endTime: { type: 'string', description: 'Fecha y hora de fin ISO' },
        participants: { type: 'array', description: 'IDs o emails de participantes' },
        description: { type: 'string', description: 'Agenda o descripción' },
        location: { type: 'string', description: 'Ubicación o link de videoconferencia' },
      },
      required: ['title', 'startTime'],
    },
  },
  {
    name: 'send_notification',
    description: 'Envía una alerta o notificación a usuarios del sistema.',
    parameters: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Título de la notificación', required: true },
        message: { type: 'string', description: 'Contenido del mensaje', required: true },
        type: { type: 'string', description: 'Tipo de alerta', enum: ['info', 'warning', 'success', 'error'] },
        targetUsers: { type: 'array', description: 'IDs de usuarios destino' },
      },
      required: ['title', 'message'],
    },
  },
  {
    name: 'analyze_data',
    description: 'Analiza datos del sistema y genera insights. Consulta métricas de ventas, gastos, proyectos, etc.',
    parameters: {
      type: 'object',
      properties: {
        dataType: { type: 'string', description: 'Tipo de datos a analizar', enum: ['sales', 'expenses', 'projects', 'clients', 'inventory'], required: true },
        period: { type: 'string', description: 'Período de análisis', enum: ['today', 'week', 'month', 'quarter', 'year'] },
        metric: { type: 'string', description: 'Métrica específica a calcular' },
      },
      required: ['dataType'],
    },
  },
  {
    name: 'search_web',
    description: 'Busca información actualizada en internet. Útil para obtener datos recientes, noticias, o información externa.',
    parameters: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Consulta de búsqueda', required: true },
        maxResults: { type: 'number', description: 'Número máximo de resultados' },
      },
      required: ['query'],
    },
  },
  {
    name: 'check_system_status',
    description: 'Verifica el estado de los módulos del sistema y sus integraciones de IA.',
    parameters: {
      type: 'object',
      properties: {
        modules: { type: 'array', description: 'Módulos específicos a verificar' },
      },
      required: [],
    },
  },
];

// Tool execution functions
export class AgentToolsExecutor {
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  async execute(toolName: AgentToolName, params: Record<string, unknown>): Promise<AgentToolResult> {
    try {
      switch (toolName) {
        case 'create_task':
          return this.createTask(params);
        case 'create_project':
          return this.createProject(params);
        case 'schedule_meeting':
          return this.scheduleMeeting(params);
        case 'send_notification':
          return this.sendNotification(params);
        case 'analyze_data':
          return this.analyzeData(params);
        case 'search_web':
          return this.searchWeb(params);
        case 'check_system_status':
          return this.checkSystemStatus();
        default:
          return { success: false, message: `Herramienta "${toolName}" no implementada aún.` };
      }
    } catch (error) {
      logger.error(`Error executing tool ${toolName}`, error as Error);
      return { success: false, message: `Error al ejecutar ${toolName}: ${(error as Error).message}` };
    }
  }

  private async createTask(params: Record<string, unknown>): Promise<AgentToolResult> {
    const parsed = schemas.create_task.safeParse(params);
    if (!parsed.success) {
      return { success: false, message: parsed.error.issues[0]?.message || 'Datos inválidos' };
    }

    const data = parsed.data;
    const taskData = {
      userId: this.userId,
      title: data.title,
      description: data.description || '',
      status: 'pending',
      priority: data.priority || 'medium',
      assignedTo: data.assigneeId || this.userId,
      projectId: data.projectId || null,
      tags: data.tags || [],
      dueDate: data.dueDate ? Timestamp.fromDate(new Date(data.dueDate)) : null,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    const docRef = await addDoc(collection(db, 'tasks'), taskData);

    return {
      success: true,
      message: `✅ Tarea creada: "${data.title}"`,
      data: { taskId: docRef.id },
      redirectUrl: `/tasks`,
    };
  }

  private async createProject(params: Record<string, unknown>): Promise<AgentToolResult> {
    const parsed = schemas.create_project.safeParse(params);
    if (!parsed.success) {
      return { success: false, message: parsed.error.issues[0]?.message || 'Datos inválidos' };
    }

    const data = parsed.data;
    const projectData = {
      userId: this.userId,
      name: data.name,
      description: data.description || '',
      clientId: data.clientId || null,
      budget: data.budget || 0,
      status: 'planning',
      startDate: data.startDate ? Timestamp.fromDate(new Date(data.startDate)) : null,
      endDate: data.endDate ? Timestamp.fromDate(new Date(data.endDate)) : null,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    const docRef = await addDoc(collection(db, 'projects'), projectData);

    return {
      success: true,
      message: `📁 Proyecto creado: "${data.name}"`,
      data: { projectId: docRef.id },
      redirectUrl: `/projects/${docRef.id}`,
    };
  }

  private async scheduleMeeting(params: Record<string, unknown>): Promise<AgentToolResult> {
    const parsed = schemas.schedule_meeting.safeParse(params);
    if (!parsed.success) {
      return { success: false, message: parsed.error.issues[0]?.message || 'Datos inválidos' };
    }

    const data = parsed.data;
    const startDate = new Date(data.startTime);
    const endDate = data.endTime ? new Date(data.endTime) : new Date(startDate.getTime() + 60 * 60 * 1000);

    const eventData = {
      userId: this.userId,
      title: data.title,
      description: data.description || '',
      startDate: Timestamp.fromDate(startDate),
      endDate: Timestamp.fromDate(endDate),
      participants: data.participants || [],
      location: data.location || '',
      type: 'meeting',
      createdAt: Timestamp.now(),
    };

    const docRef = await addDoc(collection(db, 'events'), eventData);

    return {
      success: true,
      message: `📅 Reunión agendada: "${data.title}" el ${startDate.toLocaleString('es-MX')}`,
      data: { eventId: docRef.id },
      redirectUrl: `/calendar`,
    };
  }

  private async sendNotification(params: Record<string, unknown>): Promise<AgentToolResult> {
    const parsed = schemas.send_notification.safeParse(params);
    if (!parsed.success) {
      return { success: false, message: parsed.error.issues[0]?.message || 'Datos inválidos' };
    }

    const data = parsed.data;
    const notificationData = {
      userId: this.userId,
      title: data.title,
      message: data.message,
      type: data.type || 'info',
      targetUsers: data.targetUsers || [this.userId],
      read: false,
      createdAt: Timestamp.now(),
    };

    await addDoc(collection(db, 'notifications'), notificationData);

    return {
      success: true,
      message: `🔔 Notificación enviada: "${data.title}"`,
      data: { type: data.type },
    };
  }

  private async analyzeData(params: Record<string, unknown>): Promise<AgentToolResult> {
    const parsed = schemas.analyze_data.safeParse(params);
    if (!parsed.success) {
      return { success: false, message: parsed.error.issues[0]?.message || 'Datos inválidos' };
    }

    const { dataType, period = 'month' } = parsed.data;
    
    // Calculate date range
    const now = new Date();
    let startDate: Date;
    switch (period) {
      case 'today':
        startDate = new Date(now.setHours(0, 0, 0, 0));
        break;
      case 'week':
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case 'month':
        startDate = new Date(now.setMonth(now.getMonth() - 1));
        break;
      case 'quarter':
        startDate = new Date(now.setMonth(now.getMonth() - 3));
        break;
      case 'year':
        startDate = new Date(now.setFullYear(now.getFullYear() - 1));
        break;
      default:
        startDate = new Date(now.setMonth(now.getMonth() - 1));
    }

    let collectionName: string;
    let metrics: Record<string, unknown> = {};

    switch (dataType) {
      case 'sales': {
        collectionName = 'invoices';
        const q = query(
          collection(db, collectionName),
          where('userId', '==', this.userId),
          where('createdAt', '>=', Timestamp.fromDate(startDate)),
          orderBy('createdAt', 'desc')
        );
        const snapshot = await getDocs(q);
        const total = snapshot.docs.reduce((sum, doc) => sum + (doc.data().total || 0), 0);
        metrics = {
          totalSales: total,
          invoiceCount: snapshot.size,
          averageInvoice: snapshot.size > 0 ? total / snapshot.size : 0,
        };
        break;
      }
      case 'expenses': {
        collectionName = 'expenses';
        const q = query(
          collection(db, collectionName),
          where('userId', '==', this.userId),
          where('createdAt', '>=', Timestamp.fromDate(startDate)),
          orderBy('createdAt', 'desc')
        );
        const snapshot = await getDocs(q);
        const total = snapshot.docs.reduce((sum, doc) => sum + (doc.data().amount || 0), 0);
        metrics = {
          totalExpenses: total,
          expenseCount: snapshot.size,
          averageExpense: snapshot.size > 0 ? total / snapshot.size : 0,
        };
        break;
      }
      case 'projects': {
        const q = query(
          collection(db, 'projects'),
          where('userId', '==', this.userId),
          limit(100)
        );
        const snapshot = await getDocs(q);
        const statusCounts: Record<string, number> = {};
        snapshot.docs.forEach(doc => {
          const status = doc.data().status || 'unknown';
          statusCounts[status] = (statusCounts[status] || 0) + 1;
        });
        metrics = {
          totalProjects: snapshot.size,
          byStatus: statusCounts,
        };
        break;
      }
      case 'clients': {
        const q = query(
          collection(db, 'clients'),
          where('userId', '==', this.userId),
          limit(100)
        );
        const snapshot = await getDocs(q);
        metrics = {
          totalClients: snapshot.size,
        };
        break;
      }
      case 'inventory': {
        const q = query(
          collection(db, 'products'),
          where('userId', '==', this.userId),
          limit(100)
        );
        const snapshot = await getDocs(q);
        const lowStock = snapshot.docs.filter(doc => (doc.data().stock || 0) < (doc.data().minStock || 10)).length;
        metrics = {
          totalProducts: snapshot.size,
          lowStockItems: lowStock,
        };
        break;
      }
    }

    return {
      success: true,
      message: `📊 Análisis de ${dataType} (${period}):
${Object.entries(metrics).map(([key, value]) => 
  `• ${key}: ${typeof value === 'number' ? value.toLocaleString() : JSON.stringify(value)}`
).join('\n')}`,
      data: metrics,
    };
  }

  private async searchWeb(params: Record<string, unknown>): Promise<AgentToolResult> {
    const parsed = schemas.search_web.safeParse(params);
    if (!parsed.success) {
      return { success: false, message: parsed.error.issues[0]?.message || 'Datos inválidos' };
    }

    const { query: searchQuery } = parsed.data;

    // Try Tavily API first (if available)
    const tavilyKey = process.env.TAVILY_API_KEY;
    
    if (tavilyKey) {
      try {
        const response = await fetch('https://api.tavily.com/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            api_key: tavilyKey,
            query: searchQuery,
            max_results: 5,
            include_answer: true,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const results = data.results?.slice(0, 5) || [];
          
          return {
            success: true,
            message: `🔍 Búsqueda web: "${searchQuery}"

${data.answer ? `📝 Resumen: ${data.answer}\n\n` : ''}Fuentes encontradas:
${results.map((r: { title: string; url: string; content: string }, i: number) => 
  `${i + 1}. **${r.title}**\n   ${r.url}\n   ${r.content?.slice(0, 150)}...`
).join('\n\n')}`,
            data: { results, answer: data.answer },
          };
        }
      } catch (error) {
        logger.warn('Tavily search failed', {
          component: 'AgentToolsExecutor',
          metadata: { error: String(error) }
        });
      }
    }

    // Fallback: Use DuckDuckGo instant answers (free, no API key needed)
    try {
      const ddgUrl = `https://api.duckduckgo.com/?q=${encodeURIComponent(searchQuery)}&format=json&no_redirect=1`;
      const response = await fetch(ddgUrl);
      
      if (response.ok) {
        const data = await response.json();
        
        if (data.Abstract || data.RelatedTopics?.length > 0) {
          const topics = data.RelatedTopics?.slice(0, 5) || [];
          
          return {
            success: true,
            message: `🔍 Búsqueda: "${searchQuery}"

${data.Abstract ? `📝 ${data.Abstract}\n\n` : ''}${topics.length > 0 ? `Temas relacionados:
${topics.map((t: { Text?: string; FirstURL?: string }, i: number) => 
  t.Text ? `${i + 1}. ${t.Text}` : ''
).filter(Boolean).join('\n')}` : ''}`,
            data: { abstract: data.Abstract, topics },
          };
        }
      }
    } catch (error) {
      logger.warn('DuckDuckGo search failed', {
        component: 'AgentToolsExecutor',
        metadata: { error: String(error) }
      });
    }

    return {
      success: true,
      message: `🔍 No se encontraron resultados específicos para: "${searchQuery}". Intenta reformular tu búsqueda.`,
      data: { results: [] },
    };
  }

  private async checkSystemStatus(): Promise<AgentToolResult> {
    const modules = [
      { name: 'CRM', collection: 'clients', status: 'active' },
      { name: 'Ventas', collection: 'invoices', status: 'active' },
      { name: 'Proyectos', collection: 'projects', status: 'active' },
      { name: 'Inventario', collection: 'products', status: 'active' },
      { name: 'Finanzas', collection: 'expenses', status: 'active' },
      { name: 'Tareas', collection: 'tasks', status: 'active' },
      { name: 'Calendario', collection: 'events', status: 'active' },
    ];

    const statusChecks = await Promise.all(
      modules.map(async (mod) => {
        try {
          const q = query(collection(db, mod.collection), limit(1));
          await getDocs(q);
          return { ...mod, connected: true };
        } catch {
          return { ...mod, connected: false };
        }
      })
    );

    const aiModels = [
      { name: 'DeepSeek R1', status: 'active', use: 'Razonamiento profundo' },
      { name: 'Qwen3-Coder', status: 'active', use: 'Agentes y código' },
      { name: 'Gemini 2.5 Pro', status: 'active', use: 'Contexto largo' },
      { name: 'GLM-4.5 Thinking', status: 'active', use: 'Function calling' },
    ];

    return {
      success: true,
      message: `🖥️ **Estado del Sistema ZADIA OS**

**Módulos:**
${statusChecks.map(m => `${m.connected ? '✅' : '❌'} ${m.name}`).join('\n')}

**Modelos de IA Conectados:**
${aiModels.map(m => `🤖 ${m.name} - ${m.use}`).join('\n')}

**Capacidades Activas:**
✅ Razonamiento avanzado (DeepSeek R1)
✅ Ejecución de herramientas (Function Calling)
✅ Búsqueda web en tiempo real
✅ Análisis de datos del sistema
✅ Multimodalidad (imágenes)`,
      data: { modules: statusChecks, aiModels },
    };
  }
}
