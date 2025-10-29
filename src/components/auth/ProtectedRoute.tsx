/**
 * ZADIA OS - Protected Route Component
 * 
 * Wrapper component that validates authentication before rendering children
 * Automatically redirects unauthenticated users
 */

'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface ProtectedRouteProps {
  children: React.ReactNode;
  /**
   * Custom fallback component while loading
   */
  fallback?: React.ReactNode;
}

/**
 * Protected Route Component
 * 
 * Wraps content that requires authentication
 * Handles loading states and redirects
 * 
 * @example
 * <ProtectedRoute>
 *   <Dashboard />
 * </ProtectedRoute>
 */
export function ProtectedRoute({ 
  children, 
  fallback
}: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    // Don't redirect while loading
    if (loading) return;
    
    // Redirect to login if not authenticated
    if (!user) {
      router.push('/login');
      return;
    }
  }, [user, loading, router]);
  
  // Show loading fallback
  if (loading) {
    return fallback || <LoadingFallback />;
  }
  
  // Don't render if not authenticated
  if (!user) {
    return null;
  }
  
  // Render children if authenticated
  return <>{children}</>;
}

/**
 * Default loading fallback component
 */
function LoadingFallback() {
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
