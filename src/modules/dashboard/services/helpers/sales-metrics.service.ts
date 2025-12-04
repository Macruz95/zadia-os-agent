import { OpportunitiesService } from '@/modules/sales/services/opportunities.service';
import { LeadsService } from '@/modules/sales/services/leads.service';
import { logger } from '@/lib/logger';

export async function getSalesMetrics(tenantId: string) {
    try {
        if (!tenantId) {
            return {
                totalLeads: 0,
                totalOpportunities: 0,
                conversionRate: 0,
                pipelineValue: 0,
                leadsGrowth: 0,
                opportunitiesGrowth: 0
            };
        }

        // 1. Active Leads
        const activeLeadsResult = await LeadsService.searchLeads({
            status: ['new', 'contacted', 'qualifying'],
            tenantId
        }, 1000);
        const activeLeads = activeLeadsResult.totalCount;

        // 2. Pipeline Value & Opportunities Count
        const allOpportunities = await OpportunitiesService.getOpportunities(tenantId);
        const openOpportunities = allOpportunities.filter(opp => opp.status === 'open');

        const pipelineValue = openOpportunities.reduce((sum, opp) => sum + (opp.estimatedValue || 0), 0);
        const opportunitiesCount = openOpportunities.length;

        // 3. Conversion Rate
        const closedWon = allOpportunities.filter(opp => opp.status === 'won').length;
        const closedLost = allOpportunities.filter(opp => opp.status === 'lost').length;
        const totalClosed = closedWon + closedLost;

        const conversionRate = totalClosed === 0 ? 0 : (closedWon / totalClosed) * 100;

        return {
            totalLeads: activeLeads,
            totalOpportunities: opportunitiesCount,
            conversionRate,
            pipelineValue,
            leadsGrowth: 0,
            opportunitiesGrowth: 0
        };
    } catch (error) {
        logger.error('Error calculating sales metrics', error as Error);
        return {
            totalLeads: 0,
            totalOpportunities: 0,
            conversionRate: 0,
            pipelineValue: 0,
            leadsGrowth: 0,
            opportunitiesGrowth: 0
        };
    }
}
