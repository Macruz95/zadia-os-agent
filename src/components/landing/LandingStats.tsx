/**
 * ZADIA OS - Landing Stats Section
 * Métricas impactantes con animación de contador
 */

'use client';

import { useEffect, useState, useRef } from 'react';
import { 
  Building2, 
  Users, 
  Zap, 
  Clock,
  // TrendingUp removed - not used
} from 'lucide-react';

interface Stat {
  icon: React.ReactNode;
  value: number;
  suffix: string;
  label: string;
  description: string;
}

const stats: Stat[] = [
  {
    icon: <Building2 className="h-6 w-6" />,
    value: 500,
    suffix: '+',
    label: 'Empresas',
    description: 'Confían en ZADIA OS',
  },
  {
    icon: <Users className="h-6 w-6" />,
    value: 50,
    suffix: 'K+',
    label: 'Usuarios Activos',
    description: 'En toda Latinoamérica',
  },
  {
    icon: <Zap className="h-6 w-6" />,
    value: 2,
    suffix: 'M+',
    label: 'Tareas Automatizadas',
    description: 'Por nuestros agentes IA',
  },
  {
    icon: <Clock className="h-6 w-6" />,
    value: 40,
    suffix: '%',
    label: 'Tiempo Ahorrado',
    description: 'En operaciones diarias',
  },
];

export function LandingStats() {
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
    <section 
      ref={sectionRef}
      className="relative py-20 border-y border-[hsl(230_15%_20%)]"
    >
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[hsl(250_95%_60%/0.03)] to-transparent" />
      
      <div className="container mx-auto px-4 relative">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {stats.map((stat, index) => (
            <StatCard 
              key={index} 
              stat={stat} 
              isVisible={isVisible}
              delay={index * 150}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function StatCard({ 
  stat, 
  isVisible, 
  delay 
}: { 
  stat: Stat;
  isVisible: boolean;
  delay: number;
}) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isVisible) return;

    const timer = setTimeout(() => {
      const duration = 2000;
      const steps = 60;
      const increment = stat.value / steps;
      let current = 0;

      const counter = setInterval(() => {
        current += increment;
        if (current >= stat.value) {
          setCount(stat.value);
          clearInterval(counter);
        } else {
          setCount(Math.floor(current));
        }
      }, duration / steps);

      return () => clearInterval(counter);
    }, delay);

    return () => clearTimeout(timer);
  }, [isVisible, stat.value, delay]);

  return (
    <div 
      className={`text-center transition-all duration-700 ${
        isVisible 
          ? 'opacity-100 translate-y-0' 
          : 'opacity-0 translate-y-8'
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {/* Icon */}
      <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-[hsl(250_95%_60%/0.1)] text-[hsl(250_95%_70%)] mb-4">
        {stat.icon}
      </div>

      {/* Value */}
      <div className="mb-2">
        <span className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-white to-[hsl(230_10%_70%)] bg-clip-text text-transparent font-mono">
          {count}
        </span>
        <span className="text-2xl lg:text-3xl font-bold text-[hsl(250_95%_70%)]">
          {stat.suffix}
        </span>
      </div>

      {/* Label */}
      <div className="text-white font-semibold mb-1">{stat.label}</div>
      
      {/* Description */}
      <div className="text-sm text-[hsl(230_10%_50%)]">{stat.description}</div>
    </div>
  );
}

