# CRUD Operation Patterns for Zadia OS

## Overview
This document defines the standardized patterns for Create, Read, Update, Delete operations across the Zadia OS application, specifically focusing on the clients module as the reference implementation.

## Core Principles

### 1. 📊 Datos reales – No mocks, no hardcode
- All operations must interact with real Firebase Firestore
- No hardcoded data or mock services in production code
- Use TypeScript interfaces and Zod schemas for type safety

### 2. 🧩 Sistema UI estandarizado – ShadCN + Lucide Icons
- All UI components must use ShadCN/UI library
- Icons must use Lucide React
- Consistent modal patterns using Dialog components
- Form inputs must use ShadCN form components

### 3. 🔐 Validación estricta con Zod
- All forms must use Zod schemas for validation
- React Hook Form with zodResolver for client-side validation
- Server-side validation using the same Zod schemas

### 4. 🧱 Arquitectura modular y escalable
- Service layer pattern with entity-specific services
- Clear separation of concerns: services, hooks, components, utils
- Consistent naming conventions and file organization

### 5. 📏 Límites de tamaño por archivo
- Components: max 300 lines
- Services: max 200 lines per method group
- Hooks: max 150 lines
- Utils: max 100 lines

## CRUD Patterns

### CREATE Operations

#### Service Layer Pattern
```typescript
// services/entities/[entity]-entity.service.ts
static async create[Entity](data: Omit<Entity, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  const validated = EntitySchema.parse(data);
  const now = Timestamp.now();
  const docRef = await addDoc(collection(db, COLLECTION_NAME), {
    ...validated,
    createdAt: now,
    updatedAt: now,
  });
  return docRef.id;
}
```

#### Component Pattern
```typescript
// components/[Entity]CreationForm.tsx
const handleSubmit = async (data: EntityFormData) => {
  try {
    setIsSubmitting(true);
    await createEntity(data);
    notificationService.success('[Entity] creado exitosamente');
    onSuccess?.();
    form.reset();
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al crear [entity]';
    notificationService.error(message);
  } finally {
    setIsSubmitting(false);
  }
};
```

### READ Operations

#### Service Layer Pattern
```typescript
// List all entities
static async get[Entities](): Promise<Entity[]> {
  const q = query(collection(db, COLLECTION_NAME), orderBy('updatedAt', 'desc'));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(docToEntity);
}

// Get single entity
static async get[Entity]ById(id: string): Promise<Entity | null> {
  const docRef = doc(db, COLLECTION_NAME, id);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? docToEntity(docSnap) : null;
}

// Search with filters
static async search[Entities](params: EntitySearchParams): Promise<Entity[]> {
  let q = query(collection(db, COLLECTION_NAME));
  
  if (params.filters?.field) {
    q = query(q, where('field', '==', params.filters.field));
  }
  
  q = query(q, orderBy('updatedAt', 'desc'));
  
  if (params.limit) {
    q = query(q, limit(params.limit));
  }
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(docToEntity);
}
```

#### Hook Pattern
```typescript
// hooks/use-[entities].ts
export function use[Entities](params?: EntitySearchParams) {
  const [entities, setEntities] = useState<Entity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEntities = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = params ? await searchEntities(params) : await getEntities();
      setEntities(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar datos');
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchEntities();
  }, [fetchEntities]);

  return { entities, loading, error, refetch: fetchEntities };
}
```

### UPDATE Operations

#### Service Layer Pattern
```typescript
static async update[Entity](id: string, updates: Partial<Entity>): Promise<void> {
  const docRef = doc(db, COLLECTION_NAME, id);
  await updateDoc(docRef, {
    ...updates,
    updatedAt: Timestamp.now(),
  });
}
```

#### Component Pattern (Modal Dialog)
```typescript
// components/Edit[Entity]Dialog.tsx
export function Edit[Entity]Dialog({ open, onOpenChange, entity, onSuccess }: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<EditEntityFormData>({
    resolver: zodResolver(EditEntitySchema),
    defaultValues: {
      // Map entity properties to form fields
    },
  });

  const handleSubmit = async (data: EditEntityFormData) => {
    try {
      setIsSubmitting(true);
      await updateEntity(entity.id, data);
      notificationService.success('[Entity] actualizado exitosamente');
      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al actualizar [entity]';
      notificationService.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar [Entity]</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          {/* Form fields */}
        </form>
      </DialogContent>
    </Dialog>
  );
}
```

### DELETE Operations

#### Service Layer Pattern
```typescript
static async delete[Entity](id: string): Promise<void> {
  const docRef = doc(db, COLLECTION_NAME, id);
  await deleteDoc(docRef);
}
```

#### Component Pattern (Confirmation Dialog)
```typescript
// components/Delete[Entity]Dialog.tsx
export function Delete[Entity]Dialog({ open, onOpenChange, entity, onSuccess }: Props) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await deleteEntity(entity.id);
      notificationService.success('[Entity] eliminado exitosamente');
      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al eliminar [entity]';
      notificationService.error(message);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción no se puede deshacer. Se eliminará permanentemente el [entity] {entity.name}.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
            {isDeleting ? 'Eliminando...' : 'Eliminar'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
```

## Error Handling Patterns

### Consistent Error Messages
```typescript
// Always use structured error handling
try {
  // Operation
} catch (error) {
  const message = error instanceof Error ? error.message : 'Error genérico';
  notificationService.error(message);
}
```

### Loading States
```typescript
// Always provide loading states for async operations
const [isLoading, setIsLoading] = useState(false);

const handleOperation = async () => {
  try {
    setIsLoading(true);
    // Async operation
  } finally {
    setIsLoading(false);
  }
};
```

## Notification Patterns

### Success Messages
- Create: "[Entity] creado exitosamente"
- Update: "[Entity] actualizado exitosamente"
- Delete: "[Entity] eliminado exitosamente"

### Error Messages
- Generic: "Error al [operation] [entity]"
- Specific: Use the actual error message when available

## Form Validation Patterns

### Schema Definition
```typescript
// validations/[entity].schema.ts
export const [Entity]Schema = z.object({
  // Required fields first
  name: z.string().min(1, 'Nombre es requerido'),
  // Optional fields last
  description: z.string().optional(),
});

export const [Entity]FormSchema = [Entity]Schema.extend({
  // Additional form-specific fields
});

export type [Entity]FormData = z.infer<typeof [Entity]FormSchema>;
```

### Form Component Pattern
```typescript
const form = useForm<EntityFormData>({
  resolver: zodResolver(EntityFormSchema),
  defaultValues: {
    // Provide defaults for all fields
  },
});
```

## File Organization

```
src/modules/[module]/
├── components/           # UI components
│   ├── [Entity]Directory.tsx
│   ├── [Entity]CreationForm.tsx
│   ├── Edit[Entity]Dialog.tsx
│   ├── Delete[Entity]Dialog.tsx
│   └── [Entity]Table.tsx
├── hooks/               # Custom hooks
│   ├── use-[entities].ts
│   └── use-[entity]-form.ts
├── services/            # Business logic
│   ├── [module].service.ts
│   └── entities/
│       └── [entity]-entity.service.ts
├── types/               # Type definitions
│   └── [module].types.ts
├── validations/         # Zod schemas
│   └── [module].schema.ts
├── utils/               # Utility functions
│   └── [utility].utils.ts
└── docs/               # Documentation
    └── crud-patterns.md
```

## Implementation Checklist

- [ ] Service methods follow consistent naming and structure
- [ ] All forms use React Hook Form + Zod validation
- [ ] Error handling uses notification service
- [ ] Loading states are implemented for all async operations
- [ ] Modal dialogs use ShadCN components
- [ ] Confirmation dialogs for destructive actions
- [ ] Consistent success/error message patterns
- [ ] File size limits are respected
- [ ] TypeScript types are properly defined
- [ ] Real Firebase integration (no mocks)