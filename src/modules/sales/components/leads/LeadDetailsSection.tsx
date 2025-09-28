import { Control } from 'react-hook-form';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { LeadFormData } from '../../validations/sales.schema';

interface LeadDetailsSectionProps {
  control: Control<LeadFormData>;
}

const LEAD_SOURCE_OPTIONS = [
  { value: 'web', label: 'Sitio Web' },
  { value: 'referral', label: 'Referido' },
  { value: 'event', label: 'Evento' },
  { value: 'cold-call', label: 'Llamada Fría' },
  { value: 'imported', label: 'Importado' },
] as const;

const PRIORITY_OPTIONS = [
  { value: 'hot', label: '🔥 Caliente' },
  { value: 'warm', label: '🟡 Tibio' },
  { value: 'cold', label: '🧊 Frío' },
] as const;

export function LeadDetailsSection({ control }: LeadDetailsSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Detalles del Lead</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={control}
            name="source"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fuente *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona la fuente" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {LEAD_SOURCE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="priority"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Prioridad *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona la prioridad" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {PRIORITY_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center justify-between w-full">
                          <span>{option.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notas Iniciales</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Observaciones, contexto del contacto, necesidades específicas..."
                  className="min-h-[80px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
}