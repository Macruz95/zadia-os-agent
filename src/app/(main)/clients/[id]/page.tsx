'use client';

import { useParams, useRouter } from 'next/navigation';
import { ClientProfilePage } from '../../../../modules/clients/components/ClientProfilePage';
import { Button } from '../../../../components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function ClientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const clientId = params.id as string;

  const handleBack = () => {
    router.push('/clients');
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
      <ClientProfilePage
        clientId={clientId}
        onBack={handleBack}
      />
    </div>
  );
}