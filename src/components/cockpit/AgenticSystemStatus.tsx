/**
 * ZADIA OS - Agentic System Status Widget
 * 
 * Widget que muestra el estado del sistema A-OS:
 * - Agentes activos
 * - Eventos recientes
 * - Reglas de propagación
 * 
 * Rule #2: ShadCN UI + Lucide Icons
 * Rule #5: Max 200 lines
 */

'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Bot, 
  Zap, 
  GitBranch,
  BrainCircuit,
  Workflow
} from 'lucide-react';
import { useZadiaAgentic } from '@/contexts/ZadiaAgenticContext';
import { cn } from '@/lib/utils';

export function AgenticSystemStatus() {
  const { agents, enableAgent, disableAgent, stats, propagationRules } = useZadiaAgentic();

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <BrainCircuit className="h-4 w-4 text-purple-500" />
          Sistema Agéntico
          <Badge variant="outline" className="ml-auto text-xs bg-purple-500/10 text-purple-500">
            A-OS
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Stats Summary */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="text-center p-2 bg-muted/50 rounded-lg">
            <Bot className="h-4 w-4 mx-auto mb-1 text-blue-500" />
            <div className="text-lg font-bold">{stats.activeAgents}</div>
            <div className="text-[10px] text-muted-foreground">Agentes</div>
          </div>
          <div className="text-center p-2 bg-muted/50 rounded-lg">
            <Zap className="h-4 w-4 mx-auto mb-1 text-yellow-500" />
            <div className="text-lg font-bold">{stats.totalEvents}</div>
            <div className="text-[10px] text-muted-foreground">Eventos</div>
          </div>
          <div className="text-center p-2 bg-muted/50 rounded-lg">
            <GitBranch className="h-4 w-4 mx-auto mb-1 text-green-500" />
            <div className="text-lg font-bold">{stats.propagationRules}</div>
            <div className="text-[10px] text-muted-foreground">Reglas</div>
          </div>
        </div>

        <Tabs defaultValue="agents" className="w-full">
          <TabsList className="grid w-full grid-cols-2 h-8">
            <TabsTrigger value="agents" className="text-xs">
              <Bot className="h-3 w-3 mr-1" />
              Agentes
            </TabsTrigger>
            <TabsTrigger value="rules" className="text-xs">
              <Workflow className="h-3 w-3 mr-1" />
              Reglas
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="agents" className="mt-2">
            <div className="space-y-2 max-h-[200px] overflow-y-auto">
              {agents.map(agent => (
                <div 
                  key={agent.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      "w-2 h-2 rounded-full",
                      agent.enabled ? "bg-green-500" : "bg-gray-400"
                    )} />
                    <span className="text-xs font-medium">{agent.name}</span>
                  </div>
                  <Switch
                    checked={agent.enabled}
                    onCheckedChange={(checked) => 
                      checked ? enableAgent(agent.id) : disableAgent(agent.id)
                    }
                    className="scale-75"
                  />
                </div>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="rules" className="mt-2">
            <div className="space-y-2 max-h-[200px] overflow-y-auto">
              {propagationRules.map(rule => (
                <div 
                  key={rule.id}
                  className="flex items-center gap-2 p-2 rounded-lg bg-muted/30"
                >
                  <GitBranch className="h-3 w-3 text-green-500" />
                  <span className="text-xs">{rule.name}</span>
                  {rule.enabled && (
                    <Badge variant="outline" className="ml-auto text-[10px] px-1 py-0">
                      Activo
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
