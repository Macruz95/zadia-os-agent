import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload } from 'lucide-react';

interface DocumentsHeaderProps {
  selectedCategory: string;
  filteredCount: number;
  uploading: boolean;
  onCategoryChange: (category: string) => void;
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export function DocumentsHeader({
  selectedCategory,
  filteredCount,
  uploading,
  onCategoryChange,
  onFileUpload,
}: DocumentsHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Select value={selectedCategory} onValueChange={onCategoryChange}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filtrar por categoría" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="contract">Contratos</SelectItem>
            <SelectItem value="drawing">Planos</SelectItem>
            <SelectItem value="photo">Fotos</SelectItem>
            <SelectItem value="report">Reportes</SelectItem>
            <SelectItem value="other">Otros</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-sm text-muted-foreground">
          {filteredCount} documentos
        </span>
      </div>

      <div>
        <Input
          type="file"
          multiple
          onChange={onFileUpload}
          disabled={uploading}
          className="hidden"
          id="file-upload"
        />
        <label htmlFor="file-upload">
          <Button asChild disabled={uploading}>
            <span>
              <Upload className="w-4 h-4 mr-2" />
              {uploading ? 'Subiendo...' : 'Subir Archivos'}
            </span>
          </Button>
        </label>
      </div>
    </div>
  );
}