# 🌍 ZADIA OS - Countries Module API Reference

## Hooks API

### useCountries()

Maneja el estado y operaciones de países.

**Returns:** `UseCountriesReturn`

```typescript
interface UseCountriesReturn {
  countries: Country[];
  loading: boolean;
  error: string | null;
  getCountries: () => Promise<void>;
  refetch: () => Promise<void>;
  getCountryById: (id: string) => Country | undefined;
  getCountryByIsoCode: (isoCode: string) => Country | undefined;
  createCountry: (data: Omit<Country, 'id'>) => Promise<Country>;
  updateCountry: (id: string, updates: Partial<Omit<Country, 'id'>>) => Promise<void>;
  deleteCountry: (id: string) => Promise<void>;
}
```

**Example:**
```typescript
const {
  countries,
  loading,
  error,
  getCountries,
  createCountry,
  getCountryById
} = useCountries();

// Load countries
useMemo(() => {
  getCountries();
}, []);

// Find specific country
const guatemala = getCountryById('guatemala-id');

// Create new country
const handleCreate = async () => {
  try {
    const newCountry = await createCountry({
      name: 'Guatemala',
      isoCode: 'GT',
      phoneCode: '+502',
      flagEmoji: '🇬🇹',
      isActive: true
    });
    console.log('Created:', newCountry);
  } catch (error) {
    console.error('Error:', error);
  }
};
```

---

## Service Methods API

### CountriesService

#### `getCountries(): Promise<Country[]>`

Obtiene todos los países activos del sistema.

**Returns:** Promise con array de países

**Fallback:** Si no hay datos en Firestore, retorna datos mock

**Example:**
```typescript
const countries = await CountriesService.getCountries();
console.log(`Found ${countries.length} countries`);
```

#### `getCountryById(id: string): Promise<Country | null>`

Obtiene un país específico por su ID.

**Parameters:**
- `id`: ID del país

**Returns:** Promise con el país o null si no existe

**Example:**
```typescript
const country = await CountriesService.getCountryById('guatemala-id');
if (country) {
  console.log(`Found: ${country.name}`);
}
```

#### `getCountryByIsoCode(isoCode: string): Promise<Country | null>`

Obtiene un país por su código ISO de 2 caracteres.

**Parameters:**
- `isoCode`: Código ISO del país (ej: "GT", "MX")

**Returns:** Promise con el país o null si no existe

**Example:**
```typescript
const guatemala = await CountriesService.getCountryByIsoCode('GT');
if (guatemala) {
  console.log(`Phone code: ${guatemala.phoneCode}`);
}
```

#### `createCountry(data: Omit<Country, 'id'>): Promise<string>`

Crea un nuevo país en el sistema.

**Parameters:**
- `data`: Datos del país (sin ID)

**Returns:** Promise con el ID del país creado

**Validation:** Los datos se validan automáticamente con Zod

**Example:**
```typescript
const countryId = await CountriesService.createCountry({
  name: 'El Salvador',
  isoCode: 'SV',
  phoneCode: '+503',
  flagEmoji: '🇸🇻',
  isActive: true
});
console.log(`Country created with ID: ${countryId}`);
```

#### `updateCountry(id: string, updates: Partial<Omit<Country, 'id'>>): Promise<void>`

Actualiza un país existente.

**Parameters:**
- `id`: ID del país a actualizar
- `updates`: Campos a actualizar (parcial)

**Example:**
```typescript
await CountriesService.updateCountry('country-id', {
  name: 'Guatemala Actualizado',
  isActive: false
});
console.log('Country updated successfully');
```

#### `deleteCountry(id: string): Promise<void>`

Elimina un país (soft delete - marca como inactivo).

**Parameters:**
- `id`: ID del país a eliminar

**Note:** Es una eliminación suave, solo cambia `isActive` a `false`

**Example:**
```typescript
await CountriesService.deleteCountry('country-id');
console.log('Country deleted successfully');
```

---

## Component Props API

### CountriesSelect

Componente select para selección de países.

```typescript
interface CountriesSelectProps {
  value?: string; // ID del país seleccionado
  onValueChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}
```

**Example:**
```typescript
<CountriesSelect
  value={selectedCountry}
  onValueChange={setSelectedCountry}
  placeholder="Seleccionar país"
  disabled={loading}
/>
```

### CountriesDirectory

Vista administrativa completa para gestionar países.

```typescript
interface CountriesDirectoryProps {
  // No props required - self-contained component
}
```

**Example:**
```typescript
<CountriesDirectory />
```

### CountriesForm

Formulario para crear/editar países.

```typescript
interface CountriesFormProps {
  initialData?: Partial<Country>;
  onSubmit: (data: Omit<Country, 'id'>) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}
```

**Example:**
```typescript
<CountriesForm
  initialData={editingCountry}
  onSubmit={handleSubmit}
  onCancel={() => setIsEditing(false)}
  isLoading={loading}
/>
```

### CountriesTable

Tabla para mostrar países con acciones.

```typescript
interface CountriesTableProps {
  countries: Country[];
  loading?: boolean;
  onEdit: (country: Country) => void;
  onDelete: (countryId: string) => void;
}
```

**Example:**
```typescript
<CountriesTable
  countries={filteredCountries}
  loading={loading}
  onEdit={handleEdit}
  onDelete={handleDelete}
/>
```

---

## Utility Functions API

### countriesUtils

#### `formatCountryDisplay(country: Country): string`

Formatea la visualización completa de un país.

**Example:**
```typescript
const display = countriesUtils.formatCountryDisplay(country);
// Output: "🇬🇹 Guatemala (GT)"
```

#### `formatPhoneCode(phoneCode: string): string`

Formatea el código telefónico.

**Example:**
```typescript
const formatted = countriesUtils.formatPhoneCode('+502');
// Output: "+502"
```

#### `validateIsoCode(isoCode: string): boolean`

Valida si un código ISO es válido.

**Example:**
```typescript
const isValid = countriesUtils.validateIsoCode('GT'); // true
const isInvalid = countriesUtils.validateIsoCode('GTM'); // false
```

#### `searchCountries(countries: Country[], searchTerm: string): Country[]`

Filtra países por término de búsqueda.

**Parameters:**
- `countries`: Array de países
- `searchTerm`: Término de búsqueda

**Search Fields:** name, isoCode, phoneCode

**Example:**
```typescript
const filtered = countriesUtils.searchCountries(countries, 'guatemala');
const byCode = countriesUtils.searchCountries(countries, 'GT');
const byPhone = countriesUtils.searchCountries(countries, '+502');
```

#### `sortCountries(countries: Country[]): Country[]`

Ordena países alfabéticamente por nombre.

**Example:**
```typescript
const sorted = countriesUtils.sortCountries(countries);
```

#### `getActiveCountries(countries: Country[]): Country[]`

Filtra solo países activos.

**Example:**
```typescript
const activeCountries = countriesUtils.getActiveCountries(countries);
```

---

## Type Definitions

### Core Types

```typescript
interface Country {
  id: string;
  name: string;
  isoCode: string; // 2-character ISO code
  phoneCode: string; // International phone code with +
  flagEmoji?: string; // Unicode flag emoji
  isActive: boolean;
}

type CountryFormData = Omit<Country, 'id'>;

type CountryUpdate = Partial<Omit<Country, 'id'>>;
```

### Validation Schema

```typescript
const countrySchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'El nombre del país es requerido'),
  isoCode: z.string()
    .length(2, 'El código ISO debe tener 2 caracteres')
    .toUpperCase(),
  phoneCode: z.string()
    .regex(/^\+\d+$/, 'El código de teléfono debe empezar con + y contener solo números'),
  flagEmoji: z.string().optional(),
  isActive: z.boolean().default(true)
});
```

### Hook Return Types

```typescript
interface UseCountriesReturn {
  countries: Country[];
  loading: boolean;
  error: string | null;
  getCountries: () => Promise<void>;
  refetch: () => Promise<void>;
  getCountryById: (id: string) => Country | undefined;
  getCountryByIsoCode: (isoCode: string) => Country | undefined;
  createCountry: (data: CountryFormData) => Promise<Country>;
  updateCountry: (id: string, updates: CountryUpdate) => Promise<void>;
  deleteCountry: (id: string) => Promise<void>;
}
```

---

## Error Handling

Todos los métodos pueden lanzar las siguientes excepciones:

### Service Errors

- **ValidationError**: Error de validación de datos con Zod
- **FirebaseError**: Error de conexión o permisos de Firebase
- **NotFoundError**: País no encontrado
- **NetworkError**: Error de conexión a internet

**Example:**
```typescript
try {
  await CountriesService.createCountry(data);
} catch (error) {
  if (error.message.includes('validation')) {
    console.error('Validation failed:', error);
  } else if (error.message.includes('Firebase')) {
    console.error('Database error:', error);
  } else {
    console.error('Unexpected error:', error);
  }
}
```

### Hook Errors

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

---

## Usage Patterns

### 1. Basic Country Selection

```typescript
function AddressForm() {
  const [selectedCountry, setSelectedCountry] = useState('');
  const { getCountryById } = useCountries();
  
  const country = getCountryById(selectedCountry);
  
  return (
    <div>
      <CountriesSelect
        value={selectedCountry}
        onValueChange={setSelectedCountry}
      />
      {country && (
        <div>Selected: {country.name} ({country.phoneCode})</div>
      )}
    </div>
  );
}
```

### 2. Phone Number Input with Country

```typescript
function PhoneInput() {
  const [country, setCountry] = useState('guatemala');
  const [phone, setPhone] = useState('');
  const { getCountryById } = useCountries();
  
  const selectedCountry = getCountryById(country);
  
  return (
    <div className="flex">
      <CountriesSelect
        value={country}
        onValueChange={setCountry}
        className="w-32"
      />
      <div className="flex items-center px-3 border">
        {selectedCountry?.phoneCode}
      </div>
      <Input
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        placeholder="Número"
      />
    </div>
  );
}
```

### 3. Country Management (Admin)

```typescript
function CountryManagement() {
  const {
    countries,
    loading,
    createCountry,
    updateCountry,
    deleteCountry
  } = useCountries();
  
  const handleCreate = async (data) => {
    try {
      await createCountry(data);
      toast.success('País creado exitosamente');
    } catch (error) {
      toast.error('Error al crear país');
    }
  };
  
  return (
    <CountriesDirectory />
  );
}
```

### 4. Search and Filter

```typescript
function CountrySearch() {
  const { countries } = useCountries();
  const [search, setSearch] = useState('');
  
  const filteredCountries = countriesUtils.searchCountries(countries, search);
  
  return (
    <div>
      <Input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Buscar países..."
      />
      {filteredCountries.map(country => (
        <div key={country.id}>
          {countriesUtils.formatCountryDisplay(country)}
        </div>
      ))}
    </div>
  );
}
```