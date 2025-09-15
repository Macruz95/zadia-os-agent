import { useState, useEffect } from 'react';
import { CountriesService } from '../services/countries.service';
import { Country } from '../types/countries.types';

export function useCountries() {
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCountries = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await CountriesService.getCountries();
      setCountries(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCountries();
  }, []);

  const getCountryById = (id: string) => {
    return countries.find(country => country.id === id);
  };

  const getCountryByIsoCode = (isoCode: string) => {
    return countries.find(country => country.isoCode === isoCode.toUpperCase());
  };

  return {
    countries,
    loading,
    error,
    refetch: fetchCountries,
    getCountryById,
    getCountryByIsoCode
  };
}