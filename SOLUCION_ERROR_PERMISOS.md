# 🚨 SOLUCIÓN AL ERROR "Missing or insufficient permissions"

## ❌ Error Actual

```
[ERROR] Missing or insufficient permissions.
FirebaseError: Missing or insufficient permissions.
```

**Causa**: Tu usuario NO tiene `custom claims` (role) asignado en Firebase Auth.

---

## ✅ SOLUCIÓN INMEDIATA (5 minutos)

### Opción 1: Firebase Console (MÁS RÁPIDO)

1. **Ir a Firebase Console**:
   ```
   https://console.firebase.google.com/project/zadia-os-885k8/authentication/users
   ```

2. **Buscar tu usuario**:
   - Busca tu email en la lista
   - Click en el usuario

3. **Agregar Custom Claims**:
   - Scroll down hasta "Custom claims" (o "Reclamaciones personalizadas")
   - Click en "Edit" (Editar)
   - Pegar EXACTAMENTE esto:
   ```json
   {"role":"admin"}
   ```
   - Click "Save" (Guardar)

4. **IMPORTANTE - Cerrar sesión**:
   - Ve a tu app ZADIA OS
   - Click en tu perfil → Logout
   - Vuelve a hacer Login

5. **Verificar**:
   - ✅ El error desaparece
   - ✅ Puedes acceder a todas las páginas
   - ✅ Sidebar muestra todos los módulos

---

## 🎯 Nuevo Flujo del Sistema

### Para Usuarios SIN Rol (como tú ahora)

```
1. Usuario hace login ✅
2. Firestore Rules rechazan acceso (no tiene role) ❌
3. RouteGuard detecta: user.role = null
4. Redirige a → /pending-activation 📋
5. Mensaje: "Tu cuenta necesita ser activada por un administrador"
```

### Para Usuarios CON Rol (después de asignar)

```
1. Usuario hace login ✅
2. Firebase Auth incluye: request.auth.token.role = "admin" ✅
3. Firestore Rules permiten acceso ✅
4. RouteGuard permite navegación ✅
5. Sistema funciona normalmente ✅
```

---

## 🔧 Cambios Realizados

### 1. Nueva Página: /pending-activation
- Muestra cuando usuario no tiene rol
- Instrucciones para contactar admin
- Botón para logout
- **Archivo**: `src/app/pending-activation/page.tsx`

### 2. RouteGuard Mejorado
- Detecta usuarios sin rol
- Redirige a /pending-activation automáticamente
- **Archivo**: `src/components/auth/RouteGuard.tsx`

### 3. Auth State Mejorado
- Maneja errores de permisos gracefully
- No crashea cuando Firestore rechaza acceso
- **Archivo**: `src/hooks/use-auth-state.ts`

### 4. Cloud Functions (Requiere Plan Blaze)
- **assignDefaultRole**: Asigna 'user' automáticamente a nuevos usuarios
- **migrateExistingUsers**: Migra usuarios existentes
- **updateUserRole**: Cambia roles (solo admin)
- **Directorio**: `functions/`

---

## 📊 Estado del Sistema

### ✅ LO QUE FUNCIONA AHORA

1. **Sistema de Permisos Completo**:
   - ✅ permissions.config.ts (mapeo de roles a rutas)
   - ✅ usePermissions() hook (40+ checks granulares)
   - ✅ ProtectedRoute component
   - ✅ RouteGuard en layout
   - ✅ Página /unauthorized
   - ✅ Página /pending-activation (NUEVO)

2. **Build Exitoso**:
   - ✅ 0 errores de compilación
   - ✅ 31 rutas generadas (incluyendo pending-activation)
   - ✅ TypeScript valida correctamente

3. **Manejo de Errores**:
   - ✅ Usuarios sin rol → /pending-activation
   - ✅ Usuarios sin permiso → /unauthorized
   - ✅ No autenticados → /login

### ⏸️ LO QUE REQUIERE ACCIÓN

1. **Tu Usuario Actual**:
   - ⏸️ Necesitas asignar rol manualmente (instrucciones arriba)
   - ⏸️ 5 minutos en Firebase Console

2. **Cloud Functions** (Opcional):
   - ⏸️ Requiere upgrade a plan Blaze
   - ⏸️ Una vez desplegado, nuevos usuarios tendrán rol automáticamente
   - ⏸️ Por ahora: asignación manual funciona bien

---

## 🎯 SIGUIENTE PASO (AHORA)

### HAZ ESTO AHORA:

1. Ve a: https://console.firebase.google.com/project/zadia-os-885k8/authentication/users
2. Encuentra tu usuario
3. Click → "Custom claims" → "Edit"
4. Pega: `{"role":"admin"}`
5. Save
6. Logout de la app
7. Login de nuevo
8. ✅ **TODO FUNCIONARÁ**

---

## 📱 Después de Asignar el Rol

### Verás estos cambios:

1. **No más errores en consola** ✅
2. **Acceso a todas las páginas** ✅
3. **Sidebar completo** con todos los módulos ✅
4. **Permisos funcionando** correctamente ✅

### Puedes probar:

```typescript
// En cualquier componente
import { usePermissions } from '@/hooks/use-permissions';

function MyComponent() {
  const { isAdmin, canAccessHR, canDeleteClient } = usePermissions();
  
  console.log('Is Admin?', isAdmin); // true
  console.log('Can access HR?', canAccessHR); // true
  console.log('Can delete client?', canDeleteClient); // true
}
```

---

## 💡 Para Usuarios Nuevos en el Futuro

### Con Plan Spark (Gratis - Actual):
```
1. Usuario se registra
2. Admin recibe notificación (implementar)
3. Admin asigna rol manualmente
4. Usuario hace login
5. Sistema funciona
```

### Con Plan Blaze (Pago por uso - Futuro):
```
1. Usuario se registra
2. Cloud Function asigna role='user' automáticamente ✨
3. Usuario hace login
4. Sistema funciona
✅ Sin intervención manual
```

---

## 🚀 Plan Blaze (Opcional)

### Si decides upgradear:

**Costo**:
- $0/mes si no excedes cuotas gratuitas
- Cuota gratis incluye:
  - 2,000,000 invocaciones/mes
  - 400,000 GB-segundos/mes
  - 200,000 minutos CPU/mes

**Beneficios**:
- ✅ Roles asignados automáticamente
- ✅ No más asignación manual
- ✅ Escalable a miles de usuarios
- ✅ Función de migración para usuarios existentes

**Cómo upgradear**:
1. https://console.firebase.google.com/project/zadia-os-885k8/usage
2. "Modify plan" → "Blaze"
3. Agregar tarjeta de crédito
4. Deploy: `firebase deploy --only functions`

---

## 📝 Resumen

**Estado Actual**:
- ✅ Sistema de permisos 100% implementado
- ✅ Build exitoso
- ⏸️ Tu usuario necesita rol (5 min de fix manual)
- ⏸️ Cloud Functions esperando plan Blaze (opcional)

**Acción Inmediata**:
1. Asignar rol a tu usuario (5 minutos)
2. Logout/Login
3. ✅ TODO FUNCIONA

**Acción Futura** (cuando quieras):
- Upgradear a Blaze
- Deploy functions
- Automatización completa

---

¿Necesitas ayuda con algún paso? ¡Dime!
