import { InventoryDetailClient } from './InventoryDetailClient';

interface InventoryDetailPageProps {
  params: Promise<{
    type: 'raw-materials' | 'finished-products';
    id: string;
  }>;
}

export default async function InventoryDetailPage({ params }: InventoryDetailPageProps) {
  const resolvedParams = await params;
  
  return (
    <InventoryDetailClient 
      type={resolvedParams.type}
      id={resolvedParams.id}
    />
  );
}