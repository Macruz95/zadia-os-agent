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
import { DepartmentsService } from '../services/departments.service';
import { Department } from '../types/departments.types';

interface DepartmentsSelectProps {
  value?: string;
  onValueChange: (value: string) => void;
  countryId?: string;
  placeholder?: string;
  disabled?: boolean;
}

export function DepartmentsSelect({
  value,
  onValueChange,
  countryId,
  placeholder = "Seleccionar departamento...",
  disabled = false
}: DepartmentsSelectProps) {
  const [open, setOpen] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!countryId) {
      setDepartments([]);
      return;
    }

    const fetchDepartments = async () => {
      try {
        setLoading(true);
        const data = await DepartmentsService.getDepartmentsByCountry(countryId);
        setDepartments(data);
      } catch {
        // Error silencioso - el estado loading se controla en el hook
      } finally {
        setLoading(false);
      }
    };

    fetchDepartments();
  }, [countryId]);

  const selectedDepartment = departments.find((department) => department.id === value);

  const isDisabled = disabled || !countryId || loading;

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
          ) : selectedDepartment ? (
            selectedDepartment.name
          ) : countryId ? (
            placeholder
          ) : (
            'Seleccione un país primero'
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder="Buscar departamento..." />
          <CommandList>
            <CommandEmpty>
              {countryId ? 'No se encontraron departamentos.' : 'Seleccione un país primero'}
            </CommandEmpty>
            <CommandGroup>
              {departments.map((department) => (
                <CommandItem
                  key={department.id}
                  value={department.name}
                  onSelect={() => {
                    console.log('DepartmentsSelect onSelect - department.id:', department.id);
                    onValueChange(department.id === value ? "" : department.id);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === department.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <span>{department.name}</span>
                  {department.code && (
                    <span className="text-muted-foreground ml-2">({department.code})</span>
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