/**
 * ZADIA OS - Opportunity Profile Page
 * 
 * Dynamic page for viewing opportunity details, timeline, interactions, quotes, and actions
 * 
 * @page /sales/opportunities/[id]
 */

'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Building2, DollarSign, Calendar, TrendingUp, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { formatUSD } from '@/lib/currency.utils';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';
import { OpportunitiesService } from '@/modules/sales/services/opportunities.service';
import { QuotesService } from '@/modules/sales/services/quotes.service';
import type { Opportunity, Quote } from '@/modules/sales/types/sales.types';
import { Timestamp } from 'firebase/firestore';
import { OpportunityTimeline } from '@/modules/sales/components/opportunities/profile/OpportunityTimeline';
import { OpportunityQuotesList } from '@/modules/sales/components/opportunities/profile/OpportunityQuotesList';
import { OpportunityStageProgress } from '@/modules/sales/components/opportunities/profile/OpportunityStageProgress';
import { OpportunityInteractionComposer } from '@/modules/sales/components/opportunities/profile/OpportunityInteractionComposer';

export default function OpportunityProfilePage() {
  const params = useParams();
  const router = useRouter();
  const opportunityId = params?.id as string;

  const [opportunity, setOpportunity] = useState<Opportunity | null>(null);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (opportunityId) {
      loadOpportunityData();
    }
  }, [opportunityId]);

  const loadOpportunityData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load opportunity
      const oppData = await OpportunitiesService.getOpportunityById(opportunityId);
      if (!oppData) {
        setError('Oportunidad no encontrada');
        return;
      }
      setOpportunity(oppData);

      // Load quotes
      const quotesData = await QuotesService.getQuotesByOpportunity(opportunityId);
      setQuotes(quotesData);

    } catch (err) {
      logger.error('Error loading opportunity data', err as Error);
      setError('Error al cargar los datos de la oportunidad');
      toast.error('Error al cargar la oportunidad');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp: Timestamp | Date | undefined, formatString: string) => {
    if (!timestamp) return 'No definida';
    const date = timestamp instanceof Timestamp ? timestamp.toDate() : timestamp;
    return format(date, formatString, { locale: es });
  };

  const getStageLabel = (stage: string) => {
    const labels: Record<string, string> = {
      'qualified': 'Calificado',
      'proposal-sent': 'Propuesta Enviada',
      'negotiation': 'Negociación',
      'closed-won': 'Ganada',
      'closed-lost': 'Perdida',
    };
    return labels[stage] || stage;
  };

  const getPriorityBadge = (priority: string) => {
    const variants: Record<string, 'destructive' | 'default' | 'secondary'> = {
      high: 'destructive',
      medium: 'default',
      low: 'secondary',
    };
    const labels: Record<string, string> = {
      high: 'Alta',
      medium: 'Media',
      low: 'Baja',
    };
    return { variant: variants[priority] || 'default', label: labels[priority] || priority };
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-muted-foreground">Cargando oportunidad...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !opportunity) {
    return (
      <div className="container mx-auto py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error || 'Oportunidad no encontrada'}
          </AlertDescription>
        </Alert>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => router.push('/sales/opportunities')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver a Oportunidades
        </Button>
      </div>
    );
  }

  const priorityBadge = getPriorityBadge(opportunity.priority);

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/sales/opportunities')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{opportunity.name}</h1>
            <p className="text-muted-foreground">ID: {opportunity.id}</p>
          </div>
        </div>
        <Badge variant={priorityBadge.variant}>{priorityBadge.label}</Badge>
      </div>

      {/* Stage Progress */}
      <OpportunityStageProgress opportunity={opportunity} />

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-600" />
              Valor Estimado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatUSD(opportunity.estimatedValue, { minimumFractionDigits: 0 })}</p>
            <p className="text-xs text-muted-foreground mt-1">{opportunity.currency}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              Probabilidad
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{opportunity.probability}%</p>
            <p className="text-xs text-muted-foreground mt-1">de cierre</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4 text-orange-600" />
              Fecha Esperada
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold">
              {formatDate(opportunity.expectedCloseDate, 'dd MMM yyyy')}
            </p>
            <p className="text-xs text-muted-foreground mt-1">de cierre</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Building2 className="h-4 w-4 text-purple-600" />
              Etapa Actual
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold">{getStageLabel(opportunity.stage)}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {opportunity.status === 'won' ? 'Ganada' : opportunity.status === 'lost' ? 'Perdida' : 'En progreso'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="timeline" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 lg:w-[600px]">
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="quotes">Cotizaciones ({quotes.length})</TabsTrigger>
          <TabsTrigger value="details">Detalles</TabsTrigger>
        </TabsList>

        <TabsContent value="timeline" className="space-y-4">
          <OpportunityInteractionComposer
            opportunityId={opportunityId}
            onInteractionCreated={loadOpportunityData}
          />
          <OpportunityTimeline opportunityId={opportunityId} />
        </TabsContent>

        <TabsContent value="quotes" className="space-y-4">
          <OpportunityQuotesList
            opportunityId={opportunityId}
            quotes={quotes}
            onQuotesChange={loadOpportunityData}
          />
        </TabsContent>

        <TabsContent value="details" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Información General</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Cliente ID</p>
                  <p className="text-base">{opportunity.clientId}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Contacto ID</p>
                  <p className="text-base">{opportunity.contactId}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Asignado a</p>
                  <p className="text-base">{opportunity.assignedTo}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Creado por</p>
                  <p className="text-base">{opportunity.createdBy}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Fecha de creación</p>
                  <p className="text-base">{formatDate(opportunity.createdAt, 'dd MMM yyyy HH:mm')}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Última actualización</p>
                  <p className="text-base">{formatDate(opportunity.updatedAt, 'dd MMM yyyy HH:mm')}</p>
                </div>
              </div>

              {opportunity.notes && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Notas</p>
                  <p className="text-base whitespace-pre-wrap">{opportunity.notes}</p>
                </div>
              )}

              {opportunity.lossReason && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Motivo de Pérdida</p>
                  <p className="text-base">{opportunity.lossReason}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
