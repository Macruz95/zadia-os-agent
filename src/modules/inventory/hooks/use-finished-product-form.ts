import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { FinishedProductSchema } from '../validations/inventory.schema';
import { FinishedProductCategory } from '../types';

// Simplified form data without BOM for now
type FinishedProductFormData = {
  name: string;
  category: FinishedProductCategory;
  description?: string;
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
    unit: 'cm' | 'm' | 'inches';
  };
  minimumStock: number;
  laborCost: number;
  overheadCost: number;
  suggestedPrice: number;
  sellingPrice: number;
  location: {
    warehouse: string;
    section?: string;
    shelf?: string;
    position?: string;
  };
  specifications?: string;
};
import { createFinishedProduct, updateFinishedProduct } from '../services/inventory.service';
import { FinishedProduct } from '../types';

interface UseFinishedProductFormProps {
  initialData?: FinishedProduct;
  onSuccess?: (finishedProduct: FinishedProduct) => void;
  onCancel?: () => void;
}

export const useFinishedProductForm = ({ 
  initialData, 
  onSuccess, 
  onCancel 
}: UseFinishedProductFormProps = {}) => {
  const [loading, setLoading] = useState(false);
  const isEditing = Boolean(initialData);

  const form = useForm<FinishedProductFormData>({
    resolver: zodResolver(FinishedProductSchema),
    defaultValues: initialData ? {
      name: initialData.name,
      category: initialData.category,
      description: initialData.description,
      dimensions: initialData.dimensions,
      minimumStock: initialData.minimumStock,
      laborCost: initialData.laborCost,
      overheadCost: initialData.overheadCost,
      suggestedPrice: initialData.suggestedPrice,
      sellingPrice: initialData.sellingPrice,
      location: initialData.location,
      specifications: initialData.specifications,
    } : {
      name: '',
      category: 'Dormitorio',
      minimumStock: 0,
      laborCost: 0,
      overheadCost: 0,
      suggestedPrice: 0,
      sellingPrice: 0,
      location: {
        warehouse: '',
        section: '',
        shelf: '',
        position: ''
      },
    },
  });

  const onSubmit = useCallback(async (data: FinishedProductFormData) => {
    setLoading(true);
    try {
      let result: FinishedProduct;
      
      if (isEditing && initialData) {
        result = await updateFinishedProduct(initialData.id, data, 'current-user'); // TODO: Get actual user
        toast.success('Producto terminado actualizado exitosamente');
      } else {
        result = await createFinishedProduct(data, 'current-user'); // TODO: Get actual user
        toast.success('Producto terminado creado exitosamente');
      }

      form.reset();
      onSuccess?.(result);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al procesar producto terminado');
    } finally {
      setLoading(false);
    }
  }, [isEditing, initialData, form, onSuccess]);

  const handleCancel = useCallback(() => {
    form.reset();
    onCancel?.();
  }, [form, onCancel]);

  const resetForm = useCallback(() => {
    form.reset();
  }, [form]);

  return {
    form,
    loading,
    isEditing,
    onSubmit: form.handleSubmit(onSubmit),
    handleCancel,
    resetForm,
  };
};