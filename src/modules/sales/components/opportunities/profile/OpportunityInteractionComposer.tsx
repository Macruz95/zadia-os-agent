/**
 * ZADIA OS - Opportunity Interaction Composer
 * 
 * Tabbed interface for creating different types of interactions (notes, calls, meetings, emails)
 * 
 * @component
 */

'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, FileText, Phone, Calendar, Mail } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { logger } from '@/lib/logger';
import { OpportunityInteractionsService } from '@/modules/sales/services/opportunity-interactions.service';
import {
  noteInteractionSchema,
  callInteractionSchema,
  meetingInteractionSchema,
  emailInteractionSchema,
  type NoteInteractionInput,
  type CallInteractionInput,
  type MeetingInteractionInput,
  type EmailInteractionInput,
} from '@/modules/sales/validations/opportunity-profile.schema';

interface OpportunityInteractionComposerProps {
  opportunityId: string;
  onInteractionCreated?: () => void;
}

export function OpportunityInteractionComposer({
  opportunityId,
  onInteractionCreated,
}: OpportunityInteractionComposerProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'note' | 'call' | 'meeting' | 'email'>('note');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Note Form
  const noteForm = useForm<NoteInteractionInput>({
    resolver: zodResolver(noteInteractionSchema),
    defaultValues: { summary: '', details: '' },
  });

  // Call Form
  const callForm = useForm<CallInteractionInput>({
    resolver: zodResolver(callInteractionSchema),
    defaultValues: { summary: '', details: '', duration: undefined },
  });

  // Meeting Form
  const meetingForm = useForm<MeetingInteractionInput>({
    resolver: zodResolver(meetingInteractionSchema),
    defaultValues: { summary: '', details: '', location: '', attendees: [] },
  });

  // Email Form
  const emailForm = useForm<EmailInteractionInput>({
    resolver: zodResolver(emailInteractionSchema),
    defaultValues: { summary: '', details: '', recipients: [], attachments: [] },
  });

  const handleSubmit = async (
    data: NoteInteractionInput | CallInteractionInput | MeetingInteractionInput | EmailInteractionInput
  ) => {
    if (!user?.uid) {
      toast.error('No autenticado');
      return;
    }

    try {
      setIsSubmitting(true);

      await OpportunityInteractionsService.createInteraction({
        opportunityId,
        type: activeTab,
        summary: data.summary,
        details: data.details || '',
        performedBy: user.uid,
      });

      toast.success(`${activeTab === 'note' ? 'Nota' : activeTab === 'call' ? 'Llamada' : activeTab === 'meeting' ? 'Reunión' : 'Email'} registrado correctamente`);

      // Reset form
      if (activeTab === 'note') noteForm.reset();
      else if (activeTab === 'call') callForm.reset();
      else if (activeTab === 'meeting') meetingForm.reset();
      else emailForm.reset();

      if (onInteractionCreated) {
        onInteractionCreated();
      }
    } catch (error) {
      logger.error('Error creating interaction', error as Error);
      toast.error('Error al registrar la interacción');
    } finally {
      setIsSubmitting(false);
    }
  };

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

          {/* Note Tab */}
          <TabsContent value="note">
            <form onSubmit={noteForm.handleSubmit((data) => handleSubmit(data))} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="note-summary">Título *</Label>
                <Input
                  id="note-summary"
                  placeholder="Ej: Seguimiento post-propuesta"
                  {...noteForm.register('summary')}
                />
                {noteForm.formState.errors.summary && (
                  <p className="text-sm text-destructive">{noteForm.formState.errors.summary.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="note-details">Nota</Label>
                <Textarea
                  id="note-details"
                  rows={4}
                  placeholder="Escribe los detalles de la nota..."
                  {...noteForm.register('details')}
                />
                {noteForm.formState.errors.details && (
                  <p className="text-sm text-destructive">{noteForm.formState.errors.details.message}</p>
                )}
              </div>

              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Guardar Nota
              </Button>
            </form>
          </TabsContent>

          {/* Call Tab */}
          <TabsContent value="call">
            <form onSubmit={callForm.handleSubmit((data) => handleSubmit(data))} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="call-summary">Título *</Label>
                <Input
                  id="call-summary"
                  placeholder="Ej: Llamada de seguimiento"
                  {...callForm.register('summary')}
                />
                {callForm.formState.errors.summary && (
                  <p className="text-sm text-destructive">{callForm.formState.errors.summary.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="call-duration">Duración (minutos)</Label>
                <Input
                  id="call-duration"
                  type="number"
                  min="1"
                  placeholder="30"
                  {...callForm.register('duration', { valueAsNumber: true })}
                />
                {callForm.formState.errors.duration && (
                  <p className="text-sm text-destructive">{callForm.formState.errors.duration.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="call-details">Notas de la llamada</Label>
                <Textarea
                  id="call-details"
                  rows={4}
                  placeholder="Resumen de la conversación..."
                  {...callForm.register('details')}
                />
                {callForm.formState.errors.details && (
                  <p className="text-sm text-destructive">{callForm.formState.errors.details.message}</p>
                )}
              </div>

              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Registrar Llamada
              </Button>
            </form>
          </TabsContent>

          {/* Meeting Tab */}
          <TabsContent value="meeting">
            <form onSubmit={meetingForm.handleSubmit((data) => handleSubmit(data))} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="meeting-summary">Título *</Label>
                <Input
                  id="meeting-summary"
                  placeholder="Ej: Reunión de presentación"
                  {...meetingForm.register('summary')}
                />
                {meetingForm.formState.errors.summary && (
                  <p className="text-sm text-destructive">{meetingForm.formState.errors.summary.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="meeting-location">Ubicación</Label>
                <Input
                  id="meeting-location"
                  placeholder="Ej: Oficina cliente, Zoom, etc."
                  {...meetingForm.register('location')}
                />
                {meetingForm.formState.errors.location && (
                  <p className="text-sm text-destructive">{meetingForm.formState.errors.location.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="meeting-details">Resumen de la reunión</Label>
                <Textarea
                  id="meeting-details"
                  rows={4}
                  placeholder="Temas tratados, acuerdos, próximos pasos..."
                  {...meetingForm.register('details')}
                />
                {meetingForm.formState.errors.details && (
                  <p className="text-sm text-destructive">{meetingForm.formState.errors.details.message}</p>
                )}
              </div>

              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Registrar Reunión
              </Button>
            </form>
          </TabsContent>

          {/* Email Tab */}
          <TabsContent value="email">
            <form onSubmit={emailForm.handleSubmit((data) => handleSubmit(data))} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email-summary">Asunto *</Label>
                <Input
                  id="email-summary"
                  placeholder="Ej: Propuesta comercial - Proyecto X"
                  {...emailForm.register('summary')}
                />
                {emailForm.formState.errors.summary && (
                  <p className="text-sm text-destructive">{emailForm.formState.errors.summary.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email-details">Contenido del email</Label>
                <Textarea
                  id="email-details"
                  rows={4}
                  placeholder="Resumen del contenido del email enviado..."
                  {...emailForm.register('details')}
                />
                {emailForm.formState.errors.details && (
                  <p className="text-sm text-destructive">{emailForm.formState.errors.details.message}</p>
                )}
              </div>

              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Registrar Email
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
