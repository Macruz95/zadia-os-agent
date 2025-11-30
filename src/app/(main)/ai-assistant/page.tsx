/**
 * ZADIA OS - AI Assistant Page (Redesigned v3)
 * 
 * Professional AI chat interface inspired by ChatGPT but enhanced:
 * - Left sidebar with conversation history
 * - Single model selector in header (like ChatGPT 5.1)
 * - Optimized layout without unnecessary scroll
 * - ZADIA professional design language
 */

'use client';

import { useRef, useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
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
  Paperclip,
  Sparkles,
  Zap,
  Brain,
  Code,
  Eye,
  Bot,
  MoreHorizontal,
  Check,
  Globe,
  PanelLeftClose,
  PanelLeft,
} from 'lucide-react';
import { 
  ChatMessage, 
  useAdvancedAIChat,
  AI_MODELS,
} from '@/modules/ai-assistant';

// Model icons mapping
const MODEL_ICONS: Record<string, React.ReactNode> = {
  'grok-4.1-fast': <Zap className="h-4 w-4" />,
  'grok-4.1-mini': <Globe className="h-4 w-4" />,
  'deepseek-r1': <Brain className="h-4 w-4" />,
  'qwen3-coder': <Code className="h-4 w-4" />,
  'gemini-2.5-pro': <Sparkles className="h-4 w-4" />,
  'gemini-2.5-flash': <Sparkles className="h-4 w-4" />,
  'glm-4.5-thinking': <Brain className="h-4 w-4" />,
  'llama-4-maverick': <Eye className="h-4 w-4" />,
  'llama-4-scout': <Eye className="h-4 w-4" />,
};

export default function AIAssistantPage() {
  const { user } = useAuth();
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
  } = useAdvancedAIChat({
    defaultModel: 'grok-4.1-fast',
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

  const handleNewChat = () => {
    clearChat();
  };

  const handleSelectPrompt = (prompt: string) => {
    sendMessage(prompt);
  };

  // Suggested prompts
  const suggestedPrompts = [
    { icon: '📊', title: 'Análisis de ventas', prompt: 'Analiza las ventas de este mes y compáralas con el mes anterior' },
    { icon: '👥', title: 'Clientes importantes', prompt: '¿Cuáles son mis 5 clientes más importantes por facturación?' },
    { icon: '📋', title: 'Estado de proyectos', prompt: 'Dame un resumen del estado de todos mis proyectos activos' },
    { icon: '💰', title: 'Reporte financiero', prompt: 'Genera un análisis de gastos vs ingresos del último trimestre' },
  ];

  return (
    <div className="h-[calc(100vh-3.5rem)] flex bg-[#0d1117]">
      {/* ═══════════════════════════════════════════════════════════════════
          LEFT SIDEBAR - Conversation History
          ═══════════════════════════════════════════════════════════════════ */}
      <div className={cn(
        "flex flex-col border-r border-gray-800/50 bg-[#0a0d12] transition-all duration-300",
        sidebarOpen ? "w-64" : "w-0 overflow-hidden"
      )}>
        {/* New Chat Button */}
        <div className="p-3">
          <Button
            onClick={handleNewChat}
            className="w-full justify-start gap-2 bg-transparent border border-gray-700/50 hover:bg-gray-800/50 text-gray-300"
          >
            <Plus className="h-4 w-4" />
            Nuevo chat
          </Button>
        </div>

        {/* Search */}
        <div className="px-3 pb-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Buscar chats..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-gray-800/30 border-gray-700/50 text-sm h-9"
            />
          </div>
        </div>

        {/* Conversations List */}
        <ScrollArea className="flex-1">
          <div className="px-2 py-1">
            {/* Today */}
            {messages.length > 0 && (
              <>
                <p className="px-2 py-2 text-xs text-gray-500 font-medium">Hoy</p>
                <div
                  className={cn(
                    "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-colors group cursor-pointer",
                    "bg-gray-800/50 text-white hover:bg-gray-700/50"
                  )}
                >
                  <MessageSquare className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  <span className="flex-1 truncate text-sm">{conversationTitle}</span>
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
                      <DropdownMenuItem onClick={clearChat} className="text-red-400">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </>
            )}

            {/* Empty state */}
            {messages.length === 0 && (
              <div className="px-4 py-8 text-center">
                <MessageSquare className="h-8 w-8 mx-auto text-gray-600 mb-2" />
                <p className="text-sm text-gray-500">Sin conversaciones</p>
                <p className="text-xs text-gray-600 mt-1">Inicia un nuevo chat</p>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* User Info */}
        <div className="p-3 border-t border-gray-800/50">
          <div className="flex items-center gap-2 px-2 py-1">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center text-white text-xs font-medium">
              {user?.displayName?.charAt(0) || user?.email?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white truncate">{user?.displayName || 'Usuario'}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          MAIN CHAT AREA
          ═══════════════════════════════════════════════════════════════════ */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header with Model Selector */}
        <header className="flex items-center justify-between px-4 py-3 border-b border-gray-800/50 bg-[#0d1117]/80 backdrop-blur-md">
          {/* Left: Toggle Sidebar + Model Selector */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="h-9 w-9 p-0 text-gray-400 hover:text-white"
            >
              {sidebarOpen ? <PanelLeftClose className="h-5 w-5" /> : <PanelLeft className="h-5 w-5" />}
            </Button>

            {/* Model Selector (Single, like ChatGPT) */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2 text-white hover:bg-gray-800/50">
                  <Bot className="h-5 w-5 text-cyan-400" />
                  <span className="font-semibold">ZADIA</span>
                  <span className="text-gray-400 text-sm hidden sm:inline">{currentModel.name}</span>
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-80 bg-[#161b22] border-gray-800/50">
                <DropdownMenuLabel className="text-gray-400">Seleccionar Modelo</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-gray-800/50" />
                
                {/* Auto Mode */}
                <DropdownMenuItem
                  onClick={() => setModelMode('auto')}
                  className={cn(
                    "gap-3 py-3 cursor-pointer",
                    modelMode === 'auto' && "bg-cyan-500/10"
                  )}
                >
                  <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center">
                    <Sparkles className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-white">Automático</span>
                      <Badge className="text-[10px] bg-purple-500/20 text-purple-400 border-0">
                        RECOMENDADO
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500">ZADIA elige el mejor modelo para cada tarea</p>
                  </div>
                  {modelMode === 'auto' && <Check className="h-5 w-5 text-cyan-400" />}
                </DropdownMenuItem>

                <DropdownMenuSeparator className="bg-gray-800/50" />
                <DropdownMenuLabel className="text-gray-500 text-xs">Modelos Disponibles</DropdownMenuLabel>

                {/* Model List */}
                <div className="max-h-[300px] overflow-y-auto">
                  {availableModels.map(model => (
                    <DropdownMenuItem
                      key={model.id}
                      onClick={() => {
                        setModelMode('manual');
                        setModel(model.id);
                      }}
                      className={cn(
                        "gap-3 py-2.5 cursor-pointer",
                        modelMode === 'manual' && currentModel.id === model.id && "bg-cyan-500/10"
                      )}
                    >
                      <div className="h-8 w-8 rounded-lg bg-gray-800 flex items-center justify-center text-gray-300">
                        {MODEL_ICONS[model.id] || <Bot className="h-4 w-4" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-white text-sm">{model.name}</span>
                          <Badge variant="outline" className="text-[9px] px-1 py-0 border-emerald-500/30 text-emerald-400">
                            GRATIS
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-500 truncate">{model.description}</p>
                      </div>
                      {modelMode === 'manual' && currentModel.id === model.id && (
                        <Check className="h-4 w-4 text-cyan-400 flex-shrink-0" />
                      )}
                    </DropdownMenuItem>
                  ))}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-2">
            {messages.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearChat}
                className="text-gray-400 hover:text-red-400"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </header>

        {/* Messages Area */}
        <ScrollArea ref={scrollRef} className="flex-1">
          {messages.length === 0 ? (
            /* Empty State - Welcome Screen */
            <div className="h-full flex flex-col items-center justify-center px-4 py-8">
              <div className="max-w-2xl w-full text-center space-y-6">
                {/* Logo */}
                <div className="flex justify-center">
                  <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                    <Bot className="h-8 w-8 text-white" />
                  </div>
                </div>

                {/* Welcome Text */}
                <div>
                  <h1 className="text-2xl font-bold text-white mb-2">¿En qué puedo ayudarte?</h1>
                  <p className="text-gray-400">
                    Soy <span className="text-cyan-400 font-medium">ZADIA</span>, tu asistente de IA empresarial.
                  </p>
                </div>

                {/* Suggested Prompts */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-8">
                  {suggestedPrompts.map((prompt, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSelectPrompt(prompt.prompt)}
                      className={cn(
                        "flex items-start gap-3 p-4 rounded-xl text-left transition-all",
                        "bg-gray-800/30 border border-gray-700/50",
                        "hover:bg-gray-800/50 hover:border-cyan-500/30"
                      )}
                    >
                      <span className="text-xl">{prompt.icon}</span>
                      <div>
                        <p className="font-medium text-white text-sm">{prompt.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{prompt.prompt}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Messages */
            <div className="max-w-3xl mx-auto py-4 px-4">
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
        <div className="border-t border-gray-800/50 bg-[#0d1117] p-4">
          <div className="max-w-3xl mx-auto">
            <div className={cn(
              "relative flex items-end gap-2 rounded-2xl border transition-all",
              "bg-[#161b22] border-gray-700/50",
              "focus-within:border-cyan-500/50 focus-within:ring-2 focus-within:ring-cyan-500/10"
            )}>
              {/* Textarea */}
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Escribe tu mensaje..."
                disabled={isLoading}
                className={cn(
                  "flex-1 min-h-[52px] max-h-[200px] py-4 px-4",
                  "bg-transparent border-0 resize-none",
                  "text-white placeholder:text-gray-500",
                  "focus:outline-none focus:ring-0"
                )}
                rows={1}
              />

              {/* Action Buttons */}
              <div className="flex items-center gap-1 mr-2 mb-3">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-9 w-9 p-0 text-gray-500 hover:text-white hover:bg-gray-800/50 rounded-xl"
                >
                  <Paperclip className="h-4 w-4" />
                </Button>

                <Button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  size="sm"
                  className={cn(
                    "h-9 w-9 p-0 rounded-xl transition-all",
                    input.trim() && !isLoading
                      ? "bg-cyan-500 hover:bg-cyan-600 text-white"
                      : "bg-gray-700 text-gray-500"
                  )}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Footer */}
            <p className="text-center text-[11px] text-gray-600 mt-2">
              ZADIA puede cometer errores. Verifica la información importante.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
