import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface QuoteModeSelectorProps {
  mode: 'opportunity' | 'direct' | 'lead';
  onModeChange: (mode: 'opportunity' | 'direct' | 'lead') => void;
}

export function QuoteModeSelector({ mode, onModeChange }: QuoteModeSelectorProps) {
  return (
    <div className="space-y-3">
      <Label>¿Cómo desea crear la cotización?</Label>
      <RadioGroup value={mode} onValueChange={(v) => onModeChange(v as 'opportunity' | 'direct' | 'lead')}>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="opportunity" id="opportunity" />
          <Label htmlFor="opportunity" className="font-normal cursor-pointer">
            Desde una oportunidad existente
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="lead" id="lead" />
          <Label htmlFor="lead" className="font-normal cursor-pointer">
            Desde un prospecto (Lead)
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="direct" id="direct" />
          <Label htmlFor="direct" className="font-normal cursor-pointer">
            Directamente con un cliente
          </Label>
        </div>
      </RadioGroup>
    </div>
  );
}