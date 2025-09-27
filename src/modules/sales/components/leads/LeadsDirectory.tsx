/**
 * ZADIA OS - Leads Directory Page
 * 
 * Main page for managing leads pipeline
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
  Search, 
  Plus, 
  Filter, 
  MoreHorizontal,
  TrendingUp,
  Users,
  PhoneCall,
  Mail,
  Calendar,
  UserCheck,
  UserX
} from 'lucide-react';
import { toast } from 'sonner';
import { useLeads } from '../../hooks/use-leads';
import { useAuth } from '@/contexts/AuthContext';
import { CreateLeadDialog } from './CreateLeadDialogSimple';
import { Lead, LeadStatus, LeadSource, LeadPriority } from '../../types/sales.types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const LEAD_STATUS_LABELS = {
  new: 'Nuevo',
  contacted: 'Contactado',
  qualifying: 'Calificando',
  disqualified: 'Descalificado',
  converted: 'Convertido'
};

const LEAD_SOURCE_LABELS = {
  web: 'Web',
  referral: 'Referido',
  event: 'Evento',
  'cold-call': 'Llamada',
  imported: 'Importado'
};

export function LeadsDirectory() {
  const router = useRouter();
  const { user } = useAuth();
  const {
    leads,
    loading,
    error,
    totalCount,
    searchLeads,
    convertLead,
    disqualifyLead,
    refresh
  } = useLeads();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<LeadStatus | 'all'>('all');
  const [sourceFilter, setSourceFilter] = useState<LeadSource | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<LeadPriority | 'all'>('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const handleSearch = useCallback(async () => {
    const filters = {
      ...(statusFilter !== 'all' && { status: [statusFilter] }),
      ...(sourceFilter !== 'all' && { source: [sourceFilter] }),
      ...(priorityFilter !== 'all' && { priority: [priorityFilter] }),
    };

    await searchLeads(filters, true);
  }, [statusFilter, sourceFilter, priorityFilter, searchLeads]);

  // Load initial data
  useEffect(() => {
    if (user) {
      handleSearch();
    }
  }, [user, handleSearch]);

  const handleConvertLead = async (lead: Lead) => {
    try {
      await convertLead(lead.id);
      toast.success('Lead convertido exitosamente');
      // TODO: Redirect to conversion wizard
    } catch (error) {
      console.error('Error converting lead:', error);
      toast.error('Error al convertir lead');
    }
  };

  const handleDisqualifyLead = async (lead: Lead) => {
    try {
      const reason = prompt('Motivo de descalificación:');
      if (reason) {
        await disqualifyLead(lead.id, reason);
        toast.success('Lead descalificado');
      }
    } catch (error) {
      console.error('Error disqualifying lead:', error);
      toast.error('Error al descalificar lead');
    }
  };

  const getStatusBadgeVariant = (status: LeadStatus) => {
    switch (status) {
      case 'new': return 'default';
      case 'contacted': return 'secondary';
      case 'qualifying': return 'outline';
      case 'converted': return 'default';
      case 'disqualified': return 'destructive';
      default: return 'default';
    }
  };

  const getPriorityIcon = (priority: LeadPriority) => {
    switch (priority) {
      case 'hot': return '🔥';
      case 'warm': return '🟡';
      case 'cold': return '🧊';
      default: return '🟡';
    }
  };

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

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-destructive">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Pipeline de Leads</h1>
          <p className="text-muted-foreground">
            Gestiona y califica prospectos de ventas
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={refresh}
            disabled={loading}
          >
            <TrendingUp className="h-4 w-4 mr-2" />
            Actualizar
          </Button>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Lead
          </Button>
        </div>
      </div>

      {/* KPIs Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Leads Activos
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeLeads}</div>
            <p className="text-xs text-muted-foreground">
              En proceso de calificación
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Leads Calientes
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{hotLeads}</div>
            <p className="text-xs text-muted-foreground">
              Alta prioridad
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Este Mes
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{thisMonthLeads}</div>
            <p className="text-xs text-muted-foreground">
              Leads nuevos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tasa Conversión
            </CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{conversionRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              Leads convertidos
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
                placeholder="Buscar por nombre, email, empresa..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>

            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as LeadStatus | 'all')}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="new">Nuevo</SelectItem>
                <SelectItem value="contacted">Contactado</SelectItem>
                <SelectItem value="qualifying">Calificando</SelectItem>
                <SelectItem value="disqualified">Descalificado</SelectItem>
                <SelectItem value="converted">Convertido</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sourceFilter} onValueChange={(value) => setSourceFilter(value as LeadSource | 'all')}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Fuente" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="web">Web</SelectItem>
                <SelectItem value="referral">Referido</SelectItem>
                <SelectItem value="event">Evento</SelectItem>
                <SelectItem value="cold-call">Llamada</SelectItem>
                <SelectItem value="imported">Importado</SelectItem>
              </SelectContent>
            </Select>

            <Select value={priorityFilter} onValueChange={(value) => setPriorityFilter(value as LeadPriority | 'all')}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Prioridad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="hot">Caliente</SelectItem>
                <SelectItem value="warm">Tibio</SelectItem>
                <SelectItem value="cold">Frío</SelectItem>
              </SelectContent>
            </Select>

            <Button onClick={handleSearch} disabled={loading}>
              <Search className="h-4 w-4 mr-2" />
              Buscar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Leads Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Leads ({totalCount})</CardTitle>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filtros avanzados
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre/Entidad</TableHead>
                  <TableHead>Contacto</TableHead>
                  <TableHead>Fuente</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Prioridad</TableHead>
                  <TableHead>Puntuación</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      Cargando leads...
                    </TableCell>
                  </TableRow>
                ) : leads.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      No se encontraron leads
                    </TableCell>
                  </TableRow>
                ) : (
                  leads.map((lead) => (
                    <TableRow 
                      key={lead.id} 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => router.push(`/sales/leads/${lead.id}`)}
                    >
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {lead.entityType === 'person' 
                              ? lead.fullName 
                              : lead.entityName
                            }
                          </p>
                          {lead.company && (
                            <p className="text-sm text-muted-foreground">
                              {lead.company}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1">
                            <Mail className="h-3 w-3 text-muted-foreground" />
                            <span className="text-sm">{lead.email}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <PhoneCall className="h-3 w-3 text-muted-foreground" />
                            <span className="text-sm">{lead.phone}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {LEAD_SOURCE_LABELS[lead.source]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(lead.status)}>
                          {LEAD_STATUS_LABELS[lead.status]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span>{getPriorityIcon(lead.priority)}</span>
                          <span className="text-sm">{lead.score}</span>
                        </div>
                      </TableCell>
                      <TableCell>{lead.score}</TableCell>
                      <TableCell>
                        {format(lead.createdAt.toDate(), 'dd/MM/yyyy', { locale: es })}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button 
                              variant="ghost" 
                              className="h-8 w-8 p-0"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => router.push(`/sales/leads/${lead.id}`)}>
                              Ver detalles
                            </DropdownMenuItem>
                            {lead.status === 'qualifying' && (
                              <DropdownMenuItem onClick={() => handleConvertLead(lead)}>
                                <UserCheck className="h-4 w-4 mr-2" />
                                Convertir
                              </DropdownMenuItem>
                            )}
                            {['new', 'contacted', 'qualifying'].includes(lead.status) && (
                              <DropdownMenuItem 
                                onClick={() => handleDisqualifyLead(lead)}
                                className="text-destructive"
                              >
                                <UserX className="h-4 w-4 mr-2" />
                                Descalificar
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Create Lead Dialog */}
      <CreateLeadDialog 
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSuccess={refresh}
      />
    </div>
  );
}