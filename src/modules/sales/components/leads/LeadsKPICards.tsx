/**
 * ZADIA OS - Leads KPI Cards Component
 * 
 * Displays key performance indicators for leads pipeline
 */
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AnimatedCard, AnimatedNumber } from '@/components/ui/motion';
import {
  TrendingUp,
  Users,
  Calendar,
  UserCheck
} from 'lucide-react';
import { Lead } from '../../types/sales.types';

interface LeadsKPICardsProps {
  leads: Lead[];
}

export function LeadsKPICards({ leads }: LeadsKPICardsProps) {
  // Calculate KPIs
  const activeLeads = leads.filter((lead: Lead) =>
    ['new', 'contacted', 'qualifying'].includes(lead.status)
  ).length;

  const hotLeads = leads.filter((lead: Lead) => lead.priority === 'hot').length;

  const thisMonthLeads = leads.filter((lead: Lead) => {
    const leadDate = lead.createdAt.toDate();
    const now = new Date();
    return leadDate.getMonth() === now.getMonth() &&
      leadDate.getFullYear() === now.getFullYear();
  }).length;

  const conversionRate = leads.length > 0
    ? (leads.filter((lead: Lead) => lead.status === 'converted').length / leads.length * 100)
    : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <AnimatedCard delay={0} glowColor="primary">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Leads Activos
          </CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            <AnimatedNumber value={activeLeads} />
          </div>
          <p className="text-xs text-muted-foreground">
            En proceso de calificación
          </p>
        </CardContent>
      </AnimatedCard>

      <AnimatedCard delay={0.1} glowColor="primary">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Leads Calientes
          </CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            <AnimatedNumber value={hotLeads} />
          </div>
          <p className="text-xs text-muted-foreground">
            Alta prioridad
          </p>
        </CardContent>
      </AnimatedCard>

      <AnimatedCard delay={0.2} glowColor="primary">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Este Mes
          </CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            <AnimatedNumber value={thisMonthLeads} />
          </div>
          <p className="text-xs text-muted-foreground">
            Leads nuevos
          </p>
        </CardContent>
      </AnimatedCard>

      <AnimatedCard delay={0.3} glowColor="primary">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Tasa Conversión
          </CardTitle>
          <UserCheck className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            <AnimatedNumber value={Number(conversionRate.toFixed(1))} />%
          </div>
          <p className="text-xs text-muted-foreground">
            Leads convertidos
          </p>
        </CardContent>
      </AnimatedCard>
    </div>
  );
}