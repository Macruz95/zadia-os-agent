/**
 * ZADIA OS - CEO Cockpit Dashboard
 * 
 * Centro de mando ejecutivo unificado
 * REGLA 2: ShadCN UI + Lucide icons + Motion
 * REGLA 5: < 100 líneas
 */

'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useDashboardData } from '@/modules/dashboard/hooks/use-dashboard-data';
import { useDashboardRevenue } from '@/modules/dashboard/hooks/use-dashboard-revenue';
import { useDashboardMetrics } from '@/modules/dashboard/hooks/useDashboardMetrics';
import { RevenueChart, ProjectStatusChart, DashboardLoading } from '@/modules/dashboard/components';
import { ZadiaScoreWidget, DigitalAdvisorWidget, FinancialKPIGrid } from '@/components/cockpit';
import { GlobalActivityFeed } from '@/components/cockpit/GlobalActivityFeed';
import { AgenticSystemStatus } from '@/components/cockpit/AgenticSystemStatus';
import { Zap, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AnimatedPage, AnimatedSection } from '@/components/ui/motion';
import { motion } from 'motion/react';

export default function DashboardPage() {
  const { user, firebaseUser, loading: authLoading } = useAuth();
  const { stats, projectStatus, loading } = useDashboardData(firebaseUser?.uid);
  const { data: revenueData, monthlyRevenue, loading: revenueLoading } = useDashboardRevenue(6);
  const { metrics, loading: metricsLoading } = useDashboardMetrics();

  const isLoading = authLoading || loading || revenueLoading || metricsLoading;

  if (isLoading) {
    return <DashboardLoading />;
  }

  // Use firebaseUser for auth check (user profile may not exist yet)
  if (!firebaseUser) {
    return null;
  }

  // Get display name from user profile or firebaseUser
  const displayName = user?.displayName || firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Usuario';

  return (
    <AnimatedPage className="space-y-6 p-6">
      {/* Header */}
      <AnimatedSection>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div
              className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center"
              initial={{ scale: 0.5, opacity: 0, rotate: -20 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              transition={{ type: 'spring' as const, stiffness: 200, damping: 15 }}
              whileHover={{ scale: 1.05, boxShadow: '0 0 25px rgba(6,182,212,0.5)' }}
            >
              <Zap className="h-5 w-5 text-foreground" />
            </motion.div>
            <div>
              <h1 className="text-2xl font-bold text-foreground tracking-tight">
                Centro de Mando
              </h1>
              <p className="text-sm text-muted-foreground">
                Bienvenido, {displayName}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualizar
          </Button>
        </div>
      </AnimatedSection>

      {/* KPIs Financieros con Sparklines */}
      <AnimatedSection delay={0.1}>
        <FinancialKPIGrid
          revenue={revenueData?.totalRevenue || 0}
          expenses={metrics?.financial?.monthlyExpenses || 0}
          profit={metrics?.financial?.netProfit || 0}
          pendingInvoices={stats?.pendingInvoices || 0}
          revenueHistory={monthlyRevenue?.map(m => m.revenue) || []}
          loading={isLoading}
        />
      </AnimatedSection>

      {/* ZADIA Score + Consejero Digital */}
      <AnimatedSection delay={0.15}>
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <ZadiaScoreWidget />
          <div className="xl:col-span-2">
            <DigitalAdvisorWidget maxInsights={3} />
          </div>
        </div>
      </AnimatedSection>

      {/* Gráficos: Ingresos + Estado de Proyectos */}
      <AnimatedSection delay={0.2}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RevenueChart data={monthlyRevenue} />
          <ProjectStatusChart data={projectStatus} />
        </div>
      </AnimatedSection>

      {/* Sistema Agéntico A-OS - Full Width */}
      <AnimatedSection delay={0.25}>
        <AgenticSystemStatus />
      </AnimatedSection>

      {/* Actividad Global del Sistema */}
      <AnimatedSection delay={0.3}>
        <GlobalActivityFeed maxEvents={10} />
      </AnimatedSection>
    </AnimatedPage>
  );
}

