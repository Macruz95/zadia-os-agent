/**
 * ZADIA OS - Command Bar Component
 * 
 * Universal command palette (Cmd+K)
 * Rule #2: ShadCN UI + Lucide icons only
 * Rule #5: Max 200 lines
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';
import { VisuallyHidden } from '@/components/ui/visually-hidden';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Users, Briefcase, FileText, FileEdit, Target, UserPlus,
  CheckSquare, Loader2, Search, Zap, MessageSquare,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { CommandSearchService } from '@/services/command-search.service';
import { CommandExecutorService } from '@/services/command-executor.service';
import { CommandAIService } from '@/services/command-ai.service';
import { detectCommandBarMode } from '@/types/command-bar.types';
import type { SearchResults } from '@/types/command-bar.types';

const ICONS = {
  client: Users,
  project: Briefcase,
  invoice: FileText,
  quote: FileEdit,
  opportunity: Target,
  lead: UserPlus,
  task: CheckSquare,
} as const;

export function CommandBar() {
  const router = useRouter();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResults | null>(null);
  const [commandResult, setCommandResult] = useState<string | null>(null);
  const [questionAnswer, setQuestionAnswer] = useState<string | null>(null);

  // Keyboard shortcut: Cmd+K / Ctrl+K
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  // Handle input change with debounce
  useEffect(() => {
    if (!input.trim() || !user?.uid) {
      setResults(null);
      setCommandResult(null);
      setQuestionAnswer(null);
      return;
    }

    const timer = setTimeout(async () => {
      const mode = detectCommandBarMode(input);

      if (mode === 'search') {
        await handleSearch();
      } else if (mode === 'command') {
        await handleCommand();
      } else if (mode === 'question') {
        await handleQuestion();
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [input, user?.uid]);

  const handleSearch = async () => {
    if (!user?.uid) return;

    setLoading(true);
    try {
      const searchResults = await CommandSearchService.search(input, user.uid);
      setResults(searchResults);
      setCommandResult(null);
      setQuestionAnswer(null);
    } finally {
      setLoading(false);
    }
  };

  const handleCommand = async () => {
    if (!user?.uid) return;

    setLoading(true);
    try {
      const result = await CommandExecutorService.executeCommand(input, user.uid);
      setCommandResult(result.message);
      setResults(null);
      setQuestionAnswer(null);

      if (result.success && result.redirectUrl) {
        setTimeout(() => {
          router.push(result.redirectUrl!);
          setOpen(false);
          setInput('');
        }, 1500);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleQuestion = async () => {
    if (!user?.uid) return;

    setLoading(true);
    try {
      const response = await CommandAIService.processQuestion(input, user.uid);
      setQuestionAnswer(response.answer);
      setResults(null);
      setCommandResult(null);
    } finally {
      setLoading(false);
    }
  };

  const handleResultClick = (url?: string) => {
    if (url) {
      router.push(url);
      setOpen(false);
      setInput('');
      setResults(null);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setInput('');
    setResults(null);
    setCommandResult(null);
    setQuestionAnswer(null);
  };

  const mode = detectCommandBarMode(input);
  const totalResults = results ? Object.values(results).flat().length : 0;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl p-0">
        <VisuallyHidden>
          <DialogTitle>
            {mode === 'command' 
              ? 'Barra de Comandos' 
              : mode === 'question' 
              ? 'Asistente de Preguntas' 
              : 'Búsqueda Global'}
          </DialogTitle>
        </VisuallyHidden>
        
        <div className="flex items-center border-b px-4 py-3">
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground mr-3" />
          ) : mode === 'search' ? (
            <Search className="h-5 w-5 text-muted-foreground mr-3" />
          ) : mode === 'command' ? (
            <Zap className="h-5 w-5 text-muted-foreground mr-3" />
          ) : (
            <MessageSquare className="h-5 w-5 text-muted-foreground mr-3" />
          )}

          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              mode === 'command'
                ? 'Ejecutar comando (+tarea, +gasto, +reunión)...'
                : mode === 'question'
                ? 'Hacer pregunta...'
                : 'Buscar en todo ZADIA OS...'
            }
            className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            autoFocus
          />
        </div>

        <div className="max-h-96 overflow-y-auto p-4">
          {/* Command Result */}
          {commandResult && (
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm">{commandResult}</p>
            </div>
          )}

          {/* Question Answer */}
          {questionAnswer && (
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm whitespace-pre-wrap">{questionAnswer}</p>
            </div>
          )}

          {/* Search Results */}
          {results && totalResults > 0 && (
            <div className="space-y-4">
              {Object.entries(results).map(([category, items]) => {
                if (items.length === 0) return null;

                const categoryLabels: Record<string, string> = {
                  clients: 'Clientes',
                  projects: 'Proyectos',
                  invoices: 'Facturas',
                  quotes: 'Cotizaciones',
                  opportunities: 'Oportunidades',
                  leads: 'Leads',
                  tasks: 'Tareas',
                };

                return (
                  <div key={category}>
                    <h3 className="text-xs font-semibold text-muted-foreground mb-2 px-2">
                      {categoryLabels[category] || category}
                    </h3>
                    <div className="space-y-1">
                      {items.map((item) => {
                        const Icon = ICONS[item.type as keyof typeof ICONS] || FileText;
                        
                        return (
                          <button
                            key={item.id}
                            onClick={() => handleResultClick(item.url)}
                            className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors text-left"
                          >
                            <Icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{item.title}</p>
                              {item.subtitle && (
                                <p className="text-xs text-muted-foreground truncate">
                                  {item.subtitle}
                                </p>
                              )}
                            </div>
                            <Badge variant="outline" className="flex-shrink-0 text-xs">
                              {item.type}
                            </Badge>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Empty State */}
          {!loading && !commandResult && !questionAnswer && totalResults === 0 && input.trim() && (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">No se encontraron resultados</p>
            </div>
          )}

          {/* Help Text */}
          {!input.trim() && (
            <div className="space-y-3 text-xs text-muted-foreground">
              <div>
                <p className="font-semibold mb-1">Búsqueda:</p>
                <p>Escribe para buscar clientes, proyectos, facturas...</p>
              </div>
              <div>
                <p className="font-semibold mb-1">Comandos:</p>
                <p>+tarea, +gasto, +reunión, +proyecto</p>
              </div>
              <div>
                <p className="font-semibold mb-1">Preguntas:</p>
                <p>¿Cuántos proyectos activos tengo?</p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
