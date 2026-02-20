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
  loading?: boolean; // Add loading prop
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
  loading,
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
        <Label>Cliente *</Label>
        <ClientCombobox
          clients={clients}
          selectedClientId={selectedClientId}
          selectedClientName={selectedClientName} // Pass it down
          loading={loading} // Pass loading prop
          onSelect={onClientChange}
        />
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

// Internal Client Combobox Component
import { useState } from 'react';
import { Check, ChevronsUpDown, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

// Update Props to include selectedClientName
function ClientCombobox({
  clients,
  selectedClientId,
  selectedClientName, // Add this
  loading,
  onSelect
}: {
  clients: Client[];
  selectedClientId: string;
  selectedClientName?: string; // Add this
  loading?: boolean;
  onSelect: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const selectedClient = clients.find(c => c.id === selectedClientId);

  // Logic: Use found client name OR fallback name
  const displayName = selectedClient ? selectedClient.name : selectedClientName;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          disabled={loading}
        >
          {loading && !displayName ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Cargando clientes...</span>
            </div>
          ) : displayName ? (
            displayName
          ) : (
            "Seleccionar cliente..."
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0">
        <Command>
          <CommandInput placeholder="Buscar cliente..." />
          <CommandList>
            <CommandEmpty>No se encontraron clientes.</CommandEmpty>
            <CommandGroup>
              {clients.map((client) => (
                <CommandItem
                  key={client.id}
                  value={client.name}
                  onSelect={() => {
                    onSelect(client.id);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedClientId === client.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {client.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}