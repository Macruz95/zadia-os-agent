import React from 'react';
import { View, Text, Image, StyleSheet } from '@react-pdf/renderer';

interface QuotePDFHeaderProps {
  companyInfo: {
    name: string;
    address: string;
    phone: string;
    email: string;
    website?: string;
    taxId?: string;
    logo?: string;
  };
  quoteNumber: string;
}

const styles = StyleSheet.create({
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
});

export const QuotePDFHeader: React.FC<QuotePDFHeaderProps> = ({
  companyInfo,
  quoteNumber,
}) => {
  return (
    <>
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
        <Text style={styles.quoteNumber}>No. {quoteNumber}</Text>
      </View>
    </>
  );
};