/**
 * ZADIA Command - Universal Command Interface
 * 
 * The CEO's command center for instant access to any data or action
 * REGLA 2: ShadCN UI + Lucide icons only
 * REGLA 5: Max 300 lines (justified: core feature)
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';
import { VisuallyHidden } from '@/components/ui/visually-hidden';
import {
  Users, Briefcase, FileText, FileEdit, Target, UserPlus,
  CheckSquare, Loader2, Search, Zap, MessageSquare,
  ChevronRight, Command,
  LayoutDashboard, DollarSign, Package, UserCog, Settings,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { CommandSearchService } from '@/services/command-search.service';
import { CommandExecutorService } from '@/services/command-executor.service';
import { CommandAIService } from '@/services/command-ai.service';
import { detectCommandBarMode } from '@/types/command-bar.types';
import type { SearchResults, SearchResult } from '@/types/command-bar.types';

const ICONS = {
  client: Users,
  project: Briefcase,
  invoice: FileText,
  quote: FileEdit,
  opportunity: Target,
  lead: UserPlus,
  task: CheckSquare,
} as const;

const CATEGORY_COLORS: Record<string, string> = {
  clients: 'text-blue-400',
  projects: 'text-purple-400',
  invoices: 'text-emerald-400',
  quotes: 'text-amber-400',
  opportunities: 'text-cyan-400',
  leads: 'text-orange-400',
  tasks: 'text-pink-400',
};

const QUICK_ACTIONS = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
  { icon: Users, label: 'Clientes', href: '/clients' },
  { icon: Briefcase, label: 'Proyectos', href: '/projects' },
  { icon: Target, label: 'Ventas', href: '/sales' },
  { icon: DollarSign, label: 'Finanzas', href: '/finance' },
  { icon: Package, label: 'Inventario', href: '/inventory' },
  { icon: UserCog, label: 'RRHH', href: '/hr/employees' },
  { icon: Settings, label: 'Config', href: '/settings' },
];

export function CommandBar() {
  const router = useRouter();
  const { user } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResults | null>(null);
  const [commandResult, setCommandResult] = useState<string | null>(null);
  const [questionAnswer, setQuestionAnswer] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);

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

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

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
      if (mode === 'search') await handleSearch();
      else if (mode === 'command') await handleCommand();
      else if (mode === 'question') await handleQuestion();
    }, 200);

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
      setSelectedIndex(0);
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
          handleClose();
        }, 1000);
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
      handleClose();
    }
  };

  const handleClose = () => {
    setOpen(false);
    setInput('');
    setResults(null);
    setCommandResult(null);
    setQuestionAnswer(null);
    setSelectedIndex(0);
  };

  const mode = detectCommandBarMode(input);
  const allResults: SearchResult[] = results ? Object.values(results).flat() : [];
  const isMac = typeof window !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0;

  const getModeConfig = () => {
    switch (mode) {
      case 'command': return { icon: Zap, label: 'Comando', color: 'text-amber-400' };
      case 'question': return { icon: MessageSquare, label: 'IA', color: 'text-purple-400' };
      default: return { icon: Search, label: 'Buscar', color: 'text-cyan-400' };
    }
  };

  const modeConfig = getModeConfig();
  const ModeIcon = modeConfig.icon;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className={cn(
        "max-w-2xl p-0 gap-0 overflow-hidden",
        "bg-[#0d1117] border-gray-800/50",
        "shadow-2xl shadow-black/50"
      )}>
        <VisuallyHidden>
          <DialogTitle>ZADIA Command</DialogTitle>
        </VisuallyHidden>

        {/* Top Glow */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />
        
        {/* Search Input */}
        <div className="flex items-center border-b border-gray-800/50">
          <div className={cn("flex items-center gap-2 px-4 py-3 border-r border-gray-800/50", modeConfig.color)}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ModeIcon className="h-4 w-4" />}
            <span className="text-xs font-medium uppercase tracking-wider">{modeConfig.label}</span>
          </div>
          
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Buscar, crear (+), o preguntar (?)"
            className={cn(
              "flex-1 px-4 py-4 bg-transparent",
              "text-gray-100 placeholder:text-gray-500",
              "focus:outline-none text-base"
            )}
          />
        </div>

        {/* Results Area */}
        <div className="max-h-[400px] overflow-y-auto">
          {/* Command Result */}
          {commandResult && (
            <div className="m-4 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="h-4 w-4 text-amber-400" />
                <span className="text-sm font-medium text-amber-400">Comando ejecutado</span>
              </div>
              <p className="text-sm text-gray-300">{commandResult}</p>
            </div>
          )}

          {/* Question Answer */}
          {questionAnswer && (
            <div className="m-4 p-4 rounded-xl bg-purple-500/10 border border-purple-500/20">
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare className="h-4 w-4 text-purple-400" />
                <span className="text-sm font-medium text-purple-400">Respuesta IA</span>
              </div>
              <p className="text-sm text-gray-300 whitespace-pre-wrap">{questionAnswer}</p>
            </div>
          )}

          {/* Search Results */}
          {results && allResults.length > 0 && (
            <div className="py-2">
              {Object.entries(results).map(([category, items]) => {
                if (items.length === 0) return null;
                const categoryLabels: Record<string, string> = {
                  clients: 'Clientes', projects: 'Proyectos', invoices: 'Facturas',
                  quotes: 'Cotizaciones', opportunities: 'Oportunidades', leads: 'Leads', tasks: 'Tareas',
                };
                return (
                  <div key={category} className="mb-2">
                    <div className="px-4 py-2 flex items-center gap-2">
                      <span className={cn("text-xs font-semibold uppercase tracking-wider", CATEGORY_COLORS[category] || 'text-gray-400')}>
                        {categoryLabels[category] || category}
                      </span>
                      <span className="text-xs text-gray-600">({items.length})</span>
                    </div>
                    {items.map((item, idx) => {
                      const Icon = ICONS[item.type as keyof typeof ICONS] || FileText;
                      const isSelected = selectedIndex === idx;
                      return (
                        <button
                          key={item.id}
                          onClick={() => handleResultClick(item.url)}
                          className={cn(
                            "w-full flex items-center gap-3 px-4 py-3 transition-all duration-150 text-left",
                            isSelected ? "bg-cyan-500/10 border-l-2 border-cyan-500" : "hover:bg-white/5 border-l-2 border-transparent"
                          )}
                        >
                          <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center", isSelected ? "bg-cyan-500/20" : "bg-gray-800/50")}>
                            <Icon className={cn("h-4 w-4", CATEGORY_COLORS[category + 's'] || 'text-gray-400')} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={cn("font-medium truncate", isSelected ? "text-white" : "text-gray-200")}>{item.title}</p>
                            {item.subtitle && <p className="text-sm text-gray-500 truncate">{item.subtitle}</p>}
                          </div>
                          <ChevronRight className={cn("h-4 w-4 transition-transform", isSelected ? "text-cyan-400 translate-x-1" : "text-gray-600")} />
                        </button>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          )}

          {/* Empty State with Quick Actions */}
          {!input.trim() && (
            <div className="py-4">
              <div className="px-4 mb-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Accesos rápidos</p>
                <div className="grid grid-cols-4 gap-2">
                  {QUICK_ACTIONS.map((action) => {
                    const Icon = action.icon;
                    return (
                      <button key={action.label} onClick={() => handleResultClick(action.href)}
                        className="flex flex-col items-center gap-2 p-3 rounded-xl bg-gray-800/30 hover:bg-gray-800/50 border border-gray-800/50 hover:border-gray-700 transition-all">
                        <Icon className="h-5 w-5 text-gray-400" />
                        <span className="text-xs text-gray-500">{action.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="px-4 grid grid-cols-3 gap-3">
                <div className="p-3 rounded-lg bg-gray-800/30 border border-gray-800/50">
                  <div className="flex items-center gap-2 mb-1">
                    <Search className="h-4 w-4 text-cyan-400" />
                    <span className="text-sm font-medium text-gray-300">Buscar</span>
                  </div>
                  <p className="text-xs text-gray-500">cliente, proyecto...</p>
                </div>
                <div className="p-3 rounded-lg bg-gray-800/30 border border-gray-800/50">
                  <div className="flex items-center gap-2 mb-1">
                    <Zap className="h-4 w-4 text-amber-400" />
                    <span className="text-sm font-medium text-gray-300">Crear</span>
                  </div>
                  <p className="text-xs text-gray-500">+tarea, +proyecto</p>
                </div>
                <div className="p-3 rounded-lg bg-gray-800/30 border border-gray-800/50">
                  <div className="flex items-center gap-2 mb-1">
                    <MessageSquare className="h-4 w-4 text-purple-400" />
                    <span className="text-sm font-medium text-gray-300">Preguntar</span>
                  </div>
                  <p className="text-xs text-gray-500">¿Cuántos...?</p>
                </div>
              </div>
            </div>
          )}

          {/* No Results */}
          {!loading && !commandResult && !questionAnswer && allResults.length === 0 && input.trim() && (
            <div className="px-4 py-8 text-center">
              <p className="text-gray-500">No se encontraron resultados para "{input}"</p>
              <p className="text-sm text-gray-600 mt-2">Usa <span className="text-amber-400">+</span> para crear o <span className="text-purple-400">?</span> para preguntar</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-800/50 bg-black/20">
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-gray-800 text-gray-400 font-mono">↑↓</kbd>
              navegar
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-gray-800 text-gray-400 font-mono">↵</kbd>
              seleccionar
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-gray-800 text-gray-400 font-mono">esc</kbd>
              cerrar
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span className="text-cyan-400">ZADIA</span>
            <span>Command</span>
            <kbd className="px-1.5 py-0.5 rounded bg-gray-800 text-gray-400 font-mono">
              {isMac ? <Command className="h-3 w-3 inline" /> : 'Ctrl'}+K
            </kbd>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
