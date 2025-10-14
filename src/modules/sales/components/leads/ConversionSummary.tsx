/**
 * ZADIA OS - Conversion Summary Step
 * 
 * Final step of conversion wizard - shows summary and executes conversion
 * Following ZADIA Rule 2: ShadCN UI + Lucide Icons
 * Following ZADIA Rule 5: Max 200 lines
 */

'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  ChevronLeft, 
  CheckCircle2, 
  Loader2, 
  User, 
  Building2, 
  Briefcase, 
  Mail, 
  Phone,
  DollarSign,
  AlertCircle,
  PartyPopper
} from 'lucide-react';
import { Lead } from '../../types/sales.types';
import {
  ConversionDecision,
  ClientFromLeadInput,
  OpportunityFromConversionInput,
  ConversionResult,
} from '../../validations/lead-conversion.schema';

interface ConversionSummaryProps {
  lead: Lead;
  conversionDecision: ConversionDecision;
  clientData: ClientFromLeadInput | null;
  opportunityData: OpportunityFromConversionInput;
  isConverting: boolean;
  error: string | null;
  result: ConversionResult | null;
  onConfirm: () => void;
  onBack: () => void;
  onClose: () => void;
}

export function ConversionSummary({
  lead,
  conversionDecision,
  clientData,
  opportunityData,
  isConverting,
  error,
  result,
  onConfirm,
  onBack,
  onClose,
}: ConversionSummaryProps) {
  
  // Show success state
  if (result?.success) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col items-center justify-center py-8 space-y-4">
          <div className="p-4 bg-green-100 rounded-full">
            <PartyPopper className="w-16 h-16 text-green-600" />
          </div>
          <h3 className="text-2xl font-bold text-green-600">¡Conversión Exitosa!</h3>
          <p className="text-center text-muted-foreground max-w-md">
            {result.message}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Detalles de la Conversión</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Lead Convertido:</span>
              <Badge variant="outline">{lead.fullName || lead.entityName}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Cliente:</span>
              <Badge variant={result.isNewClient ? 'default' : 'secondary'}>
                {result.isNewClient ? 'Nuevo Cliente Creado' : 'Cliente Existente Vinculado'}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Oportunidad:</span>
              <Badge variant="default">Creada</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Historial:</span>
              <Badge variant={result.historyTransferred ? 'default' : 'secondary'}>
                {result.historyTransferred ? 'Transferido' : 'No Transferido'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Alert>
          <CheckCircle2 className="h-4 w-4" />
          <AlertDescription>
            Serás redirigido a la página de la oportunidad en unos segundos...
          </AlertDescription>
        </Alert>

        <div className="flex justify-center pt-4">
          <Button onClick={onClose} variant="outline">
            Cerrar
          </Button>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>

        <div className="flex justify-between pt-4 border-t">
          <Button variant="outline" onClick={onBack}>
            <ChevronLeft className="w-4 h-4 mr-2" />
            Atrás
          </Button>
          <Button onClick={onConfirm} disabled={isConverting}>
            Reintentar
          </Button>
        </div>
      </div>
    );
  }

  // Show confirmation summary
  return (
    <div className="space-y-6">
      <Alert>
        <CheckCircle2 className="h-4 w-4" />
        <AlertDescription>
          Revise el resumen antes de confirmar la conversión. Esta acción no se puede deshacer.
        </AlertDescription>
      </Alert>

      {/* Lead Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <User className="w-5 h-5" />
            Lead Original
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <span className="font-medium">{lead.fullName || lead.entityName}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Mail className="w-4 h-4" />
            {lead.email}
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Phone className="w-4 h-4" />
            {lead.phone}
          </div>
        </CardContent>
      </Card>

      {/* Client Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Cliente
          </CardTitle>
          <CardDescription>
            {conversionDecision.action === 'create-new' 
              ? 'Se creará un nuevo cliente' 
              : 'Se vinculará a cliente existente'}
          </CardDescription>
        </CardHeader>
        {clientData && (
          <CardContent className="space-y-2 text-sm">
            <div><strong>Nombre:</strong> {clientData.name}</div>
            <div><strong>Tipo:</strong> {clientData.clientType}</div>
            <div><strong>Documento:</strong> {clientData.documentId}</div>
            <div><strong>Email:</strong> {clientData.email}</div>
            <div><strong>Teléfono:</strong> {clientData.phone}</div>
          </CardContent>
        )}
      </Card>

      {/* Opportunity Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Briefcase className="w-5 h-5" />
            Oportunidad
          </CardTitle>
          <CardDescription>Nueva oportunidad comercial</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div><strong>Nombre:</strong> {opportunityData.name}</div>
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            <strong>Valor Estimado:</strong> {opportunityData.currency} {opportunityData.estimatedValue.toLocaleString()}
          </div>
          <div><strong>Etapa:</strong> {opportunityData.stage}</div>
          <div><strong>Prioridad:</strong> {opportunityData.priority}</div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-between pt-4 border-t">
        <Button variant="outline" onClick={onBack} disabled={isConverting}>
          <ChevronLeft className="w-4 h-4 mr-2" />
          Atrás
        </Button>
        <Button onClick={onConfirm} disabled={isConverting}>
          {isConverting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Convirtiendo...
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Confirmar Conversión
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
