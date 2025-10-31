/**
 * ZADIA OS - Project Document Entity Types
 * Gestión de documentos del proyecto
 * Rule #5: Max 200 lines per file
 */

import { Timestamp } from 'firebase/firestore';

/**
 * Tipo de documento
 */
export type DocumentType = 
  | 'contract'
  | 'quote'
  | 'invoice'
  | 'technical-drawing'
  | 'photo'
  | 'report'
  | 'other';

/**
 * Documento del Proyecto
 */
export interface ProjectDocument {
  id: string;
  projectId: string;
  
  // Información del archivo
  name: string;
  description?: string;
  documentType: DocumentType;
  
  // Storage
  fileUrl: string;
  fullPath: string; // Firebase Storage path para eliminación
  fileSize: number; // bytes
  fileType: string; // MIME type
  
  // Organización
  tags?: string[];
  version?: string;
  
  // Metadata
  uploadedBy: string;
  uploadedByName: string;
  uploadedAt: Timestamp;
  
  // Modificaciones
  updatedAt?: Timestamp;
  updatedBy?: string;
}

/**
 * Input para crear documento
 */
export interface CreateDocumentInput {
  projectId: string;
  name: string;
  description?: string;
  documentType: DocumentType;
  fileUrl: string;
  fullPath: string;
  fileSize: number;
  fileType: string;
  tags?: string[];
  uploadedBy: string;
  uploadedByName: string;
}

/**
 * Input para actualizar documento
 */
export interface UpdateDocumentInput {
  name?: string;
  description?: string;
  documentType?: DocumentType;
  tags?: string[];
  version?: string;
  updatedBy?: string;
}
