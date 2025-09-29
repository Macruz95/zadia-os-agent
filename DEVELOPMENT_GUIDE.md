# 📚 Guía de Desarrollo - ZADIA OS

## 🎯 Principios Fundamentales

### **1. Consistencia Arquitectural**
- Todos los módulos siguen la misma estructura de directorios
- Patrones de código unificados en toda la aplicación
- Nomenclatura estándar para archivos, componentes y funciones
- Separación clara de responsabilidades

### **2. Type Safety First**
- TypeScript estricto en todo el proyecto
- Zod para validaciones y enums
- Interfaces bien definidas para todas las entidades
- Props tipadas en todos los componentes

### **3. Firebase Optimizado**
- Consultas eficientes sin índices complejos
- Manejo de errores consistente
- Logging completo de operaciones
- Paginación implementada en todos los listados

### **4. UX/UI Coherente**
- Componentes UI reutilizables
- Estados de loading y error manejados
- Responsive design en todos los componentes
- Feedback visual inmediato para acciones del usuario

## 🏗️ Estructura de Módulos

### **Directorio Estándar**
```
module-name/
├── components/          # Componentes React del módulo
│   ├── index.ts        # Exports organizados
│   ├── ModuleDirectory.tsx    # Página principal
│   ├── ModuleForm.tsx         # Formulario CRUD
│   ├── ModuleTable.tsx        # Tabla de datos
│   └── ModuleFilters.tsx      # Filtros de búsqueda
├── docs/               # Documentación completa
│   ├── README.md       # Guía del módulo
│   ├── API.md          # Documentación de servicios
│   └── examples.md     # Ejemplos de uso
├── hooks/              # Lógica de estado
│   ├── index.ts        # Exports
│   └── use-module.ts   # Hook principal del módulo
├── services/           # Lógica de negocio
│   ├── index.ts        # Exports
│   └── entities/       # Servicios por entidad
│       └── entity.service.ts
├── types/              # Definiciones de tipos
│   ├── index.ts        # Exports
│   └── module.types.ts # Interfaces principales
├── utils/              # Utilidades específicas
│   ├── index.ts        # Exports
│   └── module.utils.ts # Funciones de apoyo
├── validations/        # Esquemas Zod
│   ├── index.ts        # Exports
│   └── module.schema.ts # Validaciones principales
└── index.ts           # Punto de entrada único
```

## 📝 Convenciones de Nomenclatura

### **Archivos y Directorios**
```
kebab-case.ts          # Archivos TypeScript
PascalCase.tsx         # Componentes React
use-feature-name.ts    # Custom hooks
feature.service.ts     # Servicios
feature.types.ts       # Tipos
feature.schema.ts      # Validaciones Zod
feature.utils.ts       # Utilidades
```

### **Código**
```typescript
// Interfaces y tipos
interface UserProfile { }
type UserStatus = 'active' | 'inactive';

// Enums con Zod (OBLIGATORIO)
export const UserStatusEnum = z.enum(['active', 'inactive']);

// Componentes React
export function UserProfile() { }

// Servicios (clase estática)
export class UserService { }

// Hooks
export function useUserProfile() { }

// Constantes
export const API_ENDPOINTS = { };

// Funciones
export function formatUserName() { }
```

## 🔧 Patrones de Implementación

### **1. Servicios Firebase**
```typescript
export class EntityService {
  private static readonly COLLECTION = 'entities';

  static async create(data: EntityFormData, createdBy: string): Promise<Entity> {
    try {
      const entityData = {
        ...data,
        createdAt: Timestamp.fromDate(new Date()),
        updatedAt: Timestamp.fromDate(new Date()),
        createdBy,
      };

      const docRef = await addDoc(collection(db, this.COLLECTION), entityData);
      
      const newEntity = { id: docRef.id, ...entityData } as Entity;
      logger.info(`Entity created: ${newEntity.id}`);
      
      return newEntity;
    } catch (error) {
      logger.error('Error creating entity:', error as Error);
      throw new Error('Error al crear entidad');
    }
  }

  static async search(filters: EntityFilters = {}): Promise<EntitySearchResult> {
    try {
      let q = query(collection(db, this.COLLECTION));
      
      // Aplicar filtros simples (sin índices complejos)
      if (filters.status) {
        q = query(q, where('status', '==', filters.status));
      }
      
      q = query(q, orderBy('createdAt', 'desc'), limit(20));
      
      const snapshot = await getDocs(q);
      const entities = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Entity[];

      return { entities, totalCount: entities.length };
    } catch (error) {
      logger.error('Error searching entities:', error as Error);
      throw new Error('Error al buscar entidades');
    }
  }
}
```

### **2. Custom Hooks**
```typescript
export function useModule() {
  const [entities, setEntities] = useState<Entity[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();

  const searchEntities = useCallback(async (filters: EntityFilters = {}) => {
    try {
      setLoading(true);
      setError(undefined);
      
      const result = await EntityService.search(filters);
      setEntities(result.entities);
    } catch (err) {
      setError('Error al buscar entidades');
      logger.error('Hook error:', err as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  const createEntity = useCallback(async (data: EntityFormData) => {
    try {
      setLoading(true);
      const newEntity = await EntityService.create(data, 'user-id');
      setEntities(prev => [newEntity, ...prev]);
      return newEntity;
    } catch (err) {
      setError('Error al crear entidad');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    entities,
    loading,
    error,
    searchEntities,
    createEntity,
  };
}
```

### **3. Componentes React**
```typescript
interface ModuleDirectoryProps {
  title: string;
  description?: string;
}

export function ModuleDirectory({ title, description }: ModuleDirectoryProps) {
  const { entities, loading, error, searchEntities, createEntity } = useModule();
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  useEffect(() => {
    searchEntities();
  }, [searchEntities]);

  const handleCreate = useCallback(async (data: EntityFormData) => {
    try {
      await createEntity(data);
      setShowCreateDialog(false);
    } catch (error) {
      // Error ya manejado en el hook
    }
  }, [createEntity]);

  if (loading && entities.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">{title}</h1>
          {description && <p className="text-gray-600">{description}</p>}
        </div>
        
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus size={16} className="mr-2" />
          Crear Nuevo
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <ModuleTable entities={entities} loading={loading} />
      
      <CreateDialog 
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSubmit={handleCreate}
      />
    </div>
  );
}
```

### **4. Validaciones Zod**
```typescript
// Enums con Zod (OBLIGATORIO en lugar de TypeScript enums)
export const EntityStatusEnum = z.enum(['active', 'inactive', 'pending']);
export const EntityTypeEnum = z.enum(['type1', 'type2', 'type3']);

// Schema principal
export const EntitySchema = z.object({
  name: z.string()
    .min(1, 'Nombre es requerido')
    .max(100, 'Nombre muy largo'),
  status: EntityStatusEnum,
  type: EntityTypeEnum,
  description: z.string()
    .max(500, 'Descripción muy larga')
    .optional(),
});

// Schema de formulario (puede ser diferente del modelo completo)
export const EntityFormSchema = EntitySchema.pick({
  name: true,
  status: true,
  type: true,
  description: true,
});

// Schema de filtros
export const EntityFiltersSchema = z.object({
  status: z.array(EntityStatusEnum).optional(),
  type: z.array(EntityTypeEnum).optional(),
  search: z.string().optional(),
});

// Types inferidos
export type EntityStatus = z.infer<typeof EntityStatusEnum>;
export type EntityType = z.infer<typeof EntityTypeEnum>;
export type EntityFormData = z.infer<typeof EntityFormSchema>;
export type EntityFilters = z.infer<typeof EntityFiltersSchema>;
```

## 🎨 Componentes UI Estándar

### **Estados de Loading**
```typescript
// Loading Spinner Consistente
function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      <span className="ml-2 text-gray-600">Cargando...</span>
    </div>
  );
}

// Empty State
function EmptyState({ message = "No se encontraron resultados" }) {
  return (
    <div className="text-center py-12">
      <p className="text-gray-500">{message}</p>
    </div>
  );
}
```

### **Manejo de Errores**
```typescript
// Error Alert Estándar
function ErrorAlert({ error, onRetry }: { error: string; onRetry?: () => void }) {
  return (
    <Alert variant="destructive">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription className="flex items-center justify-between">
        {error}
        {onRetry && (
          <Button variant="outline" size="sm" onClick={onRetry}>
            Reintentar
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
}
```

## 📊 Optimización de Performance

### **Firebase Queries**
```typescript
// ✅ CORRECTO - Consulta simple sin índices complejos
const simpleQuery = query(
  collection(db, 'entities'),
  where('status', '==', 'active'),
  orderBy('createdAt', 'desc'),
  limit(20)
);

// ❌ EVITAR - Consultas complejas que requieren índices
const complexQuery = query(
  collection(db, 'entities'),
  where('status', '==', 'active'),
  where('type', '==', 'premium'),
  where('createdAt', '>', startDate),
  orderBy('name', 'asc')
);

// ✅ ALTERNATIVA - Filtrar localmente después de obtener datos
const entities = await getDocs(simpleQuery);
const filtered = entities.docs
  .map(doc => ({ id: doc.id, ...doc.data() }))
  .filter(entity => entity.type === 'premium')
  .filter(entity => entity.createdAt > startDate);
```

### **Lazy Loading de Componentes**
```typescript
// Lazy loading para componentes pesados
const ModuleForm = lazy(() => import('./ModuleForm'));
const ModuleFilters = lazy(() => import('./ModuleFilters'));

// Uso con Suspense
function ModuleDirectory() {
  return (
    <div>
      <Suspense fallback={<LoadingSpinner />}>
        <ModuleForm />
      </Suspense>
    </div>
  );
}
```

## 🔐 Seguridad y Autenticación

### **Protección de Rutas**
```typescript
// HOC para proteger componentes
function withAuth<T extends object>(Component: React.ComponentType<T>) {
  return function ProtectedComponent(props: T) {
    const { user, loading } = useAuth();
    
    if (loading) return <LoadingSpinner />;
    if (!user) return <Navigate to="/login" />;
    
    return <Component {...props} />;
  };
}

// Uso
export default withAuth(ModuleDirectory);
```

### **Validación de Permisos**
```typescript
// Hook para verificar permisos
function usePermissions() {
  const { user } = useAuth();
  
  const canCreate = user?.role === 'admin' || user?.role === 'editor';
  const canEdit = user?.role === 'admin' || user?.role === 'editor';
  const canDelete = user?.role === 'admin';
  
  return { canCreate, canEdit, canDelete };
}
```

## 📝 Documentación Obligatoria

### **README.md de Módulo**
```markdown
# Módulo de [Nombre]

## Descripción
Breve descripción del propósito del módulo.

## Estructura
- `components/` - Componentes React
- `hooks/` - Custom hooks
- `services/` - Lógica de negocio
- `types/` - Definiciones de tipos
- `validations/` - Esquemas Zod

## Uso Básico
```typescript
import { useModule, EntityService } from '@/modules/[nombre]';

function MyComponent() {
  const { entities, loading } = useModule();
  // ...
}
```

## API Reference
Ver `docs/API.md` para documentación completa de servicios.
```

### **JSDoc en Funciones**
```typescript
/**
 * Crea una nueva entidad en Firebase
 * @param data - Datos del formulario validados
 * @param createdBy - ID del usuario que crea la entidad
 * @returns Promise con la entidad creada
 * @throws Error si falla la creación
 */
static async createEntity(
  data: EntityFormData, 
  createdBy: string
): Promise<Entity> {
  // implementación
}
```

## ✅ Checklist de Desarrollo

### **Antes de Crear un Módulo**
- [ ] Analizar si puede reutilizar componentes existentes
- [ ] Definir la estructura de datos en Firestore
- [ ] Planificar las consultas para evitar índices complejos
- [ ] Diseñar la interfaz siguiendo patrones establecidos

### **Durante el Desarrollo**
- [ ] Crear estructura de directorios estándar
- [ ] Implementar tipos con Zod enums
- [ ] Desarrollar servicios con manejo de errores
- [ ] Crear hooks con estado consistente
- [ ] Implementar componentes reutilizables
- [ ] Agregar documentación JSDoc

### **Antes de Hacer Commit**
- [ ] Ejecutar linter sin errores
- [ ] Verificar build exitoso
- [ ] Probar funcionalidad básica
- [ ] Revisar responsive design
- [ ] Verificar manejo de estados vacíos/error
- [ ] Actualizar documentación

### **Código de Calidad**
- [ ] No hay console.log en producción
- [ ] Manejo de errores implementado
- [ ] Loading states en todas las operaciones
- [ ] Props tipadas correctamente
- [ ] Funciones documentadas con JSDoc
- [ ] Nombres descriptivos y consistentes

## 🎯 Objetivos de Performance

- **Bundle Size**: Cada módulo < 50KB gzipped
- **Time to Interactive**: < 3 segundos
- **Firebase Reads**: < 100 reads por página
- **Render Time**: < 16ms (60fps)
- **Memory Usage**: Sin memory leaks detectables

## 📈 Métricas de Calidad

- **Test Coverage**: > 80% para servicios críticos
- **ESLint Score**: 0 errores, < 5 warnings
- **TypeScript**: Strict mode, 0 errores
- **Accessibility**: WCAG 2.1 AA compliant
- **SEO**: Lighthouse score > 90