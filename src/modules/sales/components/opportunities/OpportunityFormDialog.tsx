/**
 * ZADIA OS - Opportunity Form Dialog
 * 
 * Modal for creating/editing sales opportunities
 */

'use client';

import { useState, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Save, Loader2, DollarSign, Calendar } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { OpportunitiesService } from '../../services/opportunities.service';
import { ClientsService } from '@/modules/clients/services/clients.service';
import type { Opportunity, OpportunityPriority } from '../../types/sales.types';
import type { Client } from '@/modules/clients/types/clients.types';

interface OpportunityFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  opportunity?: Opportunity;
  onSuccess?: () => void;
}

export function OpportunityFormDialog({
  open,
  onOpenChange,
  opportunity,
  onSuccess,
}: OpportunityFormDialogProps) {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [loadingClients, setLoadingClients] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [clientId, setClientId] = useState('');
  const [contactId, setContactId] = useState('');
  const [estimatedValue, setEstimatedValue] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [expectedCloseDate, setExpectedCloseDate] = useState('');
  const [priority, setPriority] = useState<OpportunityPriority>('medium');
  const [notes, setNotes] = useState('');

  // Get selected client for reference
  const _selectedClient = useMemo(() => {
    return clients.find(c => c.id === clientId);
  }, [clients, clientId]);

  // Note: Contacts are managed separately in the contacts collection
  // For now, we'll use a simplified approach - contacts will be loaded when needed
  const availableContacts: { id: string; name: string; email?: string }[] = [];
  
  // Suppress unused variable warning - client will be used for contact loading
  void _selectedClient;

  // Load clients
  useEffect(() => {
    const loadClients = async () => {
      try {
        setLoadingClients(true);
        const data = await ClientsService.getClients();
        setClients(data);
      } catch {
        toast.error('Error al cargar clientes');
      } finally {
        setLoadingClients(false);
      }
    };

    if (open) {
      loadClients();
    }
  }, [open]);

  // Reset contact when client changes
  useEffect(() => {
    if (clientId && !opportunity) {
      setContactId('');
    }
  }, [clientId, opportunity]);

  // Load opportunity data for editing
  useEffect(() => {
    if (opportunity) {
      setName(opportunity.name);
      setClientId(opportunity.clientId);
      setContactId(opportunity.contactId);
      setEstimatedValue(opportunity.estimatedValue.toString());
      setCurrency(opportunity.currency);
      setExpectedCloseDate(
        opportunity.expectedCloseDate
          ? new Date(opportunity.expectedCloseDate.seconds * 1000).toISOString().split('T')[0]
          : ''
      );
      setPriority(opportunity.priority);
      setNotes(opportunity.notes || '');
    } else {
      // Reset form for new opportunity
      setName('');
      setClientId('');
      setContactId('');
      setEstimatedValue('');
      setCurrency('USD');
      setExpectedCloseDate('');
      setPriority('medium');
      setNotes('');
    }
  }, [opportunity, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.uid) {
      toast.error('Usuario no autenticado');
      return;
    }

    if (!name || !clientId || !contactId || !estimatedValue) {
      toast.error('Complete todos los campos requeridos');
      return;
    }

    try {
      setIsSubmitting(true);

      const oppData = {
        name,
        clientId,
        contactId,
        estimatedValue: parseFloat(estimatedValue),
        currency,
        expectedCloseDate: expectedCloseDate
          ? new Date(expectedCloseDate)
          : undefined,
        stage: 'qualified' as const,
        status: 'active' as const,
        probability: 20,
        priority,
        assignedTo: user.uid,
        notes,
      };

      if (opportunity) {
        await OpportunitiesService.updateOpportunity(opportunity.id, oppData);
        toast.success('Oportunidad actualizada');
      } else {
        await OpportunitiesService.createOpportunity(oppData, user.uid);
        toast.success('Oportunidad creada exitosamente');
      }

      onSuccess?.();
      onOpenChange(false);
    } catch {
      toast.error('Error al guardar la oportunidad');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {opportunity ? 'Editar Oportunidad' : 'Nueva Oportunidad'}
          </DialogTitle>
          <DialogDescription>
            Complete la información de la oportunidad de venta
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {/* Nombre de la Oportunidad */}
          <div className="space-y-2">
            <Label htmlFor="name">Nombre de la Oportunidad *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Sistema de gestión para empresa X"
              required
            />
          </div>

          {/* Cliente */}
          <div className="space-y-2">
            <Label htmlFor="client">Cliente *</Label>
            <Select value={clientId} onValueChange={setClientId} required>
              <SelectTrigger>
                <SelectValue placeholder="Seleccione cliente" />
              </SelectTrigger>
              <SelectContent>
                {loadingClients ? (
                  <SelectItem value="loading" disabled>Cargando...</SelectItem>
                ) : clients.length === 0 ? (
                  <SelectItem value="empty" disabled>No hay clientes disponibles</SelectItem>
                ) : (
                  clients.map(client => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Contacto */}
          <div className="space-y-2">
            <Label htmlFor="contact">Contacto *</Label>
            <Select
              value={contactId}
              onValueChange={setContactId}
              disabled={!clientId}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder={clientId ? "Seleccione contacto" : "Primero seleccione un cliente"} />
              </SelectTrigger>
              <SelectContent>
                {availableContacts.length === 0 ? (
                  <SelectItem value="empty" disabled>
                    {clientId ? 'Este cliente no tiene contactos' : 'Seleccione un cliente primero'}
                  </SelectItem>
                ) : (
                  availableContacts.map(contact => (
                    <SelectItem key={contact.id} value={contact.id}>
                      {contact.name} {contact.email ? `(${contact.email})` : ''}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {clientId && availableContacts.length === 0 && (
              <p className="text-xs text-muted-foreground">
                💡 Tip: Añade contactos al cliente desde el módulo de Clientes
              </p>
            )}
          </div>

          {/* Valor Estimado y Moneda */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="value">Valor Estimado *</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                <Input
                  id="value"
                  type="number"
                  step="0.01"
                  value={estimatedValue}
                  onChange={(e) => setEstimatedValue(e.target.value)}
                  placeholder="0.00"
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency">Moneda</Label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Fecha de Cierre y Prioridad */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="closeDate">Fecha de Cierre Esperada</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                <Input
                  id="closeDate"
                  type="date"
                  value={expectedCloseDate}
                  onChange={(e) => setExpectedCloseDate(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Prioridad</Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as OpportunityPriority)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Baja</SelectItem>
                  <SelectItem value="medium">Media</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Notas */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notas</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Información adicional sobre la oportunidad..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {opportunity ? 'Actualizar' : 'Crear Oportunidad'}
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
