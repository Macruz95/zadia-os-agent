# 🎨 Templates de Componentes React - ZADIA OS

## 📋 Template de Página Principal de Módulo

### **ModuleDirectory.tsx**
```typescript
'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Plus, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { useModule } from '../hooks/use-module';
import { ModuleForm } from './ModuleForm';
import { ModuleFilters } from './ModuleFilters';
import { ModuleTable } from './ModuleTable';
import { BaseEntity, EntityFilters } from '../types/module.types';

interface ModuleDirectoryProps {
  title: string;
  description?: string;
  createButtonText?: string;
}

export function ModuleDirectory({ 
  title, 
  description = '',
  createButtonText = 'Crear Nuevo'
}: ModuleDirectoryProps) {
  const {
    entities,
    loading,
    error,
    totalCount,
    searchEntities,
    createEntity,
    updateEntity,
    deleteEntity,
    refresh
  } = useModule();

  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedEntity, setSelectedEntity] = useState<BaseEntity | null>(null);
  const [filters, setFilters] = useState<EntityFilters>({});

  // Initial load
  useEffect(() => {
    searchEntities({}, true);
  }, [searchEntities]);

  // Search handler
  const handleSearch = useCallback(async () => {
    const searchFilters: EntityFilters = {
      ...filters,
      // Add search term logic here based on your needs
    };
    
    await searchEntities(searchFilters, true);
  }, [filters, searchTerm, searchEntities]);

  // Create handler
  const handleCreate = useCallback(async (data: any) => {
    try {
      await createEntity(data, 'current-user-id'); // Replace with actual user ID
      setShowCreateDialog(false);
    } catch (error) {
      console.error('Error creating entity:', error);
    }
  }, [createEntity]);

  // Update handler
  const handleUpdate = useCallback(async (id: string, data: any) => {
    try {
      await updateEntity(id, data);
      setSelectedEntity(null);
    } catch (error) {
      console.error('Error updating entity:', error);
    }
  }, [updateEntity]);

  // Delete handler
  const handleDelete = useCallback(async (id: string) => {
    try {
      await deleteEntity(id);
    } catch (error) {
      console.error('Error deleting entity:', error);
    }
  }, [deleteEntity]);

  // Apply filters
  const handleApplyFilters = useCallback((newFilters: EntityFilters) => {
    setFilters(newFilters);
    searchEntities(newFilters, true);
  }, [searchEntities]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
          {description && (
            <p className="text-gray-600 mt-1">{description}</p>
          )}
        </div>
        
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus size={16} />
              {createButtonText}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Crear Nuevo Elemento</DialogTitle>
            </DialogHeader>
            <ModuleForm
              onSubmit={handleCreate}
              onCancel={() => setShowCreateDialog(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filters Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 flex gap-2">
              <Input
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="flex-1"
              />
              <Button
                variant="outline"
                onClick={handleSearch}
                disabled={loading}
              >
                <Search size={16} />
              </Button>
            </div>
            
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <Filter size={16} />
              Filtros
            </Button>
          </div>

          {showFilters && (
            <div className="mt-4 pt-4 border-t">
              <ModuleFilters
                onApply={handleApplyFilters}
                initialFilters={filters}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold">{totalCount}</p>
              </div>
              <Badge variant="secondary">{totalCount}</Badge>
            </div>
          </CardContent>
        </Card>
        
        {/* Add more stats cards as needed */}
      </div>

      {/* Results Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Resultados
            {entities.length > 0 && (
              <Badge variant="outline">
                {entities.length} de {totalCount}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {error ? (
            <div className="p-4 text-center text-red-600">
              <p>{error}</p>
              <Button 
                variant="outline" 
                onClick={refresh} 
                className="mt-2"
              >
                Reintentar
              </Button>
            </div>
          ) : (
            <ModuleTable
              entities={entities}
              loading={loading}
              onEdit={setSelectedEntity}
              onDelete={handleDelete}
            />
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog 
        open={!!selectedEntity} 
        onOpenChange={(open) => !open && setSelectedEntity(null)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Elemento</DialogTitle>
          </DialogHeader>
          {selectedEntity && (
            <ModuleForm
              initialData={selectedEntity}
              onSubmit={(data) => handleUpdate(selectedEntity.id, data)}
              onCancel={() => setSelectedEntity(null)}
              isEditing
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
```

## 📝 Template de Formulario

### **ModuleForm.tsx**
```typescript
'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { EntityFormSchema, EntityFormData } from '../validations/module.schema';
import { EntityStatusEnum, EntityTypeEnum } from '../types/module.types';

interface ModuleFormProps {
  initialData?: Partial<EntityFormData>;
  onSubmit: (data: EntityFormData) => Promise<void>;
  onCancel: () => void;
  isEditing?: boolean;
}

export function ModuleForm({
  initialData,
  onSubmit,
  onCancel,
  isEditing = false
}: ModuleFormProps) {
  const form = useForm<EntityFormData>({
    resolver: zodResolver(EntityFormSchema),
    defaultValues: {
      name: initialData?.name || '',
      description: initialData?.description || '',
      status: initialData?.status || 'active',
      type: initialData?.type || EntityTypeEnum.options[0],
    },
  });

  const handleSubmit = async (data: EntityFormData) => {
    try {
      await onSubmit(data);
      form.reset();
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Name Field */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre *</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Ingrese el nombre"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Description Field */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripción</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Ingrese una descripción opcional"
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Status Field */}
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Estado *</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione un estado" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {EntityStatusEnum.options.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status === 'active' ? 'Activo' : 
                       status === 'inactive' ? 'Inactivo' : 'Pendiente'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Type Field */}
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo *</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione un tipo" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {EntityTypeEnum.options.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={form.formState.isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting 
              ? 'Guardando...' 
              : isEditing 
                ? 'Actualizar' 
                : 'Crear'
            }
          </Button>
        </div>
      </form>
    </Form>
  );
}
```

## 📊 Template de Tabla

### **ModuleTable.tsx**
```typescript
'use client';

import React from 'react';
import { Edit, Trash2, MoreHorizontal } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { BaseEntity } from '../types/module.types';

interface ModuleTableProps {
  entities: BaseEntity[];
  loading: boolean;
  onEdit: (entity: BaseEntity) => void;
  onDelete: (id: string) => void;
}

export function ModuleTable({
  entities,
  loading,
  onEdit,
  onDelete
}: ModuleTableProps) {
  const getStatusBadge = (status: string) => {
    const variants = {
      active: 'default',
      inactive: 'secondary',
      pending: 'outline',
    } as const;

    const labels = {
      active: 'Activo',
      inactive: 'Inactivo',
      pending: 'Pendiente',
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'outline'}>
        {labels[status as keyof typeof labels] || status}
      </Badge>
    );
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return '-';
    const date = timestamp.toDate?.() || new Date(timestamp);
    return date.toLocaleDateString('es-ES');
  };

  if (loading && entities.length === 0) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="mt-2 text-gray-600">Cargando...</p>
      </div>
    );
  }

  if (entities.length === 0) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-600">No se encontraron resultados</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Fecha Creación</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {entities.map((entity) => (
            <TableRow key={entity.id}>
              <TableCell className="font-medium">
                <div>
                  <p className="font-semibold">{entity.name || entity.id}</p>
                  {entity.description && (
                    <p className="text-sm text-gray-600 truncate max-w-xs">
                      {entity.description}
                    </p>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline">
                  {entity.type}
                </Badge>
              </TableCell>
              <TableCell>
                {getStatusBadge(entity.status)}
              </TableCell>
              <TableCell>
                {formatDate(entity.createdAt)}
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal size={16} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => onEdit(entity)}
                      className="flex items-center gap-2"
                    >
                      <Edit size={14} />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <DropdownMenuItem
                          onSelect={(e) => e.preventDefault()}
                          className="flex items-center gap-2 text-red-600"
                        >
                          <Trash2 size={14} />
                          Eliminar
                        </DropdownMenuItem>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>¿Está seguro?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta acción no se puede deshacer. Se eliminará permanentemente
                            este elemento de la base de datos.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => onDelete(entity.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Eliminar
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
```

## 🔍 Template de Filtros

### **ModuleFilters.tsx**
```typescript
'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form';
import { EntityFiltersSchema, EntityFiltersData } from '../validations/module.schema';
import { EntityFilters } from '../types/module.types';
import { EntityStatusEnum, EntityTypeEnum } from '../types/module.types';

interface ModuleFiltersProps {
  onApply: (filters: EntityFilters) => void;
  initialFilters?: EntityFilters;
}

export function ModuleFilters({
  onApply,
  initialFilters = {}
}: ModuleFiltersProps) {
  const form = useForm<EntityFiltersData>({
    resolver: zodResolver(EntityFiltersSchema),
    defaultValues: {
      status: initialFilters.status || [],
      type: initialFilters.type || [],
    },
  });

  const handleSubmit = (data: EntityFiltersData) => {
    onApply(data);
  };

  const handleReset = () => {
    form.reset({
      status: [],
      type: [],
    });
    onApply({});
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Status Filters */}
          <FormField
            control={form.control}
            name="status"
            render={() => (
              <FormItem>
                <FormLabel>Estado</FormLabel>
                <div className="space-y-2">
                  {EntityStatusEnum.options.map((status) => (
                    <FormField
                      key={status}
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(status)}
                              onCheckedChange={(checked) => {
                                const currentValues = field.value || [];
                                if (checked) {
                                  field.onChange([...currentValues, status]);
                                } else {
                                  field.onChange(
                                    currentValues.filter((value) => value !== status)
                                  );
                                }
                              }}
                            />
                          </FormControl>
                          <FormLabel className="text-sm font-normal">
                            {status === 'active' ? 'Activo' : 
                             status === 'inactive' ? 'Inactivo' : 'Pendiente'}
                          </FormLabel>
                        </FormItem>
                      )}
                    />
                  ))}
                </div>
              </FormItem>
            )}
          />

          {/* Type Filters */}
          <FormField
            control={form.control}
            name="type"
            render={() => (
              <FormItem>
                <FormLabel>Tipo</FormLabel>
                <div className="space-y-2">
                  {EntityTypeEnum.options.map((type) => (
                    <FormField
                      key={type}
                      control={form.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(type)}
                              onCheckedChange={(checked) => {
                                const currentValues = field.value || [];
                                if (checked) {
                                  field.onChange([...currentValues, type]);
                                } else {
                                  field.onChange(
                                    currentValues.filter((value) => value !== type)
                                  );
                                }
                              }}
                            />
                          </FormControl>
                          <FormLabel className="text-sm font-normal">
                            {type}
                          </FormLabel>
                        </FormItem>
                      )}
                    />
                  ))}
                </div>
              </FormItem>
            )}
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={handleReset}
          >
            Limpiar
          </Button>
          <Button type="submit">
            Aplicar Filtros
          </Button>
        </div>
      </form>
    </Form>
  );
}
```

## 📋 Checklist de Implementación

- [ ] ModuleDirectory.tsx implementado
- [ ] ModuleForm.tsx implementado  
- [ ] ModuleTable.tsx implementado
- [ ] ModuleFilters.tsx implementado
- [ ] Componentes exportados en index.ts
- [ ] Props tipadas correctamente
- [ ] Handlers de eventos implementados
- [ ] Estados de loading y error manejados
- [ ] Validaciones de formulario activas
- [ ] Diálogos de confirmación para delete
- [ ] Responsive design aplicado
- [ ] Accesibilidad implementada