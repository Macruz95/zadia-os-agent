/**
 * ZADIA OS - Chat Message Component (v2 - Clean & Minimal)
 * 
 * Professional message bubble with:
 * - No redundant "Tú" label for user messages
 * - Clean design without avatars for user messages
 * - Tool call results
 * - Copy functionality
 * - Markdown rendering
 */

'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { 
  Bot, 
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
    success: <CheckCircle2 className="h-3 w-3" />,
    error: <XCircle className="h-3 w-3" />,
  };

  const statusColors = {
    pending: 'border-amber-500/30 bg-amber-500/10 text-amber-500',
    running: 'border-primary/30 bg-primary/10 text-primary',
    success: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-500',
    error: 'border-destructive/30 bg-destructive/10 text-destructive',
  };

  return (
    <Badge 
      variant="outline" 
      className={cn("text-xs px-2 py-0.5 gap-1.5", statusColors[toolCall.status])}
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

  const formattedTime = useMemo(() => {
    const date = message.timestamp instanceof Date ? message.timestamp : new Date(message.timestamp);
    return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  }, [message.timestamp]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // User message - simple right-aligned bubble
  if (isUser) {
    return (
      <div className="flex justify-end mb-4">
        <div className="max-w-[85%] md:max-w-[75%]">
          <div className="bg-primary text-primary-foreground rounded-2xl rounded-br-md px-4 py-3">
            <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
          </div>
          <p className="text-[10px] text-muted-foreground text-right mt-1 mr-1">
            {formattedTime}
          </p>
        </div>
      </div>
    );
  }

  // Assistant message - left-aligned with avatar
  return (
    <div className="flex gap-3 mb-4 group">
      {/* ZADIA Avatar */}
      <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
        <Bot className="h-4 w-4 text-primary" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 space-y-2">
        {/* Header with model info */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium text-sm text-primary">ZADIA</span>
          
          {message.metadata?.model && (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0">
              <Sparkles className="h-2.5 w-2.5 mr-1" />
              {message.metadata.model.split('/').pop()?.replace(':free', '')}
            </Badge>
          )}
          
          {message.metadata?.webSearchUsed && (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-blue-500/30 text-blue-500">
              <Globe className="h-2.5 w-2.5 mr-1" />
              Web
            </Badge>
          )}

          <span className="text-[10px] text-muted-foreground">{formattedTime}</span>
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
              <div className="h-2 w-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="h-2 w-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="h-2 w-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
            <span className="text-sm text-muted-foreground">Pensando...</span>
          </div>
        ) : (
          <div className={cn(
            "prose prose-sm dark:prose-invert max-w-none",
            "prose-p:leading-relaxed prose-p:my-1",
            "prose-code:text-primary prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm",
            "prose-pre:bg-muted prose-pre:border",
            "prose-ul:my-2 prose-ol:my-2",
            "prose-li:my-0.5",
            "prose-a:text-primary prose-a:no-underline hover:prose-a:underline",
            isError && "text-destructive",
          )}>
            <p className="whitespace-pre-wrap break-words">{message.content}</p>
          </div>
        )}

        {/* Attachments */}
        {message.attachments && message.attachments.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {message.attachments.map((att) => (
              <div 
                key={att.id}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted text-sm"
              >
                {att.name}
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        {!isPending && (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              className="h-7 px-2 text-muted-foreground hover:text-foreground"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 mr-1 text-emerald-500" />
                  <span className="text-xs">Copiado</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5 mr-1" />
                  <span className="text-xs">Copiar</span>
                </>
              )}
            </Button>
            
            {isLast && onRegenerate && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onRegenerate}
                className="h-7 px-2 text-muted-foreground hover:text-foreground"
              >
                <RefreshCw className="h-3.5 w-3.5 mr-1" />
                <span className="text-xs">Regenerar</span>
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
