import { formatCurrency } from '@/lib/currency.utils';
import type { Invoice } from '@/modules/finance/types/finance.types';
import type { Timestamp } from 'firebase/firestore';

export class EmailTemplateBuilder {
  /**
   * Generate HTML email template for invoice
   */
  static generateInvoiceEmailTemplate(
    invoice: Invoice,
    customMessage?: string,
    companyName: string = 'Zadia',
    companyEmail: string = 'facturacion@zadia.com',
    companyPhone?: string
  ): string {
    const isPaid = invoice.status === 'paid';
    const isOverdue = !isPaid && new Date(invoice.dueDate.toDate()) < new Date();

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
          
          ${this.generateEmailHeader(invoice)}
          ${this.generateEmailGreeting(invoice, customMessage)}
          ${this.generateInvoiceSummary(invoice, isPaid, isOverdue)}
          ${this.generateStatusAlerts(isPaid, isOverdue)}
          ${this.generateCallToAction(isPaid, invoice, companyEmail)}
          ${this.generateEmailFooter(companyName, companyEmail, companyPhone)}

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim();
  }

  /**
   * Generate email header section
   */
  private static generateEmailHeader(invoice: Invoice): string {
    return `
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
          </tr>`;
  }

  /**
   * Generate email greeting and custom message section
   */
  private static generateEmailGreeting(invoice: Invoice, customMessage?: string): string {
    return `
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
          ` : ''}`;
  }

  /**
   * Generate invoice summary table
   */
  private static generateInvoiceSummary(invoice: Invoice, isPaid: boolean, isOverdue: boolean): string {
    const formatDate = (timestamp: Timestamp) => {
      return timestamp.toDate().toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    };

    return `
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
          </tr>`;
  }

  /**
   * Generate payment status alerts
   */
  private static generateStatusAlerts(isPaid: boolean, isOverdue: boolean): string {
    let alerts = '';

    if (isOverdue) {
      alerts += `
          <tr>
            <td style="padding: 0 30px 30px 30px;">
              <div style="background-color: #fee2e2; border: 1px solid #fca5a5; padding: 15px; border-radius: 4px; text-align: center;">
                <p style="margin: 0; font-size: 14px; color: #991b1b; font-weight: bold;">
                  ⚠️ FACTURA VENCIDA - Se requiere pago inmediato
                </p>
              </div>
            </td>
          </tr>`;
    }

    if (isPaid) {
      alerts += `
          <tr>
            <td style="padding: 0 30px 30px 30px;">
              <div style="background-color: #d1fae5; border: 1px solid #6ee7b7; padding: 15px; border-radius: 4px; text-align: center;">
                <p style="margin: 0; font-size: 14px; color: #065f46; font-weight: bold;">
                  ✓ FACTURA PAGADA COMPLETAMENTE
                </p>
              </div>
            </td>
          </tr>`;
    }

    return alerts;
  }

  /**
   * Generate call to action button
   */
  private static generateCallToAction(isPaid: boolean, invoice: Invoice, companyEmail: string): string {
    if (isPaid) return '';

    return `
          <!-- CTA Button -->
          <tr>
            <td style="padding: 0 30px 30px 30px; text-align: center;">
              <a href="mailto:${companyEmail}?subject=Consulta sobre Factura ${invoice.number}" 
                 style="display: inline-block; padding: 14px 32px; background-color: #2563eb; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 14px;">
                Consultar Factura
              </a>
            </td>
          </tr>`;
  }

  /**
   * Generate email footer
   */
  private static generateEmailFooter(companyName: string, companyEmail: string, companyPhone?: string): string {
    return `
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
          </tr>`;
  }
}