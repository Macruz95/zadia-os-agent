/**
 * ZADIA OS - Departments Form Component
 * 
 * Form component for creating and editing departments
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
import { CountriesSelect } from '@/modules/countries/components';
import { DepartmentFormData, departmentFormSchema } from '../validations/departments.schema';
import { Department } from '../types/departments.types';

interface DepartmentsFormProps {
  initialData?: Department;
  onSubmit: (data: DepartmentFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function DepartmentsForm({ 
  initialData, 
  onSubmit, 
  onCancel, 
  isLoading = false 
}: DepartmentsFormProps) {
  const form = useForm<DepartmentFormData>({
    resolver: zodResolver(departmentFormSchema),
    defaultValues: {
      name: initialData?.name || '',
      code: initialData?.code || '',
      countryId: initialData?.countryId || '',
    },
  });

  const handleSubmit = async (data: DepartmentFormData) => {
    try {
      await onSubmit(data);
      if (!initialData) {
        form.reset();
      }
    } catch (error) {
      logger.error('Error submitting department form', error as Error, {
        component: 'DepartmentsForm',
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
              <FormLabel>Nombre del Departamento</FormLabel>
              <FormControl>
                <Input
                  placeholder="Ej: Antioquia"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Nombre oficial del departamento
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
                  placeholder="Ej: ANT"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Código único del departamento (opcional)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="countryId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>País</FormLabel>
              <FormControl>
                <CountriesSelect
                  value={field.value}
                  onValueChange={field.onChange}
                  placeholder="Selecciona un país"
                />
              </FormControl>
              <FormDescription>
                País al que pertenece el departamento
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