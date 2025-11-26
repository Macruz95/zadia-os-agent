/**
 * ZADIA OS - AI Assistant Page (Redesigned)
 * 
 * Professional AI chat interface with:
 * - Multi-model support (DeepSeek R1, Qwen3, Gemini 2.5)
 * - Tool execution / Function calling
 * - Web search integration
 * - Multimodal support (images)
 * - Full ZADIA system integration
 */

'use client';

import { useRef, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  ChatMessage, 
  ChatInput, 
  ChatHeader, 
  EmptyState,
  useAdvancedAIChat,
} from '@/modules/ai-assistant';

export default function AIAssistantPage() {
  const {
    messages,
    isLoading,
    isProcessingTool,
    currentModel,
    availableModels,
    sendMessage,
    setModel,
    clearChat,
    regenerateLastResponse,
    conversationTitle,
  } = useAdvancedAIChat({
    defaultModel: 'deepseek-r1',
    enableTools: true,
    enableWebSearch: true,
  });

  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      const scrollElement = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  }, [messages]);

  const handleSelectPrompt = (prompt: string) => {
    sendMessage(prompt);
  };

  return (
    <div className="h-[calc(100vh-3.5rem)] flex flex-col bg-[#0d1117]">
      {/* Header */}
      <ChatHeader
        conversationTitle={conversationTitle}
        currentModel={currentModel}
        isLoading={isLoading}
        isProcessingTool={isProcessingTool}
        messageCount={messages.length}
        onClear={clearChat}
      />

      {/* Messages Area */}
      <ScrollArea ref={scrollRef} className="flex-1">
        {messages.length === 0 ? (
          <EmptyState 
            onSelectPrompt={handleSelectPrompt}
            currentModel={currentModel}
          />
        ) : (
          <div className="pb-4">
            {messages.map((message, idx) => (
              <ChatMessage
                key={message.id}
                message={message}
                onRegenerate={idx === messages.length - 1 && message.role === 'assistant' ? regenerateLastResponse : undefined}
                isLast={idx === messages.length - 1}
              />
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Input Area */}
      <ChatInput
        onSend={sendMessage}
        disabled={isLoading}
        currentModel={currentModel}
        availableModels={availableModels}
        onModelChange={setModel}
        placeholder={isLoading ? 'Esperando respuesta...' : 'Escribe tu mensaje...'}
      />
    </div>
  );
}
