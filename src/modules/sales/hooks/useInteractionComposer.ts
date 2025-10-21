/**
 * ZADIA OS - Interaction Composer Hook
 * 
 * Manages interaction forms state and submission
 * REGLA 5: <200 líneas
 */

'use client';

import { useState } from 'react';
import { useForm, type UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
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

interface UseInteractionComposerProps {
  opportunityId: string;
  onInteractionCreated?: () => void;
}

type InteractionType = 'note' | 'call' | 'meeting' | 'email';
type InteractionInput = NoteInteractionInput | CallInteractionInput | MeetingInteractionInput | EmailInteractionInput;

interface UseInteractionComposerReturn {
  activeTab: InteractionType;
  setActiveTab: (tab: InteractionType) => void;
  isSubmitting: boolean;
  noteForm: UseFormReturn<NoteInteractionInput>;
  callForm: UseFormReturn<CallInteractionInput>;
  meetingForm: UseFormReturn<MeetingInteractionInput>;
  emailForm: UseFormReturn<EmailInteractionInput>;
  handleSubmit: (data: InteractionInput) => Promise<void>;
}

const INTERACTION_LABELS: Record<InteractionType, string> = {
  note: 'Nota',
  call: 'Llamada',
  meeting: 'Reunión',
  email: 'Email',
};

export function useInteractionComposer({
  opportunityId,
  onInteractionCreated,
}: UseInteractionComposerProps): UseInteractionComposerReturn {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<InteractionType>('note');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const noteForm = useForm<NoteInteractionInput>({
    resolver: zodResolver(noteInteractionSchema),
    defaultValues: { summary: '', details: '' },
  });

  const callForm = useForm<CallInteractionInput>({
    resolver: zodResolver(callInteractionSchema),
    defaultValues: { summary: '', details: '', duration: undefined },
  });

  const meetingForm = useForm<MeetingInteractionInput>({
    resolver: zodResolver(meetingInteractionSchema),
    defaultValues: { summary: '', details: '', location: '', attendees: [] },
  });

  const emailForm = useForm<EmailInteractionInput>({
    resolver: zodResolver(emailInteractionSchema),
    defaultValues: { summary: '', details: '', recipients: [], attachments: [] },
  });

  const handleSubmit = async (data: InteractionInput) => {
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

      toast.success(`${INTERACTION_LABELS[activeTab]} registrado correctamente`);

      // Reset active form
      if (activeTab === 'note') noteForm.reset();
      else if (activeTab === 'call') callForm.reset();
      else if (activeTab === 'meeting') meetingForm.reset();
      else emailForm.reset();

      onInteractionCreated?.();
    } catch (error) {
      logger.error('Error creating interaction', error as Error);
      toast.error('Error al registrar la interacción');
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    activeTab,
    setActiveTab,
    isSubmitting,
    noteForm,
    callForm,
    meetingForm,
    emailForm,
    handleSubmit,
  };
}
