/**
 * ZADIA OS - Client Documents Manager
 * 
 * Gestor de documentos adjuntos del cliente
 * REGLA 2: ShadCN UI + Lucide icons
 * REGLA 5: <200 líneas
 */

'use client';

import { useState } from 'react';
import { FileText, Upload, Eye, Download, Trash2, FolderOpen } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Document {
  id: string;
  name: string;
  category: 'contratos' | 'fiscales' | 'diseños' | 'otros';
  size: number;
  uploadedAt: Date;
  uploadedBy: string;
}

interface ClientDocumentsProps {
  clientId: string;
  documents?: Document[];
  onUpload?: (file: File, category: string) => void;
  onDelete?: (documentId: string) => void;
}

export function ClientDocuments({
  // clientId, // TODO: Use for Firebase Storage integration
  documents = [],
  onUpload,
  onDelete,
}: ClientDocumentsProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [uploadCategory, setUploadCategory] = useState<string>('otros');

  const categories = [
    { value: 'all', label: 'Todas las categorías' },
    { value: 'contratos', label: 'Contratos', icon: FileText },
    { value: 'fiscales', label: 'Fiscales', icon: FileText },
    { value: 'diseños', label: 'Diseños', icon: FileText },
    { value: 'otros', label: 'Otros', icon: FileText },
  ];

  const filteredDocs = selectedCategory === 'all'
    ? documents
    : documents.filter(d => d.category === selectedCategory);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onUpload) {
      onUpload(file, uploadCategory);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getCategoryBadge = (category: string) => {
    const colors: Record<string, string> = {
      contratos: 'bg-blue-100 text-blue-800',
      fiscales: 'bg-green-100 text-green-800',
      diseños: 'bg-purple-100 text-purple-800',
      otros: 'bg-gray-100 text-gray-800',
    };
    return colors[category] || colors.otros;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Documentos Adjuntos</CardTitle>
          <Badge variant="secondary">{documents.length}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Upload Section */}
        <div className="space-y-3">
          <div className="flex gap-2">
            <Select value={uploadCategory} onValueChange={setUploadCategory}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.slice(1).map(cat => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" className="flex-1" asChild>
              <label className="cursor-pointer">
                <Upload className="h-4 w-4 mr-2" />
                Subir Documento
                <input
                  type="file"
                  className="hidden"
                  onChange={handleFileUpload}
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
                />
              </label>
            </Button>
          </div>
        </div>

        {/* Filter */}
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {categories.map(cat => (
              <SelectItem key={cat.value} value={cat.value}>
                {cat.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Documents List */}
        <div className="space-y-2">
          {filteredDocs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FolderOpen className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No hay documentos en esta categoría</p>
            </div>
          ) : (
            filteredDocs.map(doc => (
              <div
                key={doc.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <FileText className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{doc.name}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Badge className={getCategoryBadge(doc.category)} variant="secondary">
                        {doc.category}
                      </Badge>
                      <span>{formatFileSize(doc.size)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete?.(doc.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
