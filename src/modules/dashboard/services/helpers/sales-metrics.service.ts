import { OpportunitiesService } from '@/modules/sales/services/opportunities.service';
import { LeadsService } from '@/modules/sales/services/leads.service';
import { logger } from '@/lib/logger';

export async function getSalesMetrics() {
    try {
        // 1. Active Leads
        const activeLeadsResult = await LeadsService.searchLeads({
            status: ['new', 'contacted', 'qualifying']
        }, 1000); // Get max to ensure accurate count if possible, though totalCount should be enough
        const activeLeads = activeLeadsResult.totalCount;

        // 2. Pipeline Value & Opportunities Count
        const allOpportunities = await OpportunitiesService.getOpportunities();
        const openOpportunities = allOpportunities.filter(opp => opp.status === 'open');

        const pipelineValue = openOpportunities.reduce((sum, opp) => sum + (opp.estimatedValue || 0), 0);
        const opportunitiesCount = openOpportunities.length;

        // 3. Conversion Rate
        const closedWon = allOpportunities.filter(opp => opp.status === 'won').length;
        const closedLost = allOpportunities.filter(opp => opp.status === 'lost').length;
        const totalClosed = closedWon + closedLost;

        const conversionRate = totalClosed === 0 ? 0 : (closedWon / totalClosed) * 100;

        return {
            activeLeads,
            pipelineValue,
            opportunitiesCount,
            conversionRate
        };
    } catch (error) {
        logger.error('Error calculating sales metrics', error as Error);
        return {
            activeLeads: 0,
            pipelineValue: 0,
            opportunitiesCount: 0,
            conversionRate: 0
        };
    }
}
