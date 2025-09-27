import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { FinishedProductFormData, FinishedProductFormSchema } from '../validations/inventory.schema';
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
    resolver: zodResolver(FinishedProductFormSchema),
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
      description: '',
      dimensions: {
        length: 0,
        width: 0,
        height: 0,
        unit: 'cm'
      },
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
      specifications: '',
    },
  });

  const onSubmit = useCallback(async (data: FinishedProductFormData) => {
    setLoading(true);
    try {
      // Clean the data - ensure numbers and only include non-empty optional fields
      const baseData = {
        name: data.name,
        category: data.category,      
        minimumStock: typeof data.minimumStock === 'string' && data.minimumStock === '' ? 0 : Number(data.minimumStock) || 0,
        laborCost: typeof data.laborCost === 'string' && data.laborCost === '' ? 0 : Number(data.laborCost) || 0,
        overheadCost: typeof data.overheadCost === 'string' && data.overheadCost === '' ? 0 : Number(data.overheadCost) || 0,
        suggestedPrice: typeof data.suggestedPrice === 'string' && data.suggestedPrice === '' ? 0 : Number(data.suggestedPrice) || 0,
        sellingPrice: typeof data.sellingPrice === 'string' && data.sellingPrice === '' ? 0 : Number(data.sellingPrice) || 0,
        location: data.location,
      };

      // Build clean data object with only non-empty optional fields
      const cleanData = {
        ...baseData,
        ...(data.description && typeof data.description === 'string' && data.description.trim() !== '' && { description: data.description.trim() }),
        ...(data.dimensions && { dimensions: data.dimensions }),
        ...(data.specifications && typeof data.specifications === 'string' && data.specifications.trim() !== '' && { specifications: data.specifications.trim() }),
      };

      let result: FinishedProduct;
      
      if (isEditing && initialData) {
        // TODO: Implementar AuthContext para obtener usuario actual
        const currentUser = 'system-user'; // Temporal hasta implementar auth context
        result = await updateFinishedProduct(initialData.id, cleanData as FinishedProductFormData, currentUser);
        toast.success('Producto terminado actualizado exitosamente');
      } else {
        // TODO: Implementar AuthContext para obtener usuario actual
        const currentUser = 'system-user'; // Temporal hasta implementar auth context
        result = await createFinishedProduct(cleanData as FinishedProductFormData, currentUser);
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