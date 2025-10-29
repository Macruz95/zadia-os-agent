'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  User, 
  Building2, 
  Phone, 
  Mail, 
  MapPin,
  Users,
  Briefcase
} from 'lucide-react';
import { getClientById, getContactsByClient } from '@/modules/clients/services/clients.service';
import type { Client, Contact, Address } from '@/modules/clients/types/clients.types';

interface QuoteReviewHeaderProps {
  clientId?: string;
  clientName?: string;
  contactId?: string;
  contactName?: string;
}

export function QuoteReviewHeader({ 
  clientId, 
  clientName, 
  contactId, 
  contactName 
}: QuoteReviewHeaderProps) {
  const [client, setClient] = useState<Client | null>(null);
  const [contact, setContact] = useState<Contact | null>(null);
  const [loading, setLoading] = useState(true);

  // Cargar información completa del cliente
  useEffect(() => {
    const loadClientData = async () => {
      if (!clientId) {
        setLoading(false);
        return;
      }

      try {
        const clientData = await getClientById(clientId);
        setClient(clientData);

        // Cargar contacto si está especificado
        if (contactId) {
          const contacts = await getContactsByClient(clientId);
          const selectedContact = contacts.find((c: Contact) => c.id === contactId);
          setContact(selectedContact || null);
        }
      } catch {
        // Error silencioso - mostraremos solo los datos básicos
      } finally {
        setLoading(false);
      }
    };

    loadClientData();
  }, [clientId, contactId]);

  const getClientTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'PersonaNatural': 'Persona Natural',
      'Organización': 'Organización',
      'Empresa': 'Empresa'
    };
    return labels[type] || type;
  };

  const formatAddress = (address: Address) => {
    if (!address) return 'No especificada';
    const parts = [
      address.street,
      address.district,
      address.city,
      address.state,
      address.country
    ].filter(Boolean);
    return parts.join(', ');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {client?.clientType === 'PersonaNatural' ? (
            <User className="w-5 h-5 text-blue-600" />
          ) : (
            <Building2 className="w-5 h-5 text-purple-600" />
          )}
          Información del Cliente
          {client && (
            <Badge variant={client.clientType === 'PersonaNatural' ? 'secondary' : 'default'}>
              {getClientTypeLabel(client.clientType)}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-sm text-muted-foreground">Cargando información del cliente...</p>
        ) : client ? (
          <div className="space-y-4">
            {/* Nombre / Razón Social */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  {client.clientType === 'PersonaNatural' ? (
                    <><User className="w-3 h-3" /> Nombre Completo</>
                  ) : (
                    <><Building2 className="w-3 h-3" /> Nombre Comercial</>
                  )}
                </p>
                <p className="font-semibold text-lg">{client.name}</p>
              </div>
              
              {client.legalName && (
                <div>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Briefcase className="w-3 h-3" /> Razón Social
                  </p>
                  <p className="font-medium">{client.legalName}</p>
                </div>
              )}
            </div>

            <Separator />

            {/* Documentos de Identificación */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">
                  {client.clientType === 'PersonaNatural' ? 'DUI / Pasaporte' : 'NRC'}
                </p>
                <p className="font-medium font-mono">{client.documentId || 'No especificado'}</p>
              </div>
              {client.taxId && (
                <div>
                  <p className="text-sm text-muted-foreground">NIT / Registro Fiscal</p>
                  <p className="font-medium font-mono">{client.taxId}</p>
                </div>
              )}
            </div>

            <Separator />

            {/* Información de Contacto */}
            <div>
              <p className="text-sm font-semibold mb-2 flex items-center gap-1">
                <Phone className="w-4 h-4" /> Contacto
              </p>
              <div className="grid grid-cols-2 gap-4">
                {client.phone && (
                  <div>
                    <p className="text-sm text-muted-foreground">Teléfono Principal</p>
                    <p className="font-medium font-mono">{client.phone}</p>
                  </div>
                )}
                {client.email && (
                  <div>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Mail className="w-3 h-3" /> Email Principal
                    </p>
                    <p className="font-medium">{client.email}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Dirección Completa */}
            {client.address && (
              <>
                <Separator />
                <div>
                  <p className="text-sm font-semibold mb-2 flex items-center gap-1">
                    <MapPin className="w-4 h-4" /> Dirección
                  </p>
                  <p className="text-sm leading-relaxed">{formatAddress(client.address)}</p>
                </div>
              </>
            )}

            {/* Persona de Contacto */}
            {contact && (
              <>
                <Separator />
                <div>
                  <p className="text-sm font-semibold mb-2 flex items-center gap-1">
                    <Users className="w-4 h-4" /> Persona de Contacto
                  </p>
                  <div className="bg-muted p-3 rounded-lg space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{contact.name}</span>
                      {contact.role && (
                        <Badge variant="outline">{contact.role}</Badge>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {contact.phone && (
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Phone className="w-3 h-3" />
                          {contact.phone}
                        </div>
                      )}
                      {contact.email && (
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Mail className="w-3 h-3" />
                          {contact.email}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="text-center p-4">
            <p className="text-sm text-muted-foreground">
              Cliente: {clientName || 'No especificado'}
            </p>
            {contactName && (
              <p className="text-sm text-muted-foreground">
                Contacto: {contactName}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}