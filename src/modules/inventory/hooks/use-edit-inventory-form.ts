'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { RawMaterial, FinishedProduct } from '../types';
import { RawMaterialFormSchema, FinishedProductFormSchema } from '../validations/inventory.schema';
import { updateRawMaterial, updateFinishedProduct } from '../services/inventory.service';
import { toast } from 'sonner';
import { EditRawMaterialFormData, EditFinishedProductFormData } from '../components/types/form-data';

interface UseEditInventoryFormProps {
  item: RawMaterial | FinishedProduct | null;
  itemType: 'raw-materials' | 'finished-products';
  open: boolean;
  onSuccess?: () => void;
  onOpenChange: (open: boolean) => void;
}

export function useEditInventoryForm({
  item,
  itemType,
  open,
  onSuccess,
  onOpenChange
}: UseEditInventoryFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isRawMaterial = itemType === 'raw-materials';

  // Formulario para materias primas
  const rawMaterialForm = useForm<EditRawMaterialFormData>({
    resolver: zodResolver(RawMaterialFormSchema),
    defaultValues: {
      name: '',
      category: 'Otros',
      unitOfMeasure: 'unidades',
      minimumStock: 0,
      unitCost: 0,
      location: { warehouse: '', section: '', shelf: '', position: '' },
      supplierId: '',
      supplierName: '',
      description: '',
      specifications: '',
    },
  });

  // Formulario para productos terminados
  const finishedProductForm = useForm<EditFinishedProductFormData>({
    resolver: zodResolver(FinishedProductFormSchema),
    defaultValues: {
      name: '',
      category: 'Otros',
      description: '',
      dimensions: { length: 0, width: 0, height: 0, unit: 'cm' },
      minimumStock: 0,
      laborCost: 0,
      overheadCost: 0,
      suggestedPrice: 0,
      sellingPrice: 0,
      location: { warehouse: '', section: '', shelf: '', position: '' },
      specifications: '',
    },
  });

  // Cargar datos cuando se abre el modal
  useEffect(() => {
    if (item && open) {
      if (isRawMaterial) {
        const rawMaterial = item as RawMaterial;
        rawMaterialForm.reset({
          name: rawMaterial.name,
          category: rawMaterial.category,
          unitOfMeasure: rawMaterial.unitOfMeasure,
          minimumStock: rawMaterial.minimumStock,
          unitCost: rawMaterial.unitCost,
          location: rawMaterial.location,
          supplierId: rawMaterial.supplierId || '',
          supplierName: rawMaterial.supplierName || '',
          description: rawMaterial.description || '',
          specifications: rawMaterial.specifications || '',
        });
      } else {
        const finishedProduct = item as FinishedProduct;
        finishedProductForm.reset({
          name: finishedProduct.name,
          category: finishedProduct.category,
          description: finishedProduct.description || '',
          dimensions: finishedProduct.dimensions,
          minimumStock: finishedProduct.minimumStock,
          laborCost: finishedProduct.laborCost || 0,
          overheadCost: finishedProduct.overheadCost || 0,
          suggestedPrice: finishedProduct.suggestedPrice || 0,
          sellingPrice: finishedProduct.sellingPrice || 0,
          location: finishedProduct.location,
          specifications: finishedProduct.specifications || '',
        });
      }
    }
  }, [item, open, isRawMaterial, rawMaterialForm, finishedProductForm]);

  const handleSubmit = async (data: EditRawMaterialFormData | EditFinishedProductFormData) => {
    if (!item) return;
    
    try {
      setIsSubmitting(true);
      
      // TODO: Implementar AuthContext para obtener usuario actual
      const updatedBy = 'system-user'; // Temporal hasta implementar auth context
      
      if (isRawMaterial) {
        await updateRawMaterial(item.id, data as EditRawMaterialFormData, updatedBy);
        toast.success('Materia prima actualizada correctamente');
      } else {
        await updateFinishedProduct(item.id, data as EditFinishedProductFormData, updatedBy);
        toast.success('Producto terminado actualizado correctamente');
      }
      
      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al actualizar el ítem';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isRawMaterial,
    isSubmitting,
    rawMaterialForm,
    finishedProductForm,
    handleSubmit,
  };
}