/**
 * ZADIA OS - Advanced Report Generator
 * Export reports to PDF, Excel, CSV with charts
 */

'use client';

import { useState } from 'react';
import { 
  Download, 
  FileSpreadsheet, 
  FileText, 
  Image as ImageIcon,
  Loader2,
  Calendar,
  Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import { toast } from '@/lib/toast';
import { DateRange } from 'react-day-picker';

// ============================================
// Types
// ============================================

export type ReportType = 
  | 'sales-summary'
  | 'sales-by-product'
  | 'sales-by-client'
  | 'sales-by-salesperson'
  | 'inventory-status'
  | 'inventory-movements'
  | 'client-list'
  | 'client-activity'
  | 'revenue-by-month'
  | 'expenses-summary'
  | 'profit-loss'
  | 'cash-flow'
  | 'accounts-receivable'
  | 'accounts-payable'
  | 'project-status'
  | 'task-completion'
  | 'lead-conversion'
  | 'opportunity-pipeline';

export type ExportFormat = 'pdf' | 'excel' | 'csv' | 'png';

interface ReportConfig {
  type: ReportType;
  title: string;
  description: string;
  icon: string;
  category: 'sales' | 'inventory' | 'clients' | 'finance' | 'projects' | 'crm';
  availableFormats: ExportFormat[];
}

// ============================================
// Report Configurations
// ============================================

const REPORT_CONFIGS: ReportConfig[] = [
  // Sales Reports
  {
    type: 'sales-summary',
    title: 'Resumen de Ventas',
    description: 'Vista general de ventas por período',
    icon: '📊',
    category: 'sales',
    availableFormats: ['pdf', 'excel', 'csv']
  },
  {
    type: 'sales-by-product',
    title: 'Ventas por Producto',
    description: 'Desglose de ventas por producto',
    icon: '📦',
    category: 'sales',
    availableFormats: ['pdf', 'excel', 'csv']
  },
  {
    type: 'sales-by-client',
    title: 'Ventas por Cliente',
    description: 'Análisis de ventas por cliente',
    icon: '👥',
    category: 'sales',
    availableFormats: ['pdf', 'excel', 'csv']
  },
  {
    type: 'sales-by-salesperson',
    title: 'Ventas por Vendedor',
    description: 'Performance de equipo de ventas',
    icon: '🏆',
    category: 'sales',
    availableFormats: ['pdf', 'excel', 'csv']
  },
  
  // Inventory Reports
  {
    type: 'inventory-status',
    title: 'Estado de Inventario',
    description: 'Stock actual y valorización',
    icon: '📋',
    category: 'inventory',
    availableFormats: ['pdf', 'excel', 'csv']
  },
  {
    type: 'inventory-movements',
    title: 'Movimientos de Inventario',
    description: 'Entradas, salidas y ajustes',
    icon: '🔄',
    category: 'inventory',
    availableFormats: ['pdf', 'excel', 'csv']
  },
  
  // Client Reports
  {
    type: 'client-list',
    title: 'Listado de Clientes',
    description: 'Directorio completo de clientes',
    icon: '📇',
    category: 'clients',
    availableFormats: ['pdf', 'excel', 'csv']
  },
  {
    type: 'client-activity',
    title: 'Actividad de Clientes',
    description: 'Historial de interacciones',
    icon: '📈',
    category: 'clients',
    availableFormats: ['pdf', 'excel', 'csv']
  },
  
  // Finance Reports
  {
    type: 'revenue-by-month',
    title: 'Ingresos Mensuales',
    description: 'Evolución de ingresos',
    icon: '💰',
    category: 'finance',
    availableFormats: ['pdf', 'excel', 'csv', 'png']
  },
  {
    type: 'expenses-summary',
    title: 'Resumen de Gastos',
    description: 'Análisis de gastos por categoría',
    icon: '💸',
    category: 'finance',
    availableFormats: ['pdf', 'excel', 'csv']
  },
  {
    type: 'profit-loss',
    title: 'Estado de Resultados',
    description: 'P&L del período',
    icon: '📉',
    category: 'finance',
    availableFormats: ['pdf', 'excel']
  },
  {
    type: 'cash-flow',
    title: 'Flujo de Caja',
    description: 'Movimientos de efectivo',
    icon: '💵',
    category: 'finance',
    availableFormats: ['pdf', 'excel', 'png']
  },
  {
    type: 'accounts-receivable',
    title: 'Cuentas por Cobrar',
    description: 'Antigüedad de cartera',
    icon: '📥',
    category: 'finance',
    availableFormats: ['pdf', 'excel', 'csv']
  },
  {
    type: 'accounts-payable',
    title: 'Cuentas por Pagar',
    description: 'Obligaciones pendientes',
    icon: '📤',
    category: 'finance',
    availableFormats: ['pdf', 'excel', 'csv']
  },
  
  // Project Reports
  {
    type: 'project-status',
    title: 'Estado de Proyectos',
    description: 'Avance y estado de proyectos',
    icon: '📐',
    category: 'projects',
    availableFormats: ['pdf', 'excel']
  },
  {
    type: 'task-completion',
    title: 'Cumplimiento de Tareas',
    description: 'Análisis de productividad',
    icon: '✅',
    category: 'projects',
    availableFormats: ['pdf', 'excel', 'csv']
  },
  
  // CRM Reports
  {
    type: 'lead-conversion',
    title: 'Conversión de Leads',
    description: 'Embudo de conversión',
    icon: '🎯',
    category: 'crm',
    availableFormats: ['pdf', 'excel', 'png']
  },
  {
    type: 'opportunity-pipeline',
    title: 'Pipeline de Oportunidades',
    description: 'Estado del pipeline de ventas',
    icon: '🚀',
    category: 'crm',
    availableFormats: ['pdf', 'excel', 'png']
  }
];

// ============================================
// Report Export Service
// ============================================

async function exportReport(
  type: ReportType,
  format: ExportFormat,
  dateRange?: DateRange,
  filters?: Record<string, unknown>
): Promise<Blob> {
  const response = await fetch('/api/reports/export', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      type,
      format,
      dateRange: dateRange ? {
        from: dateRange.from?.toISOString(),
        to: dateRange.to?.toISOString()
      } : undefined,
      filters
    })
  });

  if (!response.ok) {
    throw new Error('Failed to export report');
  }

  return response.blob();
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ============================================
// Components
// ============================================

interface ReportExportButtonProps {
  reportType: ReportType;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
  dateRange?: DateRange;
  filters?: Record<string, unknown>;
}

export function ReportExportButton({ 
  reportType, 
  variant = 'outline',
  size = 'sm',
  dateRange,
  filters
}: ReportExportButtonProps) {
  const [exporting, setExporting] = useState<ExportFormat | null>(null);
  const config = REPORT_CONFIGS.find(r => r.type === reportType);

  if (!config) return null;

  const handleExport = async (format: ExportFormat) => {
    try {
      setExporting(format);
      const blob = await exportReport(reportType, format, dateRange, filters);
      
      const extensions: Record<ExportFormat, string> = {
        pdf: '.pdf',
        excel: '.xlsx',
        csv: '.csv',
        png: '.png'
      };
      
      const filename = `${config.title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}${extensions[format]}`;
      downloadBlob(blob, filename);
      
      toast.success(`Reporte exportado como ${format.toUpperCase()}`);
    } catch {
      toast.error('Error al exportar el reporte');
    } finally {
      setExporting(null);
    }
  };

  const formatIcons: Record<ExportFormat, React.ReactNode> = {
    pdf: <FileText className="w-4 h-4" />,
    excel: <FileSpreadsheet className="w-4 h-4" />,
    csv: <FileSpreadsheet className="w-4 h-4" />,
    png: <ImageIcon className="w-4 h-4" />
  };

  const formatLabels: Record<ExportFormat, string> = {
    pdf: 'PDF',
    excel: 'Excel',
    csv: 'CSV',
    png: 'Imagen'
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size} disabled={!!exporting}>
          {exporting ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Download className="w-4 h-4 mr-2" />
          )}
          Exportar
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-[#161b22] border-gray-800/50">
        <DropdownMenuLabel className="text-gray-400">
          Formato de exportación
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-gray-800/50" />
        {config.availableFormats.map(format => (
          <DropdownMenuItem
            key={format}
            onClick={() => handleExport(format)}
            className="hover:bg-[#0d1117] cursor-pointer"
          >
            {formatIcons[format]}
            <span className="ml-2">{formatLabels[format]}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// ============================================
// Report Center Component
// ============================================

interface ReportCenterProps {
  category?: 'all' | 'sales' | 'inventory' | 'clients' | 'finance' | 'projects' | 'crm';
}

export function ReportCenter({ category = 'all' }: ReportCenterProps) {
  const [selectedCategory, setSelectedCategory] = useState(category);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [exporting, setExporting] = useState<string | null>(null);

  const filteredReports = REPORT_CONFIGS.filter(
    r => selectedCategory === 'all' || r.category === selectedCategory
  );

  const categories = [
    { value: 'all', label: 'Todos' },
    { value: 'sales', label: 'Ventas' },
    { value: 'inventory', label: 'Inventario' },
    { value: 'clients', label: 'Clientes' },
    { value: 'finance', label: 'Finanzas' },
    { value: 'projects', label: 'Proyectos' },
    { value: 'crm', label: 'CRM' }
  ];

  const handleExport = async (reportType: ReportType, format: ExportFormat) => {
    const config = REPORT_CONFIGS.find(r => r.type === reportType);
    if (!config) return;

    try {
      setExporting(`${reportType}-${format}`);
      const blob = await exportReport(reportType, format, dateRange);
      
      const extensions: Record<ExportFormat, string> = {
        pdf: '.pdf',
        excel: '.xlsx',
        csv: '.csv',
        png: '.png'
      };
      
      const filename = `${config.title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}${extensions[format]}`;
      downloadBlob(blob, filename);
      
      toast.success(`${config.title} exportado`);
    } catch {
      toast.error('Error al exportar');
    } finally {
      setExporting(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <Select 
            value={selectedCategory} 
            onValueChange={(v) => setSelectedCategory(v as typeof selectedCategory)}
          >
            <SelectTrigger className="w-40 bg-[#161b22] border-gray-800/50">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#161b22] border-gray-800/50">
              {categories.map(cat => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-400" />
          <DatePickerWithRange 
            date={dateRange} 
            onDateChange={setDateRange}
          />
        </div>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredReports.map(report => (
          <div
            key={report.type}
            className="p-4 bg-[#161b22] border border-gray-800/50 rounded-lg hover:border-cyan-500/30 transition-colors"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{report.icon}</span>
                <div>
                  <h3 className="font-medium text-white">{report.title}</h3>
                  <p className="text-sm text-gray-400">{report.description}</p>
                </div>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2 mt-4">
              {report.availableFormats.map(format => (
                <Button
                  key={format}
                  variant="outline"
                  size="sm"
                  className="bg-[#0d1117] border-gray-800/50 hover:border-cyan-500/50"
                  onClick={() => handleExport(report.type, format)}
                  disabled={exporting === `${report.type}-${format}`}
                >
                  {exporting === `${report.type}-${format}` ? (
                    <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                  ) : (
                    <Download className="w-3 h-3 mr-1" />
                  )}
                  {format.toUpperCase()}
                </Button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export { REPORT_CONFIGS };
export type { ReportConfig };
