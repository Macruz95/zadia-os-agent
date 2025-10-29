import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Client } from '@/modules/clients/types/clients.types';

interface QuoteClientSelectorProps {
  clients: Client[];
  selectedClientId: string;
  selectedClientName?: string;
  contacts: Array<{ id: string; name: string; position?: string }>;
  selectedContactId: string;
  mode: 'opportunity' | 'direct';
  onClientChange: (clientId: string) => void;
  onContactChange: (contactId: string) => void;
}

export function QuoteClientSelector({
  clients,
  selectedClientId,
  selectedClientName,
  contacts,
  selectedContactId,
  mode,
  onClientChange,
  onContactChange,
}: QuoteClientSelectorProps) {
  if (mode === 'opportunity') {
    return (
      <>
        {/* Cliente (read-only when from opportunity) */}
        {selectedClientName && (
          <div className="space-y-2">
            <Label>Cliente</Label>
            <div className="flex h-10 items-center rounded-md border border-input bg-muted px-3 py-2 text-sm">
              {selectedClientName}
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <>
      {/* Direct Mode - Client Selection */}
      <div className="space-y-2">
        <Label htmlFor="client-select">Cliente *</Label>
        <Select value={selectedClientId} onValueChange={onClientChange}>
          <SelectTrigger id="client-select">
            <SelectValue placeholder="Seleccionar cliente..." />
          </SelectTrigger>
          <SelectContent>
            {clients.length === 0 ? (
              <div className="p-2 text-sm text-muted-foreground">
                No hay clientes disponibles
              </div>
            ) : (
              clients.map((client) => (
                <SelectItem key={client.id} value={client.id}>
                  {client.name}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      </div>

      {selectedClientId && (
        <div className="space-y-2">
          <Label htmlFor="contact-select">Contacto *</Label>
          <Select value={selectedContactId} onValueChange={onContactChange}>
            <SelectTrigger id="contact-select">
              <SelectValue placeholder="Seleccionar contacto..." />
            </SelectTrigger>
            <SelectContent>
              {contacts.length === 0 ? (
                <div className="p-2 text-sm text-muted-foreground">
                  No hay contactos disponibles
                </div>
              ) : (
                contacts.map((contact) => (
                  <SelectItem key={contact.id} value={contact.id}>
                    {contact.name}
                    {contact.position && ` - ${contact.position}`}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>
      )}
    </>
  );
}