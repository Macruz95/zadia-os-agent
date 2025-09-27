/**
 * ZADIA OS - Quotes Directory
 * 
 * Main page for managing sales quotes
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Plus, 
  FileText, 
  DollarSign,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Search
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

// Mock data for quotes
const MOCK_QUOTES = [
  {
    id: 'QUO-001',
    title: 'Sistema ERP Completo - Empresa ABC',
    clientName: 'Empresa ABC S.A.',
    status: 'sent' as const,
    totalAmount: 50000,
    currency: 'USD',
    validUntil: new Date('2024-02-15'),
    createdAt: new Date('2024-01-15'),
    opportunityId: 'opp-1',
  },
  {
    id: 'QUO-002',
    title: 'Consultoría IT - Tech Corp',
    clientName: 'Tech Corp International',
    status: 'draft' as const,
    totalAmount: 25000,
    currency: 'USD',
    validUntil: new Date('2024-02-28'),
    createdAt: new Date('2024-01-20'),
    opportunityId: 'opp-2',
  },
  {
    id: 'QUO-003',
    title: 'Desarrollo Web - Startup XYZ',
    clientName: 'Startup XYZ',
    status: 'accepted' as const,
    totalAmount: 15000,
    currency: 'USD',
    validUntil: new Date('2024-01-30'),
    createdAt: new Date('2024-01-10'),
    opportunityId: 'opp-3',
  },
];

const STATUS_CONFIG = {
  draft: { 
    label: 'Borrador', 
    variant: 'secondary' as const, 
    icon: FileText,
    color: 'text-gray-600'
  },
  sent: { 
    label: 'Enviada', 
    variant: 'default' as const, 
    icon: Clock,
    color: 'text-blue-600'
  },
  accepted: { 
    label: 'Aceptada', 
    variant: 'default' as const, 
    icon: CheckCircle,
    color: 'text-green-600'
  },
  rejected: { 
    label: 'Rechazada', 
    variant: 'destructive' as const, 
    icon: XCircle,
    color: 'text-red-600'
  },
  expired: { 
    label: 'Expirada', 
    variant: 'outline' as const, 
    icon: AlertTriangle,
    color: 'text-orange-600'
  },
};

export function QuotesDirectory() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredQuotes = MOCK_QUOTES.filter(quote => {
    const matchesSearch = !searchQuery || 
      quote.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      quote.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      quote.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || quote.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('es-PY', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  // Calculate KPIs
  const totalQuotes = MOCK_QUOTES.length;
  const totalValue = MOCK_QUOTES.reduce((sum, quote) => sum + quote.totalAmount, 0);
  const pendingQuotes = MOCK_QUOTES.filter(q => q.status === 'sent').length;
  const acceptedQuotes = MOCK_QUOTES.filter(q => q.status === 'accepted').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Cotizaciones</h1>
          <p className="text-muted-foreground">
            Gestiona cotizaciones y propuestas comerciales
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <FileText className="h-4 w-4 mr-2" />
            Plantillas
          </Button>
          <Button onClick={() => router.push('/sales/quotes/new')}>
            <Plus className="h-4 w-4 mr-2" />
            Nueva Cotización
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Cotizaciones
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalQuotes}</div>
            <p className="text-xs text-muted-foreground">
              Generadas este mes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Valor Total
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalValue)}
            </div>
            <p className="text-xs text-muted-foreground">
              En cotizaciones activas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pendientes
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingQuotes}</div>
            <p className="text-xs text-muted-foreground">
              Esperando respuesta
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tasa de Aceptación
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalQuotes > 0 ? Math.round((acceptedQuotes / totalQuotes) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              {acceptedQuotes} de {totalQuotes} aceptadas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar cotizaciones..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10"
                />
              </div>
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="draft">Borrador</SelectItem>
                <SelectItem value="sent">Enviada</SelectItem>
                <SelectItem value="accepted">Aceptada</SelectItem>
                <SelectItem value="rejected">Rechazada</SelectItem>
                <SelectItem value="expired">Expirada</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" size="sm">
              Exportar PDF
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quotes Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Cotizaciones ({filteredQuotes.length})</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cotización</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Monto</TableHead>
                  <TableHead>Válida hasta</TableHead>
                  <TableHead>Creada</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredQuotes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      No se encontraron cotizaciones
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredQuotes.map((quote) => {
                    const statusConfig = STATUS_CONFIG[quote.status];
                    const StatusIcon = statusConfig.icon;
                    const isExpiringSoon = new Date(quote.validUntil) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
                    
                    return (
                      <TableRow 
                        key={quote.id} 
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => router.push(`/sales/quotes/${quote.id}`)}
                      >
                        <TableCell>
                          <div>
                            <p className="font-medium">{quote.id}</p>
                            <p className="text-sm text-muted-foreground truncate max-w-[200px]">
                              {quote.title}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <p className="font-medium">{quote.clientName}</p>
                        </TableCell>
                        <TableCell>
                          <Badge variant={statusConfig.variant} className="flex items-center gap-1 w-fit">
                            <StatusIcon className="h-3 w-3" />
                            {statusConfig.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <p className="font-medium">
                            {formatCurrency(quote.totalAmount, quote.currency)}
                          </p>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {isExpiringSoon && quote.status === 'sent' && (
                              <AlertTriangle className="h-4 w-4 text-orange-500" />
                            )}
                            <span className={isExpiringSoon && quote.status === 'sent' ? 'text-orange-600' : ''}>
                              {format(quote.validUntil, 'dd/MM/yyyy', { locale: es })}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                            {format(quote.createdAt, 'dd/MM/yyyy', { locale: es })}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" size="sm">
                              Ver
                            </Button>
                            <Button variant="outline" size="sm">
                              PDF
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}