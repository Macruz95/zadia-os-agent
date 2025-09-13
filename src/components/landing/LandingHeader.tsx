'use client';

import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Bot } from 'lucide-react';
import Link from 'next/link';

export function LandingHeader() {
  const { t } = useTranslation();

  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
            <Bot className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-bold text-xl">ZADIA OS</span>
        </div>
        <div className="flex items-center space-x-4">
          <Link href="/login">
            <Button variant="ghost">{t('landing.header.signIn')}</Button>
          </Link>
          <Link href="/register">
            <Button>{t('landing.header.getStarted')}</Button>
          </Link>
        </div>
      </div>
    </header>
  );
}