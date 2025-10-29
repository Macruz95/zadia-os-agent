/**
 * ZADIA OS - Invoice PDF Header
 * Company info and invoice title
 */

import React from 'react';
import { View, Text, Image } from '@react-pdf/renderer';
import { invoiceStyles } from './invoice-styles';

interface InvoiceHeaderProps {
  invoiceNumber: string;
  companyName: string;
  companyAddress?: string;
  companyPhone?: string;
  companyEmail?: string;
  companyTaxId?: string;
  logoUrl?: string;
}

export function InvoiceHeader({
  invoiceNumber,
  companyName,
  companyAddress,
  companyPhone,
  companyEmail,
  companyTaxId,
  logoUrl,
}: InvoiceHeaderProps) {
  return (
    <>
      <View style={invoiceStyles.header}>
        {logoUrl && (
          // eslint-disable-next-line jsx-a11y/alt-text
          <Image
            src={logoUrl}
            style={invoiceStyles.logo}
          />
        )}
        <View style={invoiceStyles.companyInfo}>
          <Text style={invoiceStyles.companyName}>{companyName}</Text>
          {companyAddress && (
            <Text style={invoiceStyles.companyDetail}>{companyAddress}</Text>
          )}
          {companyPhone && (
            <Text style={invoiceStyles.companyDetail}>Tel: {companyPhone}</Text>
          )}
          {companyEmail && (
            <Text style={invoiceStyles.companyDetail}>Email: {companyEmail}</Text>
          )}
          {companyTaxId && (
            <Text style={invoiceStyles.companyDetail}>NIT: {companyTaxId}</Text>
          )}
        </View>
      </View>

      <Text style={invoiceStyles.title}>FACTURA</Text>
      <Text style={invoiceStyles.invoiceNumber}>
        No. {invoiceNumber}
      </Text>
    </>
  );
}
