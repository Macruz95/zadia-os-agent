'use client';

import { useRouter } from 'next/navigation';
import { ClientCreationForm } from '../../../../modules/clients/components/ClientCreationForm';
import { Button } from '../../../../components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function CreateClientPage() {
  const router = useRouter();

  const handleSuccess = () => {
    router.push('/clients');
  };

  const handleCancel = () => {
    router.push('/clients');
  };

  const handleBack = () => {
    router.push('/clients');
  };

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
        <h1 className="text-2xl font-bold">Crear Nuevo Cliente</h1>
      </div>
      <ClientCreationForm
        onSuccess={handleSuccess}
        onCancel={handleCancel}
      />
    </div>
  );
}