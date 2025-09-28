import { Controller, UseFormReturn } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { ClientFormData } from '../validations/clients.schema';
import { PhoneCodeInput } from './reusable-components';

interface NaturalPersonContactProps {
  form: UseFormReturn<ClientFormData>;
  clientName: string;
}

export function NaturalPersonContact({ form, clientName }: NaturalPersonContactProps) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-lg font-medium">Contacto Principal</h3>
        <p className="text-sm text-muted-foreground mt-2">
          Para personas naturales, el contacto principal es automáticamente la misma persona registrada.
          Solo necesitas proporcionar el número de teléfono. El código postal es opcional.
        </p>
      </div>
      
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Nombre</label>
            <p className="text-sm text-gray-900">{clientName || 'Pendiente'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Rol</label>
            <p className="text-sm text-gray-900">Cliente Principal</p>
          </div>
        </div>
      </div>
      
      {/* Campos editables para teléfono y email */}
      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="contacts.0.email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email (Opcional)</FormLabel>
              <FormControl>
                <Input 
                  type="email" 
                  placeholder="email@ejemplo.com" 
                  {...field} 
                  value={field.value || ''} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Controller
          name="contacts.0.phone"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Número de teléfono (Requerido)</FormLabel>
              <PhoneCodeInput
                value={field.value || ''}
                onChange={field.onChange}
                countryId={form.watch('contacts.0.phoneCountryId')}
                onCountryChange={(countryId) => {
                  form.setValue('contacts.0.phoneCountryId', countryId);
                }}
              />
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}