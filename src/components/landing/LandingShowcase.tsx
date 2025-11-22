'use client';

import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export function LandingShowcase() {
    const { t } = useTranslation();

    const features = [
        {
            id: 'crm',
            title: t('landing.features.ai.title'), // Using existing keys for now, ideally should have specific keys
            description: t('landing.features.ai.description'),
            image: '/landing/images/feature-crm.png',
            align: 'right',
            bullets: ['Pipeline Management', 'Lead Scoring', 'Automated Follow-ups']
        },
        {
            id: 'projects',
            title: t('landing.features.integration.title'),
            description: t('landing.features.integration.description'),
            image: '/landing/images/feature-projects.png',
            align: 'left',
            bullets: ['Gantt Charts', 'Task Dependencies', 'Team Collaboration']
        },
        {
            id: 'finance',
            title: t('landing.features.analytics.title'),
            description: t('landing.features.analytics.description'),
            image: '/landing/images/feature-finance.png',
            align: 'right',
            bullets: ['Revenue Tracking', 'Expense Management', 'Profit Analysis']
        },
        {
            id: 'ai',
            title: t('landing.features.automation.title'),
            description: t('landing.features.automation.description'),
            image: '/landing/images/feature-ai.png',
            align: 'left',
            bullets: ['Smart Suggestions', 'Automated Reports', '24/7 Assistant']
        }
    ];

    return (
        <section className="py-24 overflow-hidden">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">
                        {t('landing.features.title')}
                    </h2>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        {t('landing.features.subtitle')}
                    </p>
                </div>

                <div className="space-y-24">
                    {features.map((feature, index) => (
                        <div key={feature.id} className={`flex flex-col lg:flex-row gap-12 items-center ${feature.align === 'left' ? 'lg:flex-row-reverse' : ''}`}>
                            <div className="flex-1">
                                <h3 className="text-2xl md:text-3xl font-bold mb-4">{feature.title}</h3>
                                <p className="text-lg text-muted-foreground mb-6">
                                    {feature.description}
                                </p>
                                <ul className="space-y-3 mb-8">
                                    {feature.bullets.map((bullet, i) => (
                                        <li key={i} className="flex items-center gap-3">
                                            <CheckCircle2 className="h-5 w-5 text-primary" />
                                            <span>{bullet}</span>
                                        </li>
                                    ))}
                                </ul>
                                <Button variant="outline" className="group">
                                    Learn more
                                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                                </Button>
                            </div>

                            <div className="flex-1 w-full">
                                <div className="relative rounded-xl overflow-hidden shadow-2xl border border-border/50 bg-background/50">
                                    <img
                                        src={feature.image}
                                        alt={feature.title}
                                        className="w-full h-auto object-cover hover:scale-105 transition-transform duration-500"
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
