# Sistema de Permisos - ZADIA OS

## 🎯 Resumen

Se ha implementado un **sistema completo de permisos basado en roles** con las siguientes características:

- ✅ **Cloud Functions** para asignar roles automáticamente
- ✅ **Custom Claims** en Firebase Auth
- ✅ **Validación de permisos** en cliente y servidor
- ✅ **Hook usePermissions()** para componentes
- ✅ **Componente ProtectedRoute** para páginas
- ✅ **Página /unauthorized** para accesos no autorizados

---

## 📦 Archivos Creados

### Cloud Functions
```
functions/
├── src/
│   └── index.ts          # Funciones: assignDefaultRole, migrateExistingUsers, updateUserRole
├── package.json
├── tsconfig.json
└── .gitignore
```

### Configuración de Permisos
```
src/config/
└── permissions.config.ts  # Mapeo de roles a rutas y permisos
```

### Hooks
```
src/hooks/
└── use-permissions.ts     # Hook para verificar permisos en componentes
```

### Componentes
```
src/components/auth/
├── ProtectedRoute.tsx     # Wrapper para proteger rutas
└── RouteGuard.tsx         # Guard para layouts
```

### Páginas
```
src/app/
└── unauthorized/
    └── page.tsx           # Página de acceso no autorizado
```

### Actualizaciones
- `firebase.json` - Configuración de functions
- `src/app/(main)/layout.tsx` - Integración de RouteGuard

---

## 🚀 Pasos para Desplegar

### 1. Instalar Dependencias de Functions

```bash
cd functions
npm install
cd ..
```

### 2. Compilar Functions

```bash
cd functions
npm run build
cd ..
```

### 3. Desplegar Functions a Firebase

```bash
firebase deploy --only functions
```

Esto desplegará 3 funciones:
- ✅ `assignDefaultRole` - Trigger automático en creación de usuario
- ✅ `migrateExistingUsers` - Callable para migrar usuarios existentes
- ✅ `updateUserRole` - Callable para cambiar roles

### 4. Migrar Usuarios Existentes

Después de desplegar, ejecuta esto **UNA VEZ** desde tu aplicación con un usuario admin:

```typescript
import { getFunctions, httpsCallable } from 'firebase/functions';

const functions = getFunctions();
const migrateUsers = httpsCallable(functions, 'migrateExistingUsers');

// Solo admins pueden ejecutar esto
try {
  const result = await migrateUsers();
  console.log('Migration result:', result.data);
} catch (error) {
  console.error('Migration failed:', error);
}
```

---

## 🔐 Roles del Sistema

### Admin
- **Acceso**: Todo el sistema (*)
- **Puede**: Crear, leer, actualizar, **eliminar**
- **Módulos**: Todos

### Manager
- **Acceso**: Dashboard, CRM, Sales, HR, Finance, Inventory, Projects, Settings
- **Puede**: Crear, leer, actualizar
- **Módulos**: CRM, Sales, HR, Finance, Inventory, Projects

### User
- **Acceso**: Dashboard, CRM, Sales, Projects, Profile
- **Puede**: Crear, leer, actualizar
- **Módulos**: CRM, Sales, Projects

---

## 💡 Cómo Usar

### 1. Proteger una Página Completa

```typescript
// app/(main)/hr/employees/page.tsx
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

export default function EmployeesPage() {
  return (
    <ProtectedRoute allowedRoles={['admin', 'manager']}>
      <EmployeesList />
    </ProtectedRoute>
  );
}
```

### 2. Usar Hook de Permisos en Componentes

```typescript
import { usePermissions } from '@/hooks/use-permissions';

function EmployeeActions({ employee }) {
  const { canEditEmployee, canDeleteEmployee } = usePermissions();
  
  return (
    <div className="flex gap-2">
      {canEditEmployee && (
        <Button onClick={() => handleEdit(employee)}>
          Edit
        </Button>
      )}
      
      {canDeleteEmployee && (
        <Button variant="destructive" onClick={() => handleDelete(employee)}>
          Delete
        </Button>
      )}
    </div>
  );
}
```

### 3. Verificar Ownership

```typescript
function ClientCard({ client }) {
  const { canEditClient, canDeleteClient } = usePermissions();
  const { user } = useAuth();
  
  const canEdit = canEditClient(client.createdBy);
  const canDelete = canDeleteClient();
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{client.name}</CardTitle>
      </CardHeader>
      <CardFooter>
        {canEdit && <Button>Edit</Button>}
        {canDelete && <Button variant="destructive">Delete</Button>}
      </CardFooter>
    </Card>
  );
}
```

### 4. Verificación Genérica

```typescript
function ModuleActions() {
  const { can } = usePermissions();
  
  const canCreateInvoice = can('finance', 'create');
  const canDeleteInvoice = can('finance', 'delete');
  
  return (
    <>
      {canCreateInvoice && <Button>New Invoice</Button>}
      {canDeleteInvoice && <Button>Delete All</Button>}
    </>
  );
}
```

---

## 🛠️ Administración de Usuarios

### Cambiar Rol de un Usuario (Solo Admin)

```typescript
import { getFunctions, httpsCallable } from 'firebase/functions';

const functions = getFunctions();
const updateRole = httpsCallable(functions, 'updateUserRole');

async function promoteToManager(userId: string) {
  try {
    const result = await updateRole({
      uid: userId,
      role: 'manager'
    });
    
    console.log('Role updated:', result.data);
  } catch (error) {
    console.error('Failed to update role:', error);
  }
}
```

### Ver Rol Actual de un Usuario

```typescript
import { useAuth } from '@/contexts/AuthContext';

function UserInfo() {
  const { user } = useAuth();
  
  return (
    <div>
      <p>Email: {user?.email}</p>
      <p>Role: {user?.role}</p>
    </div>
  );
}
```

---

## 🔍 Verificar que Todo Funciona

### 1. Nuevo Usuario con Email/Password
```
1. Usuario se registra → ✅ role='user' asignado automáticamente
2. Usuario puede acceder a /dashboard ✅
3. Usuario NO puede acceder a /hr/employees ❌ → Redirigido a /unauthorized
```

### 2. Nuevo Usuario con Google OAuth
```
1. Usuario hace login con Google → ✅ role='user' asignado automáticamente
2. Usuario puede completar perfil ✅
3. Usuario puede acceder a módulos permitidos ✅
```

### 3. Usuario Existente
```
1. Admin ejecuta migrateExistingUsers() → ✅ role='user' asignado
2. Usuario puede iniciar sesión ✅
3. Permisos funcionan correctamente ✅
```

### 4. Cambio de Rol
```
1. Admin cambia role de user123 a 'manager' → ✅
2. user123 cierra sesión y vuelve a entrar → ✅ Custom claims actualizados
3. user123 ahora puede acceder a /hr/employees ✅
```

---

## 📊 Matriz de Permisos

| Módulo | Admin | Manager | User |
|--------|-------|---------|------|
| Dashboard | ✅ R/W | ✅ R/W | ✅ R/W |
| CRM | ✅ R/W/D | ✅ R/W | ✅ R/W |
| Sales | ✅ R/W/D | ✅ R/W | ✅ R/W |
| HR | ✅ R/W/D | ✅ R/W | ❌ |
| Finance | ✅ R/W/D | ✅ R/W | ❌ |
| Inventory | ✅ R/W/D | ✅ R/W | ✅ R |
| Projects | ✅ R/W/D | ✅ R/W | ✅ R/W |
| Settings | ✅ R/W/D | ✅ R/W | ❌ |

**Leyenda**: R=Read, W=Write, D=Delete

---

## 🐛 Troubleshooting

### Usuario no tiene permisos después de cambio de rol

**Solución**: El usuario debe cerrar sesión y volver a entrar para que Firebase actualice los custom claims.

```typescript
// Forzar refresh del token
import { auth } from '@/lib/firebase';

const currentUser = auth.currentUser;
if (currentUser) {
  await currentUser.getIdToken(true); // Force refresh
}
```

### Function deployment falla

**Error**: `ENOENT: no such file or directory, open 'functions/lib/index.js'`

**Solución**: Compilar functions antes de desplegar:
```bash
cd functions
npm run build
cd ..
firebase deploy --only functions
```

### Usuario nuevo no tiene rol

**Problema**: Cloud Function no se ejecutó

**Verificación**:
```bash
# Ver logs de functions
firebase functions:log

# Buscar: "Assigned default role 'user' to user..."
```

**Solución Manual** (temporal):
```typescript
// En Firebase Console > Authentication > Users
// Click en usuario > Reclaims personalizados
// Agregar: { "role": "user" }
```

### Permiso denegado en Firestore

**Error**: `Missing or insufficient permissions`

**Causa**: Custom claims no existen

**Solución**:
1. Verificar que functions estén desplegadas
2. Ejecutar migrateExistingUsers() para usuarios antiguos
3. Para nuevos usuarios, assignDefaultRole se ejecuta automáticamente

---

## 🎯 Próximos Pasos Recomendados

### Fase 1 (Ahora) ✅ COMPLETADO
- [x] Crear Cloud Functions
- [x] Implementar permissions.config
- [x] Crear hook usePermissions
- [x] Crear componente ProtectedRoute
- [x] Crear página /unauthorized

### Fase 2 (Próxima Semana)
- [ ] Desplegar functions a producción
- [ ] Migrar usuarios existentes
- [ ] Aplicar ProtectedRoute en todas las páginas sensibles
- [ ] Agregar permisos granulares en componentes

### Fase 3 (Próximo Mes)
- [ ] Implementar auditoría de accesos
- [ ] Agregar rate limiting
- [ ] Implementar 2FA
- [ ] Dashboard de administración de roles

---

## 📚 Referencias

- **Firebase Custom Claims**: https://firebase.google.com/docs/auth/admin/custom-claims
- **Firebase Cloud Functions**: https://firebase.google.com/docs/functions
- **Next.js Route Protection**: https://nextjs.org/docs/app/building-your-application/authentication

---

## ✅ Checklist de Despliegue

- [ ] Instalar dependencias: `cd functions && npm install`
- [ ] Compilar functions: `cd functions && npm run build`
- [ ] Desplegar a Firebase: `firebase deploy --only functions`
- [ ] Verificar logs: `firebase functions:log`
- [ ] Ejecutar migración de usuarios (con cuenta admin)
- [ ] Probar registro de nuevo usuario
- [ ] Probar login con Google OAuth
- [ ] Verificar permisos en diferentes rutas
- [ ] Confirmar que /unauthorized funciona
- [ ] Build del proyecto Next.js: `npm run build`

---

**Estado**: ✅ **LISTO PARA DESPLEGAR**

Todos los archivos han sido creados y el sistema compila sin errores.
Solo falta desplegar las Cloud Functions y ejecutar la migración de usuarios existentes.
