/**
 * ZADIA OS - Email Service
 * 
 * Motor común para envío de emails profesionales
 * Rule #1: Real operations (Resend API)
 * Rule #3: Zod validation en inputs
 * Rule #4: Servicio modular y reutilizable
 * 
 * @module EmailService
 */

import { Resend } from 'resend';
import { z } from 'zod';
import { logger } from '@/lib/logger';

/**
 * Validación de configuración de email
 */
const emailConfigSchema = z.object({
  from: z.string().email(),
  to: z.union([z.string().email(), z.array(z.string().email())]),
  subject: z.string().min(1),
  html: z.string().min(1),
  replyTo: z.string().email().optional(),
  cc: z.union([z.string().email(), z.array(z.string().email())]).optional(),
  bcc: z.union([z.string().email(), z.array(z.string().email())]).optional(),
});

/**
 * Configuración de email
 */
export type EmailConfig = z.infer<typeof emailConfigSchema>;

/**
 * Adjunto de email
 */
export interface EmailAttachment {
  /** Nombre del archivo */
  filename: string;
  /** Contenido (Buffer o base64) */
  content: Buffer | string;
  /** Tipo MIME */
  contentType?: string;
}

/**
 * Resultado de envío de email
 */
export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Configuración del servicio
 */
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const DEFAULT_FROM = process.env.EMAIL_FROM || 'ZADIA OS <noreply@zadia.com>';

// Inicializar Resend solo si hay API key
const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

/**
 * Servicio de Email
 */
export const EmailService = {
  /**
   * Envia un email
   * 
   * @param config - Configuración del email
   * @param attachments - Archivos adjuntos (opcional)
   * @returns Resultado del envío
   */
  async sendEmail(
    config: EmailConfig,
    attachments?: EmailAttachment[]
  ): Promise<EmailResult> {
    try {
      // Validar configuración
      const validatedConfig = emailConfigSchema.parse(config);

      // Verificar que Resend esté configurado
      if (!resend) {
        logger.error('Resend API key no configurada');
        return {
          success: false,
          error: 'Servicio de email no configurado. Configure RESEND_API_KEY en variables de entorno.',
        };
      }

      logger.info('Enviando email', { metadata: { subject: validatedConfig.subject } });

      // Preparar datos para Resend
      const emailData: {
        from: string;
        to: string[];
        subject: string;
        html: string;
        replyTo?: string;
        cc?: string[];
        bcc?: string[];
        attachments?: Array<{
          filename: string;
          content: Buffer | string;
          contentType?: string;
        }>;
      } = {
        from: validatedConfig.from || DEFAULT_FROM,
        to: Array.isArray(validatedConfig.to) ? validatedConfig.to : [validatedConfig.to],
        subject: validatedConfig.subject,
        html: validatedConfig.html,
      };

      // Agregar campos opcionales
      if (validatedConfig.replyTo) {
        emailData.replyTo = validatedConfig.replyTo;
      }
      if (validatedConfig.cc) {
        emailData.cc = Array.isArray(validatedConfig.cc) ? validatedConfig.cc : [validatedConfig.cc];
      }
      if (validatedConfig.bcc) {
        emailData.bcc = Array.isArray(validatedConfig.bcc) ? validatedConfig.bcc : [validatedConfig.bcc];
      }

      // Agregar adjuntos si existen
      if (attachments && attachments.length > 0) {
        emailData.attachments = attachments.map(att => ({
          filename: att.filename,
          content: att.content,
          contentType: att.contentType,
        }));
      }

      // Enviar email
      const response = await resend.emails.send(emailData);

      if (response.error) {
        logger.error('Error al enviar email', response.error);
        return {
          success: false,
          error: response.error.message || 'Error al enviar email',
        };
      }

      logger.info('Email enviado exitosamente', { metadata: { messageId: response.data?.id } });

      return {
        success: true,
        messageId: response.data?.id,
      };

    } catch (error) {
      if (error instanceof z.ZodError) {
        logger.error('Error de validación en email config');
        return {
          success: false,
          error: `Configuración inválida: ${error.issues.map((e: z.ZodIssue) => e.message).join(', ')}`,
        };
      }

      const err = error as Error;
      logger.error('Error enviando email', err);
      return {
        success: false,
        error: err?.message || 'Error desconocido',
      };
    }
  },

  /**
   * Verifica si el servicio de email está configurado
   * 
   * @returns true si Resend está configurado
   */
  isConfigured(): boolean {
    return !!resend;
  },

  /**
   * Obtiene la dirección de remitente por defecto
   * 
   * @returns Email del remitente
   */
  getDefaultFrom(): string {
    return DEFAULT_FROM;
  },
};
