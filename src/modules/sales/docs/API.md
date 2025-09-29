# 📡 API Documentation - Sales Module

## Servicios Principales

### LeadsService

#### `createLead(data: LeadFormData, createdBy: string): Promise<Lead>`
Crea un nuevo lead en la base de datos.

**Parámetros:**
- `data`: Datos del formulario validados con `LeadFormSchema`
- `createdBy`: ID del usuario que crea el lead

**Retorna:** Promise con el lead creado

**Ejemplo:**
```typescript
const newLead = await LeadsService.createLead({
  entityType: 'individual',
  name: 'Juan Pérez',
  email: 'juan@example.com',
  phone: '+57 300 123 4567',
  source: 'website',
  priority: 'medium'
}, 'user-123');
```

#### `getLeadById(id: string): Promise<Lead | null>`
Obtiene un lead por su ID.

#### `searchLeads(filters?: LeadFilters): Promise<LeadSearchResult>`
Busca leads con filtros opcionales.

**Filtros disponibles:**
```typescript
interface LeadFilters {
  status?: LeadStatus[];
  source?: LeadSource[];
  priority?: LeadPriority[];
  entityType?: EntityType[];
  assignedTo?: string;
  createdFrom?: Date;
  createdTo?: Date;
}
```

#### `updateLead(id: string, data: Partial<LeadFormData>): Promise<void>`
Actualiza un lead existente.

#### `deleteLead(id: string): Promise<void>`
Elimina un lead de la base de datos.

#### `convertToOpportunity(leadId: string, conversionData: LeadConversionData): Promise<{client: Client, opportunity: Opportunity}>`
Convierte un lead en cliente y oportunidad.

---

### OpportunitiesService

#### `createOpportunity(data: OpportunityFormData, createdBy: string): Promise<Opportunity>`
Crea una nueva oportunidad.

#### `updateOpportunityStage(id: string, stage: OpportunityStage): Promise<void>`
Actualiza la etapa de una oportunidad.

#### `getOpportunitiesByStage(stage: OpportunityStage): Promise<Opportunity[]>`
Obtiene oportunidades filtradas por etapa.

#### `calculatePipelineValue(opportunities: Opportunity[]): Promise<number>`
Calcula el valor total del pipeline.

---

### QuotesService

#### `createQuote(data: QuoteFormData, createdBy: string): Promise<Quote>`
Crea una nueva cotización.

#### `generateQuoteNumber(): Promise<string>`
Genera el siguiente número de cotización disponible.

#### `sendQuote(quoteId: string, recipientEmail: string): Promise<void>`
Envía una cotización por email.

#### `updateQuoteStatus(id: string, status: QuoteStatus): Promise<void>`
Actualiza el estado de una cotización.

---

### ProjectsService

#### `createProject(data: ProjectFormData, createdBy: string): Promise<Project>`
Crea un nuevo proyecto.

#### `updateProjectProgress(id: string, progress: number): Promise<void>`
Actualiza el progreso de un proyecto.

#### `getActiveProjects(assignedTo?: string): Promise<Project[]>`
Obtiene proyectos activos, opcionalmente filtrados por usuario asignado.

---

### AnalyticsService

#### `getSalesMetrics(dateRange: DateRange): Promise<SalesMetrics>`
Obtiene métricas de ventas para un período específico.

**Métricas incluidas:**
```typescript
interface SalesMetrics {
  totalLeads: number;
  conversionRate: number;
  pipelineValue: number;
  closedDeals: number;
  averageDealValue: number;
  salesCycle: number; // días promedio
}
```

#### `getUserPerformance(userId: string, period: string): Promise<UserPerformance>`
Obtiene métricas de rendimiento de un usuario específico.

#### `getFunnelData(dateRange: DateRange): Promise<FunnelData[]>`
Obtiene datos para el embudo de ventas.

---

### UsersTargetsService

#### `createTarget(data: TargetFormData): Promise<Target>`
Crea una nueva meta para un usuario.

#### `getUserTargets(userId: string, period: string): Promise<Target[]>`
Obtiene las metas de un usuario para un período.

#### `updateTargetProgress(targetId: string, currentValue: number): Promise<void>`
Actualiza el progreso de una meta.

#### `calculateUserPerformance(userId: string, period: string): Promise<UserPerformance>`
Calcula el rendimiento completo de un usuario.

## Hooks Disponibles

### useLeads()

```typescript
interface UseLeadsReturn {
  leads: Lead[];
  loading: boolean;
  error?: string;
  totalCount: number;
  searchLeads: (filters?: LeadFilters, reset?: boolean) => Promise<void>;
  createLead: (data: LeadFormData) => Promise<Lead>;
  updateLead: (id: string, data: Partial<LeadFormData>) => Promise<void>;
  deleteLead: (id: string) => Promise<void>;
  convertLead: (id: string, conversionData: LeadConversionData) => Promise<void>;
  refresh: () => Promise<void>;
}
```

### useOpportunities()

```typescript
interface UseOpportunitiesReturn {
  opportunities: Opportunity[];
  loading: boolean;
  error?: string;
  getOpportunitiesByStage: (stage: OpportunityStage) => Opportunity[];
  createOpportunity: (data: OpportunityFormData) => Promise<Opportunity>;
  updateOpportunity: (id: string, data: Partial<OpportunityFormData>) => Promise<void>;
  moveOpportunity: (id: string, newStage: OpportunityStage) => Promise<void>;
  deleteOpportunity: (id: string) => Promise<void>;
  pipelineValue: number;
  refresh: () => Promise<void>;
}
```

### useQuotes()

```typescript
interface UseQuotesReturn {
  quotes: Quote[];
  loading: boolean;
  error?: string;
  createQuote: (data: QuoteFormData) => Promise<Quote>;
  updateQuote: (id: string, data: Partial<QuoteFormData>) => Promise<void>;
  sendQuote: (id: string, email: string) => Promise<void>;
  updateStatus: (id: string, status: QuoteStatus) => Promise<void>;
  deleteQuote: (id: string) => Promise<void>;
  refresh: () => Promise<void>;
}
```

### useProjects()

```typescript
interface UseProjectsReturn {
  projects: Project[];
  loading: boolean;
  error?: string;
  createProject: (data: ProjectFormData) => Promise<Project>;
  updateProject: (id: string, data: Partial<ProjectFormData>) => Promise<void>;
  updateProgress: (id: string, progress: number) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  getActiveProjects: () => Project[];
  refresh: () => Promise<void>;
}
```

### useSalesAnalytics()

```typescript
interface UseSalesAnalyticsReturn {
  metrics: SalesMetrics | null;
  funnelData: FunnelData[];
  userPerformance: UserPerformance[];
  loading: boolean;
  error?: string;
  loadMetrics: (dateRange: DateRange) => Promise<void>;
  loadFunnelData: (dateRange: DateRange) => Promise<void>;
  loadUserPerformance: (userIds: string[], period: string) => Promise<void>;
  refresh: () => Promise<void>;
}
```

## Tipos de Datos

### Enums Principales

```typescript
// Estados de leads
export const LeadStatusEnum = z.enum([
  'new', 'contacted', 'qualified', 'unqualified', 'converted'
]);

// Etapas de oportunidades
export const OpportunityStageEnum = z.enum([
  'prospecting', 'qualification', 'proposal', 'negotiation', 
  'closed-won', 'closed-lost'
]);

// Estados de cotizaciones
export const QuoteStatusEnum = z.enum([
  'draft', 'sent', 'viewed', 'accepted', 'rejected', 'expired'
]);

// Estados de proyectos
export const ProjectStatusEnum = z.enum([
  'planning', 'in-progress', 'on-hold', 'completed', 'cancelled'
]);
```

### Interfaces Principales

```typescript
interface Lead {
  id: string;
  entityType: EntityType;
  name: string;
  email: string;
  phone: string;
  company?: string;
  position?: string;
  source: LeadSource;
  priority: LeadPriority;
  status: LeadStatus;
  assignedTo?: string;
  notes?: string;
  tags: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;
}

interface Opportunity {
  id: string;
  clientId: string;
  name: string;
  description?: string;
  stage: OpportunityStage;
  estimatedValue: number;
  probability: number;
  expectedCloseDate?: Timestamp;
  actualCloseDate?: Timestamp;
  assignedTo: string;
  products: OpportunityProduct[];
  activities: Activity[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;
}
```

## Códigos de Error

- `SALES_001`: Lead no encontrado
- `SALES_002`: Oportunidad no encontrada
- `SALES_003`: Cotización no encontrada
- `SALES_004`: Proyecto no encontrado
- `SALES_005`: Error de validación de datos
- `SALES_006`: Usuario sin permisos
- `SALES_007`: Estado de transición inválido
- `SALES_008`: Valor de oportunidad inválido
- `SALES_009`: Email de cotización falló
- `SALES_010`: Meta no encontrada

## Rate Limits

- Creación de leads: 100 por hora
- Envío de cotizaciones: 50 por día
- Consultas de análisis: 1000 por hora
- Actualizaciones masivas: 500 por hora