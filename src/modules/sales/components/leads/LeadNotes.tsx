import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface LeadNotesProps {
  notes: string;
  onNotesChange: (value: string) => void;
}

export function LeadNotes({ notes, onNotesChange }: LeadNotesProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="notes">Notas Iniciales</Label>
      <Textarea
        id="notes"
        placeholder="Observaciones, contexto del contacto, necesidades específicas..."
        className="min-h-[80px]"
        value={notes}
        onChange={(e) => onNotesChange(e.target.value)}
      />
    </div>
  );
}