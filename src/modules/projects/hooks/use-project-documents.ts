/**
 * ZADIA OS - Use Project Documents Hook
 * Hook para gestionar documentos del proyecto
 * Rule #4: Modular React hooks
 * Rule #5: Max 200 lines per file
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';
import type { ProjectDocument, DocumentType } from '../types/projects.types';
import {
  uploadDocument,
  updateDocument,
  deleteDocument,
} from '../services/helpers/project-documents.service';
import type { UpdateDocumentInput } from '../validations/project-extensions.validation';

interface UseProjectDocumentsReturn {
  documents: ProjectDocument[];
  loading: boolean;
  error: string | null;
  uploadFile: (
    file: File,
    documentType: DocumentType,
    uploadedBy: string,
    uploadedByName: string,
    description?: string,
    tags?: string[]
  ) => Promise<string>;
  editDocument: (documentId: string, data: UpdateDocumentInput) => Promise<void>;
  removeDocument: (documentId: string, fullPath: string) => Promise<void>;
  uploadProgress: number;
  isUploading: boolean;
}

/**
 * Hook para gestionar documentos de un proyecto
 */
export function useProjectDocuments(projectId: string): UseProjectDocumentsReturn {
  const [documents, setDocuments] = useState<ProjectDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  // Real-time listener para documentos del proyecto
  useEffect(() => {
    if (!projectId) return;

    const q = query(
      collection(db, 'projectDocuments'),
      where('projectId', '==', projectId)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const documentsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as ProjectDocument[];

        // Ordenar por fecha más reciente
        documentsData.sort((a, b) => 
          b.uploadedAt.toMillis() - a.uploadedAt.toMillis()
        );

        setDocuments(documentsData);
        setLoading(false);
        setError(null);
      },
      (err) => {
        logger.error('Error listening to documents', err);
        setError('Error al cargar documentos');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [projectId]);

  // Subir archivo
  const uploadFile = useCallback(
    async (
      file: File,
      documentType: DocumentType,
      uploadedBy: string,
      uploadedByName: string,
      description?: string,
      tags?: string[]
    ): Promise<string> => {
      try {
        setIsUploading(true);
        setUploadProgress(0);

        const documentId = await uploadDocument(
          file,
          projectId,
          uploadedBy,
          uploadedByName,
          documentType,
          description,
          tags,
          (progress) => setUploadProgress(progress)
        );

        toast.success('Documento subido exitosamente');
        setIsUploading(false);
        setUploadProgress(0);

        return documentId;
      } catch (err) {
        logger.error('Error uploading document', err as Error);
        toast.error('Error al subir documento');
        setIsUploading(false);
        setUploadProgress(0);
        throw err;
      }
    },
    [projectId]
  );

  // Actualizar documento
  const editDocument = useCallback(
    async (documentId: string, data: UpdateDocumentInput) => {
      try {
        await updateDocument(documentId, data);
        toast.success('Documento actualizado');
      } catch (err) {
        logger.error('Error updating document', err as Error);
        toast.error('Error al actualizar documento');
        throw err;
      }
    },
    []
  );

  // Eliminar documento
  const removeDocument = useCallback(
    async (documentId: string, fullPath: string) => {
      try {
        await deleteDocument(documentId, fullPath);
        toast.success('Documento eliminado');
      } catch (err) {
        logger.error('Error deleting document', err as Error);
        toast.error('Error al eliminar documento');
        throw err;
      }
    },
    []
  );

  return {
    documents,
    loading,
    error,
    uploadFile,
    editDocument,
    removeDocument,
    uploadProgress,
    isUploading,
  };
}
