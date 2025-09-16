'use client';

import { Calendar, MapPin, MessageSquare, Mail, Phone } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Client, Contact } from '../types/clients.types';
import { formatDate } from '../utils/date.utils';
import { useFormattedAddress } from '../hooks/use-formatted-address';

interface ClientInfoCardProps {
  client: Client;
  contacts?: Contact[];
}

export const ClientInfoCard = ({ client, contacts }: ClientInfoCardProps) => {
  const { formattedAddress, loading } = useFormattedAddress(client.address);
  
  // Get primary contact or first contact
  const primaryContact = contacts?.find(c => c.isPrimary) || contacts?.[0];
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Información General</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-start gap-2 text-sm">
            <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
            <div className="flex-1">
              <div className="font-medium">Dirección</div>
              <div className="text-muted-foreground break-words">
                {loading ? (
                  <div className="animate-pulse bg-gray-200 h-4 w-3/4 rounded"></div>
                ) : (
                  formattedAddress
                )}
              </div>
              {client.address.postalCode && (
                <div className="text-xs text-muted-foreground mt-1">
                  Código Postal: {client.address.postalCode}
                </div>
              )}
            </div>
          </div>
          
          {/* Contact Information */}
          {primaryContact && (
            <>
              {primaryContact.email && (
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <div className="flex-1">
                    <div className="font-medium">Correo electrónico</div>
                    <div className="text-muted-foreground break-words">{primaryContact.email}</div>
                  </div>
                </div>
              )}
              
              {primaryContact.phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <div className="flex-1">
                    <div className="font-medium">Teléfono</div>
                    <div className="text-muted-foreground">{primaryContact.phone}</div>
                  </div>
                </div>
              )}
              
              {!primaryContact.email && !primaryContact.phone && (
                <div className="text-sm text-muted-foreground">
                  No hay información de contacto disponible
                </div>
              )}
            </>
          )}
          
          {!primaryContact && (
            <div className="text-sm text-muted-foreground">
              No hay contactos asociados a este cliente
            </div>
          )}
          
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <div>
              <span className="text-muted-foreground">Cliente desde </span>
              <span className="font-medium">{formatDate(client.createdAt)}</span>
            </div>
          </div>
          
          {client.lastInteractionDate && (
            <div className="flex items-center gap-2 text-sm">
              <MessageSquare className="w-4 h-4 text-muted-foreground" />
              <div>
                <span className="text-muted-foreground">Última interacción </span>
                <span className="font-medium">{formatDate(client.lastInteractionDate)}</span>
              </div>
            </div>
          )}
          
          {client.tags && client.tags.length > 0 && (
            <div className="pt-2">
              <div className="text-sm font-medium mb-2">Etiquetas</div>
              <div className="flex flex-wrap gap-1">
                {client.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
