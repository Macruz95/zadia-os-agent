import { useState, useEffect, useCallback } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Contact } from '../types/clients.types';
import { ContactSchema } from '../validations/clients.schema';
import { ContactsService } from '../services/entities/contacts-entity.service';
import { notificationService } from '@/lib/notifications';

const ContactsFormSchema = z.object({
  contacts: z.array(ContactSchema.extend({
    id: z.string().optional() // For existing contacts
  }))
});

type ContactsFormData = z.infer<typeof ContactsFormSchema>;

interface UseContactsManagerProps {
  clientId: string;
  initialContacts?: Contact[];
  onContactsChange?: (contacts: Contact[]) => void;
}

export function useContactsManager({ 
  clientId, 
  initialContacts = [], 
  onContactsChange 
}: UseContactsManagerProps) {
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
            contacts: loadedContacts.map((contact: Contact) => ({
              id: contact.id,
              name: contact.name,
              role: contact.role || '',
              email: contact.email || '',
              phone: contact.phone,
              phoneCountryId: contact.phoneCountryId || '',
              isPrimary: contact.isPrimary
            }))
          });
        } catch {
          notificationService.error('Error al cargar contactos');
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadContacts();
  }, [clientId, initialContacts.length, form]);

  const addContact = useCallback(() => {
    append({
      name: '',
      role: '',
      email: '',
      phone: '',
      phoneCountryId: '',
      isPrimary: fields.length === 0 // First contact is primary by default
    });
  }, [append, fields.length]);

  const removeContact = useCallback(async (index: number) => {
    const contactData = form.getValues(`contacts.${index}`);
    
    if (contactData.id) {
      // Delete existing contact from database
      try {
        await ContactsService.deleteContact(contactData.id);
        notificationService.success('Contacto eliminado');
      } catch {
        notificationService.error('Error al eliminar contacto');
        return;
      }
    }
    
    remove(index);
  }, [form, remove]);

  const setPrimaryContact = useCallback((index: number) => {
    const allContacts = form.getValues('contacts');
    
    // Set all contacts to non-primary
    allContacts.forEach((_, i) => {
      form.setValue(`contacts.${i}.isPrimary`, false);
    });
    
    // Set selected contact as primary
    form.setValue(`contacts.${index}.isPrimary`, true);
  }, [form]);

  const saveContacts = useCallback(async () => {
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
            phone: contactData.phone,
            phoneCountryId: contactData.phoneCountryId,
            isPrimary: contactData.isPrimary
          });

          updatedContacts.push({
            id: newContactId,
            clientId,
            name: contactData.name || '',
            role: contactData.role,
            email: contactData.email,
            phone: contactData.phone,
            phoneCountryId: contactData.phoneCountryId,
            isPrimary: contactData.isPrimary,
            createdAt: new Date(),
            updatedAt: new Date()
          });
        }
      }

      setContacts(updatedContacts);
      onContactsChange?.(updatedContacts);
      notificationService.success('Contactos guardados exitosamente');
    } catch {
      notificationService.error('Error al guardar contactos');
    } finally {
      setIsLoading(false);
    }
  }, [form, contacts, clientId, onContactsChange]);

  return {
    form,
    fields,
    isLoading,
    contacts,
    addContact,
    removeContact,
    setPrimaryContact,
    saveContacts
  };
}