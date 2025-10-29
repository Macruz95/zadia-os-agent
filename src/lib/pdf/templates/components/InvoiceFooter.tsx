/**
 * ZADIA OS - Invoice PDF Footer
 * Payment terms, legal text, and page numbers
 */

import React from 'react';
import { View, Text } from '@react-pdf/renderer';
import { invoiceStyles } from './invoice-styles';

interface InvoiceFooterProps {
  paymentTerms?: string;
  bankAccount?: string;
  legalText?: string;
  showPageNumbers?: boolean;
}

export function InvoiceFooter({
  paymentTerms = 'Pago contra entrega o según términos acordados',
  bankAccount,
  legalText,
  showPageNumbers = true,
}: InvoiceFooterProps) {
  return (
    <View style={invoiceStyles.footer}>
      {/* Payment Terms */}
      {paymentTerms && (
        <View style={invoiceStyles.footerSection}>
          <Text style={invoiceStyles.footerTitle}>Términos de Pago:</Text>
          <Text style={invoiceStyles.footerText}>{paymentTerms}</Text>
        </View>
      )}

      {/* Bank Account */}
      {bankAccount && (
        <View style={invoiceStyles.footerSection}>
          <Text style={invoiceStyles.footerTitle}>Cuenta Bancaria:</Text>
          <Text style={invoiceStyles.footerText}>{bankAccount}</Text>
        </View>
      )}

      {/* Legal Text */}
      {legalText && (
        <View style={invoiceStyles.footerSection}>
          <Text style={invoiceStyles.footerText}>{legalText}</Text>
        </View>
      )}

      {/* Page Numbers */}
      {showPageNumbers && (
        <Text
          style={invoiceStyles.pageNumber}
          render={({ pageNumber, totalPages }) =>
            `Página ${pageNumber} de ${totalPages}`
          }
          fixed
        />
      )}

      {/* Divider */}
      <View style={invoiceStyles.divider} />

      <Text style={invoiceStyles.footerDisclaimer}>
        Documento generado electrónicamente por ZADIA OS
      </Text>
    </View>
  );
}
