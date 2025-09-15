'use client';

import { useState } from 'react';
import { ClientDirectory } from '../../../modules/clients/components/ClientDirectory';
import { ClientCreationForm } from '../../../modules/clients/components/ClientCreationForm';
import { ClientProfilePage } from '@/modules/clients/components/ClientProfilePage';
import { Client } from '../../../modules/clients/types/clients.types';
import { Button } from '../../../components/ui/button';
import { ArrowLeft } from 'lucide-react';

type ViewState = 'directory' | 'create' | 'profile';

export default function ClientsPage() {
  const [currentView, setCurrentView] = useState<ViewState>('directory');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  const handleClientSelect = (client: Client) => {
    setSelectedClient(client);
    setCurrentView('profile');
  };

  const handleCreateClient = () => {
    setCurrentView('create');
  };

  const handleBackToDirectory = () => {
    setCurrentView('directory');
    setSelectedClient(null);
  };

  const handleFormSuccess = () => {
    setCurrentView('directory');
  };

  const handleFormCancel = () => {
    setCurrentView('directory');
  };

  if (currentView === 'create') {
    return (
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={handleBackToDirectory}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al Directorio
          </Button>
          <h1 className="text-2xl font-bold">Crear Nuevo Cliente</h1>
        </div>
        <ClientCreationForm
          onSuccess={handleFormSuccess}
          onCancel={handleFormCancel}
        />
      </div>
    );
  }

  if (currentView === 'profile' && selectedClient) {
    return (
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={handleBackToDirectory}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al Directorio
          </Button>
        </div>
        <ClientProfilePage
          clientId={selectedClient.id}
          onBack={handleBackToDirectory}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <ClientDirectory
        onClientSelect={handleClientSelect}
        onCreateClient={handleCreateClient}
      />
    </div>
  );
}