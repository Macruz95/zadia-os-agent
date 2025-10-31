/**
 * ZADIA OS - Document Upload Dialog
 * Diálogo para subir documentos al proyecto
 * Rule #5: Max 200 lines per file
 */

'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';
import type { DocumentType } from '../types/projects.types';

interface DocumentUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpload: (
    file: File,
    documentType: DocumentType,
    description?: string,
    tags?: string[]
  ) => Promise<void>;
}

const formSchema = z.object({
  file: z.instanceof(File, { message: 'Debes seleccionar un archivo' }),
  documentType: z.enum(['contract', 'quote', 'invoice', 'technical-drawing', 'photo', 'report', 'other']),
  description: z.string().optional(),
  tags: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

export function DocumentUploadDialog({
  open,
  onOpenChange,
  onUpload,
}: DocumentUploadDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      documentType: 'other',
      description: '',
      tags: '',
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      form.setValue('file', file);
    }
  };

  const handleSubmit = async (data: FormData) => {
    if (!selectedFile) return;

    try {
      setIsSubmitting(true);
      const tags = data.tags
        ? data.tags.split(',').map((t) => t.trim()).filter(Boolean)
        : undefined;

      await onUpload(
        selectedFile,
        data.documentType as DocumentType,
        data.description,
        tags
      );

      form.reset();
      setSelectedFile(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Subir Documento</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            {/* Archivo */}
            <FormField
              control={form.control}
              name="file"
              render={() => (
                <FormItem>
                  <FormLabel>Archivo</FormLabel>
                  <FormControl>
                    <div className="flex items-center gap-2">
                      <Input
                        type="file"
                        onChange={handleFileChange}
                        accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif"
                      />
                      {selectedFile && (
                        <Upload className="h-4 w-4 text-green-600" />
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                  {selectedFile && (
                    <p className="text-xs text-muted-foreground">
                      {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                    </p>
                  )}
                </FormItem>
              )}
            />

            {/* Tipo de Documento */}
            <FormField
              control={form.control}
              name="documentType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Documento</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona tipo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="contract">Contrato</SelectItem>
                      <SelectItem value="quote">Cotización</SelectItem>
                      <SelectItem value="invoice">Factura</SelectItem>
                      <SelectItem value="technical-drawing">Plano Técnico</SelectItem>
                      <SelectItem value="photo">Foto</SelectItem>
                      <SelectItem value="report">Reporte</SelectItem>
                      <SelectItem value="other">Otro</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Descripción */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción (opcional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe el documento..."
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Tags */}
            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Etiquetas (opcional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="tag1, tag2, tag3"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                  <p className="text-xs text-muted-foreground">
                    Separa las etiquetas con comas
                  </p>
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting || !selectedFile}>
                {isSubmitting ? 'Subiendo...' : 'Subir'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
