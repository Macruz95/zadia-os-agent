/**
 * ZADIA OS - Opportunities Kanban Board
 * 
 * Visual pipeline management for sales opportunities
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Plus, 
  Filter, 
  MoreHorizontal,
  TrendingUp,
  DollarSign,
  Calendar,
  User,
  Target,
  Trophy,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { Opportunity, OpportunityStage, OpportunityStatus, OpportunityPriority } from '../../types/sales.types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const STAGE_CONFIG = {
  qualified: {
    title: 'Calificado',
    color: 'bg-blue-100 border-blue-300',
    textColor: 'text-blue-700',
    icon: User,
  },
  'proposal-sent': {
    title: 'Propuesta Enviada',
    color: 'bg-yellow-100 border-yellow-300',
    textColor: 'text-yellow-700',
    icon: Target,
  },
  negotiation: {
    title: 'Negociación',
    color: 'bg-orange-100 border-orange-300',
    textColor: 'text-orange-700',
    icon: TrendingUp,
  },
  'closed-won': {
    title: 'Ganada',
    color: 'bg-green-100 border-green-300',
    textColor: 'text-green-700',
    icon: Trophy,
  },
  'closed-lost': {
    title: 'Perdida',
    color: 'bg-red-100 border-red-300',
    textColor: 'text-red-700',
    icon: AlertCircle,
  },
};

const PRIORITY_COLORS = {
  high: 'bg-red-100 text-red-700 border-red-300',
  medium: 'bg-yellow-100 text-yellow-700 border-yellow-300',
  low: 'bg-gray-100 text-gray-700 border-gray-300',
};

// Mock data - TODO: Replace with actual service
const MOCK_OPPORTUNITIES: Opportunity[] = [
  {
    id: '1',
    name: 'Sistema ERP Empresa ABC',
    clientId: 'client-1',
    contactId: 'contact-1',
    estimatedValue: 50000,
    currency: 'USD',
    stage: 'qualified',
    status: 'open',
    probability: 25,
    priority: 'high',
    assignedTo: 'user-1',
    source: 'lead-1',
    notes: 'Cliente interesado en sistema completo de gestión',
    createdAt: { toDate: () => new Date('2024-01-15') } as unknown as import('firebase/firestore').Timestamp,
    updatedAt: { toDate: () => new Date('2024-01-20') } as unknown as import('firebase/firestore').Timestamp,
    createdBy: 'user-1',
    expectedCloseDate: { toDate: () => new Date('2024-03-15') } as unknown as import('firebase/firestore').Timestamp,
  },
  {
    id: '2',
    name: 'Consultoría IT Tech Corp',
    clientId: 'client-2',
    contactId: 'contact-2',
    estimatedValue: 25000,
    currency: 'USD',
    stage: 'proposal-sent',
    status: 'open',
    probability: 60,
    priority: 'medium',
    assignedTo: 'user-1',
    notes: 'Propuesta enviada, esperando feedback',
    createdAt: { toDate: () => new Date('2024-01-10') } as unknown as import('firebase/firestore').Timestamp,
    updatedAt: { toDate: () => new Date('2024-01-25') } as unknown as import('firebase/firestore').Timestamp,
    createdBy: 'user-1',
    expectedCloseDate: { toDate: () => new Date('2024-02-28') } as unknown as import('firebase/firestore').Timestamp,
  },
  {
    id: '3',
    name: 'Desarrollo Web Startup XYZ',
    clientId: 'client-3',
    contactId: 'contact-3',
    estimatedValue: 15000,
    currency: 'USD',
    stage: 'negotiation',
    status: 'open',
    probability: 80,
    priority: 'high',
    assignedTo: 'user-1',
    notes: 'Negociando términos finales',
    createdAt: { toDate: () => new Date('2024-01-05') } as unknown as import('firebase/firestore').Timestamp,
    updatedAt: { toDate: () => new Date('2024-01-28') } as unknown as import('firebase/firestore').Timestamp,
    createdBy: 'user-1',
    expectedCloseDate: { toDate: () => new Date('2024-02-15') } as unknown as import('firebase/firestore').Timestamp,
  },
];

export function OpportunitiesKanban() {
  const router = useRouter();
  const { user } = useAuth();
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<OpportunityStatus | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<OpportunityPriority | 'all'>('all');

  const loadOpportunities = useCallback(async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual service call
      setTimeout(() => {
        setOpportunities(MOCK_OPPORTUNITIES);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error loading opportunities:', error);
      toast.error('Error al cargar oportunidades');
      setLoading(false);
    }
  }, []);

  // Load opportunities on mount
  useEffect(() => {
    if (user) {
      loadOpportunities();
    }
  }, [user, loadOpportunities]);

  // Filter opportunities
  const filteredOpportunities = opportunities.filter(opp => {
    const matchesSearch = !searchQuery || 
      opp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (opp.notes && opp.notes.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || opp.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || opp.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  // Group opportunities by stage
  const opportunitiesByStage = Object.keys(STAGE_CONFIG).reduce((acc, stage) => {
    acc[stage as OpportunityStage] = filteredOpportunities.filter(
      opp => opp.stage === stage
    );
    return acc;
  }, {} as Record<OpportunityStage, Opportunity[]>);

  // Calculate KPIs
  const totalValue = opportunities.reduce((sum, opp) => sum + opp.estimatedValue, 0);
  const avgDealSize = opportunities.length > 0 ? totalValue / opportunities.length : 0;
  const weightedValue = opportunities.reduce((sum, opp) => 
    sum + (opp.estimatedValue * opp.probability / 100), 0);
  const highPriorityCount = opportunities.filter(opp => opp.priority === 'high').length;

  const handleStageChange = async (opportunityId: string, newStage: OpportunityStage) => {
    try {
      // TODO: Implement stage change service call
      setOpportunities(prev => 
        prev.map(opp => 
          opp.id === opportunityId 
            ? { ...opp, stage: newStage, updatedAt: { toDate: () => new Date() } as unknown as import('firebase/firestore').Timestamp }
            : opp
        )
      );
      toast.success('Etapa actualizada exitosamente');
    } catch (error) {
      console.error('Error updating stage:', error);
      toast.error('Error al actualizar etapa');
    }
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('es-PY', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Pipeline de Oportunidades</h1>
          <p className="text-muted-foreground">
            Gestiona el progreso de tus oportunidades de venta
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadOpportunities} disabled={loading}>
            <TrendingUp className="h-4 w-4 mr-2" />
            Actualizar
          </Button>
          <Button onClick={() => router.push('/sales/opportunities/new')}>
            <Plus className="h-4 w-4 mr-2" />
            Nueva Oportunidad
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Valor Total Pipeline
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalValue)}
            </div>
            <p className="text-xs text-muted-foreground">
              {opportunities.length} oportunidades
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Valor Ponderado
            </CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(weightedValue)}
            </div>
            <p className="text-xs text-muted-foreground">
              Basado en probabilidad
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Deal Size Promedio
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(avgDealSize)}
            </div>
            <p className="text-xs text-muted-foreground">
              Por oportunidad
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Alta Prioridad
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{highPriorityCount}</div>
            <p className="text-xs text-muted-foreground">
              Requieren atención
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <Input
                placeholder="Buscar oportunidades..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>

            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as OpportunityStatus | 'all')}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="open">Abierto</SelectItem>
                <SelectItem value="won">Ganado</SelectItem>
                <SelectItem value="lost">Perdido</SelectItem>
              </SelectContent>
            </Select>

            <Select value={priorityFilter} onValueChange={(value) => setPriorityFilter(value as OpportunityPriority | 'all')}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Prioridad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="high">Alta</SelectItem>
                <SelectItem value="medium">Media</SelectItem>
                <SelectItem value="low">Baja</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filtros avanzados
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 min-h-[600px]">
        {(Object.keys(STAGE_CONFIG) as OpportunityStage[]).map((stage) => {
          const stageConfig = STAGE_CONFIG[stage];
          const stageOpportunities = opportunitiesByStage[stage] || [];
          const stageValue = stageOpportunities.reduce((sum, opp) => sum + opp.estimatedValue, 0);
          const Icon = stageConfig.icon;

          return (
            <div key={stage} className={`rounded-lg border-2 ${stageConfig.color} p-4`}>
              {/* Stage Header */}
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Icon className={`h-5 w-5 ${stageConfig.textColor}`} />
                  <h3 className={`font-semibold ${stageConfig.textColor}`}>
                    {stageConfig.title}
                  </h3>
                  <Badge variant="outline" className={stageConfig.textColor}>
                    {stageOpportunities.length}
                  </Badge>
                </div>
                <p className={`text-sm ${stageConfig.textColor}`}>
                  {formatCurrency(stageValue)}
                </p>
              </div>

              {/* Opportunities Cards */}
              <div className="space-y-3">
                {stageOpportunities.map((opportunity) => (
                  <Card 
                    key={opportunity.id} 
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => router.push(`/sales/opportunities/${opportunity.id}`)}
                  >
                    <CardContent className="p-3">
                      <div className="space-y-2">
                        {/* Opportunity Name */}
                        <h4 className="font-medium text-sm leading-tight">
                          {opportunity.name}
                        </h4>

                        {/* Value and Priority */}
                        <div className="flex items-center justify-between">
                          <Badge variant="outline" className="text-xs">
                            {formatCurrency(opportunity.estimatedValue)}
                          </Badge>
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${PRIORITY_COLORS[opportunity.priority]}`}
                          >
                            {opportunity.priority.toUpperCase()}
                          </Badge>
                        </div>

                        {/* Probability */}
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full transition-all"
                              style={{ width: `${opportunity.probability}%` }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {opportunity.probability}%
                          </span>
                        </div>

                        {/* Expected Close Date */}
                        {opportunity.expectedCloseDate && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            {format(opportunity.expectedCloseDate.toDate(), 'dd/MM/yyyy', { locale: es })}
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex items-center justify-between pt-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src="" />
                            <AvatarFallback className="text-xs">
                              {opportunity.assignedTo.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button 
                                variant="ghost" 
                                className="h-6 w-6 p-0"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <MoreHorizontal className="h-3 w-3" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                Ver detalles
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                Agregar nota
                              </DropdownMenuItem>
                              {stage !== 'closed-won' && stage !== 'closed-lost' && (
                                <>
                                  {stage !== 'negotiation' && (
                                    <DropdownMenuItem 
                                      onClick={() => handleStageChange(opportunity.id, 'negotiation')}
                                    >
                                      Mover a Negociación
                                    </DropdownMenuItem>
                                  )}
                                  <DropdownMenuItem 
                                    onClick={() => handleStageChange(opportunity.id, 'closed-won')}
                                  >
                                    Marcar como Ganada
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={() => handleStageChange(opportunity.id, 'closed-lost')}
                                    className="text-destructive"
                                  >
                                    Marcar como Perdida
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {/* Empty State */}
                {stageOpportunities.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    No hay oportunidades en esta etapa
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}