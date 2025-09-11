'use client';

import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowRight, 
  Brain, 
  Zap, 
  Shield, 
  Globe, 
  BarChart3, 
  Users, 
  Bot,
  CheckCircle,
  Star
} from 'lucide-react';
import Link from 'next/link';

export function LandingPage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
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

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <Badge variant="secondary" className="mb-6">
          <Star className="h-4 w-4 mr-2" />
          {t('landing.hero.badge')}
        </Badge>
        
        <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
          {t('landing.hero.title')}
        </h1>
        
        <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
          {t('landing.hero.subtitle')}
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Link href="/register">
            <Button size="lg" className="text-lg px-8">
              {t('landing.hero.ctaPrimary')}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <Link href="/login">
            <Button size="lg" variant="outline" className="text-lg px-8">
              {t('landing.hero.ctaSecondary')}
            </Button>
          </Link>
        </div>
        
        <div className="text-sm text-muted-foreground">
          {t('landing.hero.freeText')}
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {t('landing.features.title')}
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {t('landing.features.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card className="relative overflow-hidden">
            <CardHeader>
              <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Brain className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>{t('landing.features.ai.title')}</CardTitle>
              <CardDescription>
                {t('landing.features.ai.description')}
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="relative overflow-hidden">
            <CardHeader>
              <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>{t('landing.features.automation.title')}</CardTitle>
              <CardDescription>
                {t('landing.features.automation.description')}
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="relative overflow-hidden">
            <CardHeader>
              <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <BarChart3 className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>{t('landing.features.analytics.title')}</CardTitle>
              <CardDescription>
                {t('landing.features.analytics.description')}
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="relative overflow-hidden">
            <CardHeader>
              <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>{t('landing.features.security.title')}</CardTitle>
              <CardDescription>
                {t('landing.features.security.description')}
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="relative overflow-hidden">
            <CardHeader>
              <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>{t('landing.features.collaboration.title')}</CardTitle>
              <CardDescription>
                {t('landing.features.collaboration.description')}
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="relative overflow-hidden">
            <CardHeader>
              <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Globe className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>{t('landing.features.integration.title')}</CardTitle>
              <CardDescription>
                {t('landing.features.integration.description')}
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="bg-muted/50 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {t('landing.benefits.title')}
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {t('landing.benefits.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <CheckCircle className="h-6 w-6 text-green-500 mt-1" />
              </div>
              <div>
                <h3 className="font-semibold mb-2">{t('landing.benefits.efficiency.title')}</h3>
                <p className="text-muted-foreground">{t('landing.benefits.efficiency.description')}</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <CheckCircle className="h-6 w-6 text-green-500 mt-1" />
              </div>
              <div>
                <h3 className="font-semibold mb-2">{t('landing.benefits.decisions.title')}</h3>
                <p className="text-muted-foreground">{t('landing.benefits.decisions.description')}</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <CheckCircle className="h-6 w-6 text-green-500 mt-1" />
              </div>
              <div>
                <h3 className="font-semibold mb-2">{t('landing.benefits.scalability.title')}</h3>
                <p className="text-muted-foreground">{t('landing.benefits.scalability.description')}</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <CheckCircle className="h-6 w-6 text-green-500 mt-1" />
              </div>
              <div>
                <h3 className="font-semibold mb-2">{t('landing.benefits.innovation.title')}</h3>
                <p className="text-muted-foreground">{t('landing.benefits.innovation.description')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          {t('landing.cta.title')}
        </h2>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          {t('landing.cta.subtitle')}
        </p>
        <Link href="/register">
          <Button size="lg" className="text-lg px-8">
            {t('landing.cta.button')}
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/20">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="h-6 w-6 bg-primary rounded flex items-center justify-center">
                <Bot className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-semibold">ZADIA OS</span>
            </div>
            <div className="text-sm text-muted-foreground">
              {t('landing.footer.copyright')}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
