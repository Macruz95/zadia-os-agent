/**
 * ZADIA OS - Invoices PDF Service
 * 
 * Invoice-specific PDF generation wrapper
 * REGLA 1: Firebase real (fetch client data, save to Storage)
 * REGLA 4: Modular (wraps PDFGeneratorService)
 * REGLA 5: ~180 líneas
 */

import { Invoice } from '@/modules/finance/types/finance.types';
import { PDFGeneratorService } from '@/lib/pdf/pdf-generator.service';
import { InvoicePDFTemplate } from '@/lib/pdf/templates/invoice-pdf-template';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { logger } from '@/lib/logger';

export class InvoicesPDFService {
  /**
   * Generate invoice PDF with client information
   */
  static async generateInvoicePDF(
    invoice: Invoice,
    options?: {
      saveToStorage?: boolean;
    }
  ) {
    try {
      // Fetch client information
      const clientDoc = await getDoc(doc(db, 'clients', invoice.clientId));
      
      if (!clientDoc.exists()) {
        throw new Error('Cliente no encontrado');
      }

      const clientData = clientDoc.data();
      
      // Adapt client info based on entity type
      const clientInfo = {
        name: clientData.entityType === 'person'
          ? `${clientData.firstName} ${clientData.lastName}`
          : clientData.companyName || clientData.institutionName,
        email: clientData.email,
        phone: clientData.phone,
        address: clientData.address,
        taxId: clientData.taxId,
      };

      // Company info from environment variables
      const companyInfo = {
        name: process.env.NEXT_PUBLIC_COMPANY_NAME,
        address: process.env.NEXT_PUBLIC_COMPANY_ADDRESS,
        phone: process.env.NEXT_PUBLIC_COMPANY_PHONE,
        email: process.env.NEXT_PUBLIC_COMPANY_EMAIL,
        website: process.env.NEXT_PUBLIC_COMPANY_WEBSITE,
        taxId: process.env.NEXT_PUBLIC_COMPANY_TAX_ID,
        logo: process.env.NEXT_PUBLIC_COMPANY_LOGO,
      };

      // Generate PDF
      const result = await PDFGeneratorService.generatePDF(
        <InvoicePDFTemplate
          invoice={invoice}
          clientInfo={clientInfo}
          companyInfo={companyInfo}
        />,
        {
          fileName: `Factura-${invoice.number}.pdf`,
          storagePath: options?.saveToStorage
            ? `invoices/${invoice.id}/Factura-${invoice.number}.pdf`
            : '',
        }
      );

      if (!result.success) {
        throw new Error(result.error || 'Error al generar PDF');
      }

      logger.info('Invoice PDF generated successfully', {
        metadata: {
          invoiceId: invoice.id,
          invoiceNumber: invoice.number,
          saved: !!options?.saveToStorage,
        },
      });

      return result;
    } catch (error) {
      logger.error('Error generating invoice PDF', {
        metadata: {
          invoiceId: invoice.id,
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      });
      throw error;
    }
  }

  /**
   * Download invoice PDF directly in browser
   */
  static async downloadInvoicePDF(invoice: Invoice) {
    try {
      const result = await this.generateInvoicePDF(invoice, {
        saveToStorage: false,
      });

      if (result.blob) {
        PDFGeneratorService.downloadPDFInBrowser(
          result.blob,
          `Factura-${invoice.number}.pdf`
        );
      }

      return result;
    } catch (error) {
      logger.error('Error downloading invoice PDF', {
        metadata: {
          invoiceId: invoice.id,
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      });
      throw error;
    }
  }

  /**
   * Preview invoice PDF in new tab
   */
  static async previewInvoicePDF(invoice: Invoice) {
    try {
      const result = await this.generateInvoicePDF(invoice, {
        saveToStorage: false,
      });

      if (result.blob) {
        PDFGeneratorService.openPDFInNewTab(result.blob);
      }

      return result;
    } catch (error) {
      logger.error('Error previewing invoice PDF', {
        metadata: {
          invoiceId: invoice.id,
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      });
      throw error;
    }
  }

  /**
   * Generate and save invoice PDF to Firebase Storage
   * Used for email attachments
   */
  static async generateAndSaveInvoicePDF(invoice: Invoice) {
    try {
      const result = await this.generateInvoicePDF(invoice, {
        saveToStorage: true,
      });

      if (!result.downloadURL) {
        throw new Error('Failed to save PDF to storage');
      }

      logger.info('Invoice PDF saved to storage', {
        metadata: {
          invoiceId: invoice.id,
          downloadURL: result.downloadURL,
          storagePath: result.storagePath,
        },
      });

      return result;
    } catch (error) {
      logger.error('Error saving invoice PDF to storage', {
        metadata: {
          invoiceId: invoice.id,
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      });
      throw error;
    }
  }
}
