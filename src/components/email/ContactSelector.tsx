'use client';

import { Mail } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Contact } from '../../modules/clients/types/clients.types';

interface ContactSelectorProps {
  contacts: Contact[];
  selectedContacts: string[];
  onSelectionChange: (contactIds: string[]) => void;
}

export function ContactSelector({ contacts, selectedContacts, onSelectionChange }: ContactSelectorProps) {
  const contactsWithEmail = contacts.filter(contact => contact.email && contact.email.trim() !== '');

  if (contactsWithEmail.length === 0) {
    return (
      <div className="text-center py-6 text-muted-foreground">
        <Mail className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
        <p>No hay contactos con dirección de email válida</p>
      </div>
    );
  }

  const handleContactToggle = (contactId: string, checked: boolean) => {
    if (checked) {
      onSelectionChange([...selectedContacts, contactId]);
    } else {
      onSelectionChange(selectedContacts.filter(id => id !== contactId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelectionChange(contactsWithEmail.map(contact => contact.id));
    } else {
      onSelectionChange([]);
    }
  };

  const allSelected = contactsWithEmail.length > 0 && selectedContacts.length === contactsWithEmail.length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">Seleccionar destinatarios:</Label>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="select-all"
            checked={allSelected}
            onCheckedChange={handleSelectAll}
          />
          <Label htmlFor="select-all" className="text-sm">
            Seleccionar todos ({contactsWithEmail.length})
          </Label>
        </div>
      </div>

      <div className="space-y-2 max-h-40 overflow-y-auto border rounded-md p-3">
        {contactsWithEmail.map((contact) => (
          <div key={contact.id} className="flex items-center space-x-3">
            <Checkbox
              id={`contact-${contact.id}`}
              checked={selectedContacts.includes(contact.id)}
              onCheckedChange={(checked) => handleContactToggle(contact.id, checked as boolean)}
            />
            <div className="flex-1 min-w-0">
              <Label
                htmlFor={`contact-${contact.id}`}
                className="text-sm font-medium cursor-pointer"
              >
                {contact.name || 'Sin nombre'}
              </Label>
              <p className="text-xs text-muted-foreground truncate">
                {contact.email}
              </p>
              {contact.role && (
                <Badge variant="outline" className="text-xs">
                  {contact.role}
                </Badge>
              )}
            </div>
          </div>
        ))}
      </div>

      {selectedContacts.length > 0 && (
        <div className="text-sm text-muted-foreground">
          {selectedContacts.length} contacto{selectedContacts.length > 1 ? 's' : ''} seleccionado{selectedContacts.length > 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
}