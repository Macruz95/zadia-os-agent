# 🚀 MEJORAS DE PROYECTOS - IMPLEMENTACIÓN EN PROGRESO

**Fecha**: 2025-10-30  
**Objetivo**: Implementar 4 funcionalidades completas en el módulo de proyectos al 100% mejorado vs código externo

---

## ✅ **COMPLETADO (40%)**

### 1. Tipos y Validaciones ✅
- ✅ `expense.types.ts` - Tipos completos para gastos del proyecto
- ✅ `document.types.ts` - Tipos completos para documentos
- ✅ `project-extensions.validation.ts` - Validaciones Zod para Work Sessions, Expenses, Documents, Tasks
- ✅ Exportaciones actualizadas en `projects.types.ts` (facade)

### 2. Servicios Backend ✅
- ✅ `project-work-sessions.service.ts` (193 líneas)
  - `startWorkSession()` - Inicia sesión con timestamp
  - `endWorkSession()` - Finaliza y calcula duración/costo
  - `getProjectWorkSessions()` - Lista sesiones del proyecto
  - `getActiveUserSession()` - Sesión activa de usuario
  - `deleteWorkSession()` - Eliminar sesión

- ✅ `project-expenses.service.ts` (217 líneas)
  - `createExpense()` - Crear gasto con validación Zod
  - `updateExpense()` - Actualizar gasto
  - `approveExpense()` - Aprobar/rechazar + actualizar costos del proyecto
  - `getProjectExpenses()` - Lista gastos del proyecto
  - `deleteExpense()` - Eliminar gasto

- ✅ `project-documents.service.ts` (217 líneas)
  - `uploadDocument()` - Upload a Firebase Storage + Firestore
  - `updateDocument()` - Actualizar metadata
  - `deleteDocument()` - Eliminar de Storage y Firestore
  - `getProjectDocuments()` - Lista documentos del proyecto

---

## ⏳ **PENDIENTE (60%)**

### 3. Hooks React 🔜
```typescript
// src/modules/projects/hooks/

use-work-sessions.ts
├── useWorkSessions(projectId)
├── useActiveSession(userId, projectId)
└── useWorkSessionTimer()

use-project-expenses.ts
├── useProjectExpenses(projectId)
├── useCreateExpense()
└── useApproveExpense()

use-project-documents.ts
├── useProjectDocuments(projectId)
├── useUploadDocument()
└── useDeleteDocument()

use-project-tasks.ts (extender existente)
├── useProjectTasks(projectId)
├── useCreateTask()
├── useToggleTask()
└── useDeleteTask()
```

### 4. Componentes UI 🔜
```
src/modules/projects/components/

work-sessions/
├── WorkSessionsTab.tsx          - Tab principal
├── WorkSessionTimer.tsx         - Timer con start/stop
├── SessionsHistory.tsx          - Tabla de sesiones
└── SessionCard.tsx              - Card individual

expenses/
├── ProjectExpensesTab.tsx       - Tab principal (mejorar)
├── ExpensesTable.tsx            - Tabla con categorías
├── AddExpenseDialog.tsx         - Dialog crear gasto
├── ApproveExpenseDialog.tsx     - Dialog aprobar/rechazar
└── ExpensesSummary.tsx          - Cards resumen

documents/
├── ProjectDocumentsTab.tsx      - Tab principal (mejorar)
├── DocumentsList.tsx            - Grid de documentos
├── DocumentUploadDialog.tsx     - Upload con progress
├── DocumentCard.tsx             - Card con preview
└── DocumentViewer.tsx           - Visor de documentos

tasks/
├── ProjectTasksTab.tsx          - Tab principal (mejorar)
├── TaskList.tsx                 - Lista de tareas
├── TaskItem.tsx                 - Tarea individual
├── AddTaskDialog.tsx            - Dialog crear tarea
└── TaskCheckbox.tsx             - Checkbox con estado
```

### 5. Integración en Page 🔜
```tsx
// src/app/(main)/projects/[id]/page.tsx

<TabsList className="grid w-full grid-cols-7">
  <TabsTrigger value="overview">General</TabsTrigger>
  <TabsTrigger value="work-sessions">⭐ Tiempo</TabsTrigger>
  <TabsTrigger value="tasks">✅ Tareas</TabsTrigger>
  <TabsTrigger value="finance">💰 Finanzas</TabsTrigger>
  <TabsTrigger value="documents">📄 Documentos</TabsTrigger>
  <TabsTrigger value="work-orders">🔧 Órdenes</TabsTrigger>
  <TabsTrigger value="timeline">📅 Historial</TabsTrigger>
</TabsList>

<TabsContent value="work-sessions">
  <WorkSessionsTab projectId={projectId} />
</TabsContent>

<TabsContent value="tasks">
  <ProjectTasksTab projectId={projectId} />
</TabsContent>

<TabsContent value="finance">
  <ProjectExpensesTab projectId={projectId} />
</TabsContent>

<TabsContent value="documents">
  <ProjectDocumentsTab projectId={projectId} />
</TabsContent>
```

---

## 📊 **ARQUITECTURA FINAL**

### Flujo de Work Sessions
```
Usuario → WorkSessionTimer
         ↓
    startWorkSession() → Firestore
         ↓
    Timer en memoria (setInterval)
         ↓
    endWorkSession() → Calcula duración/costo → Firestore
         ↓
    SessionsHistory → Lista todas las sesiones
```

### Flujo de Expenses
```
Usuario → AddExpenseDialog
         ↓
    createExpense() → Validación Zod → Firestore (pending)
         ↓
    Aprobador → ApproveExpenseDialog
         ↓
    approveExpense() → runTransaction
         ├── actualiza status a approved
         └── actualiza actualCost del proyecto
                ├── materialsCost
                ├── laborCost
                └── overheadCost
```

### Flujo de Documents
```
Usuario → DocumentUploadDialog
         ↓
    Selecciona archivo → uploadDocument()
         ├── Upload a Storage (con progress)
         ├── Get downloadURL
         └── Crea doc en Firestore
                   ↓
              DocumentsList → Grid con cards
                   ↓
              Click → DocumentViewer/Download
```

---

## 🎯 **BENEFICIOS vs CÓDIGO EXTERNO**

| Feature | Código Externo | ZADIA OS (Mejorado) |
|---------|---------------|---------------------|
| **Arquitectura** | Monolítico 400+ líneas | Modular <200 líneas/archivo |
| **Validación** | Sin validación | Zod schemas estrictos |
| **Servicios** | Firebase directo inline | Servicios centralizados reutilizables |
| **Timestamps** | Sin normalizar | Firestore Timestamp consistente |
| **Work Sessions** | Timer simple | Cálculo de costos, historial completo |
| **Expenses** | Suma/resta básica | Categorización + actualización automática costos |
| **Documents** | Storage directo | Servicio con metadata, tags, versiones |
| **Tasks** | Checkbox list | Prioridades, asignación, fechas límite |
| **UI Components** | Todo en 1 archivo | Componentes modulares ShadCN |
| **Real-time** | onSnapshot básico | Hooks optimizados con loading states |

---

## 📋 **PRÓXIMOS PASOS (ORDEN DE PRIORIDAD)**

1. ✅ **Crear hooks** (use-work-sessions, use-project-expenses, use-project-documents, extender use-project-tasks)
2. ✅ **Implementar Work Sessions Tab** (mayor impacto visual)
3. ✅ **Implementar Tasks Tab mejorado** (más usado día a día)
4. ✅ **Implementar Finance/Expenses Tab** (crítico para rentabilidad)
5. ✅ **Implementar Documents Tab** (nice to have)
6. ✅ **Integrar en page.tsx** con nuevos tabs
7. ✅ **Testing end-to-end** de cada flujo
8. ✅ **Actualizar Firestore indexes** si es necesario
9. ✅ **Documentación de uso**

---

## 🔧 **FIRESTORE COLLECTIONS NUEVAS**

```
workSessions/
├── {sessionId}
│   ├── projectId
│   ├── workOrderId (optional)
│   ├── taskId (optional)
│   ├── userId
│   ├── userName
│   ├── startTime (Timestamp)
│   ├── endTime (Timestamp)
│   ├── durationSeconds
│   ├── hourlyRate
│   ├── totalCost
│   ├── notes
│   └── createdAt (Timestamp)

projectExpenses/
├── {expenseId}
│   ├── projectId
│   ├── description
│   ├── category (materials|labor|overhead|...)
│   ├── amount
│   ├── currency
│   ├── status (pending|approved|rejected|paid)
│   ├── approvedBy
│   ├── approvedAt
│   ├── rejectionReason
│   ├── receiptUrl
│   ├── receiptFileName
│   ├── expenseDate (Timestamp)
│   ├── createdBy
│   ├── createdByName
│   ├── createdAt (Timestamp)
│   └── updatedAt (Timestamp)

projectDocuments/
├── {documentId}
│   ├── projectId
│   ├── name
│   ├── description
│   ├── documentType (contract|quote|invoice|...)
│   ├── fileUrl (Storage download URL)
│   ├── fullPath (Storage path para delete)
│   ├── fileSize
│   ├── fileType (MIME)
│   ├── tags []
│   ├── version
│   ├── uploadedBy
│   ├── uploadedByName
│   ├── uploadedAt (Timestamp)
│   ├── updatedAt (Timestamp)
│   └── updatedBy
```

---

## 📦 **COMMITS REALIZADOS**

1. ✅ `feat: alinear proyectos con cotizaciones - sanitización y timestamps consistentes` (f4e068a)
2. ✅ `feat: agregar tipos y servicios para Work Sessions, Expenses y Documents en proyectos` (fa6c953)

---

## ⚡ **ESTADO ACTUAL**

- **Progreso**: 40% completado
- **Líneas de código**: ~1,500 líneas nuevas
- **Archivos creados**: 7
- **Tiempo estimado restante**: 3-4 horas para hooks + componentes
- **Bloqueadores**: Ninguno
- **Próximo commit**: Hooks y primer tab (Work Sessions)

---

**Última actualización**: 2025-10-30 - Servicios backend completados ✅
