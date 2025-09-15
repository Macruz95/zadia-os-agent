'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useDistricts } from '../hooks/useDistricts';

interface DistrictsSelectProps {
  municipalityId?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function DistrictsSelect({
  municipalityId,
  value,
  onValueChange,
  placeholder = 'Seleccione un distrito',
  disabled = false
}: DistrictsSelectProps) {
  const { districts, loading, error } = useDistricts(municipalityId);

  if (!municipalityId) {
    return (
      <Select disabled>
        <SelectTrigger>
          <SelectValue placeholder="Seleccione un municipio primero" />
        </SelectTrigger>
      </Select>
    );
  }

  if (error) {
    return (
      <Select disabled>
        <SelectTrigger>
          <SelectValue placeholder="Error al cargar distritos" />
        </SelectTrigger>
      </Select>
    );
  }

  return (
    <Select
      value={value}
      onValueChange={onValueChange}
      disabled={disabled || loading || districts.length === 0}
    >
      <SelectTrigger>
        <SelectValue 
          placeholder={
            loading 
              ? 'Cargando distritos...' 
              : districts.length === 0 
              ? 'No hay distritos disponibles'
              : placeholder
          } 
        />
      </SelectTrigger>
      <SelectContent>
        {districts.map((district) => (
          <SelectItem key={district.id} value={district.id}>
            {district.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}