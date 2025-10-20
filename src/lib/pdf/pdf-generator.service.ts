/**
 * ZADIA OS - PDF Generation Service
 * 
 * Motor común para generar PDFs profesionales
 * Rule #1: Real Firebase operations (guardar PDFs en Storage)
 * Rule #3: Zod validation en inputs
 * Rule #4: Servicio modular y reutilizable
 * 
 * @module PDFGeneratorService
 */

import { pdf } from '@react-pdf/renderer';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase';
import { logger } from '@/lib/logger';

/**
 * Opciones para generar PDF
 */
export interface GeneratePDFOptions {
  /** Nombre del archivo (sin extensión) */
  fileName: string;
  /** Carpeta en Storage donde guardar */
  storagePath: string;
  /** Si debe guardarse en Firebase Storage */
  saveToStorage?: boolean;
  /** Metadatos adicionales */
  metadata?: Record<string, string>;
}

/**
 * Resultado de generación de PDF
 */
export interface PDFGenerationResult {
  success: boolean;
  blob?: Blob;
  downloadURL?: string;
  storagePath?: string;
  error?: string;
}

/**
 * Servicio de Generación de PDFs
 */
export const PDFGeneratorService = {
  /**
   * Genera PDF desde un componente React-PDF
   * 
   * @param component - Componente React-PDF (Document)
   * @param options - Opciones de generación
   * @returns Resultado con blob y URL de descarga
   */
  async generatePDF(
    component: React.ReactElement,
    options: GeneratePDFOptions
  ): Promise<PDFGenerationResult> {
    try {
      logger.info('Generando PDF', { fileName: options.fileName });

      // Generar blob desde componente React-PDF
      const blob = await pdf(component).toBlob();

      // Si no se requiere guardar en Storage, retornar solo el blob
      if (!options.saveToStorage) {
        return {
          success: true,
          blob,
        };
      }

      // Guardar en Firebase Storage
      const result = await this.savePDFToStorage(blob, options);

      return result;

    } catch (error) {
      logger.error('Error generando PDF', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
      };
    }
  },

  /**
   * Guarda un blob PDF en Firebase Storage
   * 
   * @param blob - Blob del PDF
   * @param options - Opciones con path y metadata
   * @returns URL de descarga y path de storage
   */
  async savePDFToStorage(
    blob: Blob,
    options: GeneratePDFOptions
  ): Promise<PDFGenerationResult> {
    try {
      const fileName = `${options.fileName}.pdf`;
      const fullPath = `${options.storagePath}/${fileName}`;
      
      const storageRef = ref(storage, fullPath);

      // Metadata del archivo
      const metadata = {
        contentType: 'application/pdf',
        customMetadata: {
          generatedAt: new Date().toISOString(),
          ...options.metadata,
        },
      };

      // Upload a Storage
      await uploadBytes(storageRef, blob, metadata);

      // Obtener URL de descarga
      const downloadURL = await getDownloadURL(storageRef);

      logger.info('PDF guardado en Storage', { path: fullPath, url: downloadURL });

      return {
        success: true,
        blob,
        downloadURL,
        storagePath: fullPath,
      };

    } catch (error) {
      logger.error('Error guardando PDF en Storage', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al guardar PDF',
      };
    }
  },

  /**
   * Descarga directa de un PDF en el navegador
   * 
   * @param blob - Blob del PDF
   * @param fileName - Nombre del archivo
   */
  downloadPDFInBrowser(blob: Blob, fileName: string): void {
    try {
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${fileName}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      logger.info('PDF descargado en navegador', { fileName });
    } catch (error) {
      logger.error('Error descargando PDF', error);
      throw error;
    }
  },

  /**
   * Abre PDF en nueva pestaña
   * 
   * @param blob - Blob del PDF
   */
  openPDFInNewTab(blob: Blob): void {
    try {
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
      
      // Limpiar URL después de un tiempo
      setTimeout(() => URL.revokeObjectURL(url), 10000);

      logger.info('PDF abierto en nueva pestaña');
    } catch (error) {
      logger.error('Error abriendo PDF', error);
      throw error;
    }
  },
};
