/**
 * ZADIA OS - Customer Portal Layout
 * 
 * Public routes for clients to view invoices, pay, etc.
 * No authentication required - uses secure tokens
 */

import { Metadata } from 'next';
import { ReactNode } from 'react';
import { Toaster } from '@/components/ui/sonner';

export const metadata: Metadata = {
  title: 'Portal de Cliente | ZADIA',
  description: 'Accede a tus facturas, cotizaciones y realiza pagos',
};

interface PortalLayoutProps {
  children: ReactNode;
}

export default function PortalLayout({ children }: PortalLayoutProps) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-gray-50">
        {/* Simple header */}
        <header className="bg-white border-b">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">Z</span>
              </div>
              <span className="font-semibold text-lg">ZADIA</span>
              <span className="text-muted-foreground">| Portal de Cliente</span>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="max-w-4xl mx-auto px-4 py-8">
          {children}
        </main>

        {/* Footer */}
        <footer className="border-t bg-white mt-auto">
          <div className="max-w-4xl mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} ZADIA. Todos los derechos reservados.</p>
            <p className="mt-1">
              <a href="/privacy" className="hover:underline">Privacidad</a>
              {' · '}
              <a href="/terms" className="hover:underline">Términos</a>
            </p>
          </div>
        </footer>

        <Toaster />
      </body>
    </html>
  );
}
