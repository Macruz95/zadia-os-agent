/**
 * ZADIA OS - Landing Page
 * Sistema Operativo Empresarial Agéntico
 * Estética de Centro de Comando / Cockpit Ejecutivo
 */

'use client';

import '@/styles/zadia-theme.css';
import { LandingHeader } from './LandingHeader';
import { LandingHero } from './LandingHero';
import { LandingFeatures } from './LandingFeatures';
import { LandingShowcase } from './LandingShowcase';
import { LandingStats } from './LandingStats';
import { LandingTestimonials } from './LandingTestimonials';
import { LandingCTA } from './LandingCTA';
import { LandingFooter } from './LandingFooter';

export function LandingPage() {
  return (
    <div className="zadia-landing zadia-dark relative">
      {/* Ambient Glow Effects */}
      <div className="zadia-landing-glow primary" />
      <div className="zadia-landing-glow accent" />
      
      {/* Grid Background */}
      <div className="fixed inset-0 zadia-grid-bg opacity-30 pointer-events-none" />
      
      <LandingHeader />
      
      <main className="relative z-10">
        <LandingHero />
        <LandingStats />
        <LandingFeatures />
        <LandingShowcase />
        <LandingTestimonials />
        <LandingCTA />
      </main>
      
      <LandingFooter />
    </div>
  );
}
