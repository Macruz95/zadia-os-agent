/**
 * ZADIA OS - Quote Templates Dialog
 * 
 * Dialog for managing and applying quote templates
 */

'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, FileText, Trash2, Plus, TrendingUp } from 'lucide-react';
import { QuoteTemplatesService } from '../../services/quote-templates.service';
import { QuoteTemplate } from '../../types/quote-template.types';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';
import { formatCurrency } from '@/lib/utils';
import { useTenantId } from '@/contexts/TenantContext';

interface QuoteTemplatesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectTemplate?: (template: QuoteTemplate) => void;
  onCreateFromQuote?: () => void;
}

export function QuoteTemplatesDialog({
  open,
  onOpenChange,
  onSelectTemplate,
  onCreateFromQuote
}: QuoteTemplatesDialogProps) {
  const tenantId = useTenantId();
  const [templates, setTemplates] = useState<QuoteTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'product' | 'service' | 'custom'>('all');

  // Load templates
  useEffect(() => {
    if (open && tenantId) {
      loadTemplates();
    }
  }, [open, tenantId]);

  const loadTemplates = async () => {
    if (!tenantId) return;
    
    try {
      setLoading(true);
      const data = await QuoteTemplatesService.getTemplates(tenantId);
      setTemplates(data);
    } catch (error) {
      logger.error('Error loading templates', error as Error, {
        component: 'QuoteTemplatesDialog',
        action: 'loadTemplates'
      });
      toast.error('Error al cargar plantillas');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTemplate = async (template: QuoteTemplate) => {
    try {
      // Increment usage count
      await QuoteTemplatesService.incrementUsageCount(template.id);
      
      // Call callback
      if (onSelectTemplate) {
        onSelectTemplate(template);
      }
      
      toast.success(`Plantilla "${template.name}" aplicada`);
      onOpenChange(false);
    } catch (error) {
      logger.error('Error applying template', error as Error, {
        component: 'QuoteTemplatesDialog',
        action: 'handleSelectTemplate'
      });
      toast.error('Error al aplicar plantilla');
    }
  };

  const handleDeleteTemplate = async (templateId: string, templateName: string) => {
    if (!confirm(`¿Eliminar plantilla "${templateName}"?`)) {
      return;
    }

    try {
      await QuoteTemplatesService.deleteTemplate(templateId);
      toast.success('Plantilla eliminada');
      loadTemplates();
    } catch (error) {
      logger.error('Error deleting template', error as Error, {
        component: 'QuoteTemplatesDialog',
        action: 'handleDeleteTemplate'
      });
      toast.error('Error al eliminar plantilla');
    }
  };

  // Filtered templates
  const filteredTemplates = templates.filter(template => {
    const matchesSearch = !searchQuery ||
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = categoryFilter === 'all' || template.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  // Calculate template total
  const getTemplateTotal = (template: QuoteTemplate): number => {
    return template.items.reduce((sum, item) => {
      return sum + (item.subtotal || 0);
    }, 0);
  };

  const getCategoryBadgeVariant = (category?: string) => {
    switch (category) {
      case 'product': return 'default';
      case 'service': return 'secondary';
      case 'custom': return 'outline';
      default: return 'outline';
    }
  };

  const getCategoryLabel = (category?: string) => {
    switch (category) {
      case 'product': return 'Producto';
      case 'service': return 'Servicio';
      case 'custom': return 'Personalizada';
      default: return 'Sin categoría';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Plantillas de Cotización</DialogTitle>
          <DialogDescription>
            Usa plantillas predefinidas para crear cotizaciones rápidamente
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="templates" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="templates">Ver Plantillas</TabsTrigger>
            <TabsTrigger value="create">Crear desde Cotización</TabsTrigger>
          </TabsList>

          {/* Templates List Tab */}
          <TabsContent value="templates" className="space-y-4">
            {/* Search and Filters */}
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Buscar plantillas..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant={categoryFilter === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCategoryFilter('all')}
                >
                  Todas
                </Button>
                <Button
                  variant={categoryFilter === 'product' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCategoryFilter('product')}
                >
                  Productos
                </Button>
                <Button
                  variant={categoryFilter === 'service' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCategoryFilter('service')}
                >
                  Servicios
                </Button>
              </div>
            </div>

            {/* Templates Grid */}
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">
                Cargando plantillas...
              </div>
            ) : filteredTemplates.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {searchQuery || categoryFilter !== 'all'
                  ? 'No se encontraron plantillas con los filtros aplicados'
                  : 'No hay plantillas disponibles. Crea una desde una cotización existente.'}
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {filteredTemplates.map((template) => (
                  <Card key={template.id} className="hover:border-primary cursor-pointer transition-colors">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg">{template.name}</CardTitle>
                          {template.description && (
                            <CardDescription className="mt-1">
                              {template.description}
                            </CardDescription>
                          )}
                        </div>
                        <Badge variant={getCategoryBadgeVariant(template.category)}>
                          {getCategoryLabel(template.category)}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          {template.items.length} {template.items.length === 1 ? 'artículo' : 'artículos'}
                        </span>
                        <span className="font-semibold">
                          {formatCurrency(getTemplateTotal(template))}
                        </span>
                      </div>
                      
                      {template.usageCount > 0 && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <TrendingUp className="h-3 w-3" />
                          Usada {template.usageCount} {template.usageCount === 1 ? 'vez' : 'veces'}
                        </div>
                      )}

                      <div className="flex gap-2 pt-2">
                        <Button
                          className="flex-1"
                          onClick={() => handleSelectTemplate(template)}
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          Usar Plantilla
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleDeleteTemplate(template.id, template.name)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Create Template Tab */}
          <TabsContent value="create" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Crear Plantilla desde Cotización</CardTitle>
                <CardDescription>
                  Guarda una cotización existente como plantilla para reutilizarla
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  className="w-full"
                  onClick={() => {
                    onOpenChange(false);
                    if (onCreateFromQuote) {
                      onCreateFromQuote();
                    } else {
                      toast.info('Esta funcionalidad estará disponible desde el detalle de una cotización');
                    }
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Seleccionar Cotización
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
