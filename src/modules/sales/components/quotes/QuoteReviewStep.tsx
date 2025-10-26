'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  CheckCircle, 
  Calendar, 
  DollarSign, 
  User, 
  Building2, 
  Phone, 
  Mail, 
  MapPin,
  Users,
  Briefcase
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useQuoteCalculator } from '../../hooks/use-quote-calculator';
import { getClientById, getContactsByClient } from '@/modules/clients/services/clients.service';
import type { QuoteItem } from '../../types/sales.types';
import type { Client, Contact, Address } from '@/modules/clients/types/clients.types';

interface QuoteFormData {
  opportunityName?: string;
  clientId?: string;
  clientName?: string;
  contactId?: string;
  contactName?: string;
  currency: string;
  validUntil: Date;
  paymentTerms: string;
  items: Omit<QuoteItem, 'id'>[];
  taxes: Record<string, number>;
  additionalDiscounts: number;
  notes?: string;
  internalNotes?: string;
}

interface QuoteReviewStepProps {
  formData: QuoteFormData;
}

export function QuoteReviewStep({ formData }: QuoteReviewStepProps) {
  const [client, setClient] = useState<Client | null>(null);
  const [contact, setContact] = useState<Contact | null>(null);
  const [loading, setLoading] = useState(true);

  const calculation = useQuoteCalculator({
    items: formData.items,
    taxes: formData.taxes,
    additionalDiscounts: formData.additionalDiscounts,
  });

  // Cargar información completa del cliente
  useEffect(() => {
    const loadClientData = async () => {
      if (!formData.clientId) {
        setLoading(false);
        return;
      }

      try {
        const clientData = await getClientById(formData.clientId);
        setClient(clientData);

        // Cargar contacto si está especificado
        if (formData.contactId) {
          const contacts = await getContactsByClient(formData.clientId);
          const selectedContact = contacts.find((c: Contact) => c.id === formData.contactId);
          setContact(selectedContact || null);
        }
      } catch {
        // Error silencioso - mostraremos solo los datos básicos
      } finally {
        setLoading(false);
      }
    };

    loadClientData();
  }, [formData.clientId, formData.contactId]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-PY', {
      style: 'currency',
      currency: formData.currency,
      minimumFractionDigits: 2,
    }).format(amount);
  };

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
    <div className="space-y-6">
      <Alert>
        <CheckCircle className="h-4 w-4" />
        <AlertDescription>
          Revise toda la información de la cotización antes de crearla. 
          Esta será una cotización formal con todos los datos del cliente.
        </AlertDescription>
      </Alert>

      {/* Información del Cliente - COMPLETA */}
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
                Cliente: {formData.clientName || 'No especificado'}
              </p>
              {formData.contactName && (
                <p className="text-sm text-muted-foreground">
                  Contacto: {formData.contactName}
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Información de la Oportunidad */}
      {formData.opportunityName && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Briefcase className="w-4 h-4" />
              Oportunidad
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-medium">{formData.opportunityName}</p>
            <Badge variant="outline" className="mt-2">{formData.currency}</Badge>
          </CardContent>
        </Card>
      )}

      {/* Términos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Calendar className="w-4 h-4" />
            Términos y Condiciones
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <p className="text-sm text-muted-foreground">Válido hasta</p>
            <p className="font-medium">
              {format(formData.validUntil, 'PPP', { locale: es })}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Términos de Pago</p>
            <p className="font-medium whitespace-pre-wrap">{formData.paymentTerms}</p>
          </div>
        </CardContent>
      </Card>

      {/* Items */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <DollarSign className="w-4 h-4" />
            Items ({formData.items.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Descripción</TableHead>
                <TableHead className="text-right">Cantidad</TableHead>
                <TableHead className="text-right">Precio Unit.</TableHead>
                <TableHead className="text-right">Desc. %</TableHead>
                <TableHead className="text-right">Subtotal</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {formData.items.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{item.description}</div>
                      <div className="text-xs text-muted-foreground">{item.unitOfMeasure}</div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">{item.quantity}</TableCell>
                  <TableCell className="text-right">{formatCurrency(item.unitPrice)}</TableCell>
                  <TableCell className="text-right">{item.discount}%</TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(item.subtotal)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Resumen de cálculos */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Totales</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-medium">{formatCurrency(calculation.subtotal)}</span>
          </div>

          {Object.keys(formData.taxes).length > 0 && (
            <>
              <Separator />
              <div className="space-y-2">
                <p className="text-sm font-medium">Impuestos:</p>
                {Object.entries(calculation.taxesBreakdown).map(([name, amount]) => (
                  <div key={name} className="flex justify-between text-sm pl-4">
                    <span className="text-muted-foreground">
                      {name} ({formData.taxes[name]}%)
                    </span>
                    <span>{formatCurrency(amount)}</span>
                  </div>
                ))}
                <div className="flex justify-between font-medium">
                  <span>Total Impuestos</span>
                  <span>{formatCurrency(calculation.totalTaxes)}</span>
                </div>
              </div>
            </>
          )}

          {formData.additionalDiscounts > 0 && (
            <>
              <Separator />
              <div className="flex justify-between text-orange-600">
                <span>Descuentos Adicionales</span>
                <span>-{formatCurrency(formData.additionalDiscounts)}</span>
              </div>
            </>
          )}

          <Separator />
          <div className="flex justify-between text-lg font-bold">
            <span>TOTAL</span>
            <span>{formatCurrency(calculation.total)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Notas */}
      {(formData.notes || formData.internalNotes) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Notas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {formData.notes && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Notas para el cliente</p>
                <p className="mt-1 whitespace-pre-wrap text-sm">{formData.notes}</p>
              </div>
            )}
            {formData.internalNotes && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Notas internas</p>
                <p className="mt-1 whitespace-pre-wrap text-sm bg-muted p-3 rounded-md">
                  {formData.internalNotes}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
