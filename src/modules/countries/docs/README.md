# 🌍 ZADIA OS - Countries Module

## Overview

El módulo Countries gestiona la información de países en el sistema, incluyendo códigos ISO, códigos telefónicos y banderas. Es fundamental para el sistema de direcciones y contactos.

## Features

### 🇬🇹 Country Management
- ✅ Gestión completa de países
- ✅ Códigos ISO de 2 caracteres
- ✅ Códigos telefónicos internacionales
- ✅ Emojis de banderas
- ✅ Estado activo/inactivo
- ✅ Validación de datos con Zod

### 📁 Data Sources
- ✅ Firebase Firestore como fuente principal
- ✅ Datos mock como fallback
- ✅ Validación automática de estructura
- ✅ Cache en memoria para rendimiento

### 🔍 Search & Filter
- ✅ Búsqueda por nombre
- ✅ Búsqueda por código ISO
- ✅ Búsqueda por código telefónico
- ✅ Filtros por estado activo

## Quick Start

### Basic Hook Usage
```typescript
import { useCountries } from '@/modules/countries/hooks';

function CountriesComponent() {
  const {
    countries,
    loading,
    error,
    getCountries,
    createCountry
  } = useCountries();

  useEffect(() => {
    getCountries();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {countries.map(country => (
        <div key={country.id}>
          {country.flagEmoji} {country.name} ({country.isoCode})
        </div>
      ))}
    </div>
  );
}
```

### Countries Select Component
```typescript
import { CountriesSelect } from '@/modules/countries/components';

function AddressForm() {
  const [selectedCountry, setSelectedCountry] = useState('');

  return (
    <CountriesSelect
      value={selectedCountry}
      onValueChange={setSelectedCountry}
      placeholder="Seleccionar país"
    />
  );
}
```

### Countries Directory (Admin)
```typescript
import { CountriesDirectory } from '@/modules/countries/components';

function AdminCountries() {
  return (
    <div className="p-6">
      <CountriesDirectory />
    </div>
  );
}
```

## Components

### CountriesSelect
Componente select para selección de países con búsqueda.

**Props:**
- `value?`: País seleccionado (ID)
- `onValueChange`: Callback al cambiar selección
- `placeholder?`: Texto del placeholder
- `disabled?`: Estado deshabilitado

### CountriesDirectory
Vista administrativa completa para gestionar países.

**Features:**
- Tabla de países con paginación
- Búsqueda en tiempo real
- Formularios de creación/edición
- Acciones de CRUD

### CountriesForm
Formulario para crear/editar países.

**Props:**
- `initialData?`: Datos iniciales para edición
- `onSubmit`: Callback al enviar formulario
- `onCancel`: Callback al cancelar
- `isLoading?`: Estado de carga

### CountriesTable
Tabla para mostrar países con acciones.

**Props:**
- `countries`: Array de países
- `loading?`: Estado de carga
- `onEdit`: Callback para editar
- `onDelete`: Callback para eliminar

## Service Methods

### CountriesService

#### `getCountries(): Promise<Country[]>`
Obtiene todos los países activos.

```typescript
const countries = await CountriesService.getCountries();
```

#### `getCountryById(id: string): Promise<Country | null>`
Obtiene un país por ID.

```typescript
const country = await CountriesService.getCountryById('guatemala-id');
```

#### `getCountryByIsoCode(isoCode: string): Promise<Country | null>`
Obtiene un país por código ISO.

```typescript
const guatemala = await CountriesService.getCountryByIsoCode('GT');
```

#### `createCountry(data: Omit<Country, 'id'>): Promise<string>`
Crea un nuevo país.

```typescript
const countryId = await CountriesService.createCountry({
  name: 'Guatemala',
  isoCode: 'GT',
  phoneCode: '+502',
  flagEmoji: '🇬🇹',
  isActive: true
});
```

#### `updateCountry(id: string, updates: Partial<Country>): Promise<void>`
Actualiza un país existente.

```typescript
await CountriesService.updateCountry('country-id', {
  name: 'Guatemala Updated',
  isActive: false
});
```

#### `deleteCountry(id: string): Promise<void>`
Elimina un país (soft delete).

```typescript
await CountriesService.deleteCountry('country-id');
```

## Types

### Country Interface
```typescript
interface Country {
  id: string;
  name: string;
  isoCode: string; // 2-character ISO code (e.g., "GT")
  phoneCode: string; // International phone code (e.g., "+502")
  flagEmoji?: string; // Flag emoji (e.g., "🇬🇹")
  isActive: boolean;
}
```

### Validation Schema
```typescript
const countrySchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'El nombre del país es requerido'),
  isoCode: z.string().length(2, 'El código ISO debe tener 2 caracteres').toUpperCase(),
  phoneCode: z.string().regex(/^\+\d+$/, 'El código de teléfono debe empezar con + y contener solo números'),
  flagEmoji: z.string().optional(),
  isActive: z.boolean().default(true)
});
```

## Utilities

### Country Utils
```typescript
import { countriesUtils } from '@/modules/countries/utils';

// Format country display
const display = countriesUtils.formatCountryDisplay(country);
// Output: "🇬🇹 Guatemala (GT)"

// Get phone code display
const phoneDisplay = countriesUtils.formatPhoneCode('+502');
// Output: "+502"

// Validate ISO code
const isValid = countriesUtils.validateIsoCode('GT');
// Output: true

// Search countries
const filtered = countriesUtils.searchCountries(countries, 'guatemala');
```

## Data Structure

### Mock Data
El módulo incluye datos mock para desarrollo y fallback:

```typescript
export const MOCK_COUNTRIES: Country[] = [
  {
    id: 'guatemala',
    name: 'Guatemala',
    isoCode: 'GT',
    phoneCode: '+502',
    flagEmoji: '🇬🇹',
    isActive: true
  },
  {
    id: 'mexico',
    name: 'México',
    isoCode: 'MX',
    phoneCode: '+52',
    flagEmoji: '🇲🇽',
    isActive: true
  },
  // ... more countries
];
```

### Firebase Collection
```
countries/
├── {countryId}/
    ├── name: string
    ├── isoCode: string
    ├── phoneCode: string
    ├── flagEmoji?: string
    ├── isActive: boolean
    ├── createdAt: Timestamp
    └── updatedAt: Timestamp
```

## Error Handling

Todos los métodos incluyen manejo de errores estandarizado:

```typescript
const { error, refetch } = useCountries();

if (error) {
  return (
    <Alert variant="destructive">
      <AlertDescription>{error}</AlertDescription>
      <Button onClick={refetch}>Reintentar</Button>
    </Alert>
  );
}
```

## Best Practices

### 1. **Data Validation**
- Siempre validar códigos ISO (2 caracteres, mayúsculas)
- Validar formato de códigos telefónicos (+XXX)
- Usar schema de Zod para validación

### 2. **Performance**
- Cachear lista de países en memoria
- Usar fallback con datos mock
- Implementar búsqueda optimizada

### 3. **User Experience**
- Mostrar banderas cuando estén disponibles
- Ordenar países alfabéticamente
- Implementar búsqueda en tiempo real

### 4. **Integration**
- Usar como base para sistema de direcciones
- Integrar con formularios de contacto
- Conectar con módulos de clientes y proveedores

## Integration Examples

### Address Form Integration
```typescript
function AddressForm() {
  const { countries } = useCountries();
  const [formData, setFormData] = useState({
    country: '',
    state: '',
    city: '',
    address: ''
  });

  return (
    <form>
      <CountriesSelect
        value={formData.country}
        onValueChange={(country) => setFormData(prev => ({ ...prev, country }))}
      />
      {/* Other address fields */}
    </form>
  );
}
```

### Phone Number Formatter
```typescript
function PhoneInput({ countryId, phone, onChange }) {
  const { getCountryById } = useCountries();
  const country = getCountryById(countryId);
  
  return (
    <div className="flex">
      <div className="px-3 py-2 border rounded-l">
        {country?.flagEmoji} {country?.phoneCode}
      </div>
      <Input
        value={phone}
        onChange={onChange}
        placeholder="Número de teléfono"
        className="rounded-l-none"
      />
    </div>
  );
}
```

## Module Structure

```
src/modules/countries/
├── components/           # React components
│   ├── CountriesSelect.tsx
│   ├── CountriesDirectory.tsx
│   ├── CountriesForm.tsx
│   ├── CountriesTable.tsx
│   └── index.ts
├── hooks/               # Custom hooks
│   ├── use-countries.ts
│   └── index.ts
├── services/            # API services
│   ├── countries.service.ts
│   └── index.ts
├── types/               # TypeScript types
│   ├── countries.types.ts
│   └── index.ts
├── validations/         # Zod schemas
│   ├── countries.schema.ts
│   └── index.ts
├── utils/               # Utility functions
│   ├── countries.utils.ts
│   └── index.ts
├── data/                # Mock data
│   └── mock-countries.ts
├── docs/                # Documentation
│   └── README.md
└── index.ts            # Main exports
```