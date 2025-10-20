# 🗺️ ROADMAP TÉCNICO DETALLADO - ZADIA OS

**Fecha:** 19 de Octubre, 2025  
**Sistema:** ZADIA OS - Carpintería ERP  
**Objetivo:** Plan completo de implementación de funcionalidades faltantes

---

## 📋 ÍNDICE DE COMPONENTES A CREAR

**Total de Archivos Nuevos:** 143  
**Total de Archivos a Modificar:** 28  
**Total de Collections Firestore:** 4 nuevas  

---

## 🔴 FASE 1: MÓDULO RRHH (BLOQUEANTE CRÍTICO)

### 📁 Estructura de Directorios a Crear

```
src/
├── modules/rrhh/                                    # ❌ TODO EL MÓDULO NO EXISTE
│   ├── services/
│   │   ├── employees.service.ts                    # ❌ CREAR
│   │   ├── employees-crud.service.ts               # ❌ CREAR
│   │   ├── employees-time-tracking.service.ts      # ❌ CREAR
│   │   ├── employees-payroll.service.ts            # ❌ CREAR
│   │   └── employees-cost.service.ts               # ❌ CREAR
│   │
│   ├── components/
│   │   ├── EmployeesDirectory.tsx                  # ❌ CREAR - Tabla principal
│   │   ├── EmployeesFilters.tsx                    # ❌ CREAR
│   │   ├── EmployeesTable.tsx                      # ❌ CREAR
│   │   ├── EmployeesKPICards.tsx                   # ❌ CREAR
│   │   ├── EmployeeForm.tsx                        # ❌ CREAR - Wizard crear/editar
│   │   ├── EmployeeProfile.tsx                     # ❌ CREAR - Vista detalle
│   │   ├── EmployeeBasicInfo.tsx                   # ❌ CREAR
│   │   ├── EmployeeJobInfo.tsx                     # ❌ CREAR
│   │   ├── EmployeeSkillsList.tsx                  # ❌ CREAR
│   │   ├── EmployeeCertifications.tsx              # ❌ CREAR
│   │   ├── TimeTrackingWidget.tsx                  # ❌ CREAR - Timer start/stop
│   │   ├── TimeEntryForm.tsx                       # ❌ CREAR - Entrada manual
│   │   ├── WorkSessionsList.tsx                    # ❌ CREAR - Historial
│   │   ├── WorkSessionCard.tsx                     # ❌ CREAR
│   │   ├── PayrollCalculator.tsx                   # ❌ CREAR
│   │   ├── PayrollRecordsList.tsx                  # ❌ CREAR
│   │   └── EmployeeAssignmentCard.tsx              # ❌ CREAR - Para proyectos
│   │
│   ├── hooks/
│   │   ├── use-employees.ts                        # ❌ CREAR - Listado
│   │   ├── use-employee.ts                         # ❌ CREAR - Individual
│   │   ├── use-work-sessions.ts                    # ❌ CREAR
│   │   ├── use-time-tracker.ts                     # ❌ CREAR - Control timer
│   │   └── use-payroll.ts                          # ❌ CREAR
│   │
│   ├── validations/
│   │   ├── employees.validation.ts                 # ❌ CREAR
│   │   ├── time-tracking.validation.ts             # ❌ CREAR
│   │   └── payroll.validation.ts                   # ❌ CREAR
│   │
│   ├── types/
│   │   ├── employees.types.ts                      # ❌ CREAR
│   │   ├── time-tracking.types.ts                  # ❌ CREAR
│   │   └── payroll.types.ts                        # ❌ CREAR
│   │
│   └── utils/
│       ├── payroll-calculations.ts                 # ❌ CREAR - Fórmulas nómina
│       ├── labor-cost-calculations.ts              # ❌ CREAR - Costo x hora
│       └── time-utils.ts                           # ❌ CREAR - Conversiones
│
└── app/(main)/rrhh/                                 # ❌ TODO NO EXISTE
    ├── page.tsx                                     # ❌ CREAR - Listado empleados
    ├── create/
    │   └── page.tsx                                 # ❌ CREAR - Formulario
    ├── [id]/
    │   ├── page.tsx                                 # ❌ CREAR - Detalle empleado
    │   ├── time-tracking/
    │   │   └── page.tsx                             # ❌ CREAR - Historial sesiones
    │   └── payroll/
    │       └── page.tsx                             # ❌ CREAR - Nómina empleado
    └── payroll/
        └── page.tsx                                 # ❌ CREAR - Nómina general
```

### 🗄️ Collections Firestore a Crear

#### 1. `employees`
```typescript
interface Employee {
  id: string;
  personalData: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    dateOfBirth: Timestamp;
    address: Address;
  };
  jobData: {
    position: string;
    department: string;
    hireDate: Timestamp;
    salary: number;
    hourlyRate: number;             // ⭐ CRÍTICO
    contractType: 'full-time' | 'part-time' | 'contractor';
    status: 'active' | 'inactive' | 'on-leave';
  };
  skills: string[];
  certifications: Certification[];
  userId?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

#### 2. `workSessions`
```typescript
interface WorkSession {
  id: string;
  employeeId: string;
  employeeName: string;
  projectId?: string;
  taskId?: string;
  workOrderId?: string;
  startTime: Timestamp;
  endTime?: Timestamp;
  durationSeconds: number;
  hourlyRate: number;               // Snapshot
  laborCost: number;                // ⭐ AUTO-CALCULADO
  activity: string;
  isBillable: boolean;
  notes?: string;
  createdBy: string;
  createdAt: Timestamp;
}
```

#### 3. `payroll`
```typescript
interface PayrollRecord {
  id: string;
  employeeId: string;
  period: { start: Timestamp; end: Timestamp; };
  baseSalary: number;
  overtimeHours: number;
  overtimePay: number;
  bonuses: number;
  deductions: {
    isss: number;
    afp: number;
    tax: number;
    other: number;
  };
  netPay: number;
  status: 'draft' | 'approved' | 'paid';
  paidAt?: Timestamp;
  createdAt: Timestamp;
}
```

### 📝 Firestore Rules a Agregar

```javascript
// firestore.rules - AGREGAR sección RRHH

// Employees collection
match /employees/{employeeId} {
  allow read: if isAuthenticated();
  allow create: if isAuthenticated() && (isAdmin() || isManagerOrAdmin());
  allow update: if isAuthenticated() && (isEmployeeOwner(employeeId) || isManagerOrAdmin());
  allow delete: if isAuthenticated() && isAdmin();
  
  function isEmployeeOwner(empId) {
    return request.auth.uid == resource.data.userId;
  }
}

// Work Sessions collection
match /workSessions/{sessionId} {
  allow read: if isAuthenticated();
  allow create: if isAuthenticated() && isValidWorkSession();
  allow update: if isAuthenticated() && (isSessionOwner(sessionId) || isManagerOrAdmin());
  allow delete: if isAuthenticated() && isAdmin();
  
  function isSessionOwner(sid) {
    return request.auth.uid == resource.data.createdBy;
  }
  
  function isValidWorkSession() {
    return request.resource.data.employeeId is string
      && request.resource.data.startTime is timestamp
      && request.resource.data.hourlyRate > 0;
  }
}

// Payroll collection
match /payroll/{payrollId} {
  allow read: if isAuthenticated() && (isPayrollOwner(payrollId) || isManagerOrAdmin());
  allow create: if isAuthenticated() && isManagerOrAdmin();
  allow update: if isAuthenticated() && isManagerOrAdmin();
  allow delete: if isAuthenticated() && isAdmin();
  
  function isPayrollOwner(pid) {
    let payroll = get(/databases/$(database)/documents/payroll/$(pid)).data;
    let employee = get(/databases/$(database)/documents/employees/$(payroll.employeeId)).data;
    return request.auth.uid == employee.userId;
  }
}
```

### 🔧 Integraciones con Otros Módulos

#### Modificar: `src/modules/projects/services/projects.service.ts`
```typescript
// ✏️ MODIFICAR - Agregar cálculo de labor cost

async calculateProjectLaborCost(projectId: string): Promise<number> {
  const sessions = await WorkSessionsService.getByProject(projectId);
  return sessions.reduce((total, session) => total + session.laborCost, 0);
}

async updateProjectCosts(projectId: string): Promise<void> {
  const laborCost = await this.calculateProjectLaborCost(projectId);
  const materialCost = await this.calculateMaterialCost(projectId);
  const totalCost = laborCost + materialCost;
  
  await updateDoc(doc(db, 'projects', projectId), {
    'costs.labor': laborCost,
    'costs.materials': materialCost,
    'costs.total': totalCost,
    updatedAt: serverTimestamp(),
  });
}
```

#### Modificar: `src/modules/projects/components/ProjectKPICards.tsx`
```typescript
// ✏️ MODIFICAR - Agregar KPI de costo real con labor

<Card>
  <CardHeader>
    <CardTitle>Costo Real</CardTitle>
  </CardHeader>
  <CardContent>
    <div className="text-2xl font-bold">
      {formatCurrency(project.costs.total)}
    </div>
    <div className="text-sm text-muted-foreground">
      Materiales: {formatCurrency(project.costs.materials)}
      <br />
      Mano de obra: {formatCurrency(project.costs.labor)}  {/* ⭐ NUEVO */}
    </div>
  </CardContent>
</Card>
```

---

## 🟡 FASE 2: PDF & EMAIL INTEGRATION

### 📁 Estructura de Directorios a Crear

```
src/
├── lib/
│   ├── pdf/
│   │   ├── pdf-generator.service.ts                # ❌ CREAR - Motor común
│   │   ├── pdf-utils.ts                            # ❌ CREAR
│   │   └── templates/
│   │       ├── quote-pdf-template.tsx              # ❌ CREAR
│   │       ├── invoice-pdf-template.tsx            # ❌ CREAR
│   │       ├── project-report-template.tsx         # ❌ CREAR
│   │       └── common/
│   │           ├── PDFHeader.tsx                   # ❌ CREAR
│   │           ├── PDFFooter.tsx                   # ❌ CREAR
│   │           └── PDFTable.tsx                    # ❌ CREAR
│   │
│   └── email/
│       ├── email.service.ts                        # ❌ CREAR - Motor común
│       ├── email-utils.ts                          # ❌ CREAR
│       └── templates/
│           ├── quote-email.html                    # ❌ CREAR
│           ├── invoice-email.html                  # ❌ CREAR
│           ├── notification-email.html             # ❌ CREAR
│           └── common/
│               ├── email-header.html               # ❌ CREAR
│               └── email-footer.html               # ❌ CREAR
│
└── modules/
    ├── sales/
    │   └── services/
    │       ├── quotes-pdf.service.ts               # ❌ CREAR
    │       └── quotes-email.service.ts             # ❌ CREAR
    │
    └── finance/
        └── services/
            ├── invoice-pdf.service.ts              # ❌ CREAR
            └── invoice-email.service.ts            # ❌ CREAR
```

### 📦 Packages a Instalar

```bash
# PDF Generation
npm install @react-pdf/renderer
npm install jspdf html2canvas

# Email Service
npm install @sendgrid/mail
# O alternativamente
npm install resend
```

### 🔧 Componentes a Modificar

#### 1. `src/app/(main)/sales/quotes/[id]/page.tsx`
```typescript
// ✏️ MODIFICAR - Reemplazar react-to-print por PDF real

// ELIMINAR:
const handleDownloadPDF = useReactToPrint({...});

// AGREGAR:
import { QuotesPDFService } from '@/modules/sales/services/quotes-pdf.service';

const handleDownloadPDF = async () => {
  try {
    const pdf = await QuotesPDFService.generatePDF(quote);
    pdf.save(`Cotizacion-${quote.number}.pdf`);
    toast.success('PDF generado correctamente');
  } catch (error) {
    toast.error('Error al generar PDF');
  }
};

const handleSendEmail = async () => {
  setEmailDialogOpen(true);
};
```

#### 2. Agregar Modal de Envío de Email
```typescript
// src/modules/sales/components/quotes/
SendQuoteEmailDialog.tsx                             # ❌ CREAR

interface SendQuoteEmailDialogProps {
  quote: Quote;
  open: boolean;
  onClose: () => void;
}
```

---

## 🟢 FASE 3: PROYECTOS DETALLADOS

### 📁 Componentes UI a Crear

```
src/modules/projects/components/
├── ProjectKPICards.tsx                              # ✏️ MODIFICAR (existe básico)
├── ProjectInteractionComposer.tsx                   # ❌ CREAR
├── ProjectUnifiedTimeline.tsx                       # ✏️ MODIFICAR (solo tiene tasks)
├── ProjectBOMCard.tsx                               # ❌ CREAR - ⭐ CRÍTICO
├── ProjectFinancialSummary.tsx                      # ❌ CREAR - ⭐ CRÍTICO
├── ProjectTeamCard.tsx                              # ❌ CREAR
├── ProjectDocumentsCard.tsx                         # ❌ CREAR
├── bom/
│   ├── BOMTable.tsx                                 # ❌ CREAR
│   ├── BOMItemRow.tsx                               # ❌ CREAR
│   ├── MaterialReservationDialog.tsx               # ❌ CREAR
│   ├── GeneratePODialog.tsx                        # ❌ CREAR
│   └── MaterialConsumptionForm.tsx                 # ❌ CREAR
├── interactions/
│   ├── InteractionComposer.tsx                     # ❌ CREAR
│   ├── NoteForm.tsx                                # ❌ CREAR
│   ├── CallForm.tsx                                # ❌ CREAR
│   ├── MeetingForm.tsx                             # ❌ CREAR
│   ├── EmailForm.tsx                               # ❌ CREAR
│   └── RFIForm.tsx                                 # ❌ CREAR
└── timeline/
    ├── TimelineItem.tsx                            # ✏️ MODIFICAR
    ├── ActivityTimelineItem.tsx                    # ❌ CREAR
    ├── SystemEventTimelineItem.tsx                 # ❌ CREAR
    ├── TransactionTimelineItem.tsx                 # ❌ CREAR
    └── WorkSessionTimelineItem.tsx                 # ❌ CREAR
```

### 📁 Servicios a Crear

```
src/modules/projects/services/
├── project-bom.service.ts                          # ❌ CREAR - ⭐ CRÍTICO
├── project-inventory-reservation.service.ts        # ❌ CREAR - ⭐ CRÍTICO
├── project-purchase-orders.service.ts              # ❌ CREAR
├── project-interactions.service.ts                 # ❌ CREAR
├── project-financial.service.ts                    # ❌ CREAR
└── quote-conversion.service.ts                     # ✏️ MODIFICAR (agregar reservas)
```

### 📁 Submódulos de Proyectos a Crear

```
src/app/(main)/projects/[id]/
├── page.tsx                                        # ✏️ MODIFICAR - Agregar submódulos
├── work-orders/
│   └── page.tsx                                    # ✅ EXISTE (mejorar)
├── inventory/
│   └── page.tsx                                    # ❌ CREAR
├── finance/
│   └── page.tsx                                    # ❌ CREAR
├── tasks/
│   ├── page.tsx                                    # ❌ CREAR
│   ├── kanban/
│   │   └── page.tsx                                # ❌ CREAR
│   └── gantt/
│       └── page.tsx                                # ❌ CREAR
├── quality/
│   └── page.tsx                                    # ❌ CREAR
├── reports/
│   └── page.tsx                                    # ❌ CREAR
└── close/
    └── page.tsx                                    # ❌ CREAR
```

### 🗄️ Collections Firestore a Crear/Modificar

#### 1. Crear: `bill-of-materials`
```typescript
interface BillOfMaterials {
  id: string;
  projectId: string;
  quoteId?: string;
  productId?: string;
  version: number;
  items: Array<{
    sku: string;
    description: string;
    quantity: number;
    uom: string;
    unitCost: number;
    totalCost: number;
    stockAvailable: number;
    stockReserved: number;
    provisionStatus: 'in-stock' | 'reserved' | 'needs-purchase' | 'backorder';
  }>;
  totalCost: number;
  isActive: boolean;
  createdAt: Timestamp;
  createdBy: string;
}
```

#### 2. Crear: `inventory-reservations`
```typescript
interface InventoryReservation {
  id: string;
  projectId: string;
  itemSKU: string;
  quantityReserved: number;
  reservedAt: Timestamp;
  reservedBy: string;
  status: 'active' | 'consumed' | 'released';
  consumedAt?: Timestamp;
  releasedAt?: Timestamp;
}
```

#### 3. Modificar: `projects`
```typescript
// Agregar campos:
interface Project {
  // ... campos existentes
  
  bom: {
    bomId: string;
    version: number;
    totalEstimatedCost: number;
    totalRealCost: number;
  };
  
  costs: {
    materials: number;           // ⭐ NUEVO
    labor: number;               // ⭐ NUEVO (requiere RRHH)
    indirect: number;            // ⭐ NUEVO
    total: number;               // ⭐ NUEVO
  };
  
  financial: {
    salesPrice: number;
    estimatedCost: number;
    realCost: number;           // ⭐ AUTO-CALCULADO
    margin: number;             // ⭐ AUTO-CALCULADO
    marginPercent: number;      // ⭐ AUTO-CALCULADO
  };
}
```

---

## 🔵 FASE 4: FINANZAS

### 📁 Servicios a Crear

```
src/modules/finance/services/
├── invoice-generation.service.ts                   # ❌ CREAR - ⭐ CRÍTICO
├── invoice-pdf.service.ts                          # ❌ CREAR - ⭐ CRÍTICO
├── invoice-email.service.ts                        # ❌ CREAR
├── payment-reminders.service.ts                    # ❌ CREAR
├── financial-reports.service.ts                    # ❌ CREAR
└── cash-flow.service.ts                            # ❌ CREAR
```

### 📁 Componentes a Crear

```
src/modules/finance/components/
├── invoices/
│   ├── InvoiceGenerationWizard.tsx                 # ❌ CREAR
│   ├── InvoiceFromQuoteDialog.tsx                  # ❌ CREAR
│   └── InvoiceFromProjectDialog.tsx                # ❌ CREAR
├── reports/
│   ├── ProfitLossReport.tsx                        # ❌ CREAR
│   ├── CashFlowReport.tsx                          # ❌ CREAR
│   ├── AccountsReceivableReport.tsx                # ❌ CREAR
│   └── AccountsPayableReport.tsx                   # ❌ CREAR
└── reminders/
    ├── PaymentRemindersList.tsx                    # ❌ CREAR
    └── SendReminderDialog.tsx                      # ❌ CREAR
```

---

## ⚪ COMPONENTES TRANSVERSALES

### 📁 Notification System

```
src/lib/notifications/
├── notification.service.ts                         # ❌ CREAR
├── notification-rules.ts                           # ❌ CREAR
└── components/
    ├── NotificationCenter.tsx                      # ❌ CREAR
    ├── NotificationBell.tsx                        # ❌ CREAR
    ├── NotificationsList.tsx                       # ❌ CREAR
    └── NotificationItem.tsx                        # ❌ CREAR

src/app/(main)/layout.tsx                           # ✏️ MODIFICAR
// Agregar <NotificationBell /> en header
```

### 📁 File Upload & Storage

```
src/lib/storage/
├── storage.service.ts                              # ❌ CREAR
├── storage-utils.ts                                # ❌ CREAR
└── components/
    ├── FileUploadZone.tsx                          # ❌ CREAR
    ├── FileUploadButton.tsx                        # ❌ CREAR
    ├── FilePreview.tsx                             # ❌ CREAR
    ├── FileList.tsx                                # ❌ CREAR
    └── FileItem.tsx                                # ❌ CREAR
```

---

## 📊 RESUMEN DE ARCHIVOS

### Por Tipo

| Tipo | A Crear | A Modificar | Total |
|------|---------|-------------|-------|
| **Páginas (pages.tsx)** | 18 | 5 | 23 |
| **Componentes UI** | 67 | 8 | 75 |
| **Servicios** | 32 | 4 | 36 |
| **Hooks** | 8 | 2 | 10 |
| **Validaciones (Zod)** | 6 | 0 | 6 |
| **Tipos (TypeScript)** | 5 | 3 | 8 |
| **Utils** | 7 | 0 | 7 |
| **Templates (PDF/Email)** | 10 | 0 | 10 |
| **Rules (Firestore)** | 0 | 1 | 1 |
| **Collections** | 4 | 0 | 4 |
| **TOTAL** | **143** | **28** | **171** |

### Por Módulo

| Módulo | Archivos Nuevos | Archivos Modificados | Prioridad |
|--------|-----------------|----------------------|-----------|
| **RRHH** | 43 | 6 | 🔴 Crítica |
| **PDF/Email** | 18 | 4 | 🟡 Alta |
| **Proyectos** | 35 | 8 | 🟡 Alta |
| **Finanzas** | 15 | 3 | 🟡 Alta |
| **Clientes** | 4 | 2 | 🟢 Media |
| **Ventas** | 8 | 3 | 🟢 Media |
| **Inventario** | 6 | 1 | 🟢 Media |
| **Transversal** | 14 | 1 | 🔵 Baja |

---

## 🎯 PLAN DE EJECUCIÓN DETALLADO

### Semana 1: RRHH - Fundamentos
- [ ] Crear estructura de directorios RRHH
- [ ] Definir tipos TypeScript (employees.types.ts)
- [ ] Crear validaciones Zod (employees.validation.ts)
- [ ] Crear collections Firestore (employees, workSessions, payroll)
- [ ] Agregar Firestore rules para RRHH
- [ ] Crear servicios base (employees-crud.service.ts)

### Semana 2: RRHH - UI Básica
- [ ] Crear página listado (/rrhh/page.tsx)
- [ ] Crear EmployeesDirectory.tsx
- [ ] Crear EmployeesTable.tsx
- [ ] Crear EmployeesFilters.tsx
- [ ] Crear hooks (use-employees.ts, use-employee.ts)
- [ ] Crear EmployeeForm.tsx (wizard)

### Semana 3: RRHH - Detalle y Time Tracking
- [ ] Crear página detalle (/rrhh/[id]/page.tsx)
- [ ] Crear EmployeeProfile.tsx
- [ ] Crear TimeTrackingWidget.tsx
- [ ] Crear WorkSessionsList.tsx
- [ ] Crear employees-time-tracking.service.ts
- [ ] Crear use-time-tracker.ts hook

### Semana 4: RRHH - Nómina
- [ ] Crear PayrollCalculator.tsx
- [ ] Crear employees-payroll.service.ts
- [ ] Crear payroll-calculations.ts (fórmulas)
- [ ] Crear página nómina (/rrhh/payroll/page.tsx)
- [ ] Testing e integración

### Semana 5: Integración RRHH → Proyectos
- [ ] Modificar ProjectKPICards.tsx (agregar labor cost)
- [ ] Modificar projects.service.ts (calculateLaborCost)
- [ ] Crear ProjectTeamCard.tsx
- [ ] Testing end-to-end
- [ ] **HITO: RRHH Funcional al 80%**

### Semana 6: PDF Engine
- [ ] Instalar @react-pdf/renderer
- [ ] Crear pdf-generator.service.ts
- [ ] Crear quote-pdf-template.tsx
- [ ] Crear invoice-pdf-template.tsx
- [ ] Testing generación PDF

### Semana 7: Email Service
- [ ] Configurar SendGrid/Resend
- [ ] Crear email.service.ts
- [ ] Crear templates HTML
- [ ] Crear SendQuoteEmailDialog.tsx
- [ ] Modificar quotes/[id]/page.tsx (botón enviar)

### Semana 8: Finanzas - Invoice Generation
- [ ] Crear invoice-generation.service.ts
- [ ] Crear InvoiceGenerationWizard.tsx
- [ ] Flujo Quote → Invoice
- [ ] Flujo Project → Invoice
- [ ] **HITO: Cotizaciones 100% con PDF/Email**

### Semana 9: Proyectos - BOM
- [ ] Crear collection bill-of-materials
- [ ] Crear project-bom.service.ts
- [ ] Crear ProjectBOMCard.tsx
- [ ] Crear BOMTable.tsx
- [ ] Testing BOM

### Semana 10: Proyectos - Reservas e Inventario
- [ ] Crear collection inventory-reservations
- [ ] Crear project-inventory-reservation.service.ts
- [ ] Modificar quote-conversion.service.ts (reservas atómicas)
- [ ] Crear MaterialReservationDialog.tsx
- [ ] Testing transacciones atómicas

### Semana 11: Proyectos - Submódulos (Parte 1)
- [ ] Crear /projects/[id]/inventory/page.tsx
- [ ] Crear /projects/[id]/finance/page.tsx
- [ ] Crear ProjectFinancialSummary.tsx
- [ ] Testing submódulos

### Semana 12: Proyectos - Submódulos (Parte 2)
- [ ] Crear /projects/[id]/tasks/page.tsx
- [ ] Crear /projects/[id]/quality/page.tsx
- [ ] Crear /projects/[id]/reports/page.tsx
- [ ] Crear /projects/[id]/close/page.tsx
- [ ] **HITO: Proyectos al 95%**

### Semana 13: Notificaciones & File Upload
- [ ] Crear notification.service.ts
- [ ] Crear NotificationCenter.tsx
- [ ] Crear storage.service.ts
- [ ] Crear FileUploadZone.tsx
- [ ] Testing notificaciones

### Semana 14: Polishing & QA
- [ ] Revisión completa de UI/UX
- [ ] Testing de integraciones
- [ ] Optimización de performance
- [ ] Documentación
- [ ] **HITO: Sistema al 95%**

---

## 📈 MÉTRICAS DE PROGRESO

### Tracking por Fase

#### FASE 1: RRHH
- **Archivos a crear:** 43
- **Archivos a modificar:** 6
- **Completitud inicial:** 0%
- **Completitud objetivo:** 80%
- **Impacto:** Desbloquea Proyectos y Finanzas

#### FASE 2: PDF/Email + Finanzas
- **Archivos a crear:** 33
- **Archivos a modificar:** 7
- **Completitud inicial:** 70%
- **Completitud objetivo:** 100%
- **Impacto:** Flujo comercial completo

#### FASE 3: Proyectos Detallados
- **Archivos a crear:** 35
- **Archivos a modificar:** 8
- **Completitud inicial:** 60%
- **Completitud objetivo:** 95%
- **Impacto:** Centro operativo completo

#### FASE 4: Complementos
- **Archivos a crear:** 32
- **Archivos a modificar:** 7
- **Completitud inicial:** Variable
- **Completitud objetivo:** 100%
- **Impacto:** UX profesional

---

## ✅ CHECKLIST DE VALIDACIÓN

### Por cada componente creado:

- [ ] ✅ Sigue regla #1: Datos reales (no mocks)
- [ ] ✅ Sigue regla #2: ShadCN UI + Lucide Icons
- [ ] ✅ Sigue regla #3: Validación Zod
- [ ] ✅ Sigue regla #4: Arquitectura modular
- [ ] ✅ Sigue regla #5: Máximo 200-350 líneas
- [ ] ✅ Tiene tipos TypeScript completos
- [ ] ✅ Tiene manejo de errores
- [ ] ✅ Tiene loading states
- [ ] ✅ Tiene empty states
- [ ] ✅ Es responsive
- [ ] ✅ Tiene documentación JSDoc

---

## 🚀 DECISIÓN FINAL RECOMENDADA

### Approach Paralelo (3 Developers)

**Developer A - RRHH Track (Semanas 1-5):**
- Semana 1: Fundamentos
- Semana 2: UI Básica
- Semana 3: Time Tracking
- Semana 4: Nómina
- Semana 5: Integración Proyectos

**Developer B - PDF/Email/Finanzas Track (Semanas 6-8):**
- Semana 6: PDF Engine
- Semana 7: Email Service
- Semana 8: Invoice Generation

**Developer C - Proyectos Track (Semanas 9-12):**
- Semana 9: BOM
- Semana 10: Reservas
- Semana 11: Submódulos Parte 1
- Semana 12: Submódulos Parte 2

**Todos - Final Polish (Semanas 13-14):**
- Semana 13: Notificaciones & Files
- Semana 14: QA & Documentation

**Tiempo Total:** 14 semanas  
**Entregables:** 4 hitos principales  
**Completitud Final:** 97%

---

**Siguiente paso:** ¿Comenzamos con la arquitectura técnica detallada del módulo RRHH (FASE 1)?

