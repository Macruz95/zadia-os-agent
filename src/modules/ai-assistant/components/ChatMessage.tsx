/**
 * ZADIA OS - Chat Message Component
 * 
 * Professional message bubble with support for:
 * - User and assistant messages
 * - Tool call results
 * - Attachments
 * - Copy functionality
 * - Markdown rendering
 */

'use client';

import { useState } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { 
  Bot, 
  User, 
  Copy, 
  Check, 
  RefreshCw,
  Wrench,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  Globe,
} from 'lucide-react';
import type { AIMessage, ToolCall } from '../types';

interface ChatMessageProps {
  message: AIMessage;
  onRegenerate?: () => void;
  isLast?: boolean;
}

function ToolCallBadge({ toolCall }: { toolCall: ToolCall }) {
  const statusIcons = {
    pending: <Clock className="h-3 w-3 animate-spin" />,
    running: <RefreshCw className="h-3 w-3 animate-spin" />,
    success: <CheckCircle2 className="h-3 w-3 text-emerald-400" />,
    error: <XCircle className="h-3 w-3 text-red-400" />,
  };

  const statusColors = {
    pending: 'border-yellow-500/30 bg-yellow-500/10 text-yellow-400',
    running: 'border-cyan-500/30 bg-cyan-500/10 text-cyan-400',
    success: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
    error: 'border-red-500/30 bg-red-500/10 text-red-400',
  };

  return (
    <Badge 
      variant="outline" 
      className={cn(
        "text-xs px-2 py-0.5 gap-1.5",
        statusColors[toolCall.status]
      )}
    >
      <Wrench className="h-3 w-3" />
      {toolCall.name.replace(/_/g, ' ')}
      {statusIcons[toolCall.status]}
    </Badge>
  );
}

export function ChatMessage({ message, onRegenerate, isLast }: ChatMessageProps) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === 'user';
  const isError = message.status === 'error';
  const isPending = message.status === 'pending';

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={cn(
      "group flex gap-4 px-4 py-6 transition-colors",
      isUser ? "bg-transparent" : "bg-[#161b22]/50",
      isError && "bg-red-500/5",
    )}>
      {/* Avatar */}
      <Avatar className={cn(
        "h-8 w-8 shrink-0 ring-2 ring-offset-2 ring-offset-[#0d1117]",
        isUser 
          ? "ring-gray-700" 
          : "ring-cyan-500/50"
      )}>
        <AvatarFallback className={cn(
          "text-white text-sm",
          isUser 
            ? "bg-gradient-to-br from-gray-600 to-gray-700" 
            : "bg-gradient-to-br from-cyan-500 to-purple-600"
        )}>
          {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
        </AvatarFallback>
      </Avatar>

      {/* Content */}
      <div className="flex-1 space-y-3 overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-2">
          <span className={cn(
            "font-medium text-sm",
            isUser ? "text-gray-300" : "text-cyan-400"
          )}>
            {isUser ? 'Tú' : 'ZADIA'}
          </span>
          
          {!isUser && message.metadata?.model && (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-gray-700 text-gray-500">
              <Sparkles className="h-2.5 w-2.5 mr-1" />
              {message.metadata.model.split('/').pop()?.replace(':free', '')}
            </Badge>
          )}
          
          {message.metadata?.webSearchUsed && (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-blue-500/30 text-blue-400">
              <Globe className="h-2.5 w-2.5 mr-1" />
              Web
            </Badge>
          )}

          <span className="text-[10px] text-gray-600">
            {message.timestamp.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>

        {/* Tool Calls */}
        {message.toolCalls && message.toolCalls.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {message.toolCalls.map((tc) => (
              <ToolCallBadge key={tc.id} toolCall={tc} />
            ))}
          </div>
        )}

        {/* Message Content */}
        {isPending ? (
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              <div className="h-2 w-2 rounded-full bg-cyan-500 animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="h-2 w-2 rounded-full bg-cyan-500 animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="h-2 w-2 rounded-full bg-cyan-500 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
            <span className="text-sm text-gray-500">Pensando...</span>
          </div>
        ) : (
          <div className={cn(
            "prose prose-invert prose-sm max-w-none",
            "prose-p:text-gray-300 prose-p:leading-relaxed",
            "prose-strong:text-white prose-strong:font-semibold",
            "prose-code:text-cyan-400 prose-code:bg-gray-800/50 prose-code:px-1 prose-code:py-0.5 prose-code:rounded",
            "prose-pre:bg-gray-900/50 prose-pre:border prose-pre:border-gray-800",
            "prose-ul:text-gray-300 prose-ol:text-gray-300",
            "prose-li:marker:text-cyan-500",
            "prose-a:text-cyan-400 prose-a:no-underline hover:prose-a:underline",
            isError && "text-red-400",
          )}>
            <p className="whitespace-pre-wrap">{message.content}</p>
          </div>
        )}

        {/* Attachments */}
        {message.attachments && message.attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {message.attachments.map((att) => (
              <div 
                key={att.id}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-800/50 border border-gray-700/50"
              >
                <span className="text-xs text-gray-400">{att.name}</span>
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        {!isUser && !isPending && (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              className="h-7 px-2 text-gray-500 hover:text-white hover:bg-gray-800/50"
            >
              {copied ? (
                <Check className="h-3.5 w-3.5 text-emerald-400" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
            </Button>
            
            {isLast && onRegenerate && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onRegenerate}
                className="h-7 px-2 text-gray-500 hover:text-white hover:bg-gray-800/50"
              >
                <RefreshCw className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
