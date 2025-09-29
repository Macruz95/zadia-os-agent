# 💰 Módulo de Ventas - ZADIA OS

## Descripción
Módulo completo para gestión del proceso de ventas, desde leads hasta proyectos completados. Incluye gestión de oportunidades, cotizaciones, y análisis de rendimiento.

## 🏗️ Estructura

```
src/modules/sales/
├── components/           # Componentes React
│   ├── analytics/       # Componentes de análisis
│   ├── dashboard/       # Dashboard ejecutivo
│   ├── leads/           # Gestión de leads
│   ├── opportunities/   # Gestión de oportunidades
│   ├── projects/        # Gestión de proyectos
│   ├── quotes/          # Gestión de cotizaciones
│   └── SalesNavigation.tsx
├── docs/                # Documentación
│   ├── README.md        # Este archivo
│   ├── API.md           # Documentación de servicios
│   └── examples.md      # Ejemplos de uso
├── hooks/               # Custom hooks
│   ├── index.ts         # Exports
│   └── use-leads.ts     # Hook principal
├── services/            # Servicios de negocio
│   ├── entities/        # Servicios por entidad
│   └── index.ts         # Exports
├── types/               # Definiciones de tipos
│   └── sales.types.ts   # Tipos principales
├── utils/               # Utilidades
│   ├── index.ts         # Exports
│   └── sales.utils.ts   # Utilidades principales
├── validations/         # Esquemas Zod
│   └── sales.schema.ts  # Validaciones
└── index.ts            # Punto de entrada
```

## 🎯 Funcionalidades Principales

### **1. Gestión de Leads**
- ✅ Creación y edición de leads
- ✅ Clasificación por fuente y prioridad
- ✅ Conversión a oportunidades
- ✅ Seguimiento de estado

### **2. Oportunidades de Venta**
- ✅ Pipeline visual (Kanban)
- ✅ Gestión por etapas
- ✅ Estimación de valores
- ✅ Fechas de cierre proyectadas

### **3. Cotizaciones**
- ✅ Generación automática de números
- ✅ Plantillas personalizables
- ✅ Seguimiento de estado
- ✅ Vencimientos y recordatorios

### **4. Proyectos**
- ✅ Gestión de proyectos activos
- ✅ Seguimiento de progreso
- ✅ Asignación de recursos
- ✅ Control de tiempo y presupuesto

### **5. Analytics y Reportes**
- ✅ Dashboard ejecutivo
- ✅ Métricas de rendimiento
- ✅ Análisis de conversión
- ✅ Reportes personalizados

## 🚀 Uso Básico

```typescript
import { 
  useLeads, 
  LeadsService, 
  Lead, 
  LeadFormData 
} from '@/modules/sales';

function LeadsPage() {
  const {
    leads,
    loading,
    error,
    searchLeads,
    createLead,
    updateLead,
    deleteLead
  } = useLeads();

  // Cargar leads al montar componente
  useEffect(() => {
    searchLeads();
  }, [searchLeads]);

  // Crear nuevo lead
  const handleCreate = async (data: LeadFormData) => {
    try {
      await createLead(data);
      toast.success('Lead creado exitosamente');
    } catch (error) {
      toast.error('Error al crear lead');
    }
  };

  return (
    <div>
      <LeadsDirectory 
        title="Gestión de Leads"
        description="Administra y convierte leads en oportunidades"
      />
    </div>
  );
}
```

## 📊 Métricas Clave

- **Conversión Lead → Oportunidad**: Porcentaje de leads convertidos
- **Valor Pipeline**: Suma ponderada de oportunidades activas
- **Tiempo Promedio de Cierre**: Días promedio para cerrar oportunidades
- **Tasa de Ganancia**: Porcentaje de oportunidades ganadas
- **Productividad por Usuario**: Métricas individuales de rendimiento

## 🔧 Configuración

### Variables de Entorno
```bash
# Configuración de ventas
SALES_DEFAULT_CURRENCY=COP
SALES_MAX_OPPORTUNITY_VALUE=10000000000
SALES_QUOTE_VALIDITY_DAYS=30
```

### Colecciones Firebase
- `sales_leads` - Información de leads
- `sales_opportunities` - Oportunidades de venta
- `sales_quotes` - Cotizaciones generadas
- `sales_projects` - Proyectos activos
- `sales_targets` - Metas de usuarios

## 🎨 Componentes Disponibles

### Páginas Principales
- `SalesNavigation` - Navegación interna del módulo
- `LeadsDirectory` - Gestión completa de leads
- `OpportunitiesKanban` - Pipeline visual
- `QuotesDirectory` - Gestión de cotizaciones
- `ProjectsDirectory` - Gestión de proyectos
- `SalesAnalytics` - Dashboard de análisis

### Formularios
- `CreateLeadDialog` - Formulario de creación de leads
- `OpportunityForm` - Formulario de oportunidades
- `QuoteForm` - Formulario de cotizaciones
- `ProjectForm` - Formulario de proyectos

## 🔗 Integraciones

- **Módulo Clients**: Conversión automática de leads a clientes
- **Módulo Inventory**: Consulta de productos para cotizaciones
- **Sistema de Notificaciones**: Alertas de vencimientos y recordatorios
- **Analytics**: Métricas integradas con dashboard principal

## 📈 Roadmap

- [ ] Automatización de flujos de trabajo
- [ ] Integración con email marketing
- [ ] Predicciones con IA
- [ ] Mobile app para vendedores
- [ ] Integración con CRM externos

## 🤝 Contribución

Para contribuir al módulo de ventas:

1. Seguir las convenciones de código establecidas
2. Mantener cobertura de tests > 80%
3. Documentar nuevas funcionalidades
4. Validar con el equipo de ventas

Ver `DEVELOPMENT_GUIDE.md` para más detalles.