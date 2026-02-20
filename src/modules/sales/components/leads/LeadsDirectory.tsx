/**
 * ZADIA OS - Leads Directory Page
 * 
 * Main page for managing leads pipeline
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';
import { useLeads } from '../../hooks/use-leads';
import { useAuth } from '@/contexts/AuthContext';
import { deleteLead } from '../../services/leads.service';
import { CreateLeadDialog } from './CreateLeadDialogSimple';
import { EditLeadDialog } from './EditLeadDialog';
import { DeleteLeadDialog } from './DeleteLeadDialog';
import { DisqualifyLeadDialog } from './DisqualifyLeadDialog';
import { LeadsHeader } from './LeadsHeader';
import { LeadsKPICards } from './LeadsKPICards';
import { LeadsFilters } from './LeadsFilters';
import { LeadsTable } from './LeadsTable';
import { QuoteFormWizard } from '../quotes/QuoteFormWizard'; // NEW: For creating quotes from leads
import { Lead, LeadStatus, LeadSource, LeadPriority } from '../../types/sales.types';
import { AnimatedPage, AnimatedSection } from '@/components/ui/motion';

export function LeadsDirectory() {
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
  const [editDialog, setEditDialog] = useState<{ open: boolean; lead: Lead | null }>({
    open: false,
    lead: null,
  });
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; lead: Lead | null }>({
    open: false,
    lead: null,
  });
  const [disqualifyDialog, setDisqualifyDialog] = useState<{ open: boolean; lead: Lead | null }>({
    open: false,
    lead: null,
  });
  // NEW: Quote dialog state for creating quotes from leads
  const [quoteDialog, setQuoteDialog] = useState<{ open: boolean; lead: Lead | null }>({
    open: false,
    lead: null,
  });

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
      logger.error('Error converting lead', error as Error, {
        component: 'LeadsDirectory',
        action: 'convertLead',
        metadata: { leadId: lead.id }
      });
      toast.error('Error al convertir lead');
    }
  };

  const handleDisqualifyLead = async (lead: Lead) => {
    setDisqualifyDialog({ open: true, lead });
  };

  const confirmDisqualifyLead = async (reason: string) => {
    if (!disqualifyDialog.lead) return;

    try {
      await disqualifyLead(disqualifyDialog.lead.id, reason);
      toast.success('Lead descalificado');
      refresh();
    } catch (error) {
      logger.error('Error disqualifying lead', error as Error, {
        component: 'LeadsDirectory',
        action: 'disqualifyLead',
        metadata: { leadId: disqualifyDialog.lead.id, reason }
      });
      toast.error('Error al descalificar lead');
    } finally {
      setDisqualifyDialog({ open: false, lead: null });
    }
  };

  const handleEditLead = (lead: Lead) => {
    setEditDialog({ open: true, lead });
  };

  const handleDeleteLead = (lead: Lead) => {
    setDeleteDialog({ open: true, lead });
  };

  const confirmDeleteLead = async () => {
    if (!deleteDialog.lead) return;

    try {
      await deleteLead(deleteDialog.lead.id);
      toast.success('Lead eliminado exitosamente');
      refresh();
    } catch (error) {
      logger.error('Error deleting lead', error as Error, {
        component: 'LeadsDirectory',
        action: 'deleteLead',
        metadata: { leadId: deleteDialog.lead.id }
      });
      toast.error('Error al eliminar lead');
    } finally {
      setDeleteDialog({ open: false, lead: null });
    }
  };

  const handleEditSuccess = () => {
    refresh();
    setEditDialog({ open: false, lead: null });
  };

  // NEW: Handler for creating quotes from leads
  const handleCreateQuote = (lead: Lead) => {
    setQuoteDialog({ open: true, lead });
  };

  const handleQuoteSuccess = (quoteId: string) => {
    toast.success(`Cotización creada exitosamente (${quoteId.slice(0, 8)})`);
    setQuoteDialog({ open: false, lead: null });
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-destructive">{error}</p>
      </div>
    );
  }

  return (
    <AnimatedPage className="p-6 space-y-6">
      <AnimatedSection>
        <LeadsHeader
          onRefresh={refresh}
          onCreateLead={() => {
            logger.info('Create Lead button clicked');
            setShowCreateDialog(true);
          }}
          loading={loading}
        />
      </AnimatedSection>

      <AnimatedSection delay={0.08}>
        <LeadsKPICards leads={leads} />
      </AnimatedSection>

      <AnimatedSection delay={0.12}>
        <LeadsFilters
          searchQuery={searchQuery}
          onSearchQueryChange={setSearchQuery}
          statusFilter={statusFilter}
          onStatusFilterChange={(value) => setStatusFilter(value as LeadStatus | 'all')}
          sourceFilter={sourceFilter}
          onSourceFilterChange={(value) => setSourceFilter(value as LeadSource | 'all')}
          priorityFilter={priorityFilter}
          onPriorityFilterChange={(value) => setPriorityFilter(value as LeadPriority | 'all')}
          onSearch={handleSearch}
          loading={loading}
        />
      </AnimatedSection>

      <AnimatedSection delay={0.16}>
        <LeadsTable
          leads={leads}
          loading={loading}
          totalCount={totalCount}
          onConvertLead={handleConvertLead}
          onDisqualifyLead={handleDisqualifyLead}
          onCreateQuote={handleCreateQuote}
          onEditLead={handleEditLead}
          onDeleteLead={handleDeleteLead}
        />
      </AnimatedSection>

      <CreateLeadDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSuccess={refresh}
      />

      {editDialog.lead && (
        <EditLeadDialog
          open={editDialog.open}
          onOpenChange={(open) => setEditDialog({ open, lead: null })}
          lead={editDialog.lead}
          onSuccess={handleEditSuccess}
        />
      )}

      <DeleteLeadDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ open, lead: null })}
        onConfirm={confirmDeleteLead}
        leadName={deleteDialog.lead?.fullName || deleteDialog.lead?.entityName || ''}
      />

      <DisqualifyLeadDialog
        open={disqualifyDialog.open}
        onOpenChange={(open) => setDisqualifyDialog({ open, lead: null })}
        onConfirm={confirmDisqualifyLead}
        leadName={disqualifyDialog.lead?.fullName || disqualifyDialog.lead?.entityName || ''}
      />

      {/* NEW: Quote Form Wizard for creating quotes from leads */}
      {quoteDialog.lead && (
        <QuoteFormWizard
          open={quoteDialog.open}
          onOpenChange={(open) => setQuoteDialog({ open, lead: null })}
          leadId={quoteDialog.lead.id}
          leadName={quoteDialog.lead.fullName || quoteDialog.lead.entityName}
          onSuccess={handleQuoteSuccess}
        />
      )}
    </AnimatedPage>
  );
}