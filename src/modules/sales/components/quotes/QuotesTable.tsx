import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Calendar, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Quote } from '../../types/sales.types';
import { STATUS_CONFIG } from './QuotesStatusConfig';

interface QuotesTableProps {
  quotes: Quote[];
  onQuoteClick: (quoteId: string) => void;
}

export function QuotesTable({ quotes, onQuoteClick }: QuotesTableProps) {
  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('es-PY', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Cotizaciones ({quotes.length})</CardTitle>
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
              {quotes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    No se encontraron cotizaciones
                  </TableCell>
                </TableRow>
              ) : (
                quotes.map((quote) => {
                  const statusConfig = STATUS_CONFIG[quote.status];
                  const StatusIcon = statusConfig.icon;
                  const isExpiringSoon = quote.validUntil.toDate() < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
                  
                  return (
                    <TableRow 
                      key={quote.id} 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => onQuoteClick(quote.id)}
                    >
                      <TableCell>
                        <div>
                          <p className="font-medium">{quote.id}</p>
                          <p className="text-sm text-muted-foreground truncate max-w-[200px]">
                            {quote.number}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="font-medium">Cliente: {quote.clientId}</p>
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusConfig.variant} className="flex items-center gap-1 w-fit">
                          <StatusIcon className="h-3 w-3" />
                          {statusConfig.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <p className="font-medium">
                          {formatCurrency(quote.total, quote.currency)}
                        </p>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {isExpiringSoon && quote.status === 'sent' && (
                            <AlertTriangle className="h-4 w-4 text-orange-500" />
                          )}
                          <span className={isExpiringSoon && quote.status === 'sent' ? 'text-orange-600' : ''}>
                            {format(quote.validUntil.toDate(), 'dd/MM/yyyy', { locale: es })}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          {format(quote.createdAt.toDate(), 'dd/MM/yyyy', { locale: es })}
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
  );
}