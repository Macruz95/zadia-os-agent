'use client';

import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  LayoutDashboard, 
  Settings, 
  User
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
      <aside className="hidden md:flex h-screen w-64 flex-col border-r bg-background">
        <div className="p-4 space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-10 bg-muted animate-pulse rounded" />
          ))}
        </div>
      </aside>
    );
  }

  if (!user) return null;

  const filteredItems = sidebarNavItems.filter(item => 
    item.roles.includes(user.role)
  );

  return (
    <aside className="hidden md:flex h-screen w-64 flex-col border-r bg-background">
      <ScrollArea className="flex-1">
        <nav className="p-4 space-y-2">
          {filteredItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive ? 'secondary' : 'ghost'}
                  className={cn(
                    'w-full justify-start',
                    isActive && 'bg-secondary'
                  )}
                >
                  <Icon className="mr-2 h-4 w-4" />
                  {item.title}
                </Button>
              </Link>
            );
          })}
        </nav>
      </ScrollArea>
    </aside>
  );
}
