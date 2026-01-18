# ZADIA OS - Copilot Instructions

## Architecture Overview

ZADIA OS is a **multi-tenant enterprise platform** with **agentic AI** using Next.js 15.5.3, Firebase, and TypeScript. Core architectural decision: **Event-Driven Architecture** via `EventBus` enables cross-module communication without tight coupling.

### Stack
- **Frontend**: Next.js 15.5.3 (App Router), React 19, TypeScript 5, Tailwind CSS 4, shadcn/ui (New York style)
- **Backend**: Firebase (Firestore, Auth, Storage), Node.js runtime
- **Validation**: Zod (Zod enums required, NO TypeScript enums)
- **Forms**: react-hook-form + @hookform/resolvers/zod
- **Icons**: lucide-react

### Core Layers
- **`src/app/`** - Next.js App Router (route groups: `(auth)`, `(main)`)
- **`src/modules/`** - Feature modules (sales, hr, inventory, clients, projects, etc.) - self-contained with components/hooks/services/types/validations
- **`src/components/ui/`** - shadcn/ui components (reusable primitives)
- **`src/contexts/`** - React Contexts: `AuthContext`, `TenantContext`, `ZadiaAgenticContext`
- **`src/lib/`** - Core utilities: `firebase.ts`, `logger.ts`, `toast.ts`, `i18n.ts`
- **`src/lib/events/`** - Event-driven system: `event-bus.ts`, `agent-orchestrator.ts`, `dto-propagation.service.ts`

### Event-Driven Architecture (CRITICAL)
ZADIA OS uses a **centralized EventBus** for cross-module communication. Any module can emit/subscribe to typed events:

```typescript
// In src/lib/events/event-bus.ts - 80+ event types defined
import { EventBus } from '@/lib/events';

// Emit event from any module
await EventBus.emit('lead:created', leadData, { source: 'LeadsService' });

// Subscribe in any module
const unsubscribe = EventBus.subscribe('lead:created', async (event) => {
  // Auto-create opportunities, log analytics, etc.
});
```

**Pattern**: Services emit events on CRUD operations → Agents/other modules react autonomously. See `src/lib/events/event-bus.ts` for all event types (sales, finance, inventory, projects, clients, orders, hr, calendar, ai, system).

### Multi-Tenancy Pattern
All business data is scoped by `tenantId`. Services **must** include `tenantId` parameter:
```typescript
static async getItems(tenantId?: string): Promise<Item[]> {
  let q = query(collection(db, 'items'));
  if (tenantId) q = query(q, where('tenantId', '==', tenantId));
  // ...
}
```

## Module Structure (CRITICAL)

Every module in `src/modules/` follows this **exact structure**:
```
module-name/
├── components/          # React components (PascalCase.tsx)
├── hooks/               # use-*.ts hooks (state management)
├── services/            # Static class services for Firebase
│   ├── entity-crud.service.ts
│   └── entity-actions.service.ts
├── types/               # Zod enums + TypeScript interfaces
│   └── module.types.ts
├── validations/         # Zod schemas
│   └── module.schema.ts
├── docs/                # README.md, API.md
└── index.ts             # Public API exports
```

**Hard Rule**: Max 200 lines per file. Split large services into `*-crud.service.ts`, `*-actions.service.ts`. Example: `src/modules/sales/services/leads-crud.service.ts` + `leads-actions.service.ts`.

## TypeScript & Validation Patterns

### Zod Enums (Required - NO TypeScript enums)
```typescript
// ✅ CORRECT - Use Zod enums
export const StatusEnum = z.enum(['active', 'inactive', 'pending']);
export type Status = z.infer<typeof StatusEnum>;

// ❌ WRONG - Don't use TypeScript enums
enum Status { Active, Inactive } // NEVER DO THIS
```

### Service Pattern (Static Classes)
All services use **static classes** with private `COLLECTION` constant:
```typescript
export class EntityService {
  private static readonly COLLECTION = 'entities';

  static async create(data: EntityFormData, createdBy: string, tenantId?: string): Promise<Entity> {
    const entityData = {
      ...data,
      createdAt: Timestamp.fromDate(new Date()),
      updatedAt: Timestamp.fromDate(new Date()),
      createdBy,
      tenantId: tenantId || '',
    };
    const docRef = await addDoc(collection(db, this.COLLECTION), entityData);
    logger.info(`Entity created: ${docRef.id}`, { component: 'EntityService', action: 'create' });
    
    // Emit event for other modules to react
    await EventBus.emit('entity:created', entityData);
    
    return { id: docRef.id, ...entityData } as Entity;
  }
}
```

### Imports Use Path Aliases
```typescript
import { db } from '@/lib/firebase';
import { logger } from '@/lib/logger';
import { showToast } from '@/lib/toast';
import { EventBus } from '@/lib/events';
import type { Entity } from '../types/module.types';
```

## Firebase Patterns

- **No complex indexes**: Use simple `where()` + client-side sorting (avoid Firestore index creation)
- **Timestamps**: Always use `Timestamp.fromDate(new Date())`
- **Transactions**: Use `runTransaction()` for multi-document updates
- **Queries**: Always include `tenantId` filter for data isolation
- **Error handling**: Wrap in try-catch, log with `logger.error()`, throw user-friendly message

## UI Components & Patterns

- **Components**: Use shadcn/ui from `@/components/ui/` (Button, Dialog, Table, etc.)
- **Styling**: Tailwind CSS + `cn()` utility from `@/lib/utils`
- **Loading**: Use `<Skeleton />` component for loading states
- **Notifications**: Use `showToast.success/error/loading()` from `@/lib/toast` (wraps sonner)
- **Forms**: react-hook-form + Zod resolver pattern
- **Icons**: lucide-react

### Logger Pattern
Use structured logging with context:
```typescript
import { logger } from '@/lib/logger';

logger.info('Lead created', { component: 'LeadsService', action: 'create', leadId });
logger.error('Error creating lead', error, { component: 'LeadsService', action: 'create' });
```

## Key Commands

```bash
npm run dev              # Development server (localhost:3000)
npm run build            # Silent production build (uses scripts/silent-build.mjs)
npm run build:verbose    # Verbose build output
npm run lint             # ESLint check (modern flat config)
npm run lint:fix         # Auto-fix ESLint issues
npm run type-check       # TypeScript validation
npm run validate:all     # Full validation (structure + exports + lint + types)
```

## Authentication & Security

### Flow
1. Firebase Auth → cookie sync via `onIdTokenChanged` in `AuthContext`
2. Middleware (`middleware.ts`) checks `auth-token` cookie for protected routes
3. Routes defined in `src/config/routes.config.ts` (`isProtectedRoute`, `isAuthRoute`)
4. `TenantContext` manages multi-tenant state after auth

### Middleware
- Checks cookie presence (full validation happens in API routes via Firebase Admin)
- Auto-redirects: unauthenticated → `/login`, authenticated → `/dashboard`
- Adds security headers (X-Frame-Options, CSP, etc.)

## Language & Localization

- **Primary**: Spanish (es) - default
- **Translations**: `src/locales/{es,en,pt}.json`
- **Usage**: `useTranslation()` hook from react-i18next
- **Convention**: User-facing strings should be in Spanish by default

## File Naming Conventions

```
PascalCase.tsx                    # Components
entity.service.ts                 # Services
entity-action.service.ts          # Action services (when splitting)
use-feature.ts                    # Hooks
module.types.ts                   # Types
module.schema.ts                  # Zod validations
kebab-case.ts                     # Utilities
```

## Development Workflow

1. **New feature**: Check if it fits existing module or needs new one in `src/modules/`
2. **Module changes**: Follow structure (components/hooks/services/types/validations/docs)
3. **Event emission**: Emit relevant event from service after CRUD operations
4. **Validation**: Run `npm run validate:all` before commit
5. **Documentation**: Update module's `docs/README.md` if public API changes

## References

- **Architecture docs**: `DEVELOPMENT_GUIDE.md`, `MAPA_MAESTRO_ARQUITECTURA_ZADIA_OS.md`
- **Module template**: `MODULE_TEMPLATE.md`
- **Component patterns**: `COMPONENT_TEMPLATES.md`
- **Example modules**: `src/modules/sales/`, `src/modules/projects/`
