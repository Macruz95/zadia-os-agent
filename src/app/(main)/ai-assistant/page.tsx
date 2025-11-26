/**
 * ZADIA OS - AI Assistant Page
 * 
 * Modern ChatGPT-style conversational AI interface
 * RULE #2: ShadCN UI + Lucide icons
 */

'use client';

import { useState, useRef, useEffect } from 'react';
import { useAIChat } from '@/hooks/use-ai-chat';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { 
  Bot, 
  User, 
  Send, 
  Trash2, 
  Save,
  Sparkles,
  Copy,
  Check,
  Zap,
  TrendingUp,
  Users,
  DollarSign,
  FolderOpen
} from 'lucide-react';

const SUGGESTED_PROMPTS = [
  {
    icon: TrendingUp,
    title: "Análisis de ventas",
    prompt: "¿Cómo van las ventas este mes comparado con el anterior?",
    color: "text-emerald-400"
  },
  {
    icon: Users,
    title: "Clientes activos",
    prompt: "¿Cuántos clientes activos tengo y cuál es su valor promedio?",
    color: "text-blue-400"
  },
  {
    icon: DollarSign,
    title: "Facturas pendientes",
    prompt: "¿Qué clientes tienen facturas pendientes de pago?",
    color: "text-orange-400"
  },
  {
    icon: FolderOpen,
    title: "Estado de proyectos",
    prompt: "Dame un resumen del estado de mis proyectos activos",
    color: "text-purple-400"
  }
];

export default function AIAssistantPage() {
  const {
    messages,
    sending,
    sendMessage,
    clearConversation,
    saveConversation,
    conversationTitle,
  } = useAIChat();

  const [input, setInput] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + 'px';
    }
  }, [input]);

  const handleSend = async () => {
    if (!input.trim() || sending) return;
    const messageToSend = input;
    setInput('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
    await sendMessage(messageToSend);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleCopy = async (content: string, id: string) => {
    await navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col bg-[#0d1117]">
      {/* Header */}
      <div className="border-b border-gray-800/50 bg-[#161b22]/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center justify-between max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                <Bot className="h-5 w-5 text-white" />
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-500 border-2 border-[#161b22]" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-white flex items-center gap-2">
                Asistente ZADIA
                <Badge variant="outline" className="text-[10px] px-1.5 py-0 font-normal border-cyan-500/30 text-cyan-400">
                  IA
                </Badge>
              </h1>
              <p className="text-xs text-gray-500">
                {messages.length > 0 ? conversationTitle : 'Listo para ayudarte'}
              </p>
            </div>
          </div>

          <div className="flex gap-1.5">
            <Button variant="ghost" size="sm" onClick={saveConversation} disabled={messages.length === 0}
              className="h-8 px-3 text-gray-400 hover:text-white hover:bg-gray-800/50">
              <Save className="h-4 w-4 mr-1.5" />
              <span className="hidden sm:inline">Guardar</span>
            </Button>
            <Button variant="ghost" size="sm" onClick={clearConversation} disabled={messages.length === 0}
              className="h-8 px-3 text-gray-400 hover:text-red-400 hover:bg-red-500/10">
              <Trash2 className="h-4 w-4 mr-1.5" />
              <span className="hidden sm:inline">Limpiar</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <ScrollArea ref={scrollRef} className="flex-1">
        <div className="max-w-4xl mx-auto px-4 py-6">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
              <div className="relative mb-8">
                <div className="h-24 w-24 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-purple-600/20 flex items-center justify-center border border-gray-800/50">
                  <Sparkles className="h-12 w-12 text-cyan-400" />
                </div>
                <div className="absolute -top-2 -right-2 h-8 w-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <Zap className="h-4 w-4 text-white" />
                </div>
              </div>
              
              <h2 className="text-2xl font-bold text-white mb-2">¿En qué puedo ayudarte hoy?</h2>
              <p className="text-gray-400 max-w-md mb-8">
                Soy tu asistente de inteligencia artificial. Puedo analizar tu negocio,
                responder preguntas y ayudarte a tomar mejores decisiones.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl">
                {SUGGESTED_PROMPTS.map((item, idx) => (
                  <button key={idx} onClick={() => { setInput(item.prompt); textareaRef.current?.focus(); }}
                    className="group flex items-start gap-3 p-4 rounded-xl bg-[#161b22] border border-gray-800/50 hover:border-cyan-500/30 hover:bg-[#1c2128] transition-all text-left">
                    <div className={cn("p-2 rounded-lg bg-gray-800/50 group-hover:bg-gray-800", item.color)}>
                      <item.icon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-200 group-hover:text-white">{item.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{item.prompt}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {messages.map((message) => (
                <div key={message.id} className={cn("flex gap-4", message.role === 'user' && "flex-row-reverse")}>
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarFallback className={cn("text-white",
                      message.role === 'assistant' ? 'bg-gradient-to-br from-cyan-500 to-purple-600' : 'bg-gradient-to-br from-gray-600 to-gray-700')}>
                      {message.role === 'assistant' ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
                    </AvatarFallback>
                  </Avatar>

                  <div className={cn("flex-1 max-w-[85%]", message.role === 'user' && "flex flex-col items-end")}>
                    <div className={cn("rounded-2xl px-4 py-3",
                      message.role === 'assistant' ? 'bg-[#161b22] border border-gray-800/50' : 'bg-cyan-600/20 border border-cyan-500/20')}>
                      <p className={cn("text-sm whitespace-pre-wrap leading-relaxed",
                        message.role === 'assistant' ? 'text-gray-200' : 'text-gray-100')}>{message.content}</p>
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
