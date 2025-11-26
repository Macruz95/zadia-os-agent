/**
 * ZADIA OS - Landing Features Section
 * Características principales del Sistema Operativo Empresarial Agéntico
 */

'use client';

import { useEffect, useRef, useState } from 'react';
import { 
  Brain,
  Layers,
  Zap,
  Shield,
  BarChart3,
  Users,
  Workflow,
  Sparkles,
  Target,
  Clock,
  Globe,
  // Lock removed - not used
} from 'lucide-react';

interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
  highlight?: string;
}

const mainFeatures: Feature[] = [
  {
    icon: <Brain className="h-7 w-7" />,
    title: 'IA Agéntica',
    description: 'Agentes autónomos que ejecutan tareas complejas. No solo asisten — actúan, deciden y aprenden.',
    highlight: 'Nuevo paradigma',
  },
  {
    icon: <Layers className="h-7 w-7" />,
    title: 'Gemelo Digital (DTO)',
    description: 'Un modelo vivo de tu organización. Cada dato conectado en tiempo real para decisiones perfectas.',
    highlight: 'Core Technology',
  },
  {
    icon: <Zap className="h-7 w-7" />,
    title: 'Flujos Cognitivos',
    description: 'Automatizaciones inteligentes listas para usar. Activa con un clic, sin código ni configuración.',
    highlight: 'Zero-config',
  },
];

const secondaryFeatures: Feature[] = [
  {
    icon: <Target className="h-5 w-5" />,
    title: 'ZADIA Score™',
    description: 'Puntuación holística de salud empresarial calculada por IA.',
  },
  {
    icon: <BarChart3 className="h-5 w-5" />,
    title: 'Proyecciones Predictivas',
    description: 'Flujo de caja y ventas proyectadas con bandas de confianza.',
  },
  {
    icon: <Sparkles className="h-5 w-5" />,
    title: 'El Oráculo',
    description: 'Interfaz de comandos universal. Pregunta, crea, actúa — todo con Cmd+K.',
  },
  {
    icon: <Users className="h-5 w-5" />,
    title: 'CRM Inteligente',
    description: 'Gestión de clientes con scoring predictivo y detección de churn.',
  },
  {
    icon: <Workflow className="h-5 w-5" />,
    title: 'Gestión de Proyectos',
    description: 'Kanban con salud calculada por IA y dependencias automáticas.',
  },
  {
    icon: <Clock className="h-5 w-5" />,
    title: 'Agenda Cognitiva',
    description: 'Calendario que prepara dossiers y protege tu tiempo de foco.',
  },
  {
    icon: <Shield className="h-5 w-5" />,
    title: 'Seguridad Enterprise',
    description: 'Encriptación end-to-end, RBAC y cumplimiento normativo.',
  },
  {
    icon: <Globe className="h-5 w-5" />,
    title: 'Integraciones',
    description: 'Conecta con Gmail, Slack, WhatsApp, y 100+ herramientas.',
  },
];

export function LandingFeatures() {
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
    <section ref={sectionRef} className="py-24 relative" id="features">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div 
          className={`text-center mb-16 transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <span className="text-sm font-semibold text-[hsl(250_95%_70%)] uppercase tracking-wider mb-4 block">
            Capacidades
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
            El Poder de la{' '}
            <span className="bg-gradient-to-r from-[hsl(250_95%_65%)] to-[hsl(180_100%_50%)] bg-clip-text text-transparent">
              Autonomía Empresarial
            </span>
          </h2>
          <p className="text-lg text-[hsl(230_10%_60%)] max-w-2xl mx-auto">
            ZADIA OS combina la potencia de un ERP con la flexibilidad de un Work OS, 
            impulsado por una inteligencia que no es un añadido — es el núcleo.
          </p>
        </div>

        {/* Main Features - 3 Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {mainFeatures.map((feature, index) => (
            <MainFeatureCard 
              key={index}
              feature={feature}
              isVisible={isVisible}
              delay={index * 100}
            />
          ))}
        </div>

        {/* Secondary Features - Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {secondaryFeatures.map((feature, index) => (
            <SecondaryFeatureCard
              key={index}
              feature={feature}
              isVisible={isVisible}
              delay={300 + index * 50}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function MainFeatureCard({ 
  feature, 
  isVisible, 
  delay 
}: { 
  feature: Feature;
  isVisible: boolean;
  delay: number;
}) {
  return (
    <div 
      className={`group relative bg-[hsl(230_20%_10%)] border border-[hsl(230_15%_20%)] rounded-2xl p-8 transition-all duration-500 hover:border-[hsl(250_95%_60%/0.5)] hover:shadow-[0_0_30px_hsl(250_100%_60%/0.15)] ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {/* Highlight Badge */}
      {feature.highlight && (
        <span className="absolute -top-3 left-6 px-3 py-1 text-xs font-semibold bg-gradient-to-r from-[hsl(250_95%_60%)] to-[hsl(280_90%_55%)] text-white rounded-full">
          {feature.highlight}
        </span>
      )}

      {/* Icon */}
      <div className="w-14 h-14 rounded-xl bg-[hsl(250_95%_60%/0.1)] flex items-center justify-center text-[hsl(250_95%_70%)] mb-6 group-hover:bg-[hsl(250_95%_60%/0.2)] transition-colors">
        {feature.icon}
      </div>

      {/* Content */}
      <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
      <p className="text-[hsl(230_10%_60%)] leading-relaxed">{feature.description}</p>

      {/* Hover Glow */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[hsl(250_95%_60%/0.05)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
    </div>
  );
}

function SecondaryFeatureCard({ 
  feature, 
  isVisible, 
  delay 
}: { 
  feature: Feature;
  isVisible: boolean;
  delay: number;
}) {
  return (
    <div 
      className={`group bg-[hsl(230_20%_10%/0.5)] border border-[hsl(230_15%_18%)] rounded-xl p-5 transition-all duration-300 hover:bg-[hsl(230_20%_12%)] hover:border-[hsl(230_15%_25%)] ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className="w-10 h-10 rounded-lg bg-[hsl(250_95%_60%/0.1)] flex items-center justify-center text-[hsl(250_95%_70%)] shrink-0">
          {feature.icon}
        </div>

        {/* Content */}
        <div>
          <h4 className="font-semibold text-white mb-1">{feature.title}</h4>
          <p className="text-sm text-[hsl(230_10%_55%)] leading-relaxed">
            {feature.description}
          </p>
        </div>
      </div>
    </div>
  );
}
