/**
 * ZADIA OS - Lead Profile Component
 * 
 * Complete lead details view (refactored to use modular components)
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';
import { Lead } from '../../types/sales.types';
import { getLeadById } from '../../services/leads.service';
import { useLeads } from '../../hooks/use-leads';
import { EditLeadDialog } from './EditLeadDialog';
import { DeleteLeadDialog } from './DeleteLeadDialog';
import { DisqualifyLeadDialog } from './DisqualifyLeadDialog';
import { LeadConversionWizard } from './LeadConversionWizard';
import { LeadProfileHeader } from './profile/LeadProfileHeader';
import { LeadContactInfo } from './profile/LeadContactInfo';
import { LeadMetrics } from './profile/LeadMetrics';
import { LeadDatesInfo } from './profile/LeadDatesInfo';

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
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <LeadProfileHeader
        lead={lead}
        onBack={() => router.push('/sales/leads')}
        onEdit={() => setEditDialog(true)}
        onConvert={() => setConversionWizard(true)}
        onDisqualify={() => setDisqualifyDialog(true)}
        onDelete={() => setDeleteDialog(true)}
      />

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Contact Information */}
        <div className="lg:col-span-2">
          <LeadContactInfo lead={lead} />
        </div>

        {/* Right Column - Metrics and Dates */}
        <div className="space-y-6">
          <LeadMetrics lead={lead} />
          <LeadDatesInfo lead={lead} />
        </div>
      </div>

      {/* Dialogs */}
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
        leadName={lead.fullName || lead.entityName || 'Sin nombre'}
      />

      <DisqualifyLeadDialog
        open={disqualifyDialog}
        onOpenChange={setDisqualifyDialog}
        onConfirm={handleDisqualifyLead}
        leadName={lead.fullName || lead.entityName || 'Sin nombre'}
      />
    </div>
  );
}