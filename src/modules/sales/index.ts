/**
 * ZADIA OS - Sales Module
 * 
 * Complete sales management module with leads, opportunities, quotes, and projects
 */

// Types
export * from './types/sales.types';

// Validations
export {
  createLeadSchema,
  LeadFormSchema,
  LeadFiltersSchema,
  OpportunitySchema,
  OpportunityFormSchema,
  OpportunityFiltersSchema,
  QuoteSchema,
  QuoteFormSchema,
  QuoteFiltersSchema,
  LeadConversionSchema,
} from './validations/sales.schema';

// Services
export { LeadsService } from './services/leads.service';
export { OpportunitiesService } from './services/opportunities.service';
export { QuotesService } from './services/quotes.service';
export { SalesAnalyticsService as AnalyticsService } from './services/analytics.service';
export { UsersTargetsService } from './services/users-targets.service';

// Hooks
export * from './hooks';

// Utils
export * from './utils';

// Components
export { SalesNavigation } from './components/SalesNavigation';
export { LeadsDirectory } from './components/leads/LeadsDirectory';
export { CreateLeadDialog } from './components/leads/CreateLeadDialog';
export { OpportunitiesKanban } from './components/opportunities/OpportunitiesKanban';
export { QuotesDirectory } from './components/quotes/QuotesDirectory';
export { ProjectsDirectory } from './components/projects/ProjectsDirectory';
export { SalesAnalytics } from './components/analytics/SalesAnalytics';
export { ExecutiveDashboard } from './components/dashboard/ExecutiveDashboard';