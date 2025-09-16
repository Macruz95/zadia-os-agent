'use client';

import { Plus, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form } from '@/components/ui/form';
import { Contact } from '../types/clients.types';
import { useContactsManager } from '../hooks/use-contacts-manager';
import { ContactFormField } from './contacts/ContactFormField';

interface ContactsManagerProps {
  clientId: string;
  initialContacts?: Contact[];
  onContactsChange?: (contacts: Contact[]) => void;
}

export function ContactsManager({ clientId, initialContacts = [], onContactsChange }: ContactsManagerProps) {
  const {
    form,
    fields,
    isLoading,
    addContact,
    removeContact,
    setPrimaryContact,
    saveContacts
  } = useContactsManager({ clientId, initialContacts, onContactsChange });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="w-5 h-5" />
            Contactos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Phone className="w-5 h-5" />
          Contactos
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Form {...form}>
          <div className="space-y-4">
            {fields.map((field, index) => (
              <ContactFormField
                key={field.id}
                control={form.control}
                index={index}
                isPrimary={form.watch(`contacts.${index}.isPrimary`)}
                onRemove={() => removeContact(index)}
                onSetPrimary={() => setPrimaryContact(index)}
                canRemove={fields.length > 1}
              />
            ))}

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={addContact}
                className="flex-1"
              >
                <Plus className="w-4 h-4 mr-2" />
                Agregar Contacto
              </Button>

              <Button
                type="button"
                onClick={saveContacts}
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading ? 'Guardando...' : 'Guardar Contactos'}
              </Button>
            </div>
          </div>
        </Form>
      </CardContent>
    </Card>
  );
}