import { useState, useEffect, useCallback } from 'react';
import { CountriesService } from '../services/countries.service';
import { Country } from '../types/countries.types';
import { logger } from '@/lib/logger';

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
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      logger.error('Error fetching countries:', err as Error);
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

  const createCountry = useCallback(async (countryData: Omit<Country, 'id'>) => {
    try {
      setError(null);
      const newCountryId = await CountriesService.createCountry(countryData);
      const newCountry = { ...countryData, id: newCountryId };
      setCountries(prev => [newCountry, ...prev]);
      logger.info(`Country created: ${newCountry.name}`);
      return newCountry;
    } catch (err) {
      const errorMessage = 'Error al crear país';
      setError(errorMessage);
      logger.error('Error creating country:', err as Error);
      throw err;
    }
  }, []);

  const updateCountry = useCallback(async (id: string, updates: Partial<Omit<Country, 'id'>>) => {
    try {
      setError(null);
      await CountriesService.updateCountry(id, updates);
      setCountries(prev => prev.map(country => 
        country.id === id ? { ...country, ...updates } : country
      ));
      logger.info(`Country updated: ${id}`);
    } catch (err) {
      const errorMessage = 'Error al actualizar país';
      setError(errorMessage);
      logger.error('Error updating country:', err as Error);
      throw err;
    }
  }, []);

  const deleteCountry = useCallback(async (id: string) => {
    try {
      setError(null);
      await CountriesService.deleteCountry(id);
      setCountries(prev => prev.map(country => 
        country.id === id ? { ...country, isActive: false } : country
      ));
      logger.info(`Country deleted: ${id}`);
    } catch (err) {
      const errorMessage = 'Error al eliminar país';
      setError(errorMessage);
      logger.error('Error deleting country:', err as Error);
      throw err;
    }
  }, []);

  return {
    countries,
    loading,
    error,
    getCountries: fetchCountries,
    refetch: fetchCountries,
    getCountryById,
    getCountryByIsoCode,
    createCountry,
    updateCountry,
    deleteCountry
  };
}