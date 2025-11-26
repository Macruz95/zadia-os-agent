/**
 * ZADIA OS - Sidebar Navigation
 * 
 * Usando componentes ShadCN con estética cockpit oscura
 * REGLA 2: ShadCN UI + Lucide icons
 */

'use client';

import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Sidebar as SidebarComponent,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from '@/components/ui/sidebar';
import {
  LayoutDashboard,
  Settings,
  Package,
  TrendingUp,
  UserCheck,
  Briefcase,
  Wrench,
  DollarSign,
  UserCog,
  Bot,
  Zap,
  LogOut,
  ChevronRight,
  Calendar,
  CheckSquare,
  Workflow,
} from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

// Navegación sin duplicados
const mainNav = [
  { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { title: 'Agenda Cognitiva', href: '/calendar', icon: Calendar },
  { title: 'Tareas RICE-Z', href: '/tasks', icon: CheckSquare },
  { title: 'Flujos Cognitivos', href: '/workflows', icon: Workflow },
  { title: 'Asistente IA', href: '/ai-assistant', icon: Bot },
];

const businessNav = [
  { title: 'CRM', href: '/crm', icon: UserCheck },
  { title: 'Ventas', href: '/sales', icon: TrendingUp },
  { title: 'Proyectos', href: '/projects', icon: Briefcase },
  { title: 'Work Orders', href: '/work-orders', icon: Wrench },
];

const resourcesNav = [
  { title: 'Finanzas', href: '/finance', icon: DollarSign },
  { title: 'RRHH', href: '/hr/employees', icon: UserCog },
  { title: 'Inventario', href: '/inventory', icon: Package },
];

export function Sidebar() {
  const { user, loading, logout } = useAuth();
  const pathname = usePathname();

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  const NavItem = ({ item }: { item: typeof mainNav[0] }) => {
    const Icon = item.icon;
    const active = isActive(item.href);
    
    return (
      <SidebarMenuItem>
        <SidebarMenuButton asChild isActive={active} tooltip={item.title}>
          <Link 
            href={item.href}
            className={cn(
              active && "bg-cyan-50 text-gray-900 border-l-2 border-cyan-500"
            )}
          >
            <Icon className={cn(
              "h-4 w-4",
              active ? "text-cyan-600" : "text-gray-600"
            )} />
            <span className={cn(
              active ? "text-gray-900" : "text-gray-900"
            )}>{item.title}</span>
            {active && <ChevronRight className="ml-auto h-4 w-4 text-cyan-600" />}
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  };

  if (loading) {
    return (
      <SidebarComponent collapsible="icon" className="bg-white border-r border-gray-200">
        <SidebarHeader className="border-b border-gray-200">
          <div className="flex items-center gap-2 px-2 py-1.5">
            <div className="h-8 w-8 animate-pulse rounded-lg bg-gray-200" />
            <div className="h-4 w-20 animate-pulse rounded bg-gray-200" />
          </div>
        </SidebarHeader>
      </SidebarComponent>
    );
  }

  if (!user) return null;

  const userInitials = user.displayName 
    ? user.displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : user.email?.[0]?.toUpperCase() || 'U';

  return (
    <SidebarComponent 
      collapsible="icon" 
      className="bg-white border-r border-gray-200"
    >
      {/* Header con Logo */}
      <SidebarHeader className="border-b border-gray-200 px-4 py-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/dashboard" className="hover:bg-transparent">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-cyan-600 shadow-lg shadow-cyan-500/25">
                  <Zap className="size-4 text-white" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-bold text-gray-900">ZADIA OS</span>
                  <span className="truncate text-xs text-gray-600 uppercase tracking-wider">Enterprise</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* Contenido Principal */}
      <SidebarContent className="px-2 py-4">
        {/* Principal */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] font-semibold text-gray-600 uppercase tracking-wider px-2 mb-1">
            Principal
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNav.map((item) => (
                <NavItem key={item.href} item={item} />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Negocio */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] font-semibold text-gray-600 uppercase tracking-wider px-2 mb-1">
            Negocio
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {businessNav.map((item) => (
                <NavItem key={item.href} item={item} />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Recursos */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] font-semibold text-gray-600 uppercase tracking-wider px-2 mb-1">
            Recursos
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {resourcesNav.map((item) => (
                <NavItem key={item.href} item={item} />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer con Usuario */}
      <SidebarFooter className="border-t border-gray-200 px-4 py-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-gray-100 data-[state=open]:text-gray-900 w-full justify-start"
                >
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarFallback className="rounded-lg bg-gradient-to-br from-gray-700 to-gray-800 text-white text-xs font-bold">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium text-gray-900">
                      {user.displayName || 'Usuario'}
                    </span>
                    <span className="truncate text-xs text-gray-600">
                      {user.email}
                    </span>
                  </div>
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg bg-white border-gray-200"
                side="bottom"
                align="end"
                sideOffset={4}
              >
                <DropdownMenuItem asChild className="text-gray-900 hover:text-gray-900 hover:bg-gray-100 cursor-pointer">
                  <Link href="/profile">
                    Mi Perfil
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="text-gray-900 hover:text-gray-900 hover:bg-gray-100 cursor-pointer">
                  <Link href="/settings">
                    <Settings className="mr-2 h-4 w-4" />
                    Configuración
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-gray-200" />
                <DropdownMenuItem 
                  onClick={logout}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 cursor-pointer"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Cerrar Sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </SidebarComponent>
  );
}
