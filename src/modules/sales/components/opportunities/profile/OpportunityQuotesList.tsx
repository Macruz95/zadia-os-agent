/**
 * ZADIA OS - Opportunity Quotes List Component
 * 
 * List of quotes linked to an opportunity with actions
 * 
 * @component
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, FileText, Calendar, DollarSign, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import type { Quote } from '@/modules/sales/types/sales.types';
import { QuoteAcceptanceWizard } from '@/modules/sales/components/quotes';

interface OpportunityQuotesListProps {
  opportunityId: string;
  quotes: Quote[];
  onQuotesChange?: () => void;
}

export function OpportunityQuotesList({
  opportunityId,
  quotes,
  onQuotesChange,
}: OpportunityQuotesListProps) {
  const router = useRouter();
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const [wizardOpen, setWizardOpen] = useState(false);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-PY', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      draft: 'secondary',
      sent: 'outline',
      accepted: 'default',
      rejected: 'destructive',
      expired: 'destructive',
      'converted-to-project': 'default',
    };

    const labels: Record<string, string> = {
      draft: 'Borrador',
      sent: 'Enviada',
      accepted: 'Aceptada',
      rejected: 'Rechazada',
      expired: 'Expirada',
      'converted-to-project': 'Convertida a Proyecto',
    };

    return {
      variant: variants[status] || 'secondary',
      label: labels[status] || status,
    };
  };

  const handleCreateQuote = () => {
    // Navigate to quote creation page with opportunityId
    router.push(`/sales/quotes/new?opportunityId=${opportunityId}`);
  };

  const handleViewQuote = (quoteId: string) => {
    router.push(`/sales/quotes/${quoteId}`);
  };

  const handleConvertToProject = (quote: Quote) => {
    setSelectedQuote(quote);
    setWizardOpen(true);
  };

  const handleWizardClose = () => {
    setWizardOpen(false);
    setSelectedQuote(null);
    if (onQuotesChange) {
      onQuotesChange();
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Cotizaciones ({quotes.length})</CardTitle>
            <Button onClick={handleCreateQuote} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Nueva Cotización
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {quotes.length === 0 ? (
            <Alert>
              <AlertDescription>
                No hay cotizaciones registradas para esta oportunidad.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-4">
              {quotes.map((quote) => {
                const statusBadge = getStatusBadge(quote.status);
                const canConvert = quote.status === 'accepted';

                return (
                  <div
                    key={quote.id}
                    className="border rounded-lg p-4 hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      {/* Quote Info */}
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <span className="font-semibold">{quote.number}</span>
                          <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-green-600" />
                            <span className="font-medium">{formatCurrency(quote.total)}</span>
                          </div>

                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            <span>
                              Válida hasta:{' '}
                              {format(
                                quote.validUntil instanceof Date
                                  ? quote.validUntil
                                  : quote.validUntil.toDate(),
                                'dd MMM yyyy',
                                { locale: es }
                              )}
                            </span>
                          </div>
                        </div>

                        {quote.notes && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {quote.notes}
                          </p>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewQuote(quote.id)}
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Ver
                        </Button>

                        {canConvert && (
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleConvertToProject(quote)}
                          >
                            Crear Proyecto
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quote to Project Conversion Wizard */}
      {selectedQuote && (
        <QuoteAcceptanceWizard
          quote={selectedQuote}
          open={wizardOpen}
          onClose={handleWizardClose}
        />
      )}
    </>
  );
}
