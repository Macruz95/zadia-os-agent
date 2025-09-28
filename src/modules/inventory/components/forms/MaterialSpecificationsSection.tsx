import { Control } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RawMaterialFormData } from '../../validations/inventory.schema';

interface MaterialSpecificationsSectionProps {
  control: Control<RawMaterialFormData>;
}

export function MaterialSpecificationsSection({ control }: MaterialSpecificationsSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Especificaciones Técnicas</CardTitle>
      </CardHeader>
      <CardContent>
        <FormField
          control={control}
          name="specifications"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Especificaciones</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Especificaciones técnicas, propiedades, normas de calidad, etc."
                  rows={4}
                  {...field}
                  value={field.value || ''}
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