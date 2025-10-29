import { Timestamp, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { logger } from '@/lib/logger';

export class EmailNotificationManager {
  /**
   * Update invoice status after successful email send
   */
  static async updateInvoiceAfterSend(invoiceId: string): Promise<void> {
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

  /**
   * Log email send attempt
   */
  static logEmailSendAttempt(invoiceId: string, recipientEmail: string): void {
    logger.info('Attempting to send invoice email', {
      metadata: {
        invoiceId,
        recipientEmail,
      },
    });
  }

  /**
   * Log email send success
   */
  static logEmailSendSuccess(invoiceId: string, recipientEmail: string): void {
    logger.info('Invoice email sent successfully', {
      metadata: {
        invoiceId,
        recipientEmail,
      },
    });
  }

  /**
   * Log email send failure
   */
  static logEmailSendFailure(error: Error, invoiceId: string, recipientEmail: string): void {
    logger.error('Failed to send invoice email', error, {
      invoiceId,
      metadata: {
        recipientEmail,
      },
    });
  }
}