import { useEffect, useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { OpportunitiesService } from '../../services/opportunities.service';
import { ClientsService } from '@/modules/clients/services/clients.service';
import { ContactsService } from '@/modules/clients/services/entities/contacts-entity.service';
import { LeadsService } from '../../services/leads.service';
import { useTenantId } from '@/contexts/TenantContext';
import { logger } from '@/lib/logger';
import { useAuth } from '@/contexts/AuthContext';
import {
  QuoteModeSelector,
  QuoteOpportunitySelector,
  QuoteClientSelector,
  QuoteTermsForm,
} from './basic-info';
import { QuoteLeadSelector } from './basic-info/QuoteLeadSelector';
import type { Opportunity, Lead } from '../../types/sales.types';
import type { Client } from '@/modules/clients/types/clients.types';

interface QuoteFormData {
  opportunityId?: string;
  opportunityName?: string;
  leadId?: string;
  leadName?: string;
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

// ... inside component
export function QuoteBasicInfoStep({ formData, updateFormData }: QuoteBasicInfoStepProps) {
  const { user } = useAuth();
  const tenantId = useTenantId(); // Helper hook from TenantContext

  // Determine initial mode based on what's provided
  const [mode, setMode] = useState<'opportunity' | 'direct' | 'lead'>(
    formData.leadId ? 'lead' : formData.opportunityId ? 'opportunity' : 'direct'
  );

  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [contacts, setContacts] = useState<Array<{ id: string; name: string; position?: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();

  useEffect(() => {
    if (tenantId) {
      loadOpportunities(tenantId);
      loadClients(tenantId);
      loadLeads(tenantId);
    } else {
      if (user) setError('Tu usuario no tiene una organización activa. Contacta al administrador.');
    }
  }, [tenantId, user]);

  const loadOpportunities = async (tid: string) => {
    try {
      setLoading(true);
      const opps = await OpportunitiesService.getOpportunities(tid);
      const filteredOpps = opps.filter((opp) => opp.status === 'open');
      setOpportunities(filteredOpps);
    } catch (err) {
      logger.error('Error loading opportunities', err instanceof Error ? err : new Error(String(err)));
      setError('Error al cargar oportunidades');
    } finally {
      setLoading(false);
    }
  };

  const loadClients = async (tenantId: string) => {
    try {
      const clientsList = await ClientsService.getClients(tenantId);
      setClients(clientsList);
    } catch {
      setError('Error al cargar clientes');
    }
  };

  const loadLeads = async (tenantId: string) => {
    try {
      const result = await LeadsService.searchLeads({
        status: ['new', 'contacted', 'qualifying', 'converted']
      }, 1000, undefined, tenantId);

      setLeads(result.leads);
    } catch (err) {
      logger.error('Error loading leads', err instanceof Error ? err : new Error(String(err)));
    }
  };

  const handleModeChange = (newMode: 'opportunity' | 'direct' | 'lead') => {
    setMode(newMode);
    const commonReset = {
      opportunityId: undefined,
      opportunityName: undefined,
      leadId: undefined,
      leadName: undefined,
      clientId: '',
      clientName: undefined,
      contactId: '',
      contactName: undefined,
    };
    updateFormData(commonReset);
  };

  const handleOpportunityChange = async (opportunityId: string) => {
    try {
      const opportunity = opportunities.find((o) => o.id === opportunityId);
      if (!opportunity) return;

      const client = await ClientsService.getClientById(opportunity.clientId);
      if (!client) {
        setError('No se pudo cargar información del cliente');
        return;
      }

      // Resolve real contact name from client contacts
      let resolvedContactName = '';
      if (opportunity.contactId && tenantId) {
        const clientContacts = await ContactsService.getContactsByClient(opportunity.clientId, tenantId);
        const contact = clientContacts.find(c => c.id === opportunity.contactId);
        resolvedContactName = contact?.name || client.name;
        setContacts(clientContacts.map(c => ({ id: c.id, name: c.name, position: c.role })));
      }

      updateFormData({
        opportunityId,
        opportunityName: opportunity.name,
        leadId: undefined,
        leadName: undefined,
        clientId: opportunity.clientId,
        clientName: client.name,
        contactId: opportunity.contactId,
        contactName: resolvedContactName,
        currency: opportunity.currency,
      });
    } catch (err) {
      logger.error('Error loading opportunity data', err instanceof Error ? err : new Error(String(err)));
      setError('Error al cargar datos de la oportunidad');
    }
  };

  const handleClientChange = async (clientId: string) => {
    try {
      const client = clients.find((c) => c.id === clientId);
      if (!client) return;

      // Load real contacts from Firestore
      if (tenantId) {
        const clientContacts = await ContactsService.getContactsByClient(clientId, tenantId);
        setContacts(clientContacts.map(c => ({ id: c.id, name: c.name, position: c.role })));
      }

      updateFormData({
        clientId,
        clientName: client.name,
        contactId: '',
        contactName: undefined,
        leadId: undefined,
        leadName: undefined,
        opportunityId: undefined
      });
    } catch (err) {
      logger.error('Error loading client data', err instanceof Error ? err : new Error(String(err)));
      setError('Error al cargar datos del cliente');
    }
  };

  const handleLeadChange = (leadId: string) => {
    const lead = leads.find(l => l.id === leadId);
    if (!lead) return;

    updateFormData({
      leadId: lead.id,
      leadName: lead.fullName || lead.entityName,
      clientId: undefined,
      clientName: undefined,
      contactId: undefined,
      opportunityId: undefined
    });
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

      {mode === 'direct' && (
        <QuoteClientSelector
          clients={clients}
          selectedClientId={formData.clientId || ''}
          selectedClientName={formData.clientName}
          contacts={contacts}
          selectedContactId={formData.contactId || ''}
          loading={loading}
          mode={mode as 'opportunity' | 'direct'}
          onClientChange={handleClientChange}
          onContactChange={(contactId) => {
            const contact = contacts.find(c => c.id === contactId);
            updateFormData({ contactId, contactName: contact?.name });
          }}
        />
      )}

      {mode === 'lead' && (
        <QuoteLeadSelector
          leads={leads}
          selectedLeadId={formData.leadId || ''}
          selectedLeadName={formData.leadName} // Pass lead name for fallback
          loading={loading}
          onLeadChange={handleLeadChange}
        />
      )}

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