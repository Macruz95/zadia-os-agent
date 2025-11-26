/**
 * ZADIA OS - Landing Hero Section
 * Centro de Comando Visual con Dashboard Preview
 */

'use client';

import { useEffect, useState } from 'react';
// import { useTranslation } from 'react-i18next'; // Will add when i18n is needed
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowRight, 
  Sparkles, 
  Play,
  TrendingUp,
  Users,
  DollarSign,
  Activity,
  Zap,
} from 'lucide-react';
import Link from 'next/link';

export function LandingHero() {
  // useTranslation removed - will add when i18n is needed
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center pt-20 pb-12 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: Content */}
          <div 
            className={`text-center lg:text-left transition-all duration-1000 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            {/* Badge */}
            <Badge 
              className="mb-6 bg-[hsl(250_95%_60%/0.15)] text-[hsl(250_95%_70%)] border-[hsl(250_95%_60%/0.3)] hover:bg-[hsl(250_95%_60%/0.2)]"
            >
              <Sparkles className="h-3.5 w-3.5 mr-2" />
              Sistema Operativo Empresarial Agéntico
            </Badge>

            {/* Headline */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 text-white">
              El Centro de Comando{' '}
              <span className="bg-gradient-to-r from-[hsl(250_95%_65%)] to-[hsl(280_90%_60%)] bg-clip-text text-transparent">
                Inteligente
              </span>{' '}
              para tu Empresa
            </h1>

            {/* Subheadline */}
            <p className="text-lg md:text-xl text-[hsl(230_10%_70%)] mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              ZADIA OS orquesta y ejecuta operaciones empresariales de forma autónoma. 
              No es solo software — es tu <strong className="text-white">copiloto estratégico</strong> impulsado por IA.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-12">
              <Link href="/register">
                <Button 
                  size="lg" 
                  className="w-full sm:w-auto bg-gradient-to-r from-[hsl(250_95%_60%)] to-[hsl(280_90%_55%)] hover:from-[hsl(250_95%_65%)] hover:to-[hsl(280_90%_60%)] text-white border-0 shadow-[0_0_20px_hsl(250_100%_60%/0.3)] hover:shadow-[0_0_30px_hsl(250_100%_60%/0.4)] transition-all"
                >
                  Comenzar Gratis
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Button 
                variant="outline" 
                size="lg" 
                className="w-full sm:w-auto border-[hsl(230_15%_30%)] bg-[hsl(230_20%_12%)] hover:bg-[hsl(230_15%_18%)] text-white"
              >
                <Play className="mr-2 h-4 w-4" />
                Ver Demo
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="flex items-center justify-center lg:justify-start gap-6 text-sm text-[hsl(230_10%_50%)]">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[hsl(145_80%_45%)] shadow-[0_0_8px_hsl(145_90%_55%)]" />
                <span>Sin tarjeta de crédito</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[hsl(145_80%_45%)] shadow-[0_0_8px_hsl(145_90%_55%)]" />
                <span>14 días gratis</span>
              </div>
            </div>
          </div>

          {/* Right: Dashboard Preview */}
          <div 
            className={`relative transition-all duration-1000 delay-300 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
            }`}
          >
            <DashboardPreview />
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * Dashboard Preview Component
 * Muestra una vista previa animada del Cockpit
 */
function DashboardPreview() {
  return (
    <div className="relative">
      {/* Glow Effect */}
      <div className="absolute -inset-4 bg-gradient-to-r from-[hsl(250_100%_60%/0.2)] to-[hsl(180_100%_50%/0.2)] rounded-3xl blur-2xl" />
      
      {/* Main Dashboard Card */}
      <div className="relative bg-[hsl(230_20%_10%)] border border-[hsl(230_15%_25%)] rounded-2xl overflow-hidden shadow-2xl">
        {/* Top Bar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[hsl(230_15%_20%)] bg-[hsl(230_25%_8%)]">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[hsl(0_85%_55%)]" />
            <div className="w-3 h-3 rounded-full bg-[hsl(45_100%_55%)]" />
            <div className="w-3 h-3 rounded-full bg-[hsl(145_80%_45%)]" />
          </div>
          <div className="text-xs text-[hsl(230_10%_50%)] font-mono">
            ZADIA OS — Cockpit del CEO
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-[hsl(145_80%_45%)] animate-pulse" />
            <span className="text-xs text-[hsl(145_80%_45%)]">Live</span>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="p-4 space-y-4">
          {/* KPI Cards Row */}
          <div className="grid grid-cols-4 gap-3">
            <KPICard 
              icon={<DollarSign className="h-4 w-4" />}
              label="Ingresos"
              value="$847K"
              trend="+12.5%"
              status="success"
            />
            <KPICard 
              icon={<TrendingUp className="h-4 w-4" />}
              label="Beneficio"
              value="$234K"
              trend="+8.2%"
              status="success"
            />
            <KPICard 
              icon={<Users className="h-4 w-4" />}
              label="Clientes"
              value="1,284"
              trend="+24"
              status="info"
            />
            <KPICard 
              icon={<Activity className="h-4 w-4" />}
              label="ZADIA Score"
              value="87"
              trend="Excelente"
              status="success"
            />
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-3 gap-3">
            {/* Revenue Chart */}
            <div className="col-span-2 bg-[hsl(230_20%_12%)] rounded-lg p-3 border border-[hsl(230_15%_20%)]">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-[hsl(230_10%_60%)]">Ingresos vs Gastos</span>
                <Badge className="text-[10px] bg-[hsl(145_80%_45%/0.15)] text-[hsl(145_80%_55%)] border-0">
                  +15.3%
                </Badge>
              </div>
              <MiniChart />
            </div>

            {/* ZADIA Score Gauge */}
            <div className="bg-[hsl(230_20%_12%)] rounded-lg p-3 border border-[hsl(230_15%_20%)] flex flex-col items-center justify-center">
              <ZadiaScoreGauge value={87} />
              <span className="text-[10px] text-[hsl(230_10%_50%)] mt-2">Salud Empresarial</span>
            </div>
          </div>

          {/* AI Insights */}
          <div className="bg-gradient-to-r from-[hsl(250_95%_60%/0.1)] to-[hsl(180_100%_50%/0.1)] rounded-lg p-3 border border-[hsl(250_95%_60%/0.2)]">
            <div className="flex items-start gap-3">
              <div className="p-1.5 rounded-md bg-[hsl(250_95%_60%/0.2)]">
                <Zap className="h-3.5 w-3.5 text-[hsl(250_95%_70%)]" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-[hsl(230_10%_80%)]">
                  <strong className="text-[hsl(250_95%_70%)]">Insight IA:</strong>{' '}
                  Detecté una oportunidad de expansión. El 82% de tus clientes premium 
                  buscan servicios de mantenimiento que no ofreces.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Elements */}
      <div className="absolute -right-4 top-1/4 animate-float">
        <div className="bg-[hsl(230_20%_12%)] border border-[hsl(230_15%_25%)] rounded-lg p-2 shadow-lg">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-[hsl(145_80%_45%/0.2)] flex items-center justify-center">
              <TrendingUp className="h-3 w-3 text-[hsl(145_80%_55%)]" />
            </div>
            <div>
              <div className="text-[10px] text-[hsl(230_10%_50%)]">Pipeline</div>
              <div className="text-xs font-bold text-white">$1.2M</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Mini KPI Card for Dashboard Preview
 */
function KPICard({ 
  icon, 
  label, 
  value, 
  trend, 
  status 
}: { 
  icon: React.ReactNode;
  label: string;
  value: string;
  trend: string;
  status: 'success' | 'warning' | 'danger' | 'info';
}) {
  const statusColors = {
    success: 'text-[hsl(145_80%_55%)]',
    warning: 'text-[hsl(45_100%_55%)]',
    danger: 'text-[hsl(0_85%_55%)]',
    info: 'text-[hsl(200_100%_55%)]',
  };

  return (
    <div className="bg-[hsl(230_20%_12%)] rounded-lg p-2.5 border border-[hsl(230_15%_20%)]">
      <div className="flex items-center gap-1.5 mb-1.5">
        <span className="text-[hsl(230_10%_50%)]">{icon}</span>
        <span className="text-[10px] text-[hsl(230_10%_50%)]">{label}</span>
      </div>
      <div className="text-lg font-bold text-white font-mono">{value}</div>
      <div className={`text-[10px] ${statusColors[status]}`}>{trend}</div>
    </div>
  );
}

/**
 * Mini Chart for Dashboard Preview
 */
function MiniChart() {
  return (
    <div className="h-20 flex items-end gap-1">
      {[40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 88].map((height, i) => (
        <div key={i} className="flex-1 flex flex-col gap-0.5">
          <div 
            className="bg-[hsl(250_95%_60%)] rounded-t opacity-80"
            style={{ height: `${height * 0.7}%` }}
          />
          <div 
            className="bg-[hsl(0_85%_55%/0.5)] rounded-b"
            style={{ height: `${(100 - height) * 0.3}%` }}
          />
        </div>
      ))}
    </div>
  );
}

/**
 * ZADIA Score Gauge
 */
function ZadiaScoreGauge({ value }: { value: number }) {
  const circumference = 2 * Math.PI * 36;
  const offset = circumference - (value / 100) * circumference;
  
  const getColor = () => {
    if (value >= 80) return 'hsl(145 80% 45%)';
    if (value >= 60) return 'hsl(45 100% 55%)';
    return 'hsl(0 85% 55%)';
  };

  return (
    <div className="relative w-20 h-20">
      <svg className="w-full h-full transform -rotate-90">
        <circle
          cx="40"
          cy="40"
          r="36"
          fill="none"
          stroke="hsl(230 15% 20%)"
          strokeWidth="6"
        />
        <circle
          cx="40"
          cy="40"
          r="36"
          fill="none"
          stroke={getColor()}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{
            filter: `drop-shadow(0 0 6px ${getColor()})`,
            transition: 'stroke-dashoffset 1s ease-out',
          }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xl font-bold text-white font-mono">{value}</span>
      </div>
    </div>
  );
}
