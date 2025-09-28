/**
 * ZADIA OS - BOM Actions Component
 * 
 * Save and cancel action buttons for the BOM builder
 */

import { Button } from '@/components/ui/button';

interface BOMActionsProps {
  onCancel: () => void;
  loading?: boolean;
  hasItems: boolean;
}

export function BOMActions({ onCancel, loading = false, hasItems }: BOMActionsProps) {
  return (
    <div className="flex gap-4 justify-end">
      <Button
        type="button"
        variant="outline"
        onClick={onCancel}
        disabled={loading}
      >
        Cancelar
      </Button>
      <Button type="submit" disabled={loading || !hasItems}>
        {loading ? 'Guardando...' : 'Guardar BOM'}
      </Button>
    </div>
  );
}