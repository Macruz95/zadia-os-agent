/**
 * ZADIA OS - Opportunities Kanban Board
 * 
 * Visual pipeline management for sales opportunities
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { Opportunity, OpportunityStage, OpportunityStatus, OpportunityPriority } from '../../types/sales.types';
import { OpportunitiesService } from '../../services/opportunities.service';

import { KanbanHeader } from './KanbanHeader';
import { KanbanKPIs } from './KanbanKPIs';
import { KanbanColumn } from './KanbanColumn';
import { STAGE_CONFIG } from './KanbanConfig';

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
      const data = await OpportunitiesService.getOpportunities();
      setOpportunities(data);
      setLoading(false);
    } catch (error) {
      console.error('Error loading opportunities', error);
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
            ? { ...opp, stage: newStage }
            : opp
        )
      );
      toast.success('Etapa actualizada correctamente');
    } catch (error) {
      console.error('Error updating opportunity stage', error);
      toast.error('Error al actualizar la etapa');
    }
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
      <KanbanHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusFilterChange={(value) => setStatusFilter(value as OpportunityStatus | 'all')}
        priorityFilter={priorityFilter}
        onPriorityFilterChange={(value) => setPriorityFilter(value as OpportunityPriority | 'all')}
      />

      <KanbanKPIs
        totalValue={totalValue}
        avgDealSize={avgDealSize}
        weightedValue={weightedValue}
        highPriorityCount={highPriorityCount}
      />

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 min-h-[600px]">
        {(Object.keys(STAGE_CONFIG) as OpportunityStage[]).map((stage) => (
          <KanbanColumn
            key={stage}
            stage={stage}
            opportunities={opportunitiesByStage[stage] || []}
            onStageChange={handleStageChange}
            onCardClick={(id) => router.push(`/sales/opportunities/${id}`)}
          />
        ))}
      </div>
    </div>
  );
}