/**
 * ZADIA OS - Districts Form Component
 * 
 * Form component for creating and editing districts
 */

import React from 'react';
import { logger } from '@/lib/logger';
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
import { DistrictFormData, districtFormSchema } from '../validations/districts.schema';
import { District } from '../types/districts.types';

interface DistrictsFormProps {
  initialData?: District;
  onSubmit: (data: DistrictFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  municipalityId?: string;
  municipalityName?: string;
}

export function DistrictsForm({ 
  initialData, 
  onSubmit, 
  onCancel, 
  isLoading = false,
  municipalityId,
  municipalityName
}: DistrictsFormProps) {
  const form = useForm<DistrictFormData>({
    resolver: zodResolver(districtFormSchema),
    defaultValues: {
      name: initialData?.name || '',
      code: initialData?.code || '',
      municipalityId: initialData?.municipalityId || municipalityId || '',
    },
  });

  const handleSubmit = async (data: DistrictFormData) => {
    try {
      await onSubmit(data);
      if (!initialData) {
        form.reset();
      }
    } catch (error) {
      logger.error('Error submitting district form', error as Error, {
        component: 'DistrictsForm',
        action: 'handleSubmit'
      });
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
              <FormLabel>Nombre del Distrito</FormLabel>
              <FormControl>
                <Input
                  placeholder="Ej: Miraflores"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Nombre oficial del distrito
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Código</FormLabel>
              <FormControl>
                <Input
                  placeholder="Ej: MIR"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Código único del distrito (opcional)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="municipalityId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Municipio</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  disabled
                  placeholder="ID del municipio"
                />
              </FormControl>
              <FormDescription>
                {municipalityName && (
                  <span className="text-green-600">
                    Municipio: {municipalityName}
                  </span>
                )}
                {!municipalityName && "ID del municipio al que pertenece el distrito"}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

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