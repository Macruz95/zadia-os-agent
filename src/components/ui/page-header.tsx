/**
 * ZADIA OS - PageHeader Component
 * 
 * Componente unificado para headers de página
 * Mantiene consistencia visual en todo el sistema
 * 
 * REGLA 2: ShadCN UI + Lucide icons
 */

import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  /** Título principal de la página */
  title: string;
  /** Descripción/subtítulo opcional */
  description?: string;
  /** Icono Lucide opcional (aparece a la izquierda del título) */
  icon?: LucideIcon;
  /** Acciones (botones) que aparecen a la derecha */
  actions?: ReactNode;
  /** Clases adicionales para el contenedor */
  className?: string;
  /** Variante del header */
  variant?: 'default' | 'compact';
}

/**
 * PageHeader - Header unificado para todas las páginas
 * 
 * @example
 * // Básico
 * <PageHeader title="Empleados" description="Gestiona el personal" />
 * 
 * @example
 * // Con icono y acciones
 * <PageHeader 
 *   title="Dashboard" 
 *   description="Centro de mando"
 *   icon={LayoutDashboard}
 *   actions={<Button>Nueva Acción</Button>}
 * />
 */
export function PageHeader({
  title,
  description,
  icon: Icon,
  actions,
  className,
  variant = 'default',
}: PageHeaderProps) {
  return (
    <div className={cn(
      'flex items-start justify-between gap-4',
      variant === 'compact' ? 'mb-4' : 'mb-0',
      className
    )}>
      <div className="flex items-center gap-3">
        {/* Icono opcional con fondo */}
        {Icon && (
          <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-cyan-600/10 border border-cyan-500/20 flex items-center justify-center">
            <Icon className="h-5 w-5 text-cyan-400" />
          </div>
        )}
        
        <div>
          <h1 className={cn(
            'font-bold tracking-tight text-white',
            variant === 'compact' ? 'text-xl' : 'text-2xl'
          )}>
            {title}
          </h1>
          {description && (
            <p className="text-sm text-gray-400 mt-0.5">
              {description}
            </p>
          )}
        </div>
      </div>
      
      {/* Acciones a la derecha */}
      {actions && (
        <div className="flex items-center gap-2 flex-shrink-0">
          {actions}
        </div>
      )}
    </div>
  );
}

/**
 * PageHeaderSkeleton - Estado de carga del header
 */
export function PageHeaderSkeleton() {
  return (
    <div className="flex items-start justify-between gap-4 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gray-800" />
        <div className="space-y-2">
          <div className="h-6 w-48 bg-gray-800 rounded" />
          <div className="h-4 w-64 bg-gray-800/50 rounded" />
        </div>
      </div>
      <div className="h-9 w-32 bg-gray-800 rounded" />
    </div>
  );
}
