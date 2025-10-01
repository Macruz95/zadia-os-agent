import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Flame, Thermometer, Snowflake } from 'lucide-react';

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
            <SelectItem value="hot">
              <div className="flex items-center gap-2">
                <Flame className="h-4 w-4 text-red-500" />
                <span>Caliente</span>
              </div>
            </SelectItem>
            <SelectItem value="warm">
              <div className="flex items-center gap-2">
                <Thermometer className="h-4 w-4 text-yellow-500" />
                <span>Tibio</span>
              </div>
            </SelectItem>
            <SelectItem value="cold">
              <div className="flex items-center gap-2">
                <Snowflake className="h-4 w-4 text-blue-500" />
                <span>Frío</span>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}