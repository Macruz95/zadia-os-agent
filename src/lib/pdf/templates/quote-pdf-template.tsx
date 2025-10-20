/**
 * ZADIA OS - Quote PDF Template
 * 
 * Template profesional para cotizaciones con branding
 * Rule #2: Usa componentes de @react-pdf/renderer
 * Rule #4: Modular y reutilizable
 * 
 * @module QuotePDFTemplate
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
import type { Quote } from '@/modules/sales/types/sales.types';

/**
 * Props del template
 */
interface QuotePDFTemplateProps {
  quote: Quote;
  companyInfo: {
    name: string;
    address: string;
    phone: string;
    email: string;
    website?: string;
    taxId?: string;
    logo?: string;
  };
  clientInfo: {
    name: string;
    address?: string;
    phone?: string;
    email?: string;
  };
}

/**
 * Estilos del PDF
 */
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: 'Helvetica',
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    borderBottom: '2pt solid #2563eb',
    paddingBottom: 10,
  },
  logo: {
    width: 120,
    height: 60,
    objectFit: 'contain',
  },
  companyInfo: {
    fontSize: 9,
    color: '#666',
    textAlign: 'right',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: 10,
  },
  quoteNumber: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 20,
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: 8,
    borderBottom: '1pt solid #e5e7eb',
    paddingBottom: 4,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  infoLabel: {
    width: 100,
    fontWeight: 'bold',
    color: '#4b5563',
  },
  infoValue: {
    flex: 1,
    color: '#111827',
  },
  table: {
    marginTop: 10,
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    padding: 8,
    fontWeight: 'bold',
    borderBottom: '1pt solid #d1d5db',
  },
  tableRow: {
    flexDirection: 'row',
    padding: 8,
    borderBottom: '0.5pt solid #e5e7eb',
  },
  tableCol1: { width: '40%' },
  tableCol2: { width: '15%', textAlign: 'center' },
  tableCol3: { width: '15%', textAlign: 'right' },
  tableCol4: { width: '15%', textAlign: 'right' },
  tableCol5: { width: '15%', textAlign: 'right' },
  totalsSection: {
    marginTop: 10,
    marginLeft: 'auto',
    width: 200,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
    paddingVertical: 2,
  },
  totalLabel: {
    fontWeight: 'bold',
    color: '#4b5563',
  },
  totalValue: {
    fontWeight: 'bold',
    color: '#111827',
  },
  grandTotal: {
    marginTop: 8,
    paddingTop: 8,
    borderTop: '2pt solid #2563eb',
  },
  grandTotalLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1e40af',
  },
  grandTotalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e40af',
  },
  notes: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#f9fafb',
    borderRadius: 4,
    fontSize: 9,
    color: '#6b7280',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    fontSize: 8,
    color: '#9ca3af',
    borderTop: '1pt solid #e5e7eb',
    paddingTop: 10,
  },
});

/**
 * Formatea moneda
 */
const formatCurrency = (amount: number, currency: string): string => {
  return new Intl.NumberFormat('es-SV', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
  }).format(amount);
};

/**
 * Formatea fecha
 */
const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('es-SV', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
};

/**
 * Componente del PDF de Cotización
 */
export const QuotePDFTemplate: React.FC<QuotePDFTemplateProps> = ({
  quote,
  companyInfo,
  clientInfo,
}) => {
  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        {/* Header con logo e info de empresa */}
        <View style={styles.header}>
          <View>
            {companyInfo.logo && (
              // eslint-disable-next-line jsx-a11y/alt-text
              <Image style={styles.logo} src={companyInfo.logo} />
            )}
          </View>
          <View style={styles.companyInfo}>
            <Text>{companyInfo.name}</Text>
            <Text>{companyInfo.address}</Text>
            <Text>{companyInfo.phone}</Text>
            <Text>{companyInfo.email}</Text>
            {companyInfo.website && <Text>{companyInfo.website}</Text>}
            {companyInfo.taxId && <Text>NIT: {companyInfo.taxId}</Text>}
          </View>
        </View>

        {/* Título y número de cotización */}
        <View>
          <Text style={styles.title}>COTIZACIÓN</Text>
          <Text style={styles.quoteNumber}>No. {quote.number}</Text>
        </View>

        {/* Información del cliente */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cliente</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Nombre:</Text>
            <Text style={styles.infoValue}>{clientInfo.name}</Text>
          </View>
          {clientInfo.address && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Dirección:</Text>
              <Text style={styles.infoValue}>{clientInfo.address}</Text>
            </View>
          )}
          {clientInfo.phone && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Teléfono:</Text>
              <Text style={styles.infoValue}>{clientInfo.phone}</Text>
            </View>
          )}
          {clientInfo.email && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Email:</Text>
              <Text style={styles.infoValue}>{clientInfo.email}</Text>
            </View>
          )}
        </View>

        {/* Información de la cotización */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Detalles</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Fecha:</Text>
            <Text style={styles.infoValue}>
              {formatDate(quote.createdAt.toDate())}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Válida hasta:</Text>
            <Text style={styles.infoValue}>
              {formatDate(quote.validUntil.toDate())}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Moneda:</Text>
            <Text style={styles.infoValue}>{quote.currency}</Text>
          </View>
        </View>

        {/* Tabla de items */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.tableCol1}>Descripción</Text>
            <Text style={styles.tableCol2}>Cant.</Text>
            <Text style={styles.tableCol3}>Precio Unit.</Text>
            <Text style={styles.tableCol4}>Descuento</Text>
            <Text style={styles.tableCol5}>Subtotal</Text>
          </View>

          {quote.items.map((item, index) => (
            <View key={index} style={styles.tableRow}>
              <View style={styles.tableCol1}>
                <Text>{item.description}</Text>
              </View>
              <Text style={styles.tableCol2}>
                {item.quantity} {item.unitOfMeasure}
              </Text>
              <Text style={styles.tableCol3}>
                {formatCurrency(item.unitPrice, quote.currency)}
              </Text>
              <Text style={styles.tableCol4}>
                {item.discount > 0 ? `${item.discount}%` : '-'}
              </Text>
              <Text style={styles.tableCol5}>
                {formatCurrency(item.subtotal, quote.currency)}
              </Text>
            </View>
          ))}
        </View>

        {/* Totales */}
        <View style={styles.totalsSection}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal:</Text>
            <Text style={styles.totalValue}>
              {formatCurrency(quote.subtotal, quote.currency)}
            </Text>
          </View>

          {quote.totalTaxes > 0 && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Impuestos:</Text>
              <Text style={styles.totalValue}>
                {formatCurrency(quote.totalTaxes, quote.currency)}
              </Text>
            </View>
          )}

          {quote.discounts > 0 && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Descuento:</Text>
              <Text style={styles.totalValue}>
                -{formatCurrency(quote.discounts, quote.currency)}
              </Text>
            </View>
          )}

          <View style={[styles.totalRow, styles.grandTotal]}>
            <Text style={styles.grandTotalLabel}>TOTAL:</Text>
            <Text style={styles.grandTotalValue}>
              {formatCurrency(quote.total, quote.currency)}
            </Text>
          </View>
        </View>

        {/* Términos de pago */}
        {quote.paymentTerms && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Términos de Pago</Text>
            <Text style={{ fontSize: 9, color: '#374151' }}>{quote.paymentTerms}</Text>
          </View>
        )}

        {/* Notas adicionales */}
        {quote.notes && (
          <View style={styles.notes}>
            <Text style={{ fontWeight: 'bold', marginBottom: 4 }}>Notas:</Text>
            <Text>{quote.notes}</Text>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text>
            Documento generado el {formatDate(new Date())} por ZADIA OS
          </Text>
          <Text>{companyInfo.name} | {companyInfo.email}</Text>
        </View>
      </Page>
    </Document>
  );
};
