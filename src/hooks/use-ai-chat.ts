/**
 * ZADIA OS - AI Chat Hook
 * 
 * Manage AI conversation state
 * Rule #4: Modular architecture
 * Rule #5: <200 lines
 */

'use client';

import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { AIAssistantService } from '@/services/ai-assistant.service';
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

export function useAIChat({ conversationId }: UseAIChatProps = {}): UseAIChatReturn {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [sending, setSending] = useState(false);
  const [conversationTitle, setConversationTitle] = useState('Nueva Conversación');
  const [currentConversationId, setCurrentConversationId] = useState(conversationId);

  /**
   * Send message to AI
   */
  const sendMessage = useCallback(async (content: string) => {
    if (!user?.uid || !content.trim()) return;

    setSending(true);
    try {
      // Add user message to UI immediately
      const userMessage: Message = {
        id: `msg_${Date.now()}_user`,
        role: 'user',
        content,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, userMessage]);

      // Send to AI with userId prefix for context
      const response = await AIAssistantService.sendMessage({
        conversationId: currentConversationId,
        message: `${user.uid}::${content}`, // Pass userId for context building
        includeSystemContext: true,
        temperature: 0.7,
      });

      // Add AI response to UI
      const aiMessage: Message = {
        id: response.messageId,
        role: 'assistant',
        content: response.content,
        timestamp: response.timestamp,
        metadata: {
          model: response.model,
          tokensUsed: response.tokensUsed,
        },
      };
      setMessages(prev => [...prev, aiMessage]);

      // Auto-save conversation after each exchange
      if (messages.length === 0 && !currentConversationId) {
        // First message - generate title from user message
        const title = content.slice(0, 50) + (content.length > 50 ? '...' : '');
        setConversationTitle(title);
      }

      // Auto-save
      await saveConversationInternal([...messages, userMessage, aiMessage]);

    } catch (error) {
      logger.error('Error sending message to AI', error as Error);
      toast.error('Error al comunicarse con la IA');
      
      // Remove user message on error
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setSending(false);
    }
  }, [user?.uid, messages, currentConversationId]);

  /**
   * Save conversation to Firestore
   */
  const saveConversationInternal = useCallback(async (messagesToSave: Message[]) => {
    if (!user?.uid || messagesToSave.length === 0) return;

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
    } catch (error) {
      logger.error('Error saving conversation', error as Error);
      // Silent fail - don't interrupt user experience
    }
  }, [user?.uid, currentConversationId, conversationTitle]);

  /**
   * Public save method
   */
  const saveConversation = useCallback(async () => {
    await saveConversationInternal(messages);
    toast.success('Conversación guardada');
  }, [messages, saveConversationInternal]);

  /**
   * Clear current conversation
   */
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
