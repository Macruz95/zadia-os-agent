# Municipalities Module API Reference

## Table of Contents

- [Service Layer](#service-layer)
- [Hooks](#hooks)
- [Components](#components)
- [Types](#types)
- [Validations](#validations)
- [Utils](#utils)
- [Mock Data](#mock-data)
- [Geographic Features](#geographic-features)

## Service Layer

### MunicipalitiesService

Core service class for municipality data operations with Firebase Firestore integration and mock data fallback.

#### Methods

##### `getMunicipalitiesByDepartment(departmentId: string): Promise<Municipality[]>`

Retrieve municipalities filtered by department.

```typescript
import { MunicipalitiesService } from '@/modules/municipalities/services';

const municipalities = await MunicipalitiesService.getMunicipalitiesByDepartment('department-123');
console.log(municipalities); // Municipality[]
```

**Parameters:**
- `departmentId: string` - The ID of the department to filter by

**Returns:**
- `Promise<Municipality[]>` - Array of municipalities for the specified department

**Behavior:**
- Queries Firestore for active municipalities in the department
- Falls back to filtered mock data if Firestore is unavailable
- Results are sorted by name
- Includes coordinate and postal code data

---

##### `getMunicipalityById(id: string): Promise<Municipality | null>`

Retrieve a single municipality by ID.

```typescript
const municipality = await MunicipalitiesService.getMunicipalityById('municipality-123');
if (municipality) {
  console.log(municipality.name);
  if (municipality.latitude && municipality.longitude) {
    console.log(`Coordinates: ${municipality.latitude}, ${municipality.longitude}`);
  }
}
```

**Parameters:**
- `id: string` - The municipality ID

**Returns:**
- `Promise<Municipality | null>` - Municipality object or null if not found

---

##### `createMunicipality(data: Omit<Municipality, 'id'>): Promise<string>`

Create a new municipality.

```typescript
const newMunicipalityId = await MunicipalitiesService.createMunicipality({
  name: 'Lima',
  departmentId: 'department-123',
  postalCode: '15001',
  latitude: -12.0464,
  longitude: -77.0428,
  isActive: true
});
```

**Parameters:**
- `data: Omit<Municipality, 'id'>` - Municipality data without ID

**Returns:**
- `Promise<string>` - The ID of the created municipality

**Validation:**
- Coordinates must be within valid ranges
- Department ID must exist
- Name is required and cannot exceed 100 characters

---

##### `updateMunicipality(id: string, updates: Partial<Omit<Municipality, 'id'>>): Promise<void>`

Update an existing municipality.

```typescript
await MunicipalitiesService.updateMunicipality('municipality-123', {
  name: 'Updated Name',
  latitude: -12.1000,
  longitude: -77.1000
});
```

**Parameters:**
- `id: string` - The municipality ID
- `updates: Partial<Omit<Municipality, 'id'>>` - Partial update data

**Returns:**
- `Promise<void>`

---

##### `deleteMunicipality(id: string): Promise<void>`

Soft delete a municipality (sets isActive to false).

```typescript
await MunicipalitiesService.deleteMunicipality('municipality-123');
```

**Parameters:**
- `id: string` - The municipality ID

**Returns:**
- `Promise<void>`

---

## Hooks

### useMunicipalities

Main hook for municipality management with department context.

#### Signature

```typescript
function useMunicipalities(departmentId?: string): {
  municipalities: Municipality[];
  loading: boolean;
  error: string | null;
  getMunicipalities: (departmentId?: string) => Promise<void>;
  refetch: (departmentId?: string) => Promise<void>;
  getMunicipalityById: (id: string) => Municipality | undefined;
  createMunicipality: (data: Omit<Municipality, 'id'>) => Promise<Municipality>;
  updateMunicipality: (id: string, updates: Partial<Omit<Municipality, 'id'>>) => Promise<void>;
  deleteMunicipality: (id: string) => Promise<void>;
}
```

#### Usage Examples

##### Basic Usage with Department Context

```typescript
import { useMunicipalities } from '@/modules/municipalities/hooks';

function MunicipalitiesList({ departmentId }: { departmentId: string }) {
  const { municipalities, loading, error } = useMunicipalities(departmentId);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <ul>
      {municipalities.map(municipality => (
        <li key={municipality.id}>
          {municipality.name}
          {municipality.postalCode && ` (${municipality.postalCode})`}
          {municipality.latitude && municipality.longitude && (
            <span className="coordinates">
              {municipality.latitude.toFixed(4)}, {municipality.longitude.toFixed(4)}
            </span>
          )}
        </li>
      ))}
    </ul>
  );
}
```

##### CRUD Operations with Coordinates

```typescript
function MunicipalityManager({ departmentId }: { departmentId: string }) {
  const {
    municipalities,
    createMunicipality,
    updateMunicipality,
    deleteMunicipality
  } = useMunicipalities(departmentId);

  const handleCreate = async () => {
    try {
      await createMunicipality({
        name: 'New Municipality',
        departmentId: departmentId,
        postalCode: '10001',
        latitude: -12.0000,
        longitude: -77.0000,
        isActive: true
      });
    } catch (error) {
      console.error('Failed to create municipality:', error);
    }
  };

  const handleUpdateCoordinates = async (id: string, lat: number, lng: number) => {
    try {
      await updateMunicipality(id, {
        latitude: lat,
        longitude: lng
      });
    } catch (error) {
      console.error('Failed to update coordinates:', error);
    }
  };

  return (
    <div>
      <button onClick={handleCreate}>Create Municipality</button>
      {municipalities.map(municipality => (
        <div key={municipality.id}>
          <h3>{municipality.name}</h3>
          {municipality.latitude && municipality.longitude ? (
            <p>Coordinates: {municipality.latitude}, {municipality.longitude}</p>
          ) : (
            <button onClick={() => handleUpdateCoordinates(municipality.id, -12.0464, -77.0428)}>
              Add Coordinates
            </button>
          )}
          <button onClick={() => deleteMunicipality(municipality.id)}>Delete</button>
        </div>
      ))}
    </div>
  );
}
```

---

## Components

### MunicipalitiesDirectory

Complete municipality management interface for a specific department.

```typescript
import { MunicipalitiesDirectory } from '@/modules/municipalities';

function DepartmentPage({ departmentId, departmentName }) {
  return (
    <MunicipalitiesDirectory 
      departmentId={departmentId}
      departmentName={departmentName}
    />
  );
}
```

**Props:**
```typescript
interface MunicipalitiesDirectoryProps {
  departmentId?: string;     // Department to filter by
  departmentName?: string;   // Department name for display
}
```

**Features:**
- Department-specific municipality management
- Search functionality
- Create/edit/delete operations
- Direct district navigation
- Geographic coordinate display
- Postal code management

---

### MunicipalitiesForm

Form for creating and editing municipalities with coordinate support.

```typescript
import { MunicipalitiesForm } from '@/modules/municipalities/components';

function CreateMunicipality({ departmentId, departmentName }) {
  const handleSubmit = async (data: MunicipalityFormData) => {
    console.log('Form data:', data);
    if (data.latitude && data.longitude) {
      console.log('Coordinates provided:', data.latitude, data.longitude);
    }
  };

  return (
    <MunicipalitiesForm
      departmentId={departmentId}
      departmentName={departmentName}
      onSubmit={handleSubmit}
      onCancel={() => console.log('Cancelled')}
      isLoading={false}
    />
  );
}
```

**Props:**
```typescript
interface MunicipalitiesFormProps {
  initialData?: Municipality;
  onSubmit: (data: MunicipalityFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  departmentId?: string;
  departmentName?: string;
}
```

---

### MunicipalitiesTable

Advanced table for displaying municipality data with geographic features.

```typescript
import { MunicipalitiesTable } from '@/modules/municipalities/components';

function MunicipalitiesList({ departmentId }) {
  const { municipalities, loading } = useMunicipalities(departmentId);

  const handleEdit = (municipality: Municipality) => {
    console.log('Edit municipality:', municipality);
  };

  const handleViewDistricts = (municipality: Municipality) => {
    console.log('View districts for:', municipality.name);
  };

  const getDepartmentName = (departmentId: string) => {
    return 'Department Name'; // Get from departments context
  };

  return (
    <MunicipalitiesTable
      municipalities={municipalities}
      loading={loading}
      onEdit={handleEdit}
      onDelete={(id) => console.log('Delete:', id)}
      onViewDistricts={handleViewDistricts}
      getDepartmentName={getDepartmentName}
    />
  );
}
```

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

---

## Types

### Municipality

Main municipality interface with geographic support.

```typescript
interface Municipality {
  id: string;              // Unique identifier
  name: string;            // Municipality name
  departmentId: string;    // Associated department ID
  postalCode?: string;     // Optional postal code
  latitude?: number;       // Geographic latitude (-90 to 90)
  longitude?: number;      // Geographic longitude (-180 to 180)
  isActive: boolean;       // Active status
}
```

### MunicipalityFormData

Form data interface for validation.

```typescript
interface MunicipalityFormData {
  name: string;            // Required municipality name
  departmentId: string;    // Required department ID
  postalCode?: string;     // Optional postal code
  latitude?: number;       // Optional latitude
  longitude?: number;      // Optional longitude
}
```

---

## Validations

### municipalityFormSchema

Zod schema for form validation with geographic constraints.

```typescript
import { z } from 'zod';

const municipalityFormSchema = z.object({
  name: z
    .string()
    .min(1, 'El nombre del municipio es requerido')
    .max(100, 'El nombre no puede exceder 100 caracteres'),
  departmentId: z
    .string()
    .min(1, 'Debe seleccionar un departamento'),
  postalCode: z
    .string()
    .max(10, 'El código postal no puede exceder 10 caracteres')
    .optional(),
  latitude: z
    .number()
    .min(-90, 'La latitud debe estar entre -90 y 90')
    .max(90, 'La latitud debe estar entre -90 y 90')
    .optional(),
  longitude: z
    .number()
    .min(-180, 'La longitud debe estar entre -180 y 180')
    .max(180, 'La longitud debe estar entre -180 y 180')
    .optional()
});
```

**Usage:**

```typescript
// Validate municipality data with coordinates
const result = municipalityFormSchema.safeParse({
  name: 'Lima',
  departmentId: 'department-123',
  postalCode: '15001',
  latitude: -12.0464,
  longitude: -77.0428
});

if (result.success) {
  console.log('Valid data:', result.data);
} else {
  console.log('Validation errors:', result.error.errors);
}
```

---

## Utils

### MunicipalityUtils

Comprehensive utility functions for municipality operations and geographic calculations.

```typescript
import { MunicipalityUtils } from '@/modules/municipalities/utils';
```

#### Geographic Functions

##### `calculateDistance(municipality1: Municipality, municipality2: Municipality): number | null`

Calculate distance between two municipalities using their coordinates.

```typescript
const distance = MunicipalityUtils.calculateDistance(
  { latitude: -12.0464, longitude: -77.0428 }, // Lima
  { latitude: -13.5319, longitude: -71.9675 }  // Cusco
);
console.log(`Distance: ${distance} km`); // ~573 km
```

##### `findNearestMunicipalities(target: Municipality, municipalities: Municipality[], limit: number): Array<{municipality: Municipality, distance: number}>`

Find nearest municipalities based on geographic coordinates.

```typescript
const nearest = MunicipalityUtils.findNearestMunicipalities(
  targetMunicipality,
  allMunicipalities,
  5
);

nearest.forEach(({ municipality, distance }) => {
  console.log(`${municipality.name}: ${distance.toFixed(2)} km away`);
});
```

#### Data Management Functions

##### `formatDisplayName(municipality: Municipality): string`

Format municipality display name with postal code.

```typescript
const displayName = MunicipalityUtils.formatDisplayName(municipality);
// Result: "Lima (15001)" or "Lima"
```

##### `filterByDepartment(municipalities: Municipality[], departmentId: string): Municipality[]`

Filter municipalities by department.

```typescript
const departmentMunicipalities = MunicipalityUtils.filterByDepartment(
  allMunicipalities,
  'department-lima'
);
```

##### `groupByDepartment(municipalities: Municipality[]): Record<string, Municipality[]>`

Group municipalities by department.

```typescript
const grouped = MunicipalityUtils.groupByDepartment(municipalities);
// Result: { 'dept-1': [mun1, mun2], 'dept-2': [mun3] }
```

##### `getStatistics(municipalities: Municipality[]): object`

Get comprehensive statistics about municipalities.

```typescript
const stats = MunicipalityUtils.getStatistics(municipalities);
// Result: {
//   total: 50,
//   active: 48,
//   inactive: 2,
//   withCoordinates: 35,
//   withPostalCode: 40,
//   withoutCoordinates: 15,
//   withoutPostalCode: 10
// }
```

#### Validation Functions

##### `validateMunicipality(municipality: Partial<Municipality>): string[]`

Validate municipality data and return error messages.

```typescript
const errors = MunicipalityUtils.validateMunicipality({
  name: '',
  departmentId: 'dept-123',
  latitude: 100 // Invalid
});
// Result: ['El nombre del municipio es requerido', 'La latitud debe estar entre -90 y 90']
```

##### `isNameUnique(municipalities: Municipality[], name: string, excludeId?: string): boolean`

Check if municipality name is unique.

```typescript
const isUnique = MunicipalityUtils.isNameUnique(municipalities, 'New Municipality');
```

---

## Geographic Features

### Coordinate System

The module uses the WGS84 coordinate system:
- **Latitude**: -90 to 90 degrees (South to North)
- **Longitude**: -180 to 180 degrees (West to East)

### Distance Calculation

Uses the Haversine formula for accurate distance calculation:

```typescript
// Example: Calculate distance between major Peruvian cities
const lima = { latitude: -12.0464, longitude: -77.0428 };
const cusco = { latitude: -13.5319, longitude: -71.9675 };
const arequipa = { latitude: -16.4090, longitude: -71.5375 };

const limaToCusco = MunicipalityUtils.calculateDistance(lima, cusco);
const limaToArequipa = MunicipalityUtils.calculateDistance(lima, arequipa);

console.log(`Lima to Cusco: ${limaToCusco?.toFixed(2)} km`);
console.log(`Lima to Arequipa: ${limaToArequipa?.toFixed(2)} km`);
```

### Nearest Neighbor Search

```typescript
// Find municipalities within a certain radius
function findMunicipalitiesWithinRadius(
  center: Municipality,
  municipalities: Municipality[],
  radiusKm: number
): Municipality[] {
  return municipalities.filter(municipality => {
    const distance = MunicipalityUtils.calculateDistance(center, municipality);
    return distance !== null && distance <= radiusKm;
  });
}

// Usage
const nearbyMunicipalities = findMunicipalitiesWithinRadius(
  limaCenter,
  allMunicipalities,
  50 // 50 km radius
);
```

---

## Mock Data

### MOCK_MUNICIPALITIES

Comprehensive mock data for development and testing.

```typescript
import { MOCK_MUNICIPALITIES } from '@/modules/municipalities/mock-municipalities';

// Mock data includes realistic Peruvian municipalities
const mockMunicipality = {
  id: 'municipality-lima',
  name: 'Lima',
  departmentId: 'department-lima',
  postalCode: '15001',
  latitude: -12.0464,
  longitude: -77.0428,
  isActive: true
};

// Filter by department
const limaDepartmentMunicipalities = MOCK_MUNICIPALITIES.filter(
  m => m.departmentId === 'department-lima'
);

// Find municipalities with coordinates
const municipalitiesWithCoords = MOCK_MUNICIPALITIES.filter(
  m => m.latitude && m.longitude
);
```

---

## Performance Considerations

### Geographic Calculations

1. **Distance Caching**: Cache frequently calculated distances

```typescript
const distanceCache = new Map<string, number>();

function getCachedDistance(id1: string, id2: string): number | null {
  const key = [id1, id2].sort().join('-');
  return distanceCache.get(key) || null;
}

function setCachedDistance(id1: string, id2: string, distance: number): void {
  const key = [id1, id2].sort().join('-');
  distanceCache.set(key, distance);
}
```

2. **Batch Operations**: Process multiple calculations efficiently

```typescript
// Calculate distances for multiple municipalities at once
function calculateDistancesMatrix(
  municipalities: Municipality[]
): number[][] {
  const matrix: number[][] = [];
  
  for (let i = 0; i < municipalities.length; i++) {
    matrix[i] = [];
    for (let j = 0; j < municipalities.length; j++) {
      if (i === j) {
        matrix[i][j] = 0;
      } else {
        matrix[i][j] = MunicipalityUtils.calculateDistance(
          municipalities[i],
          municipalities[j]
        ) || 0;
      }
    }
  }
  
  return matrix;
}
```

### Query Optimization

```typescript
// Efficient queries with proper indexing
const municipalitiesQuery = query(
  collection(db, 'municipalities'),
  where('departmentId', '==', departmentId),
  where('isActive', '==', true),
  orderBy('name')
);
```

---

## Examples

### Complete Geographic Application

```typescript
import React, { useState } from 'react';
import {
  MunicipalitiesDirectory,
  MunicipalitiesTable,
  MunicipalitiesForm,
  useMunicipalities,
  MunicipalityUtils
} from '@/modules/municipalities';

function GeographicManagementApp() {
  const [departmentId, setDepartmentId] = useState('department-lima');
  const [selectedMunicipality, setSelectedMunicipality] = useState<Municipality | null>(null);
  const { municipalities, loading } = useMunicipalities(departmentId);

  // Calculate statistics
  const stats = MunicipalityUtils.getStatistics(municipalities);
  
  // Find nearest municipalities to selected one
  const nearestMunicipalities = selectedMunicipality ? 
    MunicipalityUtils.findNearestMunicipalities(
      selectedMunicipality,
      municipalities,
      3
    ) : [];

  return (
    <div className="app">
      <h1>Geographic Management System</h1>
      
      {/* Statistics Panel */}
      <div className="stats">
        <h2>Statistics</h2>
        <p>Total: {stats.total}</p>
        <p>With Coordinates: {stats.withCoordinates}</p>
        <p>With Postal Codes: {stats.withPostalCode}</p>
      </div>

      {/* Main Directory */}
      <MunicipalitiesDirectory 
        departmentId={departmentId}
        departmentName="Lima"
      />

      {/* Selected Municipality Details */}
      {selectedMunicipality && (
        <div className="municipality-details">
          <h3>{selectedMunicipality.name}</h3>
          {selectedMunicipality.latitude && selectedMunicipality.longitude && (
            <div>
              <p>Coordinates: {selectedMunicipality.latitude}, {selectedMunicipality.longitude}</p>
              
              <h4>Nearest Municipalities:</h4>
              <ul>
                {nearestMunicipalities.map(({ municipality, distance }) => (
                  <li key={municipality.id}>
                    {municipality.name} - {distance.toFixed(2)} km
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
```

---

**Last Updated:** Phase 7 - Municipalities Module Standardization
**Version:** 1.0.0
**API Version:** v1