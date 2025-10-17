# 🏗️ MÓDULO DE PROYECTOS - ARQUITECTURA COMPLETA
**Proyecto:** ZADIA OS  
**Módulo:** Proyectos (Independiente, Primer Nivel)  
**Fecha:** 16 de Octubre, 2025

---

## 🎯 POSICIONAMIENTO ESTRATÉGICO

### Proyectos = Módulo Independiente de Primer Nivel

**NO es submódulo de Ventas**. Proyectos tiene el mismo nivel jerárquico que:
- Clientes
- Ventas
- Inventario
- Finanzas (futuro)
- RRHH (futuro)

### Razones de Independencia

1. **Complejidad Equivalente**
   - Clientes: gestiona relaciones (CRM)
   - Ventas: gestiona pipeline (Leads → Cotizaciones)
   - Inventario: gestiona recursos (Materia Prima + Productos)
   - **Proyectos: gestiona ejecución** (Producción → Entrega)

2. **Ciclo de Vida Propio**
   ```
   Planificación → Ejecución → Control → Cierre
   ```

3. **Submódulos Propios (8 submódulos)**
   - Órdenes de Trabajo
   - Inventario del Proyecto (BOM)
   - Tareas y Cronograma
   - Control de Calidad
   - Finanzas del Proyecto
   - Documentación
   - Time Tracking
   - Cierre del Proyecto

4. **Usuarios Diferentes**
   - PM (Project Manager)
   - Producción
   - Control de Calidad
   - Finanzas
   - Clientes (portal opcional)

---

## 📊 SUBMÓDULOS DEL MÓDULO DE PROYECTOS

### 1️⃣ Información General del Proyecto (Hub Central)

**Ruta:** `/projects/:id`

**Propósito:** Centro de comando del proyecto, vista unificada de estado

**Componentes:**
- `ProjectProfile.tsx` - Página principal del proyecto
- `ProjectProfileHeader.tsx` - Cabecera con acciones principales
- `ProjectKPIsRow.tsx` - KPIs en tiempo real
- `ProjectTimeline.tsx` - Timeline unificado de eventos
- `ProjectFinancialSummary.tsx` - Resumen financiero compacto
- `ProjectBOMCard.tsx` - Vista rápida de materiales
- `ProjectTeamCard.tsx` - Equipo asignado

**Datos Clave:**
- Nombre del proyecto, ID, estado, prioridad
- Cliente vinculado, contacto principal
- Oportunidad y cotización de origen
- Fechas (inicio, fin estimado, fin real)
- Progreso general (%)
- Valor de venta, costo estimado, costo real
- PM responsable, equipo asignado

**Acciones:**
- Editar proyecto
- Cambiar estado (Activo/Pausado/Completado/Cancelado)
- Registrar actividad (nota/llamada/reunión)
- Acceder a submódulos
- Generar reporte ejecutivo

---

### 2️⃣ Órdenes de Trabajo / Producción (Work Orders)

**Ruta:** `/projects/:id/work-orders`

**Propósito:** Gestionar fases de producción en carpintería (Corte → Ensamble → Acabado → Instalación)

**Componentes:**
- `WorkOrdersDirectory.tsx` - Listado de órdenes
- `WorkOrderCard.tsx` - Tarjeta individual
- `CreateWorkOrderDialog.tsx` - Crear orden
- `WorkOrderDetails.tsx` - Detalles completos de orden
- `WorkOrderMaterialsTable.tsx` - Materiales consumidos
- `WorkOrderLaborTable.tsx` - Horas trabajadas por empleado
- `WorkOrderQualityChecks.tsx` - Checklist de calidad

**Datos Clave:**
- Código de orden (OT-001)
- Fase/actividad (ej. "Corte de madera de laurel")
- Responsable (empleado o equipo)
- Estado (Pendiente/En Proceso/Pausado/Completado)
- Fechas estimadas vs reales
- Materiales asignados y consumidos
- Horas trabajadas y costo de mano de obra
- Progreso (%)

**Acciones:**
- Crear nueva orden de trabajo
- Asignar responsable
- Registrar consumo de materiales
- Registrar horas trabajadas (time tracking)
- Marcar como completada
- Ejecutar checklist de calidad

**Integraciones:**
- **Inventario:** Descuenta materia prima al consumir
- **RRHH:** Registra horas trabajadas de empleados
- **Finanzas:** Calcula costo real de la orden
- **Calidad:** Valida antes de cerrar orden

---

### 3️⃣ Inventario del Proyecto (BOM - Bill of Materials)

**Ruta:** `/projects/:id/inventory`

**Propósito:** Controlar materiales necesarios, reservados y consumidos

**Componentes:**
- `ProjectBOMDirectory.tsx` - Vista principal BOM
- `BOMTable.tsx` - Tabla de materiales
- `MaterialConsumptionLog.tsx` - Registro de consumos
- `MaterialReservations.tsx` - Reservas de stock
- `MaterialAlerts.tsx` - Alertas de faltantes

**Datos Clave:**
- Lista de materiales (BOM) desde cotización
- Por cada material:
  - SKU, nombre, descripción
  - Cantidad necesaria (teórica)
  - Cantidad reservada
  - Cantidad consumida (real)
  - Stock disponible
  - Costo unitario, costo total
  - Estado (En Stock/Reservado/Faltante/Necesita Compra)

**Acciones:**
- Reservar materiales al iniciar proyecto
- Registrar consumo real (manual o por escáner)
- Generar PO (Purchase Order) si falta material
- Comparar teórico vs real
- Calcular eficiencia de materiales

**Integraciones:**
- **Inventario Global:** Lee stock, reserva y descuenta
- **Órdenes de Trabajo:** Materiales asignados por orden
- **Finanzas:** Costo de materiales consumidos
- **Compras:** Genera POs automáticas

---

### 4️⃣ Tareas y Cronograma (Project Management)

**Ruta:** `/projects/:id/tasks`

**Propósito:** Gestionar tareas operativas y planificación temporal

**Componentes:**
- `TasksDirectory.tsx` - Vista principal
- `TasksKanban.tsx` - Kanban (Por Hacer/En Progreso/Revisión/Completada)
- `TasksList.tsx` - Lista filtrable de tareas
- `TasksGantt.tsx` - Vista Gantt con dependencias
- `CreateTaskDialog.tsx` - Crear tarea
- `TaskDetails.tsx` - Detalles de tarea individual

**Datos Clave:**
- Título, descripción de la tarea
- Estado (Todo/In Progress/Review/Done/Cancelled)
- Prioridad (Alta/Media/Baja/Urgente)
- Asignado a (empleado)
- Fecha límite (due date)
- Horas estimadas vs reales
- Vinculación opcional a Orden de Trabajo
- Subtareas, dependencias

**Acciones:**
- Crear/editar/eliminar tareas
- Asignar responsables
- Cambiar estado (drag & drop en Kanban)
- Registrar horas trabajadas
- Marcar como completada
- Crear dependencias entre tareas

**Integraciones:**
- **Órdenes de Trabajo:** Tareas ligadas a órdenes
- **RRHH:** Horas trabajadas por empleado
- **Timeline:** Eventos de tareas en timeline

---

### 5️⃣ Control de Calidad (Quality Assurance)

**Ruta:** `/projects/:id/quality`

**Propósito:** Asegurar cumplimiento de estándares de calidad

**Componentes:**
- `QualityDirectory.tsx` - Vista principal
- `QualityChecklist.tsx` - Checklist por fase
- `QualityInspection.tsx` - Registro de inspecciones
- `QualityReport.tsx` - Reporte de calidad
- `QualityEvidence.tsx` - Evidencias (fotos, firmas)

**Datos Clave:**
- Checklists por fase de producción
- Por cada item:
  - Descripción del checkpoint
  - Estado (Pendiente/Aprobado/Rechazado)
  - Responsable de inspección
  - Fecha de inspección
  - Evidencias (fotos geolocalizadas, firmas digitales)
- No conformidades y acciones correctivas

**Acciones:**
- Crear checklist desde plantilla
- Registrar inspección
- Subir evidencias (fotos, documentos)
- Aprobar/Rechazar checkpoint
- Registrar no conformidad
- Crear acción correctiva

**Integraciones:**
- **Órdenes de Trabajo:** No cerrar orden sin QA aprobado
- **Documentos:** Evidencias archivadas
- **Timeline:** Eventos de calidad

---

### 6️⃣ Finanzas del Proyecto (Project Finance)

**Ruta:** `/projects/:id/finance`

**Propósito:** Control financiero detallado del proyecto

**Componentes:**
- `ProjectFinanceDirectory.tsx` - Vista principal
- `FinancialSummary.tsx` - Resumen ejecutivo
- `TransactionsTable.tsx` - Tabla de ingresos/egresos
- `BudgetVsActual.tsx` - Presupuesto vs Real
- `ProfitabilityChart.tsx` - Gráfica de rentabilidad
- `InvoicingActions.tsx` - Generar facturas

**Datos Clave:**
- **Ingresos:**
  - Precio de venta (desde cotización)
  - Anticipos recibidos
  - Pagos parciales
  - Saldo pendiente
- **Egresos:**
  - Costo de materiales consumidos
  - Costo de mano de obra (horas × tarifa)
  - Gastos indirectos (overhead)
  - Subcontratistas
- **KPIs:**
  - Ganancia bruta (venta - costo real)
  - Margen (%)
  - Desviación presupuestal (%)
  - ROI del proyecto

**Acciones:**
- Registrar ingreso (anticipo, pago)
- Registrar gasto (proveedor, subcontratista)
- Generar factura desde proyecto
- Solicitar anticipo al cliente
- Exportar reporte financiero

**Integraciones:**
- **Finanzas Global:** Transacciones sincronizadas
- **Clientes:** Estado de cuenta del cliente
- **Inventario:** Costos de materiales
- **RRHH:** Costos de mano de obra

---

### 7️⃣ Documentación del Proyecto (Document Management)

**Ruta:** `/projects/:id/documents`

**Propósito:** Repositorio centralizado de documentos del proyecto

**Componentes:**
- `DocumentsDirectory.tsx` - Vista principal
- `DocumentsTable.tsx` - Tabla de documentos
- `DocumentUpload.tsx` - Subir documentos (drag & drop)
- `DocumentPreview.tsx` - Vista previa
- `DocumentVersioning.tsx` - Control de versiones

**Datos Clave:**
- Por cada documento:
  - Nombre, tipo (Contrato/Plano/Foto/Certificado)
  - Tamaño, formato
  - Fecha de carga, cargado por
  - Versión (V1, V2, V3...)
  - Tags/etiquetas
  - Permisos (quién puede ver/editar)

**Acciones:**
- Subir documento
- Crear carpetas/categorías
- Previsualizar documento
- Descargar documento
- Compartir con cliente
- Firmar digitalmente
- Versionado (subir nueva versión)

**Integraciones:**
- **Calidad:** Evidencias fotográficas
- **Órdenes de Trabajo:** Planos técnicos
- **Clientes:** Contratos firmados
- **Timeline:** Eventos de documentos

---

### 8️⃣ Cierre del Proyecto (Project Closure)

**Ruta:** `/projects/:id/close`

**Propósito:** Proceso formal de cierre y archivo del proyecto

**Componentes:**
- `ProjectClosureWizard.tsx` - Wizard de cierre (4 pasos)
- `ClosureSummary.tsx` - Resumen final
- `ClosureChecklist.tsx` - Checklist de cierre
- `ClosureReport.tsx` - Reporte ejecutivo final

**Pasos del Cierre:**

**Paso 1: Validaciones**
- Todas las órdenes de trabajo completadas
- Todos los checkpoints de calidad aprobados
- Todos los materiales consumidos registrados
- Todas las horas registradas

**Paso 2: Finanzas**
- Balance financiero final
- Saldo pendiente de cobro
- Rentabilidad real calculada
- Comparación presupuesto vs real

**Paso 3: Documentación**
- Acta de entrega firmada
- Garantías emitidas
- Manuales de uso
- Fotos finales del proyecto

**Paso 4: Retroalimentación**
- Feedback del cliente (NPS, comentarios)
- Lecciones aprendidas
- Recomendaciones para proyectos futuros

**Acciones:**
- Marcar proyecto como Completado
- Generar Reporte Final (PDF)
- Archivar proyecto
- Transferir a histórico
- Notificar a equipo y cliente

**Integraciones:**
- **Todas:** Validaciones finales de todos los submódulos
- **Clientes:** Actualiza historial del cliente
- **Reportes:** Datos para análisis comparativo

---

## 🔄 FLUJO COMPLETO DENTRO DEL MÓDULO PROYECTOS

```
1. CREACIÓN DEL PROYECTO
   ↓
   Desde cotización aceptada → [Lanzar Proyecto]
   - Asistente de Conversión (ProjectConversionService)
   - Reserva automática de inventario
   - Creación de BOM del proyecto
   - Asignación de equipo
   ↓

2. PLANIFICACIÓN
   ↓
   /projects/:id (Hub Central)
   - Crear órdenes de trabajo (/work-orders)
   - Definir tareas y cronograma (/tasks)
   - Asignar responsables
   ↓

3. EJECUCIÓN
   ↓
   Producción en taller:
   - Ejecutar órdenes de trabajo
   - Consumir materiales (/inventory)
   - Registrar horas trabajadas (time tracking)
   - Pasar checkpoints de calidad (/quality)
   ↓

4. CONTROL Y SEGUIMIENTO
   ↓
   Monitoreo continuo:
   - KPIs en tiempo real (progreso, costos)
   - Alertas de desviaciones
   - Finanzas del proyecto (/finance)
   - Documentación de avances (/documents)
   ↓

5. CIERRE
   ↓
   /projects/:id/close
   - Validaciones finales
   - Reporte ejecutivo
   - Feedback del cliente
   - Archivar proyecto
```

---

## 🔗 INTEGRACIONES CON OTROS MÓDULOS

### Proyectos ← Ventas
- **Input:** Cotización aceptada
- **Datos:** Cliente, contacto, ítems, precio de venta, condiciones de pago
- **Acción:** Crear proyecto, vincular oportunidad (Ganada)

### Proyectos ↔ Inventario
- **Reserva:** Al crear proyecto, reserva materiales del BOM
- **Consumo:** Órdenes de trabajo descuentan stock
- **POs:** Si falta material, genera Purchase Orders

### Proyectos ↔ RRHH
- **Asignación:** Empleados asignados al proyecto
- **Time Tracking:** Sesiones de trabajo registradas
- **Costos:** Horas × tarifa horaria = costo laboral

### Proyectos → Finanzas
- **Costos:** Materiales + mano de obra + overhead
- **Ingresos:** Anticipos, pagos del cliente
- **Facturación:** Generar facturas desde proyecto

### Proyectos → Clientes
- **Historial:** Proyectos aparecen en ficha del cliente
- **Timeline:** Eventos del proyecto en timeline del cliente
- **Portal:** Cliente puede ver progreso (opcional)

---

## 📈 MÉTRICAS Y KPIs DEL MÓDULO

### KPIs Globales (Dashboard de Proyectos)
- Total proyectos activos
- Valor total en ejecución
- Proyectos en riesgo (retraso o sobrecosto)
- Rentabilidad promedio
- Tasa de cumplimiento de fechas
- Eficiencia de materiales

### KPIs por Proyecto
- Progreso (%) → tareas completadas / total
- Desviación presupuestal → (real - estimado) / estimado × 100
- Margen de rentabilidad → (venta - costo) / venta × 100
- Retraso (días) → fecha real - fecha estimada
- Eficiencia de materiales → consumo real / consumo teórico
- Productividad → horas reales / horas estimadas

---

## 🎯 CONCLUSIÓN

El **Módulo de Proyectos** es un **módulo independiente de primer nivel** porque:

✅ Tiene **complejidad equivalente** a Clientes, Ventas e Inventario  
✅ Gestiona **8 submódulos** propios con lógica de negocio compleja  
✅ Integra **múltiples áreas** (Ventas, Inventario, RRHH, Finanzas)  
✅ Soporta **todo el ciclo de vida** de ejecución (Planificación → Cierre)  
✅ Tiene **usuarios diferentes** con permisos específicos  
✅ Es **el corazón operativo** del negocio de carpintería  

**NO es submódulo de Ventas**, es el **puente entre Ventas y Entrega**, el **motor de ejecución** del sistema.

---

**📌 Siguiente Paso:** Implementar según `PLAN_ACCION_INMEDIATA_PROYECTOS.md` (Fase 1-5, 11-12 días)
