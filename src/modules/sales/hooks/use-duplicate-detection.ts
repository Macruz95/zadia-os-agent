/**
 * ZADIA OS - Duplicate Detection Hook
 * 
 * Manages duplicate client detection during lead conversion
 * Following ZADIA Rule 4: Modular architecture
 */

import { useState, useCallback } from 'react';
import { DuplicateDetectionService } from '../services/duplicate-detection.service';
import { 
  DuplicateClient, 
  DuplicateSearchInput 
} from '../validations/lead-conversion.schema';
import { logger } from '@/lib/logger';

interface UseDuplicateDetectionReturn {
  duplicates: DuplicateClient[];
  isSearching: boolean;
  error: string | null;
  searchForDuplicates: (searchData: DuplicateSearchInput) => Promise<void>;
  clearDuplicates: () => void;
  hasDuplicates: boolean;
}

export function useDuplicateDetection(): UseDuplicateDetectionReturn {
  const [duplicates, setDuplicates] = useState<DuplicateClient[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Search for potential duplicate clients
   */
  const searchForDuplicates = useCallback(async (searchData: DuplicateSearchInput) => {
    setIsSearching(true);
    setError(null);

    try {
      const results = await DuplicateDetectionService.findDuplicates(searchData);
      setDuplicates(results);
      
      logger.info(`Found ${results.length} potential duplicates`);
      
    } catch (err) {
      const errorMessage = err instanceof Error 
        ? err.message 
        : 'Error al buscar duplicados';
      setError(errorMessage);
      logger.error('Duplicate search failed', err as Error);
    } finally {
      setIsSearching(false);
    }
  }, []);

  /**
   * Clear duplicate results
   */
  const clearDuplicates = useCallback(() => {
    setDuplicates([]);
    setError(null);
  }, []);

  return {
    duplicates,
    isSearching,
    error,
    searchForDuplicates,
    clearDuplicates,
    hasDuplicates: duplicates.length > 0,
  };
}
