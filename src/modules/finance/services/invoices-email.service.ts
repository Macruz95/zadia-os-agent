import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { logger } from '@/lib/logger';
import { EmailValidator, EmailSender } from './email';
import type { Invoice } from '@/modules/finance/types/finance.types';

export class InvoicesEmailService {
  /**
   * Send invoice email with PDF attachment
   */
  static async sendInvoiceEmail(options: unknown): Promise<void> {
    // Validate options
    const validatedOptions = EmailValidator.validateSendOptions(options);
    EmailValidator.validateCopyEmailRequirement(validatedOptions);

    // Get invoice from database
    const invoice = await this.getInvoiceById(validatedOptions.invoiceId);
    
    // Send email using the EmailSender service
    await EmailSender.sendInvoiceEmail(invoice, validatedOptions);
  }

  /**
   * Send reminder email for overdue invoice
   */
  static async sendReminderEmail(
    invoiceId: string, 
    recipientEmail: string, 
    reminderMessage?: string
  ): Promise<void> {
    // Validate email format
    if (!EmailValidator.isValidEmail(recipientEmail)) {
      throw new Error('Invalid recipient email format');
    }

    // Get invoice from database
    const invoice = await this.getInvoiceById(invoiceId);
    
    // Send reminder email
    await EmailSender.sendReminderEmail(invoice, recipientEmail, reminderMessage);
  }

  /**
   * Get invoice by ID from Firestore
   */
  private static async getInvoiceById(invoiceId: string): Promise<Invoice> {
    try {
      const invoiceRef = doc(db, 'invoices', invoiceId);
      const invoiceDoc = await getDoc(invoiceRef);

      if (!invoiceDoc.exists()) {
        throw new Error(`Invoice with ID ${invoiceId} not found`);
      }

      return {
        id: invoiceDoc.id,
        ...invoiceDoc.data(),
      } as Invoice;
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Unknown error occurred');
      logger.error('Error fetching invoice', err, {
        invoiceId,
      });
      throw new Error(`Failed to fetch invoice: ${err.message}`);
    }
  }
}