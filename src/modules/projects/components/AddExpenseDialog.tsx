/**
 * ZADIA OS - Add Expense Dialog
 * Diálogo para registrar nuevo gasto
 * Rule #5: Max 200 lines per file
 */

'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { DollarSign, Calendar, Save, Loader2 } from 'lucide-react';
import { logger } from '@/lib/logger';

interface AddExpenseDialogProps {
  projectId: string;
  userId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const formSchema = z.object({
  description: z.string().min(3, 'Mínimo 3 caracteres'),
  category: z.enum(['materials', 'labor', 'equipment', 'transport', 'overhead', 'other']),
  amount: z.number().positive('El monto debe ser mayor a 0'),
  currency: z.string().length(3),
  expenseDate: z.string(),
});

type FormData = z.infer<typeof formSchema>;

import { useAuthState } from '@/hooks/use-auth-state';
import { DEFAULT_CURRENCY } from '@/config/defaults';

import { createExpenseAction } from '@/actions/expense-actions';

export function AddExpenseDialog({
  projectId,
  userId,
  open,
  onOpenChange,
}: AddExpenseDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuthState();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: '',
      category: 'materials',
      amount: 0,
      currency: DEFAULT_CURRENCY,
      expenseDate: new Date().toISOString().split('T')[0],
    },
  });

  const handleSubmit = async (data: FormData) => {
    try {
      setIsSubmitting(true);

      const formData = new FormData();
      formData.append('projectId', projectId);
      formData.append('description', data.description);
      formData.append('category', data.category);
      formData.append('amount', data.amount.toString());
      formData.append('currency', data.currency);
      formData.append('date', data.expenseDate);
      formData.append('createdBy', userId);
      formData.append('createdByName', user?.displayName || user?.email || 'Usuario');

      const result = await createExpenseAction({}, formData);

      if (result.success) {
        toast.success('Gasto registrado y presupuesto actualizado');
        form.reset();
        onOpenChange(false);
      } else {
        toast.error(result.error || 'Error al registrar gasto');
      }
    } catch (error) {
      toast.error('Error inesperado');
      logger.error('Error adding expense', error as Error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Registrar Gasto</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 mt-4">
            {/* Descripción */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe el gasto..."
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Categoría */}
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoría *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona categoría" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="materials">Materiales</SelectItem>
                      <SelectItem value="labor">Mano de Obra</SelectItem>
                      <SelectItem value="equipment">Equipo</SelectItem>
                      <SelectItem value="transport">Transporte</SelectItem>
                      <SelectItem value="overhead">Gastos Generales</SelectItem>
                      <SelectItem value="other">Otros</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              {/* Monto */}
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Monto *</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          className="pl-10"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Moneda */}
              <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Moneda</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Fecha */}
            <FormField
              control={form.control}
              name="expenseDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fecha del Gasto *</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                      <Input type="date" className="pl-10" {...field} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Registrando...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Registrar Gasto
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
