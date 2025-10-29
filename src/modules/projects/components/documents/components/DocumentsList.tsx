import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Download, 
  Trash2, 
  Eye,
  File,
  Image as ImageIcon,
  FileSpreadsheet,
  FileText
} from 'lucide-react';

interface ProjectDocument {
  id: string;
  name: string;
  type: string;
  category: 'contract' | 'drawing' | 'photo' | 'report' | 'other';
  size: number;
  uploadedAt: Date;
  uploadedBy: string;
  url: string;
}

interface DocumentsListProps {
  documents: ProjectDocument[];
  onDownload: (doc: ProjectDocument) => void;
  onDelete: (docId: string) => void;
}

export function DocumentsList({ documents, onDownload, onDelete }: DocumentsListProps) {
  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return ImageIcon;
    if (type.includes('sheet') || type.includes('excel')) return FileSpreadsheet;
    if (type.includes('pdf')) return FileText;
    return File;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      contract: 'Contrato',
      drawing: 'Plano',
      photo: 'Foto',
      report: 'Reporte',
      other: 'Otro',
    };
    return labels[category] || category;
  };

  return (
    <div className="grid gap-4">
      {documents.map((doc) => {
        const Icon = getFileIcon(doc.type);

        return (
          <Card key={doc.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <Icon className="w-8 h-8 text-blue-600 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <CardTitle className="text-base truncate">{doc.name}</CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline">
                        {getCategoryLabel(doc.category)}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatFileSize(doc.size)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="ghost" onClick={() => onDownload(doc)}>
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => onDownload(doc)}>
                    <Download className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => onDelete(doc.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>
        );
      })}
    </div>
  );
}