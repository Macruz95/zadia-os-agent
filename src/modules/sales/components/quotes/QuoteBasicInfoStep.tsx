'use client';

import { useEffect, useState } from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CalendarIcon, AlertCircle } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { OpportunitiesService } from '../../services/opportunities.service';
import { ClientsService } from '@/modules/clients/services/clients.service';
import type { Opportunity } from '../../types/sales.types';
import type { Client } from '@/modules/clients/types/clients.types';

interface QuoteFormData {
  opportunityId?: string;
  opportunityName?: string;
  clientId: string;
  clientName?: string;
  contactId: string;
  contactName?: string;
  currency: string;
  validUntil: Date;
  paymentTerms: string;
}

interface QuoteBasicInfoStepProps {
  formData: QuoteFormData;
  updateFormData: (updates: Partial<QuoteFormData>) => void;
}

export function QuoteBasicInfoStep({ formData, updateFormData }: QuoteBasicInfoStepProps) {
  const [mode, setMode] = useState<'opportunity' | 'direct'>(
    formData.opportunityId ? 'opportunity' : 'direct'
  );
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [contacts, setContacts] = useState<Array<{ id: string; name: string; position?: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();

  useEffect(() => {
    loadOpportunities();
    loadClients();
  }, []);

  const loadOpportunities = async () => {
    try {
      setLoading(true);
      const opportunities = await OpportunitiesService.getOpportunities();
      // Filtrar solo oportunidades con status 'open'
      const filteredOpps = opportunities.filter(
        (opp) => opp.status === 'open'
      );
      setOpportunities(filteredOpps);
    } catch {
      setError('Error al cargar oportunidades');
    } finally {
      setLoading(false);
    }
  };

  const loadClients = async () => {
    try {
      const clientsList = await ClientsService.getClients();
      setClients(clientsList);
    } catch {
      setError('Error al cargar clientes');
    }
  };

  const handleModeChange = (newMode: 'opportunity' | 'direct') => {
    setMode(newMode);
    // Reset fields when switching modes
    if (newMode === 'direct') {
      updateFormData({
        opportunityId: undefined,
        opportunityName: undefined,
        clientId: '',
        contactId: '',
      });
    } else {
      updateFormData({
        clientId: '',
        contactId: '',
      });
    }
  };

  const handleOpportunityChange = async (opportunityId: string) => {
    try {
      const opportunity = opportunities.find((o) => o.id === opportunityId);
      if (!opportunity) return;

      // Cargar información del cliente
      const client = await ClientsService.getClientById(opportunity.clientId);
      if (!client) {
        setError('No se pudo cargar información del cliente');
        return;
      }

      updateFormData({
        opportunityId,
        opportunityName: opportunity.name,
        clientId: opportunity.clientId,
        clientName: client.name,
        contactId: opportunity.contactId,
        contactName: opportunity.contactId,
        currency: opportunity.currency,
      });
    } catch {
      setError('Error al cargar datos de la oportunidad');
    }
  };

  const handleClientChange = async (clientId: string) => {
    try {
      const client = clients.find((c) => c.id === clientId);
      if (!client) return;

      // Load client contacts (simplified - using placeholder for now)
      setContacts([{ id: 'placeholder', name: 'Contacto Principal' }]);

      updateFormData({
        clientId,
        clientName: client.name,
        contactId: '',
      });
    } catch {
      setError('Error al cargar datos del cliente');
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Mode Selection */}
      <div className="space-y-3">
        <Label>¿Cómo desea crear la cotización?</Label>
        <RadioGroup value={mode} onValueChange={(v) => handleModeChange(v as 'opportunity' | 'direct')}>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="opportunity" id="opportunity" />
            <Label htmlFor="opportunity" className="font-normal cursor-pointer">
              Desde una oportunidad existente
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="direct" id="direct" />
            <Label htmlFor="direct" className="font-normal cursor-pointer">
              Directamente con un cliente
            </Label>
          </div>
        </RadioGroup>
      </div>

      {/* Opportunity Mode */}
      {mode === 'opportunity' && (
        <div className="space-y-2">
          <Label htmlFor="opportunity-select">Oportunidad *</Label>
          <Select value={formData.opportunityId} onValueChange={handleOpportunityChange}>
            <SelectTrigger id="opportunity-select">
              <SelectValue placeholder="Seleccionar oportunidad..." />
            </SelectTrigger>
            <SelectContent>
              {loading ? (
                <div className="p-2 text-sm text-muted-foreground">Cargando...</div>
              ) : opportunities.length === 0 ? (
                <div className="p-2 text-sm text-muted-foreground">
                  No hay oportunidades disponibles
                </div>
              ) : (
                opportunities.map((opp) => (
                  <SelectItem key={opp.id} value={opp.id}>
                    <div className="flex items-center gap-2">
                      <span>{opp.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {opp.stage}
                      </Badge>
                    </div>
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Direct Mode - Client Selection */}
      {mode === 'direct' && (
        <>
          <div className="space-y-2">
            <Label htmlFor="client-select">Cliente *</Label>
            <Select value={formData.clientId} onValueChange={handleClientChange}>
              <SelectTrigger id="client-select">
                <SelectValue placeholder="Seleccionar cliente..." />
              </SelectTrigger>
              <SelectContent>
                {clients.length === 0 ? (
                  <div className="p-2 text-sm text-muted-foreground">
                    No hay clientes disponibles
                  </div>
                ) : (
                  clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {formData.clientId && (
            <div className="space-y-2">
              <Label htmlFor="contact-select">Contacto *</Label>
              <Select value={formData.contactId} onValueChange={(v) => updateFormData({ contactId: v })}>
                <SelectTrigger id="contact-select">
                  <SelectValue placeholder="Seleccionar contacto..." />
                </SelectTrigger>
                <SelectContent>
                  {contacts.length === 0 ? (
                    <div className="p-2 text-sm text-muted-foreground">
                      No hay contactos disponibles
                    </div>
                  ) : (
                    contacts.map((contact) => (
                      <SelectItem key={contact.id} value={contact.id}>
                        {contact.name}
                        {contact.position && ` - ${contact.position}`}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          )}
        </>
      )}

      {/* Cliente (read-only when from opportunity) */}
      {mode === 'opportunity' && formData.clientName && (
        <div className="space-y-2">
          <Label>Cliente</Label>
          <div className="flex h-10 items-center rounded-md border border-input bg-muted px-3 py-2 text-sm">
            {formData.clientName}
          </div>
        </div>
      )}

      {/* Moneda */}
      <div className="space-y-2">
        <Label htmlFor="currency">Moneda *</Label>
        <Select
          value={formData.currency}
          onValueChange={(value) => updateFormData({ currency: value })}
        >
          <SelectTrigger id="currency">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="USD">USD - Dólares</SelectItem>
            <SelectItem value="PYG">PYG - Guaraníes</SelectItem>
            <SelectItem value="BRL">BRL - Reales</SelectItem>
            <SelectItem value="ARS">ARS - Pesos Argentinos</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Válido hasta */}
      <div className="space-y-2">
        <Label>Válido hasta *</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full justify-start text-left font-normal">
              <CalendarIcon className="mr-2 h-4 w-4" />
              {formData.validUntil ? (
                format(formData.validUntil, 'PPP', { locale: es })
              ) : (
                <span>Seleccionar fecha</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={formData.validUntil}
              onSelect={(date) => date && updateFormData({ validUntil: date })}
              initialFocus
              disabled={(date) => date < new Date()}
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Términos de pago */}
      <div className="space-y-2">
        <Label htmlFor="paymentTerms">Términos de Pago *</Label>
        <Textarea
          id="paymentTerms"
          value={formData.paymentTerms}
          onChange={(e) => updateFormData({ paymentTerms: e.target.value })}
          placeholder="Ej: 30% adelanto, 70% contra entrega"
          rows={3}
        />
      </div>
    </div>
  );
}
