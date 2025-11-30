/**
 * ZADIA OS - Advanced AI Chat Hook
 * 
 * React hook for the advanced AI assistant with:
 * - Multi-model support with auto/manual selection
 * - Intelligent model routing (like VS Code / Cursor)
 * - Tool execution
 * - Streaming-like UX
 * - Conversation persistence
 * - Learning from interactions
 */

'use client';

import { useState, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { AdvancedAIService, AI_MODELS } from '../services/advanced-ai.service';
import { LearningMemoryService } from '@/lib/ai/learning-memory';
import { logger } from '@/lib/logger';
import { toast } from 'sonner';
import type { AIMessage, AIModel, Attachment, ToolCall } from '../types';

export type AIModelMode = 'auto' | 'manual';

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
}

export function useAdvancedAIChat(options: UseAdvancedAIChatOptions = {}): UseAdvancedAIChatReturn {
  const { 
    defaultModel = 'grok-4.1-fast',
    defaultMode = 'auto',
    enableTools = true,
  } = options;

  const { user } = useAuth();
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessingTool, setIsProcessingTool] = useState(false);
  const [currentModelId, setCurrentModelId] = useState(defaultModel);
  const [conversationTitle, setConversationTitle] = useState('Nueva conversación');
  
  // Model selection state
  const [modelMode, setModelMode] = useState<AIModelMode>(defaultMode);
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [lastUsedModel, setLastUsedModel] = useState<string | null>(null);
  
  const abortControllerRef = useRef<AbortController | null>(null);

  const currentModel = AI_MODELS.find(m => m.id === currentModelId) || AI_MODELS[0];

  const sendMessage = useCallback(async (content: string, attachments?: Attachment[]) => {
    if (!user?.uid || !content.trim()) return;

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
    setMessages(prev => [...prev, userMessage]);

    // Set conversation title from first message
    if (messages.length === 0) {
      const title = content.slice(0, 60) + (content.length > 60 ? '...' : '');
      setConversationTitle(title);
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

      // Call AI service with model mode
      const response = await AdvancedAIService.chat(user.uid, {
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
      const processed = await AdvancedAIService.processResponse(user.uid, response.content);

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
            user.uid,
            content,
            processed.content,
            { tool: tc.name, success: tc.status === 'success' }
          );
        }
      } else {
        await LearningMemoryService.learnFromInteraction(
          user.uid,
          content,
          processed.content
        );
      }

      // Update AI message with response
      setMessages(prev => prev.map(m => 
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
      ));

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
  }, [user?.uid, messages, currentModelId, enableTools, modelMode, selectedModel]);

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
  };
}
