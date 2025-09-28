import { Button } from '@/components/ui/button';

interface MaterialFormActionsProps {
  loading: boolean;
  onCancel?: () => void;
}

export function MaterialFormActions({ loading, onCancel }: MaterialFormActionsProps) {
  return (
    <div className="flex gap-4 pt-4">
      <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
        Cancelar
      </Button>
      <Button type="submit" disabled={loading}>
        {loading ? 'Guardando...' : 'Crear Materia Prima'}
      </Button>
    </div>
  );
}