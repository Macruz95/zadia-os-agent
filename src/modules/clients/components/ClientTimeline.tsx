'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { Calendar, MessageSquare, Briefcase, FileText, Users } from 'lucide-react';
import { TimelineItem } from './timeline/TimelineItem';
import { Interaction, Transaction, Project, Quote, Meeting, Task } from '../types/clients.types';
import { processTimelineItems } from '../utils/timeline.utils';

interface ClientTimelineProps {
  interactions: Interaction[];
  transactions: Transaction[];
  projects: Project[];
  quotes: Quote[];
  meetings: Meeting[];
  tasks: Task[];
}

export const ClientTimeline = ({
  interactions,
  transactions,
  projects,
  quotes,
  meetings,
  tasks
}: ClientTimelineProps) => {
  const [activeTab, setActiveTab] = useState('timeline');

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const allTimelineItems: any[] = processTimelineItems(
    interactions,
    transactions,
    projects,
    quotes,
    meetings,
    tasks,
    10
  );

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg">Timeline de Actividades</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6 mb-6">
            <TabsTrigger value="timeline" className="text-sm">Todo</TabsTrigger>
            <TabsTrigger value="interactions" className="text-sm">Interacciones</TabsTrigger>
            <TabsTrigger value="projects" className="text-sm">Proyectos</TabsTrigger>
            <TabsTrigger value="transactions" className="text-sm">Transacciones</TabsTrigger>
            <TabsTrigger value="quotes" className="text-sm">Cotizaciones</TabsTrigger>
            <TabsTrigger value="meetings" className="text-sm">Reuniones</TabsTrigger>
          </TabsList>

          <div className="min-h-[400px] max-h-[600px] overflow-y-auto">
            <TabsContent value="timeline" className="mt-0">
              {allTimelineItems.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {allTimelineItems.map((item, index) => (
                    <TimelineItem key={`${item.type}-${item.id || index}`} item={item} type={item.type} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <div className="mb-4">
                    <Calendar className="w-12 h-12 mx-auto text-muted-foreground/50" />
                  </div>
                  <p className="text-lg">No hay actividad reciente</p>
                  <p className="text-sm">Las interacciones, proyectos y transacciones aparecerán aquí</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="interactions" className="mt-0">
              {interactions.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {interactions.map((interaction) => (
                    <TimelineItem key={interaction.id} item={interaction} type="interaction" />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <div className="mb-4">
                    <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground/50" />
                  </div>
                  <p className="text-lg">No hay interacciones registradas</p>
                  <p className="text-sm">Las llamadas, emails y reuniones aparecerán aquí</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="projects" className="mt-0">
              {projects.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {projects.map((project) => (
                    <TimelineItem key={project.id} item={project} type="project" />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <div className="mb-4">
                    <Briefcase className="w-12 h-12 mx-auto text-muted-foreground/50" />
                  </div>
                  <p className="text-lg">No hay proyectos activos</p>
                  <p className="text-sm">Los proyectos del cliente aparecerán aquí</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="transactions" className="mt-0">
              {transactions.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {transactions.map((transaction) => (
                    <TimelineItem key={transaction.id} item={transaction} type="transaction" />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <div className="mb-4">
                    <FileText className="w-12 h-12 mx-auto text-muted-foreground/50" />
                  </div>
                  <p className="text-lg">No hay transacciones registradas</p>
                  <p className="text-sm">Las facturas y pagos aparecerán aquí</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="quotes" className="mt-0">
              {quotes.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {quotes.map((quote) => (
                    <TimelineItem key={quote.id} item={quote} type="quote" />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <div className="mb-4">
                    <FileText className="w-12 h-12 mx-auto text-muted-foreground/50" />
                  </div>
                  <p className="text-lg">No hay cotizaciones registradas</p>
                  <p className="text-sm">Las cotizaciones del cliente aparecerán aquí</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="meetings" className="mt-0">
              {meetings.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {meetings.map((meeting) => (
                    <TimelineItem key={meeting.id} item={meeting} type="meeting" />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <div className="mb-4">
                    <Users className="w-12 h-12 mx-auto text-muted-foreground/50" />
                  </div>
                  <p className="text-lg">No hay reuniones programadas</p>
                  <p className="text-sm">Las reuniones del cliente aparecerán aquí</p>
                </div>
              )}
            </TabsContent>
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
};