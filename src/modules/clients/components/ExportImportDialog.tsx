'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../../../components/ui/dialog';
import { Button } from '../../../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Alert, AlertDescription } from '../../../components/ui/alert';
import { Progress } from '../../../components/ui/progress';
import { Download, Upload, FileSpreadsheet, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Client } from '../types/clients.types';
import { ClientsService } from '../services/clients.service';

interface ExportImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clients: Client[];
  onImportSuccess?: () => void;
}

export const ExportImportDialog = ({
  open,
  onOpenChange,
  clients,
  onImportSuccess,
}: ExportImportDialogProps) => {
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importResults, setImportResults] = useState<{
    total: number;
    success: number;
    errors: string[];
  } | null>(null);

  // Export to CSV
  const handleExport = () => {
    try {
      // Define CSV headers
      const headers = [
        'Nombre',
        'Documento',
        'Tipo',
        'Estado',
        'Email',
        'Teléfono',
        'País',
        'Ciudad',
        'Dirección',
        'Tags',
        'Vendedor',
        'Fecha Creación',
      ];

      // Convert clients to CSV rows
      const rows = clients.map(client => [
        client.name,
        client.documentId,
        client.clientType,
        client.status,
        '', // Email - get from contacts
        '', // Phone - get from contacts
        client.address?.country || '',
        client.address?.city || '',
        client.address?.street || '',
        client.tags.join('; '),
        client.owner || '',
        new Date(client.createdAt).toISOString().split('T')[0],
      ]);

      // Combine headers and rows
      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
      ].join('\n');

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `clientes_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      void error;
      alert('Error al exportar clientes');
    }
  };

  // Import from CSV
  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImporting(true);
    setImportProgress(0);
    setImportResults(null);

    try {
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      
      // Skip header
      const dataLines = lines.slice(1);
      
      const results = {
        total: dataLines.length,
        success: 0,
        errors: [] as string[],
      };

      for (let i = 0; i < dataLines.length; i++) {
        const line = dataLines[i];
        setImportProgress(Math.round(((i + 1) / dataLines.length) * 100));

        try {
          // Parse CSV line (simple implementation, doesn't handle quoted commas)
          const values = line.split(',').map(v => v.replace(/^"|"$/g, '').trim());
          
          const [name, documentId, clientType, status, , , country, city, street, tags, owner] = values;

          // Validate required fields
          if (!name || !documentId) {
            results.errors.push(`Línea ${i + 2}: Faltan campos requeridos (Nombre o Documento)`);
            continue;
          }

          // Create client
          await ClientsService.createClient({
            name,
            documentId,
            clientType: clientType as Client['clientType'] || 'PersonaNatural',
            status: status as Client['status'] || 'Prospecto',
            tags: tags ? tags.split(';').map(t => t.trim()).filter(Boolean) : [],
            owner: owner || undefined,
            communicationOptIn: false,
            address: {
              country: country || '',
              state: '',
              city: city || '',
              street: street || '',
            },
          });

          results.success++;
        } catch (error) {
          results.errors.push(`Línea ${i + 2}: ${error instanceof Error ? error.message : 'Error desconocido'}`);
        }
      }

      setImportResults(results);
      
      if (results.success > 0 && onImportSuccess) {
        onImportSuccess();
      }
    } catch (error) {
      void error;
      setImportResults({
        total: 0,
        success: 0,
        errors: ['Error al leer el archivo CSV'],
      });
    } finally {
      setImporting(false);
      // Reset file input
      event.target.value = '';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5" />
            Exportar / Importar Clientes
          </DialogTitle>
          <DialogDescription>
            Exporta tus clientes a CSV o importa clientes desde un archivo
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="export" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="export">
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </TabsTrigger>
            <TabsTrigger value="import">
              <Upload className="w-4 h-4 mr-2" />
              Importar
            </TabsTrigger>
          </TabsList>

          {/* Export Tab */}
          <TabsContent value="export" className="space-y-4">
            <Alert>
              <Download className="h-4 w-4" />
              <AlertDescription>
                Se exportarán <strong>{clients.length} clientes</strong> a formato CSV.
                El archivo incluirá información básica del cliente.
              </AlertDescription>
            </Alert>

            <div className="flex flex-col gap-3">
              <p className="text-sm text-muted-foreground">
                Campos incluidos: Nombre, Documento, Tipo, Estado, País, Ciudad, Dirección, Tags, Vendedor, Fecha
              </p>
              <Button onClick={handleExport} className="w-full">
                <Download className="w-4 h-4 mr-2" />
                Descargar CSV
              </Button>
            </div>
          </TabsContent>

          {/* Import Tab */}
          <TabsContent value="import" className="space-y-4">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                El archivo CSV debe tener las columnas: Nombre, Documento, Tipo, Estado, Email, Teléfono, País, Ciudad, Dirección, Tags, Vendedor
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <div>
                <Label htmlFor="csv-file">Seleccionar archivo CSV</Label>
                <Input
                  id="csv-file"
                  type="file"
                  accept=".csv"
                  onChange={handleImport}
                  disabled={importing}
                  className="mt-2"
                />
              </div>

              {importing && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Importando clientes...</span>
                    <span>{importProgress}%</span>
                  </div>
                  <Progress value={importProgress} />
                </div>
              )}

              {importResults && (
                <div className="space-y-3">
                  <Alert variant={importResults.errors.length > 0 ? 'destructive' : 'default'}>
                    {importResults.errors.length === 0 ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : (
                      <AlertTriangle className="h-4 w-4" />
                    )}
                    <AlertDescription>
                      <div className="space-y-1">
                        <p>
                          <strong>Total procesados:</strong> {importResults.total}
                        </p>
                        <p className="text-green-600">
                          <strong>Éxitosos:</strong> {importResults.success}
                        </p>
                        {importResults.errors.length > 0 && (
                          <p className="text-red-600">
                            <strong>Errores:</strong> {importResults.errors.length}
                          </p>
                        )}
                      </div>
                    </AlertDescription>
                  </Alert>

                  {importResults.errors.length > 0 && (
                    <div className="max-h-40 overflow-y-auto rounded border p-3 text-sm">
                      <p className="font-medium mb-2">Detalles de errores:</p>
                      <ul className="space-y-1 text-xs text-muted-foreground">
                        {importResults.errors.slice(0, 10).map((error, index) => (
                          <li key={index}>• {error}</li>
                        ))}
                        {importResults.errors.length > 10 && (
                          <li>... y {importResults.errors.length - 10} errores más</li>
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
