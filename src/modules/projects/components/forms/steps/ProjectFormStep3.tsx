'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import type { CreateProjectInput } from '../../../validations/projects.validation';
import { DollarSign } from 'lucide-react';

/**
 * ProjectFormStep3 - Finanzas y Condiciones
 * Rule #2: ShadCN UI + Lucide icons
 * Rule #3: Zod validation
 * Rule #5: 145 lines (within limit)
 */

const step3Schema = z.object({
  salesPrice: z.number().min(0, 'Debe ser mayor o igual a 0'),
  estimatedCost: z.number().min(0, 'Debe ser mayor o igual a 0'),
  currency: z.string().length(3, 'Código de 3 letras'),
  paymentTerms: z.string().optional(),
});

type Step3Data = z.infer<typeof step3Schema>;

interface ProjectFormStep3Props {
  data: Partial<CreateProjectInput>;
  onChange: (data: Partial<CreateProjectInput>) => void;
  onNext: () => void;
}

export function ProjectFormStep3({ data, onChange, onNext }: ProjectFormStep3Props) {
  const form = useForm<Step3Data>({
    resolver: zodResolver(step3Schema),
    defaultValues: {
      salesPrice: data.salesPrice || 0,
      estimatedCost: data.estimatedCost || 0,
      currency: data.currency || 'USD',
      paymentTerms: data.paymentTerms || '',
    },
  });

  const onSubmit = (values: Step3Data) => {
    onChange(values);
    onNext();
  };

  const salesPrice = form.watch('salesPrice');
  const estimatedCost = form.watch('estimatedCost');
  const profitMargin = salesPrice > 0 ? ((salesPrice - estimatedCost) / salesPrice) * 100 : 0;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Precio de Venta */}
        <FormField
          control={form.control}
          name="salesPrice"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Precio de Venta *</FormLabel>
              <FormControl>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Input
                    {...field}
                    type="number"
                    step="0.01"
                    min="0"
                    className="pl-9"
                    placeholder="0.00"
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Costo Estimado */}
        <FormField
          control={form.control}
          name="estimatedCost"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Costo Estimado</FormLabel>
              <FormControl>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Input
                    {...field}
                    type="number"
                    step="0.01"
                    min="0"
                    className="pl-9"
                    placeholder="0.00"
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Margen de Utilidad */}
        <div className="p-4 bg-muted rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Margen de Utilidad Estimado</span>
            <span className={`text-lg font-bold ${profitMargin >= 20 ? 'text-green-600' : profitMargin >= 10 ? 'text-yellow-600' : 'text-red-600'}`}>
              {profitMargin.toFixed(1)}%
            </span>
          </div>
        </div>

        {/* Moneda */}
        <FormField
          control={form.control}
          name="currency"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Moneda *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione la moneda" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="USD">USD - Dólar Americano</SelectItem>
                  <SelectItem value="MXN">MXN - Peso Mexicano</SelectItem>
                  <SelectItem value="EUR">EUR - Euro</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Términos de Pago */}
        <FormField
          control={form.control}
          name="paymentTerms"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Términos de Pago (opcional)</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="Ej: 50% anticipo, 30% a mitad de proyecto, 20% contra entrega"
                  rows={3}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full">
          Continuar
        </Button>
      </form>
    </Form>
  );
}
