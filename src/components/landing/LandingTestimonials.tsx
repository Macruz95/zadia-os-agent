/**
 * ZADIA OS - Landing Testimonials Section
 * Testimonios de clientes con estética premium
 */

'use client';

import { useRef, useEffect, useState } from 'react';
import { Star, Quote } from 'lucide-react';

interface Testimonial {
  id: number;
  content: string;
  author: string;
  role: string;
  company: string;
  rating: number;
  avatar: string;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    content: 'ZADIA OS transformó completamente nuestra operación. El ZADIA Score™ nos da visibilidad instantánea de la salud del negocio. Es como tener un CFO con IA trabajando 24/7.',
    author: 'Carlos Mendoza',
    role: 'CEO',
    company: 'Constructora del Norte',
    rating: 5,
    avatar: 'CM',
  },
  {
    id: 2,
    content: 'Los Flujos Cognitivos nos ahorraron 40 horas semanales en tareas repetitivas. La automatización de cobranza sola pagó la inversión en el primer mes.',
    author: 'Ana García',
    role: 'Directora de Operaciones',
    company: 'TechSolutions MX',
    rating: 5,
    avatar: 'AG',
  },
  {
    id: 3,
    content: 'El Consejero Digital detectó una oportunidad de negocio que nosotros no habíamos visto. Generamos $200K adicionales gracias a ese insight.',
    author: 'Roberto Sánchez',
    role: 'Fundador',
    company: 'Muebles Artesanales',
    rating: 5,
    avatar: 'RS',
  },
  {
    id: 4,
    content: 'Pasamos de usar 8 herramientas diferentes a solo ZADIA OS. Todo conectado, todo en tiempo real. Nuestro equipo está más productivo que nunca.',
    author: 'María López',
    role: 'COO',
    company: 'Distribuidora Central',
    rating: 5,
    avatar: 'ML',
  },
];

export function LandingTestimonials() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section 
      ref={sectionRef}
      id="testimonials" 
      className="py-24 relative overflow-hidden"
    >
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[hsl(230_25%_6%)] via-transparent to-[hsl(230_25%_6%)]" />
      
      <div className="container mx-auto px-4 relative">
        {/* Section Header */}
        <div 
          className={`text-center mb-16 transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <span className="text-sm font-semibold text-[hsl(250_95%_70%)] uppercase tracking-wider mb-4 block">
            Testimonios
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
            Empresas que{' '}
            <span className="bg-gradient-to-r from-[hsl(250_95%_65%)] to-[hsl(180_100%_50%)] bg-clip-text text-transparent">
              Confían en ZADIA
            </span>
          </h2>
          <p className="text-lg text-[hsl(230_10%_60%)] max-w-2xl mx-auto">
            Líderes empresariales que transformaron sus operaciones con el poder de la IA agéntica.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard 
              key={testimonial.id}
              testimonial={testimonial}
              isVisible={isVisible}
              delay={index * 100}
            />
          ))}
        </div>

        {/* Trust Logos */}
        <div 
          className={`mt-16 pt-16 border-t border-[hsl(230_15%_18%)] transition-all duration-700 delay-500 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <p className="text-center text-sm text-[hsl(230_10%_50%)] mb-8">
            Empresas que impulsan su crecimiento con ZADIA OS
          </p>
          <div className="flex flex-wrap justify-center items-center gap-12 opacity-50">
            {['Empresa A', 'Empresa B', 'Empresa C', 'Empresa D', 'Empresa E'].map((company, i) => (
              <div 
                key={i}
                className="text-lg font-bold text-[hsl(230_10%_40%)]"
              >
                {company}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function TestimonialCard({ 
  testimonial, 
  isVisible, 
  delay 
}: { 
  testimonial: Testimonial;
  isVisible: boolean;
  delay: number;
}) {
  return (
    <div 
      className={`group relative bg-[hsl(230_20%_10%)] border border-[hsl(230_15%_20%)] rounded-2xl p-6 transition-all duration-500 hover:border-[hsl(250_95%_60%/0.3)] ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {/* Quote Icon */}
      <Quote className="absolute top-6 right-6 h-8 w-8 text-[hsl(250_95%_60%/0.2)]" />

      {/* Rating */}
      <div className="flex gap-1 mb-4">
        {Array.from({ length: testimonial.rating }).map((_, i) => (
          <Star 
            key={i}
            className="h-4 w-4 fill-[hsl(45_100%_55%)] text-[hsl(45_100%_55%)]"
          />
        ))}
      </div>

      {/* Content */}
      <p className="text-[hsl(230_10%_75%)] leading-relaxed mb-6">
        "{testimonial.content}"
      </p>

      {/* Author */}
      <div className="flex items-center gap-4">
        {/* Avatar */}
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[hsl(250_95%_60%)] to-[hsl(280_90%_55%)] flex items-center justify-center text-white font-bold">
          {testimonial.avatar}
        </div>

        {/* Info */}
        <div>
          <div className="font-semibold text-white">{testimonial.author}</div>
          <div className="text-sm text-[hsl(230_10%_55%)]">
            {testimonial.role}, {testimonial.company}
          </div>
        </div>
      </div>

      {/* Hover Glow */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[hsl(250_95%_60%/0.05)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
    </div>
  );
}
