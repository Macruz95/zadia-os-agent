'use client';

import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ClientType, ClientStatus } from '../types/clients.types';

interface ClientFiltersProps {
  searchQuery: string;
  selectedType: ClientType | 'all';
  selectedStatus: ClientStatus | 'all';
  onSearchChange: (query: string) => void;
  onTypeChange: (type: ClientType | 'all') => void;
  onStatusChange: (status: ClientStatus | 'all') => void;
}

export function ClientFilters({
  searchQuery,
  selectedType,
  selectedStatus,
  onSearchChange,
  onTypeChange,
  onStatusChange
}: ClientFiltersProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Buscar y Filtrar</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre, documento, email..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Select value={selectedType} onValueChange={onTypeChange}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Tipo de cliente" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los tipos</SelectItem>
              <SelectItem value="PersonaNatural">Persona Natural</SelectItem>
              <SelectItem value="Organización">Organización</SelectItem>
              <SelectItem value="Empresa">Empresa</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedStatus} onValueChange={onStatusChange}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              <SelectItem value="Potencial">Potencial</SelectItem>
              <SelectItem value="Activo">Activo</SelectItem>
              <SelectItem value="Inactivo">Inactivo</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}