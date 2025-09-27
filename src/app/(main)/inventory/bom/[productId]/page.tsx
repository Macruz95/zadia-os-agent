import { BOMManagementPage } from '@/modules/inventory/components/bom/BOMManagementPage';

interface BOMPageProps {
  params: Promise<{
    productId: string;
  }>;
}

export default async function BOMPage({ params }: BOMPageProps) {
  const resolvedParams = await params;
  
  return (
    <BOMManagementPage productId={resolvedParams.productId} />
  );
}