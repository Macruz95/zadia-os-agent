/**
 * ZADIA OS - Create Lead Dialog (Simplified)
 * 
 * Modal component for creating new leads
 */

'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { logger } from '@/lib/logger';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Form } from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useLeads } from '../../hooks/use-leads';
import { createLeadSchema } from '../../validations/sales.schema';
import type { z } from 'zod';

type CreateLeadFormData = z.infer<typeof createLeadSchema>;

import { EntityTypeSelector } from './EntityTypeSelector';
import { LeadBasicInfo } from './LeadBasicInfo';
import { LeadSourcePriority } from './LeadSourcePriority';
import { LeadNotes } from './LeadNotes';
import { LeadDialogActions } from './LeadDialogActions';

interface CreateLeadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function CreateLeadDialog({ open, onOpenChange, onSuccess }: CreateLeadDialogProps) {
  const { user } = useAuth();
  const { createLead } = useLeads();
  const [loading, setLoading] = useState(false);
  
  const form = useForm<CreateLeadFormData>({
    resolver: zodResolver(createLeadSchema),
    defaultValues: {
      entityType: 'person',
      email: '',
      phone: '',
      source: 'web',
      priority: 'warm'
    }
  });

  const watchEntityType = form.watch('entityType');

  const resetForm = () => {
    form.reset({
      entityType: 'person',
      email: '',
      phone: '',
      source: 'web',
      priority: 'warm'
    });
  };

  const onSubmit = async (data: CreateLeadFormData) => {
    if (!user?.uid) {
      toast.error('Usuario no autenticado');
      return;
    }

    try {
      setLoading(true);
      
      const leadData = {
        ...data,
        score: 50, // Default score
        assignedTo: user.uid
      };
      
      await createLead(leadData, user.uid);
      toast.success('Lead creado exitosamente');
      resetForm();
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      logger.error('Error creating lead', error as Error, {
        component: 'CreateLeadDialogSimple',
        action: 'handleSubmit'
      });
      toast.error('Error al crear el lead');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Crear Nuevo Lead</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <EntityTypeSelector 
              entityType={watchEntityType}
              onEntityTypeChange={(value) => form.setValue('entityType', value)}
            />

            <Separator />

            <LeadBasicInfo
              entityType={watchEntityType}
              fullName={form.watch('fullName') || ''}
              onFullNameChange={(value) => form.setValue('fullName', value)}
              entityName={form.watch('entityName') || ''}
              onEntityNameChange={(value) => form.setValue('entityName', value)}
              email={form.watch('email')}
              onEmailChange={(value) => form.setValue('email', value)}
              phone={form.watch('phone')}
              onPhoneChange={(value) => form.setValue('phone', value)}
              company={form.watch('company') || ''}
              onCompanyChange={(value) => form.setValue('company', value)}
              position={form.watch('position') || ''}
              onPositionChange={(value) => form.setValue('position', value)}
            />

            <Separator />

            <LeadSourcePriority
              source={form.watch('source')}
              onSourceChange={(value) => form.setValue('source', value)}
              priority={form.watch('priority')}
              onPriorityChange={(value) => form.setValue('priority', value)}
            />

            <LeadNotes 
              notes={form.watch('notes') || ''}
              onNotesChange={(value) => form.setValue('notes', value)}
            />

            <Separator />

            <LeadDialogActions
              loading={loading}
              onCancel={() => onOpenChange(false)}
              onSubmit={() => form.handleSubmit(onSubmit)()}
            />
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}