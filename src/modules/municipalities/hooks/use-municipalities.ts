import { useState, useEffect, useCallback } from 'react';
import { MunicipalitiesService } from '../services/municipalities.service';
import { Municipality } from '../types/municipalities.types';

export function useMunicipalities(departmentId?: string) {
  const [municipalities, setMunicipalities] = useState<Municipality[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchMunicipalities = useCallback(async (departmentIdParam?: string) => {
    const id = departmentIdParam || departmentId;
    if (!id) {
      setMunicipalities([]);
      return;
    }

    try {
      setLoading(true);
      const data = await MunicipalitiesService.getMunicipalitiesByDepartment(id);
      setMunicipalities(data);
    } catch {
      // Error silencioso - el estado loading se maneja en el componente
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

  return {
    municipalities,
    loading,
    refetch: fetchMunicipalities,
    getMunicipalityById
  };
}