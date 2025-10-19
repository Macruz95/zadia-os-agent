/**
 * ZADIA OS - Invoice Client Info Component
 * Formulario de información del cliente para facturas
 * Rule #2: ShadCN UI + Lucide Icons
 * Rule #5: Max 200 lines
 */

'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface InvoiceClientInfoProps {
  clientId: string;
  clientName: string;
  onClientIdChange: (value: string) => void;
  onClientNameChange: (value: string) => void;
}

export function InvoiceClientInfo({
  clientId,
  clientName,
  onClientIdChange,
  onClientNameChange,
}: InvoiceClientInfoProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Información del Cliente</CardTitle>
        <CardDescription>
          Datos de facturación del cliente
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="clientName">Nombre del Cliente *</Label>
            <Input
              id="clientName"
              value={clientName}
              onChange={(e) => onClientNameChange(e.target.value)}
              placeholder="ACME Corporation"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="clientId">ID Cliente *</Label>
            <Input
              id="clientId"
              value={clientId}
              onChange={(e) => onClientIdChange(e.target.value)}
              placeholder="client-id"
              required
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
