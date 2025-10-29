/**
 * ZADIA OS - Invoice PDF Totals
 * Summary of subtotal, taxes, discounts, and grand total
 */

import React from 'react';
import { View, Text } from '@react-pdf/renderer';
import { totalsStyles } from './invoice-styles';
import { formatCurrency, type CurrencyCode } from '@/lib/currency.utils';

interface InvoiceTotalsProps {
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  currency?: CurrencyCode;
  paymentStatus?: 'paid' | 'pending' | 'overdue';
}

export function InvoiceTotals({
  subtotal,
  tax,
  discount,
  total,
  currency = 'USD',
  paymentStatus = 'pending',
}: InvoiceTotalsProps) {
  const getPaymentStatusText = () => {
    switch (paymentStatus) {
      case 'paid':
        return 'PAGADO';
      case 'overdue':
        return 'VENCIDO';
      default:
        return 'PENDIENTE';
    }
  };

  return (
    <View style={totalsStyles.totalsSection}>
      <View style={totalsStyles.totalsBox}>
        <View style={totalsStyles.totalRow}>
          <Text style={totalsStyles.totalLabel}>Subtotal:</Text>
          <Text style={totalsStyles.totalValue}>
            {formatCurrency(subtotal, { currency })}
          </Text>
        </View>

        {discount > 0 && (
          <View style={totalsStyles.totalRow}>
            <Text style={totalsStyles.totalLabel}>Descuento:</Text>
            <Text style={totalsStyles.totalValue}>
              -{formatCurrency(discount, { currency })}
            </Text>
          </View>
        )}

        <View style={totalsStyles.totalRow}>
          <Text style={totalsStyles.totalLabel}>Impuestos:</Text>
          <Text style={totalsStyles.totalValue}>
            {formatCurrency(tax, { currency })}
          </Text>
        </View>

        <View style={totalsStyles.totalRowLast}>
          <Text style={totalsStyles.grandTotalLabel}>TOTAL:</Text>
          <Text style={totalsStyles.grandTotalValue}>
            {formatCurrency(total, { currency })}
          </Text>
        </View>
      </View>

      {/* Payment Status */}
      <View
        style={
          paymentStatus === 'paid'
            ? [totalsStyles.paymentStatusBox, totalsStyles.paymentStatusPaid]
            : totalsStyles.paymentStatusBox
        }
      >
        <Text style={totalsStyles.paymentStatusText}>
          Estado: {getPaymentStatusText()}
        </Text>
      </View>
    </View>
  );
}
