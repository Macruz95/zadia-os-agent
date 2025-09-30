import { useState, useEffect, useCallback } from 'react';
import { DistrictsService } from '../services/districts.service';
import { District } from '../types/districts.types';
import { logger } from '@/lib/logger';

export function useDistricts(municipalityId?: string) {
  const [districts, setDistricts] = useState<District[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDistricts = useCallback(async (municipalityIdParam?: string) => {
    const id = municipalityIdParam || municipalityId;
    
    if (!id) {
      setDistricts([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const data = await DistrictsService.getDistrictsByMunicipality(id);
      setDistricts(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      logger.error('Error fetching districts:', err as Error);
    } finally {
      setLoading(false);
    }
  }, [municipalityId]);

  useEffect(() => {
    fetchDistricts();
  }, [fetchDistricts]);

  const getDistrictById = (id: string) => {
    return districts.find(district => district.id === id);
  };

  const createDistrict = useCallback(async (districtData: Omit<District, 'id'>) => {
    try {
      setError(null);
      const newDistrictId = await DistrictsService.createDistrict(districtData);
      const newDistrict = { ...districtData, id: newDistrictId };
      setDistricts(prev => [newDistrict, ...prev]);
      logger.info(`District created: ${newDistrict.name}`);
      return newDistrict;
    } catch (err) {
      const errorMessage = 'Error al crear distrito';
      setError(errorMessage);
      logger.error('Error creating district:', err as Error);
      throw err;
    }
  }, []);

  const updateDistrict = useCallback(async (id: string, updates: Partial<Omit<District, 'id'>>) => {
    try {
      setError(null);
      await DistrictsService.updateDistrict(id, updates);
      setDistricts(prev => prev.map(district => 
        district.id === id ? { ...district, ...updates } : district
      ));
      logger.info(`District updated: ${id}`);
    } catch (err) {
      const errorMessage = 'Error al actualizar distrito';
      setError(errorMessage);
      logger.error('Error updating district:', err as Error);
      throw err;
    }
  }, []);

  const deleteDistrict = useCallback(async (id: string) => {
    try {
      setError(null);
      await DistrictsService.deleteDistrict(id);
      setDistricts(prev => prev.map(district => 
        district.id === id ? { ...district, isActive: false } : district
      ));
      logger.info(`District deleted: ${id}`);
    } catch (err) {
      const errorMessage = 'Error al eliminar distrito';
      setError(errorMessage);
      logger.error('Error deleting district:', err as Error);
      throw err;
    }
  }, []);

  return {
    districts,
    loading,
    error,
    getDistricts: fetchDistricts,
    refetch: fetchDistricts,
    getDistrictById,
    createDistrict,
    updateDistrict,
    deleteDistrict
  };
}