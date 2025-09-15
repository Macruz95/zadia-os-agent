'use client';

import { useState, useEffect } from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
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
import { MunicipalitiesService } from '../services/municipalities.service';
import { Municipality } from '../types/municipalities.types';

interface MunicipalitiesSelectProps {
  value?: string;
  onValueChange: (value: string) => void;
  departmentId?: string;
  placeholder?: string;
  disabled?: boolean;
}

export function MunicipalitiesSelect({
  value,
  onValueChange,
  departmentId,
  placeholder = "Seleccionar municipio...",
  disabled = false
}: MunicipalitiesSelectProps) {
  const [open, setOpen] = useState(false);
  const [municipalities, setMunicipalities] = useState<Municipality[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    console.log('MunicipalitiesSelect useEffect triggered with departmentId:', departmentId);
    if (!departmentId) {
      console.log('No departmentId provided, clearing municipalities');
      setMunicipalities([]);
      return;
    }

    const fetchMunicipalities = async () => {
      try {
        console.log('Fetching municipalities for departmentId:', departmentId);
        setLoading(true);
        const data = await MunicipalitiesService.getMunicipalitiesByDepartment(departmentId);
        console.log('Fetched municipalities:', data);
        setMunicipalities(data);
      } catch (error) {
        console.error('Error fetching municipalities:', error);
        // Error silencioso - el estado loading se controla en el hook
      } finally {
        setLoading(false);
      }
    };

    fetchMunicipalities();
  }, [departmentId]);

  const selectedMunicipality = municipalities.find((municipality) => municipality.id === value);

  const isDisabled = disabled || !departmentId || loading;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          disabled={isDisabled}
        >
          {loading ? (
            'Cargando...'
          ) : selectedMunicipality ? (
            selectedMunicipality.name
          ) : departmentId ? (
            placeholder
          ) : (
            'Seleccione un departamento primero'
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder="Buscar municipio..." />
          <CommandList>
            <CommandEmpty>
              {departmentId ? 'No se encontraron municipios.' : 'Seleccione un departamento primero'}
            </CommandEmpty>
            <CommandGroup>
              {municipalities.map((municipality) => (
                <CommandItem
                  key={municipality.id}
                  value={municipality.name}
                  onSelect={() => {
                    onValueChange(municipality.id === value ? "" : municipality.id);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === municipality.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <span>{municipality.name}</span>
                  {municipality.postalCode && (
                    <span className="text-muted-foreground ml-2">({municipality.postalCode})</span>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}