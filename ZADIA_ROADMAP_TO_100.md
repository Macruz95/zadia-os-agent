# ZADIA OS: Roadmap a la Excelencia (100%)

Este documento define la hoja de ruta técnica para transformar ZADIA OS de un "ERP Reactivo" a un "Sistema Operativo Agéntico Proactivo", cerrando las brechas identificadas en la auditoría.

## 🎯 Objetivo Final
Lograr una **"Fuente Única de Verdad Automatizada"** donde cada acción (crear gasto, cerrar tarea, ganar lead) desencadene una cascada de actualizaciones y análisis automáticos sin intervención humana.

---

## 🏗️ Fase 1: El Sistema Nervioso (Reactividad Backend)
**Prioridad:** Crítica (Inmediata)
**Objetivo:** Que los datos se actualicen solos.

### 1.1. Triggers de Proyectos (`functions/src/triggers/projects.ts`)
*   **`onExpenseWrite`:**
    *   Al crear/borrar/editar un gasto -> Recalcular `budgetSpent` y `remainingBudget` del proyecto.
    *   *Si `budgetSpent > budget`* -> Disparar alerta al Agente Financiero.
*   **`onTaskWrite`:**
    *   Al completar tarea -> Recalcular `% completado` del proyecto.
    *   *Si todas las tareas están completas* -> Sugerir cierre de proyecto.

### 1.2. Triggers de Ventas (`functions/src/triggers/sales.ts`)
*   **`onOpportunityWrite`:**
    *   Al ganar oportunidad (`status: won`) -> **Crear Proyecto Automáticamente** (copiando datos del cliente y presupuesto).
    *   Al perder oportunidad -> Solicitar "Post-Mortem" al Agente de Ventas.

---

## 🤖 Fase 2: La Flota Agéntica (Expansión)
**Prioridad:** Alta
**Objetivo:** Agentes especializados que "viven" en el backend.

### 2.1. Agente Gestor de Proyectos (`ProjectManagerAgent`)
*   **Rol:** Guardián de la ejecución.
*   **Trigger:** Se activa diariamente o cuando el progreso se estanca.
*   **Acción:** Revisa fechas límite vs. progreso real. Alerta sobre cuellos de botella.

### 2.2. Agente de Ventas (`SalesAgent`)
*   **Rol:** Coach de pipeline.
*   **Trigger:** Se activa cuando un lead no se mueve en 7 días.
*   **Acción:** Sugiere el siguiente paso o correo de seguimiento.

---

## 🔌 Fase 3: Conectividad Universal (Orquestación)
**Prioridad:** Media (Estratégica)
**Objetivo:** Salir de la "caja" de ZADIA.

### 3.1. Servicio de Webhooks (`WebhookService`)
*   Crear endpoint seguro `POST /api/webhooks/n8n` para recibir datos externos.
*   Crear sistema de `OutgoingWebhooks` en Firestore para que ZADIA notifique a n8n (ej: "Nuevo Cliente" -> n8n -> Email de Bienvenida).

---

## 📅 Plan de Ejecución Inmediato (Siguiente Paso)

Comenzaremos con la **Fase 1.1 (Triggers de Proyectos)** para resolver tu preocupación principal: que el sistema se actualice solo.

### Archivos a Crear/Modificar:
1.  `functions/src/index.ts` (Punto de entrada de exportaciones)
2.  `functions/src/triggers/project-triggers.ts` (Lógica de negocio)
3.  `functions/src/utils/firebase-utils.ts` (Helpers)

### Verificación:
Crearemos un gasto de prueba y verificaremos que el presupuesto del proyecto se actualice en Firestore sin tocar el cliente.
