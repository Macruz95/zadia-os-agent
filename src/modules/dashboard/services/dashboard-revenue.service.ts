/**
 * ZADIA OS - Dashboard Revenue Service
 * Servicio para obtener datos reales de ingresos desde Firebase
 * Rule #3: No hardcoded data
 * Rule #4: Clean code with Zod validation
 */

import { collection, query, where, getDocs, Timestamp, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { logger } from '@/lib/logger';
import { z } from 'zod';

// Zod Schema para validar datos de ingresos mensuales
export const MonthlyRevenueSchema = z.object({
  month: z.string().min(1, 'Mes requerido'),
  revenue: z.number().min(0, 'Ingresos deben ser >= 0'),
});

export const MonthlyRevenueArraySchema = z.array(MonthlyRevenueSchema);

export type MonthlyRevenue = z.infer<typeof MonthlyRevenueSchema>;

export interface DashboardRevenueData {
  monthlyRevenue: MonthlyRevenue[];
  totalRevenue: number;
  averageMonthlyRevenue: number;
  monthlyGrowth: number;
}

export class DashboardRevenueService {
  private static readonly MONTHS_ES = [
    'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
    'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
  ];

  /**
   * Obtiene datos de ingresos mensuales desde facturas pagadas
   */
  static async getMonthlyRevenueData(monthsBack = 6, tenantId?: string | null): Promise<DashboardRevenueData> {
    // If no tenantId, return empty data
    if (!tenantId) {
      return this.getFallbackDataResponse(monthsBack);
    }

    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setMonth(endDate.getMonth() - monthsBack);

      logger.info('Fetching monthly revenue data');

      // Verificar si hay datos disponibles con una consulta simple primero
      let hasData = false;
      
      try {
        // Intentar una consulta simple para verificar permisos
        const testQuery = query(
          collection(db, 'invoices'), 
          where('tenantId', '==', tenantId),
          limit(1)
        );
        const testSnapshot = await getDocs(testQuery);
        hasData = !testSnapshot.empty;
      } catch {
        logger.info('No access to invoices collection - using fallback data');
        return this.getFallbackDataResponse(monthsBack);
      }

      if (!hasData) {
        logger.info('No invoice data available - using fallback data');
        return this.getFallbackDataResponse(monthsBack);
      }

      // Consultar facturas pagadas en el rango de fechas con tenant filter
      const invoicesQuery = query(
        collection(db, 'invoices'),
        where('tenantId', '==', tenantId),
        where('status', 'in', ['paid', 'partially-paid']),
        where('issueDate', '>=', Timestamp.fromDate(startDate)),
        where('issueDate', '<=', Timestamp.fromDate(endDate))
      );

      const invoicesSnapshot = await getDocs(invoicesQuery);

      // Agrupar ingresos por mes
      const monthlyData = new Map<string, number>();

      invoicesSnapshot.forEach((doc) => {
        const invoice = doc.data();
        const issueDate = invoice.issueDate.toDate();
        const monthKey = `${issueDate.getFullYear()}-${String(issueDate.getMonth() + 1).padStart(2, '0')}`;
        
        const currentRevenue = monthlyData.get(monthKey) || 0;
        const invoiceRevenue = invoice.amountPaid || invoice.total || 0;
        monthlyData.set(monthKey, currentRevenue + invoiceRevenue);
      });

      // Consultar oportunidades ganadas como fuente adicional (opcional)
      try {
        const opportunitiesQuery = query(
          collection(db, 'opportunities'),
          where('tenantId', '==', tenantId),
          where('status', '==', 'won'),
          where('closedAt', '>=', Timestamp.fromDate(startDate)),
          where('closedAt', '<=', Timestamp.fromDate(endDate))
        );

        const opportunitiesSnapshot = await getDocs(opportunitiesQuery);

        opportunitiesSnapshot.forEach((doc) => {
          const opportunity = doc.data();
          if (opportunity.closedAt) {
            const closedDate = opportunity.closedAt.toDate();
            const monthKey = `${closedDate.getFullYear()}-${String(closedDate.getMonth() + 1).padStart(2, '0')}`;
            
            const currentRevenue = monthlyData.get(monthKey) || 0;
            const oppRevenue = opportunity.estimatedValue || 0;
            monthlyData.set(monthKey, currentRevenue + oppRevenue);
          }
        });
      } catch {
        // Si no hay acceso a opportunities, continuar solo con facturas
        logger.info('No access to opportunities collection - using invoices only');
      }

      // Convertir a array y formatear meses
      const monthlyRevenue = this.formatMonthlyData(monthlyData, monthsBack);

      // Validar con Zod
      const validatedData = MonthlyRevenueArraySchema.parse(monthlyRevenue);

      // Calcular métricas adicionales
      const totalRevenue = validatedData.reduce((sum, item) => sum + item.revenue, 0);
      const averageMonthlyRevenue = validatedData.length > 0 ? totalRevenue / validatedData.length : 0;
      const monthlyGrowth = this.calculateMonthlyGrowth(validatedData);

      logger.info('Successfully fetched monthly revenue data');

      return {
        monthlyRevenue: validatedData,
        totalRevenue,
        averageMonthlyRevenue,
        monthlyGrowth
      };

    } catch (error) {
      logger.error('Error fetching monthly revenue data:', error as Error);
      
      // Fallback: retornar respuesta de datos por defecto
      return this.getFallbackDataResponse(monthsBack);
    }
  }

  /**
   * Formatea los datos mensuales en el formato requerido
   */
  private static formatMonthlyData(monthlyData: Map<string, number>, monthsBack: number): MonthlyRevenue[] {
    const result: MonthlyRevenue[] = [];
    const today = new Date();

    // Generar los últimos N meses
    for (let i = monthsBack - 1; i >= 0; i--) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthName = this.MONTHS_ES[date.getMonth()];
      
      result.push({
        month: monthName,
        revenue: monthlyData.get(monthKey) || 0
      });
    }

    return result;
  }

  /**
   * Calcula el crecimiento mensual promedio
   */
  private static calculateMonthlyGrowth(data: MonthlyRevenue[]): number {
    if (data.length < 2) return 0;

    const revenues = data.map(item => item.revenue);
    let totalGrowth = 0;
    let validComparisons = 0;

    for (let i = 1; i < revenues.length; i++) {
      const previous = revenues[i - 1];
      const current = revenues[i];
      
      if (previous > 0) {
        const growth = ((current - previous) / previous) * 100;
        totalGrowth += growth;
        validComparisons++;
      }
    }

    return validComparisons > 0 ? totalGrowth / validComparisons : 0;
  }

  /**
   * Datos de fallback en caso de error
   */
  private static getFallbackData(monthsBack: number): MonthlyRevenue[] {
    const fallbackData: MonthlyRevenue[] = [];
    const today = new Date();

    for (let i = monthsBack - 1; i >= 0; i--) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthName = this.MONTHS_ES[date.getMonth()];
      
      fallbackData.push({
        month: monthName,
        revenue: 0 // Sin datos, mostrar 0
      });
    }

    return fallbackData;
  }

  /**
   * Obtiene ingresos para un mes específico
   */
  static async getRevenueForMonth(year: number, month: number): Promise<number> {
    try {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);

      const invoicesQuery = query(
        collection(db, 'invoices'),
        where('status', 'in', ['paid', 'partially-paid']),
        where('issueDate', '>=', Timestamp.fromDate(startDate)),
        where('issueDate', '<=', Timestamp.fromDate(endDate))
      );

      const snapshot = await getDocs(invoicesQuery);
      let revenue = 0;

      snapshot.forEach((doc) => {
        const invoice = doc.data();
        revenue += invoice.amountPaid || invoice.total || 0;
      });

      return revenue;

    } catch (error) {
      logger.error('Error fetching revenue for month:', error as Error);
      return 0;
    }
  }

  /**
   * Retorna datos de respuesta de fallback con estructura completa
   */
  private static getFallbackDataResponse(monthsBack: number): DashboardRevenueData {
    const fallbackData = this.getFallbackData(monthsBack);
    
    return {
      monthlyRevenue: fallbackData,
      totalRevenue: 0,
      averageMonthlyRevenue: 0,
      monthlyGrowth: 0
    };
  }
}