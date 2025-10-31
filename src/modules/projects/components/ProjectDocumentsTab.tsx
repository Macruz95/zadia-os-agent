/**
 * ZADIA OS - Project Documents Tab
 * Tab para gestión de documentos del proyecto
 * Rule #4: Modular components
 * Rule #5: Max 200 lines per file
 */

'use client';

import { useState } from 'react';
import { Plus, Upload } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useProjectDocuments } from '../hooks/use-project-documents';
import { DocumentsList } from './DocumentsList';
import { DocumentUploadDialog } from './DocumentUploadDialog';
import type { DocumentType } from '../types/projects.types';

interface ProjectDocumentsTabProps {
  projectId: string;
  userId: string;
  userName: string;
}

export function ProjectDocumentsTab({
  projectId,
  userId,
  userName,
}: ProjectDocumentsTabProps) {
  const {
    documents,
    loading,
    uploadProgress,
    isUploading,
    uploadFile,
    removeDocument,
  } = useProjectDocuments(projectId);

  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);

  const handleUpload = async (
    file: File,
    documentType: DocumentType,
    description?: string,
    tags?: string[]
  ) => {
    await uploadFile(file, documentType, userId, userName, description, tags);
    setIsUploadDialogOpen(false);
  };

  // Estadísticas por tipo de documento
  const documentsByType = documents.reduce((acc, doc) => {
    acc[doc.documentType] = (acc[doc.documentType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      {/* Header con estadísticas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Documentos del Proyecto</span>
            <Button onClick={() => setIsUploadDialogOpen(true)} disabled={isUploading}>
              <Plus className="mr-2 h-4 w-4" />
              Subir Documento
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <StatCard label="Total" value={documents.length} />
            <StatCard label="Contratos" value={documentsByType.contract || 0} />
            <StatCard label="Cotizaciones" value={documentsByType.quote || 0} />
            <StatCard label="Facturas" value={documentsByType.invoice || 0} />
            <StatCard label="Planos" value={documentsByType.blueprint || 0} />
            <StatCard label="Otros" value={documentsByType.other || 0} />
          </div>

          {/* Upload Progress */}
          {isUploading && (
            <div className="mt-4 space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Upload className="h-4 w-4 animate-pulse" />
                <span>Subiendo documento... {uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Documents List */}
      <DocumentsList
        documents={documents}
        loading={loading}
        onDelete={removeDocument}
      />

      {/* Upload Dialog */}
      <DocumentUploadDialog
        open={isUploadDialogOpen}
        onOpenChange={setIsUploadDialogOpen}
        onUpload={handleUpload}
      />
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: number;
}

function StatCard({ label, value }: StatCardProps) {
  return (
    <div className="text-center p-3 border rounded-lg">
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}
