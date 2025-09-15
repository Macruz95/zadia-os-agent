'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useClients } from '../hooks/use-clients';
import { Client, ClientType, ClientStatus } from '../types/clients.types';
import { deleteClient } from '../services/clients.service';
import { showToast } from '@/lib/toast';
import { ClientHeader } from './ClientHeader';
import { ClientFilters } from './ClientFilters';
import { ClientTable } from './ClientTable';

interface ClientDirectoryProps {
  onClientSelect?: (client: Client) => void;
  onCreateClient?: () => void;
}

export function ClientDirectory({ onClientSelect, onCreateClient }: ClientDirectoryProps) {
  const { clients, loading, error, updateSearchParams } = useClients({
    sortBy: 'lastInteractionDate',
    sortOrder: 'desc',
    pageSize: 20,
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<ClientType | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<ClientStatus | 'all'>('all');

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    updateSearchParams({
      query,
      filters: {
        clientType: selectedType !== 'all' ? selectedType : undefined,
        status: selectedStatus !== 'all' ? selectedStatus : undefined,
      },
    });
  };

  const handleTypeFilter = (type: ClientType | 'all') => {
    setSelectedType(type);
    updateSearchParams({
      query: searchQuery,
      filters: {
        clientType: type !== 'all' ? type : undefined,
        status: selectedStatus !== 'all' ? selectedStatus : undefined,
      },
    });
  };

  const handleStatusFilter = (status: ClientStatus | 'all') => {
    setSelectedStatus(status);
    updateSearchParams({
      query: searchQuery,
      filters: {
        clientType: selectedType !== 'all' ? selectedType : undefined,
        status: status !== 'all' ? status : undefined,
      },
    });
  };

  const handleDeleteClient = async (clientId: string) => {
    if (confirm('¿Está seguro de que desea eliminar este cliente? Esta acción no se puede deshacer.')) {
      try {
        await deleteClient(clientId);
        showToast.success('Cliente eliminado exitosamente');
        // Refresh the clients list
        updateSearchParams({});
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Error al eliminar el cliente';
        showToast.error(message);
      }
    }
  };

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            Error al cargar clientes: {error}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <ClientHeader onCreateClient={onCreateClient} />
      
      <ClientFilters
        searchQuery={searchQuery}
        selectedType={selectedType}
        selectedStatus={selectedStatus}
        onSearchChange={handleSearch}
        onTypeChange={handleTypeFilter}
        onStatusChange={handleStatusFilter}
      />
      
      <ClientTable
        clients={clients}
        loading={loading}
        onClientSelect={onClientSelect}
        onDeleteClient={handleDeleteClient}
      />
    </div>
  );
}