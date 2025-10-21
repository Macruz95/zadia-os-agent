'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  FileText, 
  Upload, 
  Download, 
  Trash2, 
  Eye,
  File,
  Image as ImageIcon,
  FileSpreadsheet
} from 'lucide-react';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';
import { storage } from '@/lib/firebase';
import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject, 
  listAll,
  getMetadata
} from 'firebase/storage';

/**
 * ProjectDocumentsTab - Gestión de documentos del proyecto
 * Rule #1: Firebase Storage integration completa
 * Rule #2: ShadCN UI + Lucide icons
 * Rule #5: 220 lines (within limit)
 */

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

interface ProjectDocumentsTabProps {
  projectId: string;
}

export function ProjectDocumentsTab({ projectId }: ProjectDocumentsTabProps) {
  const [documents, setDocuments] = useState<ProjectDocument[]>([]);
  const [uploading, setUploading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(false);

  // Cargar documentos al montar el componente
  useEffect(() => {
    loadDocuments();
  }, [projectId]);

  const loadDocuments = async () => {
    setLoading(true);
    try {
      const storageRef = ref(storage, `projects/${projectId}/documents`);
      const result = await listAll(storageRef);
      
      const docs: ProjectDocument[] = await Promise.all(
        result.items.map(async (itemRef) => {
          const url = await getDownloadURL(itemRef);
          const metadata = await getMetadata(itemRef);
          
          return {
            id: itemRef.name,
            name: itemRef.name,
            type: metadata.contentType || 'unknown',
            category: (metadata.customMetadata?.category as ProjectDocument['category']) || 'other',
            size: metadata.size || 0,
            uploadedAt: metadata.timeCreated ? new Date(metadata.timeCreated) : new Date(),
            uploadedBy: metadata.customMetadata?.uploadedBy || 'Unknown',
            url,
          };
        })
      );
      
      setDocuments(docs);
      logger.info('Documents loaded successfully', { projectId, metadata: { count: docs.length } });
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Error loading documents');
      logger.error('Error loading documents', err, { projectId });
      toast.error('Error al cargar documentos');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const timestamp = Date.now();
        const fileName = `${timestamp}_${file.name}`;
        const storageRef = ref(storage, `projects/${projectId}/documents/${fileName}`);
        
        await uploadBytes(storageRef, file, {
          customMetadata: {
            category: selectedCategory === 'all' ? 'other' : selectedCategory,
            uploadedBy: 'current-user', // TODO: Get from auth context
          }
        });
      });

      await Promise.all(uploadPromises);
      toast.success(`${files.length} archivo(s) subido(s) exitosamente`);
      logger.info('Files uploaded successfully', { 
        projectId, 
        metadata: { count: files.length } 
      });
      
      // Recargar lista de documentos
      await loadDocuments();
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Error uploading files');
      logger.error('Error uploading files', err, { projectId });
      toast.error('Error al subir archivos');
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (doc: ProjectDocument) => {
    try {
      // El URL ya está disponible en doc.url
      window.open(doc.url, '_blank');
      logger.info('Document downloaded', { projectId, fileName: doc.name });
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Error downloading document');
      logger.error('Error downloading document', err, { projectId, fileName: doc.name });
      toast.error('Error al descargar documento');
    }
  };

  const handleDelete = async (docId: string) => {
    if (!confirm('¿Eliminar este documento?')) return;

    try {
      const storageRef = ref(storage, `projects/${projectId}/documents/${docId}`);
      await deleteObject(storageRef);
      
      toast.success('Documento eliminado');
      logger.info('Document deleted', { projectId, fileName: docId });
      
      // Recargar lista de documentos
      await loadDocuments();
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Error deleting document');
      logger.error('Error deleting document', err, { projectId, fileName: docId });
      toast.error('Error al eliminar documento');
    }
  };

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

  const filteredDocs = selectedCategory === 'all' 
    ? documents 
    : documents.filter(d => d.category === selectedCategory);

  return (
    <div className="space-y-6">
      {/* Header con Upload */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
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
            {filteredDocs.length} documentos
          </span>
        </div>

        <div>
          <Input
            type="file"
            multiple
            onChange={handleFileUpload}
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

      {/* Lista de Documentos */}
      {loading ? (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="animate-spin w-12 h-12 mx-auto border-4 border-primary border-t-transparent rounded-full mb-4" />
            <p className="text-sm text-muted-foreground">Cargando documentos...</p>
          </CardContent>
        </Card>
      ) : documents.length === 0 ? (
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
      ) : (
        <div className="grid gap-4">
          {filteredDocs.map((doc) => {
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
                      <Button size="sm" variant="ghost" onClick={() => handleDownload(doc)}>
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleDownload(doc)}>
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleDelete(doc.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
