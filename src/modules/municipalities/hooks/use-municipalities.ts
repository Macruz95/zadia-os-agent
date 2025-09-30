import { useState, useEffect, useCallback } from 'react';
import { MunicipalitiesService } from '../services/municipalities.service';
import { Municipality } from '../types/municipalities.types';
import { logger } from '@/lib/logger';

export function useMunicipalities(departmentId?: string) {
  const [municipalities, setMunicipalities] = useState<Municipality[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMunicipalities = useCallback(async (departmentIdParam?: string) => {
    const id = departmentIdParam || departmentId;
    
    if (!id) {
      setMunicipalities([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const data = await MunicipalitiesService.getMunicipalitiesByDepartment(id);
      setMunicipalities(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      logger.error('Error fetching municipalities:', err as Error);
    } finally {
      setLoading(false);
    }
  }, [departmentId]);

  useEffect(() => {
    fetchMunicipalities();
  }, [fetchMunicipalities]);

  const getMunicipalityById = (id: string) => {
    return municipalities.find(municipality => municipality.id === id);
  };

  const createMunicipality = useCallback(async (municipalityData: Omit<Municipality, 'id'>) => {
    try {
      setError(null);
      const newMunicipalityId = await MunicipalitiesService.createMunicipality(municipalityData);
      const newMunicipality = { ...municipalityData, id: newMunicipalityId };
      setMunicipalities(prev => [newMunicipality, ...prev]);
      logger.info(`Municipality created: ${newMunicipality.name}`);
      return newMunicipality;
    } catch (err) {
      const errorMessage = 'Error al crear municipio';
      setError(errorMessage);
      logger.error('Error creating municipality:', err as Error);
      throw err;
    }
  }, []);

  const updateMunicipality = useCallback(async (id: string, updates: Partial<Omit<Municipality, 'id'>>) => {
    try {
      setError(null);
      await MunicipalitiesService.updateMunicipality(id, updates);
      setMunicipalities(prev => prev.map(municipality => 
        municipality.id === id ? { ...municipality, ...updates } : municipality
      ));
      logger.info(`Municipality updated: ${id}`);
    } catch (err) {
      const errorMessage = 'Error al actualizar municipio';
      setError(errorMessage);
      logger.error('Error updating municipality:', err as Error);
      throw err;
    }
  }, []);

  const deleteMunicipality = useCallback(async (id: string) => {
    try {
      setError(null);
      await MunicipalitiesService.deleteMunicipality(id);
      setMunicipalities(prev => prev.map(municipality => 
        municipality.id === id ? { ...municipality, isActive: false } : municipality
      ));
      logger.info(`Municipality deleted: ${id}`);
    } catch (err) {
      const errorMessage = 'Error al eliminar municipio';
      setError(errorMessage);
      logger.error('Error deleting municipality:', err as Error);
      throw err;
    }
  }, []);

  return {
    municipalities,
    loading,
    error,
    getMunicipalities: fetchMunicipalities,
    refetch: fetchMunicipalities,
    getMunicipalityById,
    createMunicipality,
    updateMunicipality,
    deleteMunicipality
  };
}