/**
 * ZADIA OS - Lead Profile Component
 * 
 * Complete lead details view
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Edit, Trash2, UserCheck, UserX, Mail, Phone, Building, Calendar, Target, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';
import { Lead } from '../../types/sales.types';
import { getLeadById } from '../../services/leads.service';
import { useLeads } from '../../hooks/use-leads';
import { EditLeadDialog } from './EditLeadDialog';
import { DeleteLeadDialog } from './DeleteLeadDialog';
import { DisqualifyLeadDialog } from './DisqualifyLeadDialog';
import { LeadConversionWizard } from './LeadConversionWizard';
import { LEAD_STATUS_LABELS, LEAD_SOURCE_LABELS, getStatusBadgeVariant, getPriorityIcon } from './LeadsTableUtils';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface LeadProfileProps {
  leadId: string;
}

export function LeadProfile({ leadId }: LeadProfileProps) {
  const router = useRouter();
  const { disqualifyLead } = useLeads();
  
  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Dialog states
  const [editDialog, setEditDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [disqualifyDialog, setDisqualifyDialog] = useState(false);
  const [conversionWizard, setConversionWizard] = useState(false);

  useEffect(() => {
    const loadLead = async () => {
      try {
        setLoading(true);
        const leadData = await getLeadById(leadId);
        if (leadData) {
          setLead(leadData);
        } else {
          setError('Lead no encontrado');
        }
      } catch (err) {
        logger.error('Error loading lead', err as Error, { 
          component: 'LeadProfile', 
          action: 'loadLead',
          metadata: { leadId } 
        });
        setError('Error al cargar el lead');
      } finally {
        setLoading(false);
      }
    };

    if (leadId) {
      loadLead();
    }
  }, [leadId]);

  const handleDisqualifyLead = async (reason: string) => {
    if (!lead) return;
    try {
      await disqualifyLead(lead.id, reason);
      toast.success('Lead descalificado');
      setDisqualifyDialog(false);
      router.push('/sales/leads');
    } catch (error) {
      logger.error('Error disqualifying lead', error as Error, { 
        component: 'LeadProfile', 
        action: 'disqualifyLead',
        metadata: { leadId: lead.id, reason } 
      });
      toast.error('Error al descalificar lead');
    }
  };

  const handleDeleteLead = async () => {
    if (!lead) return;
    try {
      const { deleteLead } = await import('../../services/leads.service');
      await deleteLead(lead.id);
      toast.success('Lead eliminado exitosamente');
      setDeleteDialog(false);
      router.push('/sales/leads');
    } catch (error) {
      logger.error('Error deleting lead', error as Error, { 
        component: 'LeadProfile', 
        action: 'deleteLead',
        metadata: { leadId: lead.id } 
      });
      toast.error('Error al eliminar lead');
    }
  };

  const handleEditSuccess = () => {
    setEditDialog(false);
    // Reload lead data
    if (leadId) {
      const loadLead = async () => {
        try {
          const leadData = await getLeadById(leadId);
          if (leadData) setLead(leadData);
        } catch (err) {
          logger.error('Error reloading lead', err as Error, { 
            component: 'LeadProfile', 
            action: 'reloadLead',
            metadata: { leadId } 
          });
        }
      };
      loadLead();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Cargando lead...</p>
        </div>
      </div>
    );
  }

  if (error || !lead) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-destructive mb-4">{error || 'Lead no encontrado'}</p>
          <Button onClick={() => router.push('/sales/leads')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a Leads
          </Button>
        </div>
      </div>
    );
  }

  const leadName = lead.fullName || lead.entityName || 'Sin nombre';
  const priorityIcon = getPriorityIcon(lead.priority);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/sales/leads')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a Leads
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{leadName}</h1>
            <p className="text-muted-foreground">Detalles del lead</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setEditDialog(true)}
          >
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </Button>
          
          {lead.status === 'qualifying' && (
            <Button
              variant="default"
              size="sm"
              onClick={() => setConversionWizard(true)}
            >
              <UserCheck className="h-4 w-4 mr-2" />
              Convertir
            </Button>
          )}
          
          {['new', 'contacted', 'qualifying'].includes(lead.status) && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDisqualifyDialog(true)}
            >
              <UserX className="h-4 w-4 mr-2" />
              Descalificar
            </Button>
          )}
          
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setDeleteDialog(true)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Eliminar
          </Button>
        </div>
      </div>

      {/* Status and Priority */}
      <div className="flex items-center gap-4">
        <Badge className={getStatusBadgeVariant(lead.status)}>
          {LEAD_STATUS_LABELS[lead.status]}
        </Badge>
        <div className="flex items-center gap-2">
          {priorityIcon}
          <span className="text-sm font-medium capitalize">{lead.priority}</span>
        </div>
        <Badge variant="outline">
          {LEAD_SOURCE_LABELS[lead.source]}
        </Badge>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Contact Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Información Básica
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Nombre/Entidad</label>
                  <p className="text-sm">{leadName}</p>
                </div>
                
                {lead.email && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Email</label>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-blue-500" />
                      <p className="text-sm">{lead.email}</p>
                    </div>
                  </div>
                )}
                
                {lead.phone && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Teléfono</label>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-green-500" />
                      <p className="text-sm">{lead.phone}</p>
                    </div>
                  </div>
                )}
                
                {lead.entityType && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Tipo</label>
                    <p className="text-sm capitalize">{lead.entityType}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          {lead.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Notas</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">{lead.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Metrics and Dates */}
        <div className="space-y-6">
          {/* Lead Score */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Puntuación
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">
                  {lead.score || 0}
                </div>
                <p className="text-sm text-muted-foreground">Puntos</p>
              </div>
            </CardContent>
          </Card>

          {/* Important Dates */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Fechas Importantes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Fecha de creación</label>
                <p className="text-sm">
                  {format(lead.createdAt.toDate(), 'dd/MM/yyyy HH:mm', { locale: es })}
                </p>
              </div>
              
              <Separator />
              
              <div>
                <label className="text-sm font-medium text-muted-foreground">Última actualización</label>
                <p className="text-sm">
                  {format(lead.updatedAt.toDate(), 'dd/MM/yyyy HH:mm', { locale: es })}
                </p>
              </div>
              
              {/* TODO: Add lastContactDate field to Lead type if needed */}
            </CardContent>
          </Card>

          {/* Additional Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Información Adicional
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-sm font-medium text-muted-foreground">ID del Lead</label>
                <p className="text-xs font-mono bg-muted p-2 rounded">{lead.id}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-muted-foreground">Creado por</label>
                <p className="text-sm">{lead.createdBy}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Dialogs */}
      {lead && (
        <>
          <LeadConversionWizard
            lead={lead}
            open={conversionWizard}
            onClose={() => setConversionWizard(false)}
          />

          <EditLeadDialog
            open={editDialog}
            onOpenChange={setEditDialog}
            lead={lead}
            onSuccess={handleEditSuccess}
          />

          <DeleteLeadDialog
            open={deleteDialog}
            onOpenChange={setDeleteDialog}
            onConfirm={handleDeleteLead}
            leadName={leadName}
          />

          <DisqualifyLeadDialog
            open={disqualifyDialog}
            onOpenChange={setDisqualifyDialog}
            onConfirm={handleDisqualifyLead}
            leadName={leadName}
          />
        </>
      )}
    </div>
  );
}