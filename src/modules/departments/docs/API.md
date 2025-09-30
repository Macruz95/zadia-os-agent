# Departments Module API Reference

## Table of Contents

- [Service Layer](#service-layer)
- [Hooks](#hooks)
- [Components](#components)
- [Types](#types)
- [Validations](#validations)
- [Utils](#utils)

## Service Layer

### DepartmentsService

Core service class for department data operations.

#### Methods

##### `getDepartments(): Promise<Department[]>`

Retrieve all departments from the database.

```typescript
import { DepartmentsService } from '@/modules/departments/services';

const departments = await DepartmentsService.getDepartments();
console.log(departments); // Department[]
```

**Returns:**
- `Promise<Department[]>` - Array of all departments

**Throws:**
- `Error` - When database connection fails

---

##### `getDepartmentsByCountry(countryId: string): Promise<Department[]>`

Retrieve departments filtered by country.

```typescript
const departments = await DepartmentsService.getDepartmentsByCountry('country-123');
```

**Parameters:**
- `countryId: string` - The ID of the country to filter by

**Returns:**
- `Promise<Department[]>` - Array of departments for the specified country

---

##### `getDepartmentById(id: string): Promise<Department | null>`

Retrieve a single department by ID.

```typescript
const department = await DepartmentsService.getDepartmentById('dept-123');
if (department) {
  console.log(department.name);
}
```

**Parameters:**
- `id: string` - The department ID

**Returns:**
- `Promise<Department | null>` - Department object or null if not found

---

##### `createDepartment(data: Omit<Department, 'id'>): Promise<string>`

Create a new department.

```typescript
const newDepartmentId = await DepartmentsService.createDepartment({
  name: 'Antioquia',
  countryId: 'colombia-123',
  code: 'ANT',
  isActive: true
});
```

**Parameters:**
- `data: Omit<Department, 'id'>` - Department data without ID

**Returns:**
- `Promise<string>` - The ID of the created department

**Throws:**
- `Error` - When validation fails or creation fails

---

##### `updateDepartment(id: string, updates: Partial<Omit<Department, 'id'>>): Promise<void>`

Update an existing department.

```typescript
await DepartmentsService.updateDepartment('dept-123', {
  name: 'Updated Name',
  code: 'UPD'
});
```

**Parameters:**
- `id: string` - The department ID
- `updates: Partial<Omit<Department, 'id'>>` - Partial update data

**Returns:**
- `Promise<void>`

**Throws:**
- `Error` - When department not found or update fails

---

##### `deleteDepartment(id: string): Promise<void>`

Soft delete a department (sets isActive to false).

```typescript
await DepartmentsService.deleteDepartment('dept-123');
```

**Parameters:**
- `id: string` - The department ID

**Returns:**
- `Promise<void>`

**Throws:**
- `Error` - When department not found or deletion fails

---

## Hooks

### useDepartments

Main hook for department management.

#### Signature

```typescript
function useDepartments(countryId?: string): {
  departments: Department[];
  loading: boolean;
  error: string | null;
  getDepartments: (countryId?: string) => Promise<void>;
  refetch: (countryId?: string) => Promise<void>;
  getDepartmentById: (id: string) => Department | undefined;
  createDepartment: (data: Omit<Department, 'id'>) => Promise<Department>;
  updateDepartment: (id: string, updates: Partial<Omit<Department, 'id'>>) => Promise<void>;
  deleteDepartment: (id: string) => Promise<void>;
}
```

#### Usage Examples

##### Basic Usage

```typescript
import { useDepartments } from '@/modules/departments/hooks';

function MyComponent() {
  const { departments, loading, error } = useDepartments();

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <ul>
      {departments.map(dept => (
        <li key={dept.id}>{dept.name}</li>
      ))}
    </ul>
  );
}
```

##### Filter by Country

```typescript
function CountryDepartments({ countryId }: { countryId: string }) {
  const { departments, loading } = useDepartments(countryId);
  
  return (
    <div>
      {departments.map(dept => (
        <div key={dept.id}>{dept.name}</div>
      ))}
    </div>
  );
}
```

##### CRUD Operations

```typescript
function DepartmentManager() {
  const {
    departments,
    createDepartment,
    updateDepartment,
    deleteDepartment
  } = useDepartments();

  const handleCreate = async () => {
    try {
      await createDepartment({
        name: 'New Department',
        countryId: 'country-123',
        code: 'ND',
        isActive: true
      });
    } catch (error) {
      console.error('Failed to create department:', error);
    }
  };

  const handleUpdate = async (id: string) => {
    try {
      await updateDepartment(id, {
        name: 'Updated Name'
      });
    } catch (error) {
      console.error('Failed to update department:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDepartment(id);
    } catch (error) {
      console.error('Failed to delete department:', error);
    }
  };

  return (
    <div>
      <button onClick={handleCreate}>Create Department</button>
      {departments.map(dept => (
        <div key={dept.id}>
          {dept.name}
          <button onClick={() => handleUpdate(dept.id)}>Update</button>
          <button onClick={() => handleDelete(dept.id)}>Delete</button>
        </div>
      ))}
    </div>
  );
}
```

#### Return Values

- `departments: Department[]` - Array of department objects
- `loading: boolean` - Loading state indicator
- `error: string | null` - Error message if any operation fails
- `getDepartments: Function` - Fetch departments (optionally by country)
- `refetch: Function` - Alias for getDepartments
- `getDepartmentById: Function` - Get department from current state by ID
- `createDepartment: Function` - Create new department
- `updateDepartment: Function` - Update existing department
- `deleteDepartment: Function` - Soft delete department

---

## Components

### DepartmentsDirectory

Complete department management interface.

```typescript
import { DepartmentsDirectory } from '@/modules/departments';

function App() {
  return <DepartmentsDirectory />;
}
```

**Props:** None (self-contained)

**Features:**
- Country filtering
- Search functionality
- Create/edit/delete operations
- Responsive data table
- Loading and error states

---

### DepartmentsForm

Form for creating and editing departments.

```typescript
import { DepartmentsForm } from '@/modules/departments/components';

interface DepartmentsFormProps {
  initialData?: Department;
  onSubmit: (data: DepartmentFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}
```

**Usage:**

```typescript
function CreateDepartment() {
  const handleSubmit = async (data: DepartmentFormData) => {
    // Handle form submission
    console.log('Form data:', data);
  };

  return (
    <DepartmentsForm
      onSubmit={handleSubmit}
      onCancel={() => console.log('Cancelled')}
      isLoading={false}
    />
  );
}

// For editing
function EditDepartment({ department }: { department: Department }) {
  const handleSubmit = async (data: DepartmentFormData) => {
    // Handle update
  };

  return (
    <DepartmentsForm
      initialData={department}
      onSubmit={handleSubmit}
      onCancel={() => console.log('Cancelled')}
    />
  );
}
```

---

### DepartmentsTable

Table for displaying department data.

```typescript
import { DepartmentsTable } from '@/modules/departments/components';

interface DepartmentsTableProps {
  departments: Department[];
  loading?: boolean;
  onEdit: (department: Department) => void;
  onDelete: (departmentId: string) => void;
  getCountryName: (countryId: string) => string;
}
```

**Usage:**

```typescript
function DepartmentsList() {
  const { departments, loading } = useDepartments();
  const { countries } = useCountries();

  const getCountryName = (countryId: string) => {
    const country = countries.find(c => c.id === countryId);
    return country?.name || 'Unknown';
  };

  const handleEdit = (department: Department) => {
    console.log('Edit department:', department);
  };

  const handleDelete = (departmentId: string) => {
    console.log('Delete department:', departmentId);
  };

  return (
    <DepartmentsTable
      departments={departments}
      loading={loading}
      onEdit={handleEdit}
      onDelete={handleDelete}
      getCountryName={getCountryName}
    />
  );
}
```

---

## Types

### Department

Main department interface.

```typescript
interface Department {
  id: string;           // Unique identifier
  name: string;         // Department name
  countryId: string;    // Associated country ID
  code?: string;        // Optional department code
  isActive: boolean;    // Active status
}
```

### DepartmentFormData

Form data interface for validation.

```typescript
interface DepartmentFormData {
  name: string;         // Required department name
  countryId: string;    // Required country ID
  code?: string;        // Optional department code
}
```

### DepartmentSearchData

Search parameters interface.

```typescript
interface DepartmentSearchData {
  query?: string;       // Search query
  countryId?: string;   // Country filter
  isActive?: boolean;   // Status filter
}
```

---

## Validations

### departmentFormSchema

Zod schema for form validation.

```typescript
import { z } from 'zod';

const departmentFormSchema = z.object({
  name: z
    .string()
    .min(1, 'El nombre del departamento es requerido')
    .max(100, 'El nombre no puede exceder 100 caracteres'),
  countryId: z
    .string()
    .min(1, 'Debe seleccionar un país'),
  code: z
    .string()
    .max(10, 'El código no puede exceder 10 caracteres')
    .optional()
});
```

**Usage:**

```typescript
import { departmentFormSchema } from '@/modules/departments/validations';

// Validate data
const result = departmentFormSchema.safeParse({
  name: 'Antioquia',
  countryId: 'colombia-123',
  code: 'ANT'
});

if (result.success) {
  console.log('Valid data:', result.data);
} else {
  console.log('Validation errors:', result.error.errors);
}
```

### departmentSearchSchema

Zod schema for search validation.

```typescript
const departmentSearchSchema = z.object({
  query: z.string().optional(),
  countryId: z.string().optional(),
  isActive: z.boolean().optional()
});
```

---

## Utils

### Department Utilities

Helper functions for department operations.

```typescript
import { DepartmentUtils } from '@/modules/departments/utils';

// Format department display name
const displayName = DepartmentUtils.formatDisplayName(department);

// Validate department code format
const isValidCode = DepartmentUtils.isValidCode('ANT');

// Get department by code
const department = DepartmentUtils.findByCode(departments, 'ANT');

// Filter active departments
const activeDepartments = DepartmentUtils.filterActive(departments);

// Sort departments by name
const sortedDepartments = DepartmentUtils.sortByName(departments);
```

---

## Error Handling

### Error Types

```typescript
// Service errors
try {
  await DepartmentsService.createDepartment(data);
} catch (error) {
  if (error instanceof ValidationError) {
    // Handle validation error
  } else if (error instanceof NetworkError) {
    // Handle network error
  } else {
    // Handle general error
  }
}

// Hook errors
const { error } = useDepartments();
if (error) {
  console.error('Hook error:', error);
}
```

### Error Messages

- `"El nombre del departamento es requerido"` - Name field is required
- `"Debe seleccionar un país"` - Country selection is required
- `"El código no puede exceder 10 caracteres"` - Code too long
- `"Error al crear departamento"` - Generic creation error
- `"Error al actualizar departamento"` - Generic update error
- `"Error al eliminar departamento"` - Generic deletion error

---

## Performance Considerations

### Optimization Tips

1. **Use country filtering**: When possible, filter departments by country to reduce data load

```typescript
// Better performance
const { departments } = useDepartments('specific-country-id');

// vs loading all departments
const { departments } = useDepartments();
```

2. **Implement pagination**: For large datasets, implement pagination

3. **Memoize expensive operations**: Use React.memo for components

4. **Debounce search inputs**: Avoid excessive API calls

```typescript
import { useDebouncedCallback } from 'use-debounce';

const debouncedSearch = useDebouncedCallback(
  (value) => {
    // Perform search
  },
  300
);
```

---

## Examples

### Complete Integration Example

```typescript
import React, { useState } from 'react';
import {
  DepartmentsDirectory,
  DepartmentsTable,
  DepartmentsForm,
  useDepartments
} from '@/modules/departments';
import { useCountries } from '@/modules/countries';

function CompleteDepartmentManagement() {
  const [view, setView] = useState<'directory' | 'custom'>('directory');
  const { departments, loading, createDepartment } = useDepartments();
  const { countries } = useCountries();

  if (view === 'directory') {
    // Use the complete directory component
    return <DepartmentsDirectory />;
  }

  // Custom implementation
  const getCountryName = (countryId: string) => {
    const country = countries.find(c => c.id === countryId);
    return country?.name || 'Unknown';
  };

  const handleCreateDepartment = async (data: any) => {
    try {
      await createDepartment(data);
      alert('Department created successfully!');
    } catch (error) {
      alert('Error creating department');
    }
  };

  return (
    <div>
      <button onClick={() => setView('directory')}>
        Switch to Directory View
      </button>
      
      <DepartmentsForm
        onSubmit={handleCreateDepartment}
        onCancel={() => console.log('Cancelled')}
        isLoading={loading}
      />
      
      <DepartmentsTable
        departments={departments}
        loading={loading}
        onEdit={(dept) => console.log('Edit:', dept)}
        onDelete={(id) => console.log('Delete:', id)}
        getCountryName={getCountryName}
      />
    </div>
  );
}
```

---

**Last Updated:** Phase 5 - Departments Module Standardization
**Version:** 1.0.0
**API Version:** v1