'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useClients } from '../hooks/use-clients';
import { Client, ClientType, ClientStatus } from '../types/clients.types';
import { deleteClient } from '../services/clients.service';
import { notificationService } from '@/lib/notifications';
import { ClientHeader } from './ClientHeader';
import { ClientFilters } from './ClientFilters';
import { ClientTable } from './ClientTable';
import { DeleteClientDialog } from './DeleteClientDialog';
import { EditClientDialog } from './EditClientDialog';

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
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; client: Client | null }>({
    open: false,
    client: null,
  });
  const [editDialog, setEditDialog] = useState<{ open: boolean; client: Client | null }>({
    open: false,
    client: null,
  });

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

  const handleDeleteClient = async (client: Client) => {
    setDeleteDialog({ open: true, client });
  };

  const handleEditClient = (client: Client) => {
    setEditDialog({ open: true, client });
  };

  const confirmDelete = async () => {
    if (!deleteDialog.client) return;
    
    try {
      await deleteClient(deleteDialog.client.id);
      notificationService.success('Cliente eliminado exitosamente');
      updateSearchParams({});
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al eliminar el cliente';
      notificationService.error(message);
    } finally {
      setDeleteDialog({ open: false, client: null });
    }
  };

  const handleEditSuccess = () => {
    updateSearchParams({});
    setEditDialog({ open: false, client: null });
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
        onEditClient={handleEditClient}
      />
      
      <DeleteClientDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ open, client: null })}
        onConfirm={confirmDelete}
        clientName={deleteDialog.client?.name || ''}
      />
      
      {editDialog.client && (
        <EditClientDialog
          open={editDialog.open}
          onOpenChange={(open) => setEditDialog({ open, client: null })}
          client={editDialog.client}
          onSuccess={handleEditSuccess}
        />
      )}
    </div>
  );
}