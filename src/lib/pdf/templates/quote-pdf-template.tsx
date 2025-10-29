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
  StyleSheet,
} from '@react-pdf/renderer';
import type { Quote } from '@/modules/sales/types/sales.types';
import { 
  QuotePDFHeader, 
  QuotePDFClientInfo, 
  QuotePDFItemsTable, 
  QuotePDFTotals 
} from './components';

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
 * Estilos básicos del PDF
 */
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: 'Helvetica',
    backgroundColor: '#ffffff',
  },
});

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
        <QuotePDFHeader
          companyInfo={companyInfo}
          quoteNumber={quote.number}
        />

        <QuotePDFClientInfo
          clientInfo={clientInfo}
          quoteDetails={{
            createdAt: quote.createdAt.toDate(),
            validUntil: quote.validUntil.toDate(),
            currency: quote.currency,
          }}
        />

        <QuotePDFItemsTable
          items={quote.items}
          currency={quote.currency}
        />

        <QuotePDFTotals
          subtotal={quote.subtotal}
          totalTaxes={quote.totalTaxes}
          discounts={quote.discounts}
          total={quote.total}
          currency={quote.currency}
          paymentTerms={quote.paymentTerms}
          notes={quote.notes}
          companyInfo={{
            name: companyInfo.name,
            email: companyInfo.email,
          }}
        />
      </Page>
    </Document>
  );
};
