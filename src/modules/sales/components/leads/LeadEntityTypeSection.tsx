import { Control } from 'react-hook-form';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { User, Building2 } from 'lucide-react';
import { LeadFormData } from '../../validations/sales.schema';

interface LeadEntityTypeSectionProps {
  control: Control<LeadFormData>;
}

export function LeadEntityTypeSection({ control }: LeadEntityTypeSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Tipo de Entidad</CardTitle>
        <CardDescription>
          Selecciona si es una persona individual o una entidad/empresa
        </CardDescription>
      </CardHeader>
      <CardContent>
        <FormField
          control={control}
          name="entityType"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  value={field.value}
                  className="flex gap-6"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="person" id="person" />
                    <Label htmlFor="person" className="flex items-center gap-2 cursor-pointer">
                      <User className="h-4 w-4" />
                      Persona Individual
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="company" id="company" />
                    <Label htmlFor="company" className="flex items-center gap-2 cursor-pointer">
                      <Building2 className="h-4 w-4" />
                      Empresa
                    </Label>
                  </div>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
}