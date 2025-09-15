'use client';

import { useEffect, useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Check } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { ClientFormData } from '../../validations/clients.schema';
import { getClientTypeDisplay } from '../../utils/clients.utils';
import { CountriesService } from '../../../countries/services/countries.service';
import { DepartmentsService } from '../../../departments/services/departments.service';
import { MunicipalitiesService } from '../../../municipalities/services/municipalities.service';
import { DistrictsService } from '../../../districts/services/districts.service';

interface ReviewStepProps {
  form: UseFormReturn<ClientFormData>;
}

export function ReviewStep({ form }: ReviewStepProps) {
  const formData = form.getValues();
  const [countryName, setCountryName] = useState<string>('');
  const [departmentName, setDepartmentName] = useState<string>('');
  const [municipalityName, setMunicipalityName] = useState<string>('');
  const [districtName, setDistrictName] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  // Cargar nombres legibles cuando cambian los IDs
  useEffect(() => {
    const loadNames = async () => {
      setLoading(true);
      try {
        // Cargar nombre del país
        if (formData.address.country) {
          const countries = await CountriesService.getCountries();
          const country = countries.find(c => c.id === formData.address.country);
          setCountryName(country?.name || formData.address.country);
        }

        // Cargar nombre del departamento
        if (formData.address.state) {
          const departments = await DepartmentsService.getDepartmentsByCountry(formData.address.country);
          const department = departments.find(d => d.id === formData.address.state);
          setDepartmentName(department?.name || formData.address.state);
        }

        // Cargar nombre del municipio
        if (formData.address.city) {
          const municipalities = await MunicipalitiesService.getMunicipalitiesByDepartment(formData.address.state);
          const municipality = municipalities.find(m => m.id === formData.address.city);
          setMunicipalityName(municipality?.name || formData.address.city);
        }

        // Cargar nombre del distrito (solo para El Salvador)
        if (formData.address.district && formData.address.country === 'sv') {
          const districts = await DistrictsService.getDistrictsByMunicipality(formData.address.city);
          const district = districts.find(d => d.id === formData.address.district);
          setDistrictName(district?.name || formData.address.district);
        }
      } catch (error) {
        console.error('Error loading names:', error);
        // En caso de error, mostrar los IDs
        setCountryName(formData.address.country);
        setDepartmentName(formData.address.state);
        setMunicipalityName(formData.address.city);
        setDistrictName(formData.address.district || '');
      } finally {
        setLoading(false);
      }
    };

    loadNames();
  }, [formData.address.country, formData.address.state, formData.address.city, formData.address.district]);
  
  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <Check className="h-6 w-6 text-green-600" />
        </div>
        <h3 className="text-lg font-medium">Revisar información</h3>
        <p className="text-muted-foreground">
          Verifique que todos los datos sean correctos antes de crear el cliente
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Información Básica */}
        <Card>
          <CardContent className="pt-6">
            <h4 className="font-medium mb-3">Información Básica</h4>
            <div className="space-y-2 text-sm">
              <div><strong>Nombre:</strong> {formData.name}</div>
              <div><strong>Documento:</strong> {formData.documentId}</div>
              <div><strong>Tipo:</strong> {getClientTypeDisplay(formData.clientType)}</div>
              <div><strong>Estado:</strong> {formData.status}</div>
              {formData.source && <div><strong>Origen:</strong> {formData.source}</div>}
              {formData.birthDate && <div><strong>Fecha de nacimiento:</strong> {formData.birthDate.toLocaleDateString()}</div>}
              {formData.gender && <div><strong>Género:</strong> {formData.gender}</div>}
            </div>
          </CardContent>
        </Card>
        
        {/* Dirección */}
        <Card>
          <CardContent className="pt-6">
            <h4 className="font-medium mb-3">Dirección</h4>
            <div className="space-y-2 text-sm">
              <div>
                <strong>País:</strong> {loading ? (
                  <span className="flex items-center gap-2 ml-2">
                    <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                    Cargando...
                  </span>
                ) : (
                  countryName || formData.address.country || 'No especificado'
                )}
              </div>
              <div>
                <strong>Departamento:</strong> {loading ? (
                  <span className="flex items-center gap-2 ml-2">
                    <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                    Cargando...
                  </span>
                ) : (
                  departmentName || formData.address.state || 'No especificado'
                )}
              </div>
              <div>
                <strong>Municipio:</strong> {loading ? (
                  <span className="flex items-center gap-2 ml-2">
                    <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                    Cargando...
                  </span>
                ) : (
                  municipalityName || formData.address.city || 'No especificado'
                )}
              </div>
              {formData.address.country === 'sv' && formData.address.district && (
                <div>
                  <strong>Distrito:</strong> {loading ? (
                    <span className="flex items-center gap-2 ml-2">
                      <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                      Cargando...
                    </span>
                  ) : (
                    districtName || formData.address.district || 'No especificado'
                  )}
                </div>
              )}
              {formData.address.postalCode && <div><strong>Código Postal:</strong> {formData.address.postalCode}</div>}
              {formData.address.street && <div><strong>Dirección:</strong> {formData.address.street}</div>}
            </div>
          </CardContent>
        </Card>
        
        {/* Contacto Principal */}
        <Card>
          <CardContent className="pt-6">
            <h4 className="font-medium mb-3">Contacto Principal</h4>
            <div className="space-y-2 text-sm">
              <div><strong>Nombre:</strong> {formData.contacts[0]?.name}</div>
              <div><strong>Rol:</strong> {formData.contacts[0]?.role}</div>
              <div><strong>Email:</strong> {formData.contacts[0]?.email}</div>
              <div><strong>Teléfono:</strong> {formData.contacts[0]?.phone}</div>
            </div>
          </CardContent>
        </Card>
        
        {/* Contacto Secundario */}
        {formData.contacts[1]?.name && (
          <Card>
            <CardContent className="pt-6">
              <h4 className="font-medium mb-3">Contacto Secundario</h4>
              <div className="space-y-2 text-sm">
                <div><strong>Nombre:</strong> {formData.contacts[1]?.name}</div>
                <div><strong>Rol:</strong> {formData.contacts[1]?.role}</div>
                <div><strong>Email:</strong> {formData.contacts[1]?.email}</div>
                <div><strong>Teléfono:</strong> {formData.contacts[1]?.phone}</div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      
      {formData.communicationOptIn && (
        <div className="text-center text-sm text-muted-foreground">
          ✓ El cliente acepta recibir comunicaciones comerciales
        </div>
      )}
    </div>
  );
}