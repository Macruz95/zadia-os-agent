/**
 * ZADIA OS - Client Creation Step
 * 
 * Second step of conversion wizard - creates or links client
 * Following ZADIA Rule 2: ShadCN UI + Lucide Icons
 * Following ZADIA Rule 3: Zod validation
 * Following ZADIA Rule 5: Max 200 lines
 */

'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ChevronLeft, ChevronRight, Building2, User } from 'lucide-react';
import { Lead, EntityType } from '../../types/sales.types';
import { ClientType } from '@/modules/clients/types/clients.types';
import { 
  ConversionDecision, 
  ClientFromLeadInput, 
  clientFromLeadSchema 
} from '../../validations/lead-conversion.schema';

/**
 * Map Lead EntityType to Client ClientType
 */
function mapEntityTypeToClientType(entityType: EntityType): ClientType {
  const mapping: Record<EntityType, ClientType> = {
    'person': 'PersonaNatural',
    'company': 'Empresa',
    'institution': 'Organización',
  };
  return mapping[entityType];
}

interface ClientCreationStepProps {
  lead: Lead;
  decision: ConversionDecision | null;
  onNext: () => void;
  onBack: () => void;
  onClientData: (data: ClientFromLeadInput) => void;
}

export function ClientCreationStep({ 
  lead, 
  decision, 
  onNext, 
  onBack, 
  onClientData 
}: ClientCreationStepProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ClientFromLeadInput>({
    // @ts-expect-error - Zod optional().default() creates type mismatch with React Hook Form
    resolver: zodResolver(clientFromLeadSchema),
    defaultValues: {
      clientType: mapEntityTypeToClientType(lead.entityType),
      name: lead.fullName || lead.entityName || '',
      email: lead.email,
      phone: lead.phone,
      documentId: '',
      status: 'Activo' as const,
      source: `lead-${lead.id}`,
      address: {
        country: 'El Salvador',
        state: '',
        city: '',
        street: '',
      },
      tags: [],
      communicationOptIn: true,
    },
  });

  const clientType = watch('clientType');

  // If linking to existing client, skip this step
  if (decision?.action === 'link-existing') {
    onNext();
    return null;
  }

  const onSubmit = (data: ClientFromLeadInput) => {
    onClientData(data);
    onNext();
  };

  return (
    // @ts-expect-error - Type mismatch between Zod optional defaults and React Hook Form
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Alert>
        <Building2 className="h-4 w-4" />
        <AlertDescription>
          Complete los datos del nuevo cliente. Los campos marcados con * son obligatorios.
        </AlertDescription>
      </Alert>

      {/* Entity Type */}
      <div className="space-y-2">
        <Label htmlFor="clientType">Tipo de Cliente *</Label>
        <Select
          value={clientType}
          onValueChange={(value) => setValue('clientType', value as 'PersonaNatural' | 'Organización' | 'Empresa')}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="PersonaNatural">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Persona Natural
              </div>
            </SelectItem>
            <SelectItem value="Empresa">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                Empresa
              </div>
            </SelectItem>
            <SelectItem value="Organización">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                Organización
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Name */}
      <div className="space-y-2">
        <Label htmlFor="name">
          {clientType === 'PersonaNatural' ? 'Nombre Completo' : 'Razón Social'} *
        </Label>
        <Input
          id="name"
          {...register('name')}
          placeholder={clientType === 'PersonaNatural' ? 'Juan Pérez' : 'Empresa S.A. de C.V.'}
        />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name.message}</p>
        )}
      </div>

      {/* Document ID */}
      <div className="space-y-2">
        <Label htmlFor="documentId">
          {clientType === 'PersonaNatural' ? 'DUI / Pasaporte' : 'NIT / Registro Fiscal'} *
        </Label>
        <Input
          id="documentId"
          {...register('documentId')}
          placeholder={clientType === 'PersonaNatural' ? '12345678-9' : '1234-567890-123-4'}
        />
        {errors.documentId && (
          <p className="text-sm text-destructive">{errors.documentId.message}</p>
        )}
      </div>

      {/* Email and Phone */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            {...register('email')}
          />
          {errors.email && (
            <p className="text-sm text-destructive">{errors.email.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Teléfono *</Label>
          <Input
            id="phone"
            {...register('phone')}
          />
          {errors.phone && (
            <p className="text-sm text-destructive">{errors.phone.message}</p>
          )}
        </div>
      </div>

      {/* Address */}
      <div className="space-y-4">
        <h3 className="font-semibold">Dirección</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="address.state">Departamento *</Label>
            <Input
              id="address.state"
              {...register('address.state')}
              placeholder="San Salvador"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="address.city">Municipio *</Label>
            <Input
              id="address.city"
              {...register('address.city')}
              placeholder="San Salvador"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="address.street">Dirección Exacta *</Label>
          <Input
            id="address.street"
            {...register('address.street')}
            placeholder="Calle Principal #123, Colonia Centro"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-between pt-4 border-t">
        <Button type="button" variant="outline" onClick={onBack}>
          <ChevronLeft className="w-4 h-4 mr-2" />
          Atrás
        </Button>
        <Button type="submit">
          Siguiente
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </form>
  );
}
