import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface LeadSourcePriorityProps {
  source: 'web' | 'referral' | 'event' | 'cold-call' | 'imported';
  onSourceChange: (value: 'web' | 'referral' | 'event' | 'cold-call' | 'imported') => void;
  priority: 'hot' | 'warm' | 'cold';
  onPriorityChange: (value: 'hot' | 'warm' | 'cold') => void;
}

export function LeadSourcePriority({ source, onSourceChange, priority, onPriorityChange }: LeadSourcePriorityProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="source">Fuente *</Label>
        <Select value={source} onValueChange={onSourceChange}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="web">Sitio Web</SelectItem>
            <SelectItem value="referral">Referido</SelectItem>
            <SelectItem value="event">Evento</SelectItem>
            <SelectItem value="cold-call">Llamada Fría</SelectItem>
            <SelectItem value="imported">Importado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="priority">Prioridad *</Label>
        <Select value={priority} onValueChange={onPriorityChange}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="hot">🔥 Caliente</SelectItem>
            <SelectItem value="warm">🟡 Tibio</SelectItem>
            <SelectItem value="cold">🧊 Frío</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}