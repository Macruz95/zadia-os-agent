/**
 * ZADIA OS - Empty State Component
 * 
 * Shown when no messages in conversation
 * Features suggested prompts and capabilities
 */

'use client';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { 
  Sparkles, 
  Zap, 
  TrendingUp, 
  Users, 
  FolderOpen, 
  CalendarDays,
  Search,
  BarChart3,
  Bell,
  Wrench,
  Globe,
  Brain,
} from 'lucide-react';
import type { AIModel } from '../types';

interface EmptyStateProps {
  onSelectPrompt: (prompt: string) => void;
  currentModel: AIModel;
}

const SUGGESTED_PROMPTS = [
  {
    icon: TrendingUp,
    title: "Análisis de ventas",
    prompt: "Analiza las ventas de este mes y compáralas con el mes anterior. Dame insights actionables.",
    color: "from-emerald-500/20 to-emerald-600/20",
    iconColor: "text-emerald-400",
  },
  {
    icon: Users,
    title: "Clientes importantes",
    prompt: "¿Cuáles son mis 5 clientes más importantes por facturación? ¿Alguno tiene facturas pendientes?",
    color: "from-blue-500/20 to-blue-600/20",
    iconColor: "text-blue-400",
  },
  {
    icon: FolderOpen,
    title: "Estado de proyectos",
    prompt: "Dame un resumen ejecutivo del estado de todos mis proyectos activos. ¿Hay alguno en riesgo?",
    color: "from-purple-500/20 to-purple-600/20",
    iconColor: "text-purple-400",
  },
  {
    icon: CalendarDays,
    title: "Agenda semanal",
    prompt: "Crea una reunión de seguimiento con el equipo para el viernes a las 10am y agrégala al calendario.",
    color: "from-orange-500/20 to-orange-600/20",
    iconColor: "text-orange-400",
  },
  {
    icon: BarChart3,
    title: "Reporte financiero",
    prompt: "Genera un análisis de gastos vs ingresos del último trimestre con recomendaciones.",
    color: "from-cyan-500/20 to-cyan-600/20",
    iconColor: "text-cyan-400",
  },
  {
    icon: Search,
    title: "Investigación de mercado",
    prompt: "Busca las últimas tendencias en mi industria y cómo puedo aprovecharlas.",
    color: "from-pink-500/20 to-pink-600/20",
    iconColor: "text-pink-400",
  },
];

const CAPABILITIES = [
  {
    icon: Brain,
    title: "Razonamiento Profundo",
    description: "Análisis complejo con DeepSeek R1",
  },
  {
    icon: Wrench,
    title: "Ejecución de Acciones",
    description: "Crea tareas, proyectos, reuniones",
  },
  {
    icon: Globe,
    title: "Búsqueda Web",
    description: "Información actualizada en tiempo real",
  },
  {
    icon: Bell,
    title: "Alertas Inteligentes",
    description: "Notificaciones proactivas del sistema",
  },
];

export function EmptyState({ onSelectPrompt, currentModel }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
      {/* Hero */}
      <div className="relative mb-8">
        <div className="h-24 w-24 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-purple-600/20 flex items-center justify-center border border-gray-800/50 shadow-2xl shadow-cyan-500/10">
          <Sparkles className="h-12 w-12 text-cyan-400" />
        </div>
        <div className="absolute -top-2 -right-2 h-8 w-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center animate-pulse">
          <Zap className="h-4 w-4 text-white" />
        </div>
      </div>

      {/* Title */}
      <h1 className="text-3xl font-bold text-white mb-2">
        ¿En qué puedo ayudarte?
      </h1>
      <p className="text-gray-400 max-w-lg mb-2">
        Soy <span className="text-cyan-400 font-medium">ZADIA</span>, tu asistente de IA empresarial.
        Puedo analizar datos, ejecutar acciones y buscar información en tiempo real.
      </p>
      
      {/* Current Model Badge */}
      <Badge 
        variant="outline" 
        className="mb-8 text-xs px-3 py-1 border-gray-700 text-gray-400"
      >
        <Brain className="h-3 w-3 mr-1.5 text-purple-400" />
        Modelo activo: {currentModel.name}
      </Badge>

      {/* Capabilities */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full max-w-3xl mb-10">
        {CAPABILITIES.map((cap, idx) => (
          <div 
            key={idx}
            className="flex flex-col items-center p-4 rounded-xl bg-[#161b22]/50 border border-gray-800/30"
          >
            <cap.icon className="h-6 w-6 text-cyan-400 mb-2" />
            <span className="text-xs font-medium text-white">{cap.title}</span>
            <span className="text-[10px] text-gray-500 text-center mt-0.5">{cap.description}</span>
          </div>
        ))}
      </div>

      {/* Suggested Prompts */}
      <div className="w-full max-w-4xl">
        <p className="text-sm text-gray-500 mb-4">Prueba alguna de estas sugerencias:</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {SUGGESTED_PROMPTS.map((item, idx) => (
            <button
              key={idx}
              onClick={() => onSelectPrompt(item.prompt)}
              className={cn(
                "group flex items-start gap-3 p-4 rounded-xl text-left transition-all",
                "bg-gradient-to-br border border-gray-800/50",
                item.color,
                "hover:border-cyan-500/30 hover:scale-[1.02] hover:shadow-lg hover:shadow-cyan-500/5"
              )}
            >
              <div className={cn(
                "p-2 rounded-lg bg-gray-900/50 group-hover:bg-gray-900",
                item.iconColor
              )}>
                <item.icon className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white group-hover:text-cyan-400 transition-colors">
                  {item.title}
                </p>
                <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                  {item.prompt}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
