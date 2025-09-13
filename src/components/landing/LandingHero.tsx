'use client';

import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Star } from 'lucide-react';
import Link from 'next/link';

export function LandingHero() {
  const { t } = useTranslation();

  return (
    <section className="container mx-auto px-4 py-20 text-center">
      <Badge variant="secondary" className="mb-6">
        <Star className="h-4 w-4 mr-2" />
        {t('landing.hero.badge')}
      </Badge>
      
      <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
        {t('landing.hero.title')}
      </h1>
      
      <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
        {t('landing.hero.subtitle')}
      </p>
      
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link href="/register">
          <Button size="lg" className="w-full sm:w-auto">
            {t('landing.hero.ctaPrimary')}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
        <Link href="/login">
          <Button variant="outline" size="lg" className="w-full sm:w-auto">
            {t('landing.header.signIn')}
          </Button>
        </Link>
      </div>
    </section>
  );
}