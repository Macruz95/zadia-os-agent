/**
 * ZADIA OS - Product Form Actions Component
 * 
 * Action buttons for the product form (Cancel/Submit)
 */

import { Button } from '@/components/ui/button';

interface ProductFormActionsProps {
  onCancel?: () => void;
  loading?: boolean;
}

export function ProductFormActions({ onCancel, loading = false }: ProductFormActionsProps) {
  return (
    <div className="flex gap-4 pt-4">
      <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
        Cancelar
      </Button>
      <Button type="submit" disabled={loading}>
        {loading ? 'Guardando...' : 'Crear Producto Terminado'}
      </Button>
    </div>
  );
}