/**
 * Consejero Digital - Hook de Insights
 * 
 * Genera insights accionables basados en datos REALES del DTO
 * REGLA 1: DATOS REALES - No mocks, no hardcode
 * REGLA 5: < 250 líneas
 */

'use client';

import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export type InsightType = 'risk' | 'opportunity' | 'info' | 'action';
export type InsightPriority = 'critical' | 'high' | 'medium' | 'low';

export interface Insight {
  id: string;
  type: InsightType;
  priority: InsightPriority;
  title: string;
  description: string;
  impact?: string;
  actions: InsightAction[];
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

export interface InsightAction {
  id: string;
  label: string;
  href?: string;
  variant: 'primary' | 'secondary' | 'destructive';
}

interface DigitalAdvisorResult {
  insights: Insight[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useDigitalAdvisor(): DigitalAdvisorResult {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const generateInsights = async () => {
    try {
      setLoading(true);
      setError(null);
      const newInsights: Insight[] = [];

      // 1. CHECK OVERDUE INVOICES
      try {
        const invoicesRef = collection(db, 'invoices');
        const pendingQuery = query(
          invoicesRef,
          where('status', 'in', ['pending', 'pendiente', 'overdue', 'vencida'])
        );
        const pendingSnap = await getDocs(pendingQuery);
        
        const now = new Date();
        let overdueCount = 0;
        let overdueTotal = 0;
        
        pendingSnap.docs.forEach(doc => {
          const data = doc.data();
          const dueDate = data.dueDate?.toDate?.() || data.dueDate;
          if (dueDate && new Date(dueDate) < now) {
            overdueCount++;
            overdueTotal += data.total || data.amount || 0;
          }
        });

        if (overdueCount > 0) {
          newInsights.push({
            id: 'overdue-invoices',
            type: 'risk',
            priority: overdueCount > 5 ? 'critical' : 'high',
            title: `${overdueCount} factura${overdueCount > 1 ? 's' : ''} vencida${overdueCount > 1 ? 's' : ''}`,
            description: `Tienes facturas pendientes de cobro que ya pasaron su fecha de vencimiento.`,
            impact: overdueTotal > 0 ? `$${overdueTotal.toLocaleString()} en riesgo de cobro` : undefined,
            actions: [
              { id: 'view-invoices', label: 'Ver facturas', href: '/finance/invoices?status=overdue', variant: 'primary' },
              { id: 'send-reminders', label: 'Enviar recordatorios', href: '/finance/invoices', variant: 'secondary' },
            ],
            createdAt: new Date(),
          });
        }
      } catch {
        // Collection might not exist
      }

      // 2. CHECK PROJECTS AT RISK (no progress or delayed)
      try {
        const projectsRef = collection(db, 'projects');
        const activeQuery = query(
          projectsRef,
          where('status', 'in', ['in_progress', 'en_progreso', 'active', 'activo'])
        );
        const activeSnap = await getDocs(activeQuery);
        
        let atRiskCount = 0;
        const atRiskProjects: string[] = [];
        
        activeSnap.docs.forEach(doc => {
          const data = doc.data();
          const progress = data.progress || data.progressPercent || 0;
          const endDate = data.endDate?.toDate?.() || data.expectedEndDate?.toDate?.();
          
          // Project at risk if: low progress or past due date
          if (progress < 30 || (endDate && new Date(endDate) < new Date())) {
            atRiskCount++;
            atRiskProjects.push(data.name || doc.id);
          }
        });

        if (atRiskCount > 0) {
          newInsights.push({
            id: 'projects-at-risk',
            type: 'risk',
            priority: atRiskCount > 3 ? 'critical' : 'high',
            title: `${atRiskCount} proyecto${atRiskCount > 1 ? 's' : ''} en riesgo`,
            description: `Proyectos con bajo progreso o fechas vencidas que requieren atención.`,
            impact: atRiskProjects.slice(0, 3).join(', '),
            actions: [
              { id: 'view-projects', label: 'Ver proyectos', href: '/projects?filter=at_risk', variant: 'primary' },
            ],
            createdAt: new Date(),
          });
        }
      } catch {
        // Collection might not exist
      }

      // 3. CHECK HIGH-VALUE OPPORTUNITIES
      try {
        const oppsRef = collection(db, 'opportunities');
        const openQuery = query(
          oppsRef,
          where('stage', 'in', ['negotiation', 'negociacion', 'proposal', 'propuesta', 'qualification'])
        );
        const openSnap = await getDocs(openQuery);
        
        let highValueCount = 0;
        let totalValue = 0;
        
        openSnap.docs.forEach(doc => {
          const data = doc.data();
          const value = data.value || data.amount || 0;
          if (value > 10000) {
            highValueCount++;
            totalValue += value;
          }
        });

        if (highValueCount > 0) {
          newInsights.push({
            id: 'high-value-opportunities',
            type: 'opportunity',
            priority: 'high',
            title: `${highValueCount} oportunidad${highValueCount > 1 ? 'es' : ''} de alto valor`,
            description: `Oportunidades en negociación que podrían cerrarse pronto.`,
            impact: `$${totalValue.toLocaleString()} en pipeline`,
            actions: [
              { id: 'view-opportunities', label: 'Ver oportunidades', href: '/sales/opportunities', variant: 'primary' },
            ],
            createdAt: new Date(),
          });
        }
      } catch {
        // Collection might not exist
      }

      // 4. CHECK NEW LEADS TO FOLLOW UP
      try {
        const leadsRef = collection(db, 'leads');
        const newLeadsQuery = query(
          leadsRef,
          where('status', 'in', ['new', 'nuevo', 'contacted', 'contactado']),
          limit(20)
        );
        const newLeadsSnap = await getDocs(newLeadsQuery);
        
        const newLeadsCount = newLeadsSnap.size;

        if (newLeadsCount > 0) {
          newInsights.push({
            id: 'new-leads',
            type: 'action',
            priority: newLeadsCount > 10 ? 'high' : 'medium',
            title: `${newLeadsCount} lead${newLeadsCount > 1 ? 's' : ''} pendiente${newLeadsCount > 1 ? 's' : ''} de seguimiento`,
            description: `Leads nuevos o contactados que necesitan seguimiento.`,
            actions: [
              { id: 'view-leads', label: 'Gestionar leads', href: '/sales/leads', variant: 'primary' },
            ],
            createdAt: new Date(),
          });
        }
      } catch {
        // Collection might not exist
      }

      // 5. CHECK LOW INVENTORY (if applicable)
      try {
        const inventoryRef = collection(db, 'inventory');
        const inventorySnap = await getDocs(inventoryRef);
        
        let lowStockCount = 0;
        
        inventorySnap.docs.forEach(doc => {
          const data = doc.data();
          const current = data.currentStock || data.quantity || 0;
          const minimum = data.minStock || data.reorderPoint || 0;
          
          if (minimum > 0 && current <= minimum) {
            lowStockCount++;
          }
        });

        if (lowStockCount > 0) {
          newInsights.push({
            id: 'low-inventory',
            type: 'risk',
            priority: lowStockCount > 5 ? 'high' : 'medium',
            title: `${lowStockCount} producto${lowStockCount > 1 ? 's' : ''} con stock bajo`,
            description: `Artículos de inventario que están en o por debajo del punto de reorden.`,
            actions: [
              { id: 'view-inventory', label: 'Ver inventario', href: '/inventory', variant: 'primary' },
            ],
            createdAt: new Date(),
          });
        }
      } catch {
        // Collection might not exist
      }

      // Sort by priority
      const priorityOrder: Record<InsightPriority, number> = {
        critical: 0,
        high: 1,
        medium: 2,
        low: 3,
      };
      
      newInsights.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
      
      setInsights(newInsights);

    } catch {
      setError('Error generando insights');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    generateInsights();
  }, []);

  return {
    insights,
    loading,
    error,
    refresh: generateInsights,
  };
}

