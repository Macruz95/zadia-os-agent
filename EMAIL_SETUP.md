# Configuración de Envío de Correos

## Implementación Actual

El sistema de envío de correos utiliza la **API REST de Resend** directamente mediante fetch, evitando dependencias problemáticas como `@react-email/render`.

### Características Técnicas:
- ✅ **Sin dependencias externas problemáticas**
- ✅ **API REST nativa** usando fetch
- ✅ **Manejo de errores robusto**
- ✅ **Compatible con Edge Runtime**
- ✅ **Funciona en server-side y client-side**

## Resend Setup

Para habilitar el envío de correos en ZADIA OS, necesitas configurar Resend:

### 1. Crear cuenta en Resend
1. Ve a [resend.com](https://resend.com) y crea una cuenta
2. Verifica tu email y dominio

### 2. Obtener API Key
1. Ve a [resend.com/api-keys](https://resend.com/api-keys)
2. Crea una nueva API key
3. Copia la API key

### 3. Configurar en el proyecto
1. Abre el archivo `.env.local`
2. Agrega tu API key:
   ```
   RESEND_API_KEY=tu-api-key-aqui
   ```

### 4. Verificar dominio (Opcional pero recomendado)
1. Ve a [resend.com/domains](https://resend.com/domains)
2. Agrega y verifica tu dominio
3. Actualiza el `from` email en `email.service.ts` si es necesario

## Uso de la funcionalidad

### Enviar correos a contactos
1. Ve al perfil de un cliente
2. En la sección "Contactos", haz click en "Enviar Correo"
3. Selecciona los contactos destinatarios
4. Escribe el asunto y contenido
5. Haz click en "Enviar Correo"

### Características
- ✅ Envío a múltiples contactos
- ✅ Plantillas HTML con estilos
- ✅ Fallback a texto plano
- ✅ Notificaciones de éxito/error
- ✅ Validación de emails
- ✅ Historial de envíos (próximamente)

## Solución de problemas

### Error: "Invalid API Key"
- Verifica que la API key en `.env.local` sea correcta
- Asegúrate de que no tenga espacios extras

### Error: "Domain not verified"
- Verifica tu dominio en Resend
- O usa un email de Resend para testing: `tu-email@resend.dev`

### Emails no llegan
- Revisa la carpeta de spam
- Verifica que el email del destinatario sea válido
- Para testing, usa emails temporales como `test@example.com`

## Configuración de desarrollo

Para desarrollo local, puedes usar:
```
RESEND_API_KEY=re_1234567890123456789012345678901234567890
```

Esto te permitirá enviar emails a través de Resend sin configuración adicional.