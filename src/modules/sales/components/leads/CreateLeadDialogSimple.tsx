/**
 * ZADIA OS - Create Lead Dialog (Simplified)
 * 
 * Modal component for creating new leads
 */

'use client';

import { useState } from 'react';
import { logger } from '@/lib/logger';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useLeads } from '../../hooks/use-leads';
import type { LeadFormData } from '../../validations/sales.schema';

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
  
  // Form state
  const [entityType, setEntityType] = useState<'person' | 'company' | 'institution'>('person');
  const [fullName, setFullName] = useState('');
  const [entityName, setEntityName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [position, setPosition] = useState('');
  const [source, setSource] = useState<'web' | 'referral' | 'event' | 'cold-call' | 'imported'>('web');
  const [priority, setPriority] = useState<'hot' | 'warm' | 'cold'>('warm');
  const [notes, setNotes] = useState('');

  const resetForm = () => {
    setEntityType('person');
    setFullName('');
    setEntityName('');
    setEmail('');
    setPhone('');
    setCompany('');
    setPosition('');
    setSource('web');
    setPriority('warm');
    setNotes('');
  };

  const onSubmit = async () => {
    if (!user?.uid) {
      toast.error('Usuario no autenticado');
      return;
    }

    // Basic validation
    if (!email || !phone) {
      toast.error('Email y teléfono son requeridos');
      return;
    }

    if (entityType === 'person' && !fullName) {
      toast.error('Nombre completo es requerido para persona');
      return;
    }

    if ((entityType === 'company' || entityType === 'institution') && !entityName) {
      toast.error('Nombre de entidad es requerido');
      return;
    }

    try {
      setLoading(true);
      
      const leadData: LeadFormData = {
        entityType,
        fullName: entityType === 'person' ? fullName : undefined,
        entityName: entityType !== 'person' ? entityName : undefined,
        email,
        phone,
        company: entityType === 'person' ? company : undefined,
        position: entityType === 'person' ? position : undefined,
        source,
        priority,
        score: 50, // Default score
        assignedTo: user.uid,
        notes: notes || undefined,
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

        <div className="space-y-6">
          <EntityTypeSelector 
            entityType={entityType} 
            onEntityTypeChange={setEntityType} 
          />

          <Separator />

          <LeadBasicInfo
            entityType={entityType}
            fullName={fullName}
            onFullNameChange={setFullName}
            entityName={entityName}
            onEntityNameChange={setEntityName}
            email={email}
            onEmailChange={setEmail}
            phone={phone}
            onPhoneChange={setPhone}
            company={company}
            onCompanyChange={setCompany}
            position={position}
            onPositionChange={setPosition}
          />

          <Separator />

          <LeadSourcePriority
            source={source}
            onSourceChange={setSource}
            priority={priority}
            onPriorityChange={setPriority}
          />

          <LeadNotes notes={notes} onNotesChange={setNotes} />

          <Separator />

          <LeadDialogActions
            loading={loading}
            onCancel={() => onOpenChange(false)}
            onSubmit={onSubmit}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}