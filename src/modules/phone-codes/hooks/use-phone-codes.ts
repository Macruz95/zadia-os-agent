import { useState, useEffect, useCallback } from 'react';
import { PhoneCodesService } from '../services/phone-codes.service';
import { PhoneCode } from '../types/phone-codes.types';
import { logger } from '@/lib/logger';

export function usePhoneCodes(countryId?: string) {
  const [phoneCodes, setPhoneCodes] = useState<PhoneCode[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPhoneCodes = useCallback(async (countryIdParam?: string) => {
    try {
      setLoading(true);
      setError(null);
      
      let data: PhoneCode[];
      if (countryIdParam || countryId) {
        data = await PhoneCodesService.getPhoneCodesByCountry(countryIdParam || countryId!);
      } else {
        data = await PhoneCodesService.getPhoneCodes();
      }
      
      setPhoneCodes(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      logger.error('Error fetching phone codes:', err as Error);
    } finally {
      setLoading(false);
    }
  }, [countryId]);

  useEffect(() => {
    fetchPhoneCodes();
  }, [fetchPhoneCodes]);

  const getPhoneCodeById = (id: string) => {
    return phoneCodes.find(phoneCode => phoneCode.id === id);
  };

  const findByDialCode = (dialCode: string) => {
    return phoneCodes.find(phoneCode => phoneCode.dialCode === dialCode);
  };

  const createPhoneCode = useCallback(async (phoneCodeData: Omit<PhoneCode, 'id'>) => {
    try {
      setError(null);
      const newPhoneCodeId = await PhoneCodesService.createPhoneCode(phoneCodeData);
      const newPhoneCode = { ...phoneCodeData, id: newPhoneCodeId };
      setPhoneCodes(prev => [newPhoneCode, ...prev]);
      logger.info(`Phone code created: ${newPhoneCode.code}`);
      return newPhoneCode;
    } catch (err) {
      const errorMessage = 'Error al crear código telefónico';
      setError(errorMessage);
      logger.error('Error creating phone code:', err as Error);
      throw err;
    }
  }, []);

  const updatePhoneCode = useCallback(async (id: string, updates: Partial<Omit<PhoneCode, 'id'>>) => {
    try {
      setError(null);
      await PhoneCodesService.updatePhoneCode(id, updates);
      setPhoneCodes(prev => prev.map(phoneCode => 
        phoneCode.id === id ? { ...phoneCode, ...updates } : phoneCode
      ));
      logger.info(`Phone code updated: ${id}`);
    } catch (err) {
      const errorMessage = 'Error al actualizar código telefónico';
      setError(errorMessage);
      logger.error('Error updating phone code:', err as Error);
      throw err;
    }
  }, []);

  const deletePhoneCode = useCallback(async (id: string) => {
    try {
      setError(null);
      await PhoneCodesService.deletePhoneCode(id);
      setPhoneCodes(prev => prev.map(phoneCode => 
        phoneCode.id === id ? { ...phoneCode, isActive: false } : phoneCode
      ));
      logger.info(`Phone code deleted: ${id}`);
    } catch (err) {
      const errorMessage = 'Error al eliminar código telefónico';
      setError(errorMessage);
      logger.error('Error deleting phone code:', err as Error);
      throw err;
    }
  }, []);

  return {
    phoneCodes,
    loading,
    error,
    getPhoneCodes: fetchPhoneCodes,
    refetch: fetchPhoneCodes,
    getPhoneCodeById,
    findByDialCode,
    createPhoneCode,
    updatePhoneCode,
    deletePhoneCode
  };
}