'use client';

import { useEffect, useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { OpportunitiesService } from '../../services/opportunities.service';
import { ClientsService } from '@/modules/clients/services/clients.service';
import {
  QuoteModeSelector,
  QuoteOpportunitySelector,
  QuoteClientSelector,
  QuoteTermsForm,
} from './basic-info';
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

      <QuoteModeSelector mode={mode} onModeChange={handleModeChange} />

      {mode === 'opportunity' && (
        <QuoteOpportunitySelector
          opportunities={opportunities}
          selectedOpportunityId={formData.opportunityId}
          loading={loading}
          onOpportunityChange={handleOpportunityChange}
        />
      )}

      <QuoteClientSelector
        clients={clients}
        selectedClientId={formData.clientId}
        selectedClientName={formData.clientName}
        contacts={contacts}
        selectedContactId={formData.contactId}
        mode={mode}
        onClientChange={handleClientChange}
        onContactChange={(contactId) => updateFormData({ contactId })}
      />

      <QuoteTermsForm
        currency={formData.currency}
        validUntil={formData.validUntil}
        paymentTerms={formData.paymentTerms}
        onCurrencyChange={(currency) => updateFormData({ currency })}
        onValidUntilChange={(validUntil) => updateFormData({ validUntil })}
        onPaymentTermsChange={(paymentTerms) => updateFormData({ paymentTerms })}
      />
    </div>
  );
}