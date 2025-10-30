'use client';

import { ClientDirectory } from '@/modules/clients';

/**
 * ZADIA OS - Clients Page
 * 
 * Main clients directory page
 */
export default function ClientsPage() {
  return (
    <div className="space-y-6">
      <ClientDirectory />
    </div>
  );
}
