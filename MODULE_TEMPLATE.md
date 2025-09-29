# 🏗️ Template de Módulo Estándar - ZADIA OS

## 📁 Estructura de Directorios

Todos los módulos deben seguir esta estructura exacta:

```
module-name/
├── components/          # Componentes React específicos del módulo
│   ├── index.ts        # Exports de componentes
│   └── ModuleName/     # Componentes organizados por funcionalidad
├── docs/               # Documentación completa del módulo
│   ├── README.md       # Documentación principal
│   ├── API.md          # Documentación de API
│   └── examples.md     # Ejemplos de uso
├── hooks/              # Custom hooks del módulo
│   ├── index.ts        # Exports de hooks
│   └── use-module.ts   # Hook principal del módulo
├── index.ts            # Punto de entrada único del módulo
├── services/           # Servicios de negocio
│   ├── index.ts        # Exports de servicios
│   └── entities/       # Servicios por entidad
├── types/              # Definiciones de tipos (solo Zod enums)
│   ├── index.ts        # Exports de tipos
│   └── module.types.ts # Tipos principales
├── utils/              # Utilidades específicas del módulo
│   ├── index.ts        # Exports de utilidades
│   └── module.utils.ts # Utilidades principales
└── validations/        # Esquemas de validación Zod
    ├── index.ts        # Exports de validaciones
    └── module.schema.ts # Esquemas principales
```

## 📝 Templates de Archivos

### **types/module.types.ts**
```typescript
import { z } from 'zod';
import { Timestamp } from 'firebase/firestore';

// Enums usando Zod (OBLIGATORIO)
export const EntityStatusEnum = z.enum(['active', 'inactive', 'pending']);
export type EntityStatus = z.infer<typeof EntityStatusEnum>;

export const EntityTypeEnum = z.enum(['type1', 'type2', 'type3']);
export type EntityType = z.infer<typeof EntityTypeEnum>;

// Interfaces principales
export interface BaseEntity {
  id: string;
  status: EntityStatus;
  type: EntityType;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;
}

// Search y Filter types
export interface EntityFilters {
  status?: EntityStatus[];
  type?: EntityType[];
  createdFrom?: Date;
  createdTo?: Date;
}

export interface EntitySearchResult {
  entities: BaseEntity[];
  totalCount: number;
}
```

### **validations/module.schema.ts**
```typescript
import { z } from 'zod';
import { EntityStatusEnum, EntityTypeEnum } from '../types/module.types';

// Schema principal de entidad
export const EntitySchema = z.object({
  status: EntityStatusEnum,
  type: EntityTypeEnum,
  name: z.string().min(1, 'Nombre es requerido').max(100, 'Nombre muy largo'),
  description: z.string().max(500, 'Descripción muy larga').optional(),
});

// Schema de formulario
export const EntityFormSchema = EntitySchema;

// Schema de filtros
export const EntityFiltersSchema = z.object({
  status: z.array(EntityStatusEnum).optional(),
  type: z.array(EntityTypeEnum).optional(),
  createdFrom: z.date().optional(),
  createdTo: z.date().optional(),
});

// Types exportados
export type EntityFormData = z.infer<typeof EntityFormSchema>;
export type EntityFiltersData = z.infer<typeof EntityFiltersSchema>;
```

### **services/entities/entity.service.ts**
```typescript
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  Timestamp 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { logger } from '@/lib/logger';
import { BaseEntity, EntityFilters, EntitySearchResult } from '../../types/module.types';
import { EntityFormData } from '../../validations/module.schema';

const COLLECTION_NAME = 'entities'; // Cambiar por nombre real

export class EntityService {
  /**
   * Create new entity
   */
  static async createEntity(data: EntityFormData, createdBy: string): Promise<BaseEntity> {
    try {
      const entityData = {
        ...data,
        createdAt: Timestamp.fromDate(new Date()),
        updatedAt: Timestamp.fromDate(new Date()),
        createdBy,
      };

      const docRef = await addDoc(collection(db, COLLECTION_NAME), entityData);
      
      const newEntity = {
        id: docRef.id,
        ...entityData,
      } as BaseEntity;

      logger.info(`Entity created: ${newEntity.id}`);
      return newEntity;
    } catch (error) {
      logger.error('Error creating entity:', error as Error);
      throw new Error('Error al crear entidad');
    }
  }

  /**
   * Get entity by ID
   */
  static async getEntityById(id: string): Promise<BaseEntity | null> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data(),
        } as BaseEntity;
      }

      return null;
    } catch (error) {
      logger.error('Error getting entity:', error as Error);
      throw new Error('Error al obtener entidad');
    }
  }

  /**
   * Search entities with filters
   */
  static async searchEntities(
    filters: EntityFilters = {},
    pageSize: number = 20
  ): Promise<EntitySearchResult> {
    try {
      let q = query(collection(db, COLLECTION_NAME));

      // Apply filters
      if (filters.status && filters.status.length > 0) {
        q = query(q, where('status', 'in', filters.status));
      }

      if (filters.type && filters.type.length > 0) {
        q = query(q, where('type', 'in', filters.type));
      }

      // Order by creation date
      q = query(q, orderBy('createdAt', 'desc'), limit(pageSize));

      const querySnapshot = await getDocs(q);
      const entities = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as BaseEntity[];

      return {
        entities,
        totalCount: entities.length,
      };
    } catch (error) {
      logger.error('Error searching entities:', error as Error);
      throw new Error('Error al buscar entidades');
    }
  }

  /**
   * Update entity
   */
  static async updateEntity(id: string, data: Partial<EntityFormData>): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      const updateData = {
        ...data,
        updatedAt: Timestamp.fromDate(new Date()),
      };

      await updateDoc(docRef, updateData);
      logger.info(`Entity updated: ${id}`);
    } catch (error) {
      logger.error('Error updating entity:', error as Error);
      throw new Error('Error al actualizar entidad');
    }
  }

  /**
   * Delete entity
   */
  static async deleteEntity(id: string): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await deleteDoc(docRef);
      logger.info(`Entity deleted: ${id}`);
    } catch (error) {
      logger.error('Error deleting entity:', error as Error);
      throw new Error('Error al eliminar entidad');
    }
  }
}
```

### **hooks/use-module.ts**
```typescript
import { useState, useCallback } from 'react';
import { BaseEntity, EntityFilters } from '../types/module.types';
import { EntityFormData } from '../validations/module.schema';
import { EntityService } from '../services/entities/entity.service';
import { logger } from '@/lib/logger';

interface UseModuleReturn {
  entities: BaseEntity[];
  loading: boolean;
  error?: string;
  totalCount: number;
  searchEntities: (filters?: EntityFilters, reset?: boolean) => Promise<void>;
  createEntity: (data: EntityFormData, createdBy: string) => Promise<BaseEntity>;
  updateEntity: (id: string, data: Partial<EntityFormData>) => Promise<void>;
  deleteEntity: (id: string) => Promise<void>;
  refresh: () => Promise<void>;
}

export function useModule(): UseModuleReturn {
  const [entities, setEntities] = useState<BaseEntity[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();
  const [totalCount, setTotalCount] = useState(0);
  const [currentFilters, setCurrentFilters] = useState<EntityFilters>({});

  const searchEntities = useCallback(async (
    filters: EntityFilters = {},
    reset: boolean = false
  ) => {
    try {
      setLoading(true);
      setError(undefined);

      if (reset) {
        setEntities([]);
        setCurrentFilters(filters);
      }

      const result = await EntityService.searchEntities(filters);
      
      if (reset) {
        setEntities(result.entities);
      } else {
        setEntities(prev => [...prev, ...result.entities]);
      }
      
      setTotalCount(result.totalCount);
      setCurrentFilters(filters);
    } catch (err) {
      const errorMessage = 'Error al buscar entidades';
      setError(errorMessage);
      logger.error('Error searching entities:', err as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  const createEntity = useCallback(async (
    data: EntityFormData,
    createdBy: string
  ): Promise<BaseEntity> => {
    try {
      setLoading(true);
      setError(undefined);

      const newEntity = await EntityService.createEntity(data, createdBy);
      
      setEntities(prev => [newEntity, ...prev]);
      setTotalCount(prev => prev + 1);

      return newEntity;
    } catch (err) {
      const errorMessage = 'Error al crear entidad';
      setError(errorMessage);
      logger.error('Error creating entity:', err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateEntity = useCallback(async (
    id: string,
    data: Partial<EntityFormData>
  ) => {
    try {
      setError(undefined);

      await EntityService.updateEntity(id, data);
      
      setEntities(prev => prev.map(entity => 
        entity.id === id ? { ...entity, ...data } : entity
      ));

      logger.info(`Entity updated: ${id}`);
    } catch (err) {
      const errorMessage = 'Error al actualizar entidad';
      setError(errorMessage);
      logger.error('Error updating entity:', err as Error);
      throw err;
    }
  }, []);

  const deleteEntity = useCallback(async (id: string) => {
    try {
      setError(undefined);

      await EntityService.deleteEntity(id);
      
      setEntities(prev => prev.filter(entity => entity.id !== id));
      setTotalCount(prev => prev - 1);

      logger.info(`Entity deleted: ${id}`);
    } catch (err) {
      const errorMessage = 'Error al eliminar entidad';
      setError(errorMessage);
      logger.error('Error deleting entity:', err as Error);
      throw err;
    }
  }, []);

  const refresh = useCallback(async () => {
    await searchEntities(currentFilters, true);
  }, [currentFilters, searchEntities]);

  return {
    entities,
    loading,
    error,
    totalCount,
    searchEntities,
    createEntity,
    updateEntity,
    deleteEntity,
    refresh,
  };
}
```

### **index.ts** (Punto de entrada principal)
```typescript
// Types
export * from './types';

// Validations
export {
  EntitySchema,
  EntityFormSchema,
  EntityFiltersSchema,
} from './validations/module.schema';

// Services
export * from './services';

// Hooks
export * from './hooks';

// Utils
export * from './utils';

// Components
export { ModuleDirectory } from './components/ModuleDirectory';
export { ModuleForm } from './components/ModuleForm';
```

## 🔧 Guías de Implementación

### **1. Nomenclatura Consistente**
- Archivos: `kebab-case.ts`
- Componentes: `PascalCase.tsx`
- Hooks: `use-feature-name.ts`
- Servicios: `FeatureService`
- Tipos: `FeatureType`
- Enums: `FeatureEnum`

### **2. Imports Organizados**
```typescript
// 1. React y librerías externas
import React from 'react';
import { z } from 'zod';

// 2. Firebase
import { collection, doc } from 'firebase/firestore';

// 3. Componentes UI
import { Button } from '@/components/ui/button';

// 4. Servicios y utils locales
import { logger } from '@/lib/logger';

// 5. Tipos locales del módulo
import { BaseEntity } from '../types/module.types';
```

### **3. Documentación Obligatoria**
- Cada función debe tener JSDoc
- Cada interface debe estar documentada
- README.md con ejemplos de uso
- API.md con especificaciones

### **4. Manejo de Errores**
- Usar logger para todas las operaciones
- Mensajes de error consistentes en español
- Try/catch en todos los servicios
- Estados de error en hooks

## ✅ Checklist de Validación

- [ ] Estructura de directorios completa
- [ ] Tipos definidos con Zod enums
- [ ] Servicios con arquitectura de entidad
- [ ] Hooks con estado consistente
- [ ] Index.ts con exports organizados
- [ ] Documentación en docs/
- [ ] Validaciones con Zod
- [ ] Utils implementadas
- [ ] Manejo de errores completo
- [ ] Build exitoso sin warnings