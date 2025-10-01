/**
 * ZADIA OS - Districts Directory Component
 * 
 * Main directory view for managing districts
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
import { useDistricts } from '../hooks/useDistricts';
import { DistrictsTable } from './DistrictsTable';
import { DistrictsForm } from './DistrictsForm';
import { District } from '../types/districts.types';

interface DistrictsDirectoryProps {
  municipalityId?: string;
  municipalityName?: string;
}

export function DistrictsDirectory({ municipalityId, municipalityName }: DistrictsDirectoryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedDistrict, setSelectedDistrict] = useState<District | null>(null);

  const {
    districts,
    loading,
    error,
    getDistricts,
    createDistrict,
    updateDistrict,
    deleteDistrict
  } = useDistricts(municipalityId);

  useEffect(() => {
    if (municipalityId) {
      getDistricts(municipalityId);
    }
  }, [municipalityId, getDistricts]);

  const filteredDistricts = districts.filter(district => {
    const matchesSearch = district.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         district.code?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch && district.isActive;
  });

  const handleCreateDistrict = async (data: any) => {
    try {
      await createDistrict(data);
      setIsCreateDialogOpen(false);
    } catch (error) {
      logger.error('Error creating district', error as Error, {
        component: 'DistrictsDirectory',
        action: 'handleCreateDistrict'
      });
    }
  };

  const handleEditDistrict = (district: District) => {
    setSelectedDistrict(district);
    setIsEditDialogOpen(true);
  };

  const handleUpdateDistrict = async (data: any) => {
    if (!selectedDistrict) return;
    
    try {
      await updateDistrict(selectedDistrict.id, data);
      setIsEditDialogOpen(false);
      setSelectedDistrict(null);
    } catch (error) {
      logger.error('Error updating district', error as Error, {
        component: 'DistrictsDirectory',
        action: 'handleUpdateDistrict'
      });
    }
  };

  const handleDeleteDistrict = async (districtId: string) => {
    if (confirm('¿Estás seguro de que deseas eliminar este distrito?')) {
      try {
        await deleteDistrict(districtId);
      } catch (error) {
        logger.error('Error deleting district', error as Error, {
          component: 'DistrictsDirectory',
          action: 'handleDeleteDistrict'
        });
      }
    }
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
            <Button onClick={() => getDistricts(municipalityId)} variant="outline">
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
          <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg">
            <MapPin className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Distritos</h1>
            <p className="text-gray-600">
              {municipalityName ? `Gestiona los distritos de ${municipalityName}` : 'Gestiona los distritos por municipio'}
            </p>
          </div>
        </div>
      </div>

      {/* Actions and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-1">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Buscar distritos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <div className="text-sm text-gray-500">
                {filteredDistricts.length} de {districts.filter(d => d.isActive).length} distritos
              </div>
            </div>
            
            {municipalityId && (
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Nuevo Distrito
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Crear Nuevo Distrito</DialogTitle>
                    <DialogDescription>
                      Agrega un nuevo distrito al municipio
                    </DialogDescription>
                  </DialogHeader>
                  <DistrictsForm
                    municipalityId={municipalityId}
                    municipalityName={municipalityName}
                    onSubmit={handleCreateDistrict}
                    onCancel={() => setIsCreateDialogOpen(false)}
                    isLoading={loading}
                  />
                </DialogContent>
              </Dialog>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Districts Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Distritos</CardTitle>
          <CardDescription>
            Administra la información de los distritos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DistrictsTable
            districts={filteredDistricts}
            loading={loading}
            onEdit={handleEditDistrict}
            onDelete={handleDeleteDistrict}
            getMunicipalityName={() => municipalityName || 'Municipio'}
          />
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Distrito</DialogTitle>
            <DialogDescription>
              Modifica la información del distrito
            </DialogDescription>
          </DialogHeader>
          {selectedDistrict && (
            <DistrictsForm
              initialData={selectedDistrict}
              municipalityId={municipalityId}
              municipalityName={municipalityName}
              onSubmit={handleUpdateDistrict}
              onCancel={() => {
                setIsEditDialogOpen(false);
                setSelectedDistrict(null);
              }}
              isLoading={loading}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}