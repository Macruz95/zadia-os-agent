# 🎯 PLAN DE ACCIÓN INMEDIATA - MÓDULO PROYECTOS

**Objetivo:** Implementar el Módulo de Proyectos para cerrar la brecha del 20% y alcanzar 88%+ del sistema completo  
**Prioridad:** CRÍTICA - Bloqueador del flujo completo  
**Tiempo Estimado:** 11-12 días  
**Fecha Inicio:** 16 de Octubre, 2025

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN

### 🔹 FASE 1: FUNDAMENTOS (Días 1-3)

#### Día 1: Estructura y Tipos
- [ ] Crear estructura de carpetas `src/modules/projects/`
- [ ] Crear `types/projects.types.ts` con todas las interfaces
- [ ] Crear `validations/projects.validation.ts` con esquemas Zod
- [ ] Testing: Validar que los tipos compilen sin errores

#### Día 2: Servicio Principal
- [ ] Crear `services/projects.service.ts`
  - [ ] Método `createProject()`
  - [ ] Método `getProjectById()`
  - [ ] Método `searchProjects()`
  - [ ] Método `updateProjectStatus()`
  - [ ] Método `updateProgress()`
  - [ ] Método `updateCosts()`
- [ ] Testing: Probar CRUD básico

#### Día 3: Reglas Firestore
- [ ] Actualizar `firestore.rules` con reglas de proyectos
- [ ] Actualizar `firestore.indexes.json` con índices necesarios
- [ ] Deploy de reglas: `firebase deploy --only firestore:rules`
- [ ] Testing: Verificar permisos por rol

---

### 🔹 FASE 2: LISTADO DE PROYECTOS (Días 4-5)

#### Día 4: Hook y Componentes Base
- [ ] Crear `hooks/use-projects.ts`
- [ ] Crear `components/ProjectsHeader.tsx`
- [ ] Crear `components/ProjectsKPICards.tsx`
- [ ] Crear `components/ProjectFilters.tsx`
- [ ] Testing: Verificar que los componentes rendericen

#### Día 5: Tabla y Página
- [ ] Crear `components/ProjectsTable.tsx`
- [ ] Crear `components/ProjectsDirectory.tsx`
- [ ] Crear `app/(main)/projects/page.tsx`
- [ ] Testing: Navegar a `/projects` y verificar listado

---

### 🔹 FASE 3: DETALLES DEL PROYECTO (Días 6-8)

#### Día 6: Hook de Detalles
- [ ] Crear `hooks/use-project-profile.ts`
- [ ] Crear `services/projects.service.ts::getProjectTimeline()`
- [ ] Testing: Cargar proyecto individual

#### Día 7: Componentes de Detalles
- [ ] Crear `components/ProjectProfileHeader.tsx`
- [ ] Crear `components/ProjectKPIsRow.tsx`
- [ ] Crear `components/ProjectFinancialSummary.tsx`
- [ ] Crear `components/ProjectTimeline.tsx`

#### Día 8: Página de Detalles
- [ ] Crear `components/ProjectProfile.tsx`
- [ ] Crear `app/(main)/projects/[id]/page.tsx`
- [ ] Testing: Navegar a `/projects/:id` y verificar datos

---

### 🔹 FASE 4: CONVERSIÓN COTIZACIÓN → PROYECTO (Días 9-10)

#### Día 9: Servicio de Conversión
- [ ] Crear `services/project-conversion.service.ts`
  - [ ] Método `convertQuoteToProject()`
  - [ ] Método `createWorkOrdersFromConversion()`
  - [ ] Método `recordConversion()`
- [ ] Testing: Probar transacción atómica

#### Día 10: Integración con Wizard Existente
- [ ] Conectar `QuoteAcceptanceWizard` con `ProjectConversionService`
- [ ] Actualizar `use-quote-acceptance.ts` para llamar conversión real
- [ ] Testing: Flujo completo Cotización → Proyecto

---

### 🔹 FASE 5: ÓRDENES DE TRABAJO (Días 11-12)

#### Día 11: Servicio y Hook
- [ ] Crear `services/work-orders.service.ts`
- [ ] Crear `hooks/use-work-orders.ts`
- [ ] Crear colección `workOrders` en Firestore
- [ ] Testing: CRUD de órdenes

#### Día 12: Componentes de Órdenes
- [ ] Crear `components/work-orders/WorkOrdersList.tsx`
- [ ] Crear `components/work-orders/WorkOrderCard.tsx`
- [ ] Crear `components/work-orders/CreateWorkOrderDialog.tsx`
- [ ] Agregar a `ProjectProfile.tsx`
- [ ] Testing: Crear y listar órdenes desde proyecto

---

## 🚀 QUICK START: PRIMER ARCHIVO A CREAR

### Archivo: `src/modules/projects/types/projects.types.ts`

**Razón:** Define el contrato de datos para todo el módulo. Sin esto, nada más puede avanzar.

**Contenido:** Ver especificación técnica completa en `ESPECIFICACION_TECNICA_MODULO_PROYECTOS.md` (líneas 98-450)

**Dependencias:** Ninguna (archivo base)

**Testing:**
```bash
# Verificar que TypeScript compile
npm run build

# No debe haber errores de tipos
```

---

## 📦 COMANDOS DE SETUP INICIAL

```bash
# 1. Crear estructura de carpetas
mkdir -p src/modules/projects/{components,hooks,services,types,validations,utils}
mkdir -p src/modules/projects/components/{work-orders,tasks,quality}
mkdir -p src/app/\(main\)/projects/{create,[id]}

# 2. Crear archivos base
touch src/modules/projects/types/projects.types.ts
touch src/modules/projects/validations/projects.validation.ts
touch src/modules/projects/services/projects.service.ts
touch src/modules/projects/services/project-conversion.service.ts
touch src/modules/projects/services/work-orders.service.ts
touch src/modules/projects/hooks/use-projects.ts
touch src/modules/projects/hooks/use-project-profile.ts
touch src/modules/projects/hooks/use-work-orders.ts

# 3. Instalar dependencias (si falta algo)
npm install

# 4. Verificar compilación
npm run build
```

---

## 🎯 OBJETIVOS POR FASE

| Fase | Objetivo | Criterio de Éxito |
|------|----------|-------------------|
| 1 | Fundamentos sólidos | Tipos definidos, servicio básico funcional |
| 2 | Listado funcional | Ver proyectos en `/projects` con filtros |
| 3 | Detalles completos | Ver proyecto individual con KPIs |
| 4 | Conversión operativa | Cotización → Proyecto funciona |
| 5 | Órdenes básicas | Crear órdenes desde proyecto |

---

## ⚠️ RIESGOS Y MITIGACIONES

| Riesgo | Impacto | Mitigación |
|--------|---------|------------|
| Dependencias entre fases | Alto | Completar FASE 1 antes de continuar |
| Reglas Firestore incorrectas | Alto | Testing exhaustivo con diferentes roles |
| Integración con cotizaciones | Medio | Usar wizard existente como referencia |
| Cálculo de costos complejo | Medio | Reutilizar lógica de BOMBuilder |

---

## 📊 MÉTRICAS DE PROGRESO

Actualizar diariamente:

- [ ] **Día 1:** ___% completado (Objetivo: Tipos definidos)
- [ ] **Día 2:** ___% completado (Objetivo: Servicio básico)
- [ ] **Día 3:** ___% completado (Objetivo: Reglas Firestore)
- [ ] **Día 4:** ___% completado (Objetivo: Hook y componentes base)
- [ ] **Día 5:** ___% completado (Objetivo: Listado funcional)
- [ ] **Día 6:** ___% completado (Objetivo: Hook de detalles)
- [ ] **Día 7:** ___% completado (Objetivo: Componentes de detalles)
- [ ] **Día 8:** ___% completado (Objetivo: Página de detalles)
- [ ] **Día 9:** ___% completado (Objetivo: Servicio de conversión)
- [ ] **Día 10:** ___% completado (Objetivo: Integración con wizard)
- [ ] **Día 11:** ___% completado (Objetivo: Servicio de órdenes)
- [ ] **Día 12:** ___% completado (Objetivo: Componentes de órdenes)

---

## ✅ DEFINICIÓN DE "HECHO"

Cada fase está completa cuando:
1. ✅ Código implementado y sin errores de compilación
2. ✅ Testing básico ejecutado y pasando
3. ✅ Documentación actualizada (JSDoc en funciones)
4. ✅ Commit a Git con mensaje descriptivo
5. ✅ Siguiente fase puede iniciar sin bloqueos

---

## 🔄 PRÓXIMOS PASOS DESPUÉS DE COMPLETAR

Una vez completadas las 5 fases:

1. **Testing integral** del flujo completo
2. **Optimización de performance** (índices, queries)
3. **Mejoras UX** basadas en feedback
4. **Implementación de tareas** (módulo adicional)
5. **Implementación de calidad** (QA checklist)

---

## 📞 CONTACTO Y SOPORTE

- **Especificación Técnica:** `ESPECIFICACION_TECNICA_MODULO_PROYECTOS.md`
- **Análisis de Código:** `ANALISIS_EXHAUSTIVO_CODIGO_VS_ESPECIFICACION.md`
- **Referencia de Arquitectura:** Módulos existentes en `src/modules/sales/` e `src/modules/inventory/`

---

**🚀 ¡ESTAMOS LISTOS PARA COMENZAR!**

**ACCIÓN INMEDIATA:** Crear el archivo `projects.types.ts` con las definiciones del modelo de datos.
