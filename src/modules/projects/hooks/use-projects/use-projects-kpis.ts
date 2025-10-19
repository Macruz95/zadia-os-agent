/**
 * ZADIA OS - Use Projects KPIs Hook
 * Cálculo de métricas y KPIs de proyectos
 * Rule #5: Max 200 lines per file
 */

'use client';

import { useState, useEffect } from 'react';
import type { Project } from '../../types/projects.types';
import type { ProjectsKPIs } from './types';

/**
 * Hook for calculating KPIs from projects list
 * Processes data client-side for dashboard metrics
 * @param projects - Lista de proyectos
 * @returns KPIs calculados
 */
export function useProjectsKPIs(projects: Project[]): ProjectsKPIs {
  const [kpis, setKpis] = useState<ProjectsKPIs>({
    total: 0,
    active: 0,
    completed: 0,
    delayed: 0,
    totalRevenue: 0,
    totalCost: 0,
    profitMargin: 0,
    averageProgress: 0,
  });

  useEffect(() => {
    const now = new Date();

    // Contar activos (in-progress + planning)
    const active = projects.filter(
      (p) => p.status === 'in-progress' || p.status === 'planning'
    ).length;

    // Contar completados
    const completed = projects.filter((p) => p.status === 'completed').length;

    // Contar retrasados (in-progress con estimatedEndDate pasada)
    const delayed = projects.filter(
      (p) =>
        p.status === 'in-progress' &&
        p.estimatedEndDate &&
        p.estimatedEndDate.toDate() < now
    ).length;

    // Calcular revenue total
    const totalRevenue = projects.reduce(
      (sum, p) => sum + (p.salesPrice || 0),
      0
    );

    // Calcular costo total
    const totalCost = projects.reduce((sum, p) => sum + (p.actualCost || 0), 0);

    // Calcular margen de ganancia
    const profitMargin =
      totalRevenue > 0 ? ((totalRevenue - totalCost) / totalRevenue) * 100 : 0;

    // Calcular progreso promedio
    const averageProgress =
      projects.length > 0
        ? projects.reduce((sum, p) => sum + (p.progressPercent || 0), 0) /
          projects.length
        : 0;

    setKpis({
      total: projects.length,
      active,
      completed,
      delayed,
      totalRevenue,
      totalCost,
      profitMargin,
      averageProgress,
    });
  }, [projects]);

  return kpis;
}
