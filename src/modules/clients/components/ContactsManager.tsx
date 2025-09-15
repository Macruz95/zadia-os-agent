'use client';

import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Trash2, Phone, User, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Contact } from '../types/clients.types';
import { ContactSchema } from '../validations/clients.schema';
import { ContactsService } from '../services/entities/contacts-entity.service';
import { notificationService } from '@/lib/notifications';
import { z } from 'zod';

const ContactsFormSchema = z.object({
  contacts: z.array(ContactSchema.extend({
    id: z.string().optional() // For existing contacts
  }))
});

type ContactsFormData = z.infer<typeof ContactsFormSchema>;

interface ContactsManagerProps {
  clientId: string;
  initialContacts?: Contact[];
  onContactsChange?: (contacts: Contact[]) => void;
}

export function ContactsManager({ clientId, initialContacts = [], onContactsChange }: ContactsManagerProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [contacts, setContacts] = useState<Contact[]>(initialContacts);

  const form = useForm<ContactsFormData>({
    resolver: zodResolver(ContactsFormSchema),
    defaultValues: {
      contacts: initialContacts.map(contact => ({
        id: contact.id,
        name: contact.name,
        role: contact.role || '',
        email: contact.email || '',
        phone: contact.phone,
        phoneCountryId: contact.phoneCountryId || '',
        isPrimary: contact.isPrimary
      }))
    }
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'contacts'
  });

  // Load contacts when component mounts
  useEffect(() => {
    const loadContacts = async () => {
      if (clientId && initialContacts.length === 0) {
        try {
          setIsLoading(true);
          const loadedContacts = await ContactsService.getContactsByClient(clientId);
          setContacts(loadedContacts);
          
          // Reset form with loaded contacts
          form.reset({
            contacts: loadedContacts.map(contact => ({
              id: contact.id,
              name: contact.name,
              role: contact.role || '',
              email: contact.email || '',
              phone: contact.phone,
              phoneCountryId: contact.phoneCountryId || '',
              isPrimary: contact.isPrimary
            }))
          });
        } catch (error) {
          console.error('Error loading contacts:', error);
          notificationService.error('Error al cargar contactos');
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadContacts();
  }, [clientId, initialContacts.length, form]);

  const addContact = () => {
    append({
      name: '',
      role: '',
      email: '',
      phone: '',
      phoneCountryId: '',
      isPrimary: fields.length === 0 // First contact is primary by default
    });
  };

  const removeContact = async (index: number) => {
    const contactData = form.getValues(`contacts.${index}`);
    
    if (contactData.id) {
      // Delete existing contact from database
      try {
        await ContactsService.deleteContact(contactData.id);
        notificationService.success('Contacto eliminado');
      } catch (error) {
        console.error('Error deleting contact:', error);
        notificationService.error('Error al eliminar contacto');
        return;
      }
    }
    
    remove(index);
  };

  const saveContacts = async () => {
    try {
      setIsLoading(true);
      const formData = form.getValues();
      const updatedContacts: Contact[] = [];

      for (const contactData of formData.contacts) {
        if (!contactData.phone.trim()) continue; // Skip empty contacts

        if (contactData.id) {
          // Update existing contact
          await ContactsService.updateContact(contactData.id, {
            name: contactData.name || '',
            role: contactData.role,
            email: contactData.email,
            phone: contactData.phone || '',
            phoneCountryId: contactData.phoneCountryId,
            isPrimary: contactData.isPrimary || false
          });
          
          // Find the existing contact and update it
          const existingContact = contacts.find(c => c.id === contactData.id);
          if (existingContact) {
            Object.assign(existingContact, contactData);
            updatedContacts.push(existingContact);
          }
        } else {
          // Create new contact
          const newContactId = await ContactsService.createContact({
            clientId,
            name: contactData.name || '',
            role: contactData.role,
            email: contactData.email,
            phone: contactData.phone || '',
            phoneCountryId: contactData.phoneCountryId,
            isPrimary: contactData.isPrimary || false
          });

          const newContact: Contact = {
            id: newContactId,
            clientId,
            name: contactData.name || '',
            role: contactData.role,
            email: contactData.email,
            phone: contactData.phone || '',
            phoneCountryId: contactData.phoneCountryId,
            isPrimary: contactData.isPrimary || false,
            createdAt: new Date(),
            updatedAt: new Date()
          };
          updatedContacts.push(newContact);
        }
      }

      setContacts(updatedContacts);
      onContactsChange?.(updatedContacts);
      notificationService.success('Contactos guardados exitosamente');
    } catch (error) {
      console.error('Error saving contacts:', error);
      notificationService.error('Error al guardar contactos');
    } finally {
      setIsLoading(false);
    }
  };

  const setPrimaryContact = (index: number) => {
    const formData = form.getValues();
    
    // Set all contacts to non-primary
    formData.contacts.forEach((_, i) => {
      form.setValue(`contacts.${i}.isPrimary`, i === index);
    });
  };

  if (isLoading && fields.length === 0) {
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
              <div key={field.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Contacto {index + 1}</span>
                    {form.watch(`contacts.${index}.isPrimary`) && (
                      <Badge variant="default" className="gap-1">
                        <Star className="w-3 h-3" />
                        Principal
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {!form.watch(`contacts.${index}.isPrimary`) && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setPrimaryContact(index)}
                      >
                        <Star className="w-3 h-3" />
                        Marcar principal
                      </Button>
                    )}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeContact(index)}
                      disabled={fields.length === 1}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <FormField
                    control={form.control}
                    name={`contacts.${index}.name`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre</FormLabel>
                        <FormControl>
                          <Input placeholder="Nombre completo" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`contacts.${index}.role`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cargo</FormLabel>
                        <FormControl>
                          <Input placeholder="Ej: Gerente, Director" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`contacts.${index}.phone`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Teléfono *</FormLabel>
                        <FormControl>
                          <Input placeholder="+503 0000-0000" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`contacts.${index}.email`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="email@empresa.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
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