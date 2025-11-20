'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';
import { storage } from '@/lib/firebase';
import { Progress } from '@/components/ui/progress';
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  listAll,
  getMetadata
} from 'firebase/storage';
import {
  DocumentsHeader,
  DocumentsEmptyState,
  DocumentsList,
} from './components';

/**
 * ProjectDocumentsTab - Gestión de documentos del proyecto (Modular)
 * Rule #1: Firebase Storage integration completa
 * Rule #2: ShadCN UI + Lucide icons
 * Rule #5: Componentes modulares <200 lines
 */

interface ProjectDocument {
  id: string;
  name: string;
  type: string;
  category: 'contract' | 'drawing' | 'photo' | 'report' | 'other';
  size: number;
  uploadedAt: Date;
  uploadedBy: string;
  url: string;
}

interface ProjectDocumentsTabProps {
  projectId: string;
}

export function ProjectDocumentsTab({ projectId }: ProjectDocumentsTabProps) {
  const [documents, setDocuments] = useState<ProjectDocument[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(false);

  // Cargar documentos al montar el componente
  useEffect(() => {
    loadDocuments();
  }, [projectId]);

  const loadDocuments = async () => {
    setLoading(true);
    try {
      const storageRef = ref(storage, `projects/${projectId}/documents`);
      const result = await listAll(storageRef);

      const docs: ProjectDocument[] = await Promise.all(
        result.items.map(async (itemRef) => {
          const url = await getDownloadURL(itemRef);
          const metadata = await getMetadata(itemRef);

          return {
            id: itemRef.name,
            name: itemRef.name,
            type: metadata.contentType || 'unknown',
            category: (metadata.customMetadata?.category as ProjectDocument['category']) || 'other',
            size: metadata.size || 0,
            uploadedAt: metadata.timeCreated ? new Date(metadata.timeCreated) : new Date(),
            uploadedBy: metadata.customMetadata?.uploadedBy || 'Unknown',
            url,
          };
        })
      );

      setDocuments(docs);
      logger.info('Documents loaded successfully', { projectId, metadata: { count: docs.length } });
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Error loading documents');
      logger.error('Error loading documents', err, { projectId });
      toast.error('Error al cargar documentos');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      // Upload files one by one to track progress
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const timestamp = Date.now();
        const fileName = `${timestamp}_${file.name}`;
        const storageRef = ref(storage, `projects/${projectId}/documents/${fileName}`);

        const uploadTask = uploadBytesResumable(storageRef, file, {
          customMetadata: {
            category: selectedCategory === 'all' ? 'other' : selectedCategory,
            uploadedBy: 'current-user', // TODO: Get from auth context
          }
        });

        // Track upload progress
        await new Promise<void>((resolve, reject) => {
          uploadTask.on(
            'state_changed',
            (snapshot) => {
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              setUploadProgress(Math.round(progress));
            },
            (error) => reject(error),
            () => resolve()
          );
        });
      }

      toast.success(`${files.length} archivo(s) subido(s) exitosamente`);
      logger.info('Files uploaded successfully', {
        projectId,
        metadata: { count: files.length }
      });

      // Recargar lista de documentos
      await loadDocuments();
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Error uploading files');
      logger.error('Error uploading files', err, { projectId });
      toast.error('Error al subir archivos');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDownload = async (doc: ProjectDocument) => {
    try {
      window.open(doc.url, '_blank');
      logger.info('Document downloaded', { projectId, fileName: doc.name });
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Error downloading document');
      logger.error('Error downloading document', err, { projectId, fileName: doc.name });
      toast.error('Error al descargar documento');
    }
  };

  const handleDelete = async (docId: string) => {
    if (!confirm('¿Eliminar este documento?')) return;

    try {
      const storageRef = ref(storage, `projects/${projectId}/documents/${docId}`);
      await deleteObject(storageRef);

      toast.success('Documento eliminado');
      logger.info('Document deleted', { projectId, fileName: docId });

      // Recargar lista de documentos
      await loadDocuments();
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Error deleting document');
      logger.error('Error deleting document', err, { projectId, fileName: docId });
      toast.error('Error al eliminar documento');
    }
  };

  const filteredDocs = selectedCategory === 'all'
    ? documents
    : documents.filter(d => d.category === selectedCategory);

  return (
    <div className="space-y-6">
      <DocumentsHeader
        selectedCategory={selectedCategory}
        filteredCount={filteredDocs.length}
        uploading={uploading}
        onCategoryChange={setSelectedCategory}
        onFileUpload={handleFileUpload}
      />

      {/* Upload Progress Bar */}
      {uploading && uploadProgress > 0 && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Subiendo archivo...</span>
            <span>{uploadProgress}%</span>
          </div>
          <Progress value={uploadProgress} className="w-full" />
        </div>
      )}

      {loading || documents.length === 0 ? (
        <DocumentsEmptyState loading={loading} />
      ) : (
        <DocumentsList
          documents={filteredDocs}
          onDownload={handleDownload}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}