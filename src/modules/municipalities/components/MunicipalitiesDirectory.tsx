/**
 * ZADIA OS - Municipalities Directory Component
 * 
 * Main directory view for managing municipalities
 */

import React, { useState, useEffect } from 'react';
import { logger } from '@/lib/logger';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Plus, Search, Building2 } from 'lucide-react';
import { useDepartments } from '@/modules/departments/hooks';
import { DepartmentsSelect } from '@/modules/departments/components';
import { DistrictsDirectory } from '@/modules/districts/components';
import { useMunicipalities } from '../hooks/use-municipalities';
import { MunicipalitiesTable } from './MunicipalitiesTable';
import { MunicipalitiesForm } from './MunicipalitiesForm';
import { Municipality } from '../types/municipalities.types';

interface MunicipalitiesDirectoryProps {
  departmentId?: string;
  departmentName?: string;
}

export function MunicipalitiesDirectory({ departmentId, departmentName }: MunicipalitiesDirectoryProps) {
  const [selectedDepartment, setSelectedDepartment] = useState(departmentId || '');
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedMunicipality, setSelectedMunicipality] = useState<Municipality | null>(null);
  const [viewingDistricts, setViewingDistricts] = useState<Municipality | null>(null);

  const { departments } = useDepartments();
  const {
    municipalities,
    loading,
    error,
    getMunicipalities,
    createMunicipality,
    updateMunicipality,
    deleteMunicipality
  } = useMunicipalities(selectedDepartment);

  useEffect(() => {
    if (selectedDepartment) {
      getMunicipalities(selectedDepartment);
    }
  }, [selectedDepartment, getMunicipalities]);

  const filteredMunicipalities = municipalities.filter(municipality => {
    const matchesSearch = municipality.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         municipality.postalCode?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch && municipality.isActive;
  });

  const handleCreateMunicipality = async (data: any) => {
    try {
      await createMunicipality(data);
      setIsCreateDialogOpen(false);
    } catch (error) {
      logger.error('Error creating municipality', error as Error, {
        component: 'MunicipalitiesDirectory',
        action: 'handleCreateMunicipality'
      });
    }
  };

  const handleEditMunicipality = (municipality: Municipality) => {
    setSelectedMunicipality(municipality);
    setIsEditDialogOpen(true);
  };

  const handleUpdateMunicipality = async (data: any) => {
    if (!selectedMunicipality) return;
    
    try {
      await updateMunicipality(selectedMunicipality.id, data);
      setIsEditDialogOpen(false);
      setSelectedMunicipality(null);
    } catch (error) {
      logger.error('Error updating municipality', error as Error, {
        component: 'MunicipalitiesDirectory',
        action: 'handleUpdateMunicipality'
      });
    }
  };

  const handleDeleteMunicipality = async (municipalityId: string) => {
    if (confirm('¿Estás seguro de que deseas eliminar este municipio?')) {
      try {
        await deleteMunicipality(municipalityId);
      } catch (error) {
        logger.error('Error deleting municipality', error as Error, {
          component: 'MunicipalitiesDirectory',
          action: 'handleDeleteMunicipality'
        });
      }
    }
  };

  const handleViewDistricts = (municipality: Municipality) => {
    setViewingDistricts(municipality);
  };

  const getDepartmentName = (departmentId: string) => {
    const department = departments.find(d => d.id === departmentId);
    return department ? department.name : 'Desconocido';
  };

  if (viewingDistricts) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            onClick={() => setViewingDistricts(null)}
          >
            ← Volver a Municipios
          </Button>
          <div>
            <h2 className="text-xl font-semibold">
              Distritos de {viewingDistricts.name}
            </h2>
            <p className="text-gray-600">
              Gestiona los distritos del municipio
            </p>
          </div>
        </div>
        
        <DistrictsDirectory 
          municipalityId={viewingDistricts.id}
          municipalityName={viewingDistricts.name}
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => getMunicipalities(selectedDepartment)} variant="outline">
              Reintentar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 bg-purple-100 rounded-lg">
            <Building2 className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Municipios</h1>
            <p className="text-gray-600">
              {departmentName ? `Gestiona los municipios de ${departmentName}` : 'Gestiona los municipios por departamento'}
            </p>
          </div>
        </div>
      </div>

      {/* Filters and Actions */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-1">
              {!departmentId && (
                <div className="w-64">
                  <DepartmentsSelect
                    value={selectedDepartment}
                    onValueChange={setSelectedDepartment}
                    placeholder="Todos los departamentos"
                  />
                </div>
              )}
              
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Buscar municipios..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <div className="text-sm text-gray-500">
                {filteredMunicipalities.length} de {municipalities.filter(m => m.isActive).length} municipios
              </div>
            </div>
            
            {selectedDepartment && (
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Nuevo Municipio
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Crear Nuevo Municipio</DialogTitle>
                    <DialogDescription>
                      Agrega un nuevo municipio al departamento
                    </DialogDescription>
                  </DialogHeader>
                  <MunicipalitiesForm
                    departmentId={selectedDepartment}
                    departmentName={getDepartmentName(selectedDepartment)}
                    onSubmit={handleCreateMunicipality}
                    onCancel={() => setIsCreateDialogOpen(false)}
                    isLoading={loading}
                  />
                </DialogContent>
              </Dialog>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Municipalities Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Municipios</CardTitle>
          <CardDescription>
            Administra la información de los municipios
          </CardDescription>
        </CardHeader>
        <CardContent>
          <MunicipalitiesTable
            municipalities={filteredMunicipalities}
            loading={loading}
            onEdit={handleEditMunicipality}
            onDelete={handleDeleteMunicipality}
            onViewDistricts={handleViewDistricts}
            getDepartmentName={getDepartmentName}
          />
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Editar Municipio</DialogTitle>
            <DialogDescription>
              Modifica la información del municipio
            </DialogDescription>
          </DialogHeader>
          {selectedMunicipality && (
            <MunicipalitiesForm
              initialData={selectedMunicipality}
              departmentId={selectedDepartment}
              departmentName={getDepartmentName(selectedDepartment)}
              onSubmit={handleUpdateMunicipality}
              onCancel={() => {
                setIsEditDialogOpen(false);
                setSelectedMunicipality(null);
              }}
              isLoading={loading}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}