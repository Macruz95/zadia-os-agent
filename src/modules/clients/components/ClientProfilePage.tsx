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
  onEdit?: () => void;
  onCreateQuote?: () => void;
  onCreateProject?: () => void;
  onScheduleMeeting?: () => void;
}

export const ClientProfilePage = ({
  clientId,
  onBack,
  onEdit,
  onCreateQuote,
  onCreateProject,
  onScheduleMeeting,
}: ClientProfilePageProps) => {
  const { client, contacts, interactions, transactions, projects, quotes, meetings, tasks, loading, error } = useClientProfile(clientId);

  if (loading) {
    return <div className="flex items-center justify-center h-64">Cargando perfil del cliente...</div>;
  }

  if (error || !client) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600 mb-4">
            {error ? `Error: ${error}` : 'Cliente no encontrado'}
          </p>
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
    <div className="p-6 space-y-6">
      {/* Header */}
      <ClientProfileHeader
        client={client}
        onBack={onBack}
        onEdit={onEdit}
        onCreateQuote={onCreateQuote}
        onCreateProject={onCreateProject}
        onScheduleMeeting={onScheduleMeeting}
      />

      {/* Main Content Grid - 2 Rows Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Info and KPIs */}
        <div className="space-y-6">
          <ClientInfoCard client={client} contacts={contacts} />
          <ClientKPIsCard 
            client={client}
            transactions={transactions}
            projects={projects}
            quotes={quotes}
          />
        </div>

        {/* Right Column - Contacts and Summary */}
        <div className="space-y-6">
          <ClientContactsCard contacts={contacts} clientName={client.name} />
          <ClientSummaryCards
            projects={projects}
            quotes={quotes}
            tasks={tasks}
          />
        </div>
      </div>

      {/* Bottom Row - Timeline takes full width */}
      <div className="w-full">
        <ClientTimeline
          interactions={interactions}
          transactions={transactions}
          projects={projects}
          quotes={quotes}
          meetings={meetings}
          tasks={tasks}
        />
      </div>
    </div>
  );
};