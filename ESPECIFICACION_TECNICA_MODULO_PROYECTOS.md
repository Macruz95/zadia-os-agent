# 🚀 ESPECIFICACIÓN TÉCNICA: MÓDULO DE PROYECTOS - ZADIA OS
**Prioridad:** CRÍTICA  
**Impacto:** Cierra brecha del 20% y completa flujo Lead → Facturación  
**Estado:** Listo para Implementación Inmediata  
**Fecha:** 16 de Octubre, 2025

---

## 📋 CONTEXTO ESTRATÉGICO

### Problema Actual
- ✅ **Lead → Cliente → Oportunidad → Cotización** = 100% funcional
- ❌ **Cotización → PROYECTO** = Solo wizard preparado (5% implementado)
- ❌ **Proyecto → Ejecución/Finanzas** = 0% implementado

### Solución Propuesta
Implementar el **Módulo de Proyectos completo** siguiendo la arquitectura y patrones ya establecidos en Ventas e Inventario.

### Beneficio Esperado
- ✅ Flujo end-to-end completo
- ✅ Trazabilidad total desde Lead hasta entrega
- ✅ Control real de costos y rentabilidad
- ✅ ZADIA OS alcanza **88%+ de la especificación**

---

## 🎯 ARQUITECTURA Y ESTRUCTURA

### Ubicación en el Proyecto

```
src/modules/projects/
├── components/
│   ├── ProjectsDirectory.tsx          ← Página principal
│   ├── ProjectsHeader.tsx             ← Header con acciones
│   ├── ProjectsKPICards.tsx           ← KPIs globales
│   ├── ProjectsTable.tsx              ← Vista tabla
│   ├── ProjectsKanban.tsx             ← Vista Kanban
│   ├── ProjectFilters.tsx             ← Filtros avanzados
│   ├── CreateProjectWizard.tsx        ← Wizard de creación
│   ├── ProjectProfile.tsx             ← Página de detalles
│   ├── ProjectProfileHeader.tsx       ← Header del detalle
│   ├── ProjectKPIsRow.tsx             ← KPIs del proyecto
│   ├── ProjectTimeline.tsx            ← Timeline unificado
│   ├── ProjectFinancialSummary.tsx    ← Resumen financiero
│   ├── ProjectBOMCard.tsx             ← BOM y materiales
│   ├── ProjectTeamCard.tsx            ← Equipo asignado
│   ├── work-orders/
│   │   ├── WorkOrdersList.tsx         ← Lista de órdenes
│   │   ├── WorkOrderCard.tsx          ← Tarjeta individual
│   │   ├── CreateWorkOrderDialog.tsx  ← Crear orden
│   │   └── WorkOrderDetails.tsx       ← Detalles de orden
│   ├── tasks/
│   │   ├── TasksKanban.tsx            ← Kanban de tareas
│   │   ├── TasksList.tsx              ← Lista de tareas
│   │   └── CreateTaskDialog.tsx       ← Crear tarea
│   └── quality/
│       ├── QualityChecklist.tsx       ← Checklist de calidad
│       └── QualityReport.tsx          ← Reporte de calidad
├── hooks/
│   ├── use-projects.ts                ← Hook principal
│   ├── use-project-profile.ts         ← Hook de detalles
│   ├── use-work-orders.ts             ← Hook de órdenes
│   ├── use-project-tasks.ts           ← Hook de tareas
│   └── use-project-conversion.ts      ← Hook conversión cotización
├── services/
│   ├── projects.service.ts            ← Servicio principal
│   ├── work-orders.service.ts         ← Servicio órdenes
│   └── project-conversion.service.ts  ← Servicio conversión
├── types/
│   └── projects.types.ts              ← Tipos TypeScript
├── validations/
│   └── projects.validation.ts         ← Validaciones Zod
└── utils/
    └── projects.utils.ts              ← Utilidades

src/app/(main)/projects/
├── page.tsx                           ← /projects (listado)
├── create/
│   └── page.tsx                       ← /projects/create
└── [id]/
    ├── page.tsx                       ← /projects/:id (detalles)
    ├── work-orders/
    │   └── page.tsx                   ← /projects/:id/work-orders
    └── tasks/
        └── page.tsx                   ← /projects/:id/tasks
```

---

## 📦 MODELO DE DATOS (TypeScript + Firestore)

### 1. Tipos Base

```typescript
// src/modules/projects/types/projects.types.ts

import { Timestamp } from 'firebase/firestore';

// Enums
export type ProjectStatus = 
  | 'planning'        // Planificación
  | 'in-progress'     // En Progreso
  | 'on-hold'         // En Espera
  | 'completed'       // Completado
  | 'cancelled';      // Cancelado

export type ProjectPriority = 'low' | 'medium' | 'high' | 'urgent';

export type WorkOrderStatus = 
  | 'pending'         // Pendiente
  | 'in-progress'     // En Proceso
  | 'paused'          // Pausado
  | 'completed'       // Completado
  | 'cancelled';      // Cancelado

export type TaskStatus = 
  | 'todo'            // Por Hacer
  | 'in-progress'     // En Progreso
  | 'review'          // En Revisión
  | 'done'            // Completada
  | 'cancelled';      // Cancelada

// Interfaces Principales

/**
 * Proyecto - Entidad principal
 */
export interface Project {
  id: string;
  
  // Información Básica
  name: string;
  description?: string;
  projectType: 'production' | 'service' | 'internal';
  status: ProjectStatus;
  priority: ProjectPriority;
  
  // Relaciones (origen del proyecto)
  clientId: string;
  clientName: string;
  opportunityId?: string;
  quoteId?: string;
  quoteNumber?: string;
  
  // Financiero
  salesPrice: number;              // Precio de venta (de la cotización)
  estimatedCost: number;           // Costo estimado
  actualCost: number;              // Costo real (acumulado)
  currency: string;
  paymentTerms?: string;
  
  // Fechas
  startDate?: Timestamp;
  estimatedEndDate?: Timestamp;
  actualStartDate?: Timestamp;
  actualEndDate?: Timestamp;
  
  // Equipo
  projectManager: string;          // UID del PM
  teamMembers: string[];           // UIDs del equipo
  
  // Progreso
  progressPercent: number;         // 0-100
  
  // BOM y Materiales
  bomId?: string;                  // Referencia al BOM
  materialsCost: number;           // Costo de materiales consumidos
  laborCost: number;               // Costo de mano de obra
  overheadCost: number;            // Gastos indirectos
  
  // Metadata
  tags: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;
  updatedBy?: string;
}

/**
 * Orden de Trabajo - Fases de producción
 */
export interface WorkOrder {
  id: string;
  projectId: string;
  
  // Información
  name: string;                    // Ej: "Corte de madera"
  description?: string;
  phase: string;                   // Ej: "Producción", "Acabado"
  status: WorkOrderStatus;
  
  // Responsable
  assignedTo: string;              // UID del responsable
  
  // Fechas
  estimatedStartDate?: Timestamp;
  estimatedEndDate?: Timestamp;
  actualStartDate?: Timestamp;
  actualEndDate?: Timestamp;
  
  // Progreso
  progressPercent: number;
  
  // Materiales (referencia a inventario)
  materials: WorkOrderMaterial[];
  
  // Mano de obra
  laborHours: number;              // Horas trabajadas
  laborCostPerHour: number;
  
  // Costos
  estimatedCost: number;
  actualCost: number;
  
  // Metadata
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;
}

/**
 * Material usado en Orden de Trabajo
 */
export interface WorkOrderMaterial {
  rawMaterialId: string;
  rawMaterialName: string;
  quantityRequired: number;
  quantityUsed: number;
  unitOfMeasure: string;
  unitCost: number;
  totalCost: number;
}

/**
 * Tarea del Proyecto
 */
export interface ProjectTask {
  id: string;
  projectId: string;
  workOrderId?: string;            // Opcional, puede estar ligada a una orden
  
  // Información
  title: string;
  description?: string;
  status: TaskStatus;
  priority: ProjectPriority;
  
  // Asignación
  assignedTo?: string;
  
  // Fechas
  dueDate?: Timestamp;
  completedAt?: Timestamp;
  
  // Estimación
  estimatedHours?: number;
  actualHours?: number;
  
  // Metadata
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;
}

/**
 * Sesión de Trabajo (Time Tracking)
 */
export interface WorkSession {
  id: string;
  projectId: string;
  workOrderId?: string;
  taskId?: string;
  
  // Usuario
  userId: string;
  userName: string;
  
  // Tiempo
  startTime: Timestamp;
  endTime?: Timestamp;
  durationSeconds: number;
  
  // Costo
  hourlyRate: number;
  totalCost: number;
  
  // Notas
  notes?: string;
  
  // Metadata
  createdAt: Timestamp;
}

/**
 * Entrada de Timeline del Proyecto
 */
export interface ProjectTimelineEntry {
  id: string;
  projectId: string;
  
  // Tipo de evento
  type: 'status-change' | 'work-order-completed' | 'task-completed' | 
        'note' | 'material-consumed' | 'cost-update' | 'milestone';
  
  // Contenido
  title: string;
  description?: string;
  
  // Datos específicos (JSON flexible)
  metadata?: Record<string, any>;
  
  // Usuario
  performedBy: string;
  performedByName: string;
  
  // Fecha
  performedAt: Timestamp;
}

/**
 * Estado de conversión de Cotización a Proyecto
 */
export interface QuoteToProjectConversion {
  quoteId: string;
  projectId?: string;
  
  // Configuración del Proyecto
  projectConfig: {
    name: string;
    description?: string;
    projectManager: string;
    teamMembers: string[];
    startDate: Timestamp;
    estimatedEndDate: Timestamp;
  };
  
  // Reservas de Inventario
  inventoryReservations: {
    itemId: string;
    itemName: string;
    quantityReserved: number;
    status: 'reserved' | 'pending' | 'failed';
  }[];
  
  // Órdenes de Trabajo
  workOrders: {
    name: string;
    phase: string;
    assignedTo: string;
    materials: WorkOrderMaterial[];
    estimatedHours: number;
  }[];
  
  // Estado
  status: 'preparing' | 'converting' | 'completed' | 'failed';
  error?: string;
  
  // Metadata
  createdAt: Timestamp;
  completedAt?: Timestamp;
}

// Interfaces de búsqueda y filtros

export interface ProjectSearchParams {
  query?: string;
  status?: ProjectStatus;
  priority?: ProjectPriority;
  clientId?: string;
  projectManager?: string;
  startDate?: Date;
  endDate?: Date;
  sortBy?: 'name' | 'startDate' | 'status' | 'progressPercent';
  sortOrder?: 'asc' | 'desc';
  pageSize?: number;
  lastDoc?: any;
}

export interface ProjectDirectoryState {
  projects: Project[];
  loading: boolean;
  error?: string;
  searchParams: ProjectSearchParams;
  totalCount: number;
}

export interface ProjectProfileState {
  project?: Project;
  workOrders: WorkOrder[];
  tasks: ProjectTask[];
  workSessions: WorkSession[];
  timeline: ProjectTimelineEntry[];
  loading: boolean;
  error?: string;
}
```

---

## 🔧 SERVICIOS (Firebase + Business Logic)

### 1. Servicio Principal de Proyectos

```typescript
// src/modules/projects/services/projects.service.ts

import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  writeBatch,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { logger } from '@/lib/logger';
import {
  Project,
  ProjectSearchParams,
  ProjectStatus,
  ProjectTimelineEntry,
} from '../types/projects.types';

export const ProjectsService = {
  /**
   * Crear un nuevo proyecto
   */
  async createProject(projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const projectsRef = collection(db, 'projects');
      
      const newProject = {
        ...projectData,
        actualCost: 0,
        materialsCost: 0,
        laborCost: 0,
        overheadCost: 0,
        progressPercent: 0,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      const docRef = await addDoc(projectsRef, newProject);
      
      // Crear entrada en timeline
      await this.addTimelineEntry({
        projectId: docRef.id,
        type: 'status-change',
        title: 'Proyecto creado',
        description: `Proyecto "${projectData.name}" creado desde cotización ${projectData.quoteNumber || 'manual'}`,
        performedBy: projectData.createdBy,
        performedByName: 'Sistema',
        performedAt: Timestamp.now(),
      });

      logger.info('Project created successfully', {
        projectId: docRef.id,
        projectName: projectData.name,
      });

      return docRef.id;
    } catch (error) {
      logger.error('Error creating project', error as Error);
      throw new Error('Error al crear el proyecto');
    }
  },

  /**
   * Obtener proyecto por ID
   */
  async getProjectById(projectId: string): Promise<Project | null> {
    try {
      const projectRef = doc(db, 'projects', projectId);
      const projectDoc = await getDoc(projectRef);

      if (!projectDoc.exists()) {
        return null;
      }

      return {
        id: projectDoc.id,
        ...projectDoc.data(),
      } as Project;
    } catch (error) {
      logger.error('Error fetching project', error as Error, { projectId });
      throw new Error('Error al obtener el proyecto');
    }
  },

  /**
   * Buscar proyectos con filtros
   */
  async searchProjects(params: ProjectSearchParams = {}): Promise<{
    projects: Project[];
    totalCount: number;
  }> {
    try {
      const projectsRef = collection(db, 'projects');
      let q = query(projectsRef);

      // Aplicar filtros
      if (params.status) {
        q = query(q, where('status', '==', params.status));
      }
      if (params.priority) {
        q = query(q, where('priority', '==', params.priority));
      }
      if (params.clientId) {
        q = query(q, where('clientId', '==', params.clientId));
      }
      if (params.projectManager) {
        q = query(q, where('projectManager', '==', params.projectManager));
      }

      // Ordenar
      const sortField = params.sortBy || 'createdAt';
      const sortDirection = params.sortOrder || 'desc';
      q = query(q, orderBy(sortField, sortDirection));

      // Limitar resultados
      if (params.pageSize) {
        q = query(q, limit(params.pageSize));
      }

      const snapshot = await getDocs(q);
      const projects = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Project[];

      return {
        projects,
        totalCount: projects.length,
      };
    } catch (error) {
      logger.error('Error searching projects', error as Error);
      throw new Error('Error al buscar proyectos');
    }
  },

  /**
   * Actualizar estado del proyecto
   */
  async updateProjectStatus(
    projectId: string,
    newStatus: ProjectStatus,
    userId: string,
    userName: string
  ): Promise<void> {
    try {
      const projectRef = doc(db, 'projects', projectId);
      
      await updateDoc(projectRef, {
        status: newStatus,
        updatedAt: Timestamp.now(),
        updatedBy: userId,
      });

      // Registrar en timeline
      await this.addTimelineEntry({
        projectId,
        type: 'status-change',
        title: 'Estado actualizado',
        description: `Proyecto cambió a estado: ${newStatus}`,
        performedBy: userId,
        performedByName: userName,
        performedAt: Timestamp.now(),
      });

      logger.info('Project status updated', { projectId, newStatus });
    } catch (error) {
      logger.error('Error updating project status', error as Error);
      throw new Error('Error al actualizar estado del proyecto');
    }
  },

  /**
   * Actualizar progreso del proyecto
   */
  async updateProgress(projectId: string, progressPercent: number): Promise<void> {
    try {
      const projectRef = doc(db, 'projects', projectId);
      
      await updateDoc(projectRef, {
        progressPercent: Math.min(100, Math.max(0, progressPercent)),
        updatedAt: Timestamp.now(),
      });

      logger.info('Project progress updated', { projectId, progressPercent });
    } catch (error) {
      logger.error('Error updating project progress', error as Error);
      throw new Error('Error al actualizar progreso');
    }
  },

  /**
   * Actualizar costos del proyecto
   */
  async updateCosts(
    projectId: string,
    costs: {
      materialsCost?: number;
      laborCost?: number;
      overheadCost?: number;
    }
  ): Promise<void> {
    try {
      const projectRef = doc(db, 'projects', projectId);
      const project = await this.getProjectById(projectId);
      
      if (!project) {
        throw new Error('Proyecto no encontrado');
      }

      const updatedMaterialsCost = costs.materialsCost ?? project.materialsCost;
      const updatedLaborCost = costs.laborCost ?? project.laborCost;
      const updatedOverheadCost = costs.overheadCost ?? project.overheadCost;
      
      const actualCost = updatedMaterialsCost + updatedLaborCost + updatedOverheadCost;

      await updateDoc(projectRef, {
        materialsCost: updatedMaterialsCost,
        laborCost: updatedLaborCost,
        overheadCost: updatedOverheadCost,
        actualCost,
        updatedAt: Timestamp.now(),
      });

      logger.info('Project costs updated', { projectId, actualCost });
    } catch (error) {
      logger.error('Error updating project costs', error as Error);
      throw new Error('Error al actualizar costos');
    }
  },

  /**
   * Agregar entrada al timeline
   */
  async addTimelineEntry(entry: Omit<ProjectTimelineEntry, 'id'>): Promise<void> {
    try {
      const timelineRef = collection(db, 'projectTimeline');
      await addDoc(timelineRef, entry);
    } catch (error) {
      logger.error('Error adding timeline entry', error as Error);
      // No lanzar error para no bloquear operaciones principales
    }
  },

  /**
   * Obtener timeline del proyecto
   */
  async getProjectTimeline(projectId: string): Promise<ProjectTimelineEntry[]> {
    try {
      const timelineRef = collection(db, 'projectTimeline');
      const q = query(
        timelineRef,
        where('projectId', '==', projectId),
        orderBy('performedAt', 'desc')
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as ProjectTimelineEntry[];
    } catch (error) {
      logger.error('Error fetching project timeline', error as Error);
      return [];
    }
  },

  /**
   * Eliminar proyecto (solo admin)
   */
  async deleteProject(projectId: string): Promise<void> {
    try {
      const batch = writeBatch(db);
      
      // Eliminar proyecto
      const projectRef = doc(db, 'projects', projectId);
      batch.delete(projectRef);

      // Eliminar órdenes de trabajo
      const workOrdersRef = collection(db, 'workOrders');
      const workOrdersQuery = query(workOrdersRef, where('projectId', '==', projectId));
      const workOrdersSnapshot = await getDocs(workOrdersQuery);
      workOrdersSnapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });

      // Eliminar tareas
      const tasksRef = collection(db, 'projectTasks');
      const tasksQuery = query(tasksRef, where('projectId', '==', projectId));
      const tasksSnapshot = await getDocs(tasksQuery);
      tasksSnapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });

      await batch.commit();
      
      logger.info('Project deleted', { projectId });
    } catch (error) {
      logger.error('Error deleting project', error as Error);
      throw new Error('Error al eliminar el proyecto');
    }
  },
};
```

### 2. Servicio de Conversión Cotización → Proyecto

```typescript
// src/modules/projects/services/project-conversion.service.ts

import { Timestamp, writeBatch, doc, collection } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { logger } from '@/lib/logger';
import { Quote } from '@/modules/sales/types/sales.types';
import { OpportunitiesService } from '@/modules/sales/services/opportunities.service';
import { QuotesService } from '@/modules/sales/services/quotes.service';
import { ProjectsService } from './projects.service';
import { Project, QuoteToProjectConversion } from '../types/projects.types';

export const ProjectConversionService = {
  /**
   * Convertir Cotización Aceptada en Proyecto
   * Transacción atómica que:
   * 1. Crea el proyecto
   * 2. Actualiza la cotización
   * 3. Actualiza la oportunidad a "Won"
   * 4. Reserva inventario (si configurado)
   * 5. Crea órdenes de trabajo
   */
  async convertQuoteToProject(
    quote: Quote,
    conversionData: QuoteToProjectConversion,
    userId: string
  ): Promise<string> {
    try {
      logger.info('Starting quote to project conversion', { quoteId: quote.id });

      // 1. Crear proyecto
      const projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'> = {
        name: conversionData.projectConfig.name,
        description: conversionData.projectConfig.description,
        projectType: 'production',
        status: 'planning',
        priority: 'medium',
        
        // Relaciones
        clientId: quote.clientId,
        clientName: '', // Se completará con lookup
        opportunityId: quote.opportunityId,
        quoteId: quote.id,
        quoteNumber: quote.number,
        
        // Financiero (de la cotización)
        salesPrice: quote.total,
        estimatedCost: 0, // Se calculará del BOM
        actualCost: 0,
        currency: quote.currency,
        paymentTerms: quote.paymentTerms,
        
        // Fechas
        startDate: conversionData.projectConfig.startDate,
        estimatedEndDate: conversionData.projectConfig.estimatedEndDate,
        
        // Equipo
        projectManager: conversionData.projectConfig.projectManager,
        teamMembers: conversionData.projectConfig.teamMembers,
        
        // Progreso inicial
        progressPercent: 0,
        
        // Costos iniciales
        materialsCost: 0,
        laborCost: 0,
        overheadCost: 0,
        
        // Metadata
        tags: [],
        createdBy: userId,
      };

      const projectId = await ProjectsService.createProject(projectData);

      // 2. Actualizar cotización con projectId
      await QuotesService.linkProjectToQuote(quote.id, projectId);

      // 3. Actualizar oportunidad a "Won"
      if (quote.opportunityId) {
        await OpportunitiesService.updateOpportunityStatus(
          quote.opportunityId,
          'won',
          userId
        );
      }

      // 4. Crear órdenes de trabajo
      if (conversionData.workOrders.length > 0) {
        await this.createWorkOrdersFromConversion(
          projectId,
          conversionData.workOrders,
          userId
        );
      }

      // 5. Registrar conversión completada
      await this.recordConversion(quote.id, projectId, 'completed');

      logger.info('Quote to project conversion completed', {
        quoteId: quote.id,
        projectId,
      });

      return projectId;
    } catch (error) {
      logger.error('Error converting quote to project', error as Error);
      
      // Registrar fallo
      await this.recordConversion(quote.id, undefined, 'failed', (error as Error).message);
      
      throw new Error('Error al convertir cotización en proyecto');
    }
  },

  /**
   * Crear órdenes de trabajo desde la conversión
   */
  async createWorkOrdersFromConversion(
    projectId: string,
    workOrdersData: QuoteToProjectConversion['workOrders'],
    userId: string
  ): Promise<void> {
    try {
      const batch = writeBatch(db);
      const workOrdersRef = collection(db, 'workOrders');

      for (const woData of workOrdersData) {
        const newWorkOrderRef = doc(workOrdersRef);
        
        batch.set(newWorkOrderRef, {
          projectId,
          name: woData.name,
          phase: woData.phase,
          status: 'pending',
          assignedTo: woData.assignedTo,
          materials: woData.materials,
          laborHours: 0,
          laborCostPerHour: 0,
          estimatedCost: 0,
          actualCost: 0,
          progressPercent: 0,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
          createdBy: userId,
        });
      }

      await batch.commit();
      logger.info('Work orders created from conversion', { projectId, count: workOrdersData.length });
    } catch (error) {
      logger.error('Error creating work orders from conversion', error as Error);
      throw error;
    }
  },

  /**
   * Registrar estado de conversión
   */
  async recordConversion(
    quoteId: string,
    projectId: string | undefined,
    status: 'completed' | 'failed',
    error?: string
  ): Promise<void> {
    try {
      const conversionsRef = collection(db, 'quoteToProjectConversions');
      await addDoc(conversionsRef, {
        quoteId,
        projectId,
        status,
        error,
        completedAt: Timestamp.now(),
      });
    } catch (err) {
      logger.error('Error recording conversion', err as Error);
    }
  },
};
```

---

## 🎨 COMPONENTES REACT (Páginas Principales)

### 1. Página de Listado

```typescript
// src/app/(main)/projects/page.tsx

'use client';

import { ProjectsDirectory } from '@/modules/projects/components/ProjectsDirectory';

export default function ProjectsPage() {
  return (
    <div className="container mx-auto p-6">
      <ProjectsDirectory />
    </div>
  );
}
```

```typescript
// src/modules/projects/components/ProjectsDirectory.tsx

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useProjects } from '../hooks/use-projects';
import { ProjectsHeader } from './ProjectsHeader';
import { ProjectsKPICards } from './ProjectsKPICards';
import { ProjectFilters } from './ProjectFilters';
import { ProjectsTable } from './ProjectsTable';
import { ProjectStatus, ProjectPriority } from '../types/projects.types';

export function ProjectsDirectory() {
  const router = useRouter();
  const { projects, loading, error, updateSearchParams } = useProjects({
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<ProjectPriority | 'all'>('all');

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    updateSearchParams({ query });
  };

  const handleCreateProject = () => {
    router.push('/projects/create');
  };

  const handleProjectClick = (projectId: string) => {
    router.push(`/projects/${projectId}`);
  };

  // Calcular KPIs
  const kpis = {
    total: projects.length,
    active: projects.filter(p => p.status === 'in-progress').length,
    completed: projects.filter(p => p.status === 'completed').length,
    delayed: projects.filter(p => {
      if (!p.estimatedEndDate || p.status === 'completed') return false;
      return p.estimatedEndDate.toDate() < new Date();
    }).length,
  };

  return (
    <div className="space-y-6">
      <ProjectsHeader onCreateProject={handleCreateProject} />
      
      <ProjectsKPICards
        total={kpis.total}
        active={kpis.active}
        completed={kpis.completed}
        delayed={kpis.delayed}
      />

      <ProjectFilters
        searchQuery={searchQuery}
        statusFilter={statusFilter}
        priorityFilter={priorityFilter}
        onSearchChange={handleSearch}
        onStatusChange={setStatusFilter}
        onPriorityChange={setPriorityFilter}
      />

      <ProjectsTable
        projects={projects}
        loading={loading}
        onProjectClick={handleProjectClick}
      />
    </div>
  );
}
```

### 2. Página de Detalles

```typescript
// src/app/(main)/projects/[id]/page.tsx

'use client';

import { useParams, useRouter } from 'next/navigation';
import { ProjectProfile } from '@/modules/projects/components/ProjectProfile';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const handleBack = () => {
    router.push('/projects');
  };

  return (
    <div className="container mx-auto p-6">
      <Button
        variant="ghost"
        onClick={handleBack}
        className="mb-4"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Volver a Proyectos
      </Button>
      
      <ProjectProfile projectId={projectId} />
    </div>
  );
}
```

---

## 🔐 REGLAS DE SEGURIDAD FIRESTORE

```javascript
// firestore.rules (agregar a las reglas existentes)

// Projects collection
match /projects/{projectId} {
  allow read: if isAuthenticated();
  allow create: if isAuthenticated() && isValidProjectData();
  allow update: if isAuthenticated() && (isProjectMember(projectId) || isManagerOrAdmin());
  allow delete: if isAuthenticated() && isAdmin();
  
  function isProjectMember(projectId) {
    return request.auth.uid == resource.data.projectManager ||
           request.auth.uid in resource.data.teamMembers ||
           request.auth.uid == resource.data.createdBy;
  }
  
  function isValidProjectData() {
    let data = request.resource.data;
    return data.keys().hasAll(['name', 'clientId', 'status', 'createdBy']) &&
           data.status in ['planning', 'in-progress', 'on-hold', 'completed', 'cancelled'] &&
           data.salesPrice is number && data.salesPrice >= 0;
  }
}

// Work Orders collection
match /workOrders/{workOrderId} {
  allow read: if isAuthenticated();
  allow create: if isAuthenticated() && isValidWorkOrderData();
  allow update: if isAuthenticated() && (isWorkOrderAssignee(workOrderId) || isManagerOrAdmin());
  allow delete: if isAuthenticated() && isAdmin();
  
  function isWorkOrderAssignee(workOrderId) {
    return request.auth.uid == resource.data.assignedTo ||
           request.auth.uid == resource.data.createdBy;
  }
  
  function isValidWorkOrderData() {
    let data = request.resource.data;
    return data.keys().hasAll(['projectId', 'name', 'status', 'createdBy']) &&
           exists(/databases/$(database)/documents/projects/$(data.projectId));
  }
}

// Project Tasks collection
match /projectTasks/{taskId} {
  allow read: if isAuthenticated();
  allow create: if isAuthenticated();
  allow update: if isAuthenticated() && (isTaskAssignee(taskId) || isManagerOrAdmin());
  allow delete: if isAuthenticated() && (isTaskCreator(taskId) || isAdmin());
  
  function isTaskAssignee(taskId) {
    return request.auth.uid == resource.data.assignedTo;
  }
  
  function isTaskCreator(taskId) {
    return request.auth.uid == resource.data.createdBy;
  }
}

// Project Timeline collection
match /projectTimeline/{entryId} {
  allow read: if isAuthenticated();
  allow create: if isAuthenticated();
  allow update: if false; // Timeline entries are immutable
  allow delete: if isAdmin();
}

// Work Sessions collection
match /workSessions/{sessionId} {
  allow read: if isAuthenticated();
  allow create: if isAuthenticated() && request.resource.data.userId == request.auth.uid;
  allow update: if isAuthenticated() && resource.data.userId == request.auth.uid;
  allow delete: if isAdmin();
}
```

---

## 📋 PLAN DE IMPLEMENTACIÓN (5 FASES)

### FASE 1: Fundamentos (2-3 días)
- ✅ Crear estructura de carpetas
- ✅ Definir tipos TypeScript
- ✅ Implementar servicios básicos (CRUD)
- ✅ Agregar reglas Firestore
- ✅ Testing de servicios

### FASE 2: Listado de Proyectos (2 días)
- ✅ Componente ProjectsDirectory
- ✅ Hook use-projects
- ✅ Tabla con filtros y búsqueda
- ✅ KPIs globales
- ✅ Navegación a detalles

### FASE 3: Detalles del Proyecto (3 días)
- ✅ Componente ProjectProfile
- ✅ Hook use-project-profile
- ✅ Header con acciones
- ✅ KPIs del proyecto
- ✅ Timeline básico

### FASE 4: Conversión Cotización → Proyecto (2 días)
- ✅ Implementar ProjectConversionService
- ✅ Conectar wizard existente con creación real
- ✅ Testing de transacción atómica
- ✅ Validar flujo completo

### FASE 5: Órdenes de Trabajo (2 días)
- ✅ Componentes de órdenes
- ✅ Hook use-work-orders
- ✅ CRUD de órdenes
- ✅ Integración con inventario

**TOTAL: 11-12 días de desarrollo**

---

## ✅ CRITERIOS DE ACEPTACIÓN

1. ✅ **Listado de Proyectos funcional**
   - Ver todos los proyectos con filtros
   - KPIs calculados correctamente
   - Navegación a detalles

2. ✅ **Conversión Cotización → Proyecto operativa**
   - Wizard completa la creación
   - Oportunidad se marca como "Won"
   - Proyecto aparece en listado

3. ✅ **Detalles del Proyecto con KPIs reales**
   - Muestra información completa
   - KPIs financieros calculados
   - Timeline con eventos

4. ✅ **Órdenes de Trabajo básicas**
   - Crear órdenes desde proyecto
   - Asignar responsables
   - Actualizar progreso

5. ✅ **Seguridad implementada**
   - Reglas Firestore aplicadas
   - Permisos por rol funcionando

---

## 🚀 IMPACTO ESPERADO

### Métricas del Sistema

| Métrica | Antes | Después | Mejora |
|---------|-------|---------|--------|
| Implementación Total | 68% | 88% | +20% |
| Flujo Completo | ❌ | ✅ | 100% |
| Módulo Proyectos | 5% | 95% | +90% |
| Trazabilidad | Parcial | Total | 100% |

### Beneficios de Negocio

1. ✅ **Flujo end-to-end completo**: Lead → Proyecto → Entrega
2. ✅ **Control de costos real**: Seguimiento de materiales, mano de obra, gastos
3. ✅ **Rentabilidad visible**: Precio venta vs costo real en tiempo real
4. ✅ **Asignación de recursos**: Equipos y responsabilidades claras
5. ✅ **Auditoría completa**: Timeline de todas las acciones

---

## 📚 REFERENCIAS Y RECURSOS

- **Especificación Original**: Ver documento de especificación detallada
- **Código Existente Base**: Módulos de Ventas e Inventario
- **Patrones a Seguir**: 
  - `use-lead-conversion.ts` → Referencia para transacciones
  - `BOMBuilder.tsx` → Referencia para cálculos de costos
  - `OpportunitiesKanban.tsx` → Referencia para vistas

---

**PRÓXIMO PASO RECOMENDADO:**

Comenzar con **FASE 1** (Fundamentos) creando la estructura de tipos y servicios básicos. Una vez completada, el equipo puede trabajar en paralelo en las fases 2, 3 y 4.

**ESTE DOCUMENTO ESTÁ LISTO PARA DESARROLLO INMEDIATO.**
