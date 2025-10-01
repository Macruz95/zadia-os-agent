/**
 * ZADIA OS - Countries Directory Component
 * 
 * Main directory view for managing countries
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
import { Plus, Search, Globe } from 'lucide-react';
import { useCountries } from '../hooks/use-countries';
import { CountriesTable } from './CountriesTable';
import { CountriesForm } from './CountriesForm';
import { Country } from '../types/countries.types';

export function CountriesDirectory() {
  const {
    countries,
    loading,
    error,
    getCountries,
    createCountry,
    updateCountry,
    deleteCountry
  } = useCountries();

  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);

  useEffect(() => {
    getCountries();
  }, [getCountries]);

  const filteredCountries = countries.filter(country =>
    country.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    country.isoCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    country.phoneCode.includes(searchTerm)
  );

  const handleCreateCountry = async (data: any) => {
    try {
      await createCountry(data);
      setIsCreateDialogOpen(false);
    } catch (error) {
      logger.error('Error creating country', error as Error, {
        component: 'CountriesDirectory',
        action: 'handleCreateCountry'
      });
    }
  };

  const handleEditCountry = (country: Country) => {
    setSelectedCountry(country);
    setIsEditDialogOpen(true);
  };

  const handleUpdateCountry = async (data: any) => {
    if (!selectedCountry) return;
    
    try {
      await updateCountry(selectedCountry.id, data);
      setIsEditDialogOpen(false);
      setSelectedCountry(null);
    } catch (error) {
      logger.error('Error updating country', error as Error, {
        component: 'CountriesDirectory',
        action: 'handleUpdateCountry'
      });
    }
  };

  const handleDeleteCountry = async (countryId: string) => {
    if (confirm('¿Estás seguro de que deseas eliminar este país?')) {
      try {
        await deleteCountry(countryId);
      } catch (error) {
        logger.error('Error deleting country', error as Error, {
          component: 'CountriesDirectory',
          action: 'handleDeleteCountry',
          metadata: { countryId }
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
            <Button onClick={() => getCountries()} variant="outline">
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
            <Globe className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Países</h1>
            <p className="text-gray-600">Gestiona los países disponibles en el sistema</p>
          </div>
        </div>
      </div>

      {/* Actions Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-1">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Buscar países..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="text-sm text-gray-500">
                {filteredCountries.length} de {countries.length} países
              </div>
            </div>
            
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Nuevo País
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Crear Nuevo País</DialogTitle>
                  <DialogDescription>
                    Agrega un nuevo país al sistema
                  </DialogDescription>
                </DialogHeader>
                <CountriesForm
                  onSubmit={handleCreateCountry}
                  onCancel={() => setIsCreateDialogOpen(false)}
                  isLoading={loading}
                />
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* Countries Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Países</CardTitle>
          <CardDescription>
            Administra la información de los países disponibles
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CountriesTable
            countries={filteredCountries}
            loading={loading}
            onEdit={handleEditCountry}
            onDelete={handleDeleteCountry}
          />
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar País</DialogTitle>
            <DialogDescription>
              Modifica la información del país
            </DialogDescription>
          </DialogHeader>
          {selectedCountry && (
            <CountriesForm
              initialData={selectedCountry}
              onSubmit={handleUpdateCountry}
              onCancel={() => {
                setIsEditDialogOpen(false);
                setSelectedCountry(null);
              }}
              isLoading={loading}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}