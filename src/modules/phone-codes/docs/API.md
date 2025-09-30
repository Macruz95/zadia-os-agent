# Phone-codes API Documentation

## Índice

- [Servicios](#servicios)
- [Hooks](#hooks)
- [Utilidades](#utilidades)
- [Componentes](#componentes)
- [Tipos](#tipos)
- [Validaciones](#validaciones)

## Servicios

### PhoneCodesService

Servicio principal para operaciones CRUD con Firebase Firestore.

#### Métodos

##### `getPhoneCodes(): Promise<PhoneCode[]>`

Obtiene todos los códigos telefónicos activos.

```typescript
const phoneCodes = await PhoneCodesService.getPhoneCodes();
```

**Retorna:** Array de códigos telefónicos ordenados por prioridad y código.

##### `getPhoneCodesByCountry(countryId: string): Promise<PhoneCode[]>`

Obtiene códigos telefónicos de un país específico.

```typescript
const peruCodes = await PhoneCodesService.getPhoneCodesByCountry('PE');
```

**Parámetros:**
- `countryId`: ID del país

**Retorna:** Array de códigos telefónicos del país.

##### `getPhoneCodeById(id: string): Promise<PhoneCode | null>`

Obtiene un código telefónico por su ID.

```typescript
const phoneCode = await PhoneCodesService.getPhoneCodeById('pe-51');
```

**Parámetros:**
- `id`: ID del código telefónico

**Retorna:** Código telefónico o null si no existe.

##### `createPhoneCode(phoneCodeData: Omit<PhoneCode, 'id'>): Promise<string>`

Crea un nuevo código telefónico.

```typescript
const newId = await PhoneCodesService.createPhoneCode({
  countryId: 'PE',
  code: '+51',
  dialCode: '51',
  format: '+51 ### ### ###',
  example: '+51 999 123 456',
  priority: 1,
  isActive: true
});
```

**Parámetros:**
- `phoneCodeData`: Datos del código telefónico (sin ID)

**Retorna:** ID del código telefónico creado.

##### `updatePhoneCode(id: string, updates: Partial<Omit<PhoneCode, 'id'>>): Promise<void>`

Actualiza un código telefónico existente.

```typescript
await PhoneCodesService.updatePhoneCode('pe-51', {
  format: '+51 ## ### ###',
  example: '+51 99 123 456'
});
```

**Parámetros:**
- `id`: ID del código telefónico
- `updates`: Campos a actualizar

##### `deletePhoneCode(id: string): Promise<void>`

Elimina (soft delete) un código telefónico.

```typescript
await PhoneCodesService.deletePhoneCode('pe-51');
```

**Parámetros:**
- `id`: ID del código telefónico

##### `findByDialCode(dialCode: string): Promise<PhoneCode | null>`

Busca un código telefónico por su código de marcado.

```typescript
const phoneCode = await PhoneCodesService.findByDialCode('51');
```

**Parámetros:**
- `dialCode`: Código de marcado (sin +)

**Retorna:** Código telefónico o null si no existe.

## Hooks

### usePhoneCodes

Hook principal para gestión de códigos telefónicos.

#### Sintaxis

```typescript
const {
  phoneCodes,
  loading,
  error,
  getPhoneCodes,
  refetch,
  getPhoneCodeById,
  findByDialCode,
  createPhoneCode,
  updatePhoneCode,
  deletePhoneCode
} = usePhoneCodes(countryId?);
```

#### Parámetros

- `countryId` (opcional): ID del país para filtrar códigos

#### Retorna

| Propiedad | Tipo | Descripción |
|-----------|------|-------------|
| `phoneCodes` | `PhoneCode[]` | Array de códigos telefónicos |
| `loading` | `boolean` | Estado de carga |
| `error` | `string \| null` | Mensaje de error |
| `getPhoneCodes` | `Function` | Obtener códigos (con filtro opcional) |
| `refetch` | `Function` | Recargar datos |
| `getPhoneCodeById` | `Function` | Obtener por ID |
| `findByDialCode` | `Function` | Buscar por código de marcado |
| `createPhoneCode` | `Function` | Crear nuevo código |
| `updatePhoneCode` | `Function` | Actualizar código |
| `deletePhoneCode` | `Function` | Eliminar código |

#### Ejemplo

```typescript
function PhoneCodesList() {
  const { phoneCodes, loading, error, createPhoneCode } = usePhoneCodes('PE');

  const handleCreate = async () => {
    await createPhoneCode({
      countryId: 'PE',
      code: '+51',
      dialCode: '51',
      priority: 1,
      isActive: true
    });
  };

  if (loading) return <div>Cargando...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {phoneCodes.map(code => (
        <div key={code.id}>{code.code}</div>
      ))}
    </div>
  );
}
```

## Utilidades

### PhoneCodeUtils

Clase con utilidades para manipulación de números telefónicos.

#### Métodos Estáticos

##### `formatPhoneNumber(phoneNumber: string, phoneCode: PhoneCode): string`

Formatea un número telefónico según el formato del país.

```typescript
const formatted = PhoneCodeUtils.formatPhoneNumber('999123456', {
  code: '+51',
  dialCode: '51',
  format: '+51 ### ### ###'
});
// Resultado: "+51 999 123 456"
```

##### `isValidPhoneNumber(phoneNumber: string, phoneCode?: PhoneCode): boolean`

Valida si un número telefónico es válido.

```typescript
const isValid = PhoneCodeUtils.isValidPhoneNumber('+51999123456');
```

##### `extractCountryCode(phoneNumber: string, phoneCodes: PhoneCode[]): PhoneCode | null`

Extrae el código de país de un número telefónico.

```typescript
const phoneCode = PhoneCodeUtils.extractCountryCode('+51999123456', phoneCodes);
```

##### `parsePhoneNumber(phoneNumber: string, phoneCodes: PhoneCode[]): PhoneNumber | null`

Parsea un número telefónico completo en sus componentes.

```typescript
const parsed = PhoneCodeUtils.parsePhoneNumber('+51999123456', phoneCodes);
// {
//   countryId: 'PE',
//   phoneCode: '+51',
//   number: '999123456',
//   fullNumber: '+51999123456',
//   isValid: true
// }
```

##### `searchPhoneCodes(phoneCodes: PhoneCode[], query: string): PhoneCode[]`

Filtra códigos telefónicos por consulta de búsqueda.

```typescript
const filtered = PhoneCodeUtils.searchPhoneCodes(phoneCodes, '+51');
```

##### `sortPhoneCodes(phoneCodes: PhoneCode[]): PhoneCode[]`

Ordena códigos telefónicos por prioridad y código.

```typescript
const sorted = PhoneCodeUtils.sortPhoneCodes(phoneCodes);
```

##### `getStatistics(phoneCodes: PhoneCode[]): Statistics`

Calcula estadísticas de los códigos telefónicos.

```typescript
const stats = PhoneCodeUtils.getStatistics(phoneCodes);
// {
//   total: 23,
//   active: 22,
//   inactive: 1,
//   withFormat: 20,
//   withExample: 18,
//   uniqueCountries: 15
// }
```

## Componentes

### PhoneCodesDirectory

Componente principal para gestión de códigos telefónicos.

#### Props

```typescript
interface PhoneCodesDirectoryProps {
  countryId?: string;                    // Filtrar por país
  onSelectPhoneCode?: (phoneCode: PhoneCode) => void; // Callback de selección
  isSelectionMode?: boolean;             // Modo selección
}
```

#### Ejemplo

```typescript
<PhoneCodesDirectory
  countryId="PE"
  onSelectPhoneCode={(code) => console.log(code)}
  isSelectionMode={true}
/>
```

### PhoneCodesForm

Formulario para crear/editar códigos telefónicos.

#### Props

```typescript
interface PhoneCodesFormProps {
  phoneCode?: PhoneCode | null;          // Código a editar
  onSuccess: () => void;                 // Callback de éxito
  onCancel: () => void;                  // Callback de cancelación
}
```

#### Ejemplo

```typescript
<PhoneCodesForm
  phoneCode={selectedCode}
  onSuccess={() => setShowForm(false)}
  onCancel={() => setShowForm(false)}
/>
```

### PhoneCodesTable

Tabla para mostrar códigos telefónicos.

#### Props

```typescript
interface PhoneCodesTableProps {
  phoneCodes: PhoneCode[];               // Códigos a mostrar
  countries: Country[];                  // Lista de países
  onEdit?: (phoneCode: PhoneCode) => void; // Callback de edición
  onSelect?: (phoneCode: PhoneCode) => void; // Callback de selección
  onRefresh?: () => void;                // Callback de recarga
  isSelectionMode?: boolean;             // Modo selección
}
```

### PhoneCodeInput

Input especializado para números telefónicos.

#### Props

```typescript
interface PhoneCodeInputProps {
  value: string;                         // Valor actual
  onChange: (value: string) => void;     // Callback de cambio
  onCountryChange?: (countryId: string) => void; // Callback de país
  placeholder?: string;                  // Placeholder
  disabled?: boolean;                    // Estado deshabilitado
  required?: boolean;                    // Campo requerido
}
```

## Tipos

### PhoneCode

```typescript
interface PhoneCode {
  id: string;                // ID único
  countryId: string;         // ID del país
  code: string;              // Código con + (ej: "+51")
  dialCode: string;          // Código numérico (ej: "51")
  format?: string;           // Patrón de formato
  example?: string;          // Ejemplo de número
  priority: number;          // Prioridad (1-10)
  isActive: boolean;         // Estado activo
}
```

### PhoneNumber

```typescript
interface PhoneNumber {
  countryId: string;         // ID del país
  phoneCode: string;         // Código telefónico
  number: string;            // Número sin código
  fullNumber?: string;       // Número completo
  isValid: boolean;          // Validez del número
}
```

## Validaciones

### phoneCodeFormSchema

Esquema Zod para validación de formularios.

```typescript
const phoneCodeFormSchema = z.object({
  countryId: z.string().min(1, 'Debe seleccionar un país'),
  code: z.string()
    .min(1, 'El código telefónico es requerido')
    .regex(/^\+\d+$/, 'El código debe comenzar con + seguido de números'),
  dialCode: z.string()
    .min(1, 'El código de marcado es requerido')
    .regex(/^\d+$/, 'El código de marcado debe contener solo números'),
  format: z.string().max(50).optional(),
  example: z.string().max(30).optional(),
  priority: z.number().min(1).max(10).default(1)
});
```

### phoneNumberFormSchema

Esquema para validación de números telefónicos.

```typescript
const phoneNumberFormSchema = z.object({
  countryId: z.string().min(1, 'Debe seleccionar un país'),
  phoneCode: z.string().min(1, 'El código telefónico es requerido'),
  number: z.string()
    .min(1, 'El número telefónico es requerido')
    .regex(/^[0-9\s\-\(\)\+]+$/, 'El número contiene caracteres inválidos')
});
```

## Eventos y Callbacks

### Eventos del Hook

```typescript
const { createPhoneCode } = usePhoneCodes();

// Crear con manejo de eventos
try {
  const newCode = await createPhoneCode(phoneCodeData);
  console.log('Código creado:', newCode);
} catch (error) {
  console.error('Error al crear:', error);
}
```

### Eventos de Componentes

```typescript
// Selección en tabla
<PhoneCodesTable
  phoneCodes={codes}
  onSelect={(code) => {
    console.log('Código seleccionado:', code);
    setSelectedCode(code);
  }}
/>

// Cambio en input
<PhoneCodeInput
  value={phone}
  onChange={(value) => {
    setPhone(value);
    console.log('Número cambió:', value);
  }}
  onCountryChange={(countryId) => {
    console.log('País cambió:', countryId);
  }}
/>
```

## Manejo de Errores

```typescript
const { error, loading } = usePhoneCodes();

if (error) {
  return (
    <div className="error-container">
      <h3>Error al cargar códigos telefónicos</h3>
      <p>{error}</p>
      <button onClick={() => window.location.reload()}>
        Reintentar
      </button>
    </div>
  );
}
```

## Performance

### Optimizaciones

1. **Memoización**: Los componentes usan React.memo cuando apropiado
2. **Cache**: El hook mantiene cache local de datos
3. **Lazy Loading**: Carga datos solo cuando es necesario
4. **Debounce**: Búsquedas con debounce para mejor UX

### Mejores Prácticas

```typescript
// Uso eficiente del hook
const { phoneCodes, getPhoneCodeById } = usePhoneCodes();

// Cache local para evitar re-renderizados
const memoizedCodes = useMemo(() => 
  PhoneCodeUtils.sortPhoneCodes(phoneCodes), 
  [phoneCodes]
);

// Callbacks memoizados
const handleSelect = useCallback((code: PhoneCode) => {
  onSelect?.(code);
}, [onSelect]);
```

---

*Para ejemplos más detallados, consulte [README.md](./README.md)*