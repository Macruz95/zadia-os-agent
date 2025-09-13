'use client';

import { useTranslation } from 'react-i18next';
import { Bot } from 'lucide-react';
import Link from 'next/link';

export function LandingFooter() {
  const { t } = useTranslation();

  return (
    <footer className="bg-muted/30 border-t">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center space-x-2">
            <div className="h-6 w-6 bg-primary rounded flex items-center justify-center">
              <Bot className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-semibold">ZADIA OS</span>
          </div>
          
          <div className="flex gap-6 text-sm text-muted-foreground">
            <Link href="/privacy" className="hover:text-foreground transition-colors">
              Privacidad
            </Link>
            <Link href="/terms" className="hover:text-foreground transition-colors">
              Términos
            </Link>
            <Link href="/contact" className="hover:text-foreground transition-colors">
              Contacto
            </Link>
          </div>
        </div>
        
        <div className="border-t mt-6 pt-6 text-center text-sm text-muted-foreground">
          <p>{t('landing.footer.copyright')}</p>
        </div>
      </div>
    </footer>
  );
}