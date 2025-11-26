# Vulnerabilidades encontradas en el sistema ZADIA OS

## 1. Exposición de la clave API de OpenRouter
- **Problema:** La validación de `OPENROUTER_API_KEY` se hacía en tiempo de importación, provocando un error de ejecución cuando la variable no estaba definida.
- **Mitigación aplicada:** Se movió la validación al interior de `chatCompletion`, lanzando un error claro solo cuando se intenta usar el servicio sin la clave configurada.

## 2. Falta de aislamiento de datos por `userId`
- **Problema:** Varias consultas a Firestore (p. ej., en módulos HR, proyectos, ventas, inventario y finanzas) no filtraban por `userId`, lo que permite a un usuario autenticado acceder a datos de otros usuarios.
- **Recomendación:** Añadir `where('userId', '==', currentUserId)` a todas las consultas y validar que el `userId` provenga del contexto de autenticación.

## 3. Reglas de seguridad de Firestore demasiado permisivas
- **Problema:** Algunas reglas permiten `read, write` a cualquier usuario autenticado sin restricciones de documento (`/workPeriods/{id}`, `/loans/{id}`), lo que podría permitir lecturas/escrituras no autorizadas.
- **Recomendación:** Restringir el acceso a los documentos verificando que `request.auth.uid == resource.data.userId` (o `request.resource.data.userId` en escrituras).

## 4. Índices faltantes en Firestore (ya corregidos)
- **Problema:** Errores "The query requires an index" en colecciones `workPeriods`, `loans`, `opportunities` y `projectTasks`.
- **Estado:** Se añadieron los índices necesarios en `firestore.indexes.json` y se desplegaron.

## 5. Posible importación de código del servidor en el cliente
- **Problema:** El servicio `OpenRouterService` está pensado para ejecutarse en el servidor, pero si se importa en componentes de React podría incluir la clave API en el bundle del cliente.
- **Mitigación:** Asegurarse de que el servicio solo se importe en código del servidor (p. ej., en `/src/app/api/*` o en hooks que se ejecuten en el servidor).

## 6. Falta de sanitización y límite de longitud en prompts
- **Problema:** Prompts largos o con caracteres de control podrían romper la petición JSON.
- **Mitigación aplicada:** Se añadió la función `sanitizePrompt` que recorta a 2000 caracteres y elimina caracteres de control.

## 7. Ausencia de timeout en llamadas externas
- **Problema:** Las peticiones a OpenRouter podían quedar colgadas indefinidamente.
- **Mitigación aplicada:** Se implementó `AbortController` con timeout de 15 s.

## 8. Logging de datos sensibles
- **Problema:** Los logs podían incluir el cuerpo completo de errores de la API.
- **Mitigación aplicada:** Los logs ahora registran solo el mensaje de error, sin exponer datos de la respuesta.

---

**Próximos pasos recomendados**
1. Implementar el aislamiento de datos por `userId` en todas las consultas restantes.
2. Revisar y endurecer las reglas de Firestore para que verifiquen `userId`.
3. Ejecutar pruebas de integración para confirmar que los cambios no rompen la funcionalidad.
4. Desplegar los cambios a producción y monitorizar logs para detectar accesos no autorizados.
