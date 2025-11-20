/**
 * ZADIA OS - Quote Conversion Hook
 * 
 * Manages quote to project conversion logic and state
 * REGLA 5: <200 líneas
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  QuoteConversionService,
  type ConversionConfig,
} from '../services/quote-conversion.service';
import type { Quote } from '@/modules/sales/types/sales.types';

interface UseQuoteConversionProps {
  quote: Quote;
  userId: string;
  onClose: () => void;
}

interface UseQuoteConversionReturn {
  config: ConversionConfig;
  loading: boolean;
  estimatedCost: number;
  estimatedDuration: number;
  updateConfig: (updates: Partial<ConversionConfig>) => void;
  handleConvert: () => Promise<void>;
  formatCurrency: (value: number) => string;
}

export function useQuoteConversion({
  quote,
  userId,
  onClose,
}: UseQuoteConversionProps): UseQuoteConversionReturn {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [config, setConfig] = useState<ConversionConfig>({
    projectName: QuoteConversionService.generateProjectName(quote),
    projectDescription: quote.notes || '',
    priority: 'medium',
    startDate: new Date(),
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: quote.currency || 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const estimatedCost = QuoteConversionService.estimateProjectCost(quote);
  const estimatedDuration = QuoteConversionService.calculateEstimatedDuration(quote);

  const updateConfig = (updates: Partial<ConversionConfig>) => {
    setConfig((prev) => ({ ...prev, ...updates }));
  };

  const handleConvert = async () => {
    try {
      setLoading(true);

      const result = await QuoteConversionService.convertQuoteToProject(
        quote,
        config,
        userId
      );

      if (result.success && result.projectId) {
        toast.success('Proyecto creado exitosamente');
        onClose();
        router.push(`/projects/${result.projectId}`);
      } else {
        toast.error(result.message || 'Error al crear el proyecto');
      }
    } catch {
      toast.error('Error al procesar la conversión');
    } finally {
      setLoading(false);
    }
  };

  return {
    config,
    loading,
    estimatedCost,
    estimatedDuration,
    updateConfig,
    handleConvert,
    formatCurrency,
  };
}
