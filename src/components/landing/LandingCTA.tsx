'use client';

import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

export function LandingCTA() {
  const { t } = useTranslation();

  return (
    <section className="bg-primary py-20">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
          {t('landing.cta.title')}
        </h2>
        
        <p className="text-xl text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
          {t('landing.cta.subtitle')}
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/register">
            <Button 
              size="lg" 
              variant="secondary" 
              className="w-full sm:w-auto bg-background text-foreground hover:bg-background/90"
            >
              {t('landing.cta.button')}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Link href="/about">
            <Button 
              size="lg" 
              variant="outline" 
              className="w-full sm:w-auto border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10"
            >
              {t('landing.cta.secondary')}
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}