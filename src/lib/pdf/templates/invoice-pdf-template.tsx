/**
 * ZADIA OS - Invoice PDF Template (Modular)
 * Professional invoice PDF - Rule #5 compliant <200 lines
 */

import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { Invoice } from '@/modules/finance/types/finance.types';
import { type CurrencyCode } from '@/lib/currency.utils';
import { InvoiceHeader } from './components/InvoiceHeader';
import { InvoiceItemsTable } from './components/InvoiceItemsTable';
import { InvoiceTotals } from './components/InvoiceTotals';
import { InvoiceFooter } from './components/InvoiceFooter';

const pageStyles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: 'Helvetica',
    backgroundColor: '#FFFFFF',
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
  sectionContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  sectionLeft: {
    flex: 1,
    marginRight: 10,
  },
  sectionRight: {
    flex: 1,
    marginLeft: 10,
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
    taxId?: string;
    logo?: string;
  };
}

const formatDate = (timestamp: { toDate?: () => Date } | Date | string) => {
  const date =
    timestamp && typeof timestamp === 'object' && 'toDate' in timestamp
      ? timestamp.toDate!()
      : new Date(timestamp as string | Date);
  return new Intl.DateTimeFormat('es-SV', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
};

export const InvoicePDFTemplate: React.FC<InvoicePDFTemplateProps> = ({
  invoice,
  clientInfo,
  companyInfo,
}) => {
  const totalTax = Object.values(invoice.taxes).reduce((sum, tax) => sum + tax, 0);
  const paymentStatus: 'paid' | 'pending' | 'overdue' =
    invoice.status === 'paid'
      ? 'paid'
      : invoice.status === 'overdue'
      ? 'overdue'
      : 'pending';

  return (
    <Document>
      <Page size="LETTER" style={pageStyles.page}>
        <InvoiceHeader
          invoiceNumber={invoice.number}
          companyName={companyInfo?.name || 'ZADIA Carpintería'}
          companyAddress={companyInfo?.address}
          companyPhone={companyInfo?.phone}
          companyEmail={companyInfo?.email}
          companyTaxId={companyInfo?.taxId}
          logoUrl={companyInfo?.logo}
        />

        <Text style={pageStyles.title}>FACTURA</Text>
        <Text style={pageStyles.invoiceNumber}>{invoice.number}</Text>

        <View style={pageStyles.sectionContainer}>
          <View style={pageStyles.sectionLeft}>
            <Text style={pageStyles.sectionTitle}>Cliente</Text>
            <View style={pageStyles.row}>
              <Text style={pageStyles.label}>Nombre:</Text>
              <Text style={pageStyles.value}>{clientInfo.name}</Text>
            </View>
            {clientInfo.taxId && (
              <View style={pageStyles.row}>
                <Text style={pageStyles.label}>NIT:</Text>
                <Text style={pageStyles.value}>{clientInfo.taxId}</Text>
              </View>
            )}
            {clientInfo.address && (
              <View style={pageStyles.row}>
                <Text style={pageStyles.label}>Dirección:</Text>
                <Text style={pageStyles.value}>{clientInfo.address}</Text>
              </View>
            )}
            {clientInfo.phone && (
              <View style={pageStyles.row}>
                <Text style={pageStyles.label}>Teléfono:</Text>
                <Text style={pageStyles.value}>{clientInfo.phone}</Text>
              </View>
            )}
            {clientInfo.email && (
              <View style={pageStyles.row}>
                <Text style={pageStyles.label}>Email:</Text>
                <Text style={pageStyles.value}>{clientInfo.email}</Text>
              </View>
            )}
          </View>

          <View style={pageStyles.sectionRight}>
            <Text style={pageStyles.sectionTitle}>Detalles de Factura</Text>
            <View style={pageStyles.row}>
              <Text style={pageStyles.label}>Fecha Emisión:</Text>
              <Text style={pageStyles.value}>{formatDate(invoice.issueDate)}</Text>
            </View>
            <View style={pageStyles.row}>
              <Text style={pageStyles.label}>Fecha Vencimiento:</Text>
              <Text style={pageStyles.value}>{formatDate(invoice.dueDate)}</Text>
            </View>
            <View style={pageStyles.row}>
              <Text style={pageStyles.label}>Moneda:</Text>
              <Text style={pageStyles.value}>{invoice.currency}</Text>
            </View>
            {invoice.quoteNumber && (
              <View style={pageStyles.row}>
                <Text style={pageStyles.label}>Cotización:</Text>
                <Text style={pageStyles.value}>{invoice.quoteNumber}</Text>
              </View>
            )}
            {invoice.orderNumber && (
              <View style={pageStyles.row}>
                <Text style={pageStyles.label}>Pedido:</Text>
                <Text style={pageStyles.value}>{invoice.orderNumber}</Text>
              </View>
            )}
          </View>
        </View>

        <InvoiceItemsTable items={invoice.items} currency={invoice.currency as CurrencyCode} />

        <InvoiceTotals
          subtotal={invoice.subtotal}
          tax={totalTax}
          discount={invoice.discounts}
          total={invoice.total}
          currency={invoice.currency as CurrencyCode}
          paymentStatus={paymentStatus}
        />

        {invoice.notes && (
          <View style={pageStyles.notesBox}>
            <Text style={pageStyles.notesTitle}>Notas:</Text>
            <Text style={pageStyles.notesText}>{invoice.notes}</Text>
          </View>
        )}

        <InvoiceFooter
          paymentTerms={invoice.paymentTerms}
          legalText={`Esta factura cumple con las regulaciones fiscales vigentes. Para consultas: ${
            companyInfo?.email || 'contabilidad@empresa.com'
          }`}
        />
      </Page>
    </Document>
  );
};
