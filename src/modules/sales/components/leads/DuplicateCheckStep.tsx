/**
 * ZADIA OS - Duplicate Check Step
 * 
 * First step of conversion wizard - checks for duplicate clients
 * Following ZADIA Rule 2: ShadCN UI + Lucide Icons
 * Following ZADIA Rule 5: Max 200 lines
 */

'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Loader2, AlertCircle, UserCheck, UserPlus, Mail, Phone, Calendar, CheckCircle, AlertTriangle } from 'lucide-react';
import { Lead } from '../../types/sales.types';
import { ConversionDecision } from '../../validations/lead-conversion.schema';
import { useDuplicateDetection } from '../../hooks/use-duplicate-detection';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface DuplicateCheckStepProps {
  lead: Lead;
  onNext: () => void;
  onDecision: (decision: ConversionDecision) => void;
}

export function DuplicateCheckStep({ lead, onNext, onDecision }: DuplicateCheckStepProps) {
  const { 
    duplicates, 
    isSearching, 
    error, 
    searchForDuplicates,
    hasDuplicates 
  } = useDuplicateDetection();

  // Auto-search on mount
  useEffect(() => {
    searchForDuplicates({
      email: lead.email,
      phone: lead.phone,
      fullName: lead.fullName,
      entityName: lead.entityName,
    });
  }, [lead, searchForDuplicates]);

  const handleCreateNew = () => {
    onDecision({ action: 'create-new' });
    onNext();
  };

  const handleLinkExisting = (clientId: string) => {
    onDecision({ action: 'link-existing', existingClientId: clientId });
    onNext();
  };

  if (isSearching) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">
          Buscando clientes similares...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Lead info summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Lead a Convertir</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <UserCheck className="w-4 h-4 text-muted-foreground" />
            <span className="font-medium">{lead.fullName || lead.entityName}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Mail className="w-4 h-4 text-muted-foreground" />
            <span>{lead.email}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Phone className="w-4 h-4 text-muted-foreground" />
            <span>{lead.phone}</span>
          </div>
        </CardContent>
      </Card>

      {/* Duplicate results */}
      {!hasDuplicates ? (
        <Alert>
          <CheckCircle className="h-4 w-4 text-emerald-500" />
          <AlertDescription className="flex items-center gap-2">
            No se encontraron clientes duplicados. Puede proceder a crear un nuevo cliente.
          </AlertDescription>
        </Alert>
      ) : (
        <div className="space-y-4">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="flex items-center gap-2">
              Se encontraron {duplicates.length} cliente(s) similar(es). 
              Revise y decida si desea vincular a uno existente o crear uno nuevo.
            </AlertDescription>
          </Alert>

          {duplicates.map((duplicate) => (
            <Card key={duplicate.id} className="border-orange-200">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base">{duplicate.name}</CardTitle>
                    <CardDescription className="mt-1">
                      {duplicate.matchReason}
                    </CardDescription>
                  </div>
                  <Badge variant={duplicate.matchScore >= 90 ? 'destructive' : 'secondary'}>
                    {duplicate.matchScore}% coincidencia
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span>{duplicate.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span>{duplicate.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span>{format(duplicate.createdAt, 'PPP', { locale: es })}</span>
                  </div>
                  <Badge variant="outline">{duplicate.status}</Badge>
                </div>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => handleLinkExisting(duplicate.id)}
                >
                  <UserCheck className="w-4 h-4 mr-2" />
                  Vincular a Este Cliente
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button onClick={handleCreateNew} className="gap-2">
          <UserPlus className="w-4 h-4" />
          Crear Nuevo Cliente
        </Button>
      </div>
    </div>
  );
}
