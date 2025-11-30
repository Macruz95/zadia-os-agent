/**
 * ZADIA OS - AI Assistant Chat Header
 * 
 * Header with intelligent model selector, status, and actions
 * Supports auto and manual model selection like VS Code / Cursor
 */

'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { 
  Bot, 
  Trash2, 
  History, 
  Settings2,
  Sparkles,
  Zap,
  Loader2,
} from 'lucide-react';
import { AIModelSelector } from './AIModelSelector';
import type { AIModelMode } from '../hooks/use-advanced-ai-chat';

interface ChatHeaderProps {
  conversationTitle: string;
  isLoading?: boolean;
  isProcessingTool?: boolean;
  messageCount: number;
  onClear: () => void;
  onOpenHistory?: () => void;
  onOpenSettings?: () => void;
  // Model selection props
  modelMode: AIModelMode;
  onModelModeChange: (mode: AIModelMode) => void;
  selectedModel: string | null;
  onModelChange: (modelId: string | null) => void;
  lastUsedModel?: string | null;
}

export function ChatHeader({
  conversationTitle,
  isLoading,
  isProcessingTool,
  messageCount,
  onClear,
  onOpenHistory,
  onOpenSettings,
  modelMode,
  onModelModeChange,
  selectedModel,
  onModelChange,
  lastUsedModel,
}: ChatHeaderProps) {
  return (
    <div className="border-b border-gray-800/50 bg-[#0d1117]/80 backdrop-blur-md sticky top-0 z-20">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Left: Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className={cn(
              "h-10 w-10 rounded-xl flex items-center justify-center shadow-lg transition-all",
              "bg-gradient-to-br from-cyan-500 to-purple-600 shadow-cyan-500/20",
              isLoading && "animate-pulse"
            )}>
              <Bot className="h-5 w-5 text-white" />
            </div>
            <div className={cn(
              "absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[#0d1117]",
              isLoading ? "bg-yellow-500 animate-pulse" : "bg-emerald-500"
            )} />
          </div>
          
          <div>
            <h1 className="text-lg font-semibold text-white flex items-center gap-2">
              ZADIA
              <Badge 
                variant="outline" 
                className="text-[10px] px-1.5 py-0 font-normal border-cyan-500/30 text-cyan-400 hidden sm:inline-flex"
              >
                <Sparkles className="h-2.5 w-2.5 mr-1" />
                IA Empresarial
              </Badge>
            </h1>
            <div className="flex items-center gap-2">
              <p className="text-xs text-gray-500 max-w-[200px] sm:max-w-[300px] truncate">
                {isProcessingTool ? (
                  <span className="text-cyan-400 flex items-center gap-1">
                    <Zap className="h-3 w-3" />
                    Ejecutando acción...
                  </span>
                ) : isLoading ? (
                  <span className="text-yellow-400 flex items-center gap-1">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Pensando...
                  </span>
                ) : (
                  conversationTitle
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Center: Model Selector */}
        <div className="hidden md:flex items-center gap-2">
          <AIModelSelector
            mode={modelMode}
            onModeChange={onModelModeChange}
            selectedModelId={selectedModel ?? undefined}
            onModelSelect={onModelChange}
          />
          {lastUsedModel && modelMode === 'auto' && (
            <Badge 
              variant="outline" 
              className="text-[9px] px-1.5 py-0 border-purple-500/30 text-purple-400"
            >
              Último: {lastUsedModel.split('/').pop()?.slice(0, 15)}...
            </Badge>
          )}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1">
          {messageCount > 0 && (
            <Badge variant="outline" className="text-[10px] px-2 py-0 border-gray-700 text-gray-500 mr-2 hidden sm:inline-flex">
              {messageCount} {messageCount === 1 ? 'mensaje' : 'mensajes'}
            </Badge>
          )}

          {onOpenHistory && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onOpenHistory}
                    className="h-8 w-8 p-0 text-gray-400 hover:text-white hover:bg-gray-800/50"
                  >
                    <History className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">Historial</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}

          {onOpenSettings && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onOpenSettings}
                    className="h-8 w-8 p-0 text-gray-400 hover:text-white hover:bg-gray-800/50"
                  >
                    <Settings2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">Configuración</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClear}
                  disabled={messageCount === 0}
                  className="h-8 w-8 p-0 text-gray-400 hover:text-red-400 hover:bg-red-500/10 disabled:opacity-30"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">Limpiar chat</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </div>
  );
}
