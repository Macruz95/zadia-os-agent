import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export interface EmailData {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  from?: string;
}

export interface EmailTemplate {
  subject: string;
  html: string;
  text?: string;
}

/**
 * Service for sending emails using Resend
 */
export class EmailService {
  private static readonly DEFAULT_FROM = 'ZADIA OS <noreply@zadia-os.com>';

  /**
   * Send a basic email
   */
  static async sendEmail(data: EmailData): Promise<{ success: boolean; id?: string; error?: string }> {
    try {
      const from = data.from || this.DEFAULT_FROM;

      // Ensure we have at least text content
      const emailData = {
        from,
        to: data.to,
        subject: data.subject,
        text: data.text || (data.html ? 'This email contains HTML content. Please view in an HTML-compatible email client.' : ''),
        ...(data.html && { html: data.html }),
      };

      const result = await resend.emails.send(emailData);

      console.log('📧 Email sent successfully:', result);
      return { success: true, id: result.data?.id };
    } catch (error) {
      console.error('❌ Error sending email:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Send email to client contact
   */
  static async sendToClientContact(
    contactEmail: string,
    contactName: string,
    subject: string,
    content: string,
    clientName?: string
  ): Promise<{ success: boolean; id?: string; error?: string }> {
    const personalizedSubject = clientName ? `${subject} - ${clientName}` : subject;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>${personalizedSubject}</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #2563eb;">${personalizedSubject}</h2>
            <p>Hola ${contactName},</p>
            <div style="margin: 20px 0;">
              ${content.replace(/\n/g, '<br>')}
            </div>
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            <p style="color: #666; font-size: 14px;">
              Este correo fue enviado desde ZADIA OS.<br>
              Si tienes alguna pregunta, no dudes en contactarnos.
            </p>
          </div>
        </body>
      </html>
    `;

    const textContent = `
Hola ${contactName},

${content}

---
Este correo fue enviado desde ZADIA OS.
Si tienes alguna pregunta, no dudes en contactarnos.
    `.trim();

    return this.sendEmail({
      to: contactEmail,
      subject: personalizedSubject,
      html: htmlContent,
      text: textContent,
    });
  }

  /**
   * Send bulk emails to multiple contacts
   */
  static async sendBulkEmails(
    contacts: Array<{ email: string; name: string }>,
    subject: string,
    content: string,
    clientName?: string
  ): Promise<Array<{ email: string; success: boolean; id?: string; error?: string }>> {
    const results = await Promise.allSettled(
      contacts.map(contact =>
        this.sendToClientContact(
          contact.email,
          contact.name,
          subject,
          content,
          clientName
        )
      )
    );

    return results.map((result, index) => {
      const contact = contacts[index];
      if (result.status === 'fulfilled') {
        return {
          email: contact.email,
          ...result.value
        };
      } else {
        return {
          email: contact.email,
          success: false,
          error: result.reason?.message || 'Unknown error'
        };
      }
    });
  }

  /**
   * Validate email format
   */
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}