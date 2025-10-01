/**
 * ZADIA OS - Edit Lead Dialog Component
 * 
 * Dialog for editing existing leads
 */

'use client';

import { useState, useEffect } from 'react';
import { Timestamp } from 'firebase/firestore';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Form } from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';
import { createLeadSchema, CreateLeadFormData } from '../../validations/sales.schema';
import { Lead } from '../../types/sales.types';
import { updateLead } from '../../services/leads.service';
import { useAuth } from '@/contexts/AuthContext';
import { logger } from '@/lib/logger';
import { EntityTypeSelector } from './EntityTypeSelector';
import { LeadBasicInfo } from './LeadBasicInfo';
import { LeadSourcePriority } from './LeadSourcePriority';
import { LeadNotes } from './LeadNotes';
import { LeadDialogActions } from './LeadDialogActions';

interface EditLeadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lead: Lead;
  onSuccess?: () => void;
}

export function EditLeadDialog({
  open,
  onOpenChange,
  lead,
  onSuccess,
}: EditLeadDialogProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const form = useForm<CreateLeadFormData>({
    resolver: zodResolver(createLeadSchema),
  });

  const watchEntityType = form.watch('entityType');

  // Load lead data into form when dialog opens
  useEffect(() => {
    if (open && lead) {
      form.reset({
        entityType: lead.entityType,
        fullName: lead.fullName || '',
        entityName: lead.entityName || '',
        email: lead.email,
        phone: lead.phone,
        // phoneCountryId: lead.phoneCountryId, // TODO: Add to Lead type
        company: lead.company || '',
        position: lead.position || '',
        source: lead.source,
        priority: lead.priority,
        notes: lead.notes || '',
      });
    }
  }, [open, lead, form]);

  const resetForm = () => {
    form.reset({
      entityType: 'person',
      fullName: '',
      entityName: '',
      email: '',
      phone: '',
      // phoneCountryId: 'SV', // El Salvador por defecto
      company: '',
      position: '',
      source: 'web',
      priority: 'warm',
      notes: '',
    });
  };

  const onSubmit = async (data: CreateLeadFormData) => {
    if (!user) return;

    setLoading(true);
    try {
      const leadUpdateData = {
        ...data,
        updatedAt: Timestamp.now(),
      };
      
      await updateLead(lead.id, leadUpdateData);
      toast.success('Lead actualizado exitosamente');
      resetForm();
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      logger.error('Error updating lead', error as Error, {
        component: 'EditLeadDialog',
        action: 'handleSubmit'
      });
      toast.error('Error al actualizar el lead');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Lead</DialogTitle>
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
              phoneCountryId={undefined}
              onPhoneCountryChange={undefined}
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
              submitText="Actualizar Lead"
            />
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}