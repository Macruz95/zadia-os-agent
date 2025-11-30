/**
 * ZADIA OS - AI Model Selector Component
 * 
 * UI component for selecting AI model (auto/manual)
 * Similar to how VS Code/Cursor let you choose models
 */

'use client';

import { useState, useEffect } from 'react';
import { Check, ChevronDown, Sparkles, Zap, Brain, Code, Image, Globe, Bot } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export interface ModelOption {
  id: string;
  name: string;
  provider: string;
  capabilities: string[];
  speed: 'ultra-fast' | 'fast' | 'medium' | 'slow';
  quality: 'basic' | 'good' | 'excellent' | 'top-tier';
  isFree: boolean;
  supportsReasoning?: boolean;
  supportsImages?: boolean;
  supportsWebSearch?: boolean;
}

interface AIModelSelectorProps {
  mode: 'auto' | 'manual';
  selectedModelId?: string;
  onModeChange: (mode: 'auto' | 'manual') => void;
  onModelSelect: (modelId: string) => void;
  compact?: boolean;
  className?: string;
}

const CAPABILITY_ICONS: Record<string, React.ReactNode> = {
  reasoning: <Brain className="h-3 w-3" />,
  coding: <Code className="h-3 w-3" />,
  'image-analysis': <Image className="h-3 w-3" />,
  'web-search': <Globe className="h-3 w-3" />,
  fast: <Zap className="h-3 w-3" />,
  general: <Bot className="h-3 w-3" />,
};

const SPEED_COLORS: Record<string, string> = {
  'ultra-fast': 'text-green-500',
  'fast': 'text-emerald-500',
  'medium': 'text-yellow-500',
  'slow': 'text-orange-500',
};

const QUALITY_BADGES: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' }> = {
  'top-tier': { label: '⭐ Top', variant: 'default' },
  'excellent': { label: 'Excellent', variant: 'secondary' },
  'good': { label: 'Good', variant: 'outline' },
  'basic': { label: 'Basic', variant: 'outline' },
};

export function AIModelSelector({
  mode,
  selectedModelId,
  onModeChange,
  onModelSelect,
  compact = false,
  className,
}: AIModelSelectorProps) {
  const [models, setModels] = useState<ModelOption[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchModels() {
      try {
        const response = await fetch('/api/ai/chat');
        if (response.ok) {
          const data = await response.json();
          setModels(data.models || []);
        }
      } catch {
        // Silently fail - will show empty list
      } finally {
        setLoading(false);
      }
    }
    fetchModels();
  }, []);

  const selectedModel = models.find(m => m.id === selectedModelId);

  if (compact) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className={cn("h-7 gap-1 text-xs", className)}>
            {mode === 'auto' ? (
              <>
                <Sparkles className="h-3 w-3 text-purple-500" />
                <span>Auto</span>
              </>
            ) : (
              <>
                <Bot className="h-3 w-3" />
                <span className="max-w-[80px] truncate">{selectedModel?.name || 'Select'}</span>
              </>
            )}
            <ChevronDown className="h-3 w-3 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          <DropdownMenuLabel className="text-xs text-muted-foreground">
            Selección de Modelo
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          {/* Auto mode */}
          <DropdownMenuItem onClick={() => onModeChange('auto')} className="gap-2">
            <Sparkles className="h-4 w-4 text-purple-500" />
            <div className="flex-1">
              <div className="font-medium">Automático</div>
              <div className="text-xs text-muted-foreground">
                El sistema elige el mejor modelo
              </div>
            </div>
            {mode === 'auto' && <Check className="h-4 w-4" />}
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          <DropdownMenuLabel className="text-xs text-muted-foreground">
            Modelos Disponibles
          </DropdownMenuLabel>
          
          {loading ? (
            <DropdownMenuItem disabled>Cargando modelos...</DropdownMenuItem>
          ) : (
            models.slice(0, 10).map(model => (
              <DropdownMenuItem
                key={model.id}
                onClick={() => {
                  onModeChange('manual');
                  onModelSelect(model.id);
                }}
                className="gap-2"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-1">
                    <span className="font-medium text-sm">{model.name}</span>
                    {model.isFree && (
                      <Badge variant="secondary" className="text-[10px] px-1 py-0">
                        Free
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <span className={SPEED_COLORS[model.speed]}>{model.speed}</span>
                    <span>•</span>
                    <span>{model.provider}</span>
                  </div>
                </div>
                {mode === 'manual' && selectedModelId === model.id && (
                  <Check className="h-4 w-4" />
                )}
              </DropdownMenuItem>
            ))
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  // Full version
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">Modelo de IA:</span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              {mode === 'auto' ? (
                <>
                  <Sparkles className="h-4 w-4 text-purple-500" />
                  <span>Automático</span>
                </>
              ) : (
                <>
                  <Bot className="h-4 w-4" />
                  <span>{selectedModel?.name || 'Seleccionar modelo'}</span>
                </>
              )}
              <ChevronDown className="h-4 w-4 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-80">
            <DropdownMenuLabel>Selección de Modelo</DropdownMenuLabel>
            <DropdownMenuSeparator />
            
            {/* Auto mode */}
            <DropdownMenuItem onClick={() => onModeChange('auto')} className="gap-3 py-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900">
                <Sparkles className="h-5 w-5 text-purple-500" />
              </div>
              <div className="flex-1">
                <div className="font-medium">Modo Automático</div>
                <div className="text-xs text-muted-foreground">
                  ZADIA selecciona el mejor modelo según tu mensaje
                </div>
              </div>
              {mode === 'auto' && <Check className="h-5 w-5 text-primary" />}
            </DropdownMenuItem>
            
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Modelos Manuales
            </DropdownMenuLabel>
            
            {loading ? (
              <DropdownMenuItem disabled className="py-4">
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  <span>Cargando modelos...</span>
                </div>
              </DropdownMenuItem>
            ) : (
              <div className="max-h-[300px] overflow-y-auto">
                {models.map(model => (
                  <DropdownMenuItem
                    key={model.id}
                    onClick={() => {
                      onModeChange('manual');
                      onModelSelect(model.id);
                    }}
                    className="gap-3 py-3"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{model.name}</span>
                        {model.isFree && (
                          <Badge variant="secondary" className="text-xs">Free</Badge>
                        )}
                        <Badge {...QUALITY_BADGES[model.quality]} className="text-xs">
                          {QUALITY_BADGES[model.quality].label}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={cn("text-xs", SPEED_COLORS[model.speed])}>
                          {model.speed}
                        </span>
                        <span className="text-xs text-muted-foreground">•</span>
                        <span className="text-xs text-muted-foreground">{model.provider}</span>
                        <span className="text-xs text-muted-foreground">•</span>
                        <div className="flex items-center gap-1">
                          {model.capabilities.slice(0, 3).map(cap => (
                            <span key={cap} className="text-muted-foreground" title={cap}>
                              {CAPABILITY_ICONS[cap] || null}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    {mode === 'manual' && selectedModelId === model.id && (
                      <Check className="h-5 w-5 text-primary" />
                    )}
                  </DropdownMenuItem>
                ))}
              </div>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      {mode === 'auto' && (
        <p className="text-xs text-muted-foreground">
          💡 El sistema analiza tu mensaje y elige automáticamente el mejor modelo.
        </p>
      )}
      
      {mode === 'manual' && selectedModel && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>Usando:</span>
          <span className="font-medium">{selectedModel.name}</span>
          <span>•</span>
          <span className={SPEED_COLORS[selectedModel.speed]}>{selectedModel.speed}</span>
          {selectedModel.supportsReasoning && (
            <Badge variant="outline" className="text-[10px]">
              <Brain className="h-2.5 w-2.5 mr-1" />
              Reasoning
            </Badge>
          )}
          {selectedModel.supportsImages && (
            <Badge variant="outline" className="text-[10px]">
              <Image className="h-2.5 w-2.5 mr-1" />
              Vision
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}

export default AIModelSelector;
