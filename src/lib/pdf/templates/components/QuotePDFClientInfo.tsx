import React from 'react';
import { View, Text, StyleSheet } from '@react-pdf/renderer';

interface QuotePDFClientInfoProps {
  clientInfo: {
    name: string;
    address?: string;
    phone?: string;
    email?: string;
  };
  quoteDetails: {
    createdAt: Date;
    validUntil: Date;
    currency: string;
  };
}

const styles = StyleSheet.create({
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
});

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

export const QuotePDFClientInfo: React.FC<QuotePDFClientInfoProps> = ({
  clientInfo,
  quoteDetails,
}) => {
  return (
    <>
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
            {formatDate(quoteDetails.createdAt)}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Válida hasta:</Text>
          <Text style={styles.infoValue}>
            {formatDate(quoteDetails.validUntil)}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Moneda:</Text>
          <Text style={styles.infoValue}>{quoteDetails.currency}</Text>
        </View>
      </View>
    </>
  );
};