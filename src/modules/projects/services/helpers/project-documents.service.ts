/**
 * ZADIA OS - Project Documents Service
 * Gestión de documentos con Firebase Storage
 * Rule #1: Real Firebase operations
 * Rule #3: Zod validation
 * Rule #5: Max 200 lines per file
 */

import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  getStorage,
} from 'firebase/storage';
import { db } from '@/lib/firebase';
import { logger } from '@/lib/logger';
import type { ProjectDocument, DocumentType } from '../../types/projects.types';
import {
  createDocumentSchema,
  updateDocumentSchema,
  type CreateDocumentInput,
  type UpdateDocumentInput,
} from '../../validations/project-extensions.validation';

const DOCUMENTS_COLLECTION = 'projectDocuments';

/**
 * Subir documento a Storage y guardar referencia en Firestore
 */
export async function uploadDocument(
  file: File,
  projectId: string,
  uploadedBy: string,
  uploadedByName: string,
  documentType: DocumentType,
  description?: string,
  tags?: string[],
  onProgress?: (progress: number) => void
): Promise<string> {
  try {
    const storage = getStorage();
    const timestamp = Date.now();
    const fileName = `${timestamp}_${file.name}`;
    const fullPath = `projects/${projectId}/documents/${fileName}`;
    const storageRef = ref(storage, fullPath);

    // Upload file
    const uploadTask = uploadBytesResumable(storageRef, file);

    return new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          if (onProgress) {
            onProgress(progress);
          }
        },
        (error) => {
          logger.error('Error uploading document', error, {
            component: 'DocumentsService',
            action: 'upload',
          });
          reject(new Error('Error al subir documento'));
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

            // Create Firestore document
            const docData: CreateDocumentInput = {
              projectId,
              name: file.name,
              description,
              documentType,
              fileUrl: downloadURL,
              fullPath,
              fileSize: file.size,
              fileType: file.type,
              tags,
              uploadedBy,
              uploadedByName,
            };

            const validated = createDocumentSchema.parse(docData);

            const firestoreDoc = await addDoc(
              collection(db, DOCUMENTS_COLLECTION),
              {
                ...validated,
                uploadedAt: serverTimestamp(),
              }
            );

            logger.info('Document uploaded successfully', {
              component: 'DocumentsService',
              action: 'upload',
              metadata: { documentId: firestoreDoc.id, projectId },
            });

            resolve(firestoreDoc.id);
          } catch (error) {
            reject(error);
          }
        }
      );
    });
  } catch (error) {
    logger.error('Error in upload process', error as Error, {
      component: 'DocumentsService',
      action: 'upload',
    });
    throw new Error('Error al procesar carga de documento');
  }
}

/**
 * Actualizar metadata de documento
 */
export async function updateDocument(
  documentId: string,
  data: UpdateDocumentInput
): Promise<void> {
  try {
    const validated = updateDocumentSchema.parse(data);

    await updateDoc(doc(db, DOCUMENTS_COLLECTION, documentId), {
      ...validated,
      updatedAt: serverTimestamp(),
    });

    logger.info('Document updated', {
      component: 'DocumentsService',
      action: 'update',
      metadata: { documentId },
    });
  } catch (error) {
    logger.error('Error updating document', error as Error, {
      component: 'DocumentsService',
      action: 'update',
    });
    throw new Error('Error al actualizar documento');
  }
}

/**
 * Eliminar documento (Storage + Firestore)
 */
export async function deleteDocument(
  documentId: string,
  fullPath: string
): Promise<void> {
  try {
    const storage = getStorage();
    const storageRef = ref(storage, fullPath);

    // Delete from Storage
    await deleteObject(storageRef);

    // Delete from Firestore
    await deleteDoc(doc(db, DOCUMENTS_COLLECTION, documentId));

    logger.info('Document deleted', {
      component: 'DocumentsService',
      action: 'delete',
      metadata: { documentId },
    });
  } catch (error) {
    logger.error('Error deleting document', error as Error, {
      component: 'DocumentsService',
      action: 'delete',
    });
    throw new Error('Error al eliminar documento');
  }
}

/**
 * Obtener documentos de un proyecto
 */
export async function getProjectDocuments(
  projectId: string
): Promise<ProjectDocument[]> {
  try {
    const q = query(
      collection(db, DOCUMENTS_COLLECTION),
      where('projectId', '==', projectId),
      orderBy('uploadedAt', 'desc')
    );

    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as ProjectDocument[];
  } catch (error) {
    logger.error('Error fetching project documents', error as Error, {
      component: 'DocumentsService',
      action: 'getProjectDocuments',
    });
    throw new Error('Error al obtener documentos del proyecto');
  }
}
