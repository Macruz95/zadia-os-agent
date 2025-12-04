/**
 * ZADIA OS - Route Guard Component
 * 
 * Client-side route protection with role-based access control
 * Used in layout to protect entire sections
 */

'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';

interface RouteGuardProps {
  children: React.ReactNode;
}

/**
 * Route Guard Component
 * 
 * Validates user is authenticated via Firebase Auth
 * Middleware handles the actual redirect - this just shows loading state
 * 
 * Should be used in layout components to protect entire sections
 */
export function RouteGuard({ children }: RouteGuardProps) {
  const { firebaseUser, loading } = useAuth();
  
  // Show loading skeleton while Firebase Auth initializes
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
  
  // If no firebaseUser after loading, show brief loading state
  // Middleware ensures only authenticated users reach protected routes
  if (!firebaseUser) {
    return (
      <div className="min-h-screen bg-background p-6 flex items-center justify-center">
        <Skeleton className="h-6 w-48" />
      </div>
    );
  }
  
  // Render children - user is authenticated
  return <>{children}</>;
}
