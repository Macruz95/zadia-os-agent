/**
 * ZADIA OS - Invoice PDF Items Table
 * Line items with quantities, prices, and discounts
 */

import React from 'react';
import { View, Text } from '@react-pdf/renderer';
import { tableStyles } from './invoice-styles';
import { formatCurrency, type CurrencyCode } from '@/lib/currency.utils';
import { InvoiceItem } from '@/modules/finance/types/finance.types';

interface InvoiceItemsTableProps {
  items: InvoiceItem[];
  currency?: CurrencyCode;
}

export function InvoiceItemsTable({ items, currency = 'USD' }: InvoiceItemsTableProps) {
  return (
    <View style={tableStyles.table}>
      {/* Header */}
      <View style={tableStyles.tableHeader}>
        <Text style={tableStyles.colDescription}>Descripción</Text>
        <Text style={tableStyles.colQuantity}>Cantidad</Text>
        <Text style={tableStyles.colPrice}>Precio Unit.</Text>
        <Text style={tableStyles.colDiscount}>Descuento</Text>
        <Text style={tableStyles.colSubtotal}>Subtotal</Text>
      </View>

      {/* Rows */}
      {items.map((item, index) => (
        <View
          key={index}
          style={index % 2 === 0 ? tableStyles.tableRow : tableStyles.tableRowAlt}
        >
          <Text style={tableStyles.colDescription}>{item.description}</Text>
          <Text style={tableStyles.colQuantity}>{item.quantity}</Text>
          <Text style={tableStyles.colPrice}>
            {formatCurrency(item.unitPrice, { currency })}
          </Text>
          <Text style={tableStyles.colDiscount}>
            {item.discount ? `${item.discount}%` : '-'}
          </Text>
          <Text style={tableStyles.colSubtotal}>
            {formatCurrency(item.subtotal, { currency })}
          </Text>
        </View>
      ))}
    </View>
  );
}
