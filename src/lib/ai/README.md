# 🤖 Modelos de IA Avanzados - ZADIA OS

Todos los modelos son **100% GRATIS** en OpenRouter.

## 🏆 Modelos Disponibles

### Top 3 Recomendados

1. **DeepSeek R1** (`deepseek-r1`)
   - Razonamiento avanzado, matching OpenAI o1
   - 163K tokens de contexto
   - **Mejor para:** Agenda Cognitiva, RICE-Z, análisis profundo

2. **Qwen3-Coder 480B** (`qwen3-coder`)
   - Supera Claude 4 en SWE-Bench
   - 262K tokens de contexto
   - **Mejor para:** Flujos Cognitivos, agentes complejos, function calling

3. **GLM-4.5 Thinking** (`glm-4.5-thinking`)
   - Agentes nativos con tool-use
   - 128K tokens de contexto
   - **Mejor para:** Function calling, workflows, tool-use nativo

### Otros Modelos Disponibles

- **Gemini 2.5 Pro** (`gemini-2.5-pro`) - 1M tokens, #1 en benchmarks
- **Llama 4 Maverick** (`llama-4-maverick`) - Multimodal, 256K tokens
- **Llama 4 Scout** (`llama-4-scout`) - 512K tokens, ultra eficiente
- **Mistral 3.1 24B** (`mistral-3.1-24b`) - Rápido, function calling
- **GLM-4.5 Air** (`glm-4.5-air`) - Versión ligera con tool-use
- **Qwen 2.5 72B** (`qwen-2.5-72b`) - Balance velocidad/poder
- **Kimi KVL-A3B** (`kimi-vl-a3b`) - Multimodal ligero

## 📖 Ejemplos de Uso

### 1. Uso Básico (Modelo por ID)

```typescript
import { OpenRouterService } from '@/lib/ai/openrouter.service';

// Usar DeepSeek R1 directamente
const result = await OpenRouterService.chatCompletion({
  modelId: 'deepseek-r1',
  messages: [
    { role: 'user', content: 'Analiza estos datos...' }
  ]
});
```

### 2. Selección Automática por Tipo

```typescript
// Para razonamiento profundo (usa DeepSeek R1)
const result = await OpenRouterService.chatCompletion({
  modelType: 'reasoning',
  messages: [
    { role: 'user', content: 'Resuelve este problema paso a paso...' }
  ],
  temperature: 0.3
});

// Para agentes complejos (usa Qwen3-Coder)
const result = await OpenRouterService.chatCompletion({
  modelType: 'agentic',
  messages: [
    { role: 'user', content: 'Ejecuta este workflow...' }
  ]
});
```

### 3. Helpers Especializados

```typescript
// Razonamiento profundo (Agenda Cognitiva, RICE-Z)
const result = await OpenRouterService.reason(
  'Analiza estos conflictos de calendario...',
  'Eres un asistente de calendario experto',
  { events: [...], conflicts: [...] }
);

// Agentes complejos (Flujos Cognitivos)
const result = await OpenRouterService.agenticTask(
  'Ejecuta este workflow multi-paso...',
  'Eres un agente de automatización',
  tools // function definitions
);

// Tool-use nativo
const result = await OpenRouterService.toolUse(
  'Llama a estas APIs...',
  tools,
  'Eres un agente con acceso a herramientas'
);

// Contexto largo (documentos, historial)
const result = await OpenRouterService.longContext(
  'Analiza este documento completo...',
  'Eres un analista de documentos',
  8000 // max tokens
);
```

### 4. Desde la API Route

```typescript
// POST /api/ai/chat
{
  "messages": [
    { "role": "user", "content": "Hola" }
  ],
  "modelType": "reasoning" // o "modelId": "deepseek-r1"
}
```

## 🎯 Modelos Recomendados por Caso de Uso

| Caso de Uso | Modelo Recomendado | ID |
|-------------|---------------------|-----|
| Agenda Cognitiva | DeepSeek R1 | `deepseek-r1` |
| Gestor RICE-Z | DeepSeek R1 | `deepseek-r1` |
| Flujos Cognitivos | Qwen3-Coder | `qwen3-coder` |
| Function Calling | GLM-4.5 Thinking | `glm-4.5-thinking` |
| Contexto Largo | Gemini 2.5 Pro | `gemini-2.5-pro` |
| Multimodal | Llama 4 Maverick | `llama-4-maverick` |
| Chat General | Gemma 3 | `gemma-3` (default) |

## 📝 Notas Importantes

- Todos los modelos son **100% gratis** pero tienen rate limits
- Los modelos avanzados tienen mejor calidad pero pueden ser más lentos
- Para producción, considera usar `modelType` para selección automática
- Los modelos con function calling requieren definir `tools` en el request

## 🔗 Referencias

- [OpenRouter Models](https://openrouter.ai/models)
- [Modelos Config](./models.config.ts)
- [OpenRouter Service](./openrouter.service.ts)

