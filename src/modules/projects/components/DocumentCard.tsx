/**
 * ZADIA OS - Document Card Component
 * Tarjeta de documento con preview y acciones
 * Rule #5: Max 200 lines per file
 */

'use client';

import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  FileText,
  Download,
  Trash2,
  ExternalLink,
  FileImage,
  File,
} from 'lucide-react';
import type { ProjectDocument } from '../types/projects.types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface DocumentCardProps {
  document: ProjectDocument;
  onDelete: () => void;
}

const documentTypeLabels: Record<string, string> = {
  contract: 'Contrato',
  quote: 'Cotización',
  invoice: 'Factura',
  'technical-drawing': 'Plano Técnico',
  photo: 'Foto',
  report: 'Reporte',
  other: 'Otro',
};

const documentTypeIcons: Record<string, typeof File> = {
  contract: FileText,
  quote: FileText,
  invoice: FileText,
  'technical-drawing': FileText,
  photo: FileImage,
  report: FileText,
  other: File,
};

export function DocumentCard({ document: doc, onDelete }: DocumentCardProps) {
  const Icon = documentTypeIcons[doc.documentType] || File;
  const isImage = doc.fileType.startsWith('image/');

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      {/* Preview o Icon */}
      <div className="aspect-video bg-muted flex items-center justify-center relative">
        {isImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={doc.fileUrl}
            alt={doc.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <Icon className="h-12 w-12 text-muted-foreground" />
        )}
        
        <Badge
          variant="secondary"
          className="absolute top-2 right-2"
        >
          {documentTypeLabels[doc.documentType] || doc.documentType}
        </Badge>
      </div>

      <CardContent className="pt-4">
        <div className="space-y-2">
          {/* Nombre */}
          <h4 className="font-medium text-sm truncate" title={doc.name}>
            {doc.name}
          </h4>

          {/* Descripción */}
          {doc.description && (
            <p className="text-xs text-muted-foreground line-clamp-2">
              {doc.description}
            </p>
          )}

          {/* Metadata */}
          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
            <span>{formatFileSize(doc.fileSize)}</span>
            <span>•</span>
            <span>
              {format(doc.uploadedAt.toDate(), 'dd MMM yyyy', { locale: es })}
            </span>
          </div>

          {/* Tags */}
          {doc.tags && doc.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {doc.tags.slice(0, 3).map((tag, i) => (
                <Badge key={i} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {doc.tags.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{doc.tags.length - 3}
                </Badge>
              )}
            </div>
          )}

          {/* Subido por */}
          <p className="text-xs text-muted-foreground">
            Por {doc.uploadedByName}
          </p>
        </div>
      </CardContent>

      <CardFooter className="flex gap-2 pt-0">
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          asChild
        >
          <a
            href={doc.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            <ExternalLink className="h-4 w-4 mr-1" />
            Ver
          </a>
        </Button>

        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          asChild
        >
          <a
            href={doc.fileUrl}
            download={doc.name}
          >
            <Download className="h-4 w-4 mr-1" />
            Descargar
          </a>
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={onDelete}
        >
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </CardFooter>
    </Card>
  );
}
