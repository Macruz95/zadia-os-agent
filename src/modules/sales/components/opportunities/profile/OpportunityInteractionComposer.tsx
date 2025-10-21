/**
 * ZADIA OS - Opportunity Interaction Composer
 * 
 * Tabbed interface for creating different types of interactions
 * REGLA 2: ShadCN UI + Lucide icons
 * REGLA 5: <200 líneas
 * 
 * Refactored: Logic extracted to useInteractionComposer hook,
 * Forms extracted to separate components
 */

'use client';

import { FileText, Phone, Calendar, Mail } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useInteractionComposer } from '@/modules/sales/hooks/useInteractionComposer';
import { NoteForm } from '../interactions/NoteForm';
import { CallForm } from '../interactions/CallForm';
import { MeetingForm } from '../interactions/MeetingForm';
import { EmailForm } from '../interactions/EmailForm';

interface OpportunityInteractionComposerProps {
  opportunityId: string;
  onInteractionCreated?: () => void;
}

export function OpportunityInteractionComposer({
  opportunityId,
  onInteractionCreated,
}: OpportunityInteractionComposerProps) {
  const {
    activeTab,
    setActiveTab,
    isSubmitting,
    noteForm,
    callForm,
    meetingForm,
    emailForm,
    handleSubmit,
  } = useInteractionComposer({
    opportunityId,
    onInteractionCreated,
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Nueva Interacción</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="note" className="gap-2">
              <FileText className="h-4 w-4" />
              Nota
            </TabsTrigger>
            <TabsTrigger value="call" className="gap-2">
              <Phone className="h-4 w-4" />
              Llamada
            </TabsTrigger>
            <TabsTrigger value="meeting" className="gap-2">
              <Calendar className="h-4 w-4" />
              Reunión
            </TabsTrigger>
            <TabsTrigger value="email" className="gap-2">
              <Mail className="h-4 w-4" />
              Email
            </TabsTrigger>
          </TabsList>

          <TabsContent value="note">
            <NoteForm
              form={noteForm}
              isSubmitting={isSubmitting}
              onSubmit={handleSubmit}
            />
          </TabsContent>

          <TabsContent value="call">
            <CallForm
              form={callForm}
              isSubmitting={isSubmitting}
              onSubmit={handleSubmit}
            />
          </TabsContent>

          <TabsContent value="meeting">
            <MeetingForm
              form={meetingForm}
              isSubmitting={isSubmitting}
              onSubmit={handleSubmit}
            />
          </TabsContent>

          <TabsContent value="email">
            <EmailForm
              form={emailForm}
              isSubmitting={isSubmitting}
              onSubmit={handleSubmit}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
