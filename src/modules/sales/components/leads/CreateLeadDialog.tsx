/**
 * ZADIA OS - Create Lead Dialog
 * 
 * Modal component for creating new leads
 */

'use client';

import { useState } from 'react';
import { logger } from '@/lib/logger';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Form } from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { LeadEntityTypeSection } from './LeadEntityTypeSection';
import { LeadBasicInfoSection } from './LeadBasicInfoSection';
import { LeadDetailsSection } from './LeadDetailsSection';
import { LeadPriorityInfo } from './LeadPriorityInfo';
import { LeadFormActions } from './LeadFormActions';
import { useLeads } from '../../hooks/use-leads';
import { useAuth } from '@/contexts/AuthContext';
import { LeadFormData, LeadFormSchema } from '../../validations/sales.schema';

interface CreateLeadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function CreateLeadDialog({ open, onOpenChange, onSuccess }: CreateLeadDialogProps) {
  const { user } = useAuth();
  const { createLead } = useLeads();
  const [loading, setLoading] = useState(false);

  const form = useForm<LeadFormData>({
    resolver: zodResolver(LeadFormSchema),
    defaultValues: {
      entityType: 'person',
      fullName: '',
      entityName: '',
      email: '',
      phone: '',
      phoneCountryId: 'SV', // El Salvador por defecto
      company: '',
      position: '',
      source: 'web',
      priority: 'warm',
      score: 50,
      assignedTo: '',
      notes: '',
    },
  });

  const onSubmit = async (data: LeadFormData) => {
    if (!user?.uid) {
      toast.error('Usuario no autenticado');
      return;
    }

    try {
      setLoading(true);

      // Set assignedTo to current user if not specified
      const leadData = {
        ...data,
        assignedTo: data.assignedTo || user.uid,
      };

      await createLead(leadData, user.uid);
      toast.success('Lead creado exitosamente');
      form.reset();
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      logger.error('Error creating lead', error as Error, {
        component: 'CreateLeadDialog',
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
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-4">
            <LeadEntityTypeSection control={form.control} />

            <LeadBasicInfoSection control={form.control} />

            <LeadDetailsSection control={form.control} />

            <LeadPriorityInfo />

            <Separator />

            <LeadFormActions
              loading={loading}
              onCancel={() => onOpenChange(false)}
            />
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}