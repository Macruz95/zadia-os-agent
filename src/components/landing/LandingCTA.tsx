/**
 * ZADIA OS - Landing CTA Section
 * Call to Action final con estética impactante
 */

'use client';

import { useRef, useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { 
  ArrowRight, 
  Sparkles,
  CheckCircle2,
  Zap,
} from 'lucide-react';

const benefits = [
  '14 días de prueba gratis',
  'Sin tarjeta de crédito',
  'Configuración en minutos',
  'Soporte personalizado',
];

export function LandingCTA() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="py-24 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[hsl(250_95%_60%/0.05)] to-transparent" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[hsl(250_95%_60%/0.1)] rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative">
        <div 
          className={`max-w-4xl mx-auto text-center transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[hsl(250_95%_60%/0.15)] border border-[hsl(250_95%_60%/0.3)] mb-8">
            <Zap className="h-4 w-4 text-[hsl(250_95%_70%)]" />
            <span className="text-sm font-medium text-[hsl(250_95%_70%)]">
              Comienza tu transformación hoy
            </span>
          </div>

          {/* Headline */}
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
            El Futuro de tu Empresa{' '}
            <span className="bg-gradient-to-r from-[hsl(250_95%_65%)] to-[hsl(180_100%_50%)] bg-clip-text text-transparent">
              Comienza Ahora
            </span>
          </h2>

          {/* Description */}
          <p className="text-lg md:text-xl text-[hsl(230_10%_60%)] mb-10 max-w-2xl mx-auto leading-relaxed">
            Únete a cientos de empresas que ya operan con inteligencia autónoma. 
            ZADIA OS no es solo software — es tu ventaja competitiva.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
            <Link href="/register">
              <Button 
                size="lg"
                className="w-full sm:w-auto text-lg px-8 py-6 bg-gradient-to-r from-[hsl(250_95%_60%)] to-[hsl(280_90%_55%)] hover:from-[hsl(250_95%_65%)] hover:to-[hsl(280_90%_60%)] text-white border-0 shadow-[0_0_30px_hsl(250_100%_60%/0.4)] hover:shadow-[0_0_40px_hsl(250_100%_60%/0.5)] transition-all"
              >
                <Sparkles className="mr-2 h-5 w-5" />
                Comenzar Gratis
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Button 
              variant="outline"
              size="lg"
              className="w-full sm:w-auto text-lg px-8 py-6 border-[hsl(230_15%_30%)] bg-[hsl(230_20%_10%)] hover:bg-[hsl(230_15%_15%)] text-white"
            >
              Agendar Demo
            </Button>
          </div>

          {/* Benefits */}
          <div className="flex flex-wrap justify-center gap-6">
            {benefits.map((benefit, index) => (
              <div 
                key={index}
                className="flex items-center gap-2 text-[hsl(230_10%_60%)]"
              >
                <CheckCircle2 className="h-4 w-4 text-[hsl(145_80%_55%)]" />
                <span className="text-sm">{benefit}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Decoration */}
        <div 
          className={`mt-16 pt-16 border-t border-[hsl(230_15%_18%)] transition-all duration-700 delay-300 ${
            isVisible ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div className="flex flex-col md:flex-row items-center justify-center gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-white mb-1">4.9/5</div>
              <div className="text-sm text-[hsl(230_10%_50%)]">Calificación promedio</div>
            </div>
            <div className="hidden md:block w-px h-12 bg-[hsl(230_15%_25%)]" />
            <div>
              <div className="text-3xl font-bold text-white mb-1">99.9%</div>
              <div className="text-sm text-[hsl(230_10%_50%)]">Uptime garantizado</div>
            </div>
            <div className="hidden md:block w-px h-12 bg-[hsl(230_15%_25%)]" />
            <div>
              <div className="text-3xl font-bold text-white mb-1">&lt;2h</div>
              <div className="text-sm text-[hsl(230_10%_50%)]">Tiempo de respuesta</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
