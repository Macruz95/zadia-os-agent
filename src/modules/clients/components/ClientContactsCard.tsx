'use client';

import { Mail, Phone } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Contact } from '../types/clients.types';

interface ClientContactsCardProps {
  contacts: Contact[];
}

export const ClientContactsCard = ({ contacts }: ClientContactsCardProps) => {
  console.log('👥 ClientContactsCard contacts:', contacts);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Contactos</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {contacts && contacts.length > 0 ? (
          contacts.map((contact: Contact) => (
            <div key={contact.id} className="flex items-start justify-between p-3 border rounded-lg bg-card">
              <div className="space-y-1 flex-1">
                <p className="font-medium text-sm">{contact.name || 'Sin nombre'}</p>
                {contact.role && (
                  <p className="text-xs text-muted-foreground">{contact.role}</p>
                )}
                {contact.email && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Mail className="w-3 h-3" />
                    <span>{contact.email}</span>
                  </div>
                )}
                {contact.phone && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Phone className="w-3 h-3" />
                    <span>{contact.phone}</span>
                  </div>
                )}
              </div>
              {contact.isPrimary && (
                <Badge variant="secondary" className="text-xs ml-2">Principal</Badge>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <div className="mb-2">
              <Mail className="w-8 h-8 mx-auto text-muted-foreground/50" />
            </div>
            <p>No hay contactos registrados</p>
            <p className="text-xs">Los contactos aparecerán aquí cuando se agreguen</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};