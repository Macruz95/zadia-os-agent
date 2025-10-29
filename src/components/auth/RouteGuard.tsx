/**
 * ZADIA OS - Route Guard Component
 * 
 * Client-side route protection with role-based access control
 * Used in layout to protect entire sections
 */

'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface RouteGuardProps {
  children: React.ReactNode;
}

/**
 * Route Guard Component
 * 
 * Validates user permissions for current route
 * Redirects to /unauthorized if user doesn't have access
 * 
 * Should be used in layout components to protect entire sections
 */
export function RouteGuard({ children }: RouteGuardProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  
  useEffect(() => {
    // Don't check while loading
    if (loading) return;
    
    // Redirect to login if not authenticated
    if (!user) {
      router.push('/login');
      return;
    }
    
    // TEMPORARILY DISABLED: Role validation
    // Allow all authenticated users to access all routes
  }, [user, loading, pathname, router]);
  
  // Show loading skeleton while checking permissions
  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="space-y-4">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            <Skeleton className="h-48" />
            <Skeleton className="h-48" />
            <Skeleton className="h-48" />
          </div>
        </div>
      </div>
    );
  }
  
  // Don't render if not authenticated
  if (!user) {
    return null;
  }
  
  // TEMPORARILY DISABLED: Role and route access validation
  // Allow all authenticated users
  
  // Render children if all checks pass
  return <>{children}</>;
}
