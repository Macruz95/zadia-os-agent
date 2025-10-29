import React from 'react';
import { EmailService } from '@/lib/email/email.service';
import { PDFGeneratorService } from '@/lib/pdf/pdf-generator.service';
import { InvoicePDFTemplate } from '@/lib/pdf/templates/invoice-pdf-template';
import { EmailTemplateBuilder } from './email-template-builder.service';
import { EmailNotificationManager } from './email-notification-manager.service';
import type { Invoice } from '@/modules/finance/types/finance.types';
import type { SendInvoiceEmailOptions } from './email-validator.service';

export class EmailSender {
  /**
   * Send invoice email with PDF attachment
   */
  static async sendInvoiceEmail(
    invoice: Invoice,
    options: SendInvoiceEmailOptions
  ): Promise<void> {
    EmailNotificationManager.logEmailSendAttempt(options.invoiceId, options.recipientEmail);

    try {
      // Generate PDF
      const pdfComponent = React.createElement(InvoicePDFTemplate, { 
        invoice,
        clientInfo: {
          name: invoice.clientName,
        },
        companyInfo: {
          name: 'Zadia',
          email: 'facturacion@zadia.com',
        }
      });
      
      const pdfResult = await PDFGeneratorService.generatePDF(pdfComponent, {
        fileName: `Factura_${invoice.number}.pdf`,
        storagePath: 'invoices/temp',
        saveToStorage: false,
      });

      if (!pdfResult.success || !pdfResult.blob) {
        throw new Error('Failed to generate PDF');
      }

      // Convert blob to buffer for email attachment
      const pdfBuffer = Buffer.from(await pdfResult.blob.arrayBuffer());
      
      // Generate HTML template
      const htmlContent = EmailTemplateBuilder.generateInvoiceEmailTemplate(
        invoice,
        options.customMessage
      );

      // Prepare email recipients
      const recipients = [options.recipientEmail];
      if (options.sendCopy && options.copyEmail) {
        recipients.push(options.copyEmail);
      }

      // Send email with PDF attachment
      await EmailService.sendEmail({
        from: 'facturacion@zadia.com',
        to: recipients,
        subject: `Factura ${invoice.number} - ${invoice.clientName}`,
        html: htmlContent,
      }, [
        {
          filename: `Factura_${invoice.number}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf',
        },
      ]);

      // Update invoice status
      await EmailNotificationManager.updateInvoiceAfterSend(options.invoiceId);

      EmailNotificationManager.logEmailSendSuccess(options.invoiceId, options.recipientEmail);
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Unknown error occurred');
      EmailNotificationManager.logEmailSendFailure(err, options.invoiceId, options.recipientEmail);
      throw new Error(`Failed to send invoice email: ${err.message}`);
    }
  }

  /**
   * Send reminder email for overdue invoice
   */
  static async sendReminderEmail(
    invoice: Invoice,
    recipientEmail: string,
    reminderMessage?: string
  ): Promise<void> {
    EmailNotificationManager.logEmailSendAttempt(invoice.id, recipientEmail);

    try {
      const customMessage = reminderMessage || 
        `Esta factura está vencida desde el ${invoice.dueDate.toDate().toLocaleDateString('es-ES')}. Por favor, proceda con el pago lo antes posible.`;

      const htmlContent = EmailTemplateBuilder.generateInvoiceEmailTemplate(
        invoice,
        customMessage
      );

      await EmailService.sendEmail({
        from: 'facturacion@zadia.com',
        to: [recipientEmail],
        subject: `RECORDATORIO: Factura Vencida ${invoice.number} - ${invoice.clientName}`,
        html: htmlContent,
      });

      EmailNotificationManager.logEmailSendSuccess(invoice.id, recipientEmail);
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Unknown error occurred');
      EmailNotificationManager.logEmailSendFailure(err, invoice.id, recipientEmail);
      throw new Error(`Failed to send reminder email: ${err.message}`);
    }
  }
}