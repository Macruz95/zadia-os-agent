/**
 * ZADIA OS - System Initializer
 * 
 * Componente que inicializa el Event Bus, Propagation Service y Agent Orchestrator
 * Se monta una sola vez al cargar la aplicación
 * 
 * Rule #5: Single responsibility
 */

'use client';

import { useEffect, useRef } from 'react';
import { logger } from '@/lib/logger';

// Import to initialize singletons
import { EventBus } from '@/lib/events/event-bus';
import { DTOPropagationService } from '@/lib/events/dto-propagation.service';
import { AgentOrchestrator } from '@/lib/events/agent-orchestrator';

interface ZadiaSystemInitializerProps {
  children: React.ReactNode;
}

export function ZadiaSystemInitializer({ children }: ZadiaSystemInitializerProps) {
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    // Log system startup
    logger.info('🚀 ZADIA A-OS System Starting...', { component: 'SystemInitializer' });

    // Initialize services (singletons auto-initialize on import)
    const subscriptionCount = EventBus.getSubscriptionCount();
    const agentCount = AgentOrchestrator.getAgents().length;
    const ruleCount = DTOPropagationService.getRules().length;

    logger.info(`✅ Event Bus: ${subscriptionCount} subscriptions`, { component: 'SystemInitializer' });
    logger.info(`✅ Agent Orchestrator: ${agentCount} agents ready`, { component: 'SystemInitializer' });
    logger.info(`✅ DTO Propagation: ${ruleCount} rules active`, { component: 'SystemInitializer' });

    // Emit system startup event
    EventBus.emit('system:startup', {
      timestamp: new Date().toISOString(),
      agents: agentCount,
      propagationRules: ruleCount
    }, { source: 'system-initializer' });

    logger.info('🎯 ZADIA A-OS System Ready!', { component: 'SystemInitializer' });
  }, []);

  return <>{children}</>;
}
