'use client';

import { Mail, Phone } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Contact } from '../types/clients.types';

interface ClientContactsCardProps {
  contacts: Contact[];
}

export const ClientContactsCard = ({ contacts }: ClientContactsCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Contactos</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {contacts.map((contact: Contact) => (
          <div key={contact.id} className="flex items-center justify-between p-3 border rounded-lg">
            <div className="space-y-1">
              <p className="font-medium text-sm">{contact.name}</p>
              {contact.role && (
                <p className="text-xs text-muted-foreground">{contact.role}</p>
              )}
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Mail className="w-3 h-3" />
                <span>{contact.email}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Phone className="w-3 h-3" />
                <span>{contact.phone}</span>
              </div>
            </div>
            {contact.isPrimary && (
              <Badge variant="secondary" className="text-xs">Principal</Badge>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
};