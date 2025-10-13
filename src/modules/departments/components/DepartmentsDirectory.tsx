/**
 * ZADIA OS - Departments Directory Component
 * 
 * Main directory view for managing departments
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
import { Plus, Search, MapPin } from 'lucide-react';
import { useCountries } from '@/modules/countries/hooks';
import { CountriesSelect } from '@/modules/countries/components';
import { useDepartments } from '../hooks/use-departments';
import { DepartmentsTable } from './DepartmentsTable';
import { DepartmentsForm } from './DepartmentsForm';
import { Department } from '../types/departments.types';

export function DepartmentsDirectory() {
  const [selectedCountry, setSelectedCountry] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);

  const { countries } = useCountries();
  const {
    departments,
    loading,
    error,
    getDepartments,
    createDepartment,
    updateDepartment,
    deleteDepartment
  } = useDepartments();

  useEffect(() => {
    getDepartments();
  }, [getDepartments]);

  const filteredDepartments = departments.filter(department => {
    const matchesSearch = department.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         department.code?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCountry = !selectedCountry || department.countryId === selectedCountry;
    return matchesSearch && matchesCountry && department.isActive;
  });

  const handleCreateDepartment = async (data: Omit<Department, 'id'>) => {
    try {
      await createDepartment(data);
      setIsCreateDialogOpen(false);
    } catch (error) {
      logger.error('Error creating department', error as Error, {
        component: 'DepartmentsDirectory',
        action: 'handleCreateDepartment'
      });
    }
  };

  const handleEditDepartment = (department: Department) => {
    setSelectedDepartment(department);
    setIsEditDialogOpen(true);
  };

  const handleUpdateDepartment = async (data: Omit<Department, 'id'>) => {
    if (!selectedDepartment) return;
    
    try {
      await updateDepartment(selectedDepartment.id, data);
      setIsEditDialogOpen(false);
      setSelectedDepartment(null);
    } catch (error) {
      logger.error('Error updating department', error as Error, {
        component: 'DepartmentsDirectory',
        action: 'handleUpdateDepartment'
      });
    }
  };

  const handleDeleteDepartment = async (departmentId: string) => {
    if (confirm('¿Estás seguro de que deseas eliminar este departamento?')) {
      try {
        await deleteDepartment(departmentId);
      } catch (error) {
        logger.error('Error deleting department', error as Error, {
          component: 'DepartmentsDirectory',
          action: 'handleDeleteDepartment'
        });
      }
    }
  };

  const getCountryName = (countryId: string) => {
    const country = countries.find(c => c.id === countryId);
    return country ? country.name : 'Desconocido';
  };

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => getDepartments()} variant="outline">
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
          <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-lg">
            <MapPin className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Departamentos</h1>
            <p className="text-gray-600">Gestiona los departamentos por país</p>
          </div>
        </div>
      </div>

      {/* Filters and Actions */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-1">
              <div className="w-64">
                <CountriesSelect
                  value={selectedCountry}
                  onValueChange={setSelectedCountry}
                  placeholder="Todos los países"
                />
              </div>
              
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Buscar departamentos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <div className="text-sm text-gray-500">
                {filteredDepartments.length} de {departments.filter(d => d.isActive).length} departamentos
              </div>
            </div>
            
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Nuevo Departamento
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Crear Nuevo Departamento</DialogTitle>
                  <DialogDescription>
                    Agrega un nuevo departamento al sistema
                  </DialogDescription>
                </DialogHeader>
                <DepartmentsForm
                  onSubmit={handleCreateDepartment}
                  onCancel={() => setIsCreateDialogOpen(false)}
                  isLoading={loading}
                />
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* Departments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Departamentos</CardTitle>
          <CardDescription>
            Administra la información de los departamentos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DepartmentsTable
            departments={filteredDepartments}
            loading={loading}
            onEdit={handleEditDepartment}
            onDelete={handleDeleteDepartment}
            getCountryName={getCountryName}
          />
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Departamento</DialogTitle>
            <DialogDescription>
              Modifica la información del departamento
            </DialogDescription>
          </DialogHeader>
          {selectedDepartment && (
            <DepartmentsForm
              initialData={selectedDepartment}
              onSubmit={handleUpdateDepartment}
              onCancel={() => {
                setIsEditDialogOpen(false);
                setSelectedDepartment(null);
              }}
              isLoading={loading}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}