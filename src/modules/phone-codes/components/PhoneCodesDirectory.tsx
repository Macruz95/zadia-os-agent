'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, Search, Phone, Globe, CheckCircle } from 'lucide-react';
import { usePhoneCodes } from '../hooks/use-phone-codes';
import { PhoneCodesTable } from './PhoneCodesTable';
import { PhoneCodesForm } from './PhoneCodesForm';
import { PhoneCodeUtils } from '../utils/phone-codes.utils';
import { PhoneCode } from '../types/phone-codes.types';
import { useCountries } from '@/modules/countries/hooks/use-countries';

interface PhoneCodesDirectoryProps {
  countryId?: string;
  onSelectPhoneCode?: (phoneCode: PhoneCode) => void;
  isSelectionMode?: boolean;
}

export function PhoneCodesDirectory({ 
  countryId, 
  onSelectPhoneCode,
  isSelectionMode = false 
}: PhoneCodesDirectoryProps) {
  const { phoneCodes, loading, error, refetch } = usePhoneCodes(countryId);
  const { countries } = useCountries();
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [selectedPhoneCode, setSelectedPhoneCode] = useState<PhoneCode | null>(null);

  // Filter phone codes based on search
  const filteredPhoneCodes = PhoneCodeUtils.searchPhoneCodes(phoneCodes, searchQuery);
  const sortedPhoneCodes = PhoneCodeUtils.sortPhoneCodes(filteredPhoneCodes);

  // Get statistics
  const stats = PhoneCodeUtils.getStatistics(phoneCodes);

  // Get country name helper
  const getCountryName = (countryId: string) => {
    const country = countries.find(c => c.id === countryId);
    return country?.name || countryId;
  };

  const handleCreateSuccess = () => {
    setShowForm(false);
    setSelectedPhoneCode(null);
    refetch();
  };

  const handleEditPhoneCode = (phoneCode: PhoneCode) => {
    setSelectedPhoneCode(phoneCode);
    setShowForm(true);
  };

  const handleSelectPhoneCode = (phoneCode: PhoneCode) => {
    if (onSelectPhoneCode) {
      onSelectPhoneCode(phoneCode);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-muted-foreground">Cargando códigos telefónicos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            <p className="font-semibold">Error al cargar códigos telefónicos</p>
            <p className="text-sm mt-1">{error}</p>
            <Button 
              onClick={() => refetch()} 
              variant="outline" 
              size="sm" 
              className="mt-3"
            >
              Reintentar
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {!isSelectionMode && (
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Códigos Telefónicos</h1>
            <p className="text-muted-foreground">
              Gestión de códigos telefónicos internacionales
            </p>
          </div>
          <Button onClick={() => setShowForm(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Agregar Código
          </Button>
        </div>
      )}

      {/* Statistics Cards */}
      {!isSelectionMode && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Phone className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Total</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Globe className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Países</p>
                  <p className="text-2xl font-bold">{stats.uniqueCountries}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Badge variant="secondary" className="h-8 w-8 p-0 flex items-center justify-center">
                  <CheckCircle className="h-4 w-4" />
                </Badge>
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Activos</p>
                  <p className="text-2xl font-bold text-green-600">{stats.active}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Badge variant="outline" className="h-8 w-8 p-0 flex items-center justify-center">
                  #
                </Badge>
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Con Formato</p>
                  <p className="text-2xl font-bold">{stats.withFormat}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar por código, país o nombre..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            {searchQuery && (
              <div className="flex items-center gap-2">
                <Badge variant="secondary">
                  {filteredPhoneCodes.length} resultado{filteredPhoneCodes.length !== 1 ? 's' : ''}
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSearchQuery('')}
                >
                  Limpiar
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Phone Codes Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            Códigos Telefónicos
            {countryId && (
              <Badge variant="outline">
                {getCountryName(countryId)}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <PhoneCodesTable
            phoneCodes={sortedPhoneCodes}
            countries={countries}
            onEdit={isSelectionMode ? undefined : handleEditPhoneCode}
            onSelect={isSelectionMode ? handleSelectPhoneCode : undefined}
            onRefresh={refetch}
            isSelectionMode={isSelectionMode}
          />
        </CardContent>
      </Card>

      {/* Form Dialog */}
      {showForm && (
        <PhoneCodesForm
          phoneCode={selectedPhoneCode}
          onSuccess={handleCreateSuccess}
          onCancel={() => {
            setShowForm(false);
            setSelectedPhoneCode(null);
          }}
        />
      )}
    </div>
  );
}