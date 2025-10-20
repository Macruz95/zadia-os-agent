/**
 * ZADIA OS - Quotes Email Service
 * 
 * Servicio especializado para enviar cotizaciones por email
 * Rule #1: Real operations (Resend API + Firestore updates)
 * Rule #3: Zod validation
 * Rule #4: Servicio modular
 * 
 * @module QuotesEmailService
 */

import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { logger } from '@/lib/logger';
import { EmailService } from '@/lib/email/email.service';
import { QuotesPDFService } from './quotes-pdf.service';
import type { Quote } from '@/modules/sales/types/sales.types';

/**
 * Opciones para enviar cotización
 */
export interface SendQuoteEmailOptions {
  to: string | string[];
  cc?: string | string[];
  subject?: string;
  message?: string;
  attachPDF?: boolean;
}

/**
 * Resultado de envío
 */
export interface SendQuoteEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Servicio de Email para Cotizaciones
 */
export const QuotesEmailService = {
  /**
   * Envia cotización por email con PDF adjunto
   * 
   * @param quote - Cotización a enviar
   * @param options - Opciones de envío
   * @returns Resultado del envío
   */
  async sendQuoteEmail(
    quote: Quote,
    options: SendQuoteEmailOptions
  ): Promise<SendQuoteEmailResult> {
    try {
      logger.info('Enviando cotización por email', { 
        metadata: { quoteNumber: quote.number } 
      });

      // Generar PDF si se requiere adjuntar
      let pdfBuffer: Buffer | undefined;
      if (options.attachPDF !== false) { // Por defecto adjunta PDF
        const pdfResult = await QuotesPDFService.generateQuotePDF(quote, {
          saveToStorage: true, // Guardar en Storage para registro
        });

        if (!pdfResult.success || !pdfResult.blob) {
          throw new Error('Error generando PDF para adjuntar');
        }

        // Convertir Blob a Buffer para Resend
        const arrayBuffer = await pdfResult.blob.arrayBuffer();
        pdfBuffer = Buffer.from(arrayBuffer);
      }

      // Preparar email HTML
      const emailHTML = this.generateQuoteEmailHTML(quote, options.message);

      // Configurar email
      const emailConfig = {
        from: EmailService.getDefaultFrom(),
        to: options.to,
        cc: options.cc,
        subject: options.subject || `Cotización ${quote.number} - ${process.env.NEXT_PUBLIC_COMPANY_NAME || 'ZADIA OS'}`,
        html: emailHTML,
      };

      // Preparar adjuntos
      const attachments = pdfBuffer ? [
        {
          filename: `Cotizacion-${quote.number}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf',
        }
      ] : undefined;

      // Enviar email
      const emailResult = await EmailService.sendEmail(emailConfig, attachments);

      if (!emailResult.success) {
        throw new Error(emailResult.error || 'Error enviando email');
      }

      // Actualizar cotización en Firestore
      await this.updateQuoteAfterSend(quote.id);

      logger.info('Cotización enviada exitosamente', { 
        metadata: { 
          quoteNumber: quote.number,
          messageId: emailResult.messageId 
        } 
      });

      return {
        success: true,
        messageId: emailResult.messageId,
      };

    } catch (error) {
      logger.error('Error enviando cotización por email', error as Error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
      };
    }
  },

  /**
   * Genera HTML profesional para el email de cotización
   * 
   * @param quote - Cotización
   * @param customMessage - Mensaje personalizado opcional
   * @returns HTML del email
   */
  generateQuoteEmailHTML(quote: Quote, customMessage?: string): string {
    const companyName = process.env.NEXT_PUBLIC_COMPANY_NAME || 'ZADIA OS';
    const companyEmail = process.env.NEXT_PUBLIC_COMPANY_EMAIL || 'info@zadia.com';
    const companyPhone = process.env.NEXT_PUBLIC_COMPANY_PHONE || '+503 0000-0000';

    return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Cotización ${quote.number}</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f3f4f6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 20px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%); padding: 40px 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px;">Nueva Cotización</h1>
              <p style="color: #e0e7ff; margin: 10px 0 0 0; font-size: 16px;">No. ${quote.number}</p>
            </td>
          </tr>

          <!-- Contenido -->
          <tr>
            <td style="padding: 40px 30px;">
              ${customMessage ? `
                <div style="background-color: #f9fafb; border-left: 4px solid #2563eb; padding: 15px 20px; margin-bottom: 30px; border-radius: 4px;">
                  <p style="color: #374151; margin: 0; line-height: 1.6;">${customMessage}</p>
                </div>
              ` : `
                <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                  Estimado cliente,
                </p>
                <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                  Adjunto encontrará nuestra cotización detallada para su proyecto. Hemos preparado una propuesta especialmente diseñada según sus requerimientos.
                </p>
              `}

              <!-- Resumen de cotización -->
              <table width="100%" cellpadding="15" cellspacing="0" style="border: 1px solid #e5e7eb; border-radius: 8px; margin: 30px 0;">
                <tr style="background-color: #f9fafb;">
                  <td style="color: #6b7280; font-size: 14px; font-weight: 600; border-bottom: 1px solid #e5e7eb;">
                    DETALLES DE LA COTIZACIÓN
                  </td>
                </tr>
                <tr>
                  <td style="padding: 15px;">
                    <table width="100%" cellpadding="8" cellspacing="0">
                      <tr>
                        <td style="color: #6b7280; font-size: 14px; width: 40%;">Número:</td>
                        <td style="color: #111827; font-size: 14px; font-weight: 600;">${quote.number}</td>
                      </tr>
                      <tr>
                        <td style="color: #6b7280; font-size: 14px;">Total:</td>
                        <td style="color: #2563eb; font-size: 18px; font-weight: 700;">
                          ${new Intl.NumberFormat('es-SV', { 
                            style: 'currency', 
                            currency: quote.currency 
                          }).format(quote.total)}
                        </td>
                      </tr>
                      <tr>
                        <td style="color: #6b7280; font-size: 14px;">Válida hasta:</td>
                        <td style="color: #111827; font-size: 14px;">
                          ${new Intl.DateTimeFormat('es-SV', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          }).format(quote.validUntil.toDate())}
                        </td>
                      </tr>
                      <tr>
                        <td style="color: #6b7280; font-size: 14px;">Términos de pago:</td>
                        <td style="color: #111827; font-size: 14px;">${quote.paymentTerms || 'Según acuerdo'}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <p style="color: #374151; font-size: 14px; line-height: 1.6; margin: 30px 0 20px 0;">
                Si tiene alguna pregunta o necesita aclaraciones sobre esta cotización, no dude en contactarnos.
              </p>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="mailto:${companyEmail}" style="display: inline-block; background-color: #2563eb; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-size: 16px; font-weight: 600; box-shadow: 0 2px 4px rgba(37, 99, 235, 0.3);">
                      Responder Cotización
                    </a>
                  </td>
                </tr>
              </table>

              <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 30px 0 0 0; text-align: center;">
                Atentamente,<br>
                <strong style="color: #111827;">${companyName}</strong>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 14px; margin: 0 0 10px 0;">
                <strong>${companyName}</strong>
              </p>
              <p style="color: #9ca3af; font-size: 12px; margin: 0 0 5px 0;">
                📧 ${companyEmail} | 📞 ${companyPhone}
              </p>
              <p style="color: #9ca3af; font-size: 11px; margin: 15px 0 0 0;">
                Este email fue generado automáticamente por ZADIA OS
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim();
  },

  /**
   * Actualiza cotización después de enviarla
   * Marca como "sent" y registra timestamp
   * 
   * @param quoteId - ID de la cotización
   */
  async updateQuoteAfterSend(quoteId: string): Promise<void> {
    try {
      const quoteRef = doc(db, 'quotes', quoteId);
      
      await updateDoc(quoteRef, {
        status: 'sent',
        sentAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      logger.info('Cotización actualizada después de envío', { 
        metadata: { quoteId } 
      });

    } catch (error) {
      logger.error('Error actualizando cotización', error as Error);
      // No lanzamos error para no bloquear el flujo
    }
  },
};
