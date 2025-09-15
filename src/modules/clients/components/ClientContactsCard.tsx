'use client';

import { useState } from 'react';
import { Mail, Phone, Send } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Contact } from '../types/clients.types';
import { SendEmailDialog } from '../../../components/SendEmailDialog';

interface ClientContactsCardProps {
  contacts: Contact[];
  clientName?: string;
}

interface ClientContactsCardProps {
  contacts: Contact[];
}

export const ClientContactsCard = ({ contacts, clientName }: ClientContactsCardProps) => {
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);

  console.log('👥 ClientContactsCard contacts:', contacts);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Contactos</CardTitle>
          {contacts && contacts.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEmailDialogOpen(true)}
              className="gap-2"
            >
              <Send className="w-4 h-4" />
              Enviar Correo
            </Button>
          )}
        </div>
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

      <SendEmailDialog
        open={emailDialogOpen}
        onOpenChange={setEmailDialogOpen}
        contacts={contacts || []}
        clientName={clientName || 'Cliente'}
      />
    </Card>
  );
};