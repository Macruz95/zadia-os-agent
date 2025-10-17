/**
 * ZADIA OS - Quote Header Component
 * 
 * Header section for quote details page
 * REGLA 2: ShadCN UI + Lucide Icons
 * REGLA 4: Modular
 * REGLA 5: <150 líneas
 */

'use client';

import { ArrowLeft, FileText, Send, CheckCircle2, XCircle, Download } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Quote, QuoteStatus } from '@/modules/sales/types/sales.types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface QuoteHeaderProps {
  quote: Quote;
  onMarkAsSent: () => void;
  onMarkAsAccepted: () => void;
  onMarkAsRejected: () => void;
  onDownloadPDF: () => void;
}

const STATUS_CONFIG: Record<QuoteStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  draft: { label: 'Borrador', variant: 'secondary' },
  sent: { label: 'Enviada', variant: 'default' },
  accepted: { label: 'Aceptada', variant: 'default' },
  rejected: { label: 'Rechazada', variant: 'destructive' },
  expired: { label: 'Expirada', variant: 'outline' },
};

export function QuoteHeader({
  quote,
  onMarkAsSent,
  onMarkAsAccepted,
  onMarkAsRejected,
  onDownloadPDF,
}: QuoteHeaderProps) {
  const router = useRouter();
  const statusConfig = STATUS_CONFIG[quote.status];

  return (
    <div className="bg-card border-b">
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-2"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Button>
        </div>

        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">
                {quote.number}
              </h1>
              <Badge variant={statusConfig.variant}>
                {statusConfig.label}
              </Badge>
            </div>
            
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>
                Creada: {format(quote.createdAt.toDate(), 'dd MMM yyyy', { locale: es })}
              </span>
              <span>•</span>
              <span>
                Válida hasta: {format(quote.validUntil.toDate(), 'dd MMM yyyy', { locale: es })}
              </span>
            </div>

            <div className="text-2xl font-bold mt-4">
              ${quote.total.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {quote.currency}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={onDownloadPDF}
            >
              <Download className="mr-2 h-4 w-4" />
              Descargar PDF
            </Button>

            {quote.status === 'draft' && (
              <Button onClick={onMarkAsSent}>
                <Send className="mr-2 h-4 w-4" />
                Enviar al Cliente
              </Button>
            )}

            {quote.status === 'sent' && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button>
                    <FileText className="mr-2 h-4 w-4" />
                    Acciones
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={onMarkAsAccepted}>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Marcar como Aceptada
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={onMarkAsRejected} className="text-destructive">
                    <XCircle className="mr-2 h-4 w-4" />
                    Marcar como Rechazada
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
