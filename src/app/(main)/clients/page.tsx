'use client';

import { ClientDirectory } from '../../../modules/clients/components/ClientDirectory';
import { ClientKPIsGrid } from '../../../modules/clients/components/ClientKPIsGrid';
import { useClients } from '../../../modules/clients/hooks/use-clients';

export default function ClientsPage() {
  const { clients, loading } = useClients({
    sortBy: 'lastInteractionDate',
    sortOrder: 'desc',
  });

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* KPIs Grid */}
      <ClientKPIsGrid clients={clients} loading={loading} />
      
      {/* Client Directory */}
      <ClientDirectory />
    </div>
  );
}