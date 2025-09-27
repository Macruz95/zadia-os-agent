import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { RawMaterialFormData, RawMaterialFormSchema } from '../validations/inventory.schema';
import { createRawMaterial, updateRawMaterial } from '../services/inventory.service';
import { RawMaterial } from '../types/inventory.types';

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
      // Clean the data - ensure numbers and only include non-empty optional fields
      const baseData = {
        name: data.name,
        category: data.category,      
        unitOfMeasure: data.unitOfMeasure,
        minimumStock: typeof data.minimumStock === 'string' && data.minimumStock === '' ? 0 : Number(data.minimumStock) || 0,
        unitCost: typeof data.unitCost === 'string' && data.unitCost === '' ? 0 : Number(data.unitCost) || 0,
        location: data.location,
      };

      // Build clean data object with only non-empty optional fields
      const cleanData = {
        ...baseData,
        ...(data.supplierId && typeof data.supplierId === 'string' && data.supplierId.trim() !== '' && { supplierId: data.supplierId.trim() }),
        ...(data.supplierName && typeof data.supplierName === 'string' && data.supplierName.trim() !== '' && { supplierName: data.supplierName.trim() }),
        ...(data.description && typeof data.description === 'string' && data.description.trim() !== '' && { description: data.description.trim() }),
        ...(data.specifications && typeof data.specifications === 'string' && data.specifications.trim() !== '' && { specifications: data.specifications.trim() }),
      };



      let result: RawMaterial;
      
      if (isEditing && initialData) {
        // TODO: Implementar AuthContext para obtener usuario actual
        const currentUser = 'system-user'; // Temporal hasta implementar auth context
        result = await updateRawMaterial(initialData.id, cleanData as RawMaterialFormData, currentUser);
        toast.success('Materia prima actualizada exitosamente');
      } else {
        // TODO: Implementar AuthContext para obtener usuario actual
        const currentUser = 'system-user'; // Temporal hasta implementar auth context
        result = await createRawMaterial(cleanData as RawMaterialFormData, currentUser);
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