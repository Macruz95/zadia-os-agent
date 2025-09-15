'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
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

  // TODO: Crear tipo union apropiado para elementos del timeline
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
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Timeline</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="timeline">Todo</TabsTrigger>
            <TabsTrigger value="interactions">Interacciones</TabsTrigger>
            <TabsTrigger value="projects">Proyectos</TabsTrigger>
            <TabsTrigger value="transactions">Transacciones</TabsTrigger>
            <TabsTrigger value="quotes">Cotizaciones</TabsTrigger>
            <TabsTrigger value="meetings">Reuniones</TabsTrigger>
          </TabsList>

          <TabsContent value="timeline" className="space-y-4 mt-4">
            {allTimelineItems.map((item, index) => (
              <TimelineItem key={`${item.type}-${item.id || index}`} item={item} type={item.type} />
            ))}
          </TabsContent>

          <TabsContent value="interactions" className="space-y-4 mt-4">
            {interactions.map((interaction) => (
              <TimelineItem key={interaction.id} item={interaction} type="interaction" />
            ))}
          </TabsContent>

          <TabsContent value="projects" className="space-y-4 mt-4">
            {projects.map((project) => (
              <TimelineItem key={project.id} item={project} type="project" />
            ))}
          </TabsContent>

          <TabsContent value="transactions" className="space-y-4 mt-4">
            {transactions.map((transaction) => (
              <TimelineItem key={transaction.id} item={transaction} type="transaction" />
            ))}
          </TabsContent>

          <TabsContent value="quotes" className="space-y-4 mt-4">
            {quotes.map((quote) => (
              <TimelineItem key={quote.id} item={quote} type="quote" />
            ))}
          </TabsContent>

          <TabsContent value="meetings" className="space-y-4 mt-4">
            {meetings.map((meeting) => (
              <TimelineItem key={meeting.id} item={meeting} type="meeting" />
            ))}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};