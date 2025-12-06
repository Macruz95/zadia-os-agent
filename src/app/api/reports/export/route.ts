/**
 * ZADIA OS - Report Export API
 * Generate and export reports in various formats
 */

import { NextRequest, NextResponse } from 'next/server';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import ExcelJS from 'exceljs';

// Extend jsPDF with autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: {
      head: string[][];
      body: string[][];
      startY?: number;
      theme?: string;
      headStyles?: Record<string, unknown>;
      styles?: Record<string, unknown>;
    }) => jsPDF;
  }
}

interface ReportRequest {
  type: string;
  format: 'pdf' | 'excel' | 'csv' | 'png';
  dateRange?: {
    from: string;
    to: string;
  };
  filters?: Record<string, unknown>;
}

// Sample data generator (in production, fetch from database)
function generateSampleData(type: string) {
  const headers = ['ID', 'Nombre', 'Cantidad', 'Valor', 'Fecha'];
  const rows = Array.from({ length: 20 }, (_, i) => [
    `#${1000 + i}`,
    `Item ${i + 1}`,
    Math.floor(Math.random() * 100).toString(),
    `$${(Math.random() * 1000).toFixed(2)}`,
    new Date().toLocaleDateString()
  ]);
  
  return { headers, rows, title: type };
}

async function generatePDF(data: { headers: string[]; rows: string[][]; title: string }): Promise<Buffer> {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(20);
  doc.setTextColor(6, 182, 212); // Cyan
  doc.text('ZADIA OS', 14, 22);
  
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text(data.title, 14, 35);
  
  doc.setFontSize(10);
  doc.setTextColor(128, 128, 128);
  doc.text(`Generado: ${new Date().toLocaleString()}`, 14, 42);
  
  // Table
  doc.autoTable({
    head: [data.headers],
    body: data.rows,
    startY: 50,
    theme: 'grid',
    headStyles: { 
      fillColor: [6, 182, 212],
      textColor: [255, 255, 255]
    },
    styles: {
      fontSize: 9
    }
  });
  
  return Buffer.from(doc.output('arraybuffer'));
}

async function generateExcel(data: { headers: string[]; rows: string[][]; title: string }): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'ZADIA OS';
  workbook.created = new Date();
  
  const worksheet = workbook.addWorksheet(data.title.substring(0, 31));
  
  // Add headers with styling
  worksheet.addRow(data.headers);
  const headerRow = worksheet.getRow(1);
  headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF06B6D4' } // Cyan
  };
  
  // Add data rows
  data.rows.forEach(row => worksheet.addRow(row));
  
  // Set column widths
  worksheet.columns.forEach(column => {
    column.width = 15;
  });
  
  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}

function generateCSV(data: { headers: string[]; rows: string[][] }): Buffer {
  const csvContent = [
    data.headers.join(','),
    ...data.rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');
  
  return Buffer.from(csvContent, 'utf-8');
}

export async function POST(request: NextRequest) {
  try {
    const body: ReportRequest = await request.json();
    const { type, format } = body;
    
    // Generate report data
    const data = generateSampleData(type);
    
    let buffer: Buffer;
    let contentType: string;
    let filename: string;
    
    switch (format) {
      case 'pdf':
        buffer = await generatePDF(data);
        contentType = 'application/pdf';
        filename = `${type}.pdf`;
        break;
        
      case 'excel':
        buffer = await generateExcel(data);
        contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        filename = `${type}.xlsx`;
        break;
        
      case 'csv':
        buffer = generateCSV(data);
        contentType = 'text/csv';
        filename = `${type}.csv`;
        break;
        
      case 'png':
        // For PNG, we'd need to render a chart and export it
        // This would typically be done client-side with html2canvas
        return NextResponse.json(
          { error: 'PNG export should be done client-side' },
          { status: 400 }
        );
        
      default:
        return NextResponse.json(
          { error: 'Unsupported format' },
          { status: 400 }
        );
    }
    
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`
      }
    });
    
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Report export error:', error);
    return NextResponse.json(
      { error: 'Failed to generate report' },
      { status: 500 }
    );
  }
}
