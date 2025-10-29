import React from 'react';
import { View, Text, StyleSheet } from '@react-pdf/renderer';

interface QuotePDFTotalsProps {
  subtotal: number;
  totalTaxes: number;
  discounts: number;
  total: number;
  currency: string;
  paymentTerms?: string;
  notes?: string;
  companyInfo: {
    name: string;
    email: string;
  };
}

const styles = StyleSheet.create({
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

export const QuotePDFTotals: React.FC<QuotePDFTotalsProps> = ({
  subtotal,
  totalTaxes,
  discounts,
  total,
  currency,
  paymentTerms,
  notes,
  companyInfo,
}) => {
  return (
    <>
      {/* Totales */}
      <View style={styles.totalsSection}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Subtotal:</Text>
          <Text style={styles.totalValue}>
            {formatCurrency(subtotal, currency)}
          </Text>
        </View>

        {totalTaxes > 0 && (
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Impuestos:</Text>
            <Text style={styles.totalValue}>
              {formatCurrency(totalTaxes, currency)}
            </Text>
          </View>
        )}

        {discounts > 0 && (
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Descuento:</Text>
            <Text style={styles.totalValue}>
              -{formatCurrency(discounts, currency)}
            </Text>
          </View>
        )}

        <View style={[styles.totalRow, styles.grandTotal]}>
          <Text style={styles.grandTotalLabel}>TOTAL:</Text>
          <Text style={styles.grandTotalValue}>
            {formatCurrency(total, currency)}
          </Text>
        </View>
      </View>

      {/* Términos de pago */}
      {paymentTerms && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Términos de Pago</Text>
          <Text style={{ fontSize: 9, color: '#374151' }}>{paymentTerms}</Text>
        </View>
      )}

      {/* Notas adicionales */}
      {notes && (
        <View style={styles.notes}>
          <Text style={{ fontWeight: 'bold', marginBottom: 4 }}>Notas:</Text>
          <Text>{notes}</Text>
        </View>
      )}

      {/* Footer */}
      <View style={styles.footer}>
        <Text>
          Documento generado el {formatDate(new Date())} por ZADIA OS
        </Text>
        <Text>{companyInfo.name} | {companyInfo.email}</Text>
      </View>
    </>
  );
};