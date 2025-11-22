import { useState, useEffect } from 'react';
import { DashboardMetrics } from '../types/dashboard.types';
import { logger } from '@/lib/logger';
import { DashboardService } from '../services/dashboard.service';

export function useDashboardMetrics() {
    const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadMetrics = async () => {
            try {
                setLoading(true);
                const data = await DashboardService.getDashboardMetrics();
                setMetrics(data);
            } catch (err) {
                logger.error('Error loading dashboard metrics', err as Error);
                setError('Error al cargar métricas del dashboard');
            } finally {
                setLoading(false);
            }
        };

        loadMetrics();
    }, []);

    return { metrics, loading, error };
}
