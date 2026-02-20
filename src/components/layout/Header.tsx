/**
 * ZADIA OS - Dynamic Header
 * 
 * Header con breadcrumb dinámico y ZADIA Command
 * REGLA 2: ShadCN UI + Lucide icons
 */

'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { UserNav } from './UserNav';
import { ModeToggle } from '@/components/ui/mode-toggle';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb';
import { Search, Command, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { NotificationsDropdown } from '@/components/notifications';

// Mapeo de rutas a nombres legibles
const routeNames: Record<string, string> = {
  dashboard: 'Dashboard',
  'ai-assistant': 'Asistente AI',
  crm: 'CRM',
  sales: 'Ventas',
  leads: 'Leads',
  opportunities: 'Oportunidades',
  projects: 'Proyectos',
  finance: 'Finanzas',
  invoices: 'Facturas',
  expenses: 'Gastos',
  hr: 'Recursos Humanos',
  employees: 'Empleados',
  clients: 'Clientes',
  inventory: 'Inventario',
  settings: 'Configuración',
  profile: 'Mi Perfil',
};

function CommandSearchTrigger({ onClick }: { onClick: () => void }) {
  const [isMac, setIsMac] = useState(false);

  useEffect(() => {
    setIsMac(navigator.platform.toUpperCase().indexOf('MAC') >= 0);
  }, []);

  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 h-9 px-4 rounded-lg",
        "bg-gray-800/50 hover:bg-gray-800",
        "border border-border hover:border-cyan-500/30",
        "transition-all duration-200 group",
        "min-w-[240px]"
      )}
    >
      <Search className="h-4 w-4 text-gray-500 group-hover:text-cyan-400 transition-colors" />
      <span className="flex-1 text-left text-sm text-gray-500 group-hover:text-muted-foreground">
        Buscar...
      </span>
      <div className="flex items-center gap-0.5">
        <kbd className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-card text-gray-500 border border-border">
          {isMac ? <Command className="h-2.5 w-2.5 inline" /> : 'Ctrl'}
        </kbd>
        <kbd className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-card text-gray-500 border border-border">
          K
        </kbd>
      </div>
    </button>
  );
}

export function Header() {
  const { firebaseUser, loading } = useAuth();
  const pathname = usePathname();

  // Generar breadcrumbs dinámicos
  const pathSegments = pathname.split('/').filter(Boolean);
  const breadcrumbs = pathSegments.map((segment, index) => ({
    name: routeNames[segment] || segment.charAt(0).toUpperCase() + segment.slice(1),
    href: '/' + pathSegments.slice(0, index + 1).join('/'),
    isLast: index === pathSegments.length - 1,
  }));

  const handleOpenCommand = () => {
    const event = new KeyboardEvent('keydown', {
      key: 'k',
      metaKey: true,
      ctrlKey: true,
      bubbles: true,
    });
    document.dispatchEvent(event);
  };

  if (loading) {
    return (
      <header className="flex h-14 shrink-0 items-center gap-4 border-b bg-background px-4">
        <div className="h-4 w-4 animate-pulse bg-muted rounded" />
        <div className="h-4 w-32 animate-pulse bg-muted rounded" />
      </header>
    );
  }

  return (
    <header className="flex h-14 shrink-0 items-center gap-4 border-b bg-background px-4">
      <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
      <Separator orientation="vertical" className="h-4" />

      {/* Breadcrumb Dinámico */}
      <Breadcrumb className="flex-1">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink
              href="/dashboard"
              className="text-gray-500 hover:text-cyan-400 transition-colors text-sm"
            >
              ZADIA
            </BreadcrumbLink>
          </BreadcrumbItem>

          {breadcrumbs.map((crumb) => (
            <div key={crumb.href} className="flex items-center">
              <BreadcrumbSeparator className="text-gray-700">
                <ChevronRight className="h-3 w-3" />
              </BreadcrumbSeparator>
              <BreadcrumbItem>
                {crumb.isLast ? (
                  <BreadcrumbPage className="text-foreground text-sm font-medium">
                    {crumb.name}
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink
                    href={crumb.href}
                    className="text-gray-500 hover:text-cyan-400 transition-colors text-sm"
                  >
                    {crumb.name}
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </div>
          ))}
        </BreadcrumbList>
      </Breadcrumb>

      {/* ZADIA Command */}
      <CommandSearchTrigger onClick={handleOpenCommand} />

      {/* Actions */}
      <div className="flex items-center gap-2">
        <ModeToggle />
        <NotificationsDropdown />
        {firebaseUser && <UserNav />}
      </div>
    </header>
  );
}
