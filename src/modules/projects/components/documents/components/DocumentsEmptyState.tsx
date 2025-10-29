import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Upload } from 'lucide-react';

interface DocumentsEmptyStateProps {
  loading: boolean;
}

export function DocumentsEmptyState({ loading }: DocumentsEmptyStateProps) {
  if (loading) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <div className="animate-spin w-12 h-12 mx-auto border-4 border-primary border-t-transparent rounded-full mb-4" />
          <p className="text-sm text-muted-foreground">Cargando documentos...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="py-12 text-center">
        <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="font-medium text-lg mb-2">Sin documentos</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Aún no hay documentos asociados a este proyecto
        </p>
        <label htmlFor="file-upload">
          <Button asChild>
            <span>
              <Upload className="w-4 h-4 mr-2" />
              Subir Primer Documento
            </span>
          </Button>
        </label>
      </CardContent>
    </Card>
  );
}