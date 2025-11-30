/**
 * ZADIA OS - AI Module Exports
 * 
 * Central exports for AI functionality
 */

// Core Router
export { AIRouter, MODEL_REGISTRY } from './ai-router';
export type { 
  TaskType, 
  ModelSelection, 
  AIRouterConfig, 
  AIProvider, 
  ModelConfig, 
  RoutingDecision 
} from './ai-router';

// Learning Memory
export { LearningMemoryService } from './learning-memory';
export type { 
  UserPreference, 
  LearnedPattern, 
  SemanticMemory, 
  LearningContext 
} from './learning-memory';

// Legacy exports (for backward compatibility)
export { OpenRouterService } from './openrouter.service';
export { 
  getModelForUseCase, 
  getModelById, 
  getAllModels,
  FREE_MODELS,
  PHASE_4_MODELS 
} from './models.config';
export type { AIModelType, AIModelConfig } from './models.config';
