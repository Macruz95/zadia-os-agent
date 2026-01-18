# Módulo de Workflows

## Descripción
El módulo de Workflows permite crear y ejecutar flujos de trabajo automatizados para procesos empresariales.

## Estructura

```
workflows/
├── components/         # Componentes de UI
│   ├── WorkflowBuilder.tsx
│   ├── WorkflowCard.tsx
│   ├── WorkflowList.tsx
│   └── ...
├── hooks/              # Hooks de React
│   ├── use-workflows.ts
│   └── ...
├── services/           # Servicios de Firebase
│   └── workflows.service.ts
├── types/              # Tipos TypeScript
│   └── workflows.types.ts
└── validations/        # Esquemas Zod
    └── workflows.schema.ts
```

## Características

### Definición de Workflows
- Nombre y descripción
- Triggers (disparadores)
- Pasos secuenciales
- Condiciones y bifurcaciones

### Tipos de Triggers
- `manual` - Ejecución manual
- `schedule` - Programado (cron)
- `event` - Por evento del sistema
- `webhook` - Por llamada externa

### Tipos de Acciones
- Crear registros
- Actualizar datos
- Enviar notificaciones
- Enviar emails
- Llamar APIs externas

### Estados de Workflow
- `draft` - Borrador
- `active` - Activo
- `paused` - Pausado
- `archived` - Archivado

### Estados de Ejecución
- `pending` - Pendiente
- `running` - Ejecutando
- `completed` - Completado
- `failed` - Fallido
- `cancelled` - Cancelado

## Uso

```typescript
import { useWorkflows } from '@/modules/workflows/hooks/use-workflows';
import { WorkflowsService } from '@/modules/workflows/services/workflows.service';

// En un componente
function WorkflowsPage() {
  const { workflows, loading, createWorkflow, executeWorkflow } = useWorkflows();
  
  // Crear workflow
  await createWorkflow({
    name: 'Seguimiento de Lead',
    trigger: 'event',
    steps: [
      { name: 'Enviar email', action: 'send_email' },
      { name: 'Crear tarea', action: 'create_task' },
    ],
  });
  
  // Ejecutar workflow
  await executeWorkflow(workflowId);
}
```

## Colecciones de Firebase
- `workflows` - Definiciones de workflows
- `workflow-executions` - Historial de ejecuciones

## Notas de Implementación
- Los workflows requieren `tenantId`
- Las ejecuciones se registran para auditoría
- Los errores se capturan y registran
