'use client';

import { Controller, UseFormReturn } from 'react-hook-form';
import { MapPin } from 'lucide-react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { CountriesSelect, DepartmentsSelect, MunicipalitiesSelect, DistrictsSelect } from '../reusable-components';

/* eslint-disable @typescript-eslint/no-explicit-any */
interface AddressStepProps {
  form: UseFormReturn<any>;
}
/* eslint-enable @typescript-eslint/no-explicit-any */

export function AddressStep({ form }: AddressStepProps) {
  const countryValue = form.watch('address.country');
  const stateValue = form.watch('address.state');
  const cityValue = form.watch('address.city');
  
  // Check if the selected country is El Salvador
  const isSalvador = countryValue === 'sv';

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
          <MapPin className="h-6 w-6 text-primary" />
        </div>
        <h3 className="text-lg font-medium">Dirección del cliente</h3>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <Controller
          name="address.country"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>País</FormLabel>
              <FormControl>
                <CountriesSelect
                  value={field.value}
                  onValueChange={(value) => {
                    field.onChange(value);
                    // Reset dependent fields when country changes
                    form.setValue('address.state', '');
                    form.setValue('address.city', '');
                    form.setValue('address.district', '');
                  }}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <Controller
          name="address.state"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Departamento/Estado</FormLabel>
              <FormControl>
                <DepartmentsSelect
                  countryId={countryValue}
                  value={field.value}
                  onValueChange={(value) => {
                    field.onChange(value);
                    // Reset dependent fields when state changes
                    form.setValue('address.city', '');
                    form.setValue('address.district', '');
                  }}
                />
              </FormControl>
            </FormItem>
          )}
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        {isSalvador ? (
          // For El Salvador: Show municipality as select
          <Controller
            name="address.city"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Municipio</FormLabel>
                <FormControl>
                  <MunicipalitiesSelect
                    departmentId={stateValue}
                    value={field.value}
                    onValueChange={(value) => {
                      field.onChange(value);
                      // Reset district when municipality changes
                      form.setValue('address.district', '');
                    }}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        ) : (
          // For other countries: Show municipality as manual input
          <FormField
            control={form.control}
            name="address.city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ciudad/Municipio</FormLabel>
                <FormControl>
                  <Input placeholder="Ciudad o municipio" {...field} value={field.value || ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        
        {isSalvador ? (
          // For El Salvador: Show district as select
          <Controller
            name="address.district"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Distrito</FormLabel>
                <FormControl>
                  <DistrictsSelect
                    municipalityId={cityValue}
                    value={field.value}
                    onValueChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        ) : (
          // For other countries: Show postal code
          <FormField
            control={form.control}
            name="address.postalCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Código Postal (Opcional)</FormLabel>
                <FormControl>
                  <Input placeholder="Código postal (si lo conoce)" {...field} value={field.value || ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
      </div>
      
      {isSalvador && (
        // For El Salvador: Show postal code in separate row
        <FormField
          control={form.control}
          name="address.postalCode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Código Postal (Opcional)</FormLabel>
              <FormControl>
                <Input placeholder="Código postal (si lo conoce)" {...field} value={field.value || ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
      
      <FormField
        control={form.control}
        name="address.street"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Dirección completa</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Calle, número, colonia, referencias..."
                className="min-h-20"
                {...field}
                value={field.value || ''}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}