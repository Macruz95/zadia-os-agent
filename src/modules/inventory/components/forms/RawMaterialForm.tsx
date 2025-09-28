'use client';

import { Form } from '@/components/ui/form';
import { MaterialBasicInfoSection } from './MaterialBasicInfoSection';
import { MaterialInventorySection } from './MaterialInventorySection';
import { MaterialSpecificationsSection } from './MaterialSpecificationsSection';
import { MaterialFormActions } from './MaterialFormActions';
import { useRawMaterialForm } from '../../hooks/use-raw-material-form';

interface RawMaterialFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function RawMaterialForm({ onSuccess, onCancel }: RawMaterialFormProps) {
  const { form, onSubmit, loading } = useRawMaterialForm({
    onSuccess,
    onCancel,
  });

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <MaterialBasicInfoSection control={form.control} />
          
          <MaterialInventorySection control={form.control} />
        </div>

        <MaterialSpecificationsSection control={form.control} />

        <MaterialFormActions loading={loading} onCancel={onCancel} />
      </form>
    </Form>
  );
}