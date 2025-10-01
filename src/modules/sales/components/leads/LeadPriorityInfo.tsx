import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const PRIORITY_OPTIONS = [
  { value: 'hot', label: 'Caliente', description: 'Requiere atención inmediata' },
  { value: 'warm', label: 'Tibio', description: 'Seguimiento regular' },
  { value: 'cold', label: 'Frío', description: 'Contacto ocasional' },
] as const;

export function LeadPriorityInfo() {
  return (
    <Card className="bg-muted/20">
      <CardHeader>
        <CardTitle className="text-sm">Información de Prioridades</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {PRIORITY_OPTIONS.map((option) => (
            <div key={option.value} className="flex items-center gap-3">
              <Badge variant="outline">{option.label}</Badge>
              <span className="text-sm text-muted-foreground">
                {option.description}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}