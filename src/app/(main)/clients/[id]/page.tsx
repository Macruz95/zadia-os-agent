'use client';

import { use } from 'react';
import { ClientProfilePage } from '@/modules/clients/components/ClientProfilePage';

interface ClientDetailPageProps {
    params: Promise<{
        id: string;
    }>;
}

export default function ClientDetailPage({ params }: ClientDetailPageProps) {
    const { id } = use(params);
    return <ClientProfilePage clientId={id} />;
}
