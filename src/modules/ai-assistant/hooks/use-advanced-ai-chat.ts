/**
 * ZADIA OS - Advanced AI Chat Hook
 * 
 * React hook for the advanced AI assistant with:
 * - Multi-model support with auto/manual selection
 * - Intelligent model routing (like VS Code / Cursor)
 * - Tool execution
 * - Streaming-like UX
 * - **Firestore conversation persistence**
 * - Learning from interactions
 */

'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTenantId } from '@/contexts/TenantContext';
import { AdvancedAIService, AI_MODELS } from '../services/advanced-ai.service';
import { LearningMemoryService } from '@/lib/ai/learning-memory';
import { logger } from '@/lib/logger';
import { toast } from 'sonner';
import { db } from '@/lib/firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  deleteDoc, 
  query, 
  orderBy, 
  limit,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import type { AIMessage, AIModel, Attachment, ToolCall } from '../types';

export type AIModelMode = 'auto' | 'manual';

// Conversation stored in Firestore
export interface StoredConversation {
  id: string;
  title: string;
  messages: AIMessage[];
  createdAt: Timestamp | null;
  updatedAt: Timestamp | null;
  modelId: string;
}

interface UseAdvancedAIChatOptions {
  defaultModel?: string;
  defaultMode?: AIModelMode;
  enableTools?: boolean;
  enableWebSearch?: boolean;
}

interface UseAdvancedAIChatReturn {
  messages: AIMessage[];
  isLoading: boolean;
  isProcessingTool: boolean;
  currentModel: AIModel;
  availableModels: AIModel[];
  sendMessage: (content: string, attachments?: Attachment[]) => Promise<void>;
  setModel: (modelId: string) => void;
  clearChat: () => void;
  regenerateLastResponse: () => Promise<void>;
  conversationTitle: string;
  // New model selection features
  modelMode: AIModelMode;
  setModelMode: (mode: AIModelMode) => void;
  selectedModel: string | null;
  setSelectedModel: (modelId: string | null) => void;
  lastUsedModel: string | null;
  // Conversation persistence
  conversations: StoredConversation[];
  currentConversationId: string | null;
  loadConversation: (id: string) => Promise<void>;
  deleteConversation: (id: string) => Promise<void>;
  isLoadingHistory: boolean;
}

export function useAdvancedAIChat(options: UseAdvancedAIChatOptions = {}): UseAdvancedAIChatReturn {
  const { 
    defaultModel = 'kat-coder-pro', // Best for code/agents - verified Dec 2025
    defaultMode = 'auto',
    enableTools = true,
  } = options;

  const { firebaseUser } = useAuth();
  const tenantId = useTenantId();
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessingTool, setIsProcessingTool] = useState(false);
  const [currentModelId, setCurrentModelId] = useState(defaultModel);
  const [conversationTitle, setConversationTitle] = useState('Nueva conversación');
  
  // Model selection state
  const [modelMode, setModelMode] = useState<AIModelMode>(defaultMode);
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [lastUsedModel, setLastUsedModel] = useState<string | null>(null);
  
  // Conversation persistence state
  const [conversations, setConversations] = useState<StoredConversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  
  const abortControllerRef = useRef<AbortController | null>(null);

  // Firestore collection path helper
  const getConversationsPath = useCallback(() => {
    if (!tenantId || !firebaseUser?.uid) return null;
    return `tenants/${tenantId}/ai_conversations/${firebaseUser.uid}/chats`;
  }, [tenantId, firebaseUser?.uid]);

  // Load conversation history on mount
  useEffect(() => {
    const loadHistory = async () => {
      const path = getConversationsPath();
      if (!path) return;

      setIsLoadingHistory(true);
      try {
        const conversationsRef = collection(db, path);
        const q = query(conversationsRef, orderBy('updatedAt', 'desc'), limit(20));
        const snapshot = await getDocs(q);
        
        const loaded: StoredConversation[] = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        } as StoredConversation));
        
        setConversations(loaded);
        logger.info('Loaded AI conversation history', { count: loaded.length });
      } catch (error) {
        logger.error('Error loading conversation history', error as Error);
      } finally {
        setIsLoadingHistory(false);
      }
    };

    loadHistory();
  }, [getConversationsPath]);

  // Helper to remove undefined values from objects (Firestore doesn't accept undefined)
  const cleanForFirestore = <T extends Record<string, unknown>>(obj: T): T => {
    const cleaned = {} as T;
    for (const key in obj) {
      if (obj[key] !== undefined) {
        if (obj[key] && typeof obj[key] === 'object' && !Array.isArray(obj[key]) && !(obj[key] instanceof Date)) {
          cleaned[key] = cleanForFirestore(obj[key] as Record<string, unknown>) as T[typeof key];
        } else if (Array.isArray(obj[key])) {
          cleaned[key] = (obj[key] as unknown[]).map(item => 
            typeof item === 'object' && item !== null ? cleanForFirestore(item as Record<string, unknown>) : item
          ) as T[typeof key];
        } else {
          cleaned[key] = obj[key];
        }
      }
    }
    return cleaned;
  };

  // Save conversation to Firestore
  const saveConversation = useCallback(async (msgs: AIMessage[], title: string, convId?: string) => {
    const path = getConversationsPath();
    if (!path || msgs.length === 0) return null;

    const id = convId || `conv_${Date.now()}`;
    
    try {
      // Clean messages to remove undefined values
      const cleanedMessages = msgs.map(m => cleanForFirestore({
        id: m.id,
        role: m.role,
        content: m.content,
        status: m.status,
        timestamp: m.timestamp instanceof Date ? m.timestamp.toISOString() : String(m.timestamp),
        ...(m.toolCalls ? { toolCalls: m.toolCalls } : {}),
        ...(m.metadata ? { metadata: m.metadata } : {}),
        ...(m.attachments ? { attachments: m.attachments } : {}),
      }));

      const conversationData = {
        id,
        title,
        messages: cleanedMessages,
        modelId: currentModelId,
        updatedAt: serverTimestamp(),
        ...(convId ? {} : { createdAt: serverTimestamp() }),
      };

      await setDoc(doc(db, path, id), conversationData, { merge: true });
      
      // Update local state
      setConversations(prev => {
        const existing = prev.findIndex(c => c.id === id);
        const updated: StoredConversation = {
          ...conversationData,
          messages: msgs, // Keep original messages in state
          createdAt: existing >= 0 ? prev[existing].createdAt : null,
          updatedAt: null,
        };
        
        if (existing >= 0) {
          const newConvs = [...prev];
          newConvs[existing] = updated;
          return newConvs.sort((a, b) => {
            const aTime = a.updatedAt?.toMillis() || 0;
            const bTime = b.updatedAt?.toMillis() || 0;
            return bTime - aTime;
          });
        }
        return [updated, ...prev];
      });

      return id;
    } catch (error) {
      logger.error('Error saving conversation', error as Error);
      return null;
    }
  }, [getConversationsPath, currentModelId]);

  // Load a specific conversation
  const loadConversation = useCallback(async (id: string) => {
    const path = getConversationsPath();
    if (!path) return;

    try {
      const docRef = doc(db, path, id);
      const snapshot = await getDoc(docRef);
      
      if (snapshot.exists()) {
        const data = snapshot.data() as StoredConversation;
        // Parse and validate messages
        const parsedMessages: AIMessage[] = (data.messages || [])
          .filter(m => m && m.id && m.role && m.content !== undefined)
          .map(m => ({
            id: m.id,
            role: m.role as 'user' | 'assistant' | 'system',
            content: m.content || '',
            status: m.status || 'complete',
            timestamp: typeof m.timestamp === 'string' ? new Date(m.timestamp) : new Date(),
            toolCalls: m.toolCalls,
            metadata: m.metadata,
            attachments: m.attachments,
          }));
        
        setMessages(parsedMessages);
        setConversationTitle(data.title || 'Conversación');
        setCurrentConversationId(id);
        if (data.modelId) setCurrentModelId(data.modelId);
        
        logger.info('Loaded conversation', { id, messageCount: parsedMessages.length });
      }
    } catch (error) {
      logger.error('Error loading conversation', error as Error);
      toast.error('Error al cargar la conversación');
    }
  }, [getConversationsPath]);

  // Delete a conversation
  const deleteConversation = useCallback(async (id: string) => {
    const path = getConversationsPath();
    if (!path) return;

    try {
      await deleteDoc(doc(db, path, id));
      setConversations(prev => prev.filter(c => c.id !== id));
      
      // If we deleted the current conversation, clear it
      if (currentConversationId === id) {
        setMessages([]);
        setConversationTitle('Nueva conversación');
        setCurrentConversationId(null);
      }
      
      toast.success('Conversación eliminada');
    } catch (error) {
      logger.error('Error deleting conversation', error as Error);
      toast.error('Error al eliminar la conversación');
    }
  }, [getConversationsPath, currentConversationId]);

  const currentModel = AI_MODELS.find(m => m.id === currentModelId) || AI_MODELS[0];

  const sendMessage = useCallback(async (content: string, attachments?: Attachment[]) => {
    if (!firebaseUser?.uid || !tenantId || !content.trim()) return;

    // Cancel any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setIsLoading(true);

    // Add user message
    const userMessage: AIMessage = {
      id: `msg_${Date.now()}_user`,
      role: 'user',
      content,
      status: 'complete',
      timestamp: new Date(),
      attachments,
    };
    
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);

    // Set conversation title from first message
    let title = conversationTitle;
    if (messages.length === 0) {
      title = content.slice(0, 60) + (content.length > 60 ? '...' : '');
      setConversationTitle(title);
    }

    // Create new conversation ID if this is first message
    let convId = currentConversationId;
    if (!convId) {
      convId = `conv_${Date.now()}`;
      setCurrentConversationId(convId);
    }

    // Add placeholder for AI response
    const aiMessageId = `msg_${Date.now()}_ai`;
    const aiPlaceholder: AIMessage = {
      id: aiMessageId,
      role: 'assistant',
      content: '',
      status: 'pending',
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, aiPlaceholder]);

    try {
      // Prepare messages for API
      const chatMessages = [...messages, userMessage].map(m => ({
        role: m.role as string,
        content: m.content,
      }));

      // Determine model to use based on mode
      const modelToUse = modelMode === 'manual' && selectedModel 
        ? selectedModel 
        : currentModelId;

      // Call AI service with model mode (use tenantId for data isolation)
      const response = await AdvancedAIService.chat(tenantId, {
        messages: chatMessages,
        modelId: modelToUse,
        enableTools,
        mode: modelMode,
      });

      // Track the model that was actually used
      const usedModel = response.modelId || response.model || modelToUse;
      setLastUsedModel(usedModel);
      
      // Update current model if auto mode selected a different one
      if (modelMode === 'auto' && response.modelId) {
        setCurrentModelId(response.modelId);
      }

      // Process response for tool calls
      setIsProcessingTool(true);
      const processed = await AdvancedAIService.processResponse(tenantId, response.content);

      // Build tool calls array
      const toolCalls: ToolCall[] = processed.toolResults.map((tr, idx) => ({
        id: `tool_${Date.now()}_${idx}`,
        name: tr.tool,
        arguments: {},
        status: (tr.result as { success: boolean }).success ? 'success' : 'error',
        result: tr.result,
      }));

      // Record interaction for learning
      if (toolCalls.length > 0) {
        for (const tc of toolCalls) {
          await LearningMemoryService.learnFromInteraction(
            firebaseUser.uid,
            content,
            processed.content,
            { tool: tc.name, success: tc.status === 'success' }
          );
        }
      } else {
        await LearningMemoryService.learnFromInteraction(
          firebaseUser.uid,
          content,
          processed.content
        );
      }

      // Update AI message with response
      const finalMessages = messages.map(m => 
        m.id === aiMessageId 
          ? {
              ...m,
              content: processed.content,
              status: 'complete' as const,
              toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
              metadata: {
                model: response.model,
                modelId: response.modelId,
                modelName: response.modelName,
                provider: response.provider,
                tokensUsed: response.tokensUsed,
                routingReason: response.routingReason,
              },
            }
          : m
      );

      setMessages(prev => prev.map(m => 
        m.id === aiMessageId 
          ? finalMessages.find(fm => fm.id === aiMessageId)!
          : m
      ));

      // Save conversation to Firestore
      const allMsgs = [...updatedMessages, {
        ...aiPlaceholder,
        content: processed.content,
        status: 'complete' as const,
        toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
      }];
      await saveConversation(allMsgs, title, convId);

      // Show success toast for tool executions
      toolCalls.forEach(tc => {
        if (tc.status === 'success') {
          toast.success(`Acción ejecutada: ${tc.name}`);
        }
      });

    } catch (error) {
      logger.error('Error in AI chat', error as Error);
      
      // Update message with error
      setMessages(prev => prev.map(m => 
        m.id === aiMessageId 
          ? {
              ...m,
              content: '❌ Error al procesar tu mensaje. Por favor intenta de nuevo.',
              status: 'error' as const,
            }
          : m
      ));

      toast.error('Error al comunicarse con la IA');
    } finally {
      setIsLoading(false);
      setIsProcessingTool(false);
    }
  }, [firebaseUser?.uid, tenantId, messages, currentModelId, enableTools, modelMode, selectedModel, conversationTitle, currentConversationId, saveConversation]);

  const setModel = useCallback((modelId: string) => {
    const model = AI_MODELS.find(m => m.id === modelId);
    if (model) {
      setCurrentModelId(modelId);
      setSelectedModel(modelId);
      setModelMode('manual');
      toast.info(`Modelo cambiado a ${model.name}`);
    }
  }, []);

  const clearChat = useCallback(() => {
    setMessages([]);
    setConversationTitle('Nueva conversación');
    setCurrentConversationId(null);
    setLastUsedModel(null);
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  const regenerateLastResponse = useCallback(async () => {
    if (messages.length < 2) return;

    // Find last user message
    const lastUserMsgIndex = messages.findLastIndex(m => m.role === 'user');
    if (lastUserMsgIndex === -1) return;

    const lastUserMsg = messages[lastUserMsgIndex];

    // Remove messages after and including the last AI response
    setMessages(prev => prev.slice(0, lastUserMsgIndex));

    // Resend the message
    await sendMessage(lastUserMsg.content, lastUserMsg.attachments);
  }, [messages, sendMessage]);

  return {
    messages,
    isLoading,
    isProcessingTool,
    currentModel,
    availableModels: AI_MODELS,
    sendMessage,
    setModel,
    clearChat,
    regenerateLastResponse,
    conversationTitle,
    // New model selection features
    modelMode,
    setModelMode,
    selectedModel,
    setSelectedModel,
    lastUsedModel,
    // Conversation persistence
    conversations,
    currentConversationId,
    loadConversation,
    deleteConversation,
    isLoadingHistory,
  };
}
