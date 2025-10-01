/**
 * ZADIA OS - Lead Profile Page
 * 
 * Individual lead details page
 */

import { LeadProfile } from '@/modules/sales/components/leads/LeadProfile';

interface LeadPageProps {
  params: Promise<{ id: string }>;
}

export default async function LeadPage({ params }: LeadPageProps) {
  const { id } = await params;
  return <LeadProfile leadId={id} />;
}