'use client';

import { useAuth } from '@/contexts/AuthContext';
import { UserNav } from './UserNav';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';

export function Header() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
        <div className="container flex h-14 items-center justify-between px-4">
          <div className="flex items-center space-x-2">
            <div className="h-6 w-6 animate-pulse bg-muted rounded" />
            <div className="h-4 w-24 animate-pulse bg-muted rounded" />
          </div>
          <div className="h-9 w-9 animate-pulse bg-muted rounded-full" />
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
      <div className="container flex h-14 items-center justify-between px-4">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" className="md:hidden">
            <Menu className="h-4 w-4" />
          </Button>
          <div className="flex items-center space-x-2">
            <div className="h-6 w-6 rounded bg-primary flex items-center justify-center">
              <span className="text-xs font-bold text-primary-foreground">Z</span>
            </div>
            <h1 className="text-lg font-semibold">ZADIA OS</h1>
          </div>
        </div>
        
        {user && <UserNav />}
      </div>
    </header>
  );
}
