/**
 * ZADIA OS - Create Lead Dialog (Simplified)
 * 
 * Modal component for creating new leads
 */

'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { Loader2, User, Building2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLeads } from '../../hooks/use-leads';
import type { LeadFormData } from '../../validations/sales.schema';

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
      console.error('Error creating lead:', error);
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
          {/* Entity Type Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Tipo de Entidad</Label>
            <div className="flex gap-4">
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="person"
                  name="entityType"
                  value="person"
                  checked={entityType === 'person'}
                  onChange={() => setEntityType('person')}
                  className="w-4 h-4"
                />
                <Label htmlFor="person" className="flex items-center gap-2 cursor-pointer">
                  <User className="h-4 w-4" />
                  Persona Individual
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="company"
                  name="entityType"
                  value="company"
                  checked={entityType === 'company'}
                  onChange={() => setEntityType('company')}
                  className="w-4 h-4"
                />
                <Label htmlFor="company" className="flex items-center gap-2 cursor-pointer">
                  <Building2 className="h-4 w-4" />
                  Empresa
                </Label>
              </div>
            </div>
          </div>

          <Separator />

          {/* Name Field */}
          <div className="space-y-2">
            {entityType === 'person' ? (
              <>
                <Label htmlFor="fullName">Nombre Completo *</Label>
                <Input
                  id="fullName"
                  placeholder="Juan Carlos López"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </>
            ) : (
              <>
                <Label htmlFor="entityName">Nombre de la Empresa *</Label>
                <Input
                  id="entityName"
                  placeholder="Tecnologías ABC S.A."
                  value={entityName}
                  onChange={(e) => setEntityName(e.target.value)}
                />
              </>
            )}
          </div>

          {/* Contact Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="contacto@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono *</Label>
              <Input
                id="phone"
                placeholder="+595 21 123456"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </div>

          {/* Additional Info for Person */}
          {entityType === 'person' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="company">Empresa</Label>
                <Input
                  id="company"
                  placeholder="Empresa donde trabaja"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="position">Cargo</Label>
                <Input
                  id="position"
                  placeholder="Gerente de Sistemas"
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Lead Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="source">Fuente *</Label>
              <Select value={source} onValueChange={(value) => setSource(value as typeof source)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="web">Sitio Web</SelectItem>
                  <SelectItem value="referral">Referido</SelectItem>
                  <SelectItem value="event">Evento</SelectItem>
                  <SelectItem value="cold-call">Llamada Fría</SelectItem>
                  <SelectItem value="imported">Importado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Prioridad *</Label>
              <Select value={priority} onValueChange={(value) => setPriority(value as typeof priority)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hot">🔥 Caliente</SelectItem>
                  <SelectItem value="warm">🟡 Tibio</SelectItem>
                  <SelectItem value="cold">🧊 Frío</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notas Iniciales</Label>
            <Textarea
              id="notes"
              placeholder="Observaciones, contexto del contacto, necesidades específicas..."
              className="min-h-[80px]"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <Separator />

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button onClick={onSubmit} disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Crear Lead
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}