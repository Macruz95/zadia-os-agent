/**
 * ZADIA OS - AI Assistant Types
 * 
 * Types for the advanced AI assistant module
 */

export type MessageRole = 'user' | 'assistant' | 'system' | 'tool';

export type MessageStatus = 'pending' | 'streaming' | 'complete' | 'error';

export type AttachmentType = 'image' | 'file' | 'audio' | 'code';

export interface Attachment {
  id: string;
  type: AttachmentType;
  name: string;
  url?: string;
  base64?: string;
  mimeType: string;
  size: number;
}

export interface ToolCall {
  id: string;
  name: string;
  arguments: Record<string, unknown>;
  status: 'pending' | 'running' | 'success' | 'error';
  result?: unknown;
  error?: string;
}

export interface AIMessage {
  id: string;
  role: MessageRole;
  content: string;
  status: MessageStatus;
  timestamp: Date;
  attachments?: Attachment[];
  toolCalls?: ToolCall[];
  metadata?: {
    model?: string;
    tokensUsed?: number;
    processingTime?: number;
    webSearchUsed?: boolean;
    ragUsed?: boolean;
  };
}

export interface Conversation {
  id: string;
  userId: string;
  title: string;
  messages: AIMessage[];
  model: string;
  createdAt: Date;
  updatedAt: Date;
  archived: boolean;
  tags: string[];
  settings?: ConversationSettings;
}

export interface ConversationSettings {
  systemPrompt?: string;
  temperature?: number;
  enableWebSearch?: boolean;
  enableRAG?: boolean;
  enableTools?: boolean;
  maxTokens?: number;
}

export interface AICapability {
  id: string;
  name: string;
  description: string;
  icon: string;
  enabled: boolean;
  requiresApiKey?: string;
}

export interface AIModel {
  id: string;
  name: string;
  provider: string;
  description: string;
  capabilities: string[];
  contextWindow: number;
  isFree: boolean;
  speed: 'fast' | 'medium' | 'slow';
  quality: 'basic' | 'good' | 'excellent';
}

export interface WebSearchResult {
  title: string;
  url: string;
  snippet: string;
  publishedDate?: string;
}

export interface RAGDocument {
  id: string;
  title: string;
  content: string;
  source: string;
  relevanceScore: number;
}

// Agent Tools
export type AgentToolName = 
  | 'create_task'
  | 'create_project'
  | 'create_expense'
  | 'schedule_meeting'
  | 'send_notification'
  | 'create_workflow'
  | 'search_web'
  | 'analyze_data'
  | 'generate_report'
  | 'send_email'
  | 'create_quote'
  | 'update_inventory'
  | 'check_system_status';

export interface AgentToolDefinition {
  name: AgentToolName;
  description: string;
  parameters: {
    type: 'object';
    properties: Record<string, {
      type: string;
      description: string;
      enum?: string[];
      required?: boolean;
    }>;
    required: string[];
  };
}

export interface AgentToolResult {
  success: boolean;
  message: string;
  data?: unknown;
  redirectUrl?: string;
}
