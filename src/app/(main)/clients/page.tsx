'use client';

import { ClientDirectory } from '@/modules/clients';

/**
 * ZADIA OS - Clients Page
 * 
 * Main clients directory page
 */
export default function ClientsPage() {
  return (
    <div className="p-6 space-y-6">
      <ClientDirectory />
    </div>
  );
}
