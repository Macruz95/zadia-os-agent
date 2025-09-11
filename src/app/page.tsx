'use client';

import { useAuth } from '@/contexts/AuthContext';
import { LandingPage } from '@/components/landing/LandingPage';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      // Si el usuario está autenticado, redirigir al dashboard
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="space-y-4 text-center">
          <Skeleton className="h-8 w-64 mx-auto" />
          <Skeleton className="h-4 w-96 mx-auto" />
          <Skeleton className="h-4 w-80 mx-auto" />
        </div>
      </div>
    );
  }

  // Si no hay usuario autenticado, mostrar la landing page
  return <LandingPage />;
}
