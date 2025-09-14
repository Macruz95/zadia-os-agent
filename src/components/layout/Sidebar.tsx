'use client';

import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Sidebar as SidebarComponent,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import {
  LayoutDashboard,
  Settings,
  User,
} from 'lucide-react';

const sidebarNavItems = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    roles: ['admin', 'manager', 'user']
  },
  {
    title: 'Mi Perfil',
    href: '/profile',
    icon: User,
    roles: ['admin', 'manager', 'user']
  },
  {
    title: 'Configuración',
    href: '/settings',
    icon: Settings,
    roles: ['admin', 'manager']
  }
];

export function Sidebar() {
  const { user, loading } = useAuth();
  const pathname = usePathname();

  if (loading) {
    return (
      <SidebarComponent>
        <SidebarHeader>
          <div className="flex items-center space-x-2 px-4 py-2">
            <div className="h-6 w-6 animate-pulse bg-muted rounded" />
            <div className="h-4 w-24 animate-pulse bg-muted rounded" />
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Navegación</SidebarGroupLabel>
            <SidebarMenu>
              {Array.from({ length: 3 }).map((_, i) => (
                <SidebarMenuItem key={i}>
                  <div className="flex items-center space-x-2 px-2 py-2">
                    <div className="h-4 w-4 animate-pulse bg-muted rounded" />
                    <div className="h-4 w-20 animate-pulse bg-muted rounded" />
                  </div>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
      </SidebarComponent>
    );
  }

  if (!user) return null;

  const filteredItems = sidebarNavItems.filter(item =>
    item.roles.includes(user.role)
  );

  return (
    <SidebarComponent>
      <SidebarHeader>
        <div className="flex items-center space-x-2 px-4 py-2">
          <div className="h-6 w-6 rounded bg-primary flex items-center justify-center">
            <span className="text-xs font-bold text-primary-foreground">Z</span>
          </div>
          <h2 className="text-lg font-semibold">ZADIA OS</h2>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navegación</SidebarGroupLabel>
          <SidebarMenu>
            {filteredItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild isActive={isActive}>
                    <Link href={item.href}>
                      <Icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton>
              <User className="h-4 w-4" />
              <span>{user.email}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </SidebarComponent>
  );
}
