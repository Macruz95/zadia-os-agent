# 🤖 Asistente AI de ZADIA OS

## 📍 Acceso

**Ruta:** `/ai-assistant`  
**Sidebar:** Segundo item después de Dashboard (icono Bot 🤖)  
**Atajo:** También puedes usar el Command Bar con `Ctrl+K` o `Cmd+K` y escribir `?` para preguntas

## 🎯 Características

### 1. **Conversación Inteligente**
El asistente AI puede mantener conversaciones contextuales sobre tu negocio, con acceso a:
- Datos reales de clientes
- Proyectos activos y completados
- Facturas y finanzas
- Estado general del negocio

### 2. **Contexto del Sistema**
Cada conversación incluye automáticamente:
- **Total de clientes** registrados
- **Proyectos activos** (planning + in-progress)
- **Ingresos mensuales aproximados** (basado en facturas pagadas)
- **5 clientes más recientes**
- **5 proyectos más recientes** con su estado
- **5 facturas más recientes** con monto y estado

### 3. **Aprendizaje Continuo**
- ✅ Todas las conversaciones se guardan en Firestore (`ai-conversations`)
- ✅ Historial accesible para referencia futura
- ✅ El sistema aprende de tus patrones de trabajo
- ✅ Auto-guardado después de cada intercambio

### 4. **Automatización Segura**
- ⚙️ Ejecución de acciones reales desde lenguaje natural
- 🧰 Herramientas disponibles: `create_task`, `create_expense`, `schedule_meeting`, `create_project`
- ✅ Validación con Zod + Firestore antes de persistir cualquier dato
- 🧾 Formato uniforme mediante bloque JSON (ver sección "Formato de acciones")

### 5. **Ejemplos de Uso**

**Análisis de negocio:**
```
¿Cuántos proyectos activos tengo?
¿Qué clientes tienen facturas pendientes?
¿Cuál es mi ingreso promedio mensual?
```

**Recomendaciones:**
```
¿Cómo puedo mejorar mi flujo de caja?
¿Qué proyectos están en riesgo de retraso?
Dame sugerencias para optimizar recursos
```

**Consultas específicas:**
```
¿Quién es el cliente con más facturación?
¿Qué proyectos están cerca de su fecha límite?
Muéstrame un resumen de mi negocio
```

## 🏗️ Arquitectura Técnica

### **Archivos Creados:**

```
src/
├── types/
│   └── ai-assistant.types.ts          # Tipos y schemas Zod
├── services/
│   └── ai-assistant.service.ts        # Servicio principal (contexto + Firestore)
│   └── ai-agent-tools.service.ts      # Acciones estructuradas (tareas, gastos, reuniones, proyectos)
├── hooks/
│   └── use-ai-chat.ts                 # Hook de estado de conversación
├── app/
│   ├── (main)/
│   │   └── ai-assistant/
│   │       └── page.tsx               # UI del chat
│   └── api/
│       └── ai/
│           └── chat/
│               └── route.ts           # API Route server-side para OpenRouter

firestore.rules                         # Reglas de seguridad para ai-conversations
firestore.indexes.json                  # Índice compuesto para queries
```

### **Stack Tecnológico:**

- **IA:** OpenRouter API con Gemini 2.0 Flash Exp (free tier) - **vía Next.js API Route (server-side)**
- **Base de datos:** Firestore collection `ai-conversations`
- **Frontend:** React 19 + Next.js 15 + ShadCN UI
- **Validación:** Zod schemas
- **State:** Custom hook `useAIChat`
- **API Route:** `/api/ai/chat` para llamadas seguras server-side

### **Flujo de Datos:**

```
1. Usuario escribe mensaje
2. useAIChat agrega mensaje a UI inmediatamente
3. buildSystemContext() fetch datos de Firebase (clientes, proyectos, facturas)
   - Queries simplificadas sin orderBy para evitar índices complejos
   - Ordenamiento client-side de últimos 5 items
   - Manejo de errores robusto con try-catch por colección
4. generateSystemPrompt() crea prompt con contexto actualizado
5. Llamada a API Route /api/ai/chat (server-side)
6. API Route llama a OpenRouter con API key segura
7. Respuesta AI se muestra en UI
8. Auto-guardado en Firestore collection ai-conversations
```
## 🔒 Seguridad

## 🛠️ Formato de Acciones

Cuando el usuario solicita una acción operativa, el asistente responde con su explicación habitual y añade un bloque JSON:

```json
{
  "tool": "create_task",
  "parameters": {
    "title": "Llamar al proveedor",
    "dueDate": "2025-10-31T10:00:00-06:00"
  },
  "rationale": "Se agenda la llamada para asegurar stock antes del cierre"
}
```

- `tool` corresponde a una de las herramientas autorizadas.
- `parameters` sigue los schemas Zod definidos en `ai-agent-tools.service.ts`.
- `rationale` documenta el motivo de la acción.
- El hook `useAIChat` elimina el bloque JSON del mensaje visible, ejecuta la acción y agrega el resultado (`toast` + mensaje confirmación).

## 🔒 Seguridad

**Firestore Rules:**
```javascript
match /ai-conversations/{conversationId} {
  allow read: if isOwner(resource.data.userId);
  allow create: if isAuthenticated() && isOwner(request.resource.data.userId);
  allow update: if isOwner(resource.data.userId);
  allow delete: if isOwner(resource.data.userId);
}
```

- ✅ Solo el propietario puede leer sus conversaciones
- ✅ Solo usuarios autenticados pueden crear
- ✅ No se pueden ver conversaciones de otros usuarios
- ✅ Soft delete con flag `archived`

## 📊 Estructura de Datos

### **Conversation Document:**
```typescript
{
  id: string;
  userId: string;                    // Owner
  title: string;                     // Auto-generado del primer mensaje
  messages: [
    {
      id: string;
      role: 'system' | 'user' | 'assistant';
      content: string;
      timestamp: Timestamp;
      metadata?: {
        model?: string;
        tokensUsed?: number;
        agentAction?: {
          tool: string;
          parameters: Record<string, unknown>;
          success: boolean;
          redirectUrl?: string;
          metadata?: Record<string, unknown>;
        };
      }
    }
  ];
  createdAt: Timestamp;
  updatedAt: Timestamp;
  archived: boolean;
  tags: string[];
}
```

## 🎨 UI Features

- ✅ **Design moderno:** Interfaz tipo chat con avatares
- ✅ **Auto-scroll:** Scroll automático a nuevos mensajes
- ✅ **Loading states:** Indicador animado mientras AI responde
- ✅ **Enter to send:** Enviar con Enter (Shift+Enter para nueva línea)
- ✅ **Acciones rápidas:** Botones Guardar y Limpiar conversación
- ✅ **Estado vacío:** Onboarding con ejemplos de preguntas
- ✅ **Responsive:** Funciona en desktop y móvil

## 🚀 Próximas Mejoras

**En roadmap:**
- [ ] Historial de conversaciones en sidebar
- [ ] Búsqueda en conversaciones pasadas
- [ ] Sugerencias de preguntas basadas en contexto
- [ ] Exportar conversaciones a PDF
- [ ] Adjuntar archivos/imágenes
- [ ] Voice input (speech-to-text)
- [ ] Streaming de respuestas (palabra por palabra)
- ✅ Acciones ejecutables (tareas, gastos, reuniones, proyectos)

## 📈 Métricas de Uso

Las conversaciones se guardan en Firestore, permitiendo analizar:
- Preguntas más frecuentes
- Temas de interés
- Satisfacción del usuario
- Patrones de uso

---

**Creado:** Octubre 29, 2025  
**Versión:** 1.0  
**Estado:** ✅ Production Ready
