/**
 * ZADIA OS - Documents List Component
 * Lista de documentos del proyecto con grid
 * Rule #5: Max 200 lines per file
 */

'use client';

import { DocumentCard } from './DocumentCard';
import type { ProjectDocument } from '../types/projects.types';

interface DocumentsListProps {
  documents: ProjectDocument[];
  loading: boolean;
  onDelete: (documentId: string, fullPath: string) => void;
}

export function DocumentsList({
  documents,
  loading,
  onDelete,
}: DocumentsListProps) {
  if (loading) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Cargando documentos...
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No hay documentos subidos
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {documents.map((doc) => (
        <DocumentCard
          key={doc.id}
          document={doc}
          onDelete={() => onDelete(doc.id, doc.fullPath)}
        />
      ))}
    </div>
  );
}
