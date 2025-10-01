# Diferenciación: Leads vs. Prospectos vs. Clientes

## Flujo de Conversión en ZADIA OS

```
Lead → Prospecto → Cliente Activo
```

## Definiciones

### [TARGET] **Lead**
**Definición**: Contacto inicial que ha mostrado interés en nuestros productos/servicios pero aún no ha sido calificado.

**Características**:
- Información básica (nombre, email, teléfono)
- Fuente de origen identificada
- No ha sido contactado o evaluado completamente
- Puede ser descalificado o convertido

**Estados**: `new`, `contacted`, `qualifying`, `converted`, `disqualified`

### [TARGET] **Prospecto** (Cliente Prospecto)
**Definición**: Lead calificado que ha sido evaluado y tiene potencial real de conversión.

**Características**:
- Lead que pasó el proceso de calificación
- Información completa recopilada
- Interés y capacidad de compra confirmados
- Está en proceso de evaluación/negociación

**Estados Cliente**: `Prospecto`, `Activo`, `Inactivo`

### [TARGET] **Cliente Activo**
**Definición**: Prospecto que ha realizado una compra o contratado servicios.

**Características**:
- Ha completado al menos una transacción
- Relación comercial establecida
- Historial de compras/servicios
- Potencial para ventas futuras

## Flujo Operativo

### Fase 1: Gestión de Leads
- **Módulo**: `sales/leads`
- **Objetivo**: Captura y calificación inicial
- **Acciones**: Contactar, evaluar, calificar, convertir o descalificar

### Fase 2: Gestión de Prospectos
- **Módulo**: `clients` (estado: Prospecto)
- **Objetivo**: Desarrollo de oportunidades de venta
- **Acciones**: Cotizar, negociar, proponer soluciones

### Fase 3: Gestión de Clientes Activos
- **Módulo**: `clients` (estado: Activo)
- **Objetivo**: Retención y crecimiento de la cuenta
- **Acciones**: Servicio post-venta, ventas adicionales, renovaciones

## Ventajas de esta Separación

### [FLOW] **Flujo Claro**
- Proceso estructurado de conversión
- Responsabilidades definidas por etapa
- Métricas específicas por fase

### [ANALYTICS] **Análisis Preciso**
- Tasas de conversión Lead → Prospecto
- Tasas de conversión Prospecto → Cliente
- ROI por canal de leads

### [TARGET] **Enfoque Especializado**
- Estrategias diferenciadas por etapa
- Recursos asignados según potencial
- Seguimiento personalizado

## Implementación en ZADIA OS

### Leads (sales/leads)
```typescript
interface Lead {
  id: string;
  entityType: 'person' | 'company' | 'institution';
  status: 'new' | 'contacted' | 'qualifying' | 'converted' | 'disqualified';
  source: 'web' | 'referral' | 'event' | 'cold-call' | 'imported';
  priority: 'hot' | 'warm' | 'cold';
  score: number; // 1-100
  // ... campos básicos
}
```

### Prospectos/Clientes (clients)
```typescript
interface Client {
  id: string;
  type: 'PersonaNatural' | 'Organización' | 'Empresa';
  status: 'Prospecto' | 'Activo' | 'Inactivo';
  // ... información completa
  leadSourceId?: string; // Referencia al lead original
}
```

### Proceso de Conversión
1. **Lead calificado** → Crear Cliente con estado "Prospecto"
2. **Primera venta** → Cambiar estado a "Activo"
3. **Sin actividad** → Cambiar estado a "Inactivo"

Esta estructura garantiza un embudo de ventas claro y profesional, diferenciando claramente cada etapa del proceso comercial.