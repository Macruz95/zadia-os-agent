import React from 'react';
import { View, Text, StyleSheet } from '@react-pdf/renderer';
import type { QuoteItem } from '@/modules/sales/types/sales.types';

interface QuotePDFItemsTableProps {
  items: QuoteItem[];
  currency: string;
}

const styles = StyleSheet.create({
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

export const QuotePDFItemsTable: React.FC<QuotePDFItemsTableProps> = ({
  items,
  currency,
}) => {
  return (
    <View style={styles.table}>
      <View style={styles.tableHeader}>
        <Text style={styles.tableCol1}>Descripción</Text>
        <Text style={styles.tableCol2}>Cant.</Text>
        <Text style={styles.tableCol3}>Precio Unit.</Text>
        <Text style={styles.tableCol4}>Descuento</Text>
        <Text style={styles.tableCol5}>Subtotal</Text>
      </View>

      {items.map((item, index) => (
        <View key={index} style={styles.tableRow}>
          <View style={styles.tableCol1}>
            <Text>{item.description}</Text>
          </View>
          <Text style={styles.tableCol2}>
            {item.quantity} {item.unitOfMeasure}
          </Text>
          <Text style={styles.tableCol3}>
            {formatCurrency(item.unitPrice, currency)}
          </Text>
          <Text style={styles.tableCol4}>
            {item.discount > 0 ? `${item.discount}%` : '-'}
          </Text>
          <Text style={styles.tableCol5}>
            {formatCurrency(item.subtotal, currency)}
          </Text>
        </View>
      ))}
    </View>
  );
};