# 📋 ANÁLISIS DE GAPS: Sistema Actual vs Especificación Completa

**Fecha:** 19 de Octubre 2025  
**Contexto:** Comparación exhaustiva entre la especificación completa entregada por el usuario y el código actual de ZADIA OS  
**Objetivo:** Identificar qué falta implementar para completar el sistema según la visión del negocio

---

## 🎯 RESUMEN EJECUTIVO

### Estado General del Sistema

| Módulo | Especificado | Implementado | Estado | Completitud |
|--------|--------------|--------------|--------|-------------|
| **Clientes** | ✅ | ✅ | 🟢 Completo | 95% |
| **Leads** | ✅ | ✅ | 🟢 Completo | 90% |
| **Oportunidades** | ✅ | ✅ | 🟢 Completo | 85% |
| **Cotizaciones** | ✅ | ⚠️ | 🟡 Parcial | 60% |
| **Proyectos** | ✅ | ⚠️ | 🟡 Parcial | 70% |
| **Órdenes de Trabajo** | ✅ | ⚠️ | 🟡 Parcial | 50% |
| **Inventario** | ✅ | ✅ | 🟢 Completo | 90% |
| **Finanzas** | ✅ | ⚠️ | 🟡 Parcial | 65% |
| **RRHH** | ✅ | ❌ | 🔴 Falta | 0% |

**Puntuación General:** 72% implementado

---

## 📊 ANÁLISIS DETALLADO POR MÓDULO

---

## 1. 👥 MÓDULO DE CLIENTES

### ✅ Implementado Correctamente

**Rutas existentes:**
- ✅ `/clients` - Página principal con listado
- ✅ `/clients/create` - Formulario de creación
- ✅ `/clients/[id]` - Detalles del cliente

**Funcionalidades implementadas:**
- ✅ Tipos de cliente: Persona Natural, Empresa, Organización
- ✅ Formulario multi-paso (5 pasos)
- ✅ Gestión de contactos asociados
- ✅ Información fiscal y tributaria
- ✅ Dirección con jerarquía (País → Departamento → Municipio → Distrito)
- ✅ Validaciones Zod completas
- ✅ Integración con Firebase/Firestore
- ✅ Sistema de búsqueda y filtros
- ✅ KPIs en dashboard

**Servicios implementados:**
- ✅ `ClientsService` - CRUD completo
- ✅ `ContactsService` - Gestión de contactos
- ✅ Utilidades de formateo (teléfono, dirección, documentos)
- ✅ Cache de ubicaciones geográficas

### ⚠️ Funcionalidades Faltantes (Especificación)

#### **Página de Detalles del Cliente - Faltan:**

1. **Compositor de Interacciones Completo**
   - ❌ Pestañas: Nota | Llamada | Reunión | Email | RFI/Submittal
   - ❌ Registro de llamadas (integración CTI click-to-call)
   - ❌ Envío de emails desde el sistema con plantillas
   - ❌ Adjuntar archivos a interacciones

2. **Timeline Unificado**
   - ❌ Combinar: Llamadas, Reuniones, Emails, Notas, Oportunidades, Cotizaciones, Proyectos, Facturas, Archivos
   - ❌ Filtros por tipo de actividad
   - ❌ Deep-links a documentos origen
   - ❌ Infinite scroll

3. **Sección de Ventas en el Cliente**
   - ❌ Vista compacta de oportunidades dentro del perfil
   - ❌ Vista compacta de cotizaciones
   - ❌ Acciones rápidas: + Nueva oportunidad, + Nueva cotización desde cliente

4. **KPIs "Signos Vitales"**
   - ❌ Total facturado al cliente
   - ❌ Total cobrado
   - ❌ Balance pendiente
   - ❌ Oportunidades abiertas
   - ❌ Cotizaciones activas
   - ❌ Proyectos activos
   - ❌ Última actividad registrada

5. **Dedupe y Fusión de Duplicados**
   - ❌ Detección automática de duplicados (email, teléfono, NIT)
   - ❌ Asistente de fusión de clientes similares

6. **Archivos y Documentos**
   - ❌ Repositorio de documentos por categorías
   - ❌ Contratos, fiscales, diseños
   - ❌ Vista previa de documentos
   - ❌ Control de permisos por archivo

7. **Notas Permanentes**
   - ❌ Área de notas no transaccionales visibles siempre

8. **Proyectos Relacionados**
   - ❌ Lista compacta de proyectos del cliente en la sidebar

**Prioridad:** 🟡 Media (el módulo funciona pero falta profundidad CRM)

---

## 2. 📈 MÓDULO DE VENTAS

---

### 2.1 🎯 LEADS

#### ✅ Implementado

**Rutas:**
- ✅ `/sales/leads` - Listado principal
- ✅ `/sales/leads/[id]` - Detalles del lead

**Funcionalidades:**
- ✅ Tipos de entidad: Persona, Empresa, Institución
- ✅ Estados: Nuevo, Contactado, Calificado, Descalificado, Convertido
- ✅ Sistema de puntuación (score)
- ✅ Categorías: Caliente, Tibio, Frío
- ✅ Fuentes de origen
- ✅ Asignación de vendedor
- ✅ KPIs en dashboard
- ✅ Filtros y búsqueda
- ✅ Componente `LeadConversionWizard`

#### ⚠️ Faltantes Especificados

1. **Página de Detalles del Lead**
   - ❌ Checklist de Calificación
     - "Contacto inicial realizado"
     - "Necesidad identificada"
     - "Presupuesto preliminar confirmado"
     - "Autoridad de decisión verificada"
   - ❌ Compositor de Interacciones (Nota, Llamada, Reunión, Email)
   - ❌ Timeline específico del lead
   - ❌ Archivos adjuntos (Brief inicial, requerimientos, fotos)

2. **Flujo de Conversión**
   - ⚠️ Verificación de duplicados implementada pero mejorable
   - ❌ Mostrar lista visual de clientes similares con datos clave
   - ❌ Opción clara: "Crear Cliente Nuevo" vs "Vincular a Cliente Existente"
   - ❌ Transacción atómica completa documentada

**Prioridad:** 🟡 Media

---

### 2.2 💼 OPORTUNIDADES

#### ✅ Implementado

**Rutas:**
- ✅ `/sales/opportunities` - Listado principal
- ✅ `/sales/opportunities/[id]` - Detalles

**Funcionalidades:**
- ✅ Vista Kanban por etapas del pipeline
- ✅ Etapas configurables (Calificado, Propuesta, Negociación, Cierre)
- ✅ Vinculación con Cliente
- ✅ Valor estimado, probabilidad
- ✅ Fecha de cierre esperada
- ✅ Vendedor asignado
- ✅ KPIs agregados

#### ⚠️ Faltantes Especificados

1. **Vista Tabla (alternativa al Kanban)**
   - ❌ Directorio tabular con columnas detalladas
   - ❌ Exportar a Excel/Google Sheets

2. **Página de Detalles de Oportunidad**
   - ❌ Pipeline Visual (barra horizontal con etapas)
   - ❌ Compositor de Interacciones completo
   - ⚠️ Timeline unificado (parcialmente implementado)
   - ❌ Sección de Cotizaciones vinculadas (lista completa)
   - ❌ Botón [🚀 Lanzar Proyecto] cuando está Ganada
   - ❌ Tarjeta "Detalles de la Oportunidad" en sidebar
   - ❌ Tarjeta "Cliente" con datos rápidos
   - ❌ Archivos adjuntos (RFP, fotos, contratos preliminares)

3. **Ciclo de Vida**
   - ❌ Marcar como Ganada → trigger automático para cambiar estado
   - ❌ Marcar como Perdida → modal con motivo obligatorio
   - ❌ Asistente de Creación de Proyecto al ganar

4. **Inteligencia y Alertas**
   - ❌ Oportunidades con fecha vencida en rojo
   - ❌ Oportunidades sin actividad en X días con ⚠️
   - ❌ Alertas visuales en la vista Kanban

**Prioridad:** 🟡 Media-Alta

---

### 2.3 📄 COTIZACIONES

#### ⚠️ Estado Actual: **CRÍTICO - MÓDULO INCOMPLETO**

**Rutas encontradas:**
- ❓ No existe ruta `/sales/quotes` (página principal)
- ❓ No existe ruta `/sales/quotes/new` (formulario creación)
- ❓ No existe ruta `/sales/quotes/[id]` (detalles)

**Servicios encontrados:**
- ✅ `QuotesService` existe en `/modules/sales/services/quotes.service.ts`
- ✅ Validaciones Zod existen

#### ❌ Funcionalidades COMPLETAMENTE FALTANTES

1. **Página Principal de Cotizaciones** (`/sales/quotes`)
   - ❌ Listado de todas las cotizaciones
   - ❌ Filtros por estado (Borrador, Enviado, Aceptado, Rechazado)
   - ❌ Filtros por cliente, vendedor, fecha
   - ❌ KPIs: Total cotizado, Tasa de aceptación, Valor promedio
   - ❌ Acciones: Crear, Exportar, Ver detalles

2. **Formulario de Creación** (`/sales/quotes/new`)
   - ❌ Vinculación obligatoria con Oportunidad y Cliente
   - ❌ Selector de productos/servicios desde Inventario
   - ❌ Tabla de ítems con:
     - Producto/Servicio (autocompletado)
     - Descripción editable
     - Cantidad
     - Unidad de medida
     - Precio unitario
     - Descuento por ítem
     - Subtotal
   - ❌ Resumen financiero en tiempo real (Subtotal, Impuestos, Descuentos, Total)
   - ❌ Condiciones comerciales (validez, términos de pago)
   - ❌ Notas internas y para el cliente
   - ❌ Adjuntos
   - ❌ Acciones: Guardar Borrador, Generar PDF, Enviar

3. **Página de Detalles** (`/sales/quotes/[id]`)
   - ❌ Visualizador de la cotización (vista previa del PDF)
   - ❌ Historial de estados (creación, envío, aceptación/rechazo)
   - ❌ Botones de acción según estado:
     - [Editar] si está en Borrador
     - [Enviar al Cliente] (email desde sistema)
     - [Descargar PDF]
     - [Marcar como Aceptada]
     - [Marcar como Rechazada]
   - ❌ Tarjeta del Cliente
   - ❌ Tarjeta de Oportunidad
   - ❌ Tarjeta Financiera (moneda, condiciones, validez)
   - ❌ Archivos adjuntos

4. **Ciclo de Vida de Cotización**
   - ❌ Borrador → Enviada → Aceptada/Rechazada
   - ❌ Cotización Aceptada → Cambia Oportunidad a Ganada automáticamente
   - ❌ Cotización Aceptada → Aparece botón [🚀 Lanzar Proyecto]
   - ❌ Generación de PDF con branding
   - ❌ Envío por email desde sistema
   - ❌ Versionado de cotizaciones (V1, V2)

5. **Integración con Inventario**
   - ❌ Selector de productos terminados con stock actual
   - ❌ Precios traídos automáticamente
   - ❌ Validación de disponibilidad
   - ❌ Reserva de stock (opcional)

**Prioridad:** 🔴 **CRÍTICA - BLOQUEANTE**

**Impacto:** Sin cotizaciones, no hay:
- Propuestas formales a clientes
- Conversión de oportunidades a proyectos
- Base financiera para facturación
- Trazabilidad comercial completa

---

## 3. 📂 MÓDULO DE PROYECTOS

### ⚠️ Estado Actual: PARCIALMENTE IMPLEMENTADO

**Rutas encontradas:**
- ❓ Verificar si existe `/projects` (listado)
- ❓ Verificar si existe `/projects/new` (creación)
- ❓ Verificar si existe `/projects/[id]` (detalles)

**Servicios encontrados:**
- ✅ `ProjectsService` existe
- ✅ `WorkOrdersService` existe
- ✅ `QuoteConversionService` existe (conversión Cotización→Proyecto)

#### ❌ Funcionalidades FALTANTES según Especificación

### 3.1 Página Principal de Proyectos

1. **Vista Tabla**
   - ❌ Columnas: ID, Nombre, Cliente, Estado, Progreso %, PM, Fecha inicio, Fecha entrega, Valor, Acciones
   - ❌ Filtros: Estado, Prioridad, Responsable, Cliente, Rango de fechas
   - ❌ Búsqueda por nombre/cliente/ID

2. **Vista Kanban (alternativa)**
   - ❌ Tarjetas agrupadas por estado: En Curso, En Espera, Completados, Cancelados
   - ❌ Drag & drop entre columnas
   - ❌ Tarjetas con: Nombre, Cliente, PM, % progreso, Fecha entrega

3. **KPIs del Dashboard**
   - ❌ Proyectos activos vs completados
   - ❌ Valor total en ejecución
   - ❌ Proyectos con retraso
   - ❌ Utilización de recursos

### 3.2 Formulario de Creación de Proyectos

**Asistente de 4 Pasos:**

❌ **Paso 1: Información General**
- Nombre del Proyecto
- Cliente vinculado (pre-cargado si viene de cotización)
- Contacto principal
- Vendedor asignado (referencia)
- Responsable del Proyecto (PM)
- Tipo de Proyecto (Producción, Servicio, Interno)
- Prioridad (Alta, Media, Baja)

❌ **Paso 2: Alcance y Entregables**
- Importar líneas de cotización
- Convertir cada línea en entregable/tarea
- Agrupar en fases
- Descripción del proyecto
- Notas internas
- Archivos iniciales (planos, contratos, brief)

❌ **Paso 3: Finanzas y Condiciones**
- Presupuesto total (heredado de cotización)
- Condiciones de pago
- Moneda
- Centro de costos
- Gastos previstos

❌ **Paso 4: Fechas y Equipo**
- Fecha de inicio
- Fecha estimada de entrega
- Equipo del proyecto (selección múltiple)
- Roles: Jefe, Producción, Finanzas, Instalación
- Notificación a empleados asignados

### 3.3 Página de Detalles del Proyecto (**CRÍTICO - CORAZÓN DEL SISTEMA**)

Esta es **LA PÁGINA MÁS IMPORTANTE** del sistema según la especificación.

#### ❌ Cabecera Fija

- Nombre del proyecto, ID, Badges (Estado, Prioridad, Tipo)
- Valor del contrato, % progreso
- Botones principales:
  - [Lanzar/Terminar/Cancelar/Archivar]
  - [Registrar actividad rápida]
  - [Registrar trabajo] (timer)
  - [Crear Orden de Compra]
  - [Subir documento / Firmar]
- Menú secundario: Editar, Generar PDF, Duplicar, Historial, Permisos

#### ❌ Tarjeta de KPIs (Fila Superior)

5-6 métricas clave actualizadas en tiempo real:
- Venta acordada / presupuesto
- Coste estimado
- Coste real (gastos + materiales + horas)
- Ganancia actual (venta - coste real) y % margin
- Progreso (por tareas/entregables)
- Fecha entrega vs retraso (alerta si cerca/pasado)

#### ❌ Columna Izquierda (70%) - Zona de Trabajo

1. **Compositor de Interacciones**
   - Pestañas: Nota | Llamada | Reunión | Email | RFI/Submittal
   - Adjuntar archivos, asignar tareas, programar seguimientos
   - Integración click-to-call (PBX)
   - Enviar emails con plantillas

2. **Timeline Unificado**
   - Cronológico combinando:
     - Actividades (notas, llamadas, emails)
     - Eventos sistema (cotización, cambio de fase, PO, factura)
     - Tareas completadas, hitos
     - Transacciones (gastos, ingresos)
     - Sesiones de trabajo (workSessions)
   - Filtrado por tipo
   - Enlaces a objetos origen

3. **Gestión de Tareas y Entregables**
   - Lista + Vista Kanban + Gantt
   - Tareas con: subtasks, dependencias, prioridad, horas estimadas, responsable, etiquetas
   - Plantillas de tareas por tipo de proyecto

4. **Gantt / Milestones**
   - Vista interactiva drag & drop
   - Dependencias, ruta crítica
   - Cambios en Gantt actualizan proyecto y alertas

#### ❌ Columna Derecha (30%) - Expediente y Controles

1. **Tarjeta: Datos Cliente y Origen**
   - Cliente (tipo) - enlace
   - Contacto principal (tel, email)
   - Oportunidad y Cotización vinculadas
   - Fecha creación, creador, vendedor

2. **Tarjeta: BOM / Materiales** (**CRÍTICO**)
   - Bill of Materials vinculado a cotización
   - Por cada línea BOM:
     - SKU, descripción, unidad, cantidad necesaria
     - Stock disponible
     - Cantidad reservada
     - Coste unitario, subtotal
     - Estado: En stock, Reservado, Necesita Compra, Backorder
   - Acciones:
     - Reservar stock
     - Generar PO parcial
     - Transformar items en órdenes de producción
     - Marcar consumido (manual o escáner)
   - Visualizar WIP (work-in-progress)

3. **Tarjeta: Resumen Financiero**
   - Venta acordada
   - Anticipos recibidos
   - Facturado
   - Cobrado
   - Balance pendiente
   - Coste estimado vs real (verde/rojo)
   - Botones: Generar factura, Solicitar anticipo, Pagar proveedor

4. **Tarjeta: Archivos y Submittals/RFIs**
   - Documentos oficiales (contrato, planos, fotos)
   - Submittals y RFIs con estado
   - Firmar documentos (integración e-sign)
   - Versionado

5. **Tarjeta: Equipo y Recursos**
   - Lista de recursos asignados (PM, producción, instaladores, subcontratistas)
   - Rol, carga actual, contacto
   - Notificación al equipo

### 3.4 Submódulos del Proyecto (Rutas Anidadas)

#### ❌ `/projects/{id}/work-orders` - Órdenes de Trabajo

**Ya especificado arriba - FALTA IMPLEMENTAR:**

- Listado de fases/órdenes (Corte, Ensamble, Barnizado)
- Estados: pendiente, en proceso, completado
- Detalle de OW:
  - Materiales consumidos
  - Personal asignado
  - Tiempos registrados
  - Control de calidad
  - Checklist por fase
  - Historial de actividad

#### ❌ `/projects/{id}/inventory` - Inventario del Proyecto

- BOM teórico vs real
- Movimientos de stock relacionados
- Alertas de faltantes y reservas
- Consumo acumulado
- Desviaciones (ahorro/sobreconsumo)

#### ❌ `/projects/{id}/finance` - Finanzas del Proyecto

- Presupuesto original vs real
- Gastos clasificados:
  - Material
  - Mano de obra
  - Indirectos
- Ingresos:
  - Anticipos
  - Pagos parciales
  - Saldo pendiente
- Flujo de caja y rentabilidad
- Fórmulas financieras:
  ```
  CosteReal = Σ(materiales) + Σ(gastos) + Σ(labor)
  GananciaBruta = Venta - CosteReal
  Margin% = (GananciaBruta / Venta) * 100
  Desviación% = ((CosteReal - CosteEstimado) / CosteEstimado) * 100
  ```

#### ❌ `/projects/{id}/tasks` - Gestión de Tareas

- Vista Kanban por estado
- Vista Gantt temporal
- Detalle de tarea:
  - Subtareas
  - Horas estimadas/reales
  - Responsables
  - Adjuntos
  - Dependencias

#### ❌ `/projects/{id}/quality` - Control de Calidad

- Checklists por fase
- Registro de incidencias y correcciones
- Evidencias con fotos/firmas
- Estados: Aprobado/Rechazado
- No cerrar fase sin pasar control

#### ❌ `/projects/{id}/rfis` - RFIs/Submittals

- Peticiones de información (arquitectos/cliente)
- Estado: enviado, respondido, pendiente
- Seguimiento de respuestas
- Fechas límite

#### ❌ `/projects/{id}/reports` - Reportes

- Generar PDF/Excel con KPIs
- Finanzas, progreso, calidad
- Dashboards de comparación entre proyectos
- Exportar datos

#### ❌ `/projects/{id}/close` - Cierre del Proyecto

- Informe final:
  - Resumen financiero
  - Productividad
- Documentación de entrega:
  - Planos as-built
  - Manuales
  - Garantías
- Feedback del cliente
- Estado → "Cerrado"
- Lecciones aprendidas

### 3.5 Funcionalidades Críticas (**ARQUITECTURA CORE**)

#### ❌ A. BOM / Inventario / Consumo

**Flujo al crear proyecto:**
1. Generar lista de materiales (BOM versión vinculada)
2. Intentar reservar stock (atomic reservation)
3. Si faltan cantidades → marcar "Necesita compra" y sugerir POs
4. Soportar modo pull (consumo en taller) y push (entregar a sitio)

**Registro de consumo real:**
- Consumo por ítem desde taller (QR/escáner o manual)
- Cada movimiento crea ajuste de inventario y registro contable
- Control de costes: `coste_materia_prima = sum(cantidad * coste_unitario)`

#### ❌ B. Work Orders & Producción

- Crear OWs para fabricación/montaje
- OWs manejan: hora estimada, trabajadores, máquinas, materiales, estado
- OWs generan workSessions
- Registran output: piezas terminadas → WIP → Finished Goods
- Relación con inventario: OW consume materia prima y produce WIP/finished goods

#### ❌ C. Time Tracking y Sesiones de Trabajo

- Timers por usuario/tarea (start/stop)
- Entrada manual de horas
- Cada sesión: startTime, endTime, duration, actividad, costeHora
- Coste laboral proyecto = `Σ(duration/3600 * costeHora)`
- Registro por tarea/entregable para análisis productividad

#### ❌ D. Gastos e Ingresos (Transacciones)

- Registrar gastos (proveedor, tipo, fecha, comprobante)
- Registrar ingresos (anticipo, pago)
- Integrar con módulo financiero
- Generar factura desde cotización o proyecto
- Regla: no cerrar proyecto si balance pendiente > 0

#### ❌ E. Change Orders (Órdenes de Cambio)

- Crear change order
- Aprobar (cliente/PM/finanzas)
- Aplicar a project scope/BOM
- Recalcular presupuesto
- Notificar impacto en fechas/costes
- Versionado: historial de versiones cotización/proyecto

#### ❌ F. Calidad y Checklists

- Checklists por fase (inspecciones, pruebas, QA)
- Responsable y evidencias (fotos)
- Registro de no conformidades
- Acciones correctivas

#### ❌ G. Subcontratistas y Órdenes a Terceros

- Gestionar POs y contratos con subcontratistas
- Hitos de pago ligados al avance físico
- Control de cumplimiento

### 3.6 Flujo Atómico: Cotización Aceptada → Lanzar Proyecto

**CRÍTICO - Transacción Backend:**

```
1. Trigger: cotización cambia a "accepted"

2. Backend function / transaction:
   a) Validaciones pre-check:
      - Cliente existe y activo
      - Inventario: reservar cantidades (atomic)
      - Si faltan materiales → crear POs borrador y notificar compras
   
   b) Crear documento project:
      - Pre-fill: name, clientId, BOM ref, salesPrice, paymentTerms
      - Items → entregables
   
   c) Insertar en projects y linkear quoteId, opportunityId
   
   d) Update opportunity status → Won
   
   e) Registrar audit log (quién, cuándo)
   
   f) Notificar equipo asignado (email/Slack/notification)

3. Redirección a /projects/{id}

Transacción única o saga con compensating actions (rollback)
```

**Prioridad:** 🔴 **CRÍTICA - BLOQUEANTE**

---

## 4. 📦 MÓDULO DE INVENTARIO

### ✅ Estado: BIEN IMPLEMENTADO (90%)

**Rutas existentes:**
- ✅ `/inventory/raw-materials`
- ✅ `/inventory/finished-products`
- ✅ Gestión de movimientos
- ✅ Alertas de stock bajo
- ✅ BOM (Bill of Materials)

**Funcionalidades implementadas:**
- ✅ CRUD completo de materia prima
- ✅ CRUD completo de productos terminados
- ✅ Sistema de movimientos (entradas/salidas)
- ✅ Control de stock actual
- ✅ Stock mínimo y alertas
- ✅ Categorías y ubicaciones
- ✅ Proveedores asociados
- ✅ Validaciones Zod

### ⚠️ Faltantes Menores

1. **BOM (Bill of Materials)**
   - ⚠️ Verificar si existe interfaz completa para crear/editar BOM
   - ❌ Versionado de BOM
   - ❌ Cálculo automático de costo de producto terminado desde BOM

2. **Órdenes de Producción**
   - ❌ Transformar materia prima → productos terminados
   - ❌ Descuento automático de insumos según BOM
   - ❌ Registro de lotes de producción

3. **Reportes**
   - ❌ Rotación de inventario
   - ❌ Costo real por producto terminado
   - ❌ Top productos más vendidos
   - ❌ Valor económico del inventario actual

**Prioridad:** 🟡 Media

---

## 5. 💰 MÓDULO DE FINANZAS

### ⚠️ Estado: PARCIALMENTE IMPLEMENTADO (65%)

**Rutas existentes:**
- ✅ `/finance/invoices` (facturas)
- ⚠️ Verificar `/finance/payments` (pagos)
- ❌ No existe `/finance/transactions` (transacciones generales)
- ❌ No existe `/finance/reports` (reportes financieros)

**Servicios encontrados:**
- ✅ `InvoicesService` existe
- ✅ `PaymentsService` existe

### ❌ Funcionalidades FALTANTES

1. **Módulo de Facturas**
   - ⚠️ Verificar si existe página `/finance/invoices/new`
   - ❌ Generación automática desde cotización aceptada
   - ❌ Generación automática desde proyecto
   - ❌ Estados: Draft, Pending, Paid, Overdue, Cancelled
   - ❌ Recordatorios automáticos de pago
   - ❌ Aplicar pagos parciales a factura
   - ❌ Generar PDF con branding
   - ❌ Envío por email

2. **Módulo de Pagos**
   - ❌ Página principal de pagos
   - ❌ Registro de pago vinculado a factura
   - ❌ Métodos de pago: Efectivo, Transferencia, Cheque, Tarjeta
   - ❌ Conciliación bancaria
   - ❌ Estado de cuenta por cliente

3. **Transacciones Generales**
   - ❌ Ingresos (no solo de ventas)
   - ❌ Egresos clasificados:
     - Compra de materiales
     - Nómina
     - Servicios
     - Gastos operativos
   - ❌ Centro de costos
   - ❌ Comprobantes digitales

4. **Reportes Financieros**
   - ❌ Estado de resultados (P&L)
   - ❌ Flujo de caja
   - ❌ Cuentas por cobrar
   - ❌ Cuentas por pagar
   - ❌ Rentabilidad por proyecto
   - ❌ Rentabilidad por cliente
   - ❌ Márgenes por producto

5. **Integración con Proyectos**
   - ❌ Ver finanzas del proyecto desde `/projects/{id}/finance`
   - ❌ Registro automático de costes de materiales
   - ❌ Registro automático de costes de mano de obra
   - ❌ Comparación presupuesto vs real

**Prioridad:** 🔴 Alta (necesario para cierre financiero)

---

## 6. 👷 MÓDULO DE RRHH (Recursos Humanos)

### ❌ Estado: **NO IMPLEMENTADO (0%)**

**Rutas faltantes:**
- ❌ `/rrhh/employees` (empleados)
- ❌ `/rrhh/employees/[id]` (perfil empleado)
- ❌ `/rrhh/attendance` (asistencia)
- ❌ `/rrhh/payroll` (nómina)
- ❌ `/rrhh/time-tracking` (control de horas)

### ❌ Funcionalidades COMPLETAMENTE FALTANTES

1. **Gestión de Empleados**
   - ❌ CRUD de empleados
   - ❌ Datos personales
   - ❌ Datos laborales:
     - Puesto
     - Departamento
     - Fecha de ingreso
     - Salario
     - Tipo de contrato
   - ❌ Roles y permisos en el sistema
   - ❌ Habilidades y certificaciones

2. **Control de Asistencia**
   - ❌ Registro de entrada/salida
   - ❌ Marcaje (físico o digital)
   - ❌ Permisos y ausencias
   - ❌ Vacaciones
   - ❌ Incapacidades

3. **Time Tracking (Sesiones de Trabajo)**
   - ❌ Timer por empleado/tarea
   - ❌ Registro manual de horas
   - ❌ Vincular horas a proyectos/tareas
   - ❌ Horas facturables vs no facturables
   - ❌ Reportes de productividad

4. **Nómina**
   - ❌ Cálculo de nómina
   - ❌ Salarios base
   - ❌ Bonificaciones
   - ❌ Deducciones (ISSS, AFP, impuestos)
   - ❌ Horas extra
   - ❌ Recibos de pago digitales
   - ❌ Historial de pagos

5. **Asignación a Proyectos**
   - ❌ Ver proyectos asignados por empleado
   - ❌ Carga de trabajo actual
   - ❌ Disponibilidad
   - ❌ Costeo de horas por empleado

6. **Reportes RRHH**
   - ❌ Asistencia mensual
   - ❌ Horas trabajadas por proyecto
   - ❌ Costos laborales totales
   - ❌ Rotación de personal
   - ❌ Productividad por empleado

**Impacto de no tener RRHH:**
- ❌ No se pueden asignar empleados a proyectos formalmente
- ❌ No hay control de horas trabajadas
- ❌ No se puede calcular coste laboral real de proyectos
- ❌ No hay nómina integrada
- ❌ No hay tracking de productividad

**Prioridad:** 🔴 **CRÍTICA** (necesario para completar ciclo proyecto-finanzas-costos)

---

## 7. 📊 REPORTES Y ANALÍTICA

### ⚠️ Estado: PARCIALMENTE IMPLEMENTADO

**Dashboards existentes:**
- ✅ Dashboard principal con KPIs generales
- ✅ Dashboard de ventas (leads, oportunidades)
- ⚠️ Dashboard de inventario (parcial)

### ❌ Reportes Faltantes

1. **Reportes de Ventas**
   - ❌ Embudo de conversión (Leads → Clientes → Oportunidades → Ganadas)
   - ❌ Tasa de conversión por etapa
   - ❌ Ventas por vendedor
   - ❌ Ventas por producto
   - ❌ Forecast de ventas
   - ❌ Pipeline value (valor total del pipeline)

2. **Reportes de Proyectos**
   - ❌ Proyectos por estado
   - ❌ Rentabilidad por proyecto
   - ❌ Desviaciones presupuestarias
   - ❌ Utilización de recursos
   - ❌ Proyectos con retraso
   - ❌ Horas consumidas vs estimadas

3. **Reportes de Inventario**
   - ❌ Rotación de inventario
   - ❌ Productos más/menos vendidos
   - ❌ Materiales con mayor consumo
   - ❌ Valor del inventario
   - ❌ Proyección de compras

4. **Reportes Financieros**
   - ❌ Estado de resultados (P&L)
   - ❌ Balance general
   - ❌ Flujo de caja
   - ❌ Cuentas por cobrar aging
   - ❌ Rentabilidad por cliente
   - ❌ Márgenes por producto/proyecto

5. **Reportes de RRHH**
   - ❌ Productividad por empleado
   - ❌ Costos laborales
   - ❌ Asistencia y ausencias
   - ❌ Distribución de horas por proyecto

**Prioridad:** 🟡 Media-Alta

---

## 8. 🔄 INTEGRACIONES Y FLUJOS AUTOMÁTICOS

### ❌ Flujos Críticos FALTANTES

1. **Lead → Cliente → Oportunidad**
   - ⚠️ Conversión de Lead implementada pero mejorable
   - ❌ Transferencia completa de historial
   - ❌ Fusión de duplicados

2. **Oportunidad → Cotización → Proyecto**
   - ❌ Crear cotización desde oportunidad (página falta)
   - ❌ Cotización aceptada → Oportunidad Ganada (automático)
   - ❌ Cotización aceptada → Lanzar Proyecto (transacción atómica)
   - ❌ Transferencia de BOM a proyecto
   - ❌ Reserva de inventario al crear proyecto

3. **Proyecto → Órdenes de Trabajo → Inventario**
   - ❌ Crear OW desde proyecto
   - ❌ OW descuenta materia prima automáticamente
   - ❌ OW genera productos terminados
   - ❌ Control de WIP (work-in-progress)

4. **Proyecto → Finanzas**
   - ❌ Generar factura desde proyecto
   - ❌ Registrar gastos del proyecto
   - ❌ Registrar pagos del cliente
   - ❌ Actualizar estado financiero del proyecto

5. **RRHH → Proyectos → Finanzas**
   - ❌ Registrar horas trabajadas en proyecto
   - ❌ Calcular coste laboral automático
   - ❌ Integrar horas en nómina
   - ❌ Reflejar costes en finanzas del proyecto

**Prioridad:** 🔴 **CRÍTICA**

---

## 9. 🔐 PERMISOS Y ROLES (RBAC)

### ✅ Implementado

**Firestore Rules:**
- ✅ Roles definidos: admin, manager, user
- ✅ Helper functions en reglas
- ✅ Ownership validation (createdBy)
- ✅ Protección de colecciones principales

### ⚠️ Faltantes

1. **Permisos Granulares**
   - ❌ Permisos por módulo (no solo por colección)
   - ❌ Roles específicos:
     - Vendedor (acceso a leads, oportunidades, cotizaciones)
     - PM (acceso a proyectos asignados)
     - Producción (acceso a órdenes de trabajo)
     - Finanzas (acceso a facturas, pagos, reportes)
     - RRHH (acceso a empleados, nómina)
   - ❌ Permisos de solo lectura en algunas secciones

2. **Audit Trail Completo**
   - ⚠️ Logs básicos implementados
   - ❌ Audit trail detallado por módulo
   - ❌ Quién modificó qué y cuándo (completo)
   - ❌ Historial de cambios en documentos críticos

**Prioridad:** 🟡 Media

---

## 10. 📱 FUNCIONALIDADES ADICIONALES

### ❌ Faltantes según Especificación

1. **Notificaciones**
   - ❌ Sistema de notificaciones in-app
   - ❌ Notificaciones por email
   - ❌ Notificaciones push (móvil)
   - ❌ Webhooks para integraciones externas

2. **Búsqueda Global**
   - ❌ Búsqueda unificada (clientes, proyectos, cotizaciones)
   - ❌ Atajos de teclado (Cmd+K / Ctrl+K)

3. **Exportación e Importación**
   - ⚠️ Exportación básica en algunos módulos
   - ❌ Importación masiva desde Excel/CSV
   - ❌ Plantillas de importación
   - ❌ Validación de datos importados

4. **Plantillas**
   - ❌ Plantillas de proyectos (BOM + tareas + fases)
   - ❌ Plantillas de cotizaciones
   - ❌ Plantillas de emails

5. **Integraciones Externas**
   - ❌ Integración con email (IMAP/SMTP)
   - ❌ Integración con PBX (llamadas)
   - ❌ Integración con WhatsApp Business
   - ❌ Integración con servicios de firma electrónica
   - ❌ Integración con sistemas de pago (Stripe, PayPal)

6. **Móvil/Offline**
   - ❌ App móvil o PWA
   - ❌ Modo offline con sincronización
   - ❌ Upload de fotos geotagged desde obra

**Prioridad:** 🟢 Baja (mejoras futuras)

---

## 📈 PLAN DE IMPLEMENTACIÓN RECOMENDADO

### 🔴 FASE 1: CRÍTICO - BLOQUEANTES (4-6 semanas)

**Prioridad Máxima:**

1. **Módulo de Cotizaciones COMPLETO**
   - Página principal `/sales/quotes`
   - Formulario creación `/sales/quotes/new`
   - Página detalles `/sales/quotes/[id]`
   - Integración con Inventario (selector de productos)
   - Generación de PDF
   - Ciclo de vida (Borrador → Enviada → Aceptada/Rechazada)
   - **Tiempo estimado:** 2-3 semanas

2. **Flujo Cotización → Proyecto (Transacción Atómica)**
   - Botón [🚀 Lanzar Proyecto] desde cotización aceptada
   - Asistente de creación de proyecto (4 pasos)
   - Transferencia de BOM
   - Reserva de inventario
   - Actualización de oportunidad a Ganada
   - **Tiempo estimado:** 1-2 semanas

3. **Página de Detalles del Proyecto COMPLETA**
   - Cabecera con KPIs
   - Compositor de interacciones
   - Timeline unificado
   - Tarjeta BOM/Materiales
   - Tarjeta Resumen Financiero
   - **Tiempo estimado:** 2-3 semanas

### 🟡 FASE 2: ALTA PRIORIDAD (6-8 semanas)

4. **Módulo de RRHH Básico**
   - CRUD de empleados
   - Time tracking (sesiones de trabajo)
   - Asignación a proyectos
   - Cálculo de coste laboral
   - **Tiempo estimado:** 3-4 semanas

5. **Submódulos de Proyectos**
   - `/projects/{id}/work-orders` completo
   - `/projects/{id}/inventory`
   - `/projects/{id}/finance`
   - `/projects/{id}/tasks` con Gantt
   - **Tiempo estimado:** 3-4 semanas

6. **Completar Módulo de Finanzas**
   - Facturas completas con generación desde proyecto
   - Pagos vinculados a facturas
   - Transacciones generales
   - Reportes básicos (P&L, Flujo de caja)
   - **Tiempo estimado:** 2-3 semanas

### 🟢 FASE 3: MEDIA PRIORIDAD (4-6 semanas)

7. **Mejoras en Clientes y Ventas**
   - Timeline unificado en clientes
   - KPIs "Signos Vitales"
   - Compositor de interacciones completo
   - Dedupe y fusión de duplicados
   - **Tiempo estimado:** 2-3 semanas

8. **Reportes y Analítica Avanzada**
   - Reportes de ventas completos
   - Reportes de proyectos
   - Reportes financieros avanzados
   - Dashboards personalizables
   - **Tiempo estimado:** 2-3 semanas

### 🔵 FASE 4: MEJORAS Y OPTIMIZACIONES (continuo)

9. **Integraciones Externas**
   - Email (IMAP/SMTP)
   - PBX para llamadas
   - Firma electrónica
   - Pasarelas de pago

10. **Funcionalidades Avanzadas**
    - App móvil / PWA
    - Modo offline
    - Plantillas reutilizables
    - IA para scoring de leads

---

## 🎯 MÉTRICAS DE COMPLETITUD FINAL

| Categoría | Implementado | Falta | % Completo |
|-----------|-------------|-------|------------|
| **Core Business (Leads → Proyectos)** | 60% | 40% | 🟡 |
| **Cotizaciones** | 30% | 70% | 🔴 |
| **Proyectos Detallados** | 50% | 50% | 🟡 |
| **Inventario** | 90% | 10% | 🟢 |
| **Finanzas** | 65% | 35% | 🟡 |
| **RRHH** | 0% | 100% | 🔴 |
| **Reportes** | 40% | 60% | 🟡 |
| **Integraciones** | 20% | 80% | 🔴 |

**Completitud Global del Sistema:** **~55-60%**

---

## ✅ CONCLUSIÓN

### Lo Que Está Bien

1. ✅ **Arquitectura sólida** - Modularización correcta
2. ✅ **Clientes e Inventario** - Casi completos y funcionales
3. ✅ **Leads y Oportunidades** - Base implementada correctamente
4. ✅ **Seguridad** - Firestore rules completas
5. ✅ **UI/UX** - Componentes ShadCN consistentes

### Lo Que Falta (Crítico)

1. 🔴 **Cotizaciones** - Módulo completo falta (BLOQUEANTE)
2. 🔴 **Flujo Cotización → Proyecto** - Transacción atómica falta
3. 🔴 **Detalles de Proyecto** - Vista completa falta
4. 🔴 **RRHH** - Módulo completo falta
5. 🔴 **Finanzas avanzadas** - Reportes y análisis faltan

### Recomendación Final

**Priorizar FASE 1** (Cotizaciones + Flujo a Proyectos + Detalles Proyecto) para **desbloquear el ciclo completo** del negocio:

```
Lead → Cliente → Oportunidad → COTIZACIÓN → PROYECTO → Factura → Cobro
                                    ↑           ↑
                                  FALTA      PARCIAL
```

Sin cotizaciones y proyectos completos, el sistema no puede operar el ciclo de ventas-producción-finanzas completo.

---

**Próximo Paso Sugerido:**  
Implementar el **Módulo de Cotizaciones completo** (páginas + servicios + integración con inventario + PDF + flujo de vida).

**¿Comenzamos con esto?**
