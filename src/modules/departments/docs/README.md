# Departments Module Documentation

## Overview

The Departments module provides comprehensive management of geographical departments within countries. It includes CRUD operations, data validation, and a complete user interface for managing department records.

## Architecture

```
departments/
├── components/           # React components
│   ├── DepartmentsDirectory.tsx   # Main directory view
│   ├── DepartmentsForm.tsx        # Form for create/edit
│   ├── DepartmentsTable.tsx       # Data table
│   └── index.ts                   # Component exports
├── hooks/               # Custom React hooks
│   ├── use-departments.ts         # Department management hook
│   └── index.ts                   # Hook exports
├── services/            # Data layer services
│   ├── departments.service.ts     # API service
│   └── index.ts                   # Service exports
├── types/               # TypeScript definitions
│   ├── departments.types.ts       # Department interfaces
│   └── index.ts                   # Type exports
├── utils/               # Utility functions
│   ├── departments.utils.ts       # Helper functions
│   └── index.ts                   # Utility exports
├── validations/         # Schema validations
│   ├── departments.schema.ts      # Zod schemas
│   └── index.ts                   # Validation exports
├── docs/                # Documentation
│   ├── README.md               # This file
│   └── API.md                  # API documentation
└── index.ts             # Module barrel exports
```

## Features

### Core Features
- ✅ **CRUD Operations**: Create, read, update, and delete departments
- ✅ **Country Relationships**: Link departments to specific countries
- ✅ **Search & Filter**: Filter by country and search by name/code
- ✅ **Data Validation**: Comprehensive form validation using Zod
- ✅ **Real-time Updates**: Live data synchronization
- ✅ **Status Management**: Active/inactive department states

### User Interface
- ✅ **Directory View**: Complete management interface
- ✅ **Data Table**: Sortable and filterable department list
- ✅ **Forms**: Create and edit department forms
- ✅ **Responsive Design**: Mobile-friendly interface
- ✅ **Loading States**: User feedback during operations

## Quick Start

### Basic Usage

```typescript
import { DepartmentsDirectory } from '@/modules/departments';

// Use the complete directory component
function MyPage() {
  return <DepartmentsDirectory />;
}
```

### Using the Hook

```typescript
import { useDepartments } from '@/modules/departments/hooks';

function MyComponent() {
  const {
    departments,
    loading,
    error,
    createDepartment,
    updateDepartment,
    deleteDepartment,
    getDepartments
  } = useDepartments();

  // Create a new department
  const handleCreate = async () => {
    await createDepartment({
      name: 'Nuevo Departamento',
      countryId: 'country-id',
      code: 'ND'
    });
  };

  return (
    <div>
      {departments.map(department => (
        <div key={department.id}>{department.name}</div>
      ))}
    </div>
  );
}
```

### Filtering by Country

```typescript
import { useDepartments } from '@/modules/departments/hooks';

function CountryDepartments({ countryId }: { countryId: string }) {
  const { departments, loading } = useDepartments(countryId);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {departments.map(department => (
        <div key={department.id}>{department.name}</div>
      ))}
    </div>
  );
}
```

## Components

### DepartmentsDirectory

Main component that provides a complete department management interface.

**Props:**
- None (self-contained)

**Features:**
- Country filtering
- Search functionality
- Create/edit/delete operations
- Responsive data table

### DepartmentsForm

Form component for creating and editing departments.

**Props:**
```typescript
interface DepartmentsFormProps {
  initialData?: Department;     // For editing
  onSubmit: (data: DepartmentFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}
```

### DepartmentsTable

Table component for displaying department data.

**Props:**
```typescript
interface DepartmentsTableProps {
  departments: Department[];
  loading?: boolean;
  onEdit: (department: Department) => void;
  onDelete: (departmentId: string) => void;
  getCountryName: (countryId: string) => string;
}
```

## Data Types

### Department

```typescript
interface Department {
  id: string;
  name: string;
  countryId: string;
  code?: string;
  isActive: boolean;
}
```

### DepartmentFormData

```typescript
interface DepartmentFormData {
  name: string;
  countryId: string;
  code?: string;
}
```

## Validation

The module uses Zod for runtime validation:

```typescript
// Form validation
const departmentFormSchema = z.object({
  name: z.string().min(1).max(100),
  countryId: z.string().min(1),
  code: z.string().max(10).optional()
});
```

## Error Handling

The module provides comprehensive error handling:

- **Form Validation**: Real-time validation with user-friendly messages
- **API Errors**: Graceful handling of network and server errors
- **Loading States**: Visual feedback during operations
- **Error Recovery**: Retry mechanisms for failed operations

## Best Practices

### 1. Always Handle Loading States

```typescript
const { departments, loading, error } = useDepartments();

if (loading) return <LoadingSpinner />;
if (error) return <ErrorMessage error={error} />;
```

### 2. Use Form Validation

```typescript
// The form automatically validates using Zod schemas
<DepartmentsForm
  onSubmit={handleSubmit}
  onCancel={handleCancel}
/>
```

### 3. Implement Error Boundaries

```typescript
<ErrorBoundary>
  <DepartmentsDirectory />
</ErrorBoundary>
```

## Integration

### With Countries Module

The Departments module integrates seamlessly with the Countries module:

```typescript
import { useCountries } from '@/modules/countries/hooks';
import { useDepartments } from '@/modules/departments/hooks';

function CountryWithDepartments() {
  const { countries } = useCountries();
  const { departments } = useDepartments();

  return (
    <div>
      {countries.map(country => (
        <div key={country.id}>
          <h3>{country.name}</h3>
          {departments
            .filter(d => d.countryId === country.id)
            .map(department => (
              <div key={department.id}>{department.name}</div>
            ))}
        </div>
      ))}
    </div>
  );
}
```

## Performance

### Optimization Strategies

1. **Memoization**: Components use React.memo where appropriate
2. **Lazy Loading**: Components can be lazy-loaded
3. **Efficient Queries**: Service layer optimizes database queries
4. **Caching**: Hook implements intelligent caching

### Memory Management

- Automatic cleanup of event listeners
- Proper dependency arrays in useEffect
- Optimized re-render cycles

## Testing

### Unit Tests

```typescript
import { renderHook } from '@testing-library/react';
import { useDepartments } from '../hooks/use-departments';

test('should fetch departments', async () => {
  const { result } = renderHook(() => useDepartments());
  // Test implementation
});
```

### Integration Tests

```typescript
import { render, screen } from '@testing-library/react';
import { DepartmentsDirectory } from '../components';

test('should render departments directory', () => {
  render(<DepartmentsDirectory />);
  expect(screen.getByText('Departamentos')).toBeInTheDocument();
});
```

## Migration Guide

### From Previous Versions

If migrating from an older version:

1. Update import paths to use barrel exports
2. Check for breaking changes in component props
3. Update TypeScript interfaces if needed

## Contributing

### Development Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Start development server: `npm run dev`
4. Run tests: `npm test`

### Code Standards

- Use TypeScript for all new code
- Follow ESLint configuration
- Write unit tests for new features
- Update documentation for changes

## Support

For issues and questions:

1. Check the API documentation
2. Review existing issues
3. Create a new issue with details
4. Contact the development team

---

**Last Updated:** Phase 5 - Departments Module Standardization
**Version:** 1.0.0
**Maintainers:** ZADIA OS Development Team