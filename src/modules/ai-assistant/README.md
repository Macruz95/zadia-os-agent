# Módulo AI Assistant

## Descripción
El módulo AI Assistant implementa el sistema de IA agéntica de ZADIA OS, permitiendo interacción natural con el sistema mediante comandos de voz y texto.

## Estructura

```
ai-assistant/
├── components/         # Componentes de UI
│   ├── ChatInterface.tsx
│   ├── CommandInput.tsx
│   ├── AgentPanel.tsx
│   └── ...
├── hooks/              # Hooks de React
│   ├── use-ai-assistant.ts
│   ├── use-agent-tools.ts
│   └── ...
├── services/           # Servicios de IA
│   ├── advanced-ai.service.ts
│   └── agent-tools.service.ts
├── types/              # Tipos TypeScript
│   └── ai.types.ts
└── validations/        # Esquemas Zod
    └── ai.schema.ts
```

## Características

### Interacción Natural
- Chat conversacional
- Comandos de voz
- Autocompletado inteligente
- Historial de conversaciones

### Herramientas del Agente

| Herramienta | Descripción |
|-------------|-------------|
| `create_task` | Crear tareas |
| `create_project` | Crear proyectos |
| `create_expense` | Registrar gastos |
| `schedule_meeting` | Agendar reuniones |
| `send_notification` | Enviar notificaciones |
| `create_workflow` | Crear workflows |
| `search_web` | Buscar en web |
| `analyze_data` | Analizar datos |
| `generate_report` | Generar reportes |
| `send_email` | Enviar emails |
| `create_quote` | Crear cotizaciones |

### Capacidades
- Creación de registros por voz
- Búsqueda semántica
- Análisis de datos
- Generación de reportes
- Automatización de tareas

## Uso

```typescript
import { useAIAssistant } from '@/modules/ai-assistant/hooks/use-ai-assistant';

function CommandBar() {
  const { 
    sendMessage, 
    executeCommand, 
    history, 
    loading 
  } = useAIAssistant();
  
  // Enviar mensaje
  await sendMessage('Crea una tarea para llamar al cliente ABC');
  
  // Ejecutar comando directo
  await executeCommand('create_task', {
    title: 'Llamar a cliente ABC',
    priority: 'high',
  });
}
```

## Esquemas de Validación

Las herramientas usan esquemas Zod para validar parámetros:

```typescript
const schemas = {
  create_task: z.object({
    title: z.string().min(3),
    description: z.string().optional(),
    priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
    dueDate: z.string().optional(),
  }),
  
  send_email: z.object({
    to: z.string().min(1),
    subject: z.string().min(3),
    body: z.string().min(10),
  }),
};
```

## Colecciones de Firebase
- `ai-conversations` - Conversaciones
- `ai-conversations/{id}/messages` - Mensajes
- `ai-user-preferences` - Preferencias de usuario
- `ai-learned-patterns` - Patrones aprendidos
- `ai-semantic-memories` - Memorias semánticas

## Integración con OpenRouter

El servicio usa OpenRouter para acceso a múltiples modelos de IA:
- GPT-4
- Claude
- Mistral
- Y otros

## Contexto Agéntico

El `ZadiaAgenticContext` maneja:
- Registro de agentes
- Emisión de eventos
- Estado del sistema
- Propagación de DTOs

## Notas de Implementación
- Las conversaciones se almacenan por usuario y tenant
- Los patrones aprendidos mejoran respuestas futuras
- El sistema de eventos permite integración con workflows
