'use client';

import { useParams, useRouter } from 'next/navigation';
import { ClientProfilePage } from '../../../../modules/clients/components/ClientProfilePage';
import { InteractionComposer } from '../../../../modules/clients/components/InteractionComposer';
import { ClientDocuments } from '../../../../modules/clients/components/ClientDocuments';
import { ClientPermanentNotes } from '../../../../modules/clients/components/ClientPermanentNotes';
import { useClientProfile } from '../../../../modules/clients/hooks/use-client-profile';
import { Button } from '../../../../components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function ClientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const clientId = params.id as string;
  const { client } = useClientProfile(clientId);

  const handleBack = () => {
    router.push('/clients');
  };

  const handleEdit = () => {
    router.push(`/clients/${clientId}/edit`);
  };

  const handleCreateQuote = () => {
    router.push(`/quotes/create?clientId=${clientId}`);
  };

  const handleCreateProject = () => {
    router.push(`/projects/create?clientId=${clientId}`);
  };

  const handleScheduleMeeting = () => {
    router.push(`/calendar/new?clientId=${clientId}&type=meeting`);
  };

  if (!clientId) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <p className="text-muted-foreground">Cliente no encontrado</p>
          <Button onClick={handleBack} className="mt-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al Directorio
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={handleBack}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver al Directorio
        </Button>
      </div>
      
      {/* Main Profile */}
      <ClientProfilePage
        clientId={clientId}
        onBack={handleBack}
        onEdit={handleEdit}
        onCreateQuote={handleCreateQuote}
        onCreateProject={handleCreateProject}
        onScheduleMeeting={handleScheduleMeeting}
      />

      {/* Interaction Composer + Docs + Notes */}
      {client && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          <div className="lg:col-span-2">
            <InteractionComposer
              clientId={clientId}
              clientName={client.name}
            />
          </div>
          <div className="space-y-6">
            <ClientPermanentNotes clientId={clientId} />
            <ClientDocuments clientId={clientId} />
          </div>
        </div>
      )}
    </div>
  );
}