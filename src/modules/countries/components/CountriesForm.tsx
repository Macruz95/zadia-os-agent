/**
 * ZADIA OS - Countries Form Component
 * 
 * Form for creating and editing countries
 */

import React from 'react';
import { logger } from '@/lib/logger';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { countrySchema, Country } from '../types/countries.types';

interface CountriesFormProps {
  initialData?: Partial<Country>;
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function CountriesForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false
}: CountriesFormProps) {
  const form = useForm({
    resolver: zodResolver(countrySchema.omit({ id: true })),
    defaultValues: {
      name: '',
      isoCode: '',
      phoneCode: '',
      flagEmoji: '',
      isActive: true,
      ...initialData,
    },
  });

  const handleSubmit = async (data: any) => {
    try {
      // Convert isoCode to uppercase
      const formattedData = {
        ...data,
        isoCode: data.isoCode.toUpperCase()
      };
      await onSubmit(formattedData);
      if (!initialData) {
        form.reset();
      }
    } catch (error) {
      logger.error('Error submitting country form', error as Error, {
        component: 'CountriesForm',
        action: 'handleSubmit'
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre del País *</FormLabel>
              <FormControl>
                <Input placeholder="Guatemala" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="isoCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Código ISO *</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="GT" 
                    maxLength={2}
                    {...field}
                    onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phoneCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Código Telefónico *</FormLabel>
                <FormControl>
                  <Input placeholder="+502" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="flagEmoji"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Emoji de Bandera</FormLabel>
              <FormControl>
                <Input placeholder="🇬🇹" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between">
              <FormLabel>País Activo</FormLabel>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-4 pt-4">
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
            {isLoading ? 'Guardando...' : (initialData ? 'Actualizar' : 'Crear')}
          </Button>
        </div>
      </form>
    </Form>
  );
}