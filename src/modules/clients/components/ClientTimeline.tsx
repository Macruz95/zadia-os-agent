'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { Button } from '../../../components/ui/button';
import { Calendar, MessageSquare, Briefcase, FileText, Users, ChevronDown } from 'lucide-react';
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
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('timeline');
  const [visibleItems, setVisibleItems] = useState(10);

  const allTimelineItems = processTimelineItems(
    interactions,
    transactions,
    projects,
    quotes,
    meetings,
    tasks,
    visibleItems
  );

  const handleItemClick = (item: Interaction | Transaction | Project | Quote | Meeting | Task, type: string) => {
    const itemWithId = item as { id: string };
    switch (type) {
      case 'interaction':
        // Stay on current page, could scroll to interaction in future
        break;
      case 'transaction':
        router.push(`/finance/invoices/${itemWithId.id}`);
        break;
      case 'project':
        router.push(`/projects/${itemWithId.id}`);
        break;
      case 'quote':
        router.push(`/quotes/${itemWithId.id}`);
        break;
      case 'meeting':
        router.push(`/calendar?meetingId=${itemWithId.id}`);
        break;
      case 'task':
        router.push(`/tasks/${itemWithId.id}`);
        break;
    }
  };

  const loadMore = () => {
    setVisibleItems(prev => prev + 10);
  };

  const hasMore = allTimelineItems.length >= visibleItems;

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
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {allTimelineItems.map((item, index) => (
                      <div
                        key={`${item.type}-${item.id || index}`}
                        onClick={() => handleItemClick(item as unknown as Interaction | Transaction | Project | Quote | Meeting | Task, item.type)}
                        className="cursor-pointer transition-transform hover:scale-[1.02]"
                      >
                        <TimelineItem item={item as unknown as Interaction | Transaction | Project | Quote | Meeting | Task} type={item.type} />
                      </div>
                    ))}
                  </div>
                  {hasMore && (
                    <div className="text-center mt-6">
                      <Button variant="outline" onClick={loadMore}>
                        <ChevronDown className="w-4 h-4 mr-2" />
                        Cargar más actividades
                      </Button>
                    </div>
                  )}
                </>
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
                  {interactions.slice(0, visibleItems).map((interaction) => (
                    <div
                      key={interaction.id}
                      onClick={() => handleItemClick(interaction, 'interaction')}
                      className="cursor-pointer transition-transform hover:scale-[1.02]"
                    >
                      <TimelineItem item={interaction} type="interaction" />
                    </div>
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
                  {projects.slice(0, visibleItems).map((project) => (
                    <div
                      key={project.id}
                      onClick={() => handleItemClick(project, 'project')}
                      className="cursor-pointer transition-transform hover:scale-[1.02]"
                    >
                      <TimelineItem item={project} type="project" />
                    </div>
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
                  {transactions.slice(0, visibleItems).map((transaction) => (
                    <div
                      key={transaction.id}
                      onClick={() => handleItemClick(transaction, 'transaction')}
                      className="cursor-pointer transition-transform hover:scale-[1.02]"
                    >
                      <TimelineItem item={transaction} type="transaction" />
                    </div>
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
                  {quotes.slice(0, visibleItems).map((quote) => (
                    <div
                      key={quote.id}
                      onClick={() => handleItemClick(quote, 'quote')}
                      className="cursor-pointer transition-transform hover:scale-[1.02]"
                    >
                      <TimelineItem item={quote} type="quote" />
                    </div>
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
                  {meetings.slice(0, visibleItems).map((meeting) => (
                    <div
                      key={meeting.id}
                      onClick={() => handleItemClick(meeting, 'meeting')}
                      className="cursor-pointer transition-transform hover:scale-[1.02]"
                    >
                      <TimelineItem item={meeting} type="meeting" />
                    </div>
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