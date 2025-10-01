# Sales Module

## Descripción
Módulo de ventas para ZADIA OS que maneja leads, oportunidades, cotizaciones y análisis de rendimiento comercial.

## Estructura del Módulo

```
sales/
├── components/          # Componentes React para UI de ventas
│   ├── dashboard/      # Dashboard ejecutivo y métricas
│   ├── leads/          # Gestión de leads y prospección
│   ├── opportunities/  # Pipeline de oportunidades
│   ├── quotes/         # Sistema de cotizaciones
│   └── analytics/      # Reportes y análisis
├── hooks/              # React hooks personalizados
├── services/           # Servicios de datos (Firebase)
├── types/              # Definiciones de tipos TypeScript
├── validations/        # Esquemas de validación Zod
├── utils/              # Utilidades y helpers
├── docs/              # Documentación adicional
└── index.ts           # Punto de entrada del módulo
```

## Reglas de Cumplimiento ZADIA OS

✅ **Regla 1: Datos Reales** - Integración completa con Firebase/Firestore, sin mocks  
✅ **Regla 2: UI Estandarizado** - Uso exclusivo de ShadCN UI + Lucide Icons  
✅ **Regla 3: Validación Estricta** - Todos los datos validados con Zod  
✅ **Regla 4: Arquitectura Modular** - Separación clara de responsabilidades  
✅ **Regla 5: Límites de Archivo** - Máximo 200 líneas por archivo (refactorizado)  

## Servicios Principales

### Leads
- `LeadsService` - Servicio principal (composición)
- `LeadsCrudService` - Operaciones CRUD básicas
- `LeadsActionsService` - Acciones de negocio (conversión, scoring)

### Oportunidades
- `OpportunitiesService` - Gestión del pipeline de ventas

### Cotizaciones
- `QuotesService` - Generación y seguimiento de cotizaciones

### Analytics
- `AnalyticsService` - Métricas y reportes de ventas

## Hooks Disponibles

- `useLeads()` - Gestión de estado de leads
- `useOpportunities()` - Gestión de oportunidades
- `useQuotes()` - Gestión de cotizaciones
- `useSalesAnalytics()` - Métricas y análisis

## Tipos Principales

```typescript
interface Lead {
  id: string;
  entityType: 'person' | 'company' | 'institution';
  fullName?: string;
  entityName?: string;
  email: string;
  phone: string;
  status: LeadStatus;
  priority: LeadPriority;
  source: LeadSource;
  score: number;
  assignedTo: string;
  // ... más campos
}
```

## Uso del Módulo

```typescript
import { 
  LeadsService, 
  useLeads, 
  CreateLeadDialog 
} from '@/modules/sales';

// En un componente
const { leads, createLead, loading } = useLeads();

// Crear un lead
await createLead(leadData, userId);
```

## Integración con Firebase

Todas las operaciones utilizan Firestore con las siguientes colecciones:
- `leads` - Información de leads
- `lead-interactions` - Interacciones con leads
- `opportunities` - Pipeline de oportunidades
- `quotes` - Cotizaciones generadas

## Validaciones

Esquemas Zod para garantizar integridad de datos:
- `createLeadSchema` - Validación para crear leads
- `leadSchema` - Esquema completo de lead
- `opportunitySchema` - Validación de oportunidades
- `quoteSchema` - Validación de cotizaciones

## Estado del Módulo

✅ **Funcional** - Módulo completamente operativo  
✅ **Refactorizado** - Cumple con límites de líneas por archivo  
✅ **Testeable** - Arquitectura modular facilita testing  
✅ **Escalable** - Estructura preparada para crecimiento  

## Próximas Mejoras

- [ ] Integración completa con módulo de clientes
- [ ] Sistema de notificaciones automáticas
- [ ] Reportes avanzados con gráficos
- [ ] Automatización de follow-ups
- [ ] Integración con herramientas externas (email, CRM)