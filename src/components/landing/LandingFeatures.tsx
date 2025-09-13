'use client';

import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Code, Globe, Lock, Zap, Settings } from 'lucide-react';

export function LandingFeatures() {
  const { t } = useTranslation();

  const features = [
    {
      icon: <Code className="h-8 w-8" />,
      title: t('landing.features.ai.title'),
      description: t('landing.features.ai.description'),
    },
    {
      icon: <Globe className="h-8 w-8" />,
      title: t('landing.features.integration.title'),
      description: t('landing.features.integration.description'),
    },
    {
      icon: <Lock className="h-8 w-8" />,
      title: t('landing.features.security.title'),
      description: t('landing.features.security.description'),
    },
    {
      icon: <Zap className="h-8 w-8" />,
      title: t('landing.features.automation.title'),
      description: t('landing.features.automation.description'),
    },
    {
      icon: <Settings className="h-8 w-8" />,
      title: t('landing.features.analytics.title'),
      description: t('landing.features.analytics.description'),
    },
    {
      icon: <CheckCircle className="h-8 w-8" />,
      title: t('landing.features.collaboration.title'),
      description: t('landing.features.collaboration.description'),
    },
  ];

  return (
    <section className="bg-muted/50 py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {t('landing.features.title')}
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {t('landing.features.subtitle')}
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="border-0 shadow-lg">
              <CardHeader>
                <div className="text-primary mb-4">
                  {feature.icon}
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}