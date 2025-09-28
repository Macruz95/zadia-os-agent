import { Button } from '@/components/ui/button';
import { Plus, FileText } from 'lucide-react';

interface QuotesPageHeaderProps {
  onNewQuote: () => void;
}

export function QuotesPageHeader({ onNewQuote }: QuotesPageHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold">Cotizaciones</h1>
        <p className="text-muted-foreground">
          Gestiona cotizaciones y propuestas comerciales
        </p>
      </div>
      <div className="flex gap-2">
        <Button variant="outline">
          <FileText className="h-4 w-4 mr-2" />
          Plantillas
        </Button>
        <Button onClick={onNewQuote}>
          <Plus className="h-4 w-4 mr-2" />
          Nueva Cotización
        </Button>
      </div>
    </div>
  );
}