/**
 * ZADIA OS - Sales Module Services
 * 
 * Main entry point for all sales-related services
 * Following ZADIA OS Rule 4: Modular architecture with clear responsibilities
 */

// Lead Services (split into specialized services for better maintainability)
export * from './leads.service';
export * from './leads-crud.service';
export * from './leads-actions.service';

// Other Sales Services
export * from './opportunities.service';
export * from './quotes.service';
export * from './analytics.service';
export * from './users-targets.service';

// Specialized analytics services
export * from './sales-metrics-calculator.service';
export * from './sales-pipeline-analytics.service';
export * from './sales-lead-source-analytics.service';
export * from './sales-performance-analytics.service';