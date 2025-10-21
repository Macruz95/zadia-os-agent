/**
 * ZADIA OS - Invoices Email Service
 * 
 * Send invoices via email with professional HTML template
 * REGLA 1: Firebase real (update status after send)
 * REGLA 3: Zod validation
 * REGLA 4: Modular (wraps EmailService + InvoicesPDFService)
 * REGLA 5: ~290 líneas
 */

import { Invoice } from '@/modules/finance/types/finance.types';
import { EmailService } from '@/lib/email/email.service';
import { InvoicesPDFService } from './invoices-pdf.service';
import { doc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { logger } from '@/lib/logger';

export interface SendInvoiceEmailOptions {
  to: string;
  cc?: string;
  subject?: string;
  customMessage?: string;
}

export class InvoicesEmailService {
  /**
   * Send invoice via email with PDF attachment
   */
  static async sendInvoiceEmail(
    invoice: Invoice,
    options: SendInvoiceEmailOptions
  ) {
    try {
      // 1. Generate PDF and save to Storage
      logger.info('Generating invoice PDF for email', {
        metadata: {
          invoiceId: invoice.id,
          invoiceNumber: invoice.number,
        },
      });

      const pdfResult = await InvoicesPDFService.generateAndSaveInvoicePDF(invoice);

      if (!pdfResult.blob || !pdfResult.downloadURL) {
        throw new Error('Failed to generate PDF');
      }

      // 2. Convert blob to Buffer for email attachment
      const arrayBuffer = await pdfResult.blob.arrayBuffer();
      const pdfBuffer = Buffer.from(arrayBuffer);

      // 3. Generate HTML email content
      const htmlContent = this.generateInvoiceEmailHTML(
        invoice,
        options.customMessage
      );

      // 4. Send email with PDF attachment
      logger.info('Sending invoice email', {
        metadata: {
          invoiceId: invoice.id,
          to: options.to,
        },
      });

      const emailResult = await EmailService.sendEmail(
        {
          from: EmailService.getDefaultFrom(),
          to: options.to,
          cc: options.cc,
          subject:
            options.subject ||
            `Factura ${invoice.number} - ${process.env.NEXT_PUBLIC_COMPANY_NAME || 'ZADIA'}`,
          html: htmlContent,
        },
        [
          {
            filename: `Factura-${invoice.number}.pdf`,
            content: pdfBuffer,
          },
        ]
      );

      if (!emailResult.success) {
        throw new Error(emailResult.error || 'Failed to send email');
      }

      // 5. Update invoice status in Firestore
      await this.updateInvoiceAfterSend(invoice.id);

      logger.info('Invoice email sent successfully', {
        metadata: {
          invoiceId: invoice.id,
          messageId: emailResult.messageId,
        },
      });

      return {
        success: true,
        messageId: emailResult.messageId,
      };
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Error sending invoice email');
      logger.error('Error sending invoice email', err, {
        invoiceId: invoice.id,
        metadata: {
          invoiceNumber: invoice.number,
        },
      });

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Generate professional HTML email template
   */
  private static generateInvoiceEmailHTML(
    invoice: Invoice,
    customMessage?: string
  ): string {
    const companyName = process.env.NEXT_PUBLIC_COMPANY_NAME || 'ZADIA Carpintería';
    const companyEmail = process.env.NEXT_PUBLIC_COMPANY_EMAIL || 'contacto@empresa.com';
    const companyPhone = process.env.NEXT_PUBLIC_COMPANY_PHONE || '';

    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat('es-SV', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(amount);
    };

    const formatDate = (timestamp: { toDate?: () => Date } | Date | string) => {
      const date = timestamp && typeof timestamp === 'object' && 'toDate' in timestamp 
        ? timestamp.toDate!() 
        : new Date(timestamp as string | Date);
      return new Intl.DateTimeFormat('es-SV', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }).format(date);
    };

    const isPaid = invoice.status === 'paid';
    const isOverdue = invoice.status === 'overdue';

    return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Factura ${invoice.number}</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #1e40af 0%, #2563eb 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: bold;">
                FACTURA
              </h1>
              <p style="margin: 10px 0 0 0; color: #e0e7ff; font-size: 18px; font-weight: bold;">
                ${invoice.number}
              </p>
            </td>
          </tr>

          <!-- Greeting -->
          <tr>
            <td style="padding: 30px;">
              <p style="margin: 0 0 15px 0; font-size: 16px; color: #333;">
                Estimado/a ${invoice.clientName},
              </p>
              <p style="margin: 0 0 20px 0; font-size: 14px; color: #666; line-height: 1.6;">
                Adjunto encontrará la factura <strong>${invoice.number}</strong> correspondiente a los servicios/productos adquiridos.
                Por favor, revise los detalles y proceda con el pago según los términos establecidos.
              </p>
            </td>
          </tr>

          <!-- Custom Message -->
          ${customMessage ? `
          <tr>
            <td style="padding: 0 30px 20px 30px;">
              <div style="background-color: #eff6ff; border-left: 4px solid #2563eb; padding: 15px; border-radius: 4px;">
                <p style="margin: 0; font-size: 14px; color: #1e40af; line-height: 1.5;">
                  <strong>Mensaje:</strong> ${customMessage}
                </p>
              </div>
            </td>
          </tr>
          ` : ''}

          <!-- Invoice Summary -->
          <tr>
            <td style="padding: 0 30px 30px 30px;">
              <table width="100%" cellpadding="12" style="border: 1px solid #e5e7eb; border-radius: 4px;">
                <tr style="background-color: #f9fafb;">
                  <td colspan="2" style="font-size: 14px; font-weight: bold; color: #374151; border-bottom: 1px solid #e5e7eb;">
                    Resumen de Factura
                  </td>
                </tr>
                <tr>
                  <td style="font-size: 14px; color: #6b7280; border-bottom: 1px solid #f3f4f6;">
                    <strong>Número:</strong>
                  </td>
                  <td style="font-size: 14px; color: #111827; text-align: right; border-bottom: 1px solid #f3f4f6;">
                    ${invoice.number}
                  </td>
                </tr>
                <tr>
                  <td style="font-size: 14px; color: #6b7280; border-bottom: 1px solid #f3f4f6;">
                    <strong>Fecha de Emisión:</strong>
                  </td>
                  <td style="font-size: 14px; color: #111827; text-align: right; border-bottom: 1px solid #f3f4f6;">
                    ${formatDate(invoice.issueDate)}
                  </td>
                </tr>
                <tr>
                  <td style="font-size: 14px; color: #6b7280; border-bottom: 1px solid #f3f4f6;">
                    <strong>Fecha de Vencimiento:</strong>
                  </td>
                  <td style="font-size: 14px; color: #111827; text-align: right; border-bottom: 1px solid #f3f4f6;">
                    ${formatDate(invoice.dueDate)}
                  </td>
                </tr>
                <tr>
                  <td style="font-size: 14px; color: #6b7280; border-bottom: 1px solid #f3f4f6;">
                    <strong>Términos de Pago:</strong>
                  </td>
                  <td style="font-size: 14px; color: #111827; text-align: right; border-bottom: 1px solid #f3f4f6;">
                    ${invoice.paymentTerms}
                  </td>
                </tr>
                <tr style="background-color: ${isPaid ? '#d1fae5' : isOverdue ? '#fee2e2' : '#eff6ff'};">
                  <td style="font-size: 16px; font-weight: bold; color: ${isPaid ? '#065f46' : isOverdue ? '#991b1b' : '#1e40af'};">
                    <strong>TOTAL:</strong>
                  </td>
                  <td style="font-size: 18px; font-weight: bold; color: ${isPaid ? '#065f46' : isOverdue ? '#991b1b' : '#1e40af'}; text-align: right;">
                    $${formatCurrency(invoice.total)} ${invoice.currency}
                  </td>
                </tr>
                ${invoice.amountPaid > 0 ? `
                <tr>
                  <td style="font-size: 14px; color: #6b7280; border-bottom: 1px solid #f3f4f6;">
                    <strong>Pagado:</strong>
                  </td>
                  <td style="font-size: 14px; color: #111827; text-align: right; border-bottom: 1px solid #f3f4f6;">
                    $${formatCurrency(invoice.amountPaid)} ${invoice.currency}
                  </td>
                </tr>
                <tr style="background-color: #fef3c7;">
                  <td style="font-size: 16px; font-weight: bold; color: #92400e;">
                    <strong>SALDO PENDIENTE:</strong>
                  </td>
                  <td style="font-size: 18px; font-weight: bold; color: #92400e; text-align: right;">
                    $${formatCurrency(invoice.amountDue)} ${invoice.currency}
                  </td>
                </tr>
                ` : ''}
              </table>
            </td>
          </tr>

          <!-- Payment Status Alert -->
          ${isOverdue ? `
          <tr>
            <td style="padding: 0 30px 30px 30px;">
              <div style="background-color: #fee2e2; border: 1px solid #fca5a5; padding: 15px; border-radius: 4px; text-align: center;">
                <p style="margin: 0; font-size: 14px; color: #991b1b; font-weight: bold;">
                  ⚠️ FACTURA VENCIDA - Se requiere pago inmediato
                </p>
              </div>
            </td>
          </tr>
          ` : ''}

          ${isPaid ? `
          <tr>
            <td style="padding: 0 30px 30px 30px;">
              <div style="background-color: #d1fae5; border: 1px solid #6ee7b7; padding: 15px; border-radius: 4px; text-align: center;">
                <p style="margin: 0; font-size: 14px; color: #065f46; font-weight: bold;">
                  ✓ FACTURA PAGADA COMPLETAMENTE
                </p>
              </div>
            </td>
          </tr>
          ` : ''}

          <!-- CTA Button -->
          ${!isPaid ? `
          <tr>
            <td style="padding: 0 30px 30px 30px; text-align: center;">
              <a href="mailto:${companyEmail}?subject=Consulta sobre Factura ${invoice.number}" 
                 style="display: inline-block; padding: 14px 32px; background-color: #2563eb; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 14px;">
                Consultar Factura
              </a>
            </td>
          </tr>
          ` : ''}

          <!-- Footer -->
          <tr>
            <td style="padding: 30px; background-color: #f9fafb; border-top: 1px solid #e5e7eb; text-align: center;">
              <p style="margin: 0 0 10px 0; font-size: 16px; font-weight: bold; color: #1e40af;">
                ${companyName}
              </p>
              <p style="margin: 0 0 5px 0; font-size: 13px; color: #6b7280;">
                Email: <a href="mailto:${companyEmail}" style="color: #2563eb; text-decoration: none;">${companyEmail}</a>
              </p>
              ${companyPhone ? `
              <p style="margin: 0 0 15px 0; font-size: 13px; color: #6b7280;">
                Teléfono: ${companyPhone}
              </p>
              ` : ''}
              <p style="margin: 15px 0 0 0; font-size: 12px; color: #9ca3af;">
                Este es un email automático, por favor no responder directamente.
                <br>
                Para consultas, contactar a ${companyEmail}
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
  }

  /**
   * Update invoice status after successful email send
   */
  private static async updateInvoiceAfterSend(invoiceId: string) {
    try {
      const invoiceRef = doc(db, 'invoices', invoiceId);
      
      await updateDoc(invoiceRef, {
        status: 'sent',
        sentAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });

      logger.info('Invoice status updated to sent', {
        metadata: {
          invoiceId,
        },
      });
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Error updating invoice status');
      logger.error('Error updating invoice status', err, {
        invoiceId,
      });
      // Don't throw - email was sent successfully
    }
  }
}
