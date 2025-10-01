/**
 * Hook for formatting addresses with real location data
 */
import { useState, useEffect } from 'react';
import { logger } from '@/lib/logger';
import { formatFullAddressAsync } from '../utils/location.utils';
import type { Address } from '../types/clients.types';

export const useFormattedAddress = (address: Address) => {
  const [formattedAddress, setFormattedAddress] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const formatAddress = async () => {
      try {
        setLoading(true);
        const formatted = await formatFullAddressAsync(address);
        setFormattedAddress(formatted);
      } catch (error) {
        logger.error('Error formatting address', error as Error, {
          component: 'use-formatted-address',
          action: 'formatAddress'
        });
        // Fallback to basic formatting
        const fallback = [
          address.street,
          address.district,
          address.city,
          address.state,
          address.country
        ].filter(Boolean).join(', ');
        setFormattedAddress(fallback);
      } finally {
        setLoading(false);
      }
    };

    formatAddress();
  }, [address]);

  return { formattedAddress, loading };
};