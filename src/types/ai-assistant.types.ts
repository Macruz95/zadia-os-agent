/**
 * ZADIA OS - AI Assistant Types
 * 
 * Types for conversational AI assistant
 * Rule #3: Zod validation
 * Rule #5: <200 lines
 */

import { z } from 'zod';
import { Timestamp } from 'firebase/firestore';

/**
 * Message role
 */
export const messageRoleSchema = z.enum(['system', 'user', 'assistant']);
export type MessageRole = z.infer<typeof messageRoleSchema>;

/**
 * Single message in conversation
 */
export const messageSchema = z.object({
  id: z.string(),
  role: messageRoleSchema,
  content: z.string(),
  timestamp: z.date(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export type Message = z.infer<typeof messageSchema>;

/**
 * Conversation thread
 */
export const conversationSchema = z.object({
  id: z.string(),
  userId: z.string(),
  title: z.string(),
  messages: z.array(messageSchema),
  createdAt: z.date(),
  updatedAt: z.date(),
  archived: z.boolean().default(false),
  tags: z.array(z.string()).default([]),
});

export type Conversation = z.infer<typeof conversationSchema>;

/**
 * System context for AI
 */
export interface SystemContext {
  // User info
  userId: string;
  userName?: string;
  userRole?: string;
  
  // Business metrics - Clients & Sales
  totalClients?: number;
  activeProjects?: number;
  monthlyRevenue?: number;
  activeLeads?: number;
  activeOpportunities?: number;
  activeQuotes?: number;
  
  // Orders & Production
  totalOrders?: number;
  pendingOrders?: number;
  activeWorkOrders?: number;
  
  // Inventory
  totalRawMaterials?: number;
  totalFinishedProducts?: number;
  lowStockItems?: number;
  
  // Recent activity
  recentClients?: Array<{ id: string; name: string; }>;
  recentProjects?: Array<{ id: string; name: string; status: string; }>;
  recentInvoices?: Array<{ id: string; total: number; status: string; }>;
  
  // System state
  timestamp: Date;
  timezone?: string;
}

/**
 * AI Request
 */
export const aiRequestSchema = z.object({
  conversationId: z.string().optional(),
  message: z.string().min(1).max(2000),
  includeSystemContext: z.boolean().default(true),
  temperature: z.number().min(0).max(2).default(0.7),
});

export type AIRequest = z.infer<typeof aiRequestSchema>;

/**
 * AI Response
 */
export const aiResponseSchema = z.object({
  conversationId: z.string(),
  messageId: z.string(),
  content: z.string(),
  tokensUsed: z.number().optional(),
  model: z.string().optional(),
  timestamp: z.date(),
});

export type AIResponse = z.infer<typeof aiResponseSchema>;

/**
 * Conversation summary for list
 */
export interface ConversationSummary {
  id: string;
  title: string;
  lastMessage: string;
  messageCount: number;
  updatedAt: Date;
  archived: boolean;
}

/**
 * Firestore conversation document
 */
export interface ConversationDoc {
  userId: string;
  title: string;
  messages: Array<{
    id: string;
    role: MessageRole;
    content: string;
    timestamp: Timestamp;
    metadata?: Record<string, unknown>;
  }>;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  archived: boolean;
  tags: string[];
}
