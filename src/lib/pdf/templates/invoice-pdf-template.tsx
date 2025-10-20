/**
 * ZADIA OS - Invoice PDF Template
 * 
 * Professional invoice PDF template with legal compliance
 * REGLA 4: Modular (React-PDF components)
 * REGLA 5: Template complejo pero bien organizado
 */

import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from '@react-pdf/renderer';
import { Invoice } from '@/modules/finance/types/finance.types';

// Styles
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: 'Helvetica',
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
    paddingBottom: 20,
    borderBottom: '2 solid #2563eb',
  },
  logo: {
    width: 120,
    height: 60,
    objectFit: 'contain',
  },
  companyInfo: {
    flex: 1,
    marginLeft: 20,
  },
  companyName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: 4,
  },
  companyDetail: {
    fontSize: 9,
    color: '#64748b',
    marginBottom: 2,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e3a8a',
    textAlign: 'center',
    marginBottom: 20,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  invoiceNumber: {
    fontSize: 14,
    color: '#2563eb',
    textAlign: 'center',
    marginBottom: 30,
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  label: {
    width: '40%',
    fontSize: 9,
    color: '#64748b',
    fontWeight: 'bold',
  },
  value: {
    width: '60%',
    fontSize: 9,
    color: '#1e293b',
  },
  table: {
    marginTop: 20,
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#2563eb',
    padding: 8,
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 9,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: '1 solid #e2e8f0',
    padding: 8,
    fontSize: 9,
  },
  tableRowAlt: {
    flexDirection: 'row',
    backgroundColor: '#f8fafc',
    borderBottom: '1 solid #e2e8f0',
    padding: 8,
    fontSize: 9,
  },
  colDescription: {
    width: '40%',
  },
  colQuantity: {
    width: '15%',
    textAlign: 'center',
  },
  colPrice: {
    width: '15%',
    textAlign: 'right',
  },
  colDiscount: {
    width: '15%',
    textAlign: 'right',
  },
  colSubtotal: {
    width: '15%',
    textAlign: 'right',
    fontWeight: 'bold',
  },
  totalsSection: {
    marginTop: 20,
    alignItems: 'flex-end',
  },
  totalsBox: {
    width: '50%',
    border: '1 solid #e2e8f0',
    borderRadius: 4,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 8,
    borderBottom: '1 solid #e2e8f0',
  },
  totalRowLast: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 8,
  },
  totalLabel: {
    fontSize: 10,
    color: '#64748b',
  },
  totalValue: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  grandTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    backgroundColor: '#2563eb',
    borderRadius: 4,
  },
  grandTotalLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  grandTotalValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  paymentStatusBox: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#fef3c7',
    borderRadius: 4,
    border: '1 solid #fbbf24',
  },
  paymentStatusPaid: {
    backgroundColor: '#d1fae5',
    border: '1 solid #10b981',
  },
  paymentStatusText: {
    fontSize: 10,
    color: '#92400e',
    textAlign: 'center',
  },
  paymentStatusTextPaid: {
    color: '#065f46',
  },
  notesBox: {
    marginTop: 20,
    padding: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 4,
    border: '1 solid #e2e8f0',
  },
  notesTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#475569',
    marginBottom: 4,
  },
  notesText: {
    fontSize: 9,
    color: '#64748b',
    lineHeight: 1.4,
  },
  legalSection: {
    marginTop: 20,
    padding: 12,
    backgroundColor: '#fef2f2',
    borderRadius: 4,
    border: '1 solid #fca5a5',
  },
  legalTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#991b1b',
    marginBottom: 4,
  },
  legalText: {
    fontSize: 8,
    color: '#7f1d1d',
    lineHeight: 1.3,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    fontSize: 8,
    color: '#94a3b8',
    paddingTop: 10,
    borderTop: '1 solid #e2e8f0',
  },
});

interface InvoicePDFTemplateProps {
  invoice: Invoice;
  clientInfo: {
    name: string;
    email?: string;
    phone?: string;
    address?: string;
    taxId?: string;
  };
  companyInfo?: {
    name?: string;
    address?: string;
    phone?: string;
    email?: string;
    website?: string;
    taxId?: string;
    logo?: string;
  };
}

export const InvoicePDFTemplate: React.FC<InvoicePDFTemplateProps> = ({
  invoice,
  clientInfo,
  companyInfo,
}) => {
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

  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          {companyInfo?.logo && (
            // eslint-disable-next-line jsx-a11y/alt-text
            <Image src={companyInfo.logo} style={styles.logo} />
          )}
          <View style={styles.companyInfo}>
            <Text style={styles.companyName}>
              {companyInfo?.name || 'ZADIA Carpintería'}
            </Text>
            {companyInfo?.address && (
              <Text style={styles.companyDetail}>{companyInfo.address}</Text>
            )}
            {companyInfo?.phone && (
              <Text style={styles.companyDetail}>Tel: {companyInfo.phone}</Text>
            )}
            {companyInfo?.email && (
              <Text style={styles.companyDetail}>Email: {companyInfo.email}</Text>
            )}
            {companyInfo?.taxId && (
              <Text style={styles.companyDetail}>NIT: {companyInfo.taxId}</Text>
            )}
          </View>
        </View>

        {/* Title */}
        <Text style={styles.title}>FACTURA</Text>
        <Text style={styles.invoiceNumber}>{invoice.number}</Text>

        {/* Client and Invoice Info */}
        <View style={{ flexDirection: 'row', marginBottom: 20 }}>
          {/* Client Info */}
          <View style={{ flex: 1, marginRight: 10 }}>
            <Text style={styles.sectionTitle}>Cliente</Text>
            <View style={styles.row}>
              <Text style={styles.label}>Nombre:</Text>
              <Text style={styles.value}>{clientInfo.name}</Text>
            </View>
            {clientInfo.taxId && (
              <View style={styles.row}>
                <Text style={styles.label}>NIT:</Text>
                <Text style={styles.value}>{clientInfo.taxId}</Text>
              </View>
            )}
            {clientInfo.address && (
              <View style={styles.row}>
                <Text style={styles.label}>Dirección:</Text>
                <Text style={styles.value}>{clientInfo.address}</Text>
              </View>
            )}
            {clientInfo.phone && (
              <View style={styles.row}>
                <Text style={styles.label}>Teléfono:</Text>
                <Text style={styles.value}>{clientInfo.phone}</Text>
              </View>
            )}
            {clientInfo.email && (
              <View style={styles.row}>
                <Text style={styles.label}>Email:</Text>
                <Text style={styles.value}>{clientInfo.email}</Text>
              </View>
            )}
          </View>

          {/* Invoice Details */}
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={styles.sectionTitle}>Detalles de Factura</Text>
            <View style={styles.row}>
              <Text style={styles.label}>Fecha Emisión:</Text>
              <Text style={styles.value}>{formatDate(invoice.issueDate)}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Fecha Vencimiento:</Text>
              <Text style={styles.value}>{formatDate(invoice.dueDate)}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Moneda:</Text>
              <Text style={styles.value}>{invoice.currency}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Términos de Pago:</Text>
              <Text style={styles.value}>{invoice.paymentTerms}</Text>
            </View>
            {invoice.quoteNumber && (
              <View style={styles.row}>
                <Text style={styles.label}>Cotización:</Text>
                <Text style={styles.value}>{invoice.quoteNumber}</Text>
              </View>
            )}
            {invoice.orderNumber && (
              <View style={styles.row}>
                <Text style={styles.label}>Pedido:</Text>
                <Text style={styles.value}>{invoice.orderNumber}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Items Table */}
        <View style={styles.table}>
          {/* Header */}
          <View style={styles.tableHeader}>
            <Text style={styles.colDescription}>Descripción</Text>
            <Text style={styles.colQuantity}>Cantidad</Text>
            <Text style={styles.colPrice}>P. Unitario</Text>
            <Text style={styles.colDiscount}>Descuento</Text>
            <Text style={styles.colSubtotal}>Subtotal</Text>
          </View>

          {/* Rows */}
          {invoice.items.map((item, index) => (
            <View
              key={index}
              style={index % 2 === 0 ? styles.tableRow : styles.tableRowAlt}
            >
              <Text style={styles.colDescription}>
                {item.description}
                {item.unitOfMeasure && ` (${item.unitOfMeasure})`}
              </Text>
              <Text style={styles.colQuantity}>{item.quantity}</Text>
              <Text style={styles.colPrice}>
                ${formatCurrency(item.unitPrice)}
              </Text>
              <Text style={styles.colDiscount}>
                {item.discount > 0 ? `${item.discount}%` : '-'}
              </Text>
              <Text style={styles.colSubtotal}>
                ${formatCurrency(item.subtotal)}
              </Text>
            </View>
          ))}
        </View>

        {/* Totals */}
        <View style={styles.totalsSection}>
          <View style={styles.totalsBox}>
            {/* Subtotal */}
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Subtotal:</Text>
              <Text style={styles.totalValue}>
                ${formatCurrency(invoice.subtotal)} {invoice.currency}
              </Text>
            </View>

            {/* Taxes */}
            {Object.entries(invoice.taxes).map(([taxName, taxAmount]) => (
              <View key={taxName} style={styles.totalRow}>
                <Text style={styles.totalLabel}>{taxName}:</Text>
                <Text style={styles.totalValue}>
                  ${formatCurrency(taxAmount)} {invoice.currency}
                </Text>
              </View>
            ))}

            {/* Discounts */}
            {invoice.discounts > 0 && (
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Descuentos:</Text>
                <Text style={styles.totalValue}>
                  -${formatCurrency(invoice.discounts)} {invoice.currency}
                </Text>
              </View>
            )}

            {/* Total */}
            <View style={styles.totalRowLast}>
              <Text style={styles.totalLabel}>TOTAL:</Text>
              <Text style={styles.totalValue}>
                ${formatCurrency(invoice.total)} {invoice.currency}
              </Text>
            </View>
          </View>

          {/* Grand Total Highlight */}
          <View style={[styles.totalsBox, { marginTop: 10 }]}>
            <View style={styles.grandTotalRow}>
              <Text style={styles.grandTotalLabel}>MONTO TOTAL:</Text>
              <Text style={styles.grandTotalValue}>
                ${formatCurrency(invoice.total)} {invoice.currency}
              </Text>
            </View>
          </View>

          {/* Payment Status */}
          {invoice.amountPaid > 0 && (
            <View style={[styles.totalsBox, { marginTop: 10 }]}>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Pagado:</Text>
                <Text style={styles.totalValue}>
                  ${formatCurrency(invoice.amountPaid)} {invoice.currency}
                </Text>
              </View>
              <View style={styles.totalRowLast}>
                <Text style={styles.totalLabel}>Saldo Pendiente:</Text>
                <Text style={styles.totalValue}>
                  ${formatCurrency(invoice.amountDue)} {invoice.currency}
                </Text>
              </View>
            </View>
          )}

          {/* Payment Status Badge */}
          <View
            style={
              isPaid
                ? [styles.paymentStatusBox, styles.paymentStatusPaid]
                : styles.paymentStatusBox
            }
          >
            <Text
              style={
                isPaid
                  ? [styles.paymentStatusText, styles.paymentStatusTextPaid]
                  : styles.paymentStatusText
              }
            >
              {isPaid
                ? '✓ PAGADO COMPLETAMENTE'
                : isOverdue
                ? '⚠ VENCIDA - PAGO URGENTE'
                : `⏳ SALDO PENDIENTE: $${formatCurrency(invoice.amountDue)} ${invoice.currency}`}
            </Text>
          </View>
        </View>

        {/* Payment Terms / Notes */}
        {invoice.notes && (
          <View style={styles.notesBox}>
            <Text style={styles.notesTitle}>Notas:</Text>
            <Text style={styles.notesText}>{invoice.notes}</Text>
          </View>
        )}

        {/* Legal Section */}
        <View style={styles.legalSection}>
          <Text style={styles.legalTitle}>TÉRMINOS Y CONDICIONES LEGALES</Text>
          <Text style={styles.legalText}>
            Esta factura es un documento legal y fiscal. El pago debe realizarse según los términos establecidos.
            El no pago en la fecha de vencimiento puede resultar en intereses moratorios y acciones legales.
            Esta factura cumple con las regulaciones fiscales vigentes en El Salvador.
            Para cualquier consulta o aclaración, contactar a {companyInfo?.email || 'contabilidad@empresa.com'}.
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>
            Documento generado el {new Intl.DateTimeFormat('es-SV', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            }).format(new Date())}
          </Text>
          <Text style={{ marginTop: 4 }}>
            {companyInfo?.name || 'ZADIA Carpintería'} • {companyInfo?.email || 'contacto@empresa.com'}
          </Text>
        </View>
      </Page>
    </Document>
  );
};
