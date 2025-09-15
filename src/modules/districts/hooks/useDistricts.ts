import { useState, useEffect, useRef } from 'react';
import { DistrictsService } from '../services/districts.service';
import { District } from '../types/districts.types';

export function useDistricts(municipalityId?: string) {
  const [districts, setDistricts] = useState<District[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const municipalityIdRef = useRef(municipalityId);

  useEffect(() => {
    municipalityIdRef.current = municipalityId;
  }, [municipalityId]);

  useEffect(() => {
    async function fetchDistricts() {
      if (!municipalityId) {
        setDistricts([]);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const fetchedDistricts = await DistrictsService.getDistrictsByMunicipality(municipalityId);
        if (municipalityIdRef.current === municipalityId) {
          setDistricts(fetchedDistricts);
        }
      } catch (err) {
        if (municipalityIdRef.current === municipalityId) {
          setError(err instanceof Error ? err.message : 'Error loading districts');
        }
      } finally {
        if (municipalityIdRef.current === municipalityId) {
          setLoading(false);
        }
      }
    }

    fetchDistricts();
  }, [municipalityId]);

  return { districts, loading, error };
}