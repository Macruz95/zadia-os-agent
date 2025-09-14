'use client';

import { useAuth } from '@/contexts/AuthContext';
import { UserNav } from './UserNav';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';

export function Header() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <div className="h-4 w-4 animate-pulse bg-muted rounded" />
        <div className="h-4 w-24 animate-pulse bg-muted rounded" />
        <div className="ml-auto h-9 w-9 animate-pulse bg-muted rounded-full" />
      </header>
    );
  }

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 h-4" />
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem className="hidden md:block">
            <BreadcrumbLink href="#">
              ZADIA OS
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator className="hidden md:block" />
          <BreadcrumbItem>
            <BreadcrumbPage>Dashboard</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="ml-auto">
        {user && <UserNav />}
      </div>
    </header>
  );
}
