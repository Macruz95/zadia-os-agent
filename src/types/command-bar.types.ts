/**
 * ZADIA OS - Command Bar Types
 * 
 * Types for universal command palette (Cmd+K)
 * Rule #3: Zod validation
 */

import { z } from 'zod';

/**
 * Search result types
 */
export const SearchResultTypeSchema = z.enum([
  'client',
  'project',
  'invoice',
  'quote',
  'opportunity',
  'lead',
  'task',
  'contact',
  'document',
  'expense',
  'order',
]);

export type SearchResultType = z.infer<typeof SearchResultTypeSchema>;

/**
 * Individual search result
 */
export const SearchResultSchema = z.object({
  id: z.string(),
  type: SearchResultTypeSchema,
  title: z.string(),
  subtitle: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
  url: z.string().optional(),
  icon: z.string().optional(),
});

export type SearchResult = z.infer<typeof SearchResultSchema>;

/**
 * Categorized search results
 */
export const SearchResultsSchema = z.object({
  clients: z.array(SearchResultSchema),
  projects: z.array(SearchResultSchema),
  invoices: z.array(SearchResultSchema),
  quotes: z.array(SearchResultSchema),
  opportunities: z.array(SearchResultSchema),
  leads: z.array(SearchResultSchema),
  tasks: z.array(SearchResultSchema),
  contacts: z.array(SearchResultSchema),
  documents: z.array(SearchResultSchema),
  expenses: z.array(SearchResultSchema),
  orders: z.array(SearchResultSchema),
});

export type SearchResults = z.infer<typeof SearchResultsSchema>;

/**
 * Command types (for creation/updates)
 */
export const CommandTypeSchema = z.enum([
  'create-task',
  'create-expense',
  'create-meeting',
  'create-project',
  'create-invoice',
  'update-status',
]);

export type CommandType = z.infer<typeof CommandTypeSchema>;

/**
 * Command action result
 */
export const CommandActionResultSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.record(z.string(), z.unknown()).optional(),
  redirectUrl: z.string().optional(),
});

export type CommandActionResult = z.infer<typeof CommandActionResultSchema>;

/**
 * AI Question response types
 */
export const QuestionResponseTypeSchema = z.enum([
  'text',       // Simple text answer
  'number',     // Numeric value
  'list',       // List of items
  'chart',      // Chart data
  'table',      // Tabular data
]);

export type QuestionResponseType = z.infer<typeof QuestionResponseTypeSchema>;

/**
 * AI Question response
 */
export const QuestionResponseSchema = z.object({
  type: QuestionResponseTypeSchema,
  answer: z.string(),
  data: z.unknown().optional(),
  confidence: z.number().min(0).max(1).optional(),
});

export type QuestionResponse = z.infer<typeof QuestionResponseSchema>;

/**
 * Command bar mode
 */
export type CommandBarMode = 'search' | 'command' | 'question';

/**
 * Detect mode from input
 */
export function detectCommandBarMode(input: string): CommandBarMode {
  if (input.startsWith('+') || input.startsWith('@')) {
    return 'command';
  }
  if (input.includes('?') || input.toLowerCase().startsWith('qué') || 
      input.toLowerCase().startsWith('cuál') || input.toLowerCase().startsWith('cómo') ||
      input.toLowerCase().startsWith('muestra') || input.toLowerCase().startsWith('proyecta')) {
    return 'question';
  }
  return 'search';
}
