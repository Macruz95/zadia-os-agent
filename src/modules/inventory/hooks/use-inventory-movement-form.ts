import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { MovementSchema } from '../validations/inventory.schema';
import { InventoryMovementsService } from '../services/entities/inventory-movements-entity.service';
import { InventoryMovement, MovementFormData } from '../types';

interface UseInventoryMovementFormProps {
  onSuccess?: (movement: InventoryMovement) => void;
  onCancel?: () => void;
}

export const useInventoryMovementForm = ({ 
  onSuccess, 
  onCancel 
}: UseInventoryMovementFormProps = {}) => {
  const [loading, setLoading] = useState(false);
  const [availableItems, setAvailableItems] = useState<Array<{
    id: string;
    name: string;
    sku: string;
    currentStock: number;
    type: 'raw-material' | 'finished-product';
  }>>([]);

  const form = useForm<MovementFormData>({
    resolver: zodResolver(MovementSchema),
    defaultValues: {
      itemId: '',
      itemType: 'raw-material',
      movementType: 'Entrada',
      quantity: 0,
      reason: '',
      referenceDocument: '',
      notes: '',
    },
  });

  const onSubmit = useCallback(async (data: MovementFormData) => {
    setLoading(true);
    try {
      const result = await InventoryMovementsService.createMovement(data, 'current-user'); // TODO: Get actual user
      
      let successMessage = '';
      switch (data.movementType) {
        case 'Entrada':
          successMessage = `Entrada registrada: +${data.quantity} unidades`;
          break;
        case 'Salida':
          successMessage = `Salida registrada: -${data.quantity} unidades`;
          break;
        case 'Ajuste':
          successMessage = `Ajuste registrado: stock actualizado a ${data.quantity}`;
          break;
        case 'Merma':
          successMessage = `Merma registrada: -${data.quantity} unidades`;
          break;
        default:
          successMessage = `Movimiento ${data.movementType} registrado exitosamente`;
      }
      
      toast.success(successMessage);
      form.reset();
      onSuccess?.(result);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al registrar movimiento');
    } finally {
      setLoading(false);
    }
  }, [form, onSuccess]);

  const handleCancel = useCallback(() => {
    form.reset();
    onCancel?.();
  }, [form, onCancel]);

  const resetForm = useCallback(() => {
    form.reset();
  }, [form]);

  // Helper to load available items (would be called from parent component)
  const loadAvailableItems = useCallback((items: typeof availableItems) => {
    setAvailableItems(items);
  }, []);

  // Get current item details
  const selectedItem = availableItems.find(item => item.id === form.watch('itemId'));

  return {
    form,
    loading,
    availableItems,
    selectedItem,
    onSubmit: form.handleSubmit(onSubmit),
    handleCancel,
    resetForm,
    loadAvailableItems,
  };
};