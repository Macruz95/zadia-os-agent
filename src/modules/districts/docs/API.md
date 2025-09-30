# Districts Module API Reference

## Table of Contents

- [Service Layer](#service-layer)
- [Hooks](#hooks)
- [Components](#components)
- [Types](#types)
- [Validations](#validations)
- [Utils](#utils)
- [Mock Data](#mock-data)

## Service Layer

### DistrictsService

Core service class for district data operations with Firebase Firestore integration and mock data fallback.

#### Methods

##### `getDistrictsByMunicipality(municipalityId: string): Promise<District[]>`

Retrieve districts filtered by municipality.

```typescript
import { DistrictsService } from '@/modules/districts/services';

const districts = await DistrictsService.getDistrictsByMunicipality('municipality-123');
console.log(districts); // District[]
```

**Parameters:**
- `municipalityId: string` - The ID of the municipality to filter by

**Returns:**
- `Promise<District[]>` - Array of districts for the specified municipality

**Behavior:**
- Queries Firestore for active districts in the municipality
- Falls back to filtered mock data if Firestore is unavailable
- Results are sorted by name

**Throws:**
- Falls back gracefully to mock data on errors

---

##### `getDistrictById(id: string): Promise<District | null>`

Retrieve a single district by ID.

```typescript
const district = await DistrictsService.getDistrictById('district-123');
if (district) {
  console.log(district.name);
}
```

**Parameters:**
- `id: string` - The district ID

**Returns:**
- `Promise<District | null>` - District object or null if not found

**Behavior:**
- First checks Firestore
- Falls back to mock data if not found in Firestore
- Returns null if not found anywhere

---

##### `createDistrict(data: Omit<District, 'id'>): Promise<string>`

Create a new district.

```typescript
const newDistrictId = await DistrictsService.createDistrict({
  name: 'Miraflores',
  municipalityId: 'municipality-123',
  code: 'MIR',
  isActive: true
});
```

**Parameters:**
- `data: Omit<District, 'id'>` - District data without ID

**Returns:**
- `Promise<string>` - The ID of the created district

**Throws:**
- `Error` - When validation fails or creation fails

**Validation:**
- Data is validated against district schema before creation
- Timestamps are automatically added

---

##### `updateDistrict(id: string, updates: Partial<Omit<District, 'id'>>): Promise<void>`

Update an existing district.

```typescript
await DistrictsService.updateDistrict('district-123', {
  name: 'Updated Name',
  code: 'UPD'
});
```

**Parameters:**
- `id: string` - The district ID
- `updates: Partial<Omit<District, 'id'>>` - Partial update data

**Returns:**
- `Promise<void>`

**Throws:**
- `Error` - When district not found or update fails

**Behavior:**
- Updates timestamp automatically
- Only updates provided fields

---

##### `deleteDistrict(id: string): Promise<void>`

Soft delete a district (sets isActive to false).

```typescript
await DistrictsService.deleteDistrict('district-123');
```

**Parameters:**
- `id: string` - The district ID

**Returns:**
- `Promise<void>`

**Throws:**
- `Error` - When district not found or deletion fails

**Behavior:**
- Performs soft delete by setting isActive to false
- Updates timestamp

---

## Hooks

### useDistricts

Main hook for district management with municipality context.

#### Signature

```typescript
function useDistricts(municipalityId?: string): {
  districts: District[];
  loading: boolean;
  error: string | null;
  getDistricts: (municipalityId?: string) => Promise<void>;
  refetch: (municipalityId?: string) => Promise<void>;
  getDistrictById: (id: string) => District | undefined;
  createDistrict: (data: Omit<District, 'id'>) => Promise<District>;
  updateDistrict: (id: string, updates: Partial<Omit<District, 'id'>>) => Promise<void>;
  deleteDistrict: (id: string) => Promise<void>;
}
```

#### Usage Examples

##### Basic Usage with Municipality Context

```typescript
import { useDistricts } from '@/modules/districts/hooks';

function DistrictsList({ municipalityId }: { municipalityId: string }) {
  const { districts, loading, error } = useDistricts(municipalityId);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <ul>
      {districts.map(district => (
        <li key={district.id}>{district.name}</li>
      ))}
    </ul>
  );
}
```

##### CRUD Operations

```typescript
function DistrictManager({ municipalityId }: { municipalityId: string }) {
  const {
    districts,
    createDistrict,
    updateDistrict,
    deleteDistrict
  } = useDistricts(municipalityId);

  const handleCreate = async () => {
    try {
      await createDistrict({
        name: 'New District',
        municipalityId: municipalityId,
        code: 'ND',
        isActive: true
      });
    } catch (error) {
      console.error('Failed to create district:', error);
    }
  };

  const handleUpdate = async (id: string) => {
    try {
      await updateDistrict(id, {
        name: 'Updated Name'
      });
    } catch (error) {
      console.error('Failed to update district:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDistrict(id);
    } catch (error) {
      console.error('Failed to delete district:', error);
    }
  };

  return (
    <div>
      <button onClick={handleCreate}>Create District</button>
      {districts.map(district => (
        <div key={district.id}>
          {district.name}
          <button onClick={() => handleUpdate(district.id)}>Update</button>
          <button onClick={() => handleDelete(district.id)}>Delete</button>
        </div>
      ))}
    </div>
  );
}
```

##### Dynamic Municipality Loading

```typescript
function DynamicDistrictsList() {
  const [municipalityId, setMunicipalityId] = useState('');
  const { districts, loading, getDistricts } = useDistricts();

  const handleMunicipalityChange = async (newMunicipalityId: string) => {
    setMunicipalityId(newMunicipalityId);
    await getDistricts(newMunicipalityId);
  };

  return (
    <div>
      <select onChange={(e) => handleMunicipalityChange(e.target.value)}>
        <option value="">Select Municipality</option>
        {/* municipality options */}
      </select>
      
      {loading ? (
        <div>Loading districts...</div>
      ) : (
        <ul>
          {districts.map(district => (
            <li key={district.id}>{district.name}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

#### Return Values

- `districts: District[]` - Array of district objects for the current municipality
- `loading: boolean` - Loading state indicator
- `error: string | null` - Error message if any operation fails
- `getDistricts: Function` - Fetch districts for a specific municipality
- `refetch: Function` - Alias for getDistricts
- `getDistrictById: Function` - Get district from current state by ID
- `createDistrict: Function` - Create new district
- `updateDistrict: Function` - Update existing district
- `deleteDistrict: Function` - Soft delete district

---

## Components

### DistrictsDirectory

Complete district management interface for a specific municipality.

```typescript
import { DistrictsDirectory } from '@/modules/districts';

function MunicipalityPage({ municipalityId, municipalityName }) {
  return (
    <DistrictsDirectory 
      municipalityId={municipalityId}
      municipalityName={municipalityName}
    />
  );
}
```

**Props:**
```typescript
interface DistrictsDirectoryProps {
  municipalityId?: string;     // Municipality to filter by
  municipalityName?: string;   // Municipality name for display
}
```

**Features:**
- Municipality-specific district management
- Search functionality
- Create/edit/delete operations
- Responsive data table
- Loading and error states

---

### DistrictsForm

Form for creating and editing districts.

```typescript
import { DistrictsForm } from '@/modules/districts/components';

function CreateDistrict({ municipalityId, municipalityName }) {
  const handleSubmit = async (data: DistrictFormData) => {
    console.log('Form data:', data);
  };

  return (
    <DistrictsForm
      municipalityId={municipalityId}
      municipalityName={municipalityName}
      onSubmit={handleSubmit}
      onCancel={() => console.log('Cancelled')}
      isLoading={false}
    />
  );
}

// For editing
function EditDistrict({ district, municipalityName }) {
  const handleSubmit = async (data: DistrictFormData) => {
    // Handle update
  };

  return (
    <DistrictsForm
      initialData={district}
      municipalityName={municipalityName}
      onSubmit={handleSubmit}
      onCancel={() => console.log('Cancelled')}
    />
  );
}
```

**Props:**
```typescript
interface DistrictsFormProps {
  initialData?: District;
  onSubmit: (data: DistrictFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  municipalityId?: string;
  municipalityName?: string;
}
```

---

### DistrictsTable

Table for displaying district data.

```typescript
import { DistrictsTable } from '@/modules/districts/components';

function DistrictsList({ municipalityId }) {
  const { districts, loading } = useDistricts(municipalityId);

  const handleEdit = (district: District) => {
    console.log('Edit district:', district);
  };

  const handleDelete = (districtId: string) => {
    console.log('Delete district:', districtId);
  };

  const getMunicipalityName = (municipalityId: string) => {
    return 'Municipality Name'; // Get from municipalities context
  };

  return (
    <DistrictsTable
      districts={districts}
      loading={loading}
      onEdit={handleEdit}
      onDelete={handleDelete}
      getMunicipalityName={getMunicipalityName}
    />
  );
}
```

**Props:**
```typescript
interface DistrictsTableProps {
  districts: District[];
  loading?: boolean;
  onEdit: (district: District) => void;
  onDelete: (districtId: string) => void;
  getMunicipalityName?: (municipalityId: string) => string;
}
```

---

### DistrictsSelect

Select component for district selection within a municipality.

```typescript
import { DistrictsSelect } from '@/modules/districts';

function AddressForm({ municipalityId }) {
  const [selectedDistrict, setSelectedDistrict] = useState('');

  return (
    <form>
      <DistrictsSelect
        municipalityId={municipalityId}
        value={selectedDistrict}
        onValueChange={setSelectedDistrict}
        placeholder="Selecciona un distrito"
      />
    </form>
  );
}
```

**Props:**
```typescript
interface DistrictsSelectProps {
  municipalityId: string;      // Required municipality context
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}
```

---

## Types

### District

Main district interface.

```typescript
interface District {
  id: string;              // Unique identifier
  name: string;            // District name
  municipalityId: string;  // Associated municipality ID
  code?: string;           // Optional district code
  isActive: boolean;       // Active status
}
```

### DistrictFormData

Form data interface for validation.

```typescript
interface DistrictFormData {
  name: string;            // Required district name
  municipalityId: string;  // Required municipality ID
  code?: string;           // Optional district code
}
```

### DistrictSearchData

Search parameters interface.

```typescript
interface DistrictSearchData {
  query?: string;          // Search query
  municipalityId?: string; // Municipality filter
  departmentId?: string;   // Department filter
  countryId?: string;      // Country filter
  isActive?: boolean;      // Status filter
}
```

---

## Validations

### districtFormSchema

Zod schema for form validation.

```typescript
import { z } from 'zod';

const districtFormSchema = z.object({
  name: z
    .string()
    .min(1, 'El nombre del distrito es requerido')
    .max(100, 'El nombre no puede exceder 100 caracteres'),
  municipalityId: z
    .string()
    .min(1, 'Debe seleccionar un municipio'),
  code: z
    .string()
    .max(10, 'El código no puede exceder 10 caracteres')
    .optional()
});
```

**Usage:**

```typescript
import { districtFormSchema } from '@/modules/districts/validations';

// Validate data
const result = districtFormSchema.safeParse({
  name: 'Miraflores',
  municipalityId: 'municipality-123',
  code: 'MIR'
});

if (result.success) {
  console.log('Valid data:', result.data);
} else {
  console.log('Validation errors:', result.error.errors);
}
```

### districtSearchSchema

Zod schema for search validation.

```typescript
const districtSearchSchema = z.object({
  query: z.string().optional(),
  municipalityId: z.string().optional(),
  departmentId: z.string().optional(),
  countryId: z.string().optional(),
  isActive: z.boolean().optional()
});
```

---

## Utils

### District Utilities

Helper functions for district operations.

```typescript
import { DistrictUtils } from '@/modules/districts/utils';

// Format district display name
const displayName = DistrictUtils.formatDisplayName(district);
// Result: "Miraflores (MIR)" or "Miraflores"

// Validate district code format
const isValidCode = DistrictUtils.isValidCode('MIR');
// Result: true

// Find district by code
const district = DistrictUtils.findByCode(districts, 'MIR');

// Filter active districts
const activeDistricts = DistrictUtils.filterActive(districts);

// Filter by municipality
const municipalityDistricts = DistrictUtils.filterByMunicipality(districts, 'municipality-123');

// Sort districts by name
const sortedDistricts = DistrictUtils.sortByName(districts);

// Group by municipality
const groupedDistricts = DistrictUtils.groupByMunicipality(districts);
// Result: { 'municipality-1': [district1, district2], 'municipality-2': [district3] }

// Search districts
const searchResults = DistrictUtils.search(districts, 'mira');

// Get statistics
const stats = DistrictUtils.getStatistics(districts);
// Result: { total: 10, active: 8, inactive: 2, withCode: 5, withoutCode: 5 }

// Validate district data
const errors = DistrictUtils.validateDistrict({
  name: '',
  municipalityId: 'municipality-123'
});
// Result: ['El nombre del distrito es requerido']

// Generate code from name
const code = DistrictUtils.generateCodeFromName('Miraflores');
// Result: 'MIRAF'

// Check uniqueness
const isNameUnique = DistrictUtils.isNameUnique(districts, 'New District');
const isCodeUnique = DistrictUtils.isCodeUnique(districts, 'NEW');
```

---

## Mock Data

### MOCK_DISTRICTS

Predefined mock data for development and testing.

```typescript
import { MOCK_DISTRICTS } from '@/modules/districts/mock-districts';

// Mock data structure
const mockDistrict = {
  id: 'district-1',
  name: 'Miraflores',
  municipalityId: 'municipality-lima',
  code: 'MIR',
  isActive: true
};

// Usage
console.log(MOCK_DISTRICTS); // Array of District objects

// Filter mock data
const limaDistricts = MOCK_DISTRICTS.filter(d => d.municipalityId === 'municipality-lima');
```

**Behavior:**
- Automatically used when Firebase is unavailable
- Filtered by municipality ID
- Includes realistic Peruvian district data
- Provides seamless development experience

---

## Error Handling

### Error Types

```typescript
// Service errors
try {
  await DistrictsService.createDistrict(data);
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
const { error } = useDistricts(municipalityId);
if (error) {
  console.error('Hook error:', error);
}
```

### Error Messages

- `"El nombre del distrito es requerido"` - Name field is required
- `"Debe seleccionar un municipio"` - Municipality selection is required
- `"El código no puede exceder 10 caracteres"` - Code too long
- `"Error al crear distrito"` - Generic creation error
- `"Error al actualizar distrito"` - Generic update error
- `"Error al eliminar distrito"` - Generic deletion error

---

## Performance Considerations

### Optimization Tips

1. **Use municipality filtering**: Always provide municipality context

```typescript
// Better performance
const { districts } = useDistricts('specific-municipality-id');

// vs loading without context
const { districts } = useDistricts();
```

2. **Implement caching**: Cache districts by municipality

3. **Debounce search inputs**: Avoid excessive filtering

```typescript
import { useDebouncedCallback } from 'use-debounce';

const debouncedSearch = useDebouncedCallback(
  (value) => {
    // Perform search
  },
  300
);
```

4. **Use mock data efficiently**: Mock data provides instant responses

---

## Examples

### Complete Integration Example

```typescript
import React, { useState } from 'react';
import {
  DistrictsDirectory,
  DistrictsTable,
  DistrictsForm,
  DistrictsSelect,
  useDistricts
} from '@/modules/districts';

function CompleteDistrictManagement() {
  const [municipalityId, setMunicipalityId] = useState('municipality-lima');
  const [view, setView] = useState<'directory' | 'custom'>('directory');
  const { districts, loading, createDistrict } = useDistricts(municipalityId);

  if (view === 'directory') {
    // Use the complete directory component
    return (
      <DistrictsDirectory 
        municipalityId={municipalityId}
        municipalityName="Lima"
      />
    );
  }

  // Custom implementation
  const handleCreateDistrict = async (data: any) => {
    try {
      await createDistrict(data);
      alert('District created successfully!');
    } catch (error) {
      alert('Error creating district');
    }
  };

  return (
    <div>
      <button onClick={() => setView('directory')}>
        Switch to Directory View
      </button>
      
      <select 
        value={municipalityId}
        onChange={(e) => setMunicipalityId(e.target.value)}
      >
        <option value="municipality-lima">Lima</option>
        <option value="municipality-cusco">Cusco</option>
      </select>
      
      <DistrictsForm
        municipalityId={municipalityId}
        municipalityName="Lima"
        onSubmit={handleCreateDistrict}
        onCancel={() => console.log('Cancelled')}
        isLoading={loading}
      />
      
      <DistrictsTable
        districts={districts}
        loading={loading}
        onEdit={(district) => console.log('Edit:', district)}
        onDelete={(id) => console.log('Delete:', id)}
        getMunicipalityName={() => 'Lima'}
      />
      
      <DistrictsSelect
        municipalityId={municipalityId}
        value=""
        onValueChange={(value) => console.log('Selected:', value)}
        placeholder="Select a district"
      />
    </div>
  );
}
```

---

**Last Updated:** Phase 6 - Districts Module Standardization
**Version:** 1.0.0
**API Version:** v1