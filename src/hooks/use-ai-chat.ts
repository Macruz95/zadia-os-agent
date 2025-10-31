/**
 * ZADIA OS - AI Chat Hook
 *
 * Manage AI conversation state with agentic actions
 * Rule #4: Modular architecture
 * Rule #5: <200 lines
 */

'use client';

import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { AIAssistantService } from '@/services/ai-assistant.service';
import { AIAgentToolsService, type AgentToolInvocation } from '@/services/ai-agent-tools.service';
import { logger } from '@/lib/logger';
import { toast } from 'sonner';
import type { Message, Conversation } from '@/types/ai-assistant.types';

interface UseAIChatProps {
  conversationId?: string;
}

interface UseAIChatReturn {
  messages: Message[];
  sending: boolean;
  sendMessage: (content: string) => Promise<void>;
  clearConversation: () => void;
  saveConversation: () => Promise<void>;
  conversationTitle: string;
  setConversationTitle: (title: string) => void;
}

const ACTION_REGEX = /```json\s*([\s\S]*?)```/i;

type ParsedAgentAction = {
  invocation: AgentToolInvocation;
  cleanedContent: string;
};

function extractAgentAction(content: string): ParsedAgentAction | null {
  const match = ACTION_REGEX.exec(content);

  if (!match) {
    return null;
  }

  try {
    const raw = JSON.parse(match[1]);
    const invocation = AIAgentToolsService.parseInvocation(raw);

    if (!invocation) {
      return null;
    }

    const before = content.slice(0, match.index).trim();
    const after = content.slice(match.index + match[0].length).trim();
    const cleanedSections = [before, after].filter(Boolean);

    return {
      invocation,
      cleanedContent: cleanedSections.length > 0 ? cleanedSections.join('\n\n') : 'He ejecutado la acción solicitada.',
    };
  } catch (error) {
    const snippet = match[1] ? String(match[1]).slice(0, 120) : '';
    logger.warn('No se pudo interpretar acción JSON del asistente', {
      component: 'useAIChat',
      metadata: {
        snippet,
        error: error instanceof Error ? error.message : String(error),
      },
    });
    return null;
  }
}

export function useAIChat({ conversationId }: UseAIChatProps = {}): UseAIChatReturn {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [sending, setSending] = useState(false);
  const [conversationTitle, setConversationTitle] = useState('Nueva Conversación');
  const [currentConversationId, setCurrentConversationId] = useState(conversationId);

  const saveConversationInternal = useCallback(async (messagesToSave: Message[]): Promise<boolean> => {
    if (!user?.uid || messagesToSave.length === 0) return false;

    try {
      const conversation: Conversation = {
        id: currentConversationId || '',
        userId: user.uid,
        title: conversationTitle,
        messages: messagesToSave,
        createdAt: new Date(),
        updatedAt: new Date(),
        archived: false,
        tags: [],
      };

      const savedId = await AIAssistantService.saveConversation(conversation);
      if (!currentConversationId) {
        setCurrentConversationId(savedId);
      }
      return true;
    } catch (error) {
        logger.error('Error saving conversation', error as Error);
      return false;
    }
  }, [user?.uid, currentConversationId, conversationTitle]);

  const sendMessage = useCallback(async (content: string) => {
    if (!user?.uid || !content.trim()) return;

    setSending(true);
    try {
      const userMessage: Message = {
        id: `msg_${Date.now()}_user`,
        role: 'user',
        content,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, userMessage]);

      const response = await AIAssistantService.sendMessage({
        conversationId: currentConversationId,
        message: `${user.uid}::${content}`,
        includeSystemContext: true,
        temperature: 0.7,
      });

      const parsedAction = extractAgentAction(response.content);
      let assistantContent = parsedAction?.cleanedContent ?? response.content;

      const messageMetadata: Record<string, unknown> = {};
      if (response.model) {
        messageMetadata.model = response.model;
      }
      if (typeof response.tokensUsed === 'number') {
        messageMetadata.tokensUsed = response.tokensUsed;
      }

      if (parsedAction) {
        let executionResult;
        try {
          executionResult = await AIAgentToolsService.execute(parsedAction.invocation, user.uid);
        } catch (error) {
          logger.error('Error ejecutando acción del agente', error as Error, {
            component: 'useAIChat',
            metadata: { tool: parsedAction.invocation.tool },
          });
          executionResult = {
            success: false,
            message: '⚠️ No se pudo completar la acción solicitada. Intenta de nuevo.',
          };
        }

        assistantContent = [assistantContent, executionResult.message].filter(Boolean).join('\n\n');

        const actionMetadata: Record<string, unknown> = {
          tool: parsedAction.invocation.tool,
          parameters: parsedAction.invocation.parameters,
          success: executionResult.success,
        };

        if (executionResult.redirectUrl) {
          actionMetadata.redirectUrl = executionResult.redirectUrl;
        }
        if (executionResult.metadata) {
          actionMetadata.metadata = executionResult.metadata;
        }

        messageMetadata.agentAction = actionMetadata;

        if (executionResult.success) {
          toast.success(executionResult.message);
        } else {
          toast.error(executionResult.message);
        }
      }

      const aiMessage: Message = {
        id: response.messageId,
        role: 'assistant',
        content: assistantContent,
        timestamp: response.timestamp,
        metadata: Object.keys(messageMetadata).length > 0 ? messageMetadata : undefined,
      };
      setMessages(prev => [...prev, aiMessage]);

      if (messages.length === 0 && !currentConversationId) {
        const title = content.slice(0, 50) + (content.length > 50 ? '...' : '');
        setConversationTitle(title);
      }

  await saveConversationInternal([...messages, userMessage, aiMessage]);
    } catch (error) {
      logger.error('Error sending message to AI', error as Error);
      toast.error('Error al comunicarse con la IA');
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setSending(false);
    }
  }, [user?.uid, messages, currentConversationId, saveConversationInternal]);

  const saveConversation = useCallback(async () => {
    const success = await saveConversationInternal(messages);
    if (success) {
      toast.success('Conversación guardada');
    } else {
      toast.error('No se pudo guardar la conversación');
    }
  }, [messages, saveConversationInternal]);

  const clearConversation = useCallback(() => {
    setMessages([]);
    setCurrentConversationId(undefined);
    setConversationTitle('Nueva Conversación');
  }, []);

  return {
    messages,
    sending,
    sendMessage,
    clearConversation,
    saveConversation,
    conversationTitle,
    setConversationTitle,
  };
}
