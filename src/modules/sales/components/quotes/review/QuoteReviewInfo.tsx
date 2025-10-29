'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Calendar, Briefcase, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface QuoteReviewInfoProps {
  opportunityName?: string;
  currency: string;
  validUntil: Date;
  paymentTerms: string;
  notes?: string;
  internalNotes?: string;
}

export function QuoteReviewInfo({ 
  opportunityName,
  currency,
  validUntil,
  paymentTerms,
  notes,
  internalNotes
}: QuoteReviewInfoProps) {
  return (
    <div className="space-y-6">
      <Alert>
        <CheckCircle className="h-4 w-4" />
        <AlertDescription>
          Revise toda la información de la cotización antes de crearla. 
          Esta será una cotización formal con todos los datos del cliente.
        </AlertDescription>
      </Alert>

      {/* Información de la Oportunidad */}
      {opportunityName && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Briefcase className="w-4 h-4" />
              Oportunidad
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-medium">{opportunityName}</p>
            <Badge variant="outline" className="mt-2">{currency}</Badge>
          </CardContent>
        </Card>
      )}

      {/* Términos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Calendar className="w-4 h-4" />
            Términos y Condiciones
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <p className="text-sm text-muted-foreground">Válido hasta</p>
            <p className="font-medium">
              {format(validUntil, 'PPP', { locale: es })}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Términos de Pago</p>
            <p className="font-medium whitespace-pre-wrap">{paymentTerms}</p>
          </div>
        </CardContent>
      </Card>

      {/* Notas */}
      {(notes || internalNotes) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Notas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {notes && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Notas para el cliente</p>
                <p className="mt-1 whitespace-pre-wrap text-sm">{notes}</p>
              </div>
            )}
            {internalNotes && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Notas internas</p>
                <p className="mt-1 whitespace-pre-wrap text-sm bg-muted p-3 rounded-md">
                  {internalNotes}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}