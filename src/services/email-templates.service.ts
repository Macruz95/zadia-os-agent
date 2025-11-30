/**
 * ZADIA OS - Email Templates Service
 * 
 * Pre-built email templates for common notifications
 * REGLA 1: Real Resend integration
 * REGLA 4: Modular architecture
 */

import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'ZADIA OS <noreply@zadiaos.com>';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://zadiaos.com';

// ============================================
// Template Types
// ============================================
export type EmailTemplate = 
  | 'invoice-created'
  | 'invoice-reminder'
  | 'invoice-overdue'
  | 'payment-received'
  | 'quote-sent'
  | 'team-invitation'
  | 'welcome'
  | 'password-reset'
  | 'project-update'
  | 'task-assigned'
  | 'lead-assigned';

export interface EmailData {
  to: string | string[];
  subject?: string;
  data: Record<string, unknown>;
}

// ============================================
// Send Email with Template
// ============================================
export async function sendTemplatedEmail(
  template: EmailTemplate,
  emailData: EmailData
): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const { subject, html } = generateEmailContent(template, emailData.data);
    
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: emailData.to,
      subject: emailData.subject || subject,
      html,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, id: data?.id };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

// ============================================
// Generate Email Content
// ============================================
function generateEmailContent(
  template: EmailTemplate,
  data: Record<string, unknown>
): { subject: string; html: string } {
  switch (template) {
    case 'invoice-created':
      return invoiceCreatedTemplate(data);
    case 'invoice-reminder':
      return invoiceReminderTemplate(data);
    case 'invoice-overdue':
      return invoiceOverdueTemplate(data);
    case 'payment-received':
      return paymentReceivedTemplate(data);
    case 'quote-sent':
      return quoteSentTemplate(data);
    case 'team-invitation':
      return teamInvitationTemplate(data);
    case 'welcome':
      return welcomeTemplate(data);
    case 'project-update':
      return projectUpdateTemplate(data);
    case 'task-assigned':
      return taskAssignedTemplate(data);
    case 'lead-assigned':
      return leadAssignedTemplate(data);
    default:
      return { subject: 'Notificación de ZADIA OS', html: baseTemplate('Tienes una nueva notificación.') };
  }
}

// ============================================
// Base Template
// ============================================
function baseTemplate(content: string, ctaText?: string, ctaUrl?: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ZADIA OS</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0a0f1a;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0f1a; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #111827; border-radius: 12px; overflow: hidden;">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%); padding: 30px; text-align: center;">
              <h1 style="margin: 0; color: white; font-size: 28px; font-weight: bold;">⚡ ZADIA OS</h1>
              <p style="margin: 8px 0 0; color: rgba(255,255,255,0.8); font-size: 14px;">Sistema Operativo Empresarial</p>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <div style="color: #e5e7eb; font-size: 16px; line-height: 1.6;">
                ${content}
              </div>
              ${ctaText && ctaUrl ? `
              <div style="margin-top: 30px; text-align: center;">
                <a href="${ctaUrl}" style="display: inline-block; background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%); color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600;">${ctaText}</a>
              </div>
              ` : ''}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding: 20px 30px; border-top: 1px solid #374151; text-align: center;">
              <p style="margin: 0; color: #6b7280; font-size: 12px;">
                Este email fue enviado por ZADIA OS<br>
                <a href="${APP_URL}" style="color: #06b6d4;">zadiaos.com</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ============================================
// Invoice Templates
// ============================================
function invoiceCreatedTemplate(data: Record<string, unknown>): { subject: string; html: string } {
  const content = `
    <h2 style="color: white; margin: 0 0 20px;">Nueva Factura Generada</h2>
    <p>Hola <strong style="color: #06b6d4;">${data.clientName}</strong>,</p>
    <p>Se ha generado una nueva factura para usted:</p>
    <div style="background: #1f2937; border-radius: 8px; padding: 20px; margin: 20px 0;">
      <table width="100%" style="color: #e5e7eb;">
        <tr><td style="padding: 8px 0;">Factura #:</td><td style="text-align: right; font-weight: bold; color: #06b6d4;">${data.invoiceNumber}</td></tr>
        <tr><td style="padding: 8px 0;">Fecha:</td><td style="text-align: right;">${data.date}</td></tr>
        <tr><td style="padding: 8px 0;">Vencimiento:</td><td style="text-align: right;">${data.dueDate}</td></tr>
        <tr><td style="padding: 8px 0; border-top: 1px solid #374151; font-weight: bold;">Total:</td><td style="text-align: right; font-weight: bold; font-size: 20px; color: #10b981;">${data.total}</td></tr>
      </table>
    </div>
  `;
  
  return {
    subject: `Factura #${data.invoiceNumber} - ZADIA OS`,
    html: baseTemplate(content, 'Ver Factura', `${APP_URL}/finance/invoices/${data.invoiceId}`),
  };
}

function invoiceReminderTemplate(data: Record<string, unknown>): { subject: string; html: string } {
  const content = `
    <h2 style="color: white; margin: 0 0 20px;">⏰ Recordatorio de Pago</h2>
    <p>Hola <strong style="color: #06b6d4;">${data.clientName}</strong>,</p>
    <p>Le recordamos que tiene una factura pendiente de pago:</p>
    <div style="background: #1f2937; border-radius: 8px; padding: 20px; margin: 20px 0;">
      <table width="100%" style="color: #e5e7eb;">
        <tr><td style="padding: 8px 0;">Factura #:</td><td style="text-align: right; font-weight: bold;">${data.invoiceNumber}</td></tr>
        <tr><td style="padding: 8px 0;">Vencimiento:</td><td style="text-align: right; color: #f59e0b;">${data.dueDate}</td></tr>
        <tr><td style="padding: 8px 0;">Días restantes:</td><td style="text-align: right;">${data.daysRemaining} días</td></tr>
        <tr><td style="padding: 8px 0; border-top: 1px solid #374151;">Total pendiente:</td><td style="text-align: right; font-weight: bold; color: #f59e0b;">${data.total}</td></tr>
      </table>
    </div>
    <p>Por favor, realice el pago antes de la fecha de vencimiento.</p>
  `;
  
  return {
    subject: `Recordatorio: Factura #${data.invoiceNumber} vence pronto`,
    html: baseTemplate(content, 'Pagar Ahora', `${APP_URL}/finance/invoices/${data.invoiceId}`),
  };
}

function invoiceOverdueTemplate(data: Record<string, unknown>): { subject: string; html: string } {
  const content = `
    <h2 style="color: #ef4444; margin: 0 0 20px;">⚠️ Factura Vencida</h2>
    <p>Hola <strong style="color: #06b6d4;">${data.clientName}</strong>,</p>
    <p>Su factura ha excedido la fecha de vencimiento:</p>
    <div style="background: #1f2937; border: 1px solid #ef4444; border-radius: 8px; padding: 20px; margin: 20px 0;">
      <table width="100%" style="color: #e5e7eb;">
        <tr><td style="padding: 8px 0;">Factura #:</td><td style="text-align: right; font-weight: bold;">${data.invoiceNumber}</td></tr>
        <tr><td style="padding: 8px 0;">Vencimiento:</td><td style="text-align: right; color: #ef4444;">${data.dueDate}</td></tr>
        <tr><td style="padding: 8px 0;">Días vencidos:</td><td style="text-align: right; color: #ef4444;">${data.daysOverdue} días</td></tr>
        <tr><td style="padding: 8px 0; border-top: 1px solid #374151;">Total pendiente:</td><td style="text-align: right; font-weight: bold; color: #ef4444;">${data.total}</td></tr>
      </table>
    </div>
    <p>Por favor, contacte con nosotros si tiene algún problema con el pago.</p>
  `;
  
  return {
    subject: `URGENTE: Factura #${data.invoiceNumber} vencida`,
    html: baseTemplate(content, 'Pagar Ahora', `${APP_URL}/finance/invoices/${data.invoiceId}`),
  };
}

function paymentReceivedTemplate(data: Record<string, unknown>): { subject: string; html: string } {
  const content = `
    <h2 style="color: #10b981; margin: 0 0 20px;">✅ Pago Recibido</h2>
    <p>Hola <strong style="color: #06b6d4;">${data.clientName}</strong>,</p>
    <p>Hemos recibido su pago exitosamente:</p>
    <div style="background: #1f2937; border: 1px solid #10b981; border-radius: 8px; padding: 20px; margin: 20px 0;">
      <table width="100%" style="color: #e5e7eb;">
        <tr><td style="padding: 8px 0;">Factura #:</td><td style="text-align: right;">${data.invoiceNumber}</td></tr>
        <tr><td style="padding: 8px 0;">Fecha de pago:</td><td style="text-align: right;">${data.paymentDate}</td></tr>
        <tr><td style="padding: 8px 0;">Método:</td><td style="text-align: right;">${data.paymentMethod}</td></tr>
        <tr><td style="padding: 8px 0; border-top: 1px solid #374151;">Monto pagado:</td><td style="text-align: right; font-weight: bold; color: #10b981;">${data.amount}</td></tr>
      </table>
    </div>
    <p>¡Gracias por su pago!</p>
  `;
  
  return {
    subject: `Pago recibido - Factura #${data.invoiceNumber}`,
    html: baseTemplate(content, 'Ver Recibo', `${APP_URL}/finance/invoices/${data.invoiceId}`),
  };
}

// ============================================
// Quote Template
// ============================================
function quoteSentTemplate(data: Record<string, unknown>): { subject: string; html: string } {
  const content = `
    <h2 style="color: white; margin: 0 0 20px;">📋 Nueva Cotización</h2>
    <p>Hola <strong style="color: #06b6d4;">${data.clientName}</strong>,</p>
    <p>Le enviamos la cotización solicitada:</p>
    <div style="background: #1f2937; border-radius: 8px; padding: 20px; margin: 20px 0;">
      <table width="100%" style="color: #e5e7eb;">
        <tr><td style="padding: 8px 0;">Cotización #:</td><td style="text-align: right; font-weight: bold; color: #06b6d4;">${data.quoteNumber}</td></tr>
        <tr><td style="padding: 8px 0;">Fecha:</td><td style="text-align: right;">${data.date}</td></tr>
        <tr><td style="padding: 8px 0;">Válida hasta:</td><td style="text-align: right;">${data.validUntil}</td></tr>
        <tr><td style="padding: 8px 0; border-top: 1px solid #374151;">Total:</td><td style="text-align: right; font-weight: bold; font-size: 20px; color: #06b6d4;">${data.total}</td></tr>
      </table>
    </div>
    <p>Esta cotización es válida por ${data.validDays} días.</p>
  `;
  
  return {
    subject: `Cotización #${data.quoteNumber} - ZADIA OS`,
    html: baseTemplate(content, 'Ver Cotización', `${APP_URL}/sales/quotes/${data.quoteId}`),
  };
}

// ============================================
// Team Templates
// ============================================
function teamInvitationTemplate(data: Record<string, unknown>): { subject: string; html: string } {
  const content = `
    <h2 style="color: white; margin: 0 0 20px;">👥 Invitación al Equipo</h2>
    <p>Hola,</p>
    <p><strong style="color: #06b6d4;">${data.inviterName}</strong> te ha invitado a unirte a <strong>${data.tenantName}</strong> en ZADIA OS.</p>
    <div style="background: #1f2937; border-radius: 8px; padding: 20px; margin: 20px 0;">
      <table width="100%" style="color: #e5e7eb;">
        <tr><td style="padding: 8px 0;">Organización:</td><td style="text-align: right; font-weight: bold;">${data.tenantName}</td></tr>
        <tr><td style="padding: 8px 0;">Tu rol:</td><td style="text-align: right; color: #06b6d4;">${data.role}</td></tr>
        <tr><td style="padding: 8px 0;">Invitado por:</td><td style="text-align: right;">${data.inviterName}</td></tr>
      </table>
    </div>
    <p>Esta invitación expira en 7 días.</p>
  `;
  
  return {
    subject: `${data.inviterName} te invita a ${data.tenantName}`,
    html: baseTemplate(content, 'Aceptar Invitación', `${APP_URL}/invite/${data.invitationId}`),
  };
}

function welcomeTemplate(data: Record<string, unknown>): { subject: string; html: string } {
  const content = `
    <h2 style="color: white; margin: 0 0 20px;">🎉 ¡Bienvenido a ZADIA OS!</h2>
    <p>Hola <strong style="color: #06b6d4;">${data.userName}</strong>,</p>
    <p>Tu cuenta ha sido creada exitosamente. ZADIA OS es tu nuevo sistema operativo empresarial con IA integrada.</p>
    <div style="background: #1f2937; border-radius: 8px; padding: 20px; margin: 20px 0;">
      <h3 style="color: white; margin: 0 0 15px;">Lo que puedes hacer:</h3>
      <ul style="color: #e5e7eb; margin: 0; padding-left: 20px;">
        <li style="padding: 5px 0;">Gestionar clientes y ventas</li>
        <li style="padding: 5px 0;">Crear cotizaciones y facturas</li>
        <li style="padding: 5px 0;">Controlar inventario</li>
        <li style="padding: 5px 0;">Administrar proyectos</li>
        <li style="padding: 5px 0;">Usar el asistente IA</li>
      </ul>
    </div>
  `;
  
  return {
    subject: '¡Bienvenido a ZADIA OS! 🚀',
    html: baseTemplate(content, 'Ir al Dashboard', `${APP_URL}/dashboard`),
  };
}

// ============================================
// Project/Task Templates
// ============================================
function projectUpdateTemplate(data: Record<string, unknown>): { subject: string; html: string } {
  const content = `
    <h2 style="color: white; margin: 0 0 20px;">📊 Actualización de Proyecto</h2>
    <p>Hay una actualización en el proyecto <strong style="color: #06b6d4;">${data.projectName}</strong>:</p>
    <div style="background: #1f2937; border-radius: 8px; padding: 20px; margin: 20px 0;">
      <p style="color: #e5e7eb; margin: 0;">${data.updateMessage}</p>
    </div>
    <p style="color: #9ca3af;">Actualizado por: ${data.updatedBy}</p>
  `;
  
  return {
    subject: `Actualización: ${data.projectName}`,
    html: baseTemplate(content, 'Ver Proyecto', `${APP_URL}/projects/${data.projectId}`),
  };
}

function taskAssignedTemplate(data: Record<string, unknown>): { subject: string; html: string } {
  const content = `
    <h2 style="color: white; margin: 0 0 20px;">✅ Nueva Tarea Asignada</h2>
    <p>Hola <strong style="color: #06b6d4;">${data.assigneeName}</strong>,</p>
    <p>Se te ha asignado una nueva tarea:</p>
    <div style="background: #1f2937; border-radius: 8px; padding: 20px; margin: 20px 0;">
      <table width="100%" style="color: #e5e7eb;">
        <tr><td style="padding: 8px 0;">Tarea:</td><td style="text-align: right; font-weight: bold;">${data.taskTitle}</td></tr>
        <tr><td style="padding: 8px 0;">Proyecto:</td><td style="text-align: right;">${data.projectName}</td></tr>
        <tr><td style="padding: 8px 0;">Prioridad:</td><td style="text-align: right; color: ${data.priority === 'high' ? '#ef4444' : data.priority === 'medium' ? '#f59e0b' : '#10b981'};">${data.priority}</td></tr>
        <tr><td style="padding: 8px 0;">Fecha límite:</td><td style="text-align: right;">${data.dueDate}</td></tr>
      </table>
    </div>
    <p>Asignada por: ${data.assignedBy}</p>
  `;
  
  return {
    subject: `Nueva tarea: ${data.taskTitle}`,
    html: baseTemplate(content, 'Ver Tarea', `${APP_URL}/tasks`),
  };
}

function leadAssignedTemplate(data: Record<string, unknown>): { subject: string; html: string } {
  const content = `
    <h2 style="color: white; margin: 0 0 20px;">🎯 Nuevo Lead Asignado</h2>
    <p>Hola <strong style="color: #06b6d4;">${data.assigneeName}</strong>,</p>
    <p>Se te ha asignado un nuevo lead:</p>
    <div style="background: #1f2937; border-radius: 8px; padding: 20px; margin: 20px 0;">
      <table width="100%" style="color: #e5e7eb;">
        <tr><td style="padding: 8px 0;">Nombre:</td><td style="text-align: right; font-weight: bold;">${data.leadName}</td></tr>
        <tr><td style="padding: 8px 0;">Empresa:</td><td style="text-align: right;">${data.companyName}</td></tr>
        <tr><td style="padding: 8px 0;">Email:</td><td style="text-align: right;">${data.email}</td></tr>
        <tr><td style="padding: 8px 0;">Teléfono:</td><td style="text-align: right;">${data.phone}</td></tr>
        <tr><td style="padding: 8px 0;">Fuente:</td><td style="text-align: right; color: #06b6d4;">${data.source}</td></tr>
      </table>
    </div>
    <p>¡Contáctalo pronto!</p>
  `;
  
  return {
    subject: `Nuevo lead: ${data.leadName}`,
    html: baseTemplate(content, 'Ver Lead', `${APP_URL}/sales/leads/${data.leadId}`),
  };
}
