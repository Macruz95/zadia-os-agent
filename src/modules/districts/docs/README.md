# Districts Module Documentation

## Overview

The Districts module provides comprehensive management of geographical districts within municipalities. It includes CRUD operations, data validation, and a complete user interface for managing district records within the municipal hierarchy.

## Architecture

```
districts/
├── components/           # React components
│   ├── DistrictsDirectory.tsx     # Main directory view
│   ├── DistrictsForm.tsx          # Form for create/edit
│   ├── DistrictsTable.tsx         # Data table
│   ├── DistrictsSelect.tsx        # Select component
│   └── index.ts                   # Component exports
├── hooks/               # Custom React hooks
│   ├── useDistricts.ts            # District management hook
│   └── index.ts                   # Hook exports
├── services/            # Data layer services
│   ├── districts.service.ts       # API service
│   └── index.ts                   # Service exports
├── types/               # TypeScript definitions
│   ├── districts.types.ts         # District interfaces
│   └── index.ts                   # Type exports
├── utils/               # Utility functions
│   ├── districts.utils.ts         # Helper functions
│   └── index.ts                   # Utility exports
├── validations/         # Schema validations
│   ├── districts.schema.ts        # Zod schemas
│   └── index.ts                   # Validation exports
├── docs/                # Documentation
│   ├── README.md               # This file
│   └── API.md                  # API documentation
├── mock-districts.ts    # Mock data for development
└── index.ts             # Module barrel exports
```

## Features

### Core Features
- ✅ **CRUD Operations**: Create, read, update, and delete districts
- ✅ **Municipality Relationships**: Link districts to specific municipalities
- ✅ **Search & Filter**: Filter by municipality and search by name/code
- ✅ **Data Validation**: Comprehensive form validation using Zod
- ✅ **Real-time Updates**: Live data synchronization
- ✅ **Status Management**: Active/inactive district states
- ✅ **Mock Data Fallback**: Seamless fallback to mock data when Firebase is unavailable

### User Interface
- ✅ **Directory View**: Complete management interface
- ✅ **Data Table**: Sortable and filterable district list
- ✅ **Forms**: Create and edit district forms
- ✅ **Select Component**: Dropdown for district selection
- ✅ **Responsive Design**: Mobile-friendly interface
- ✅ **Loading States**: User feedback during operations

## Quick Start

### Basic Usage

```typescript
import { DistrictsDirectory } from '@/modules/districts';

// Use the complete directory component for a specific municipality
function MyPage() {
  return (
    <DistrictsDirectory 
      municipalityId="municipality-123"
      municipalityName="Lima"
    />
  );
}
```

### Using the Hook

```typescript
import { useDistricts } from '@/modules/districts/hooks';

function MyComponent({ municipalityId }: { municipalityId: string }) {
  const {
    districts,
    loading,
    error,
    createDistrict,
    updateDistrict,
    deleteDistrict
  } = useDistricts(municipalityId);

  // Create a new district
  const handleCreate = async () => {
    await createDistrict({
      name: 'Miraflores',
      municipalityId: municipalityId,
      code: 'MIR',
      isActive: true
    });
  };

  return (
    <div>
      {districts.map(district => (
        <div key={district.id}>{district.name}</div>
      ))}
    </div>
  );
}
```

### Using the Select Component

```typescript
import { DistrictsSelect } from '@/modules/districts';

function AddressForm({ municipalityId }: { municipalityId: string }) {
  const [selectedDistrict, setSelectedDistrict] = useState('');

  return (
    <DistrictsSelect
      municipalityId={municipalityId}
      value={selectedDistrict}
      onValueChange={setSelectedDistrict}
      placeholder="Selecciona un distrito"
    />
  );
}
```

## Components

### DistrictsDirectory

Main component that provides a complete district management interface.

**Props:**
```typescript
interface DistrictsDirectoryProps {
  municipalityId?: string;     // Municipality to filter by
  municipalityName?: string;   // Municipality name for display
}
```

**Features:**
- Municipality-based filtering
- Search functionality
- Create/edit/delete operations
- Responsive data table

### DistrictsForm

Form component for creating and editing districts.

**Props:**
```typescript
interface DistrictsFormProps {
  initialData?: District;      // For editing
  onSubmit: (data: DistrictFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  municipalityId?: string;     // Pre-fill municipality
  municipalityName?: string;   // Display municipality name
}
```

### DistrictsTable

Table component for displaying district data.

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

### DistrictsSelect

Select component for district selection.

**Props:**
```typescript
interface DistrictsSelectProps {
  municipalityId: string;
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}
```

## Data Types

### District

```typescript
interface District {
  id: string;
  name: string;
  municipalityId: string;
  code?: string;
  isActive: boolean;
}
```

### DistrictFormData

```typescript
interface DistrictFormData {
  name: string;
  municipalityId: string;
  code?: string;
}
```

## Validation

The module uses Zod for runtime validation:

```typescript
// Form validation
const districtFormSchema = z.object({
  name: z.string().min(1).max(100),
  municipalityId: z.string().min(1),
  code: z.string().max(10).optional()
});
```

## Error Handling

The module provides comprehensive error handling:

- **Form Validation**: Real-time validation with user-friendly messages
- **API Errors**: Graceful handling of network and server errors
- **Mock Data Fallback**: Automatic fallback to mock data when Firebase is unavailable
- **Loading States**: Visual feedback during operations
- **Error Recovery**: Retry mechanisms for failed operations

## Integration

### With Municipalities Module

The Districts module is designed to integrate with the Municipalities module:

```typescript
import { useMunicipalities } from '@/modules/municipalities/hooks';
import { useDistricts } from '@/modules/districts/hooks';

function AddressManagement() {
  const { municipalities } = useMunicipalities();
  const [selectedMunicipality, setSelectedMunicipality] = useState('');
  const { districts } = useDistricts(selectedMunicipality);

  return (
    <div>
      <select onChange={(e) => setSelectedMunicipality(e.target.value)}>
        {municipalities.map(municipality => (
          <option key={municipality.id} value={municipality.id}>
            {municipality.name}
          </option>
        ))}
      </select>
      
      <DistrictsDirectory 
        municipalityId={selectedMunicipality}
        municipalityName={municipalities.find(m => m.id === selectedMunicipality)?.name}
      />
    </div>
  );
}
```

## Mock Data

The module includes mock data for development and testing:

```typescript
import { MOCK_DISTRICTS } from '@/modules/districts/mock-districts';

// Mock data is automatically used when Firebase is unavailable
const districts = await DistrictsService.getDistrictsByMunicipality('municipality-id');
```

## Best Practices

### 1. Always Provide Municipality Context

```typescript
// Good: Provide municipality context
<DistrictsDirectory 
  municipalityId="municipality-123"
  municipalityName="Lima"
/>

// Avoid: Using without municipality context
<DistrictsDirectory />
```

### 2. Handle Loading States

```typescript
const { districts, loading, error } = useDistricts(municipalityId);

if (loading) return <LoadingSpinner />;
if (error) return <ErrorMessage error={error} />;
```

### 3. Use Form Validation

```typescript
// The form automatically validates using Zod schemas
<DistrictsForm
  municipalityId={municipalityId}
  onSubmit={handleSubmit}
  onCancel={handleCancel}
/>
```

## Performance

### Optimization Strategies

1. **Municipality-based Loading**: Only load districts for specific municipalities
2. **Memoization**: Components use React.memo where appropriate
3. **Lazy Loading**: Components can be lazy-loaded
4. **Efficient Queries**: Service layer optimizes Firestore queries
5. **Mock Data Caching**: Intelligent caching of mock data

### Memory Management

- Automatic cleanup of event listeners
- Proper dependency arrays in useEffect
- Optimized re-render cycles
- Municipality-scoped data loading

## Testing

### Unit Tests

```typescript
import { renderHook } from '@testing-library/react';
import { useDistricts } from '../hooks/useDistricts';

test('should fetch districts by municipality', async () => {
  const { result } = renderHook(() => useDistricts('municipality-123'));
  // Test implementation
});
```

### Integration Tests

```typescript
import { render, screen } from '@testing-library/react';
import { DistrictsDirectory } from '../components';

test('should render districts directory', () => {
  render(
    <DistrictsDirectory 
      municipalityId="municipality-123"
      municipalityName="Lima"
    />
  );
  expect(screen.getByText('Distritos')).toBeInTheDocument();
});
```

## Migration Guide

### From Previous Versions

If migrating from an older version:

1. Update import paths to use barrel exports
2. Check for breaking changes in component props
3. Update TypeScript interfaces if needed
4. Ensure municipality context is provided

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
- Ensure municipality context is always considered

## Support

For issues and questions:

1. Check the API documentation
2. Review existing issues
3. Create a new issue with details
4. Contact the development team

---

**Last Updated:** Phase 6 - Districts Module Standardization
**Version:** 1.0.0
**Maintainers:** ZADIA OS Development Team