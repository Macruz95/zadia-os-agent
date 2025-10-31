/**
 * ZADIA OS - AI Assistant Service
 * 
 * Conversational AI with system context and learning
 * Rule #1: Real data from Firebase
 * Rule #3: Zod validation
 */

import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { logger } from '@/lib/logger';
import type { 
  SystemContext, 
  AIRequest, 
  AIResponse, 
  Conversation,
  ConversationDoc,
  Message 
} from '@/types/ai-assistant.types';

const MODEL = 'google/gemini-2.0-flash-exp:free'; // Free tier

/**
 * Build system context from Firebase data
 */
async function buildSystemContext(userId: string): Promise<SystemContext> {
  try {
    const context: SystemContext = {
      userId,
      timestamp: new Date(),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    };

    // Fetch recent clients (last 5) - no userId filter for clients collection
    try {
      const clientsQuery = query(
        collection(db, 'clients'),
        limit(20)
      );
      const clientsSnap = await getDocs(clientsQuery);
      const clientsDocs = clientsSnap.docs.sort((a, b) => {
        const aDate = a.data().createdAt?.toDate() || new Date(0);
        const bDate = b.data().createdAt?.toDate() || new Date(0);
        return bDate.getTime() - aDate.getTime();
      }).slice(0, 5);
      
      context.recentClients = clientsDocs.map(doc => ({
        id: doc.id,
        name: doc.data().name || 'Sin nombre',
      }));
      context.totalClients = clientsSnap.size;
    } catch (error) {
      logger.error('Error fetching clients for AI context', error as Error);
      context.recentClients = [];
      context.totalClients = 0;
    }

    // Fetch recent projects (last 5) - no userId filter
    try {
      const projectsQuery = query(
        collection(db, 'projects'),
        limit(20)
      );
      const projectsSnap = await getDocs(projectsQuery);
      const projectsDocs = projectsSnap.docs.sort((a, b) => {
        const aDate = a.data().createdAt?.toDate() || new Date(0);
        const bDate = b.data().createdAt?.toDate() || new Date(0);
        return bDate.getTime() - aDate.getTime();
      }).slice(0, 5);
      
      context.recentProjects = projectsDocs.map(doc => ({
        id: doc.id,
        name: doc.data().name || 'Sin nombre',
        status: doc.data().status || 'unknown',
      }));
      context.activeProjects = projectsSnap.docs.filter(d => 
        ['planning', 'in-progress'].includes(d.data().status)
      ).length;
    } catch (error) {
      logger.error('Error fetching projects for AI context', error as Error);
      context.recentProjects = [];
      context.activeProjects = 0;
    }

    // Fetch recent invoices (last 5) - no userId filter
    try {
      const invoicesQuery = query(
        collection(db, 'invoices'),
        limit(20)
      );
      const invoicesSnap = await getDocs(invoicesQuery);
      const invoicesDocs = invoicesSnap.docs.sort((a, b) => {
        const aDate = a.data().createdAt?.toDate() || new Date(0);
        const bDate = b.data().createdAt?.toDate() || new Date(0);
        return bDate.getTime() - aDate.getTime();
      }).slice(0, 5);
      
      context.recentInvoices = invoicesDocs.map(doc => ({
        id: doc.id,
        total: doc.data().total || 0,
        status: doc.data().status || 'unknown',
      }));

      // Calculate monthly revenue (approximate from recent invoices)
      const paidInvoices = invoicesSnap.docs.filter(d => d.data().status === 'paid');
      context.monthlyRevenue = paidInvoices.reduce((sum, d) => sum + (d.data().total || 0), 0);
    } catch (error) {
      logger.error('Error fetching invoices for AI context', error as Error);
      context.recentInvoices = [];
      context.monthlyRevenue = 0;
    }

    // Fetch leads data
    try {
      const leadsQuery = query(collection(db, 'leads'), limit(20));
      const leadsSnap = await getDocs(leadsQuery);
      const activeLeads = leadsSnap.docs.filter(d => 
        ['new', 'contacted', 'qualified'].includes(d.data().status)
      );
      context.activeLeads = activeLeads.length;
    } catch (error) {
      logger.error('Error fetching leads for AI context', error as Error);
      context.activeLeads = 0;
    }

    // Fetch opportunities data
    try {
      const opportunitiesQuery = query(collection(db, 'opportunities'), limit(20));
      const opportunitiesSnap = await getDocs(opportunitiesQuery);
      const activeOpportunities = opportunitiesSnap.docs.filter(d => 
        ['qualification', 'proposal', 'negotiation'].includes(d.data().stage)
      );
      context.activeOpportunities = activeOpportunities.length;
    } catch (error) {
      logger.error('Error fetching opportunities for AI context', error as Error);
      context.activeOpportunities = 0;
    }

    // Fetch orders data
    try {
      const ordersQuery = query(collection(db, 'orders'), limit(20));
      const ordersSnap = await getDocs(ordersQuery);
      const pendingOrders = ordersSnap.docs.filter(d => 
        ['pending', 'processing'].includes(d.data().status)
      );
      context.pendingOrders = pendingOrders.length;
      context.totalOrders = ordersSnap.size;
    } catch (error) {
      logger.error('Error fetching orders for AI context', error as Error);
      context.pendingOrders = 0;
      context.totalOrders = 0;
    }

    // Fetch work orders data
    try {
      const workOrdersQuery = query(collection(db, 'workOrders'), limit(20));
      const workOrdersSnap = await getDocs(workOrdersQuery);
      const activeWorkOrders = workOrdersSnap.docs.filter(d => 
        ['pending', 'in-progress'].includes(d.data().status)
      );
      context.activeWorkOrders = activeWorkOrders.length;
    } catch (error) {
      logger.error('Error fetching work orders for AI context', error as Error);
      context.activeWorkOrders = 0;
    }

    // Fetch inventory data (raw materials)
    try {
      const rawMaterialsQuery = query(collection(db, 'raw-materials'), limit(50));
      const rawMaterialsSnap = await getDocs(rawMaterialsQuery);
      const lowStockMaterials = rawMaterialsSnap.docs.filter(d => {
        const data = d.data();
        return (data.currentStock || 0) <= (data.minimumStock || 0);
      });
      context.lowStockItems = lowStockMaterials.length;
      context.totalRawMaterials = rawMaterialsSnap.size;
    } catch (error) {
      logger.error('Error fetching raw materials for AI context', error as Error);
      context.lowStockItems = 0;
      context.totalRawMaterials = 0;
    }

    // Fetch finished products data
    try {
      const finishedProductsQuery = query(collection(db, 'finished-products'), limit(50));
      const finishedProductsSnap = await getDocs(finishedProductsQuery);
      context.totalFinishedProducts = finishedProductsSnap.size;
    } catch (error) {
      logger.error('Error fetching finished products for AI context', error as Error);
      context.totalFinishedProducts = 0;
    }

    // Fetch quotes data
    try {
      const quotesQuery = query(collection(db, 'quotes'), limit(20));
      const quotesSnap = await getDocs(quotesQuery);
      const activeQuotes = quotesSnap.docs.filter(d => 
        ['draft', 'sent'].includes(d.data().status)
      );
      context.activeQuotes = activeQuotes.length;
    } catch (error) {
      logger.error('Error fetching quotes for AI context', error as Error);
      context.activeQuotes = 0;
    }

    return context;
  } catch (error) {
    logger.error('Error building system context', error as Error);
    return {
      userId,
      timestamp: new Date(),
    };
  }
}

/**
 * Generate system prompt with context
 */
function generateSystemPrompt(context: SystemContext): string {
  return `Eres el Asistente AI de ZADIA OS, un sistema ERP completo para gestión empresarial.

CONTEXTO DEL USUARIO:
- ID: ${context.userId}
- Fecha: ${context.timestamp.toLocaleString('es-ES')}
- Zona horaria: ${context.timezone || 'UTC'}

📊 ESTADO GENERAL DEL NEGOCIO:

CLIENTES Y VENTAS:
- Total de clientes: ${context.totalClients || 0}
- Leads activos: ${context.activeLeads || 0}
- Oportunidades activas: ${context.activeOpportunities || 0}
- Cotizaciones activas: ${context.activeQuotes || 0}
- Ingresos mensuales (aproximado): ${context.monthlyRevenue ? `$${context.monthlyRevenue.toLocaleString()}` : '$0'}

PROYECTOS Y PRODUCCIÓN:
- Proyectos activos: ${context.activeProjects || 0}
- Órdenes totales: ${context.totalOrders || 0}
- Órdenes pendientes: ${context.pendingOrders || 0}
- Órdenes de trabajo activas: ${context.activeWorkOrders || 0}

INVENTARIO:
- Materias primas: ${context.totalRawMaterials || 0}
- Productos terminados: ${context.totalFinishedProducts || 0}
- Ítems con stock bajo: ${context.lowStockItems || 0}

📋 CLIENTES RECIENTES:
${context.recentClients?.map(c => `- ${c.name} (ID: ${c.id})`).join('\n') || 'No hay clientes recientes'}

📁 PROYECTOS RECIENTES:
${context.recentProjects?.map(p => `- ${p.name} - Estado: ${p.status} (ID: ${p.id})`).join('\n') || 'No hay proyectos recientes'}

💰 FACTURAS RECIENTES:
${context.recentInvoices?.map(i => `- $${i.total.toLocaleString()} - Estado: ${i.status}`).join('\n') || 'No hay facturas recientes'}

TU ROL:
1. Ayudar al usuario a gestionar su negocio de manera eficiente
2. Responder preguntas sobre clientes, proyectos, finanzas, inventario, ventas
3. Proporcionar análisis y recomendaciones basadas en datos reales
4. Sugerir mejoras y optimizaciones de procesos
5. Alertar sobre problemas potenciales (stock bajo, órdenes pendientes, etc.)
6. Aprender de las conversaciones para mejorar continuamente

CAPACIDADES:
- Análisis de datos en tiempo real del sistema
- Recomendaciones de negocio personalizadas
- Respuestas sobre el estado actual de cualquier módulo
- Ayuda con flujos de trabajo del ERP
- Interpretación de métricas y KPIs
- Comparaciones y tendencias

LIMITACIONES:
- NO puedes ejecutar acciones directamente en el sistema (crear, editar, eliminar)
- Solo puedes informar, analizar y recomendar
- El usuario debe ejecutar las acciones recomendadas manualmente

INSTRUCCIONES:
- Habla siempre en español profesional
- Sé conciso pero completo en tus respuestas
- Usa los datos reales del sistema en tus análisis
- Si no tienes información, indícalo claramente
- Prioriza la utilidad práctica sobre explicaciones teóricas
- Usa emojis ocasionalmente para hacer las respuestas más amigables

Responde de manera útil, profesional y basándote en los datos reales del sistema.`;
}

/**
 * Send message to AI via Next.js API route
 */
async function sendToAI(
  messages: Array<{ role: string; content: string }>,
  temperature: number = 0.7
): Promise<string> {
  try {
    const response = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages,
        temperature,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      const errorMessage = errorData.error || `API error: ${response.status}`;
      logger.error('AI API returned error', new Error(errorMessage));
      throw new Error(errorMessage);
    }

    const data = await response.json();
    return data.content || 'No se pudo generar respuesta.';
  } catch (error) {
    logger.error('Error calling AI API', error as Error);
    // Re-throw the original error message instead of generic one
    throw error;
  }
}

/**
 * AI Assistant Service
 */
export const AIAssistantService = {
  /**
   * Send message and get AI response
   */
  async sendMessage(request: AIRequest): Promise<AIResponse> {
    try {
      // Get or create conversation
      const conversationId = request.conversationId;
      let existingMessages: Message[] = [];

      if (conversationId) {
        const convDoc = await getDoc(doc(db, 'ai-conversations', conversationId));
        if (convDoc.exists()) {
          const data = convDoc.data() as ConversationDoc;
          existingMessages = data.messages.map(m => ({
            ...m,
            timestamp: m.timestamp.toDate(),
          }));
        }
      }

      // Build system context if requested
      let systemContext: SystemContext | null = null;
      if (request.includeSystemContext) {
        systemContext = await buildSystemContext(request.message.split('::')[0]); // userId passed as prefix
      }

      // Prepare messages for AI
      const aiMessages: Array<{ role: string; content: string }> = [];

      // Add system prompt with context
      if (systemContext) {
        aiMessages.push({
          role: 'system',
          content: generateSystemPrompt(systemContext),
        });
      }

      // Add conversation history (last 10 messages for context)
      const recentMessages = existingMessages.slice(-10);
      recentMessages.forEach(msg => {
        if (msg.role !== 'system') {
          aiMessages.push({
            role: msg.role,
            content: msg.content,
          });
        }
      });

      // Add current user message
      aiMessages.push({
        role: 'user',
        content: request.message,
      });

      // Get AI response
      const aiContent = await sendToAI(aiMessages, request.temperature);

      // Create response
      const messageId = `msg_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      const response: AIResponse = {
        conversationId: conversationId || '',
        messageId,
        content: aiContent,
        model: MODEL,
        timestamp: new Date(),
      };

      return response;
    } catch (error) {
      logger.error('Error in AI sendMessage', error as Error);
      throw error;
    }
  },

  /**
   * Save conversation to Firestore
   */
  async saveConversation(conversation: Conversation): Promise<string> {
    try {
      // Build messages without undefined fields
      const messages = conversation.messages.map(m => {
        const msg: {
          id: string;
          role: 'system' | 'user' | 'assistant';
          content: string;
          timestamp: Timestamp;
          metadata?: Record<string, unknown>;
        } = {
          id: m.id || '',
          role: m.role || 'user',
          content: m.content || '',
          timestamp: m.timestamp ? Timestamp.fromDate(m.timestamp) : Timestamp.now(),
        };
        // Only add metadata if it exists and is not empty (Firestore doesn't accept undefined)
        if (m.metadata && Object.keys(m.metadata).length > 0) {
          msg.metadata = m.metadata;
        }
        return msg;
      });

      if (conversation.id) {
        // Update existing conversation
        const conversationData = {
          userId: conversation.userId || '',
          title: conversation.title || 'Nueva Conversación',
          messages,
          updatedAt: serverTimestamp() as Timestamp,
          archived: conversation.archived ?? false,
          tags: conversation.tags ?? [],
        };
        await updateDoc(doc(db, 'ai-conversations', conversation.id), conversationData);
        return conversation.id;
      } else {
        // Create new conversation
        const conversationData = {
          userId: conversation.userId || '',
          title: conversation.title || 'Nueva Conversación',
          messages,
          createdAt: serverTimestamp() as Timestamp,
          updatedAt: serverTimestamp() as Timestamp,
          archived: conversation.archived ?? false,
          tags: conversation.tags ?? [],
        };
        const docRef = await addDoc(collection(db, 'ai-conversations'), conversationData);
        return docRef.id;
      }
    } catch (error) {
      logger.error('Error saving conversation', error as Error);
      throw error;
    }
  },

  /**
   * Get user conversations
   */
  async getUserConversations(userId: string): Promise<Conversation[]> {
    try {
      const q = query(
        collection(db, 'ai-conversations'),
        where('userId', '==', userId),
        where('archived', '==', false),
        orderBy('updatedAt', 'desc'),
        limit(20)
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => {
        const data = doc.data() as ConversationDoc;
        return {
          id: doc.id,
          userId: data.userId,
          title: data.title,
          messages: data.messages.map(m => ({
            ...m,
            timestamp: m.timestamp.toDate(),
          })),
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate(),
          archived: data.archived,
          tags: data.tags,
        };
      });
    } catch (error) {
      logger.error('Error fetching conversations', error as Error);
      return [];
    }
  },

  /**
   * Delete conversation
   */
  async deleteConversation(conversationId: string): Promise<void> {
    try {
      await updateDoc(doc(db, 'ai-conversations', conversationId), {
        archived: true,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      logger.error('Error deleting conversation', error as Error);
      throw error;
    }
  },
};
