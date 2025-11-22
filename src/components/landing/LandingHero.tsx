'use client';

import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Star } from 'lucide-react';
import Link from 'next/link';

export function LandingHero() {
  const { t } = useTranslation();

  return (
    <section className="container mx-auto px-4 py-20 text-center lg:text-left">
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <Badge variant="secondary" className="mb-6">
            <Star className="h-4 w-4 mr-2" />
            {t('landing.hero.badge')}
          </Badge>

          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            {t('landing.hero.title')}
          </h1>

          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto lg:mx-0">
            {t('landing.hero.subtitle')}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
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
        </div>

        <div className="relative mt-12 lg:mt-0">
          <div className="relative rounded-xl overflow-hidden shadow-2xl border border-border/50 bg-background/50 backdrop-blur-sm">
            <img
              src="/landing/images/hero-dashboard.png"
              alt="ZADIA OS Dashboard"
              className="w-full h-auto object-cover"
              width={800}
              height={600}
            />
            {/* Decorative elements */}
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary/20 rounded-full blur-3xl -z-10" />
            <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-secondary/20 rounded-full blur-3xl -z-10" />
          </div>
        </div>
      </div>
    </section>
  );
}