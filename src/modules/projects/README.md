# Módulo de Proyectos

## Descripción
El módulo de Proyectos gestiona la creación, seguimiento y ejecución de proyectos empresariales. Permite administrar tareas, presupuestos, sesiones de trabajo, gastos y líneas de tiempo.

## Estructura

```
projects/
├── components/         # Componentes de UI
│   ├── ProjectCard.tsx
│   ├── ProjectForm.tsx
│   ├── ProjectList.tsx
│   ├── ProjectTimeline.tsx
│   └── ...
├── hooks/              # Hooks de React
│   ├── use-projects.ts
│   ├── use-project-tasks.ts
│   ├── use-project-expenses.ts
│   └── ...
├── services/           # Servicios de Firebase
│   ├── projects.service.ts
│   ├── project-tasks.service.ts
│   └── helpers/
│       ├── project-expenses.service.ts
│       └── project-work-sessions.service.ts
├── types/              # Tipos TypeScript
│   └── project.types.ts
└── validations/        # Esquemas Zod
    └── project.schema.ts
```

## Características

### Gestión de Proyectos
- Crear, editar y eliminar proyectos
- Asignar clientes a proyectos
- Definir presupuestos y fechas límite
- Estados: `pending`, `in_progress`, `completed`, `cancelled`

### Tareas de Proyecto
- Crear tareas asociadas a proyectos
- Asignar responsables
- Prioridades y fechas de vencimiento
- Estados: `todo`, `in_progress`, `done`, `blocked`

### Seguimiento de Tiempo
- Registrar sesiones de trabajo
- Calcular horas trabajadas
- Asociar sesiones a tareas

### Control de Gastos
- Registrar gastos por proyecto
- Categorizar gastos
- Calcular costos totales

### Línea de Tiempo
- Visualizar hitos del proyecto
- Registrar eventos importantes

## Uso

```typescript
import { useProjects } from '@/modules/projects/hooks/use-projects';
import { ProjectsService } from '@/modules/projects/services/projects.service';

// En un componente
function ProjectsPage() {
  const { projects, loading, createProject } = useProjects();
  
  // ...
}

// En un servicio
const project = await ProjectsService.createProject(data, userId, tenantId);
```

## Dependencias
- Firebase Firestore para persistencia
- TenantContext para aislamiento multi-tenant
- AuthContext para autenticación

## Colecciones de Firebase
- `projects` - Datos principales de proyectos
- `projectTasks` - Tareas de proyectos
- `projectExpenses` - Gastos de proyectos
- `workSessions` - Sesiones de trabajo

## Notas de Implementación
- Todos los proyectos requieren `tenantId` para aislamiento de datos
- Las tareas pueden existir con `projectId` o `tenantId`
- Los gastos y sesiones de trabajo están vinculados al proyecto
