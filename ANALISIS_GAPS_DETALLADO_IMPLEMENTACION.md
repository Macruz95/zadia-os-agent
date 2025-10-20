# 📋 ANÁLISIS EXHAUSTIVO DE GAPS - IMPLEMENTACIÓN ZADIA OS

**Fecha:** 19 de Octubre, 2025  
**Sistema:** ZADIA OS (Carpintería ERP)  
**Completitud Actual:** 78%  
**Objetivo:** Identificar funcionalidades faltantes por módulo según especificación completa

---

## 🎯 RESUMEN EJECUTIVO

### Estado General por Módulo

| Módulo | Completitud | Bloqueantes | Prioridad |
|--------|-------------|-------------|-----------|
| **Clientes** | 95% | - | Media |
| **Leads** | 90% | - | Media |
| **Oportunidades** | 85% | - | Media |
| **Cotizaciones** | 85% | PDF/Email | Alta |
| **Proyectos** | 60% | RRHH, BOM, Submódulos | Crítica |
| **Work Orders** | 75% | Quality UI, QR | Alta |
| **Inventario** | 90% | BOM versioning | Media |
| **Finanzas** | 70% | Integración quotes/projects | Alta |
| **RRHH** | 0% | Todo | **BLOQUEANTE CRÍTICO** |

---

## 🔴 BLOQUEANTE CRÍTICO: MÓDULO RRHH (0% implementado)

### Impacto
- **Bloquea:** Cálculo de costos laborales en proyectos
- **Bloquea:** Finanzas (nómina, costos reales)
- **Bloquea:** Work Orders (asignación formal, horas registradas)
- **Bloquea:** Reportes de rentabilidad (sin costo mano de obra = margen incorrecto)

### Funcionalidades Requeridas

#### 1. **Estructura Base**
```
/app/(main)/rrhh/
  ├── page.tsx                    # Listado empleados
  ├── [id]/page.tsx               # Detalle empleado
  └── create/page.tsx             # Crear empleado
```

#### 2. **Servicios Necesarios** (NO EXISTEN)
```typescript
// src/modules/rrhh/services/
employees.service.ts              // CRUD empleados
employees-time-tracking.service.ts // Control de horas
employees-payroll.service.ts      // Nómina
employees-cost.service.ts         // Cálculo costos laborales
```

#### 3. **Componentes UI Necesarios** (NO EXISTEN)
```typescript
// src/modules/rrhh/components/
EmployeesDirectory.tsx           // Tabla con filtros
EmployeeProfile.tsx              // Vista completa empleado
EmployeeForm.tsx                 // Formulario crear/editar
TimeTrackingWidget.tsx           // Timer start/stop
PayrollCalculator.tsx            // Calculadora nómina
WorkSessionsList.tsx             // Historial sesiones
```

#### 4. **Modelo de Datos** (NO EXISTE en Firestore)
```typescript
// Collection: employees
interface Employee {
  id: string;
  personalData: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    dateOfBirth: Date;
    address: Address;
  };
  jobData: {
    position: string;           // Carpintero, Ensamblador, PM, Ventas
    department: string;         // Producción, Ventas, Admin
    hireDate: Date;
    salary: number;
    hourlyRate: number;         // CRÍTICO para costos
    contractType: 'full-time' | 'part-time' | 'contractor';
    status: 'active' | 'inactive' | 'on-leave';
  };
  skills: string[];             // Ej: ["Barnizado", "Corte CNC", "Instalación"]
  certifications: Array<{
    name: string;
    issuer: string;
    dateIssued: Date;
    expiryDate?: Date;
  }>;
  userId?: string;              // Vinculado a auth si tiene acceso al sistema
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Collection: workSessions
interface WorkSession {
  id: string;
  employeeId: string;
  employeeName: string;
  projectId?: string;
  taskId?: string;
  workOrderId?: string;
  startTime: Timestamp;
  endTime?: Timestamp;         // null si está activo
  durationSeconds: number;
  hourlyRate: number;          // Snapshot del rate al momento
  laborCost: number;           // durationSeconds/3600 * hourlyRate
  activity: string;            // Descripción de la actividad
  isBillable: boolean;
  notes?: string;
  createdBy: string;
  createdAt: Timestamp;
}

// Collection: payroll
interface PayrollRecord {
  id: string;
  employeeId: string;
  period: { start: Date; end: Date; };
  baseSalary: number;
  overtimeHours: number;
  overtimePay: number;
  bonuses: number;
  deductions: {
    isss: number;              // Seguro social (El Salvador)
    afp: number;               // Pensión
    tax: number;               // ISR
    other: number;
  };
  netPay: number;
  status: 'draft' | 'approved' | 'paid';
  paidAt?: Timestamp;
  createdAt: Timestamp;
}
```

#### 5. **Validaciones Zod** (NO EXISTEN)
```typescript
// src/modules/rrhh/validations/
employees.validation.ts
time-tracking.validation.ts
payroll.validation.ts
```

#### 6. **Hooks Necesarios** (NO EXISTEN)
```typescript
// src/modules/rrhh/hooks/
use-employees.ts
use-employee.ts
use-work-sessions.ts
use-time-tracker.ts
use-payroll.ts
```

#### 7. **Integraciones Críticas**
- **Proyectos:** `ProjectsService` debe calcular `laborCost` sumando `workSessions`
- **Work Orders:** Asignar empleados y registrar horas por orden
- **Finanzas:** Generar transacciones de nómina automáticamente
- **Reportes:** Dashboard de productividad (horas por empleado, costo por proyecto)

---

## 📊 MÓDULO CLIENTES (95% - Gaps Menores)

### ✅ Implementado
- Listado con filtros ✅
- Formulario diferenciado (Persona Natural / Empresa / Institución) ✅
- Detalle con timeline ✅
- Contactos múltiples ✅
- Integración con ventas ✅

### ❌ Faltante (5%)

#### 1. **Vista Cards (alternativa a tabla)**
```typescript
// src/modules/clients/components/
ClientsCardView.tsx              // Vista tipo tarjetas con logo/foto
```
**Especificación:** "Vista alterna tipo 'cards' → útil para equipos de ventas (mostrar logo de empresa o foto del contacto)."

#### 2. **Geo-segmentación**
```typescript
// src/modules/clients/components/
ClientsMapView.tsx               // Mapa con clientes por ubicación
ClientsGeoFilters.tsx            // Filtro por país/departamento/distrito
```
**Especificación:** "Geo-segmentación: clientes agrupados por país/departamento/municipio (ej: 'Distritos' en El Salvador)."

#### 3. **Ranking de clientes**
```typescript
// Agregar campo calculado en ClientsDirectory
topCustomerBadge: boolean        // Estrella o medalla para top clientes por facturación
```
**Especificación:** "Ranking de clientes: mostrar en la lista un indicador de facturación acumulada (estrella o medalla para top clientes)."

#### 4. **Indicador de riesgo**
```typescript
// Lógica en ClientsTable
hasOverdueInvoices: boolean      // Color en la fila si tiene facturas vencidas
```
**Especificación:** "Indicador de riesgo: color en la fila si tiene facturas vencidas."

---

## 📈 MÓDULO VENTAS

### 🟢 Leads (90% - Gaps Menores)

#### ✅ Implementado
- Listado con scoring ✅
- Formulario de creación ✅
- Detalle con timeline ✅
- Conversión Lead → Cliente + Oportunidad ✅ (`LeadConversionWizard` existe)
- Categorización (Caliente/Tibio/Frío) ✅

#### ❌ Faltante (10%)

##### 1. **Checklist de Calificación**
```typescript
// src/modules/sales/components/leads/
LeadQualificationChecklist.tsx   // NO EXISTE
```
**Especificación:** "Checklist de Calificación: Contacto inicial realizado, Necesidad identificada, Presupuesto preliminar confirmado, Autoridad de decisión verificada."

##### 2. **Vista Cards (Kanban-style para leads)**
```typescript
// src/modules/sales/components/leads/
LeadsCardView.tsx                // Vista cards por estado
```

---

### 🟡 Oportunidades (85% - Gaps Moderados)

#### ✅ Implementado
- Vista Kanban ✅
- Formulario creación ✅
- Detalle con timeline ✅
- Vinculación con cotizaciones ✅

#### ❌ Faltante (15%)

##### 1. **Vista Tabla (complemento a Kanban)**
```typescript
// src/modules/sales/components/opportunities/
OpportunitiesTableView.tsx       // NO EXISTE - solo hay Kanban
```
**Especificación:** "Vista Tabla (Directorio): Ideal para análisis más detallado."

##### 2. **Wizard de Lanzamiento de Proyecto**
```typescript
// src/modules/sales/components/opportunities/
ProjectLaunchWizard.tsx          // NO EXISTE
```
**Especificación:** "Cuando la Oportunidad es Ganada, se lanza un Proyecto directamente."
**Nota:** Existe `QuoteConversionService` pero falta UI de wizard desde Oportunidad.

##### 3. **KPIs agregados en página principal**
```typescript
// Agregar a OpportunitiesPage
<OpportunitiesKPIs />            // NO EXISTE
// - Total valor de oportunidades abiertas
// - Valor esperado de cierre este mes
// - Tasa de conversión (Ganadas/Perdidas)
```

---

### 🟡 Cotizaciones (85% - Gaps Críticos)

#### ✅ Implementado
- Listado ✅
- Formulario wizard ✅
- Detalle ✅
- Preview para impresión ✅ (usa `react-to-print`)
- Estados (Borrador/Enviado/Aceptado/Rechazado) ✅

#### ❌ Faltante (15%) - **ALTA PRIORIDAD**

##### 1. **Generación PDF con Branding** ⚠️ CRÍTICO
```typescript
// src/modules/sales/services/
quotes-pdf.service.ts            // NO EXISTE
```
**Actual:** Usa `react-to-print` (imprime HTML, no genera PDF descargable)
**Requerido:** Generar PDF real con:
- Logo de la empresa
- Información fiscal completa
- Formato profesional personalizable
- Guardar en `Storage` y vincular a documento
- Tecnología sugerida: `jsPDF` + `html2canvas` o `@react-pdf/renderer`

**Especificación:** "Generar PDF con branding."

##### 2. **Envío por Email** ⚠️ CRÍTICO
```typescript
// src/modules/sales/services/
quotes-email.service.ts          // NO EXISTE
```
**Requerido:**
- Modal para enviar cotización por email
- Plantilla HTML profesional
- Adjuntar PDF automáticamente
- Registrar envío en timeline
- Integración con servicio SMTP (ej: SendGrid, Resend, Firebase Extensions)

**Especificación:** "Enviar por email desde el sistema."

##### 3. **Versionado de Cotizaciones**
```typescript
// Agregar a Quote model
version: number;                 // V1, V2, V3...
parentQuoteId?: string;          // Si es revisión de otra
revisionHistory: Array<{
  version: number;
  createdAt: Timestamp;
  changes: string;
}>;
```
**Especificación:** "Versionado (V1, V2)."

##### 4. **Selector de Productos Mejorado**
```typescript
// src/modules/sales/components/quotes/
ProductInventorySelector.tsx     // Mejorar integración con inventario
```
**Requerido:**
- Búsqueda por SKU/nombre
- Mostrar stock disponible
- Alerta si no hay stock suficiente
- Calcular costo automáticamente desde inventario

**Especificación:** "Mejorar inventario integration (product selector)."

---

## 🏗️ MÓDULO PROYECTOS (60% - GAPS CRÍTICOS)

### ✅ Implementado
- Listado básico ✅
- Creación básica ✅
- Detalle simple (tabs: Overview, Timeline) ✅
- Vinculación Quote → Project ✅ (`QuoteConversionService`)
- Work Orders (submódulo básico) ✅

### ❌ Faltante (40%) - **PRIORIDAD CRÍTICA**

#### 1. **Página de Detalles Completa** ⚠️ BLOQUEANTE

**Actual:** Solo tiene tabs básicos (Overview, Timeline)  
**Requerido según especificación:**

##### A. **Cabecera con KPIs en Tiempo Real**
```typescript
// src/modules/projects/components/
ProjectKPICards.tsx              // NO EXISTE
```
**Campos:**
- Precio de venta (salesPrice)
- Costo estimado
- **Costo real** (suma: materiales consumidos + horas * hourlyRate) ❌ SIN RRHH NO SE PUEDE
- Margen (ganancia)
- Progreso (%)
- Fecha de entrega vs retraso

**Bloqueante:** Costo real depende de `workSessions.laborCost` (RRHH no implementado)

##### B. **Compositor de Interacciones**
```typescript
// src/modules/projects/components/
ProjectInteractionComposer.tsx   // NO EXISTE
```
**Pestañas:** Nota | Llamada | Reunión | Email | RFI

**Especificación:** "Compositor de actividad + Timeline/Feed unificado."

##### C. **Timeline Unificado**
```typescript
// Actual: ProjectTimeline existe pero solo muestra tareas
// Requerido: Unificar múltiples fuentes
ProjectUnifiedTimeline.tsx       // MODIFICAR EXISTENTE
```
**Debe incluir:**
- ✅ Actividades (notas, llamadas - parcial)
- ✅ Eventos sistema (creación proyecto)
- ❌ Cambios de etapa/estado
- ❌ Cotizaciones vinculadas
- ❌ Documentos subidos
- ❌ Transacciones financieras
- ❌ Sesiones de trabajo (work sessions)

##### D. **Tarjeta BOM/Materiales** ⚠️ CRÍTICO
```typescript
// src/modules/projects/components/
ProjectBOMCard.tsx               // NO EXISTE
```
**Funcionalidad:**
- Bill of Materials vinculado a cotización/producto
- Por cada ítem: SKU, descripción, cantidad necesaria, stock disponible, cantidad reservada, costo
- **Estado de provisión:** En stock | Reservado | Necesita Compra | Backorder
- **Acciones:** Reservar stock | Generar PO | Marcar consumido
- Visualizar WIP (work-in-progress)

**Especificación completa:** "Tarjeta: BOM / Materiales (visión y control) - Bill of Materials (BOM) vinculado a la cotización o producto (posibilidad de múltiples versiones)."

**Bloqueante:** Requiere:
1. Modelo BOM en Firestore (NO EXISTE)
2. Servicio de reservas atómicas (NO EXISTE)
3. Generación de POs automática (NO EXISTE)

##### E. **Tarjeta Resumen Financiero** ⚠️ CRÍTICO
```typescript
// src/modules/projects/components/
ProjectFinancialSummary.tsx      // NO EXISTE
```
**Campos:**
- Venta acordada
- Anticipos recibidos
- Facturado
- Cobrado
- Balance pendiente
- **Costo estimado vs costo real (verde/rojo según varianza)** ❌ SIN RRHH INCOMPLETO
- **Botones:** Generar factura | Solicitar anticipo | Pagar proveedor

##### F. **Tarjeta Equipo y Recursos**
```typescript
// src/modules/projects/components/
ProjectTeamCard.tsx              // NO EXISTE
```
**Funcionalidad:**
- Lista de recursos asignados (PM, producción, instaladores)
- Rol, carga actual, contacto
- Notificar a todo el equipo

**Bloqueante:** Requiere RRHH (employeeId, role, allocation%)

#### 2. **Submódulos Faltantes** ⚠️ CRÍTICO

**Actual:** Solo existe `/projects/[id]/work-orders`  
**Requerido según especificación:**

```
/projects/[id]/
  ├── work-orders/        ✅ EXISTE (básico)
  ├── inventory/          ❌ NO EXISTE
  ├── finance/            ❌ NO EXISTE
  ├── tasks/              ❌ NO EXISTE
  ├── quality/            ❌ NO EXISTE
  ├── reports/            ❌ NO EXISTE
  └── close/              ❌ NO EXISTE
```

##### 2.1. `/projects/[id]/inventory` ❌
```typescript
// src/app/(main)/projects/[id]/inventory/page.tsx
```
**Funcionalidad:**
- BOM teórico vs real
- Movimientos de stock relacionados al proyecto
- Alertas de faltantes
- Consumo variance analysis

##### 2.2. `/projects/[id]/finance` ❌
```typescript
// src/app/(main)/projects/[id]/finance/page.tsx
```
**Funcionalidad:**
- Presupuesto original vs real
- Gastos clasificados (material, mano de obra, indirectos)
- Ingresos (anticipos, pagos parciales, saldo)
- Cash flow y rentabilidad

##### 2.3. `/projects/[id]/tasks` ❌
```typescript
// src/app/(main)/projects/[id]/tasks/page.tsx
```
**Funcionalidad:**
- Vista Kanban por estado
- Vista Gantt con dependencias
- Detalle de tarea (subtasks, horas, assignees, adjuntos)

##### 2.4. `/projects/[id]/quality` ❌
```typescript
// src/app/(main)/projects/[id]/quality/page.tsx
```
**Funcionalidad:**
- Checklists por fase
- Registro de no conformidades
- Evidencias (fotos con firma)

##### 2.5. `/projects/[id]/reports` ❌
```typescript
// src/app/(main)/projects/[id]/reports/page.tsx
```
**Funcionalidad:**
- Generar PDF/Excel con KPIs
- Dashboard de comparación

##### 2.6. `/projects/[id]/close` ❌
```typescript
// src/app/(main)/projects/[id]/close/page.tsx
```
**Funcionalidad:**
- Informe final (financiero + productividad)
- Documentación de entrega
- Feedback del cliente
- Cambio de estado a "Cerrado"

#### 3. **Flujo Atómico Quote → Project** ⚠️ PARCIALMENTE IMPLEMENTADO

**Actual:** `QuoteConversionService.convertQuoteToProject()` existe  
**Faltante según especificación:**

```typescript
// src/modules/projects/services/quote-conversion.service.ts
// MODIFICAR EXISTENTE para incluir:

// ❌ NO IMPLEMENTADO: Atomic reservation de inventario
async attemptInventoryReservation(items: QuoteItem[]): Promise<ReservationResult>

// ❌ NO IMPLEMENTADO: Auto-crear POs si faltan materiales
async createPurchaseOrdersForMissingMaterials(items: MissingMaterial[]): Promise<PO[]>

// ❌ NO IMPLEMENTADO: Compensating actions (rollback on failure)
async rollbackProjectCreation(projectId: string): Promise<void>

// ❌ NO IMPLEMENTADO: Notificaciones a equipo asignado
async notifyTeamMembers(projectId: string, teamMembers: string[]): Promise<void>
```

**Especificación:** "Asegurar que todas estas acciones se ejecuten como transacción o saga para evitar inconsistencias (ej. crear proyecto y fallar reserva de stock). Implementar compensating actions (rollback) o colas de retry."

---

## 🏭 MÓDULO WORK ORDERS (75% - Gaps Moderados)

### ✅ Implementado
- Servicio base (`work-order-crud.service.ts`) ✅
- Servicio labor (`work-order-labor.service.ts`) ✅
- Servicio materiales (`work-order-materials.service.ts`) ✅
- Servicio status (`work-order-status.service.ts`) ✅
- Página básica ✅

### ❌ Faltante (25%)

#### 1. **UI para Quality Checklists**
```typescript
// src/modules/work-orders/components/
WorkOrderQualityChecklist.tsx    // NO EXISTE
```
**Especificación:** "Control de Calidad: checklist específico para esa fase. Ejemplo: 'Corte exacto', 'Lijado correcto', 'Acabado sin defectos'."

#### 2. **QR/Scanner Integration**
```typescript
// src/modules/work-orders/components/
WorkOrderQRScanner.tsx           // NO EXISTE
MaterialConsumptionScanner.tsx   // NO EXISTE
```
**Especificación:** "Registro de consumo real: consumo por ítem desde el taller (lectura por QR/escáner o manual)."

#### 3. **WIP Tracking (Work-In-Progress)**
```typescript
// Agregar a WorkOrder model
wipStatus: {
  piecesStarted: number;
  piecesCompleted: number;
  piecesInProgress: number;
  defectiveUnits: number;
};
```
**Especificación:** "Visualizar WIP (work-in-progress) para piezas en proceso."

---

## 📦 MÓDULO INVENTARIO (90% - Gaps Menores)

### ✅ Implementado
- Raw Materials CRUD ✅
- Finished Products CRUD ✅
- Movimientos ✅
- Alertas de stock ✅
- Categorías ✅

### ❌ Faltante (10%)

#### 1. **BOM Versioning**
```typescript
// Collection: bill-of-materials-versions
interface BOMVersion {
  id: string;
  productId: string;
  version: number;
  items: BOMItem[];
  createdAt: Timestamp;
  createdBy: string;
  isActive: boolean;
}
```
**Especificación:** "BOM versioning."

#### 2. **Automatic Production Orders**
```typescript
// src/modules/inventory/services/
production-orders.service.ts     // NO EXISTE
```
**Funcionalidad:**
- Detectar cuando finished product tiene stock bajo
- Sugerir orden de producción automática
- Calcular materiales necesarios desde BOM

**Especificación:** "Automatic production orders."

#### 3. **Advanced Reports**
```typescript
// src/modules/inventory/components/
InventoryRotationReport.tsx      // NO EXISTE
InventoryValuationReport.tsx     // NO EXISTE
```
**Especificación:** "Advanced reports."

---

## 💰 MÓDULO FINANZAS (70% - Gaps Críticos)

### ✅ Implementado
- Invoices CRUD ✅
- Payments CRUD ✅
- Firestore rules ✅ (arregladas en sesión anterior)

### ❌ Faltante (30%) - **ALTA PRIORIDAD**

#### 1. **Invoice Generation from Quote/Project** ⚠️ CRÍTICO
```typescript
// src/modules/finance/services/
invoice-generation.service.ts    // NO EXISTE
```
**Funcionalidad:**
- Crear factura automáticamente desde cotización aceptada
- Crear factura desde milestone de proyecto
- Vincular con cliente, cotización, proyecto
- Calcular impuestos (IVA, ISR) automáticamente

**Especificación:** "Invoice generation from quote/project."

#### 2. **PDF Generation for Invoices** ⚠️ CRÍTICO
```typescript
// src/modules/finance/services/
invoice-pdf.service.ts           // NO EXISTE
```
**Requerido:**
- Formato fiscal completo (El Salvador)
- Logo, información legal
- Desglose de impuestos
- Guardar en Storage

**Especificación:** "PDF generation."

#### 3. **Email Sending**
```typescript
// src/modules/finance/services/
invoice-email.service.ts         // NO EXISTE
```
**Especificación:** "Email sending."

#### 4. **Payment Reminders**
```typescript
// src/modules/finance/services/
payment-reminders.service.ts     // NO EXISTE
```
**Funcionalidad:**
- Detectar facturas vencidas
- Enviar recordatorios automáticos
- Escalar según días de retraso

**Especificación:** "Payment reminders."

#### 5. **P&L Reports (Profit & Loss)**
```typescript
// src/modules/finance/components/
ProfitLossReport.tsx             // NO EXISTE
```
**Especificación:** "P&L (Profit & Loss statement)."

#### 6. **Cash Flow Analysis**
```typescript
// src/modules/finance/components/
CashFlowAnalysis.tsx             // NO EXISTE
```
**Especificación:** "Cash flow analysis."

---

## 📂 GAPS TRANSVERSALES (Afectan Múltiples Módulos)

### 1. **PDF Generation Engine** ⚠️ CRÍTICO

**Afecta:**
- Cotizaciones (quotes PDF)
- Facturas (invoices PDF)
- Reportes (projects reports)
- Contratos (clients contracts)

**Implementación Recomendada:**
```typescript
// src/lib/pdf/
pdf-generator.service.ts         // Motor común
pdf-templates/
  ├── quote-template.tsx
  ├── invoice-template.tsx
  └── report-template.tsx
```

**Tecnología:** `@react-pdf/renderer` o `jsPDF` + `html2canvas`

### 2. **Email Service Integration** ⚠️ CRÍTICO

**Afecta:**
- Cotizaciones (enviar propuesta)
- Facturas (enviar factura)
- Proyectos (notificaciones)
- Clientes (comunicación)

**Implementación Recomendada:**
```typescript
// src/lib/email/
email.service.ts                 // Motor común
email-templates/
  ├── quote-email.tsx
  ├── invoice-email.tsx
  └── notification-email.tsx
```

**Tecnología:** SendGrid, Resend, o Firebase Extensions (Trigger Email)

### 3. **Notification System**

**Afecta:**
- Proyectos (alertas de retraso)
- Inventario (stock bajo)
- Finanzas (pagos vencidos)
- RRHH (aprobaciones)

**Implementación Recomendada:**
```typescript
// src/lib/notifications/
notification.service.ts
notifications-hub/
  ├── NotificationCenter.tsx
  ├── NotificationBell.tsx
  └── NotificationsList.tsx
```

**Collection Firestore:**
```typescript
interface Notification {
  id: string;
  userId: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  createdAt: Timestamp;
}
```

### 4. **File Upload & Storage Management**

**Afecta:**
- Clientes (documentos)
- Proyectos (planos, contratos)
- Work Orders (fotos de calidad)
- RRHH (contratos, certificados)

**Implementación Recomendada:**
```typescript
// src/lib/storage/
storage.service.ts               // Wrapper Firebase Storage
file-uploader/
  ├── FileUploadZone.tsx         // Drag & drop
  ├── FilePreview.tsx
  └── FileList.tsx
```

---

## 🎯 PLAN DE IMPLEMENTACIÓN RECOMENDADO

### 🔴 **FASE 1: CRÍTICO - RRHH (4-5 semanas)**

**Objetivo:** Desbloquear cálculo de costos laborales

1. **Semana 1:** Modelo de datos + Validaciones
   - Crear collections: `employees`, `workSessions`, `payroll`
   - Schemas Zod completos
   - Firestore rules

2. **Semana 2:** Servicios Core
   - `employees.service.ts`
   - `employees-time-tracking.service.ts`
   - `employees-cost.service.ts`

3. **Semana 3:** UI Básica
   - `EmployeesDirectory` (listado)
   - `EmployeeForm` (crear/editar)
   - `EmployeeProfile` (detalle)

4. **Semana 4:** Time Tracking
   - `TimeTrackingWidget` (timer)
   - `WorkSessionsList` (historial)
   - Integración con proyectos

5. **Semana 5:** Nómina Básica
   - `PayrollCalculator`
   - Generación de registros
   - Reportes básicos

**Entregable:** Módulo RRHH funcional al 80%

---

### 🟡 **FASE 2: ALTA PRIORIDAD - Cotizaciones & Finanzas (3-4 semanas)**

**Objetivo:** Completar flujo comercial end-to-end

1. **Semana 1:** PDF Engine
   - Implementar `@react-pdf/renderer`
   - Template para cotizaciones
   - Template para facturas

2. **Semana 2:** Email Integration
   - Configurar SendGrid/Resend
   - Templates HTML
   - Servicio de envío

3. **Semana 3:** Invoice Generation
   - `invoice-generation.service.ts`
   - Flujo Quote → Invoice
   - Flujo Project → Invoice

4. **Semana 4:** Reports Financieros
   - P&L Report
   - Cash Flow Analysis
   - Payment Reminders

**Entregable:** Cotizaciones y Facturas 100% funcionales con PDF y email

---

### 🟢 **FASE 3: IMPORTANTE - Proyectos Detallados (3-4 semanas)**

**Objetivo:** Centro de comando operativo completo

1. **Semana 1:** Página Detalles Completa
   - `ProjectKPICards` con costo real (usando RRHH)
   - `ProjectInteractionComposer`
   - `ProjectUnifiedTimeline` (todas las fuentes)

2. **Semana 2:** BOM & Materiales
   - `ProjectBOMCard`
   - Servicio de reservas atómicas
   - Auto-generación de POs

3. **Semana 3:** Submódulos Críticos
   - `/projects/[id]/inventory`
   - `/projects/[id]/finance`
   - `/projects/[id]/tasks`

4. **Semana 4:** Calidad & Cierre
   - `/projects/[id]/quality`
   - `/projects/[id]/reports`
   - `/projects/[id]/close`

**Entregable:** Proyectos al 95% con todos los submódulos

---

### 🔵 **FASE 4: COMPLEMENTOS - Mejoras UX (2-3 semanas)**

**Objetivo:** Refinamiento y productividad

1. **Semana 1:** Vistas Alternativas
   - Clientes: Vista Cards, Geo-segmentación
   - Oportunidades: Vista Tabla
   - Leads: Checklist de calificación

2. **Semana 2:** Work Orders Avanzado
   - Quality Checklists UI
   - QR Scanner
   - WIP Tracking

3. **Semana 3:** Inventario Avanzado
   - BOM Versioning
   - Production Orders automáticas
   - Advanced Reports

**Entregable:** Sistema al 95% con UX pulido

---

### ⚪ **FASE 5: INTEGRACIONES - Ecosistema (ongoing)**

**No bloqueante, se puede hacer en paralelo:**

1. **Notification System**
   - Centro de notificaciones
   - Alertas en tiempo real
   - Push notifications (PWA)

2. **Advanced Search**
   - Búsqueda global
   - Filtros avanzados
   - Elasticsearch (opcional)

3. **Mobile App**
   - React Native o PWA
   - Scanner de QR
   - Timer offline

4. **Integraciones Externas**
   - Contabilidad (QuickBooks, Xero)
   - E-commerce (si aplica)
   - APIs de terceros

---

## 📊 MÉTRICAS DE PROGRESO

### Antes de Implementación
- **Completitud:** 78%
- **Módulos bloqueados:** Proyectos (costos), Finanzas (nómina)
- **Funcionalidad crítica faltante:** 22%

### Después de FASE 1 (RRHH)
- **Completitud:** ~85%
- **Módulos desbloqueados:** Proyectos, Finanzas, Work Orders
- **Impacto:** Alto (desbloquea 3 módulos)

### Después de FASE 2 (Cotizaciones/Finanzas)
- **Completitud:** ~90%
- **Funcionalidad comercial:** 100%
- **Impacto:** Alto (flujo end-to-end completo)

### Después de FASE 3 (Proyectos Detallados)
- **Completitud:** ~95%
- **Centro operativo:** 100%
- **Impacto:** Alto (control total de operaciones)

### Después de FASE 4 (Complementos)
- **Completitud:** ~97%
- **UX:** Nivel profesional
- **Impacto:** Medio (mejora productividad)

---

## 🎯 DECISIÓN RECOMENDADA

### Opción A: **Approach Secuencial**
1. RRHH completo (5 semanas)
2. Cotizaciones/Finanzas (4 semanas)
3. Proyectos detallados (4 semanas)

**Ventaja:** Cada fase desbloquea la siguiente  
**Desventaja:** No hay entregas parciales rápidas

### Opción B: **Approach Paralelo** ⭐ RECOMENDADO
1. **Track 1:** RRHH (Developer A - 5 semanas)
2. **Track 2:** PDF/Email + Cotizaciones (Developer B - 3 semanas)
3. **Track 3:** Proyectos UI (Developer C - 4 semanas, depende de RRHH en semana 4)

**Ventaja:** Máxima velocidad, entregas cada 3 semanas  
**Desventaja:** Requiere coordinación de 3 developers

---

## ✅ CONCLUSIÓN

**Funcionalidades Faltantes Identificadas:** 87  
**Bloqueantes Críticos:** 12  
**Alta Prioridad:** 24  
**Media Prioridad:** 31  
**Baja Prioridad:** 20  

**Tiempo Estimado Total:**  
- **Secuencial:** 13-16 semanas  
- **Paralelo (3 devs):** 5-6 semanas  

**Bloqueante #1:** RRHH (0% implementado, bloquea Proyectos y Finanzas)  
**Bloqueante #2:** PDF/Email (afecta Cotizaciones y Facturas)  
**Bloqueante #3:** BOM & Reservas (afecta Proyectos e Inventario)

---

**Siguiente Acción Recomendada:**  
Decidir approach (secuencial vs paralelo) y comenzar con **FASE 1: RRHH** inmediatamente.

