/**
 * ZADIA OS - Landing Showcase Section
 * Casos de uso y módulos del sistema
 */

'use client';

import { useState, useRef, useEffect } from 'react';
import { 
  BarChart3,
  Users,
  Briefcase,
  Package,
  DollarSign,
  UserCog,
  Brain,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Module {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  features: string[];
  gradient: string;
}

const modules: Module[] = [
  {
    id: 'dashboard',
    icon: <BarChart3 className="h-6 w-6" />,
    title: 'Cockpit del CEO',
    description: 'Centro de comando ejecutivo con métricas en tiempo real, ZADIA Score™ y el Consejero Digital.',
    features: [
      'KPIs financieros en vivo',
      'ZADIA Score™ de salud empresarial',
      'Proyecciones de flujo de caja',
      'Insights predictivos de IA',
    ],
    gradient: 'from-[hsl(250_95%_60%)] to-[hsl(280_90%_55%)]',
  },
  {
    id: 'sales',
    icon: <Users className="h-6 w-6" />,
    title: 'CRM Inteligente',
    description: 'Gestión de clientes y pipeline de ventas con scoring predictivo y detección automática de oportunidades.',
    features: [
      'Pipeline visual con IA',
      'Scoring de leads automático',
      'Detección de churn',
      'Seguimiento automatizado',
    ],
    gradient: 'from-[hsl(200_100%_55%)] to-[hsl(180_100%_50%)]',
  },
  {
    id: 'projects',
    icon: <Briefcase className="h-6 w-6" />,
    title: 'Gestión de Proyectos',
    description: 'Tablero Kanban con salud calculada por IA, dependencias automáticas y tracking de rentabilidad.',
    features: [
      'Kanban con salud por IA',
      'Tracking de tiempo integrado',
      'Gestión de presupuestos',
      'Alertas de riesgo automáticas',
    ],
    gradient: 'from-[hsl(45_100%_55%)] to-[hsl(25_100%_50%)]',
  },
  {
    id: 'inventory',
    icon: <Package className="h-6 w-6" />,
    title: 'Inventario Inteligente',
    description: 'Control de stock con predicción de demanda, alertas automáticas y reabastecimiento inteligente.',
    features: [
      'Predicción de demanda',
      'Alertas de stock bajo',
      'Reabastecimiento automático',
      'Trazabilidad completa',
    ],
    gradient: 'from-[hsl(145_80%_45%)] to-[hsl(160_80%_40%)]',
  },
  {
    id: 'finance',
    icon: <DollarSign className="h-6 w-6" />,
    title: 'Finanzas & Facturación',
    description: 'Gestión financiera completa con proyecciones, facturación electrónica y cobros automatizados.',
    features: [
      'Facturación electrónica',
      'Proyección de flujo de caja',
      'Cobros automatizados',
      'Reportes financieros IA',
    ],
    gradient: 'from-[hsl(145_80%_45%)] to-[hsl(180_100%_50%)]',
  },
  {
    id: 'hr',
    icon: <UserCog className="h-6 w-6" />,
    title: 'Recursos Humanos',
    description: 'Gestión de personal, nómina, control de asistencia y evaluación de desempeño con IA.',
    features: [
      'Control de asistencia',
      'Gestión de nómina',
      'Evaluación por IA',
      'Portal del empleado',
    ],
    gradient: 'from-[hsl(330_80%_55%)] to-[hsl(280_90%_55%)]',
  },
];

export function LandingShowcase() {
  const [activeModule, setActiveModule] = useState(modules[0]);
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
      id="showcase" 
      className="py-24 relative"
    >
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[hsl(230_25%_6%)] to-transparent" />
      
      <div className="container mx-auto px-4 relative">
        {/* Section Header */}
        <div 
          className={`text-center mb-16 transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <span className="text-sm font-semibold text-[hsl(250_95%_70%)] uppercase tracking-wider mb-4 block">
            Módulos
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
            Todo lo que Necesitas,{' '}
            <span className="bg-gradient-to-r from-[hsl(250_95%_65%)] to-[hsl(180_100%_50%)] bg-clip-text text-transparent">
              Conectado
            </span>
          </h2>
          <p className="text-lg text-[hsl(230_10%_60%)] max-w-2xl mx-auto">
            Cada módulo está integrado con el Gemelo Digital de tu organización. 
            Los datos fluyen en tiempo real, sin silos, sin fricciones.
          </p>
        </div>

        {/* Module Tabs */}
        <div 
          className={`flex flex-wrap justify-center gap-3 mb-12 transition-all duration-700 delay-200 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          {modules.map((module) => (
            <button
              key={module.id}
              onClick={() => setActiveModule(module)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeModule.id === module.id
                  ? 'bg-[hsl(250_95%_60%)] text-white shadow-[0_0_20px_hsl(250_100%_60%/0.3)]'
                  : 'bg-[hsl(230_20%_12%)] text-[hsl(230_10%_60%)] hover:bg-[hsl(230_20%_16%)] hover:text-white border border-[hsl(230_15%_20%)]'
              }`}
            >
              {module.icon}
              <span className="hidden sm:inline">{module.title}</span>
            </button>
          ))}
        </div>

        {/* Active Module Display */}
        <div 
          className={`grid lg:grid-cols-2 gap-12 items-center transition-all duration-700 delay-300 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          {/* Content */}
          <div className="order-2 lg:order-1">
            <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${activeModule.gradient} mb-6 shadow-lg`}>
              <span className="text-white">{activeModule.icon}</span>
            </div>
            
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
              {activeModule.title}
            </h3>
            
            <p className="text-lg text-[hsl(230_10%_60%)] mb-8 leading-relaxed">
              {activeModule.description}
            </p>

            {/* Features List */}
            <ul className="space-y-4 mb-8">
              {activeModule.features.map((feature, index) => (
                <li 
                  key={index}
                  className="flex items-center gap-3 text-[hsl(230_10%_75%)]"
                >
                  <CheckCircle2 className="h-5 w-5 text-[hsl(145_80%_55%)] shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>

            <Button 
              className="bg-gradient-to-r from-[hsl(250_95%_60%)] to-[hsl(280_90%_55%)] hover:from-[hsl(250_95%_65%)] hover:to-[hsl(280_90%_60%)] text-white border-0"
            >
              Explorar {activeModule.title}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>

          {/* Visual */}
          <div className="order-1 lg:order-2">
            <ModulePreview module={activeModule} />
          </div>
        </div>
      </div>
    </section>
  );
}

function ModulePreview({ module }: { module: Module }) {
  return (
    <div className="relative">
      {/* Glow */}
      <div className={`absolute -inset-4 bg-gradient-to-r ${module.gradient} rounded-3xl blur-2xl opacity-20`} />
      
      {/* Card */}
      <div className="relative bg-[hsl(230_20%_10%)] border border-[hsl(230_15%_20%)] rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-[hsl(230_15%_18%)] bg-[hsl(230_25%_8%)]">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-[hsl(0_85%_55%)]" />
            <div className="w-3 h-3 rounded-full bg-[hsl(45_100%_55%)]" />
            <div className="w-3 h-3 rounded-full bg-[hsl(145_80%_45%)]" />
          </div>
          <span className="text-xs text-[hsl(230_10%_50%)] font-mono ml-2">
            {module.title}
          </span>
        </div>

        {/* Content - Module specific mock */}
        <div className="p-6 space-y-4">
          {/* Mock KPI Row */}
          <div className="grid grid-cols-3 gap-3">
            {[1, 2, 3].map((i) => (
              <div 
                key={i}
                className="bg-[hsl(230_20%_12%)] rounded-lg p-3 border border-[hsl(230_15%_18%)]"
              >
                <div className="h-2 w-12 bg-[hsl(230_15%_25%)] rounded mb-2" />
                <div className="h-5 w-16 bg-[hsl(230_15%_20%)] rounded" />
              </div>
            ))}
          </div>

          {/* Mock Chart */}
          <div className="bg-[hsl(230_20%_12%)] rounded-lg p-4 border border-[hsl(230_15%_18%)]">
            <div className="h-32 flex items-end gap-2">
              {[40, 65, 45, 80, 55, 90, 70, 85, 60, 95].map((h, i) => (
                <div 
                  key={i}
                  className={`flex-1 rounded-t bg-gradient-to-t ${module.gradient} opacity-70`}
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
          </div>

          {/* Mock List */}
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div 
                key={i}
                className="flex items-center gap-3 bg-[hsl(230_20%_12%)] rounded-lg p-3 border border-[hsl(230_15%_18%)]"
              >
                <div className="w-8 h-8 rounded-full bg-[hsl(230_15%_20%)]" />
                <div className="flex-1">
                  <div className="h-2 w-24 bg-[hsl(230_15%_25%)] rounded mb-1.5" />
                  <div className="h-2 w-16 bg-[hsl(230_15%_20%)] rounded" />
                </div>
                <div className={`h-2 w-12 rounded bg-gradient-to-r ${module.gradient} opacity-50`} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Floating Badge */}
      <div className="absolute -right-2 -bottom-2 bg-[hsl(230_20%_12%)] border border-[hsl(230_15%_25%)] rounded-lg px-3 py-2 shadow-xl">
        <div className="flex items-center gap-2">
          <Brain className="h-4 w-4 text-[hsl(250_95%_70%)]" />
          <span className="text-xs text-[hsl(230_10%_70%)]">IA Activa</span>
        </div>
      </div>
    </div>
  );
}
