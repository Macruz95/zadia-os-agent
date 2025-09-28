'use client';

import { Form } from '@/components/ui/form';
import { useFinishedProductForm } from '../../hooks/use-finished-product-form';
import { ProductBasicInfo } from './ProductBasicInfo';
import { ProductCostsAndPricing } from './ProductCostsAndPricing';
import { ProductDimensions } from './ProductDimensions';
import { ProductLocation } from './ProductLocation';
import { ProductSpecifications } from './ProductSpecifications';
import { ProductFormActions } from './ProductFormActions';

interface FinishedProductFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}



export function FinishedProductForm({ onSuccess, onCancel }: FinishedProductFormProps) {
  const { form, onSubmit, loading } = useFinishedProductForm({
    onSuccess,
    onCancel,
  });

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ProductBasicInfo control={form.control} />
          <ProductCostsAndPricing control={form.control} />
        </div>

        <ProductDimensions control={form.control} />
        <ProductLocation control={form.control} />
        <ProductSpecifications control={form.control} />
        <ProductFormActions onCancel={onCancel} loading={loading} />
      </form>
    </Form>
  );
}