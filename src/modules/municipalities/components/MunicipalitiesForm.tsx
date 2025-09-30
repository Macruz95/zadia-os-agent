/**
 * ZADIA OS - Municipalities Form Component
 * 
 * Form component for creating and editing municipalities
 */

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { DepartmentsSelect } from '@/modules/departments/components';
import { MunicipalityFormData, municipalityFormSchema } from '../validations/municipalities.schema';
import { Municipality } from '../types/municipalities.types';

interface MunicipalitiesFormProps {
  initialData?: Municipality;
  onSubmit: (data: MunicipalityFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  departmentId?: string;
  departmentName?: string;
}

export function MunicipalitiesForm({ 
  initialData, 
  onSubmit, 
  onCancel, 
  isLoading = false,
  departmentId,
  departmentName
}: MunicipalitiesFormProps) {
  const form = useForm<MunicipalityFormData>({
    resolver: zodResolver(municipalityFormSchema),
    defaultValues: {
      name: initialData?.name || '',
      departmentId: initialData?.departmentId || departmentId || '',
      postalCode: initialData?.postalCode || '',
      latitude: initialData?.latitude || undefined,
      longitude: initialData?.longitude || undefined,
    },
  });

  const handleSubmit = async (data: MunicipalityFormData) => {
    try {
      await onSubmit(data);
      if (!initialData) {
        form.reset();
      }
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre del Municipio</FormLabel>
              <FormControl>
                <Input
                  placeholder="Ej: Lima"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Nombre oficial del municipio
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="departmentId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Departamento</FormLabel>
              <FormControl>
                {departmentId ? (
                  <Input
                    {...field}
                    disabled
                    placeholder="ID del departamento"
                  />
                ) : (
                  <DepartmentsSelect
                    value={field.value}
                    onValueChange={field.onChange}
                    placeholder="Selecciona un departamento"
                  />
                )}
              </FormControl>
              <FormDescription>
                {departmentName && (
                  <span className="text-green-600">
                    Departamento: {departmentName}
                  </span>
                )}
                {!departmentName && "Departamento al que pertenece el municipio"}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="postalCode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Código Postal</FormLabel>
              <FormControl>
                <Input
                  placeholder="Ej: 15001"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Código postal del municipio (opcional)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="latitude"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Latitud</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="any"
                    placeholder="Ej: -12.0464"
                    {...field}
                    onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                    value={field.value || ''}
                  />
                </FormControl>
                <FormDescription>
                  Coordenada de latitud (opcional)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="longitude"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Longitud</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="any"
                    placeholder="Ej: -77.0428"
                    {...field}
                    onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                    value={field.value || ''}
                  />
                </FormControl>
                <FormDescription>
                  Coordenada de longitud (opcional)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? 'Guardando...' : initialData ? 'Actualizar' : 'Crear'}
          </Button>
        </div>
      </form>
    </Form>
  );
}