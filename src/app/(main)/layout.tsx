'use client';

import { useAuth } from "@/contexts/AuthContext";
import { TenantProvider } from "@/contexts/TenantContext";
import { Header } from "@/components/layout/Header";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { Sidebar } from "@/components/layout/Sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { RouteGuard } from "@/components/auth/RouteGuard";
import { TenantGuard } from "@/components/auth/TenantGuard";
import { CommandBar } from "@/components/CommandBar";
import { ZadiaSystemInitializer } from "@/components/system/ZadiaSystemInitializer";
import { ZadiaAgenticProvider } from "@/contexts/ZadiaAgenticContext";

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { firebaseUser, loading } = useAuth();

  // Show loading skeleton while Firebase Auth initializes
  // Middleware already validated the session cookie, so we just wait for Firebase client
  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="border-b">
          <div className="container mx-auto px-4 py-4">
            <Skeleton className="h-8 w-32" />
          </div>
        </div>
        <div className="flex">
          <div className="w-64 border-r p-4 space-y-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-28" />
          </div>
          <main className="flex-1 p-6">
            <div className="space-y-4">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-96" />
            </div>
          </main>
        </div>
      </div>
    );
  }

  // If loading finished but no firebaseUser, show brief loading state
  // This can happen briefly during hydration - middleware ensures valid session
  if (!firebaseUser) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="space-y-3 text-center">
          <Skeleton className="h-6 w-48" />
          <p className="text-sm text-muted-foreground">Cargando sesión...</p>
        </div>
      </div>
    );
  }

  return (
    <RouteGuard>
      <TenantProvider>
        <TenantGuard>
          <ZadiaAgenticProvider>
            <ZadiaSystemInitializer>
              <SidebarProvider>
                <div className="flex min-h-screen w-full bg-[#0a0f1a]">
                  <Sidebar />
                  <SidebarInset className="bg-[#0a0f1a]">
                    <Header />
                    <main className="flex-1">
                      {children}
                    </main>
                  </SidebarInset>
                </div>
                <CommandBar />
              </SidebarProvider>
            </ZadiaSystemInitializer>
          </ZadiaAgenticProvider>
        </TenantGuard>
      </TenantProvider>
    </RouteGuard>
  );
}
