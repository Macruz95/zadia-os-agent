/**
 * ZADIA OS - Quotes PDF Service
 * 
 * Servicio especializado para generar PDFs de cotizaciones
 * Rule #1: Real Firebase operations (fetch data, save PDFs)
 * Rule #3: Zod validation
 * Rule #4: Servicio modular
 * 
 * @module QuotesPDFService
 */

import React from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { logger } from '@/lib/logger';
import { PDFGeneratorService } from '@/lib/pdf/pdf-generator.service';
import { QuotePDFTemplate } from '@/lib/pdf/templates/quote-pdf-template';
import type { Quote } from '@/modules/sales/types/sales.types';

/**
 * Información de la empresa (configuración)
 */
const COMPANY_INFO = {
  name: process.env.NEXT_PUBLIC_COMPANY_NAME || 'ZADIA OS',
  address: process.env.NEXT_PUBLIC_COMPANY_ADDRESS || 'San Salvador, El Salvador',
  phone: process.env.NEXT_PUBLIC_COMPANY_PHONE || '+503 0000-0000',
  email: process.env.NEXT_PUBLIC_COMPANY_EMAIL || 'info@zadia.com',
  website: process.env.NEXT_PUBLIC_COMPANY_WEBSITE || 'www.zadia.com',
  taxId: process.env.NEXT_PUBLIC_COMPANY_TAX_ID || '0000-000000-000-0',
  logo: process.env.NEXT_PUBLIC_COMPANY_LOGO,
};

/**
 * Servicio de PDFs para Cotizaciones
 */
export const QuotesPDFService = {
  /**
   * Genera PDF de una cotización
   * 
   * @param quote - Cotización completa
   * @param options - Opciones de generación
   * @returns Resultado con blob y URL
   */
  async generateQuotePDF(
    quote: Quote,
    options: {
      saveToStorage?: boolean;
      openInNewTab?: boolean;
      download?: boolean;
    } = {}
  ) {
    try {
      logger.info('Generando PDF de cotización', { metadata: { quoteNumber: quote.number } });

      // Obtener información del cliente
      const clientInfo = await this.getClientInfo(quote.clientId);

      // Crear componente React-PDF
      const pdfDocument = (
        <QuotePDFTemplate
          quote={quote}
          companyInfo={COMPANY_INFO}
          clientInfo={clientInfo}
        />
      );

      // Generar PDF
      const result = await PDFGeneratorService.generatePDF(pdfDocument, {
        fileName: `Cotizacion-${quote.number}`,
        storagePath: `quotes/${quote.id}`,
        saveToStorage: options.saveToStorage ?? true,
        metadata: {
          quoteId: quote.id,
          quoteNumber: quote.number,
          clientId: quote.clientId,
        },
      });

      if (!result.success || !result.blob) {
        throw new Error(result.error || 'Error generando PDF');
      }

      // Acciones post-generación
      if (options.download) {
        PDFGeneratorService.downloadPDFInBrowser(result.blob, `Cotizacion-${quote.number}`);
      }

      if (options.openInNewTab) {
        PDFGeneratorService.openPDFInNewTab(result.blob);
      }

      return result;

    } catch (error) {
      logger.error('Error generando PDF de cotización', error as Error);
      throw error;
    }
  },

  /**
   * Obtiene información del cliente desde Firestore
   * 
   * @param clientId - ID del cliente
   * @returns Información del cliente para el PDF
   */
  async getClientInfo(clientId: string) {
    try {
      const clientDoc = await getDoc(doc(db, 'clients', clientId));
      
      if (!clientDoc.exists()) {
        logger.error('Cliente no encontrado', { metadata: { clientId } });
        return {
          name: 'Cliente no encontrado',
        };
      }

      const client = clientDoc.data();

      // Determinar nombre según tipo de entidad
      let name = '';
      if (client.entityType === 'person') {
        name = `${client.firstName || ''} ${client.lastName || ''}`.trim();
      } else {
        name = client.companyName || client.institutionName || 'Sin nombre';
      }

      return {
        name,
        address: client.address ? 
          `${client.address.street || ''}, ${client.address.city || ''}, ${client.address.state || ''}, ${client.address.country || ''}`.trim() 
          : undefined,
        phone: client.phone,
        email: client.email,
      };

    } catch (error) {
      logger.error('Error obteniendo info del cliente', error as Error);
      return {
        name: 'Error cargando cliente',
      };
    }
  },

  /**
   * Genera y descarga PDF directamente
   * 
   * @param quote - Cotización
   */
  async downloadQuotePDF(quote: Quote) {
    return this.generateQuotePDF(quote, {
      saveToStorage: false,
      download: true,
    });
  },

  /**
   * Genera PDF y lo abre en nueva pestaña
   * 
   * @param quote - Cotización
   */
  async previewQuotePDF(quote: Quote) {
    return this.generateQuotePDF(quote, {
      saveToStorage: false,
      openInNewTab: true,
    });
  },

  /**
   * Genera PDF y lo guarda en Storage
   * Retorna URL de descarga para adjuntar en email
   * 
   * @param quote - Cotización
   * @returns URL de descarga del PDF
   */
  async generateAndSaveQuotePDF(quote: Quote): Promise<string> {
    const result = await this.generateQuotePDF(quote, {
      saveToStorage: true,
    });

    if (!result.downloadURL) {
      throw new Error('No se pudo guardar el PDF en Storage');
    }

    return result.downloadURL;
  },
};
