'use client';

import { useClientProfile } from '../hooks/use-client-profile';
import { ClientProfileHeader } from './ClientProfileHeader';
import { ClientInfoCard } from './ClientInfoCard';
import { ClientContactsCard } from './ClientContactsCard';
import { ClientTimeline } from './ClientTimeline';
import { ClientKPIsCard } from './ClientKPIsCard';
import { ClientSummaryCards } from './ClientSummaryCards';

interface ClientProfilePageProps {
  clientId: string;
  onBack?: () => void;
}

export const ClientProfilePage = ({ clientId, onBack }: ClientProfilePageProps) => {
  const { client, contacts, interactions, transactions, projects, quotes, meetings, tasks, loading, error } = useClientProfile(clientId);

  if (loading) {
    return <div className="flex items-center justify-center h-64">Cargando perfil del cliente...</div>;
  }

  if (error || !client) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error al cargar el perfil del cliente</p>
          <button
            onClick={onBack}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <ClientProfileHeader client={client} onBack={onBack} />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-9 gap-6">
        {/* Left Panel - Info and Contacts */}
        <div className="lg:col-span-3 space-y-6">
          <ClientInfoCard client={client} />
          <ClientContactsCard contacts={contacts} />
        </div>

        {/* Center Panel - Timeline */}
        <div className="lg:col-span-3">
          <ClientTimeline
            interactions={interactions}
            transactions={transactions}
            projects={projects}
            quotes={quotes}
            meetings={meetings}
            tasks={tasks}
          />
        </div>

        {/* Right Panel - KPIs and Summary */}
        <div className="lg:col-span-3 space-y-6">
          <ClientKPIsCard transactions={transactions} />
          <ClientSummaryCards
            projects={projects}
            quotes={quotes}
            tasks={tasks}
          />
        </div>
      </div>
    </div>
  );
};