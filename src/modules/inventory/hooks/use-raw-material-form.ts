import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { RawMaterialFormData, RawMaterialFormSchema } from '../validations/inventory.schema';
import { createRawMaterial, updateRawMaterial } from '../services/inventory.service';
import { RawMaterial } from '../types';

interface UseRawMaterialFormProps {
  initialData?: RawMaterial;
  onSuccess?: (rawMaterial: RawMaterial) => void;
  onCancel?: () => void;
}

export const useRawMaterialForm = ({ 
  initialData, 
  onSuccess, 
  onCancel 
}: UseRawMaterialFormProps = {}) => {
  const [loading, setLoading] = useState(false);
  const isEditing = Boolean(initialData);

  const form = useForm<RawMaterialFormData>({
    resolver: zodResolver(RawMaterialFormSchema),
    defaultValues: initialData ? {
      name: initialData.name,
      category: initialData.category,
      unitOfMeasure: initialData.unitOfMeasure,
      minimumStock: initialData.minimumStock,
      unitCost: initialData.unitCost,
      location: initialData.location,
      supplierId: initialData.supplierId || undefined,
      supplierName: initialData.supplierName || undefined,
      description: initialData.description || undefined,
      specifications: initialData.specifications || undefined,
    } : {
      name: '',
      category: 'Maderas',
      unitOfMeasure: 'unidades',
      minimumStock: 0,
      unitCost: 0,
      location: {
        warehouse: '',
        section: '',
        shelf: '',
        position: ''
      },
    },
  });

  const onSubmit = useCallback(async (data: RawMaterialFormData) => {
    setLoading(true);
    try {
      let result: RawMaterial;
      
      if (isEditing && initialData) {
        result = await updateRawMaterial(initialData.id, data, 'current-user'); // TODO: Get actual user
        toast.success('Materia prima actualizada exitosamente');
      } else {
        result = await createRawMaterial(data, 'current-user'); // TODO: Get actual user
        toast.success('Materia prima creada exitosamente');
      }

      form.reset();
      onSuccess?.(result);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al procesar materia prima');
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