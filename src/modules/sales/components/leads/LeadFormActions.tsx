import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface LeadFormActionsProps {
  loading: boolean;
  onCancel: () => void;
}

export function LeadFormActions({ loading, onCancel }: LeadFormActionsProps) {
  return (
    <div className="flex justify-end gap-3">
      <Button
        type="button"
        variant="outline"
        onClick={onCancel}
        disabled={loading}
      >
        Cancelar
      </Button>
      <Button type="submit" disabled={loading}>
        {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
        Crear Lead
      </Button>
    </div>
  );
}