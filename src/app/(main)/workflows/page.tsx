/**
 * ZADIA OS - Workflows Page
 * Página principal de Biblioteca de Flujos Cognitivos
 */

import { WorkflowGallery } from '@/modules/workflows/components/WorkflowGallery';

export default function WorkflowsPage() {
  return (
    <div className="container mx-auto p-6">
      <WorkflowGallery />
    </div>
  );
}

