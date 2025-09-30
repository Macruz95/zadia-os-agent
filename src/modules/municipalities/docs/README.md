# Municipalities Module Documentation

## Overview

The Municipalities module provides comprehensive management of geographical municipalities within departments. It includes CRUD operations, data validation, coordinate management, and a complete user interface for managing municipality records within the departmental hierarchy.

## Architecture

```
municipalities/
├── components/           # React components
│   ├── MunicipalitiesDirectory.tsx   # Main directory view
│   ├── MunicipalitiesForm.tsx        # Form for create/edit
│   ├── MunicipalitiesTable.tsx       # Data table
│   ├── MunicipalitiesSelect.tsx      # Select component
│   └── index.ts                      # Component exports
├── hooks/               # Custom React hooks
│   ├── use-municipalities.ts         # Municipality management hook
│   └── index.ts                      # Hook exports
├── services/            # Data layer services
│   ├── municipalities.service.ts     # API service
│   └── index.ts                      # Service exports
├── types/               # TypeScript definitions
│   ├── municipalities.types.ts       # Municipality interfaces
│   └── index.ts                      # Type exports
├── utils/               # Utility functions
│   ├── municipalities.utils.ts       # Helper functions
│   └── index.ts                      # Utility exports
├── validations/         # Schema validations
│   ├── municipalities.schema.ts      # Zod schemas
│   └── index.ts                      # Validation exports
├── docs/                # Documentation
│   ├── README.md                  # This file
│   └── API.md                     # API documentation
├── mock-municipalities.ts # Mock data for development
└── index.ts             # Module barrel exports
```

## Features

### Core Features
- ✅ **CRUD Operations**: Create, read, update, and delete municipalities
- ✅ **Department Relationships**: Link municipalities to specific departments
- ✅ **Geographic Coordinates**: Support for latitude/longitude coordinates
- ✅ **Postal Code Management**: Optional postal code tracking
- ✅ **Search & Filter**: Filter by department and search by name/postal code
- ✅ **Data Validation**: Comprehensive form validation using Zod
- ✅ **Real-time Updates**: Live data synchronization
- ✅ **Status Management**: Active/inactive municipality states
- ✅ **Mock Data Fallback**: Seamless fallback to mock data when Firebase is unavailable

### Advanced Features
- ✅ **Distance Calculation**: Calculate distances between municipalities using coordinates
- ✅ **Nearest Finder**: Find nearest municipalities based on geographic coordinates
- ✅ **District Integration**: Direct navigation to district management for each municipality
- ✅ **Coordinate Validation**: Geographic coordinate range validation

### User Interface
- ✅ **Directory View**: Complete management interface with department context
- ✅ **Data Table**: Advanced table with coordinate display and district navigation
- ✅ **Forms**: Create and edit municipality forms with coordinate inputs
- ✅ **Select Component**: Dropdown for municipality selection
- ✅ **Responsive Design**: Mobile-friendly interface
- ✅ **Loading States**: User feedback during operations

## Quick Start

### Basic Usage

```typescript
import { MunicipalitiesDirectory } from '@/modules/municipalities';

// Use the complete directory component for a specific department
function MyPage() {
  return (
    <MunicipalitiesDirectory 
      departmentId="department-123"
      departmentName="Lima"
    />
  );
}
```

### Using the Hook

```typescript
import { useMunicipalities } from '@/modules/municipalities/hooks';

function MyComponent({ departmentId }: { departmentId: string }) {
  const {
    municipalities,
    loading,
    error,
    createMunicipality,
    updateMunicipality,
    deleteMunicipality
  } = useMunicipalities(departmentId);

  // Create a new municipality
  const handleCreate = async () => {
    await createMunicipality({
      name: 'Lima',
      departmentId: departmentId,
      postalCode: '15001',
      latitude: -12.0464,
      longitude: -77.0428,
      isActive: true
    });
  };

  return (
    <div>
      {municipalities.map(municipality => (
        <div key={municipality.id}>{municipality.name}</div>
      ))}
    </div>
  );
}
```

### Using the Select Component

```typescript
import { MunicipalitiesSelect } from '@/modules/municipalities';

function AddressForm({ departmentId }: { departmentId: string }) {
  const [selectedMunicipality, setSelectedMunicipality] = useState('');

  return (
    <MunicipalitiesSelect
      departmentId={departmentId}
      value={selectedMunicipality}
      onValueChange={setSelectedMunicipality}
      placeholder="Selecciona un municipio"
    />
  );
}
```

### Using Utility Functions

```typescript
import { MunicipalityUtils } from '@/modules/municipalities/utils';

// Calculate distance between municipalities
const distance = MunicipalityUtils.calculateDistance(municipality1, municipality2);

// Find nearest municipalities
const nearest = MunicipalityUtils.findNearestMunicipalities(targetMunicipality, allMunicipalities, 5);

// Get display name with postal code
const displayName = MunicipalityUtils.formatDisplayName(municipality);
```

## Components

### MunicipalitiesDirectory

Main component that provides a complete municipality management interface.

**Props:**
```typescript
interface MunicipalitiesDirectoryProps {
  departmentId?: string;     // Department to filter by
  departmentName?: string;   // Department name for display
}
```

**Features:**
- Department-based filtering
- Search functionality
- Create/edit/delete operations
- Direct district navigation
- Geographic coordinate display
- Responsive data table

### MunicipalitiesForm

Form component for creating and editing municipalities.

**Props:**
```typescript
interface MunicipalitiesFormProps {
  initialData?: Municipality;      // For editing
  onSubmit: (data: MunicipalityFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  departmentId?: string;           // Pre-fill department
  departmentName?: string;         // Display department name
}
```

**Features:**
- Geographic coordinate inputs
- Postal code validation
- Department selection
- Real-time form validation

### MunicipalitiesTable

Table component for displaying municipality data.

**Props:**
```typescript
interface MunicipalitiesTableProps {
  municipalities: Municipality[];
  loading?: boolean;
  onEdit: (municipality: Municipality) => void;
  onDelete: (municipalityId: string) => void;
  onViewDistricts?: (municipality: Municipality) => void;
  getDepartmentName?: (departmentId: string) => string;
}
```

**Features:**
- Coordinate display with formatting
- District navigation button
- Postal code badges
- Department name resolution

### MunicipalitiesSelect

Select component for municipality selection.

**Props:**
```typescript
interface MunicipalitiesSelectProps {
  departmentId: string;
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}
```

## Data Types

### Municipality

```typescript
interface Municipality {
  id: string;
  name: string;
  departmentId: string;
  postalCode?: string;
  latitude?: number;
  longitude?: number;
  isActive: boolean;
}
```

### MunicipalityFormData

```typescript
interface MunicipalityFormData {
  name: string;
  departmentId: string;
  postalCode?: string;
  latitude?: number;
  longitude?: number;
}
```

## Validation

The module uses Zod for runtime validation:

```typescript
// Form validation
const municipalityFormSchema = z.object({
  name: z.string().min(1).max(100),
  departmentId: z.string().min(1),
  postalCode: z.string().max(10).optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional()
});
```

## Geographic Features

### Coordinate Management

```typescript
// Store coordinates
const municipality = {
  name: 'Lima',
  departmentId: 'department-lima',
  latitude: -12.0464,
  longitude: -77.0428
};

// Calculate distance
const distance = MunicipalityUtils.calculateDistance(municipality1, municipality2);
console.log(`Distance: ${distance} km`);
```

### Finding Nearest Municipalities

```typescript
// Find 5 nearest municipalities
const nearest = MunicipalityUtils.findNearestMunicipalities(
  targetMunicipality,
  allMunicipalities,
  5
);

nearest.forEach(({ municipality, distance }) => {
  console.log(`${municipality.name}: ${distance.toFixed(2)} km`);
});
```

## Error Handling

The module provides comprehensive error handling:

- **Form Validation**: Real-time validation with user-friendly messages
- **API Errors**: Graceful handling of network and server errors
- **Mock Data Fallback**: Automatic fallback to mock data when Firebase is unavailable
- **Geographic Validation**: Coordinate range validation
- **Loading States**: Visual feedback during operations
- **Error Recovery**: Retry mechanisms for failed operations

## Integration

### With Departments Module

```typescript
import { useDepartments } from '@/modules/departments/hooks';
import { useMunicipalities } from '@/modules/municipalities/hooks';

function GeographicManagement() {
  const { departments } = useDepartments();
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const { municipalities } = useMunicipalities(selectedDepartment);

  return (
    <div>
      <select onChange={(e) => setSelectedDepartment(e.target.value)}>
        {departments.map(department => (
          <option key={department.id} value={department.id}>
            {department.name}
          </option>
        ))}
      </select>
      
      <MunicipalitiesDirectory 
        departmentId={selectedDepartment}
        departmentName={departments.find(d => d.id === selectedDepartment)?.name}
      />
    </div>
  );
}
```

### With Districts Module

```typescript
// Direct integration in MunicipalitiesDirectory
const handleViewDistricts = (municipality: Municipality) => {
  // Automatically navigate to districts view
  setViewingDistricts(municipality);
};

// Districts view is embedded within municipalities directory
if (viewingDistricts) {
  return (
    <DistrictsDirectory 
      municipalityId={viewingDistricts.id}
      municipalityName={viewingDistricts.name}
    />
  );
}
```

## Mock Data

The module includes comprehensive mock data for development:

```typescript
import { MOCK_MUNICIPALITIES } from '@/modules/municipalities/mock-municipalities';

// Mock data includes realistic Peruvian municipalities with coordinates
const mockMunicipality = {
  id: 'municipality-lima',
  name: 'Lima',
  departmentId: 'department-lima',
  postalCode: '15001',
  latitude: -12.0464,
  longitude: -77.0428,
  isActive: true
};
```

## Best Practices

### 1. Always Provide Department Context

```typescript
// Good: Provide department context
<MunicipalitiesDirectory 
  departmentId="department-123"
  departmentName="Lima"
/>

// Avoid: Using without department context
<MunicipalitiesDirectory />
```

### 2. Handle Coordinates Properly

```typescript
// Validate coordinates before storing
const isValidCoordinate = (lat?: number, lng?: number) => {
  return lat !== undefined && lng !== undefined &&
         lat >= -90 && lat <= 90 &&
         lng >= -180 && lng <= 180;
};
```

### 3. Use Geographic Features

```typescript
// Take advantage of distance calculations
const nearbyMunicipalities = MunicipalityUtils.findNearestMunicipalities(
  currentMunicipality,
  allMunicipalities,
  5
);
```

## Performance

### Optimization Strategies

1. **Department-based Loading**: Only load municipalities for specific departments
2. **Coordinate Calculations**: Cache distance calculations for frequently accessed pairs
3. **Memoization**: Components use React.memo where appropriate
4. **Lazy Loading**: Geographic features loaded on demand
5. **Efficient Queries**: Service layer optimizes Firestore queries with proper indexing

### Memory Management

- Geographic calculations are optimized for performance
- Coordinate data is stored efficiently
- Department-scoped data loading reduces memory usage
- Proper cleanup of event listeners and effects

## Testing

### Unit Tests

```typescript
import { renderHook } from '@testing-library/react';
import { useMunicipalities } from '../hooks/use-municipalities';
import { MunicipalityUtils } from '../utils/municipalities.utils';

test('should calculate distance correctly', () => {
  const distance = MunicipalityUtils.calculateDistance(
    { latitude: -12.0464, longitude: -77.0428 }, // Lima
    { latitude: -13.5319, longitude: -71.9675 }  // Cusco
  );
  expect(distance).toBeGreaterThan(0);
});

test('should fetch municipalities by department', async () => {
  const { result } = renderHook(() => useMunicipalities('department-123'));
  // Test implementation
});
```

### Integration Tests

```typescript
import { render, screen } from '@testing-library/react';
import { MunicipalitiesDirectory } from '../components';

test('should render municipalities directory', () => {
  render(
    <MunicipalitiesDirectory 
      departmentId="department-123"
      departmentName="Lima"
    />
  );
  expect(screen.getByText('Municipios')).toBeInTheDocument();
});
```

## Migration Guide

### From Previous Versions

If migrating from an older version:

1. Update import paths to use barrel exports
2. Check for breaking changes in component props
3. Update TypeScript interfaces if needed
4. Ensure department context is provided
5. Review coordinate validation if using geographic features

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
- Ensure department context is always considered
- Test geographic calculations with real coordinates

## Support

For issues and questions:

1. Check the API documentation
2. Review existing issues
3. Create a new issue with details
4. Contact the development team

---

**Last Updated:** Phase 7 - Municipalities Module Standardization
**Version:** 1.0.0
**Maintainers:** ZADIA OS Development Team