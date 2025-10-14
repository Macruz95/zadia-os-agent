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
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { OpportunitiesService } from '../../services/opportunities.service';
import { ClientsService } from '@/modules/clients/services/clients.service';
import type { Opportunity } from '../../types/sales.types';

interface QuoteFormData {
  opportunityId: string;
  opportunityName?: string;
  clientId?: string;
  clientName?: string;
  contactId?: string;
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
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();

  useEffect(() => {
    loadOpportunities();
  }, []);

  const loadOpportunities = async () => {
    try {
      setLoading(true);
      const opportunities = await OpportunitiesService.getOpportunities();
      // Filtrar solo oportunidades en etapas apropiadas para cotización
      const filteredOpps = opportunities.filter(
        (opp) => opp.stage === 'proposal-sent' || opp.stage === 'negotiation'
      );
      setOpportunities(filteredOpps);
    } catch {
      setError('Error al cargar oportunidades');
    } finally {
      setLoading(false);
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

      // Solo actualizar formData con lo que tenemos
      updateFormData({
        opportunityId,
        opportunityName: opportunity.name,
        clientId: opportunity.clientId,
        clientName: client.name,
        contactId: opportunity.contactId,
        contactName: opportunity.contactId || undefined,
        currency: opportunity.currency,
      });
    } catch {
      setError('Error al cargar datos de la oportunidad');
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

      {/* Oportunidad */}
      <div className="space-y-2">
        <Label htmlFor="opportunity">Oportunidad *</Label>
        <Select value={formData.opportunityId} onValueChange={handleOpportunityChange}>
          <SelectTrigger id="opportunity">
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

      {/* Cliente (read-only) */}
      {formData.clientName && (
        <div className="space-y-2">
          <Label>Cliente</Label>
          <div className="flex h-10 items-center rounded-md border border-input bg-muted px-3 py-2 text-sm">
            {formData.clientName}
          </div>
        </div>
      )}

      {/* Contacto (read-only) */}
      {formData.contactName && (
        <div className="space-y-2">
          <Label>Contacto</Label>
          <div className="flex h-10 items-center rounded-md border border-input bg-muted px-3 py-2 text-sm">
            {formData.contactName}
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
