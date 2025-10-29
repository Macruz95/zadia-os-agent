/**
 * ZADIA OS - Invoice PDF Styles
 * Shared styles for invoice PDF components
 */

import { StyleSheet } from '@react-pdf/renderer';

export const invoiceStyles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: 'Helvetica',
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
    paddingBottom: 20,
    borderBottom: '2 solid #2563eb',
  },
  logo: {
    width: 120,
    height: 60,
    objectFit: 'contain',
  },
  companyInfo: {
    flex: 1,
    marginLeft: 20,
  },
  companyName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: 4,
  },
  companyDetail: {
    fontSize: 9,
    color: '#64748b',
    marginBottom: 2,
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
  section: {
    marginBottom: 20,
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
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    paddingTop: 15,
    borderTop: '1 solid #e2e8f0',
  },
  footerSection: {
    marginBottom: 8,
  },
  footerTitle: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 2,
  },
  footerText: {
    fontSize: 8,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 3,
  },
  footerBold: {
    fontWeight: 'bold',
    color: '#1e293b',
  },
  footerDisclaimer: {
    fontSize: 7,
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: 8,
  },
  pageNumber: {
    fontSize: 8,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 10,
  },
  divider: {
    borderTop: '1 solid #e2e8f0',
    marginVertical: 8,
  },
});

export const tableStyles = StyleSheet.create({
  table: {
    marginTop: 20,
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#2563eb',
    padding: 8,
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 9,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: '1 solid #e2e8f0',
    padding: 8,
    fontSize: 9,
  },
  tableRowAlt: {
    flexDirection: 'row',
    backgroundColor: '#f8fafc',
    borderBottom: '1 solid #e2e8f0',
    padding: 8,
    fontSize: 9,
  },
  colDescription: {
    width: '40%',
  },
  colQuantity: {
    width: '15%',
    textAlign: 'center',
  },
  colPrice: {
    width: '15%',
    textAlign: 'right',
  },
  colDiscount: {
    width: '15%',
    textAlign: 'right',
  },
  colSubtotal: {
    width: '15%',
    textAlign: 'right',
    fontWeight: 'bold',
  },
});

export const totalsStyles = StyleSheet.create({
  totalsSection: {
    marginTop: 20,
    alignItems: 'flex-end',
  },
  totalsBox: {
    width: '50%',
    border: '1 solid #e2e8f0',
    borderRadius: 4,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 8,
    borderBottom: '1 solid #e2e8f0',
  },
  totalRowLast: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 8,
  },
  totalLabel: {
    fontSize: 10,
    color: '#64748b',
  },
  totalValue: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  grandTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    backgroundColor: '#2563eb',
    borderRadius: 4,
  },
  grandTotalLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  grandTotalValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  paymentStatusBox: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#fef3c7',
    borderRadius: 4,
    border: '1 solid #fbbf24',
  },
  paymentStatusPaid: {
    backgroundColor: '#d1fae5',
    border: '1 solid #10b981',
  },
  paymentStatusText: {
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
