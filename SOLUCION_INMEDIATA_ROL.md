# 🚨 SOLUCIÓN INMEDIATA - Asignar Rol Manualmente

## ❌ Problema Actual
Tu usuario NO tiene custom claims, por eso Firestore rechaza el acceso.

## ✅ Solución Rápida (2 minutos)

### 1. Ir a Firebase Console
```
https://console.firebase.google.com/project/zadia-os-885k8/authentication/users
```

### 2. Encontrar tu usuario
- Busca tu email en la lista de usuarios
- Click en el usuario

### 3. Agregar Custom Claims
- Scroll down hasta "Custom claims"
- Click en el botón "Edit" o "Add custom claims"
- Pegar exactamente esto:

```json
{"role":"admin"}
```

### 4. Guardar y Cerrar Sesión
- Click "Save"
- **IMPORTANTE**: Ir a tu app → Logout
- Volver a hacer Login

### 5. Verificar
Después de re-login, el error desaparecerá porque ahora tienes:
```
request.auth.token.role = "admin"
```

---

## 🔄 Para Cloud Functions (Requiere Blaze Plan)

Firebase requiere el plan Blaze para Cloud Functions. Tienes 2 opciones:

### Opción A: Upgrade a Blaze (Recomendado)
1. Ir a: https://console.firebase.google.com/project/zadia-os-885k8/usage
2. Click "Modify plan"
3. Select "Blaze - Pay as you go"
4. Agregar método de pago
5. **Nota**: Tienen cuota gratis generosa:
   - 2M invocaciones/mes gratis
   - 400K GB-segundos/mes gratis
   - Solo pagas si excedes

### Opción B: Usar solo asignación manual (Temporal)
- Cada usuario nuevo necesitarás asignarle rol manualmente
- No escalable, pero funciona para desarrollo
- Cuando tengas presupuesto, migras a Blaze

---

## 📝 Script para Asignar Múltiples Usuarios (Opcional)

Si tienes muchos usuarios, puedes usar Firebase Admin SDK localmente:

### 1. Descargar Service Account Key
```
1. Firebase Console → Project Settings → Service Accounts
2. Click "Generate new private key"
3. Guardar archivo JSON en: functions/serviceAccountKey.json
4. ⚠️ NUNCA commit este archivo a Git
```

### 2. Crear script local
```javascript
// assign-roles.js
const admin = require('firebase-admin');
const serviceAccount = require('./functions/serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

async function assignRoles() {
  const users = await admin.auth().listUsers();
  
  for (const user of users.users) {
    // Skip if already has role
    const userRecord = await admin.auth().getUser(user.uid);
    if (userRecord.customClaims?.role) {
      console.log(`⏭️  ${user.email} - already has role: ${userRecord.customClaims.role}`);
      continue;
    }
    
    // Assign default role
    await admin.auth().setCustomUserClaims(user.uid, { role: 'user' });
    console.log(`✅ ${user.email} - assigned role: user`);
  }
  
  console.log('Done!');
  process.exit(0);
}

assignRoles().catch(console.error);
```

### 3. Ejecutar
```bash
node assign-roles.js
```

---

## 🎯 Por Ahora: HAZ ESTO

1. ✅ Asignar rol manualmente a tu usuario (2 min)
2. ✅ Logout y Login
3. ✅ Verificar que el error desaparece
4. ⏸️ Decidir si upgradear a Blaze o seguir manual

**Cuando tengas Blaze**:
```bash
firebase deploy --only functions
```

Y los nuevos usuarios tendrán roles automáticamente.
