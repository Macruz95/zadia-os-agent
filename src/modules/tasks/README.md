# Módulo de Tareas (RICE-Z)

## Descripción
El módulo de Tareas implementa el sistema RICE-Z para gestión de tareas empresariales con priorización inteligente y seguimiento de progreso.

## Estructura

```
tasks/
├── components/         # Componentes de UI
│   ├── TaskCard.tsx
│   ├── TaskForm.tsx
│   ├── TaskList.tsx
│   ├── TaskKanban.tsx
│   └── ...
├── hooks/              # Hooks de React
│   ├── use-tasks.ts
│   ├── use-task-actions.ts
│   └── ...
├── services/           # Servicios de Firebase
│   └── tasks.service.ts
├── types/              # Tipos TypeScript
│   └── tasks.types.ts
└── validations/        # Esquemas Zod
    └── tasks.schema.ts
```

## Características

### Gestión de Tareas
- Crear, editar y eliminar tareas
- Asignar responsables
- Establecer fechas de vencimiento
- Etiquetas y categorías

### Estados de Tarea
- `todo` - Por hacer
- `in_progress` - En progreso
- `done` - Completada
- `blocked` - Bloqueada

### Prioridades
- `low` - Baja
- `medium` - Media
- `high` - Alta
- `urgent` - Urgente

### Sistema RICE-Z
Metodología de priorización basada en:
- **R**each (Alcance)
- **I**mpact (Impacto)
- **C**onfidence (Confianza)
- **E**ffort (Esfuerzo)
- **Z**adia Score (Puntuación final)

### Funcionalidades
- Vista Kanban arrastra y suelta
- Filtros por estado, prioridad, asignado
- Búsqueda de tareas
- Subtareas y checklists
- Comentarios y actividad
- Notificaciones de vencimiento

## Uso

```typescript
import { useTasks } from '@/modules/tasks/hooks/use-tasks';
import { TasksService } from '@/modules/tasks/services/tasks.service';

// En un componente
function TasksPage() {
  const { tasks, loading, createTask, updateTask, deleteTask } = useTasks();
  
  const handleCreate = async () => {
    await createTask({
      title: 'Nueva tarea',
      description: 'Descripción de la tarea',
      priority: 'high',
      dueDate: new Date(),
    });
  };
  
  // ...
}

// Usando el servicio directamente
const task = await TasksService.createTask(data, userId, tenantId);
const tasks = await TasksService.getTasks(tenantId, { status: 'todo' });
```

## Colección de Firebase
- `tasks` - Todas las tareas

## Campos Principales
```typescript
interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'done' | 'blocked';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assigneeId?: string;
  projectId?: string;
  dueDate?: Timestamp;
  tags?: string[];
  tenantId: string;
  createdBy: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

## Integración con Proyectos
Las tareas pueden asociarse a proyectos mediante `projectId`, permitiendo:
- Ver tareas por proyecto
- Filtrar en vista de proyecto
- Calcular progreso del proyecto

## Notas de Implementación
- Todas las tareas requieren `tenantId`
- Las fechas se almacenan como Firestore Timestamp
- Los filtros se aplican en el lado del cliente para evitar índices complejos
