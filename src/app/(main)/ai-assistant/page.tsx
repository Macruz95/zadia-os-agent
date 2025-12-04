/**
 * ZADIA OS - AI Assistant Page (Redesigned v4 - Clean & Minimal)
 * 
 * Professional AI chat interface with:
 * - Persistent conversation history (Firestore)
 * - Collapsible sidebar with real history
 * - Clean messages without redundant labels
 * - Fixed message overflow issues
 * - Mobile responsive
 */

'use client';

import { useRef, useEffect, useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { 
  Plus, 
  Search, 
  MessageSquare, 
  Trash2,
  ChevronDown,
  Send,
  Sparkles,
  Zap,
  Brain,
  Code,
  Eye,
  Bot,
  MoreHorizontal,
  Check,
  PanelLeftClose,
  PanelLeft,
  Loader2,
} from 'lucide-react';
import { 
  ChatMessage, 
  useAdvancedAIChat,
} from '@/modules/ai-assistant';

// Model icons mapping (verified Dec 2025)
const MODEL_ICONS: Record<string, React.ReactNode> = {
  'kat-coder-pro': <Code className="h-4 w-4" />,
  'amazon-nova-2-lite': <Zap className="h-4 w-4" />,
  'gemini-2.0-flash': <Sparkles className="h-4 w-4" />,
  'tongyi-deepresearch': <Brain className="h-4 w-4" />,
  'tng-r1t-chimera': <Brain className="h-4 w-4" />,
  'longcat-flash': <Zap className="h-4 w-4" />,
  'olmo-3-32b': <Brain className="h-4 w-4" />,
  'nemotron-nano-12b': <Eye className="h-4 w-4" />,
  'groq-llama-3.3-70b': <Zap className="h-4 w-4" />,
};

export default function AIAssistantPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const {
    messages,
    isLoading,
    currentModel,
    availableModels,
    sendMessage,
    setModel,
    clearChat,
    regenerateLastResponse,
    conversationTitle,
    modelMode,
    setModelMode,
    // Persistence
    conversations,
    currentConversationId,
    loadConversation,
    deleteConversation,
    isLoadingHistory,
  } = useAdvancedAIChat({
    defaultModel: 'kat-coder-pro',
    defaultMode: 'auto',
    enableTools: true,
    enableWebSearch: true,
  });

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      const scrollElement = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + 'px';
    }
  }, [input]);

  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    sendMessage(input.trim());
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Filter conversations by search
  const filteredConversations = conversations.filter(conv =>
    conv.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Suggested prompts
  const suggestedPrompts = [
    { icon: '📊', title: 'Análisis de ventas', prompt: 'Analiza las ventas de este mes' },
    { icon: '👥', title: 'Top clientes', prompt: '¿Cuáles son mis mejores clientes?' },
    { icon: '📋', title: 'Proyectos', prompt: 'Resumen de proyectos activos' },
    { icon: '💰', title: 'Finanzas', prompt: 'Análisis de gastos vs ingresos' },
  ];

  return (
    <div className="h-[calc(100vh-3.5rem)] flex bg-background overflow-hidden">
      {/* ═══════════════════════════════════════════════════════════════════
          LEFT SIDEBAR - Real Conversation History
          ═══════════════════════════════════════════════════════════════════ */}
      <aside className={cn(
        "flex flex-col border-r border-border bg-muted/30 transition-all duration-300",
        sidebarOpen ? "w-64" : "w-0 overflow-hidden"
      )}>
        {/* New Chat Button */}
        <div className="p-3 border-b border-border">
          <Button
            onClick={clearChat}
            variant="outline"
            className="w-full justify-start gap-2"
          >
            <Plus className="h-4 w-4" />
            Nuevo chat
          </Button>
        </div>

        {/* Search */}
        <div className="p-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9"
            />
          </div>
        </div>

        {/* Conversations List */}
        <ScrollArea className="flex-1">
          <div className="px-2 space-y-1">
            {isLoadingHistory ? (
              // Loading skeletons
              <div className="space-y-2 p-2">
                {[1, 2, 3].map(i => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : filteredConversations.length > 0 ? (
              filteredConversations.map(conv => (
                <div
                  key={conv.id}
                  onClick={() => loadConversation(conv.id)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2.5 rounded-lg cursor-pointer transition-colors group",
                    currentConversationId === conv.id
                      ? "bg-primary/10 text-primary"
                      : "hover:bg-muted"
                  )}
                >
                  <MessageSquare className="h-4 w-4 flex-shrink-0 opacity-60" />
                  <span className="flex-1 truncate text-sm">{conv.title}</span>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreHorizontal className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                      <DropdownMenuItem 
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteConversation(conv.id);
                        }} 
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))
            ) : (
              // Empty state
              <div className="px-4 py-8 text-center">
                <MessageSquare className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
                <p className="text-sm text-muted-foreground">Sin conversaciones</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </aside>

      {/* ═══════════════════════════════════════════════════════════════════
          MAIN CHAT AREA
          ═══════════════════════════════════════════════════════════════════ */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-background/80 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            {/* Toggle Sidebar */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="h-8 w-8"
            >
              {sidebarOpen ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeft className="h-4 w-4" />}
            </Button>

            {/* Model Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2 font-medium">
                  <Bot className="h-4 w-4 text-primary" />
                  <span>ZADIA</span>
                  <span className="text-muted-foreground text-sm hidden sm:inline">
                    {modelMode === 'auto' ? 'Auto' : currentModel.name}
                  </span>
                  <ChevronDown className="h-3 w-3 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-72">
                <DropdownMenuLabel>Modelo de IA</DropdownMenuLabel>
                <DropdownMenuSeparator />
                
                {/* Auto Mode */}
                <DropdownMenuItem
                  onClick={() => setModelMode('auto')}
                  className={cn("gap-3 py-2.5", modelMode === 'auto' && "bg-primary/10")}
                >
                  <Sparkles className="h-4 w-4 text-primary" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Automático</span>
                      <Badge variant="secondary" className="text-[10px]">Recomendado</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">ZADIA elige el mejor modelo</p>
                  </div>
                  {modelMode === 'auto' && <Check className="h-4 w-4 text-primary" />}
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                {/* Models */}
                <div className="max-h-[250px] overflow-y-auto">
                  {availableModels.map(model => (
                    <DropdownMenuItem
                      key={model.id}
                      onClick={() => {
                        setModelMode('manual');
                        setModel(model.id);
                      }}
                      className={cn(
                        "gap-3 py-2",
                        modelMode === 'manual' && currentModel.id === model.id && "bg-primary/10"
                      )}
                    >
                      <div className="h-7 w-7 rounded-md bg-muted flex items-center justify-center">
                        {MODEL_ICONS[model.id] || <Bot className="h-3.5 w-3.5" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{model.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{model.description}</p>
                      </div>
                      {modelMode === 'manual' && currentModel.id === model.id && (
                        <Check className="h-4 w-4 text-primary flex-shrink-0" />
                      )}
                    </DropdownMenuItem>
                  ))}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Messages Area */}
        <ScrollArea ref={scrollRef} className="flex-1">
          {messages.length === 0 ? (
            /* Welcome Screen */
            <div className="h-full flex flex-col items-center justify-center p-6">
              <div className="max-w-lg w-full text-center space-y-6">
                <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
                  <Bot className="h-7 w-7 text-primary" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold mb-1">¿En qué puedo ayudarte?</h1>
                  <p className="text-muted-foreground text-sm">
                    Soy ZADIA, tu asistente de IA empresarial.
                  </p>
                </div>

                {/* Quick Prompts */}
                <div className="grid grid-cols-2 gap-2">
                  {suggestedPrompts.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => sendMessage(item.prompt)}
                      className="flex items-center gap-2 p-3 rounded-lg text-left border border-border hover:bg-muted/50 transition-colors"
                    >
                      <span className="text-lg">{item.icon}</span>
                      <span className="text-sm">{item.title}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Messages */
            <div className="max-w-3xl mx-auto py-4 px-4 space-y-4">
              {messages.filter(m => m && m.id && m.role).map((message, idx) => (
                <ChatMessage
                  key={message.id}
                  message={message}
                  onRegenerate={idx === messages.length - 1 && message.role === 'assistant' ? regenerateLastResponse : undefined}
                  isLast={idx === messages.length - 1}
                />
              ))}
              
              {/* Loading indicator */}
              {isLoading && messages.length > 0 && messages[messages.length - 1]?.role === 'assistant' && 
               messages[messages.length - 1]?.status === 'pending' && (
                <div className="flex items-center gap-2 text-muted-foreground text-sm pl-10">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Pensando...</span>
                </div>
              )}
            </div>
          )}
        </ScrollArea>

        {/* Input Area */}
        <div className="border-t border-border p-4">
          <div className="max-w-3xl mx-auto">
            <div className={cn(
              "flex items-end gap-2 rounded-xl border bg-background transition-all",
              "focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary/50"
            )}>
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Escribe tu mensaje..."
                disabled={isLoading}
                className="flex-1 min-h-[44px] max-h-[200px] py-3 px-4 bg-transparent resize-none focus:outline-none text-sm"
                rows={1}
              />
              <Button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                size="sm"
                className="m-1.5 h-8 w-8 p-0 rounded-lg"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-center text-[11px] text-muted-foreground mt-2">
              ZADIA puede cometer errores. Verifica la información importante.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
