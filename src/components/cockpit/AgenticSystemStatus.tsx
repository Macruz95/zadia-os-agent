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
    <Card className="bg-[#161b22] border-gray-800/50">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2 text-gray-200">
            <BrainCircuit className="h-4 w-4 text-purple-400" />
            Sistema Agéntico
          </CardTitle>
          <Badge variant="outline" className="text-xs bg-purple-500/10 text-purple-400 border-purple-500/30">
            A-OS
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Stats Summary - Lado izquierdo */}
          <div className="flex gap-4 lg:col-span-1">
            <div className="text-center p-3 bg-[#0d1117] rounded-lg border border-gray-800/50 flex-1">
              <Bot className="h-4 w-4 mx-auto mb-1 text-blue-400" />
              <div className="text-xl font-bold text-white">{stats.activeAgents}</div>
              <div className="text-[10px] text-gray-500">Agentes</div>
            </div>
            <div className="text-center p-3 bg-[#0d1117] rounded-lg border border-gray-800/50 flex-1">
              <Zap className="h-4 w-4 mx-auto mb-1 text-yellow-400" />
              <div className="text-xl font-bold text-white">{stats.totalEvents}</div>
              <div className="text-[10px] text-gray-500">Eventos</div>
            </div>
            <div className="text-center p-3 bg-[#0d1117] rounded-lg border border-gray-800/50 flex-1">
              <GitBranch className="h-4 w-4 mx-auto mb-1 text-green-400" />
              <div className="text-xl font-bold text-white">{stats.propagationRules}</div>
              <div className="text-[10px] text-gray-500">Reglas</div>
            </div>
          </div>

          {/* Tabs - Lado derecho */}
          <div className="lg:col-span-3">
            <Tabs defaultValue="agents" className="w-full">
              <TabsList className="grid w-full grid-cols-2 h-8 bg-[#0d1117] border border-gray-800/50">
                <TabsTrigger value="agents" className="text-xs data-[state=active]:bg-[#21262d] data-[state=active]:text-white">
                  <Bot className="h-3 w-3 mr-1" />
                  Agentes
                </TabsTrigger>
                <TabsTrigger value="rules" className="text-xs data-[state=active]:bg-[#21262d] data-[state=active]:text-white">
                  <Workflow className="h-3 w-3 mr-1" />
                  Reglas
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="agents" className="mt-2">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
                  {agents.map(agent => (
                    <div 
                      key={agent.id}
                      className="flex items-center justify-between p-2 rounded-lg bg-[#0d1117] border border-gray-800/50 hover:border-gray-700/50 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          "w-2 h-2 rounded-full",
                          agent.enabled ? "bg-green-500" : "bg-gray-600"
                        )} />
                        <span className="text-xs font-medium text-gray-300 truncate">{agent.name}</span>
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
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {propagationRules.map(rule => (
                    <div 
                      key={rule.id}
                      className="flex items-center gap-2 p-2 rounded-lg bg-[#0d1117] border border-gray-800/50"
                    >
                      <GitBranch className="h-3 w-3 text-green-400 flex-shrink-0" />
                      <span className="text-xs text-gray-300 truncate">{rule.name}</span>
                      {rule.enabled && (
                        <Badge variant="outline" className="ml-auto text-[10px] px-1 py-0 border-green-500/30 text-green-400">
                          Activo
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
