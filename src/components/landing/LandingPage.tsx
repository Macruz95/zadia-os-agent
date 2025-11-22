'use client';

import { LandingHeader } from './LandingHeader';
import { LandingHero } from './LandingHero';
import { LandingFeatures } from './LandingFeatures';
import { LandingTestimonials } from './LandingTestimonials';
import { LandingCTA } from './LandingCTA';
import { LandingShowcase } from './LandingShowcase';
import { LandingFooter } from './LandingFooter';

export function LandingPage() {
  return (
    <div className="min-h-screen">
      <LandingHeader />
      <main>
        <LandingHero />
        <LandingFeatures />
        <LandingShowcase />
        <LandingTestimonials />
        <LandingCTA />
      </main>
      <LandingFooter />
    </div>
  );
}
