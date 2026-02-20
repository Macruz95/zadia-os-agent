'use client';

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
import { useState } from 'react';
import type { Lead } from '../../../types/sales.types';

interface QuoteLeadSelectorProps {
    leads: Lead[];
    selectedLeadId: string;
    selectedLeadName?: string; // Add this prop
    loading?: boolean;
    onLeadChange: (leadId: string) => void;
}

export function QuoteLeadSelector({
    leads,
    selectedLeadId,
    selectedLeadName, // Destructure
    loading,
    onLeadChange,
}: QuoteLeadSelectorProps) {
    const [open, setOpen] = useState(false);

    const selectedLead = leads.find((l) => l.id === selectedLeadId);

    // Use found lead name OR fallback name
    const displayName = selectedLead
        ? (selectedLead.fullName || selectedLead.entityName)
        : selectedLeadName;

    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <label className="text-sm font-medium">Seleccionar Prospecto (Lead)</label>
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
                                    <span>Cargando prospectos...</span>
                                </div>
                            ) : displayName ? (
                                <span>{displayName}</span>
                            ) : (
                                <span className="text-muted-foreground">Buscar prospecto...</span>
                            )}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[400px] p-0">
                        <Command>
                            <CommandInput placeholder="Buscar por nombre..." />
                            <CommandList>
                                <CommandEmpty>No se encontraron prospectos.</CommandEmpty>
                                <CommandGroup>
                                    {leads.map((lead) => (
                                        <CommandItem
                                            key={lead.id}
                                            value={lead.fullName || lead.entityName || lead.id}
                                            onSelect={() => {
                                                onLeadChange(lead.id);
                                                setOpen(false);
                                            }}
                                        >
                                            <Check
                                                className={cn(
                                                    "mr-2 h-4 w-4",
                                                    selectedLeadId === lead.id ? "opacity-100" : "opacity-0"
                                                )}
                                            />
                                            <div className="flex flex-col">
                                                <span>{lead.fullName || lead.entityName}</span>
                                                <span className="text-xs text-muted-foreground">
                                                    {lead.entityType === 'person' ? 'Persona' : 'Empresa'} • {lead.email || 'Sin email'}
                                                </span>
                                            </div>
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            </CommandList>
                        </Command>
                    </PopoverContent>
                </Popover>
            </div>
        </div>
    );
}
