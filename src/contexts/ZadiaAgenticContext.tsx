/**
 * ZADIA OS - Agentic Provider
 * 
 * Provider que expone el sistema de eventos y agentes a toda la aplicación
 * Permite que cualquier componente acceda al Event Bus y al estado del sistema
 * 
 * Rule #1: TypeScript strict
 * Rule #2: React context pattern
 */

'use client';

import { createContext, useContext, useCallback, useState, useEffect, ReactNode } from 'react';
import { EventBus, ZadiaEvent, ZadiaEventType, AgentOrchestrator, DTOPropagationService } from '@/lib/events';

interface AgentStatus {
  id: string;
  name: string;
  enabled: boolean;
}

interface SystemStats {
  totalEvents: number;
  activeAgents: number;
  propagationRules: number;
}

interface ZadiaAgenticContextType {
  // Event System
  emit: <T = unknown>(type: ZadiaEventType, data: T) => Promise<void>;
  recentEvents: ZadiaEvent[];
  
  // Agent System
  agents: AgentStatus[];
  enableAgent: (agentId: string) => void;
  disableAgent: (agentId: string) => void;
  
  // System Stats
  stats: SystemStats;
  
  // Propagation
  propagationRules: Array<{ id: string; name: string; enabled: boolean }>;
}

const ZadiaAgenticContext = createContext<ZadiaAgenticContextType | null>(null);

export function ZadiaAgenticProvider({ children }: { children: ReactNode }) {
  const [recentEvents, setRecentEvents] = useState<ZadiaEvent[]>([]);
  const [agents, setAgents] = useState<AgentStatus[]>([]);
  const [stats, setStats] = useState<SystemStats>({
    totalEvents: 0,
    activeAgents: 0,
    propagationRules: 0
  });

  // Initialize and subscribe
  useEffect(() => {
    // Load initial state
    const agentDefs = AgentOrchestrator.getAgents();
    setAgents(agentDefs.map(a => ({ id: a.id, name: a.name, enabled: a.enabled })));
    
    const rules = DTOPropagationService.getRules();
    
    setStats({
      totalEvents: EventBus.getRecentEvents().length,
      activeAgents: agentDefs.filter(a => a.enabled).length,
      propagationRules: rules.length
    });

    // Subscribe to all events to update state
    const unsubscribe = EventBus.subscribe('*', () => {
      setRecentEvents(EventBus.getRecentEvents(20));
      setStats(prev => ({
        ...prev,
        totalEvents: prev.totalEvents + 1
      }));
    });

    return () => unsubscribe();
  }, []);

  const emit = useCallback(async <T = unknown>(
    type: ZadiaEventType,
    data: T
  ) => {
    await EventBus.emit(type, data, { source: 'context-provider' });
  }, []);

  const enableAgent = useCallback((agentId: string) => {
    AgentOrchestrator.enableAgent(agentId);
    setAgents(prev => prev.map(a => 
      a.id === agentId ? { ...a, enabled: true } : a
    ));
    setStats(prev => ({
      ...prev,
      activeAgents: prev.activeAgents + 1
    }));
  }, []);

  const disableAgent = useCallback((agentId: string) => {
    AgentOrchestrator.disableAgent(agentId);
    setAgents(prev => prev.map(a => 
      a.id === agentId ? { ...a, enabled: false } : a
    ));
    setStats(prev => ({
      ...prev,
      activeAgents: Math.max(0, prev.activeAgents - 1)
    }));
  }, []);

  const propagationRules = DTOPropagationService.getRules().map(r => ({
    id: r.id,
    name: r.name,
    enabled: r.enabled
  }));

  return (
    <ZadiaAgenticContext.Provider 
      value={{
        emit,
        recentEvents,
        agents,
        enableAgent,
        disableAgent,
        stats,
        propagationRules
      }}
    >
      {children}
    </ZadiaAgenticContext.Provider>
  );
}

export function useZadiaAgentic() {
  const context = useContext(ZadiaAgenticContext);
  if (!context) {
    throw new Error('useZadiaAgentic must be used within ZadiaAgenticProvider');
  }
  return context;
}
