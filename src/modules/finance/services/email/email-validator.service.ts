import { z } from 'zod';

export const SendInvoiceEmailOptionsSchema = z.object({
  invoiceId: z.string().min(1, 'ID de factura requerido'),
  recipientEmail: z.string().email('Email del destinatario inválido'),
  customMessage: z.string().optional(),
  includePaymentInstructions: z.boolean().default(true),
  sendCopy: z.boolean().default(false),
  copyEmail: z.string().email('Email de copia inválido').optional(),
});

export type SendInvoiceEmailOptions = z.infer<typeof SendInvoiceEmailOptionsSchema>;

export class EmailValidator {
  /**
   * Validate send invoice email options
   */
  static validateSendOptions(options: unknown): SendInvoiceEmailOptions {
    try {
      return SendInvoiceEmailOptionsSchema.parse(options);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessages = error.issues.map(err => `${err.path.join('.')}: ${err.message}`).join(', ');
        throw new Error(`Validation error: ${errorMessages}`);
      }
      throw new Error('Invalid options provided');
    }
  }

  /**
   * Validate email address format
   */
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate that copy email is provided when sendCopy is true
   */
  static validateCopyEmailRequirement(options: SendInvoiceEmailOptions): void {
    if (options.sendCopy && !options.copyEmail) {
      throw new Error('Copy email is required when sendCopy is true');
    }
  }
}