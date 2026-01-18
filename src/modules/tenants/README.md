# Módulo de Tenants (Multi-tenancy)

## Descripción
El módulo de Tenants gestiona la arquitectura multi-tenant de ZADIA OS, permitiendo que múltiples organizaciones usen la plataforma de forma aislada.

## Estructura

```
tenants/
├── components/         # Componentes de UI
│   ├── TenantSelector.tsx
│   ├── TenantSettings.tsx
│   ├── MemberInvite.tsx
│   └── ...
├── hooks/              # Hooks de React
│   ├── use-tenant.ts
│   ├── use-tenant-members.ts
│   └── ...
├── services/           # Servicios de Firebase
│   ├── tenant.service.ts
│   └── tenant-member.service.ts
├── types/              # Tipos TypeScript
│   └── tenant.types.ts
└── validations/        # Esquemas Zod
    └── tenant.schema.ts
```

## Características

### Gestión de Tenants
- Crear nuevas organizaciones
- Configurar información del tenant
- Gestionar suscripciones
- Branding personalizado

### Roles de Usuario
- `owner` - Propietario (control total)
- `admin` - Administrador
- `member` - Miembro estándar
- `viewer` - Solo lectura

### Membresías
- Invitar usuarios al tenant
- Gestionar roles
- Revocar acceso
- Transferir propiedad

### Aislamiento de Datos
- Todos los documentos tienen `tenantId`
- Reglas de Firestore validan acceso
- Usuarios solo ven datos de sus tenants

## Uso

```typescript
import { useTenant } from '@/modules/tenants/hooks/use-tenant';
import { TenantService } from '@/modules/tenants/services/tenant.service';
import { TenantMemberService } from '@/modules/tenants/services/tenant-member.service';

// En un componente
function TenantPage() {
  const { tenant, tenantId, hasMembership, switchTenant } = useTenant();
  
  // Invitar miembro
  await TenantMemberService.inviteMember(tenantId, email, 'member');
  
  // Cambiar de tenant
  switchTenant(otherTenantId);
}
```

## Colecciones de Firebase
- `tenants` - Información de organizaciones
- `tenantMembers` - Membresías (formato: `{tenantId}_{userId}`)
- `tenantInvitations` - Invitaciones pendientes
- `tenant-branding` - Configuración de marca

## Reglas de Seguridad

### Funciones de Acceso
```javascript
// Verificar si es propietario
function isTenantOwnerGlobal(tenantId) {
  return tenants/tenantId.ownerId == request.auth.uid;
}

// Verificar membresía
function isTenantMember(tenantId) {
  return exists(tenantMembers/{tenantId}_{userId});
}

// Acceso combinado
function hasTenantAccess(tenantId) {
  return isTenantMember(tenantId) || isTenantOwnerGlobal(tenantId);
}
```

## TenantContext

El contexto global maneja:
- Tenant activo actual
- Lista de tenants del usuario
- Estado de membresía
- Cambio de tenant
- Auto-creación de membresía para owners

```typescript
import { useTenant } from '@/contexts/TenantContext';

function MyComponent() {
  const { 
    tenant,           // Tenant activo
    tenantId,         // ID del tenant
    tenants,          // Lista de tenants
    hasMembership,    // ¿Tiene membresía?
    isOwner,          // ¿Es propietario?
    switchTenant,     // Cambiar tenant
    loading,          // Estado de carga
  } = useTenant();
}
```

## Notas de Implementación
- El propietario puede crear membresía sin documento previo
- Las membresías se almacenan en localStorage para persistencia
- El cambio de tenant recarga los datos del contexto
