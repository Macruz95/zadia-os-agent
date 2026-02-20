/**
 * ZADIA OS - Sidebar Navigation
 * 
 * Professional cockpit sidebar with motion animations
 * REGLA 2: ShadCN UI + Lucide icons + Motion
 */

'use client';

import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'motion/react';
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

];

const resourcesNav = [
  { title: 'Finanzas', href: '/finance', icon: DollarSign },
  { title: 'RRHH', href: '/hr/employees', icon: UserCog },
  { title: 'Inventario', href: '/inventory', icon: Package },
];

const systemNav = [
  { title: 'Configuración', href: '/settings', icon: Settings },
];

// Stagger animation for nav groups
const navGroupVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.04, delayChildren: 0.1 }
  }
};

const navItemVariants = {
  hidden: { opacity: 0, x: -12 },
  visible: {
    opacity: 1, x: 0,
    transition: { type: 'spring' as const, stiffness: 300, damping: 24 }
  }
};

export function Sidebar() {
  const { user, firebaseUser, loading, logout } = useAuth();
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
              "relative transition-all duration-200",
              active
                ? "text-sidebar-primary"
                : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
            )}
          >
            {/* Active indicator — animated spring bar */}
            {active && (
              <motion.div
                layoutId="sidebar-active-indicator"
                className="absolute left-0 top-1 bottom-1 w-[2px] bg-gradient-to-b from-cyan-400 to-cyan-600 rounded-full"
                transition={{ type: 'spring', stiffness: 350, damping: 30 }}
              />
            )}

            <Icon className={cn(
              "h-4 w-4 transition-colors",
              active ? "text-sidebar-primary" : "text-sidebar-foreground/60"
            )} />
            <span className="font-medium">{item.title}</span>

            {active && (
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              >
                <ChevronRight className="ml-auto h-3.5 w-3.5 text-cyan-400/60" />
              </motion.div>
            )}
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  };

  if (loading) {
    return (
      <SidebarComponent collapsible="icon" className="bg-sidebar border-r border-sidebar-border">
        <SidebarHeader className="border-b border-sidebar-border">
          <div className="flex items-center gap-2 px-2 py-1.5">
            <div className="h-8 w-8 animate-pulse rounded-lg bg-sidebar-accent" />
            <div className="h-4 w-20 animate-pulse rounded bg-sidebar-accent" />
          </div>
        </SidebarHeader>
      </SidebarComponent>
    );
  }

  if (!firebaseUser) return null;

  // Use Firestore profile if available, otherwise fall back to Firebase Auth user
  const displayName = user?.displayName || firebaseUser.displayName || '';
  const email = user?.email || firebaseUser.email || '';

  const userInitials = displayName
    ? displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : email?.[0]?.toUpperCase() || 'U';

  return (
    <SidebarComponent
      collapsible="icon"
      className="bg-sidebar border-r border-sidebar-border"
    >
      {/* Header con Logo — glow pulsante */}
      <SidebarHeader className="border-b border-sidebar-border px-4 py-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/dashboard" className="hover:bg-transparent group">
                <motion.div
                  className="flex aspect-square size-8 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-cyan-600"
                  animate={{
                    boxShadow: [
                      '0 0 12px rgba(6,182,212,0.3)',
                      '0 0 20px rgba(6,182,212,0.5)',
                      '0 0 12px rgba(6,182,212,0.3)',
                    ]
                  }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <Zap className="size-4 text-foreground" />
                </motion.div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-bold text-sidebar-foreground tracking-wide">ZADIA OS</span>
                  <span className="truncate text-[10px] text-cyan-600/60 dark:text-cyan-500/60 uppercase tracking-[0.2em] font-medium">Enterprise</span>
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
          <SidebarGroupLabel className="text-[10px] font-semibold text-sidebar-foreground/60 uppercase tracking-[0.15em] px-2 mb-1">
            Principal
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <motion.div variants={navGroupVariants} initial="hidden" animate="visible">
              <SidebarMenu>
                {mainNav.map((item) => (
                  <motion.div key={item.href} variants={navItemVariants}>
                    <NavItem item={item} />
                  </motion.div>
                ))}
              </SidebarMenu>
            </motion.div>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Negocio */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] font-semibold text-sidebar-foreground/60 uppercase tracking-[0.15em] px-2 mb-1">
            Negocio
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <motion.div variants={navGroupVariants} initial="hidden" animate="visible">
              <SidebarMenu>
                {businessNav.map((item) => (
                  <motion.div key={item.href} variants={navItemVariants}>
                    <NavItem item={item} />
                  </motion.div>
                ))}
              </SidebarMenu>
            </motion.div>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Recursos */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] font-semibold text-sidebar-foreground/60 uppercase tracking-[0.15em] px-2 mb-1">
            Recursos
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <motion.div variants={navGroupVariants} initial="hidden" animate="visible">
              <SidebarMenu>
                {resourcesNav.map((item) => (
                  <motion.div key={item.href} variants={navItemVariants}>
                    <NavItem item={item} />
                  </motion.div>
                ))}
              </SidebarMenu>
            </motion.div>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Sistema */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] font-semibold text-sidebar-foreground/60 uppercase tracking-[0.15em] px-2 mb-1">
            Sistema
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <motion.div variants={navGroupVariants} initial="hidden" animate="visible">
              <SidebarMenu>
                {systemNav.map((item) => (
                  <motion.div key={item.href} variants={navItemVariants}>
                    <NavItem item={item} />
                  </motion.div>
                ))}
              </SidebarMenu>
            </motion.div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer con Usuario */}
      <SidebarFooter className="border-t border-sidebar-border px-4 py-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground w-full justify-start text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent"
                >
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarFallback className="rounded-lg bg-gradient-to-br from-cyan-500 to-cyan-600 text-foreground text-xs font-bold">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium text-sidebar-foreground">
                      {displayName || 'Usuario'}
                    </span>
                    <span className="truncate text-xs text-sidebar-foreground/60">
                      {email}
                    </span>
                  </div>
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-xl bg-[#0f1419] border-border backdrop-blur-xl"
                side="bottom"
                align="end"
                sideOffset={4}
              >
                <DropdownMenuItem asChild className="text-muted-foreground hover:text-foreground hover:bg-white/5 cursor-pointer rounded-lg">
                  <Link href="/profile">
                    Mi Perfil
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="text-muted-foreground hover:text-foreground hover:bg-white/5 cursor-pointer rounded-lg">
                  <Link href="/settings">
                    <Settings className="mr-2 h-4 w-4" />
                    Configuración
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-gray-800/50" />
                <DropdownMenuItem
                  onClick={logout}
                  className="text-red-400 hover:text-red-300 hover:bg-red-500/10 cursor-pointer rounded-lg"
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

