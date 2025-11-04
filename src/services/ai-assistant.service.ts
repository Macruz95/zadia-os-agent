/**
 * ZADIA OS - AI Assistant Service (Refactored)
 * 
 * Main AI assistant service coordinating context, prompts, and API calls
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
import { buildSystemContext } from './ai/context-builder';
import { generateSystemPrompt } from './ai/prompts';
import type { 
  AIRequest, 
  AIResponse, 
  Conversation,
  ConversationDoc,
  Message 
} from '@/types/ai-assistant.types';

/**
 * Sanitize metadata to remove undefined values (Firestore requirement)
 */
function sanitizeMetadata(metadata?: Record<string, unknown>): Record<string, unknown> | undefined {
  if (!metadata) {
    return undefined;
  }
  const entries = Object.entries(metadata).filter(([, value]) => value !== undefined);
  if (entries.length === 0) {
    return undefined;
  }
  return Object.fromEntries(entries);
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
      const conversationId = request.conversationId;
      let existingMessages: Message[] = [];

      // Load existing conversation if ID provided
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
      let systemContext = null;
      if (request.includeSystemContext) {
        systemContext = await buildSystemContext(request.message.split('::')[0]);
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

      // Add conversation history
      existingMessages.forEach(msg => {
        aiMessages.push({
          role: msg.role === 'user' ? 'user' : 'assistant',
          content: msg.content,
        });
      });

      // Add new user message
      aiMessages.push({
        role: 'user',
        content: request.message,
      });

      // Get AI response
      const aiResponse = await sendToAI(aiMessages, request.temperature);

      // Prepare response
      const response: AIResponse = {
        conversationId: conversationId || '',
        messageId: Date.now().toString(),
        content: aiResponse,
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
        
        const metadata = sanitizeMetadata(m.metadata);
        if (metadata) {
          msg.metadata = metadata;
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
