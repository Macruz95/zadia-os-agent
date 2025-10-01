# Clients Module

## Descripción
Módulo de gestión de clientes para ZADIA OS que maneja información completa de clientes, contactos, y relaciones comerciales.

## Estructura del Módulo

```
clients/
├── components/          # Componentes React para UI de clientes
│   ├── form-steps/     # Pasos del formulario de creación
│   ├── contacts/       # Gestión de contactos
│   ├── timeline/       # Historial de interacciones
│   └── reusable-components.ts
├── hooks/              # React hooks personalizados
├── services/           # Servicios de datos (Firebase)
├── types/              # Definiciones de tipos TypeScript
├── validations/        # Esquemas de validación Zod
├── utils/              # Utilidades y helpers
├── docs/              # Documentación adicional
└── index.ts           # Punto de entrada del módulo
```

## Reglas de Cumplimiento ZADIA OS

✅ **Regla 1: Datos Reales** - Integración completa con Firebase/Firestore, sin mocks  
✅ **Regla 2: UI Estandarizado** - Uso exclusivo de ShadCN UI + Lucide Icons  
✅ **Regla 3: Validación Estricta** - Todos los datos validados con Zod  
✅ **Regla 4: Arquitectura Modular** - Separación clara de responsabilidades  
✅ **Regla 5: Límites de Archivo** - Máximo 200 líneas por archivo  

## Características Principales

### Tipos de Cliente
- **Persona Natural** - Individuos con datos personales
- **Empresa** - Organizaciones comerciales
- **Organización** - Entidades institucionales

### Formulario Multi-Paso
1. **Información Básica** - Datos principales del cliente
2. **Información de Contacto** - Teléfonos, emails, direcciones
3. **Información Fiscal** - Datos tributarios y documentos
4. **Contactos** - Personas de contacto asociadas
5. **Revisión** - Confirmación antes de crear

### Gestión de Contactos
- Múltiples contactos por cliente
- Roles y responsabilidades
- Información de contacto detallada
- Historial de interacciones

## Servicios Principales

### ClientsService
- CRUD completo de clientes
- Búsqueda y filtrado avanzado
- Gestión de estados y categorías

### ContactsService
- Gestión de contactos asociados
- Roles y permisos
- Sincronización con clientes

## Hooks Disponibles

- `useClientForm()` - Gestión del formulario multi-paso
- `useClients()` - Gestión de estado de clientes
- `useContacts()` - Gestión de contactos

## Tipos Principales

```typescript
interface Client {
  id: string;
  type: ClientType; // 'PersonaNatural' | 'Empresa' | 'Organización'
  status: ClientStatus; // 'Prospecto' | 'Activo' | 'Inactivo'
  
  // Información básica
  firstName?: string;
  lastName?: string;
  businessName?: string;
  
  // Contacto
  email: string;
  phone: string;
  address?: Address;
  
  // Fiscal
  taxId?: string;
  taxInfo?: TaxInfo;
  
  // Metadatos
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}
```

## Validaciones

Esquemas Zod específicos para cada tipo:
- `clientBaseSchema` - Validación base común
- `personaNaturalSchema` - Específico para personas
- `empresaSchema` - Específico para empresas
- `organizacionSchema` - Específico para organizaciones

## Integración con Firebase

Colecciones utilizadas:
- `clients` - Información principal de clientes
- `client-contacts` - Contactos asociados
- `client-interactions` - Historial de interacciones
- `client-documents` - Documentos adjuntos

## Componentes Principales

### ClientCreationForm
Formulario multi-paso completo para creación de clientes.

### ClientDirectory
Listado y búsqueda de clientes con filtros avanzados.

### ClientProfilePage
Vista detallada del perfil del cliente con toda su información.

### ContactsManager
Gestión de contactos asociados al cliente.

## Estado del Módulo

✅ **Funcional** - Módulo completamente operativo  
✅ **Multi-Paso** - Formulario wizard optimizado para UX  
✅ **Flexible** - Soporte para diferentes tipos de cliente  
✅ **Extensible** - Arquitectura preparada para nuevas funcionalidades  

## Uso del Módulo

```typescript
import { 
  ClientCreationForm, 
  useClientForm, 
  ClientsService 
} from '@/modules/clients';

// En un componente
const { form, currentStep, nextStep } = useClientForm();

// Crear cliente
await ClientsService.createClient(clientData);
```

## Próximas Mejoras

- [ ] Sistema de categorización automática
- [ ] Integración con módulo de ventas
- [ ] Reportes de actividad por cliente
- [ ] Sincronización con sistemas externos
- [ ] Gestión de documentos mejorada
- [ ] Dashboard de clientes con métricas