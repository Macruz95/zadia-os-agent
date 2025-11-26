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
                    </div>
                    
                    <div className={cn("flex items-center gap-2 mt-1.5 px-1", message.role === 'user' && "flex-row-reverse")}>
                      <span className="text-[10px] text-gray-600">
                        {message.timestamp.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {message.role === 'assistant' && (
                        <Button variant="ghost" size="sm" onClick={() => handleCopy(message.content, message.id)}
                          className="h-6 w-6 p-0 text-gray-600 hover:text-gray-400">
                          {copiedId === message.id ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                        </Button>
                      )}
                      {typeof message.metadata?.model === 'string' && (
                        <Badge variant="outline" className="text-[9px] px-1 py-0 border-gray-800 text-gray-600">
                          {message.metadata.model.split('/').pop()}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {sending && (
                <div className="flex gap-4">
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarFallback className="bg-gradient-to-br from-cyan-500 to-purple-600 text-white">
                      <Bot className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-[#161b22] border border-gray-800/50 rounded-2xl px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <div className="h-2 w-2 rounded-full bg-cyan-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="h-2 w-2 rounded-full bg-cyan-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="h-2 w-2 rounded-full bg-cyan-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="border-t border-gray-800/50 bg-[#161b22]/80 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="relative flex items-end gap-2 bg-[#0d1117] border border-gray-800/50 rounded-2xl p-2 focus-within:border-cyan-500/50 transition-colors">
            <Textarea ref={textareaRef} value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown}
              placeholder="Escribe tu mensaje..." disabled={sending}
              className="flex-1 min-h-[44px] max-h-[200px] px-3 py-2.5 bg-transparent border-0 resize-none text-white placeholder:text-gray-600 focus-visible:ring-0 focus-visible:ring-offset-0"
              rows={1} />
            <Button onClick={handleSend} disabled={!input.trim() || sending} size="sm"
              className={cn("h-10 w-10 rounded-xl shrink-0 transition-all",
                input.trim() && !sending
                  ? "bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white shadow-lg shadow-cyan-500/20"
                  : "bg-gray-800 text-gray-600")}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-[10px] text-gray-600 text-center mt-2">
            ZADIA puede cometer errores. Verifica la información importante.
          </p>
        </div>
      </div>
    </div>
  );
}
