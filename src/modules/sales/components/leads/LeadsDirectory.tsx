/**
 * ZADIA OS - Leads Directory Page
 * 
 * Main page for managing leads pipeline
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { useLeads } from '../../hooks/use-leads';
import { useAuth } from '@/contexts/AuthContext';
import { CreateLeadDialog } from './CreateLeadDialogSimple';
import { LeadsHeader } from './LeadsHeader';
import { LeadsKPICards } from './LeadsKPICards';
import { LeadsFilters } from './LeadsFilters';
import { LeadsTable } from './LeadsTable';
import { Lead, LeadStatus, LeadSource, LeadPriority } from '../../types/sales.types';

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

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-destructive">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <LeadsHeader 
        onRefresh={refresh}
        onCreateLead={() => setShowCreateDialog(true)}
        loading={loading}
      />

      <LeadsKPICards leads={leads} />

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

      <LeadsTable
        leads={leads}
        loading={loading}
        totalCount={totalCount}
        onConvertLead={handleConvertLead}
        onDisqualifyLead={handleDisqualifyLead}
      />

      <CreateLeadDialog 
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSuccess={refresh}
      />
    </div>
  );
}